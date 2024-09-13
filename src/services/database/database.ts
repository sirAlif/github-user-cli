import pgPromise from 'pg-promise';
import { dbConfig } from '../../config';
import { User } from '../../models/models';

const pgp = pgPromise();
export const db = pgp(dbConfig);

/**
 * Adds a new user to the database.
 *
 * @param {User} user - The user object containing user details.
 * @returns {Promise<number>}
 *  A promise that resolves to the ID of the newly added user.
 */
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
     VALUES(
      \${username},
      \${name},
      \${bio},
      \${location},
      \${company},
      \${followers},
      \${following}
    ) RETURNING id`,
    {
      username: user.username,
      name: user.name,
      bio: user.bio,
      location: user.location,
      company: user.company,
      followers: user.followers,
      following: user.following
    }
  );

  for (const language of user.languages) {
    await db.none(
      `INSERT INTO user_languages(user_id, language)
       VALUES(\${user_id}, \${language})`,
      {
        user_id: newUser.id,
        language: language
      }
    );
  }
  
  return newUser.id;
};

/**
 * Updates an existing user's details in the database.
 *
 * @param {User} user - The user object containing updated user details.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 */
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
       VALUES(\${user_id}, \${language})`,
      {
        user_id: user.id,
        language: language
      }
    );
  }
};

/**
 * Deletes a user from the database.
 *
 * @param {string} username - The username of the user to delete.
 * @returns {Promise<void>} A promise that resolves when the user is deleted.
 * @throws {Error} If the user is not found.
 */
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

/**
 * Retrieves a user's details by username.
 *
 * @param {string} username - The username of the user to retrieve.
 * @returns {Promise<User | null>}
 *  A promise that resolves to the user object if found, or null if not found.
 * @throws {Error} If the user is not found.
 */
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

/**
 * Retrieves users from the database with optional filters and sorting.
 *
 * @param {string} [location] - Filter users by location.
 * @param {string} [company] - Filter users by company.
 * @param {string} [language] - Filter users by programming language.
 * @param {string} [sortBy] - Sort users by a specific field.
 * @returns {Promise<User[]>} A promise that resolves to an array of users.
 */
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

/**
 * Batch inserts multiple users into the database.
 *
 * @param {any[]} users - An array of user objects to insert.
 * @returns {Promise<null | Error>} A promise
 *  that resolves to null if successful, or an error if something goes wrong.
 */
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
            VALUES (\${username}, \${name}, \${bio}, \${location}, \${company}, \${followers}, \${following})
            RETURNING id
          )

          INSERT INTO user_languages (user_id, language)
          SELECT inserted_user.id, unnest(\${languages}::text[])
          FROM inserted_user`,
          {
            username: username,
            name: name,
            bio: bio,
            location: location,
            company: company,
            followers: followers,
            following: following,
            languages: languages
          }
        );
      }
    });
    
    return null;
  } catch (error) {
    return error;
  }
};
