import path from 'path';
import fs from 'fs';
import { batchInsertUsers } from '../database/database';

export const populateUsers = async () => {
  // Get the absolute path of the JSON file
  const filePath = path.resolve(__dirname, 'users.json');
  
  // Read the JSON file
  const data = fs.readFileSync(filePath, 'utf8');
  const users = JSON.parse(data);
  
  try {
    return await batchInsertUsers(users);
  } catch (error) {
    return error;
  }
};