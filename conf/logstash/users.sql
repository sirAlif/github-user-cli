SELECT
    github_users.id,
    github_users.username,
    github_users.name,
    github_users.bio,
    github_users.location,
    github_users.company,
    github_users.followers,
    github_users.following,
    ARRAY_AGG(user_languages.language) AS languages
FROM github_users
         JOIN user_languages
              ON github_users.id = user_languages.user_id
GROUP BY
    github_users.id,
    github_users.username,
    github_users.name,
    github_users.bio,
    github_users.location,
    github_users.company,
    github_users.followers,
    github_users.following