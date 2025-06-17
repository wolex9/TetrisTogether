// Client-side auth utilities

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AnonymousUser {
  id: "anonymous";
  username: string;
  email?: never;
}

export type AuthUser = User | AnonymousUser;
