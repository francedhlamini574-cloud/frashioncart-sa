// ============================================================
// FrashionCart S.A. — Auth API helpers
// ============================================================
import { supabase } from './client';
import type { Profile } from '../types/database.types';

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  role?: 'customer' | 'seller';
}

export async function signUp({ email, password, fullName, role = 'customer' }: SignUpParams) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
  if (error) throw error;

  // profiles row is created by the auth.users -> public.profiles trigger
  // in a real project (recommended: add a `handle_new_user()` trigger on
  // auth.users insert). If not using a trigger, create explicitly here:
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: data.user.id, email, full_name: fullName, role });
    if (profileError) throw profileError;
  }

  return data;
}

export async function signIn(email: string, password: string, rememberMe = true) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // "Remember me": Supabase persists sessions by default via persistSession:true.
  // For a non-persistent session (logged out on tab close), re-init the client
  // with persistSession:false when rememberMe is false.
  void rememberMe;

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function resendVerificationEmail(email: string) {
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) throw error;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
}

export function onAuthStateChange(callback: (event: string, profileId: string | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session?.user?.id ?? null);
  });
}
