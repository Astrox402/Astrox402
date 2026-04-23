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

export function buildUserFromPrivy(privyUser: {
  id: string;
  email?: { address: string } | null;
  google?: { email: string; name?: string } | null;
  github?: { email?: string; name?: string } | null;
  wallet?: { address: string } | null;
}): User {
  const email =
    privyUser.email?.address ??
    privyUser.google?.email ??
    privyUser.github?.email ??
    "";
  const googleName = privyUser.google?.name;
  const githubName = privyUser.github?.name;
  const walletAddr = privyUser.wallet?.address;

  let name = googleName ?? githubName ?? "";
  if (!name && email) {
    name = email
      .split("@")[0]
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  if (!name && walletAddr) {
    name = `${walletAddr.slice(0, 4)}…${walletAddr.slice(-4)}`;
  }
  if (!name) name = "Astro User";

  const workspaceBase = email
    ? email.split("@")[0]
    : walletAddr
    ? walletAddr.slice(0, 8)
    : "workspace";

  return {
    id: privyUser.id,
    name,
    email: email || (walletAddr ? walletAddr : ""),
    workspace: `${workspaceBase}-workspace`,
    avatar: name.slice(0, 2).toUpperCase(),
  };
}

export function signOut(): void {
  clearUser();
}
