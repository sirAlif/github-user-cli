import path from 'path';
import fs from 'fs';
import { batchInsertUsers } from '../database/database';

/**
 * Reads user data from a JSON file and inserts it into the database.
 *
 * This function reads a JSON file named `users.json`
 *  located in the same directory as the script,
 * parses the content to extract user information,
 *  and then attempts to insert these users into the
 * database using the `batchInsertUsers` function from the database module.
 *
 * @async
 * @function populateUsers
 * @returns {Promise<void|Error>} A promise
 *  that resolves to void if successful or an Error if an error occurs.
 *
 * @throws {Error} Throws an error if the file reading
 *  or database insertion fails.
 */
export const populateUsers = async () => {
  // Get the absolute path of the JSON file
  const filePath = path.resolve(__dirname, '../../../conf/populate/users.json');
  
  // Read the JSON file
  const data = fs.readFileSync(filePath, 'utf8');
  const users = JSON.parse(data);
  
  try {
    return await batchInsertUsers(users);
  } catch (error) {
    return error;
  }
};