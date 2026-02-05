 import { useState, useEffect } from 'react';
 import { useParams, Link, useNavigate } from 'react-router-dom';
 import { ArrowLeft, Send, Pin, Lock, User, Clock } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Textarea } from '@/components/ui/textarea';
 import { Layout } from '@/components/forum/Layout';
 import { RankBadge } from '@/components/forum/RankBadge';
 import { supabase } from '@/integrations/supabase/client';
 import type { ForumTopic, ForumPost, ForumCategory, Profile, AppRole } from '@/types/forum';
 import { useAuth } from '@/hooks/useAuth';
 import { format } from 'date-fns';
 import { uk } from 'date-fns/locale';
 import { toast } from 'sonner';
 import { Skeleton } from '@/components/ui/skeleton';
 
 interface PostWithAuthor extends ForumPost {
   author?: Profile & { role?: AppRole };
 }
 
 interface TopicWithDetails extends ForumTopic {
   author?: Profile & { role?: AppRole };
   category?: ForumCategory;
 }
 
 export default function Topic() {
   const { id } = useParams<{ id: string }>();
   const [topic, setTopic] = useState<TopicWithDetails | null>(null);
   const [posts, setPosts] = useState<PostWithAuthor[]>([]);
   const [replyContent, setReplyContent] = useState('');
   const [isLoading, setIsLoading] = useState(true);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const { user, isStaff } = useAuth();
   const navigate = useNavigate();
 
   useEffect(() => {
     if (id) {
       fetchTopic();
       fetchPosts();
       incrementViews();
     }
   }, [id]);
 
   const fetchTopic = async () => {
     // Fetch topic
     const { data: topicData } = await supabase
       .from('forum_topics')
       .select('*')
       .eq('id', id)
       .maybeSingle();
 
     if (topicData) {
       // Fetch category
       const { data: categoryData } = await supabase
         .from('forum_categories')
         .select('*')
         .eq('id', topicData.category_id)
         .maybeSingle();
 
       // Fetch author profile
       let authorData: (Profile & { role?: AppRole }) | undefined;
       if (topicData.author_id) {
         const { data: profileData } = await supabase
           .from('profiles')
           .select('*')
           .eq('user_id', topicData.author_id)
           .maybeSingle();
         
         const { data: roleData } = await supabase
           .from('user_roles')
           .select('role')
           .eq('user_id', topicData.author_id)
           .maybeSingle();
 
         if (profileData) {
           authorData = {
             ...profileData,
             role: (roleData?.role as AppRole) || 'member'
           } as Profile & { role?: AppRole };
         }
       }
 
       setTopic({
         ...topicData,
         author: authorData,
         category: categoryData as ForumCategory
       } as TopicWithDetails);
     }
     setIsLoading(false);
   };
 
   const fetchPosts = async () => {
     const { data: postsData } = await supabase
       .from('forum_posts')
       .select('*')
       .eq('topic_id', id)
       .order('created_at', { ascending: true });
 
     if (postsData && postsData.length > 0) {
       const authorIds = postsData.map(p => p.author_id).filter(Boolean) as string[];
       
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
 
       const postsWithAuthors = postsData.map(post => ({
         ...post,
         author: post.author_id ? {
           ...profileMap.get(post.author_id),
           role: roleMap.get(post.author_id) as AppRole || 'member'
         } : undefined
       }));
 
       setPosts(postsWithAuthors as PostWithAuthor[]);
     } else {
       setPosts([]);
     }
   };
 
   const incrementViews = async () => {
     // Use raw SQL call to increment views
     await supabase
       .from('forum_topics')
       .update({ views_count: (topic?.views_count || 0) + 1 })
       .eq('id', id);
   };
 
   const handleSubmitReply = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!user || !replyContent.trim() || topic?.is_locked) return;
 
     setIsSubmitting(true);
 
     const { error } = await supabase
       .from('forum_posts')
       .insert({
         topic_id: id,
         author_id: user.id,
         content: replyContent.trim(),
       });
 
     if (error) {
       toast.error('Помилка при створенні відповіді');
     } else {
       toast.success('Відповідь додано');
       setReplyContent('');
       fetchPosts();
     }
 
     setIsSubmitting(false);
   };
 
   const togglePin = async () => {
     if (!topic || !isStaff) return;
     
     const { error } = await supabase
       .from('forum_topics')
       .update({ is_pinned: !topic.is_pinned })
       .eq('id', id);
 
     if (!error) {
       setTopic({ ...topic, is_pinned: !topic.is_pinned });
       toast.success(topic.is_pinned ? 'Тему відкріплено' : 'Тему закріплено');
     }
   };
 
   const toggleLock = async () => {
     if (!topic || !isStaff) return;
     
     const { error } = await supabase
       .from('forum_topics')
       .update({ is_locked: !topic.is_locked })
       .eq('id', id);
 
     if (!error) {
       setTopic({ ...topic, is_locked: !topic.is_locked });
       toast.success(topic.is_locked ? 'Тему відкрито' : 'Тему закрито');
     }
   };
 
   if (isLoading) {
     return (
       <Layout>
         <div className="container mx-auto px-4 py-8">
           <Skeleton className="h-8 w-48 mb-6" />
           <Skeleton className="h-64 w-full rounded-lg" />
         </div>
       </Layout>
     );
   }
 
   if (!topic) {
     return (
       <Layout>
         <div className="container mx-auto px-4 py-8 text-center">
           <h1 className="text-2xl font-bold mb-4">Тему не знайдено</h1>
           <Button onClick={() => navigate('/forum')}>Повернутися до форуму</Button>
         </div>
       </Layout>
     );
   }
 
   return (
     <Layout>
       <div className="container mx-auto px-4 py-8">
         {/* Breadcrumb */}
         <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
           <Link to="/forum" className="hover:text-primary transition-colors">
             Форум
           </Link>
           <span>/</span>
           <Link 
             to={`/forum/category/${topic.category?.id}`} 
             className="hover:text-primary transition-colors"
           >
             {topic.category?.name}
           </Link>
           <span>/</span>
           <span className="text-foreground truncate max-w-[200px]">{topic.title}</span>
         </div>
 
         {/* Topic Header */}
         <div className="flex items-start justify-between gap-4 mb-6">
           <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => navigate(`/forum/category/${topic.category?.id}`)}>
               <ArrowLeft className="h-5 w-5" />
             </Button>
             <div>
               <div className="flex items-center gap-2 flex-wrap">
                 {topic.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                 {topic.is_locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                 <h1 className="font-display text-xl sm:text-2xl font-bold">{topic.title}</h1>
               </div>
             </div>
           </div>
 
           {isStaff && (
             <div className="flex items-center gap-2">
               <Button variant="outline" size="sm" onClick={togglePin}>
                 <Pin className="h-4 w-4 mr-1" />
                 {topic.is_pinned ? 'Відкріпити' : 'Закріпити'}
               </Button>
               <Button variant="outline" size="sm" onClick={toggleLock}>
                 <Lock className="h-4 w-4 mr-1" />
                 {topic.is_locked ? 'Відкрити' : 'Закрити'}
               </Button>
             </div>
           )}
         </div>
 
         {/* Original Post */}
         <div className="rounded-lg border border-border/50 bg-card/50 mb-6 overflow-hidden">
           <div className="flex flex-col sm:flex-row">
             {/* Author sidebar */}
             <div className="sm:w-48 p-4 bg-secondary/30 flex sm:flex-col items-center sm:items-start gap-4 sm:gap-2">
               <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                 {topic.author?.avatar_url ? (
                   <img src={topic.author.avatar_url} alt="" className="h-full w-full object-cover" />
                 ) : (
                   <User className="h-8 w-8 text-muted-foreground" />
                 )}
               </div>
               <div className="sm:text-center">
                 <p className="font-semibold">{topic.author?.username || 'Видалений'}</p>
                 {topic.author?.role && <RankBadge role={topic.author.role} size="sm" className="mt-1" />}
                 <p className="text-xs text-muted-foreground mt-2">
                   Повідомлень: {topic.author?.posts_count || 0}
                 </p>
               </div>
             </div>
 
             {/* Content */}
             <div className="flex-1 p-4">
               <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                 <Clock className="h-3 w-3" />
                 <span>{format(new Date(topic.created_at), 'dd.MM.yyyy HH:mm', { locale: uk })}</span>
               </div>
               <div className="prose prose-invert max-w-none">
                 <p className="whitespace-pre-wrap">{topic.content}</p>
               </div>
             </div>
           </div>
         </div>
 
         {/* Replies */}
         {posts.length > 0 && (
           <div className="space-y-4 mb-8">
             <h2 className="font-display text-lg font-semibold">Відповіді ({posts.length})</h2>
             {posts.map((post) => (
               <div key={post.id} className="rounded-lg border border-border/50 bg-card/30 overflow-hidden">
                 <div className="flex flex-col sm:flex-row">
                   {/* Author sidebar */}
                   <div className="sm:w-48 p-4 bg-secondary/20 flex sm:flex-col items-center sm:items-start gap-4 sm:gap-2">
                     <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                       {post.author?.avatar_url ? (
                         <img src={post.author.avatar_url} alt="" className="h-full w-full object-cover" />
                       ) : (
                         <User className="h-6 w-6 text-muted-foreground" />
                       )}
                     </div>
                     <div>
                       <p className="font-medium text-sm">{post.author?.username || 'Видалений'}</p>
                       {post.author?.role && <RankBadge role={post.author.role} size="sm" className="mt-1" />}
                     </div>
                   </div>
 
                   {/* Content */}
                   <div className="flex-1 p-4">
                     <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                       <Clock className="h-3 w-3" />
                       <span>{format(new Date(post.created_at), 'dd.MM.yyyy HH:mm', { locale: uk })}</span>
                     </div>
                     <p className="whitespace-pre-wrap text-sm">{post.content}</p>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         )}
 
         {/* Reply Form */}
         {user && !topic.is_locked ? (
           <form onSubmit={handleSubmitReply} className="rounded-lg border border-border/50 bg-card/50 p-4">
             <h3 className="font-display text-lg font-semibold mb-4">Написати відповідь</h3>
             <Textarea
               value={replyContent}
               onChange={(e) => setReplyContent(e.target.value)}
               placeholder="Ваша відповідь..."
               rows={4}
               className="mb-4"
               required
             />
             <Button type="submit" disabled={isSubmitting || !replyContent.trim()}>
               <Send className="h-4 w-4 mr-2" />
               {isSubmitting ? 'Відправка...' : 'Відправити'}
             </Button>
           </form>
         ) : topic.is_locked ? (
           <div className="rounded-lg border border-border/50 bg-card/50 p-6 text-center">
             <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
             <p className="text-muted-foreground">Ця тема закрита для відповідей</p>
           </div>
         ) : (
           <div className="rounded-lg border border-border/50 bg-card/50 p-6 text-center">
             <p className="text-muted-foreground">
               <Link to="/login" className="text-primary hover:underline">Увійдіть</Link>
               {' '}щоб залишити відповідь
             </p>
           </div>
         )}
       </div>
     </Layout>
   );
 }