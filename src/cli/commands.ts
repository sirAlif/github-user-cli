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
