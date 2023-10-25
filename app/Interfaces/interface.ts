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
  Email: string;
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

export interface Message {
  Id: number;
  SenderId: number;
  RecieverId: number;
  MessageType: string;
  CreatedAt: string;
  Status: string;
  Content: string;
}

export interface Conversation {
  UserId: number;
  UserEmail: string;
  UserFirstName: string;
  UserLastName: string;
  UserProfile: string;
  Id: number;
  Participant1: number;
  Participant2: number;
  LastChat: string;
  LastMessage: string;
}

export interface UserStatus {
  Id: number;
  UserId: number;
  LastActive: string;
  Status: string;
}

export type FirebaseNotification = {
  notification?: {
    title?: string;
    body?: string;
  };
};
