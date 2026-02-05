 import { useState, useEffect } from 'react';
 import { useParams, Link, useNavigate } from 'react-router-dom';
 import { ArrowLeft, Plus, Search, MessageSquare } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Layout } from '@/components/forum/Layout';
 import { TopicCard } from '@/components/forum/TopicCard';
 import { supabase } from '@/integrations/supabase/client';
 import type { ForumCategory, ForumTopic, Profile, AppRole } from '@/types/forum';
 import { useAuth } from '@/hooks/useAuth';
 import { Skeleton } from '@/components/ui/skeleton';
 
 export default function Category() {
   const { id } = useParams<{ id: string }>();
   const [category, setCategory] = useState<ForumCategory | null>(null);
   const [topics, setTopics] = useState<(ForumTopic & { author?: Profile & { role?: AppRole } })[]>([]);
   const [searchQuery, setSearchQuery] = useState('');
   const [isLoading, setIsLoading] = useState(true);
   const { user } = useAuth();
   const navigate = useNavigate();
 
   useEffect(() => {
     if (id) {
       fetchCategory();
       fetchTopics();
     }
   }, [id]);
 
   const fetchCategory = async () => {
     const { data } = await supabase
       .from('forum_categories')
       .select('*')
       .eq('id', id)
       .maybeSingle();
 
     if (data) {
       setCategory(data as ForumCategory);
     }
   };
 
   const fetchTopics = async () => {
     // First fetch topics
     const { data: topicsData } = await supabase
       .from('forum_topics')
       .select('*')
       .eq('category_id', id)
       .order('is_pinned', { ascending: false })
       .order('created_at', { ascending: false });
 
     if (topicsData && topicsData.length > 0) {
       // Then fetch profiles for authors
       const authorIds = topicsData.map(t => t.author_id).filter(Boolean) as string[];
       
       const { data: profilesData } = await supabase
         .from('profiles')
         .select('*')
         .in('user_id', authorIds);
 
       const { data: rolesData } = await supabase
         .from('user_roles')
         .select('user_id, role')
         .in('user_id', authorIds);
 
       const profileMap = new Map(profilesData?.map(p => [p.user_id, p]));
       const roleMap = new Map(rolesData?.map(r => [r.user_id, r.role]));
 
       const topicsWithAuthors = topicsData.map(topic => ({
         ...topic,
         author: topic.author_id ? {
           ...profileMap.get(topic.author_id),
           role: roleMap.get(topic.author_id) as AppRole || 'member'
         } : undefined
       }));
 
       setTopics(topicsWithAuthors as (ForumTopic & { author?: Profile & { role?: AppRole } })[]);
     } else {
       setTopics([]);
     }
     setIsLoading(false);
   };
 
   const filteredTopics = topics.filter(topic =>
     topic.title.toLowerCase().includes(searchQuery.toLowerCase())
   );
 
   return (
     <Layout>
       <div className="container mx-auto px-4 py-8">
         {/* Breadcrumb */}
         <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
           <Link to="/forum" className="hover:text-primary transition-colors">
             Форум
           </Link>
           <span>/</span>
           <span className="text-foreground">{category?.name || 'Завантаження...'}</span>
         </div>
 
         {/* Header */}
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
           <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => navigate('/forum')}>
               <ArrowLeft className="h-5 w-5" />
             </Button>
             <div>
               <h1 className="font-display text-2xl font-bold">{category?.name}</h1>
               {category?.description && (
                 <p className="text-muted-foreground mt-1">{category.description}</p>
               )}
             </div>
           </div>
 
           <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="relative flex-1 sm:flex-initial">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input
                 placeholder="Пошук тем..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="pl-10 w-full sm:w-64"
               />
             </div>
             {user && (
               <Button asChild>
                 <Link to={`/forum/category/${id}/new-topic`}>
                   <Plus className="h-4 w-4 mr-2" />
                   Нова тема
                 </Link>
               </Button>
             )}
           </div>
         </div>
 
         {/* Topics */}
         <div className="space-y-3">
           {isLoading ? (
             Array.from({ length: 5 }).map((_, i) => (
               <div key={i} className="p-4 rounded-lg border border-border/50 bg-card/30">
                 <div className="flex items-start gap-4">
                   <Skeleton className="h-10 w-10 rounded-full" />
                   <div className="flex-1 space-y-2">
                     <Skeleton className="h-5 w-72" />
                     <Skeleton className="h-4 w-48" />
                   </div>
                 </div>
               </div>
             ))
           ) : filteredTopics.length > 0 ? (
             filteredTopics.map(topic => (
               <TopicCard key={topic.id} topic={topic} />
             ))
           ) : (
             <div className="text-center py-12">
               <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
               <p className="text-muted-foreground">
                 {searchQuery ? 'Теми не знайдено' : 'У цій категорії ще немає тем'}
               </p>
               {user && !searchQuery && (
                 <Button className="mt-4" asChild>
                   <Link to={`/forum/category/${id}/new-topic`}>
                     <Plus className="h-4 w-4 mr-2" />
                     Створити першу тему
                   </Link>
                 </Button>
               )}
             </div>
           )}
         </div>
       </div>
     </Layout>
   );
 }