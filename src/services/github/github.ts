import { githubClient } from '../../utils/httpClient';

interface GitHubUser {
    name: string | null;
    bio: string | null;
    location: string | null;
    company: string | null;
    followers: number | null;
    following: number | null;
    repos_url: string;
}

interface Repository {
    languages_url: string;
}

/**
 * Fetches a GitHub user's data.
 *
 * @param {string} username - The GitHub username to fetch data for.
 * @returns {Promise<{ data?: GitHubUser; error?: string }>} A promise
 *  that resolves to an object containing user data or an error message.
 */
export const fetchGitHubUser = async (
  username: string
): Promise<{ data?: GitHubUser; error?: string }> => {
  try {
    const { data } = await githubClient.get<GitHubUser>(`/users/${username}`);
    return {
      data: {
        name: data.name,
        bio: data.bio,
        location: data.location,
        company: data.company,
        followers: data.followers,
        following: data.following,
        repos_url: data.repos_url,
      },
    };
  } catch (error) {
    console.error(`Failed to fetch GitHub user: ${username}`);
    return {
      error: `Failed to fetch GitHub user: ${username}`,
    };
  }
};

/**
 * Fetches programming languages used in repositories of a GitHub user.
 *
 * @param {string} reposUrl - The URL to fetch the repositories from.
 * @returns {Promise<{ data?: string[]; error?: string }>} A promise that
 *  resolves to an object containing a list of languages or an error message.
 */
export const fetchUserLanguages = async (
  reposUrl: string
): Promise<{ data?: string[]; error?: string }> => {
  try {
    const { data: repos } = await githubClient.get<Repository[]>(reposUrl);
    const languagesSet: Set<string> = new Set();
    
    // Fetch languages for each repository concurrently
    await Promise.all(
      repos.map(async (repo) => {
        try {
          const { data: languages } =
            await githubClient.get<Record<string, number>>(repo.languages_url);
          Object.keys(languages).forEach((lang) => languagesSet.add(lang));
        } catch (error) {
          console.error(
            `Failed to fetch languages for repo: ${repo.languages_url}`
          );
        }
      })
    );
    
    return { data: Array.from(languagesSet) };
  } catch (error) {
    console.error(`Failed to fetch repositories from: ${reposUrl}`);
    return { error: `Failed to fetch repositories from: ${reposUrl}` };
  }
};