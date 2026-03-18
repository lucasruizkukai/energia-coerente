import { hasSupabaseEnv, supabase } from "../lib/supabase";

export async function getCurrentSession() {
  if (!hasSupabaseEnv || !supabase) {
    return { mode: "local", session: null, user: null };
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;

  return {
    mode: "supabase",
    session,
    user: session?.user ?? null,
  };
}

export async function signInWithPassword({ email, password }) {
  if (!hasSupabaseEnv || !supabase) {
    return {
      mode: "local",
      session: null,
      user: { email: email || "modo-local@energia-coerente.app" },
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return {
    mode: "supabase",
    session: data.session,
    user: data.user,
  };
}

export async function signOut() {
  if (!hasSupabaseEnv || !supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
