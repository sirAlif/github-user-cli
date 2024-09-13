import { fetchGitHubUser, fetchUserLanguages } from '../services/github/github';
import {
  addUser,
  getUser,
  getUsers,
  updateUser,
  deleteUser
} from '../services/database/database';
import { User, CommandResponse } from '../models/models';
import { populateUsers } from "../services/populate/populate";
import { getAIResponse } from "../services/ai/ai";


/**
 * Command to add or update a GitHub user in the database.
 * @param {string} username - The GitHub username to add or update.
 * @param {boolean} update - Whether to update an existing user.
 * @returns {Promise<CommandResponse>}
 *  The response object with user data or an error.
 */
export const addUserCommand =
  async (username: string, update: boolean): Promise<CommandResponse> => {
    try {
      const user = await fetchGitHubUser(username);
      if (user.error) return { error: user.error };
    
      if (!user.data)
        return { error: 'User data is missing' };

      const langResponse = await fetchUserLanguages(user.data.repos_url);
      if (langResponse.error) return { error: langResponse.error };
      
      const languages = langResponse.data ? langResponse.data : [];
      
      const userData: User = {
        username: username,
        name: user.data.name,
        bio: user.data.bio,
        location: user.data.location,
        company: user.data.company,
        followers: user.data.followers,
        following: user.data.following,
        languages,
      };
      
      if (update) {
        await updateUser(userData);
        
        console.log(`User ${username} updated successfully.`);
        return { data: user.data };
      } else {
        await addUser(userData);
        
        console.log(`User ${username} added successfully.`);
        return { data: user.data };
      }
    } catch (error) {
      if (update) {
        console.error(`Failed to update user: ${error}`);
        return { error: `Failed to update user: ${error}` };
      } else {
        console.error(`Failed to add user: ${error}`);
        return { error: `Failed to add user: ${error}` };
      }
    }
  };

/**
 * Command to delete a GitHub user from the database.
 * @param {string} username - The GitHub username to delete.
 * @returns {Promise<CommandResponse>}
 *  The response object with a success message or an error.
 */
export const deleteUserCommand =
  async (username: string): Promise<CommandResponse> => {
    try {
      await deleteUser(username);
      console.log(`User ${username} deleted successfully.`);
      return { data: `User ${username} deleted successfully.` };
    } catch (error) {
      console.error(`Failed to delete user: ${error}`);
      return { error: `Failed to delete user: ${error}` };
    }
  };

/**
 * Command to get a GitHub user by username.
 * @param {string} username - The GitHub username to retrieve.
 * @returns {Promise<{ data?: any; error?: string }>}
 *  The response object with user data or an error.
 */
export const getUserCommand = async (username: string):
  Promise<{ data?: any; error?: string }> => {
  try {
    const user = await getUser(username);
    if (user)
      console.log(`
        Username: ${user.username},
        Name: ${user.name}
        Bio: ${user.bio}
        Location: ${user.location}
        Company: ${user.company}
        Followers: ${user.followers}
        Following: ${user.following}
        Languages: ${user.languages}
      `);
    
    return { data: user };
  } catch (error) {
    console.error(`Failed to get user: ${error}`);
    return { error: `Failed to get user: ${error}` };
  }
};

/**
 * Command to get all users from the database with optional filters.
 * @param {string} [location] - Filter users by location.
 * @param {string} [company] - Filter users by company.
 * @param {string} [language] - Filter users by programming language.
 * @param {string} [sort] - Sort users.
 * @returns {Promise<{ data?: any[]; error?: string }>}
 *  The response object with users data or an error.
 */
export const getUsersCommand = async (
  location?: string,
  company?: string,
  language?: string,
  sort?: string
): Promise<{ data?: any[]; error?: string }> => {
  try {
    const users = await getUsers(location, company, language, sort);
    users.forEach(user => {
      console.log(`
        Username: ${user.username},
        Name: ${user.name}
        Bio: ${user.bio}
        Location: ${user.location}
        Company: ${user.company}
        Followers: ${user.followers}
        Following: ${user.following}
        Languages: ${user.languages}
      `);
    });
    return { data: users };
  } catch (error) {
    console.error(`Failed to list users: ${error}`);
    return { error: `Failed to list users: ${error}` };
  }
};

/**
 * Command to populate the database with sample users.
 * @returns {Promise<CommandResponse>}
 *  The response object with a success message or an error.
 */
export const populateUsersCommand = async (): Promise<CommandResponse> => {
  try {
    const error = await populateUsers();
    if (error) {
      console.error(`Populate users failed: ${error}`);
      return {error: `Populate users failed: ${error}` }
    }
    console.log(`Populate users finished successfully.`);
    return { data: `Populate users finished successfully.` };
  } catch (error) {
    console.error(`Populate users failed: ${error}`);
    return { error: `Populate users failed: ${error}` }
  }
};

/**
 * Command to interact with AI and execute corresponding actions.
 * @param {string} text - The input text to send to the AI.
 * @returns {Promise<CommandResponse>}
 *  The response object with results or an error.
 */
export const aiCommand = async (text: string): Promise<CommandResponse> => {
  try {
    const aiResponse = await getAIResponse(text);
    switch (aiResponse.action) {
    case 'add-user':
      if (aiResponse.username != null) {
        const user = await addUserCommand(aiResponse.username, false);
        if (user.error) return { error: user.error };
        return { data: user }
      }
      return { error: 'Username not provided for add-user action.' };
      
    case 'update-user':
      if (aiResponse.username != null) {
        const user = await addUserCommand(aiResponse.username, true);
        if (user.error) return { error: user.error };
        return { data: user }
      }
      return { error: 'Username not provided for update-user action.' };
      
    case 'delete-user':
      if (aiResponse.username != null) {
        const user = await deleteUserCommand(aiResponse.username);
        if (user.error) return { error: user.error };
        return { data: user }
      }
      return { error: 'Username not provided for delete-user action.' };
      
    case 'get-user':
      if (aiResponse.username != null) {
        const user = await getUserCommand(aiResponse.username);
        if (user.error) return { error: user.error };
        return { data: user }
      }
      return { error: 'Username not provided for get-user action.' };
      
    case 'get-users':
      return await getUsersCommand(
        aiResponse.location,
        aiResponse.company,
        aiResponse.language,
        aiResponse.sort
      );
      
    case 'populate':
      return await populateUsersCommand();
      
    default:
      console.error(`Unknown action: ${aiResponse.action}`);
      return { error: `Unknown action: ${aiResponse.action}` };
    }
  } catch (error) {
    console.error(`Failed to execute AI command: ${error}`);
    return { error: `Failed to execute AI command: ${error}` };
  }
};
