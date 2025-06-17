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

export function createAnonymousUser(username: string): AnonymousUser {
  return {
    id: "anonymous",
    username,
  };
}
