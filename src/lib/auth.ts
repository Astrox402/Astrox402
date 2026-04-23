export interface User {
  id: string;
  name: string;
  email: string;
  workspace: string;
  avatar: string;
}

const KEY = "astro_x402_auth";

export function getUser(): User | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setUser(user: User): void {
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(KEY);
}

export function signIn(email: string, _password: string): User {
  const name = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const user: User = {
    id: crypto.randomUUID(),
    name,
    email,
    workspace: `${email.split("@")[0]}-workspace`,
    avatar: name.slice(0, 2).toUpperCase(),
  };
  setUser(user);
  return user;
}

export function signOut(): void {
  clearUser();
}
