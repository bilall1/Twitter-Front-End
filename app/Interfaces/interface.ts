import { Session } from "next-auth";

export interface Tweet {
  Id: number;
  Content: string;
  Link: string;
}

export interface User {
  Id: string;
  FirstName: string;
  LastName: string;
  Followed: boolean;
  Profile: string;
}

export interface UserData {
  people: User[];
}

export interface TweetUser {
  Id: number;
  Content: string;
  Email: string;
  FirstName: string;
  LastName: string;
  Profile: string;
  Link: string | null;
}

export interface TweetComments {
  Id: number;
  TweetId: number;
  UserId: number;
  TweetComment: string;
  Email: string;
  FirstName: string;
  LastName: string;
  Profile: string;
}

export interface TweetInterface {
  Id: number;
  Content: string;
  Link: string;
}

export interface MySession extends Session {
  accessToken: string;
}
