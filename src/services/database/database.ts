import pgPromise from 'pg-promise';
import { dbConfig } from '../../config';
import { User } from '../../models/models';

const pgp = pgPromise();
export const db = pgp(dbConfig);

export const addUser = async (user: User): Promise<number> => {
  const newUser = await db.one(
    `INSERT INTO github_users(
      username,
      name,
      bio,
      location,
      company,
      followers,
      following
    )
    VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      user.username,
      user.name,
      user.bio,
      user.location,
      user.company,
      user.followers,
      user.following
    ]
  );

  for (const language of user.languages) {
    await db.none(
      `INSERT INTO user_languages(user_id, language)
       VALUES($1, $2)`,
      [newUser.id, language]
    );
  }
  
  return newUser.id;
};

export const updateUser = async (user: User) => {
  await db.one(
    `UPDATE github_users
         SET name=$2,
             bio=$3,
             location=$4,
             company=$5,
             followers=$6,
             following=$7
         WHERE username=$1 RETURNING id`,
    [
      user.username,
      user.name,
      user.bio,
      user.location,
      user.company,
      user.followers,
      user.following
    ]
  );
  
  await db.none(`DELETE FROM user_languages WHERE user_id=$1`, [user.id]);
  
  for (const language of user.languages) {
    await db.none(
      `INSERT INTO user_languages(user_id, language)
             VALUES($1, $2)`,
      [user.id, language]
    );
  }
};

export const deleteUser = async (username: string) => {
  const user = await db.oneOrNone(
    `SELECT id FROM github_users WHERE username=$1`,
    [username]
  );
  
  if (user) {
    await db.none(`DELETE FROM user_languages WHERE user_id=$1`, [user.id]);
    await db.none(`DELETE FROM github_users WHERE id=$1`, [user.id]);
  } else {
    throw new Error(`User ${username} not found`);
  }
};

export const getUser = async (username: string): Promise<User | null> => {
  const user = await db.oneOrNone(
    `SELECT
         github_users.username,
         github_users.name,
         github_users.bio,
         github_users.location,
         github_users.company,
         github_users.followers,
         github_users.following,
         STRING_AGG(user_languages.language, ', ') AS languages
     FROM github_users
              JOIN user_languages
                   ON github_users.id = user_languages.user_id WHERE username=$1
     GROUP BY
         github_users.username,
         github_users.name,
         github_users.bio,
         github_users.location,
         github_users.company,
         github_users.followers,
         github_users.following
    `,
    [username]
  );
  
  if (user) {
    return user;
  } else {
    throw new Error(`User ${username} not found`);
  }
};

export const getUsers = async (
  location?: string,
  company?: string,
  language?: string,
  sortBy?: string
) => {
  const conditions = [];
  const params = [];
  
  // Add location condition if provided
  if (location) {
    conditions.push('github_users.location = $' + (conditions.length + 1));
    params.push(location);
  }
  
  // Add company condition if provided
  if (company) {
    conditions.push('github_users.company = $' + (conditions.length + 1));
    params.push(company);
  }
  
  // Base query before GROUP BY
  let query = `
SELECT
    github_users.username,
    github_users.name,
    github_users.bio,
    github_users.location,
    github_users.company,
    github_users.followers,
    github_users.following,
    STRING_AGG(user_languages.language, ', ') AS languages
FROM github_users
JOIN user_languages
ON github_users.id = user_languages.user_id
`;
  
  // Append conditions to WHERE clause if any
  if (conditions.length > 0) {
    query += `WHERE ${conditions.join(' AND ')}`;
  }
  
  // Add GROUP BY clause
  query += `
GROUP BY
    github_users.username,
    github_users.name,
    github_users.bio,
    github_users.location,
    github_users.company,
    github_users.followers,
    github_users.following
`;
  
  // Add HAVING clause to filter by language, but still return all languages
  if (language) {
    params.push(language);
    query += ` HAVING STRING_AGG(user_languages.language, ', ')
     LIKE '%' || $${params.length} || '%'`;
  }
  
  // Determine the ORDER BY clause based on the sortBy parameter
  if (sortBy) {
    switch (sortBy) {
    case 'username':
      query += ` ORDER BY github_users.username ASC`;
      break;
    case 'location':
      query += ` ORDER BY github_users.location ASC`;
      break;
    case 'company':
      query += ` ORDER BY github_users.company ASC`;
      break;
    case 'followers':
      query += ` ORDER BY github_users.followers DESC`;
      break;
    case 'following':
      query += ` ORDER BY github_users.following DESC`;
      break;
    default:
      query += ` ORDER BY github_users.username ASC`; // Default sorting
      break;
    }
  }
  
  return await db.any(query, params);
};

export const batchInsertUsers = async (users: any[]) => {
  try {
    // Start a transaction
    await db.tx(async t => {
      for (const user of users) {
        const {
          username,
          name,
          bio,
          location,
          company,
          followers,
          following,
          languages
        } = user;
        
        // Insert user and languages within the transaction
        await t.none(
          `WITH inserted_user AS (
            INSERT INTO github_users (
              username,
              name,
              bio,
              location,
              company,
              followers,
              following
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
          )

          INSERT INTO user_languages (user_id, language)
          SELECT inserted_user.id, unnest($8::text[])
          FROM inserted_user`,
          [
            username,
            name,
            bio,
            location,
            company,
            followers,
            following,
            languages
          ]
        );
      }
    });
    
    return null
  } catch (error) {
    return error;
  }
};
