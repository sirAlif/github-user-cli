export interface User {
  id?: number;
  username: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  followers: number | null;
  following: number | null;
  languages: string[];
}

export interface CommandResponse {
  data?: any;
  error?: string
}

export interface GptResponse {
  action: string;
  username?: string;
  location?: string;
  company?: string;
  language?: string;
  sort?: string;
}