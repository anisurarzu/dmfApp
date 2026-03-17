import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { apiLogin, apiLogout, apiRegister, apiUserInfo } from '../api/auth';
import { normalizeAuthError } from '../api/normalizeError';
import { clearToken, getToken, setToken } from '../storage/authStorage';
import { apiUpdateUser } from '../api/user';
import { apiChangePassword } from '../api/password';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [me, setMe] = useState(null);
  const [isBooting, setIsBooting] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const t = await getToken();
        if (t) {
          setTokenState(t);
          try {
            const res = await apiUserInfo(t);
            setMe(res?.data || null);
          } catch {
            // ignore
          }
        }
      } finally {
        setIsBooting(false);
      }
    })();
  }, []);

  const login = async ({ email, password }) => {
    setIsBusy(true);
    try {
      const { data } = await apiLogin({ email, password });
      if (data?.token) {
        await setToken(data.token);
        setTokenState(data.token);
        try {
          const res = await apiUserInfo(data.token);
          setMe(res?.data || null);
        } catch {
          // ignore
        }
        return { ok: true, data };
      }
      return { ok: false, error: data?.message || 'Login failed', data };
    } catch (e) {
      const normalized = normalizeAuthError(e, { defaultMessage: 'Login failed' });
      return {
        ok: false,
        error: normalized.message,
        fieldErrors: normalized.fieldErrors,
        status: normalized.status,
        data: e?.data,
      };
    } finally {
      setIsBusy(false);
    }
  };

  const register = async (payload) => {
    setIsBusy(true);
    try {
      const { data } = await apiRegister(payload);
      return { ok: true, data };
    } catch (e) {
      const normalized = normalizeAuthError(e, { defaultMessage: 'Registration failed' });
      return {
        ok: false,
        error: normalized.message,
        fieldErrors: normalized.fieldErrors,
        status: normalized.status,
        data: e?.data,
      };
    } finally {
      setIsBusy(false);
    }
  };

  const logout = async () => {
    setIsBusy(true);
    try {
      const t = token || (await getToken());
      if (t) {
        try {
          await apiLogout(t);
        } catch {
          // ignore server issues
        }
      }
      await clearToken();
      setTokenState(null);
      setMe(null);
      return { ok: true };
    } catch (e) {
      Alert.alert('Logout', 'Logged out locally.');
      await clearToken();
      setTokenState(null);
      setMe(null);
      return { ok: true };
    } finally {
      setIsBusy(false);
    }
  };

  const refreshMe = async () => {
    const t = token || (await getToken());
    if (!t) return { ok: false, error: 'Not logged in' };
    try {
      const res = await apiUserInfo(t);
      setMe(res?.data || null);
      return { ok: true, data: res?.data };
    } catch (e) {
      return { ok: false, error: e?.data?.message || e?.message || 'Failed to refresh profile' };
    }
  };

  const updateProfile = async (payload) => {
    setIsBusy(true);
    try {
      const t = token || (await getToken());
      if (!t) return { ok: false, error: 'Not logged in' };
      const res = await apiUpdateUser({ token: t, payload });
      // API returns { message, user }
      const nextMe = res?.data?.user || null;
      if (nextMe) setMe(nextMe);
      else await refreshMe();
      return { ok: true, data: res?.data };
    } catch (e) {
      const msg = e?.data?.message || e?.message || 'Profile update failed';
      return { ok: false, error: String(msg), status: e?.status };
    } finally {
      setIsBusy(false);
    }
  };

  const changePassword = async ({ email, currentPassword, newPassword }) => {
    setIsBusy(true);
    try {
      const t = token || (await getToken());
      if (!t) return { ok: false, error: 'Not logged in' };
      const payload = { email, currentPassword, newPassword };
      const res = await apiChangePassword({ token: t, payload });
      return { ok: true, data: res?.data };
    } catch (e) {
      const msg = e?.data?.message || e?.message || 'Password change failed';
      return { ok: false, error: String(msg), status: e?.status };
    } finally {
      setIsBusy(false);
    }
  };

  const value = useMemo(
    () => ({ token, me, isBooting, isBusy, login, register, logout, refreshMe, updateProfile, changePassword }),
    [token, me, isBooting, isBusy]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

