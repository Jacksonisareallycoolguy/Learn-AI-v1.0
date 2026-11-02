import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from './supabase.js';

// Students sign in with a username only. Supabase Auth needs an email, so we turn the
// username into a private placeholder address. No email is ever sent to it.
const EMAIL_DOMAIN = 'learnai.app';

export const USERNAME_RULE = /^[A-Za-z0-9_]{3,20}$/;

export function usernameToEmail(username) {
  return `${username.trim().toLowerCase()}@${EMAIL_DOMAIN}`;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (username, password) => {
    const clean = username.trim();
    const { data, error } = await supabase.auth.signUp({
      email: usernameToEmail(clean),
      password,
      options: { data: { display_name: clean } },
    });
    if (error) {
      if (/already registered|already been registered|exists/i.test(error.message)) {
        throw new Error('That username is taken. Try another one.');
      }
      if (/password/i.test(error.message)) {
        throw new Error('Choose a stronger password with at least 8 characters.');
      }
      throw new Error('We could not create your account. Please try again.');
    }
    // With "Confirm email" turned on in Supabase there is no session yet.
    if (!data.session) {
      throw new Error(
        'Sign-up worked, but the site is still asking for email confirmation. The site owner needs to turn off "Confirm email" in Supabase (Authentication > Providers > Email).'
      );
    }
    return data.session;
  }, []);

  const signIn = useCallback(async (username, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    });
    if (error) {
      if (/invalid login|invalid credentials/i.test(error.message)) {
        throw new Error('Wrong username or password.');
      }
      if (/confirm/i.test(error.message)) {
        throw new Error('This account is waiting on email confirmation. The site owner needs to turn off "Confirm email" in Supabase.');
      }
      throw new Error('We could not log you in. Please try again.');
    }
    return data.session;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const username =
    session?.user?.user_metadata?.display_name ||
    session?.user?.email?.split('@')[0] ||
    '';

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, username, loading, signUp, signIn, signOut }),
    [session, username, loading, signUp, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
