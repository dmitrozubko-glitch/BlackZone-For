 import { useState, useEffect } from 'react';
 import { Search, Pin, Lock, Trash2, Eye, EyeOff, MoreVertical } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { supabase } from '@/integrations/supabase/client';
 import type { ForumTopic, ForumCategory } from '@/types/forum';
 import { toast } from 'sonner';
 import { formatDistanceToNow } from 'date-fns';
 import { uk } from 'date-fns/locale';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 import { Skeleton } from '@/components/ui/skeleton';
 
 interface TopicWithCategory extends ForumTopic {
   category?: ForumCategory;
 }
 
 export default function TopicsManagement() {
   const [topics, setTopics] = useState<TopicWithCategory[]>([]);
   const [searchQuery, setSearchQuery] = useState('');
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
     fetchTopics();
   }, []);
 
   const fetchTopics = async () => {
     const { data: topicsData } = await supabase
       .from('forum_topics')
       .select('*')
       .order('created_at', { ascending: false })
       .limit(100);
 
     if (topicsData) {
       const categoryIds = [...new Set(topicsData.map(t => t.category_id))];
       const { data: categoriesData } = await supabase
         .from('forum_categories')
         .select('*')
         .in('id', categoryIds);
 
       const categoryMap = new Map(categoriesData?.map(c => [c.id, c]));
 
       const topicsWithCategories = topicsData.map(topic => ({
         ...topic,
         category: categoryMap.get(topic.category_id) as ForumCategory,
       }));
 
       setTopics(topicsWithCategories);
     }
     setIsLoading(false);
   };
 
   const togglePin = async (topic: ForumTopic) => {
     const { error } = await supabase
       .from('forum_topics')
       .update({ is_pinned: !topic.is_pinned })
       .eq('id', topic.id);
 
     if (!error) {
       toast.success(topic.is_pinned ? 'Тему відкріплено' : 'Тему закріплено');
       fetchTopics();
     }
   };
 
   const toggleLock = async (topic: ForumTopic) => {
     const { error } = await supabase
       .from('forum_topics')
       .update({ is_locked: !topic.is_locked })
       .eq('id', topic.id);
 
     if (!error) {
       toast.success(topic.is_locked ? 'Тему відкрито' : 'Тему закрито');
       fetchTopics();
     }
   };
 
   const toggleHidden = async (topic: ForumTopic) => {
     const { error } = await supabase
       .from('forum_topics')
       .update({ is_hidden: !topic.is_hidden })
       .eq('id', topic.id);
 
     if (!error) {
       toast.success(topic.is_hidden ? 'Тему показано' : 'Тему приховано');
       fetchTopics();
     }
   };
 
   const deleteTopic = async (id: string) => {
     if (!confirm('Ви впевнені? Тема та всі відповіді будуть видалені!')) return;
 
     const { error } = await supabase
       .from('forum_topics')
       .delete()
       .eq('id', id);
 
     if (error) {
       toast.error('Помилка видалення теми');
     } else {
       toast.success('Тему видалено');
       fetchTopics();
     }
   };
 
   const filteredTopics = topics.filter(topic =>
     topic.title.toLowerCase().includes(searchQuery.toLowerCase())
   );
 
   return (
     <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
           <h2 className="font-display text-xl font-bold mb-2">Теми</h2>
           <p className="text-muted-foreground">Модерація тем форуму</p>
         </div>
 
         <div className="relative w-full sm:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             placeholder="Пошук тем..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="pl-10"
           />
         </div>
       </div>
 
       {/* Topics List */}
       <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full">
             <thead>
               <tr className="border-b border-border/50 bg-secondary/30">
                 <th className="text-left p-4 font-medium text-sm">Тема</th>
                 <th className="text-left p-4 font-medium text-sm">Категорія</th>
                 <th className="text-left p-4 font-medium text-sm">Статус</th>
                 <th className="text-left p-4 font-medium text-sm">Дата</th>
                 <th className="text-right p-4 font-medium text-sm">Дії</th>
               </tr>
             </thead>
             <tbody>
               {isLoading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                   <tr key={i} className="border-b border-border/30">
                     <td className="p-4"><Skeleton className="h-5 w-48" /></td>
                     <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                     <td className="p-4"><Skeleton className="h-6 w-16" /></td>
                     <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                     <td className="p-4"><Skeleton className="h-8 w-8 ml-auto" /></td>
                   </tr>
                 ))
               ) : filteredTopics.length > 0 ? (
                 filteredTopics.map((topic) => (
                   <tr key={topic.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                     <td className="p-4">
                       <div className="flex items-center gap-2">
                         {topic.is_pinned && <Pin className="h-4 w-4 text-primary flex-shrink-0" />}
                         {topic.is_locked && <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                         {topic.is_hidden && <EyeOff className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                         <span className="font-medium truncate max-w-[250px]">{topic.title}</span>
                       </div>
                     </td>
                     <td className="p-4 text-sm text-muted-foreground">
                       {topic.category?.name || 'Без категорії'}
                     </td>
                     <td className="p-4">
                       <div className="flex items-center gap-1 text-xs">
                         <span className="text-muted-foreground">{topic.views_count} 👁</span>
                         <span className="text-muted-foreground">{topic.replies_count} 💬</span>
                       </div>
                     </td>
                     <td className="p-4 text-sm text-muted-foreground">
                       {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: uk })}
                     </td>
                     <td className="p-4 text-right">
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon">
                             <MoreVertical className="h-4 w-4" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => togglePin(topic)}>
                             <Pin className="h-4 w-4 mr-2" />
                             {topic.is_pinned ? 'Відкріпити' : 'Закріпити'}
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => toggleLock(topic)}>
                             <Lock className="h-4 w-4 mr-2" />
                             {topic.is_locked ? 'Відкрити' : 'Закрити'}
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => toggleHidden(topic)}>
                             {topic.is_hidden ? (
                               <><Eye className="h-4 w-4 mr-2" /> Показати</>
                             ) : (
                               <><EyeOff className="h-4 w-4 mr-2" /> Приховати</>
                             )}
                           </DropdownMenuItem>
                           <DropdownMenuSeparator />
                           <DropdownMenuItem
                             onClick={() => deleteTopic(topic.id)}
                             className="text-destructive"
                           >
                             <Trash2 className="h-4 w-4 mr-2" />
                             Видалити
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                     </td>
                   </tr>
                 ))
               ) : (
                 <tr>
                   <td colSpan={5} className="p-8 text-center text-muted-foreground">
                     {searchQuery ? 'Теми не знайдено' : 'Немає тем'}
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