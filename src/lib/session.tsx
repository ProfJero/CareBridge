import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { sb } from "@/lib/supabase";
import { useCart } from "@/lib/cart";
import type { Profile, Store } from "@/lib/types";

type SessionValue = {
  ready: boolean;
  session: Session | null;
  userId: string | null;
  email: string | null;
  profile: Profile | null;
  store: Store | null;
  isAdmin: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [store, setStore] = useState<Store | null>(null);

  const load = useCallback(async (next: Session | null) => {
    if (!next) {
      setProfile(null);
      setStore(null);
      return;
    }
    const client = sb();
    const [profileRes, storeRes] = await Promise.all([
      client.from("profiles").select("*").eq("id", next.user.id).maybeSingle(),
      client.from("stores").select("*").eq("owner_id", next.user.id).maybeSingle(),
    ]);
    setProfile((profileRes.data as Profile | null) ?? null);
    setStore((storeRes.data as Store | null) ?? null);
  }, []);

  useEffect(() => {
    void useCart.persist.rehydrate();
    const client = sb();
    let active = true;
    void client.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await load(data.session);
      if (active) setReady(true);
    });
    const { data } = client.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      // Defer Supabase calls out of the auth callback to avoid a deadlock.
      setTimeout(() => {
        void load(next).finally(() => setReady(true));
      }, 0);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [load]);

  const value = useMemo<SessionValue>(
    () => ({
      ready,
      session,
      userId: session?.user.id ?? null,
      email: session?.user.email ?? null,
      profile,
      store,
      isAdmin: Boolean(profile?.is_admin),
      refresh: () => load(session),
      signOut: async () => {
        await sb().auth.signOut();
      },
    }),
    [ready, session, profile, store, load],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside <SessionProvider>.");
  return value;
}
