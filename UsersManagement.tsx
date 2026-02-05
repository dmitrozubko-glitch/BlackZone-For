 import { useState, useEffect } from 'react';
 import { Search, Crown, Shield, User as UserIcon, MoreVertical, Check, Ban } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { RankBadge } from '@/components/forum/RankBadge';
 import { supabase } from '@/integrations/supabase/client';
 import type { Profile, AppRole } from '@/types/forum';
 import { ROLE_LABELS } from '@/types/forum';
 import { useAuth } from '@/hooks/useAuth';
 import { toast } from 'sonner';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
   DropdownMenuSub,
   DropdownMenuSubTrigger,
   DropdownMenuSubContent,
 } from '@/components/ui/dropdown-menu';
 import { Skeleton } from '@/components/ui/skeleton';
 
 interface UserWithRole extends Profile {
   role: AppRole;
   email?: string;
 }
 
 const ALL_ROLES: AppRole[] = ['owner', 'admin', 'moderator', 'support', 'vip', 'member'];
 
 export default function UsersManagement() {
   const [users, setUsers] = useState<UserWithRole[]>([]);
   const [searchQuery, setSearchQuery] = useState('');
   const [isLoading, setIsLoading] = useState(true);
   const { role: currentUserRole, isOwner } = useAuth();
 
   useEffect(() => {
     fetchUsers();
   }, []);
 
   const fetchUsers = async () => {
     const { data: profiles } = await supabase
       .from('profiles')
       .select('*')
       .order('created_at', { ascending: false });
 
     if (profiles) {
       const userIds = profiles.map(p => p.user_id);
       const { data: roles } = await supabase
         .from('user_roles')
         .select('user_id, role')
         .in('user_id', userIds);
 
       const roleMap = new Map(roles?.map(r => [r.user_id, r.role as AppRole]));
 
       const usersWithRoles = profiles.map(profile => ({
         ...profile,
         role: roleMap.get(profile.user_id) || 'member',
       }));
 
       setUsers(usersWithRoles as UserWithRole[]);
     }
     setIsLoading(false);
   };
 
   const changeUserRole = async (userId: string, newRole: AppRole) => {
     // Check if can change to this role
     if (newRole === 'owner' && !isOwner) {
       toast.error('Тільки власник може призначати власників');
       return;
     }
 
     if (newRole === 'admin' && !isOwner) {
       toast.error('Тільки власник може призначати адміністраторів');
       return;
     }
 
     // Delete existing role
     await supabase
       .from('user_roles')
       .delete()
       .eq('user_id', userId);
 
     // Insert new role
     const { error } = await supabase
       .from('user_roles')
       .insert({ user_id: userId, role: newRole });
 
     if (error) {
       toast.error('Помилка зміни рангу');
     } else {
       toast.success(`Ранг змінено на ${ROLE_LABELS[newRole]}`);
       fetchUsers();
     }
   };
 
   const filteredUsers = users.filter(user =>
     user.username.toLowerCase().includes(searchQuery.toLowerCase())
   );
 
   const canChangeRole = (targetRole: AppRole): boolean => {
     if (isOwner) return true;
     if (currentUserRole === 'admin') {
       return !['owner', 'admin'].includes(targetRole);
     }
     return false;
   };
 
   return (
     <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
           <h2 className="font-display text-xl font-bold mb-2">Користувачі</h2>
           <p className="text-muted-foreground">Управління користувачами та рангами</p>
         </div>
 
         <div className="relative w-full sm:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             placeholder="Пошук користувачів..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="pl-10"
           />
         </div>
       </div>
 
       {/* Users Table */}
       <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full">
             <thead>
               <tr className="border-b border-border/50 bg-secondary/30">
                 <th className="text-left p-4 font-medium text-sm">Користувач</th>
                 <th className="text-left p-4 font-medium text-sm">Ранг</th>
                 <th className="text-left p-4 font-medium text-sm">Повідомлень</th>
                 <th className="text-left p-4 font-medium text-sm">Репутація</th>
                 <th className="text-right p-4 font-medium text-sm">Дії</th>
               </tr>
             </thead>
             <tbody>
               {isLoading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                   <tr key={i} className="border-b border-border/30">
                     <td className="p-4">
                       <div className="flex items-center gap-3">
                         <Skeleton className="h-10 w-10 rounded-full" />
                         <Skeleton className="h-4 w-32" />
                       </div>
                     </td>
                     <td className="p-4"><Skeleton className="h-6 w-20" /></td>
                     <td className="p-4"><Skeleton className="h-4 w-8" /></td>
                     <td className="p-4"><Skeleton className="h-4 w-8" /></td>
                     <td className="p-4"><Skeleton className="h-8 w-8 ml-auto" /></td>
                   </tr>
                 ))
               ) : filteredUsers.length > 0 ? (
                 filteredUsers.map((user) => (
                   <tr key={user.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                     <td className="p-4">
                       <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                           {user.avatar_url ? (
                             <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                           ) : (
                             <UserIcon className="h-5 w-5 text-muted-foreground" />
                           )}
                         </div>
                         <span className="font-medium">{user.username}</span>
                       </div>
                     </td>
                     <td className="p-4">
                       <RankBadge role={user.role} />
                     </td>
                     <td className="p-4 text-muted-foreground">{user.posts_count}</td>
                     <td className="p-4 text-muted-foreground">{user.reputation}</td>
                     <td className="p-4 text-right">
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon">
                             <MoreVertical className="h-4 w-4" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                           <DropdownMenuSub>
                             <DropdownMenuSubTrigger>
                               <Crown className="h-4 w-4 mr-2" />
                               Змінити ранг
                             </DropdownMenuSubTrigger>
                             <DropdownMenuSubContent>
                               {ALL_ROLES.map((role) => (
                                 <DropdownMenuItem
                                   key={role}
                                   onClick={() => changeUserRole(user.user_id, role)}
                                   disabled={!canChangeRole(role)}
                                   className="flex items-center justify-between"
                                 >
                                   <span>{ROLE_LABELS[role]}</span>
                                   {user.role === role && <Check className="h-4 w-4 ml-2" />}
                                 </DropdownMenuItem>
                               ))}
                             </DropdownMenuSubContent>
                           </DropdownMenuSub>
                         </DropdownMenuContent>
                       </DropdownMenu>
                     </td>
                   </tr>
                 ))
               ) : (
                 <tr>
                   <td colSpan={5} className="p-8 text-center text-muted-foreground">
                     {searchQuery ? 'Користувачів не знайдено' : 'Немає користувачів'}
                   </td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
       </div>
     </div>
   );
 }