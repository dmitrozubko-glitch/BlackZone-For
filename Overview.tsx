 import { useState, useEffect } from 'react';
 import { Users, MessageSquare, FileText, FolderOpen, TrendingUp, Activity } from 'lucide-react';
 import { supabase } from '@/integrations/supabase/client';
 
 interface Stats {
   usersCount: number;
   topicsCount: number;
   postsCount: number;
   categoriesCount: number;
 }
 
 export default function AdminOverview() {
   const [stats, setStats] = useState<Stats>({
     usersCount: 0,
     topicsCount: 0,
     postsCount: 0,
     categoriesCount: 0,
   });
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
     fetchStats();
   }, []);
 
   const fetchStats = async () => {
     const [users, topics, posts, categories] = await Promise.all([
       supabase.from('profiles').select('id', { count: 'exact', head: true }),
       supabase.from('forum_topics').select('id', { count: 'exact', head: true }),
       supabase.from('forum_posts').select('id', { count: 'exact', head: true }),
       supabase.from('forum_categories').select('id', { count: 'exact', head: true }),
     ]);
 
     setStats({
       usersCount: users.count || 0,
       topicsCount: topics.count || 0,
       postsCount: posts.count || 0,
       categoriesCount: categories.count || 0,
     });
     setIsLoading(false);
   };
 
   const statCards = [
     { label: 'Користувачі', value: stats.usersCount, icon: Users, color: 'text-blue-400' },
     { label: 'Теми', value: stats.topicsCount, icon: FileText, color: 'text-green-400' },
     { label: 'Повідомлення', value: stats.postsCount, icon: MessageSquare, color: 'text-purple-400' },
     { label: 'Категорії', value: stats.categoriesCount, icon: FolderOpen, color: 'text-orange-400' },
   ];
 
   return (
     <div className="space-y-6">
       <div>
         <h2 className="font-display text-xl font-bold mb-2">Огляд</h2>
         <p className="text-muted-foreground">Загальна статистика форуму</p>
       </div>
 
       {/* Stats Grid */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         {statCards.map((stat) => (
           <div
             key={stat.label}
             className="p-6 rounded-xl border border-border/50 bg-card/50 hover:border-primary/30 transition-colors"
           >
             <div className="flex items-center gap-4">
               <div className={`p-3 rounded-lg bg-secondary/50 ${stat.color}`}>
                 <stat.icon className="h-6 w-6" />
               </div>
               <div>
                 <p className="text-2xl font-bold">
                   {isLoading ? '...' : stat.value}
                 </p>
                 <p className="text-sm text-muted-foreground">{stat.label}</p>
               </div>
             </div>
           </div>
         ))}
       </div>
 
       {/* Quick Actions */}
       <div className="p-6 rounded-xl border border-border/50 bg-card/50">
         <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
           <Activity className="h-5 w-5 text-primary" />
           Швидкі дії
         </h3>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
           <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
             <p className="font-medium">Керування користувачами</p>
             <p className="text-muted-foreground mt-1">Призначення рангів, модерація акаунтів</p>
           </div>
           <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
             <p className="font-medium">Керування категоріями</p>
             <p className="text-muted-foreground mt-1">Створення, редагування, видалення категорій</p>
           </div>
           <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
             <p className="font-medium">Модерація тем</p>
             <p className="text-muted-foreground mt-1">Закріплення, закриття, видалення тем</p>
           </div>
           <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
             <p className="font-medium">Налаштування форуму</p>
             <p className="text-muted-foreground mt-1">Загальні налаштування сайту</p>
           </div>
         </div>
       </div>
     </div>
   );
 }