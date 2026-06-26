export type AuthScope = "user" | "admin";

const tokenKeys = {
  user: {
    access: "reelmind_user_access_token",
    refresh: "reelmind_user_refresh_token",
    subject: "reelmind_user_subject"
  },
  admin: {
    access: "reelmind_admin_access_token",
    refresh: "reelmind_admin_refresh_token",
    subject: "reelmind_admin_subject"
  }
} satisfies Record<AuthScope, Record<"access" | "refresh" | "subject", string>>;

function safeLocalStorage() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

export function getAccessToken(scope: AuthScope) {
  return safeLocalStorage()?.getItem(tokenKeys[scope].access) ?? "";
}

export function getRefreshToken(scope: AuthScope) {
  return safeLocalStorage()?.getItem(tokenKeys[scope].refresh) ?? "";
}

export function saveTokens(scope: AuthScope, accessToken: string, refreshToken: string) {
  const storage = safeLocalStorage();
  if (!storage) {
    return;
  }
  storage.setItem(tokenKeys[scope].access, accessToken);
  storage.setItem(tokenKeys[scope].refresh, refreshToken);
}

export function saveSubject<T>(scope: AuthScope, subject: T) {
  const storage = safeLocalStorage();
  if (!storage) {
    return;
  }
  storage.setItem(tokenKeys[scope].subject, JSON.stringify(subject));
}

export function getSubject<T>(scope: AuthScope): T | null {
  const raw = safeLocalStorage()?.getItem(tokenKeys[scope].subject);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearSession(scope: AuthScope) {
  const storage = safeLocalStorage();
  if (!storage) {
    return;
  }
  storage.removeItem(tokenKeys[scope].access);
  storage.removeItem(tokenKeys[scope].refresh);
  storage.removeItem(tokenKeys[scope].subject);
}

