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