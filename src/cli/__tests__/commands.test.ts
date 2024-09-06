import {
  addUserCommand,
  deleteUserCommand,
  getUserCommand,
  getUsersCommand,
  aiCommand
} from '../commands';
import {
  fetchGitHubUser,
  fetchUserLanguages
} from '../../services/github/github';
import {
  addUser,
  getUser,
  getUsers,
  deleteUser
} from '../../services/database/database';
import { getAIResponse } from '../../services/ai/ai';

jest.mock('../../services/github/github');
jest.mock('../../services/database/database');
jest.mock('../../services/ai/ai');

describe('CLI Commands', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('addUserCommand should add a user successfully', async () => {
    const mockGitHubUser = {
      data: {
        name: 'John Doe',
        repos_url: 'https://api.github.com/repos'
      }
    };
    const mockLanguages = { data: ['JavaScript', 'TypeScript'] };
    
    (fetchGitHubUser as jest.Mock).mockResolvedValue(mockGitHubUser);
    (fetchUserLanguages as jest.Mock).mockResolvedValue(mockLanguages);
    (addUser as jest.Mock).mockResolvedValue(undefined);
    
    const result = await addUserCommand('johndoe', false);
    
    expect(fetchGitHubUser).toHaveBeenCalledWith('johndoe');
    expect(fetchUserLanguages)
      .toHaveBeenCalledWith('https://api.github.com/repos');
    expect(addUser).toHaveBeenCalledWith({
      username: 'johndoe',
      name: 'John Doe',
      bio: undefined,
      location: undefined,
      company: undefined,
      followers: undefined,
      following: undefined,
      languages: ['JavaScript', 'TypeScript']
    });
    expect(result.data).toEqual(mockGitHubUser.data);
  });
  
  test('deleteUserCommand should delete a user successfully', async () => {
    (deleteUser as jest.Mock).mockResolvedValue(undefined);
    
    const result = await deleteUserCommand('johndoe');
    
    expect(deleteUser).toHaveBeenCalledWith('johndoe');
    expect(result.data).toBe('User johndoe deleted successfully.');
  });
  
  test('getUserCommand should retrieve a user successfully', async () => {
    const mockUser = {
      username: 'johndoe',
      name: 'John Doe',
      bio: 'A GitHub user'
    };
    
    (getUser as jest.Mock).mockResolvedValue(mockUser);
    
    const result = await getUserCommand('johndoe');
    
    expect(getUser).toHaveBeenCalledWith('johndoe');
    expect(result.data).toEqual(mockUser);
  });
  
  test('getUsersCommand should retrieve users with filters', async () => {
    const mockUsers = [
      { username: 'johndoe', name: 'John Doe', languages: ['JavaScript'] }
    ];
    
    (getUsers as jest.Mock).mockResolvedValue(mockUsers);
    
    const result = await getUsersCommand(
      'San Francisco', 'GitHub', 'JavaScript', 'followers');
    
    expect(getUsers).toHaveBeenCalledWith(
      'San Francisco', 'GitHub', 'JavaScript', 'followers');
    expect(result.data).toEqual(mockUsers);
  });
  
  test('aiCommand should return appropriate action from AI response',
    async () => {
      const mockAIResponse = { action: 'add-user', username: 'johndoe' };
    
      (getAIResponse as jest.Mock).mockResolvedValue(mockAIResponse);
      const mockGitHubUser = {
        data: {
          name: 'John Doe',
          repos_url: 'https://api.github.com/repos'
        }
      };
      const mockLanguages = { data: ['JavaScript', 'TypeScript'] };
    
      (fetchGitHubUser as jest.Mock).mockResolvedValue(mockGitHubUser);
      (fetchUserLanguages as jest.Mock).mockResolvedValue(mockLanguages);
      (addUser as jest.Mock).mockResolvedValue(undefined);
    
      const result = await aiCommand('Add user johndoe');
    
      expect(getAIResponse).toHaveBeenCalledWith('Add user johndoe');
      expect(result.data).toEqual(mockGitHubUser);
    });
});
