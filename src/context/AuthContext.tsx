import { App } from "antd";
import type { PropsWithChildren } from "react";
import { useCallback, useMemo, useState } from "react";
import {
  loginByCode as apiLoginByCode,
  loginByPassword as apiLoginByPassword,
  logoutAdmin,
  logoutUser
} from "@/api/auth";
import { getAdminMe } from "@/api/admin";
import { getUserMe } from "@/api/user";
import type { ApiAdmin, ApiAuthResponse, ApiUser } from "@/api/types";
import { AuthContext, type AuthContextValue } from "@/context/auth";
import {
  clearSession,
  getRefreshToken,
  getSubject,
  saveSubject,
  saveTokens
} from "@/api/tokenStore";

export function AuthProvider({ children }: PropsWithChildren) {
  const { message } = App.useApp();
  const [user, setUser] = useState<ApiUser | null>(() => getSubject<ApiUser>("user"));
  const [admin, setAdmin] = useState<ApiAdmin | null>(() => getSubject<ApiAdmin>("admin"));
  const [userReady, setUserReady] = useState(false);
  const [adminReady, setAdminReady] = useState(false);

  const refreshUser = useCallback(async () => {
    if (!getRefreshToken("user")) {
      setUser(null);
      setUserReady(true);
      return null;
    }
    try {
      const nextUser = await getUserMe();
      setUser(nextUser);
      saveSubject("user", nextUser);
      return nextUser;
    } catch {
      clearSession("user");
      setUser(null);
      return null;
    } finally {
      setUserReady(true);
    }
  }, []);

  const refreshAdmin = useCallback(async () => {
    if (!getRefreshToken("admin")) {
      setAdmin(null);
      setAdminReady(true);
      return null;
    }
    try {
      const me = await getAdminMe();
      const nextAdmin: ApiAdmin = {
        id: me.id,
        email: me.email,
        role: me.role,
        status: "enabled"
      };
      setAdmin(nextAdmin);
      saveSubject("admin", nextAdmin);
      return nextAdmin;
    } catch {
      clearSession("admin");
      setAdmin(null);
      return null;
    } finally {
      setAdminReady(true);
    }
  }, []);

  const handleUserAuth = useCallback(async (promise: Promise<ApiAuthResponse>) => {
    const response = await promise;
    if (!response.user) {
      throw new Error("登录响应缺少用户信息");
    }
    saveTokens("user", response.access_token, response.refresh_token);
    saveSubject("user", response.user);
    setUser(response.user);
    setUserReady(true);
    if (response.admin && response.admin_access_token && response.admin_refresh_token) {
      saveTokens("admin", response.admin_access_token, response.admin_refresh_token);
      saveSubject("admin", response.admin);
      setAdmin(response.admin);
    } else {
      clearSession("admin");
      setAdmin(null);
    }
    setAdminReady(true);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken("user");
    const adminRefreshToken = getRefreshToken("admin");
    clearSession("user");
    clearSession("admin");
    setUser(null);
    setAdmin(null);
    if (refreshToken) {
      try {
        await logoutUser(refreshToken);
      } catch {
        message.warning("本地已退出，服务端会话稍后自动过期");
      }
    }
    if (adminRefreshToken) {
      try {
        await logoutAdmin(adminRefreshToken);
      } catch {
        message.warning("本地已退出，后台会话稍后自动过期");
      }
    }
  }, [message]);

  const logoutAdminSession = useCallback(async () => {
    const refreshToken = getRefreshToken("admin");
    clearSession("admin");
    setAdmin(null);
    if (refreshToken) {
      try {
        await logoutAdmin(refreshToken);
      } catch {
        message.warning("本地已退出，后台会话稍后自动过期");
      }
    }
  }, [message]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    admin,
    userReady,
    adminReady,
    refreshUser,
    refreshAdmin,
    loginByPassword: (email, password) => handleUserAuth(apiLoginByPassword(email, password)),
    loginByCode: (email, code) => handleUserAuth(apiLoginByCode(email, code)),
    logout,
    logoutAdminSession
  }), [
    admin,
    adminReady,
    handleUserAuth,
    logout,
    logoutAdminSession,
    refreshAdmin,
    refreshUser,
    user,
    userReady
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
