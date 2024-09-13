import { fetchGitHubUser, fetchUserLanguages } from '../github';
import { githubClient } from '../../../utils/httpClient';

// Mock the githubClient module
jest.mock('../../../utils/httpClient', () => ({
  githubClient: {
    get: jest.fn(),
  },
}));

describe('GitHub API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('fetchGitHubUser', () => {
    it('should return user data when the request is successful', async () => {
      const mockUser = {
        name: 'John Doe',
        bio: 'Developer',
        location: 'USA',
        company: 'Example Corp',
        followers: 100,
        following: 50,
        repos_url: 'https://api.github.com/users/johndoe/repos',
      };
      
      (githubClient.get as jest.Mock).mockResolvedValue({ data: mockUser });
      
      const result = await fetchGitHubUser('johndoe');
      expect(result.data).toEqual(mockUser);
      expect(result.error).toBeUndefined();
    });
    
    it('should return an error message when the request fails', async () => {
      (githubClient.get as jest.Mock)
        .mockRejectedValue(new Error('Network Error'));
      
      const result = await fetchGitHubUser('johndoe');
      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Failed to fetch GitHub user: johndoe');
    });
  });
  
  describe('fetchUserLanguages', () => {
    it('should return a list of languages when the request is successful',
      async () => {
        const mockRepos = [
          { languages_url:
              'https://api.github.com/repos/johndoe/repo1/languages' },
          { languages_url:
              'https://api.github.com/repos/johndoe/repo2/languages' },
        ];
      
        const mockLanguages1 = { JavaScript: 100, TypeScript: 50 };
        const mockLanguages2 = { Python: 200, JavaScript: 150 };
      
        (githubClient.get as jest.Mock)
          .mockResolvedValueOnce({ data: mockRepos })
          .mockResolvedValueOnce({ data: mockLanguages1 })
          .mockResolvedValueOnce({ data: mockLanguages2 });
      
        const result = await fetchUserLanguages(
          'https://api.github.com/users/johndoe/repos');
        expect(result.data).toEqual(['JavaScript', 'TypeScript', 'Python']);
        expect(result.error).toBeUndefined();
      });
    
    it('should return an error message when fetching repositories fails',
      async () => {
        (githubClient.get as jest.Mock)
          .mockRejectedValueOnce(new Error('Network Error'));
      
        const result = await fetchUserLanguages(
          'https://api.github.com/users/johndoe/repos');
        expect(result.data).toBeUndefined();
        expect(result.error).toBe('Failed to fetch repositories from: ' +
          'https://api.github.com/users/johndoe/repos');
      });
    
    it('should handle repository language fetch errors gracefully',
      async () => {
        const mockRepos = [
          { languages_url:
              'https://api.github.com/repos/johndoe/repo1/languages' },
        ];
      
        (githubClient.get as jest.Mock)
          .mockResolvedValueOnce({ data: mockRepos })
          .mockRejectedValueOnce(new Error('Network Error'));
      
        const result = await fetchUserLanguages(
          'https://api.github.com/users/johndoe/repos');
        expect(result.data).toEqual([]);
        expect(result.error).toBeUndefined();
      });
  });
});
