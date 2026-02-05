 import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
 import { User } from '@supabase/supabase-js';
 import { supabase } from '@/integrations/supabase/client';
 import type { Profile, AppRole } from '@/types/forum';
 
 interface AuthContextType {
   user: User | null;
   profile: Profile | null;
   role: AppRole | null;
   isLoading: boolean;
   isStaff: boolean;
   isOwner: boolean;
   isAdmin: boolean;
   signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
   signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
   signOut: () => Promise<void>;
   refreshProfile: () => Promise<void>;
 }
 
 const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
 export function AuthProvider({ children }: { children: ReactNode }) {
   const [user, setUser] = useState<User | null>(null);
   const [profile, setProfile] = useState<Profile | null>(null);
   const [role, setRole] = useState<AppRole | null>(null);
   const [isLoading, setIsLoading] = useState(true);
 
   const fetchProfile = async (userId: string) => {
     const { data: profileData } = await supabase
       .from('profiles')
       .select('*')
       .eq('user_id', userId)
       .maybeSingle();
     
     const { data: roleData } = await supabase
       .from('user_roles')
       .select('role')
       .eq('user_id', userId)
       .order('created_at', { ascending: true })
       .limit(1)
       .maybeSingle();
     
     setProfile(profileData as Profile | null);
     setRole((roleData?.role as AppRole) || 'member');
   };
 
   const refreshProfile = async () => {
     if (user) {
       await fetchProfile(user.id);
     }
   };
 
   useEffect(() => {
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       async (event, session) => {
         setUser(session?.user ?? null);
         if (session?.user) {
           setTimeout(() => fetchProfile(session.user.id), 0);
         } else {
           setProfile(null);
           setRole(null);
         }
         setIsLoading(false);
       }
     );
 
     supabase.auth.getSession().then(({ data: { session } }) => {
       setUser(session?.user ?? null);
       if (session?.user) {
         fetchProfile(session.user.id);
       }
       setIsLoading(false);
     });
 
     return () => subscription.unsubscribe();
   }, []);
 
   const signIn = async (email: string, password: string) => {
     const { error } = await supabase.auth.signInWithPassword({ email, password });
     return { error };
   };
 
   const signUp = async (email: string, password: string, username: string) => {
     const { error } = await supabase.auth.signUp({
       email,
       password,
       options: {
         data: { username },
         emailRedirectTo: window.location.origin,
       },
     });
     return { error };
   };
 
   const signOut = async () => {
     await supabase.auth.signOut();
     setUser(null);
     setProfile(null);
     setRole(null);
   };
 
   const isStaff = role ? ['owner', 'admin', 'moderator', 'support'].includes(role) : false;
   const isOwner = role === 'owner';
   const isAdmin = role === 'admin' || role === 'owner';
 
   return (
     <AuthContext.Provider value={{
       user,
       profile,
       role,
       isLoading,
       isStaff,
       isOwner,
       isAdmin,
       signIn,
       signUp,
       signOut,
       refreshProfile,
     }}>
       {children}
     </AuthContext.Provider>
   );
 }
 
 export function useAuth() {
   const context = useContext(AuthContext);
   if (context === undefined) {
     throw new Error('useAuth must be used within an AuthProvider');
   }
   return context;
 }