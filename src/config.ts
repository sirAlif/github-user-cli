import dotenv from 'dotenv';

dotenv.config();

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'github_users_db',
  user: process.env.DB_USER || 'yourusername',
  password: process.env.DB_PASSWORD || 'yourpassword'
};

export const openAiConfig = {
  apiKey: process.env.OPENAI_KEY || 'some-key',
  apiUrl: process.env.OPENAI_URL || 'https://api.openai.com'
};

export const githubApiConfig = {
  baseUrl: process.env.GITHUB_API_URL || 'https://api.github.com'
};
