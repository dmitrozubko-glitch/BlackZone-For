 import { useState, useEffect } from 'react';
 import { useParams, useNavigate, Link } from 'react-router-dom';
 import { ArrowLeft, Send } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Textarea } from '@/components/ui/textarea';
 import { Label } from '@/components/ui/label';
 import { Layout } from '@/components/forum/Layout';
 import { supabase } from '@/integrations/supabase/client';
 import type { ForumCategory } from '@/types/forum';
 import { useAuth } from '@/hooks/useAuth';
 import { toast } from 'sonner';
 
 export default function NewTopic() {
   const { categoryId } = useParams<{ categoryId: string }>();
   const [category, setCategory] = useState<ForumCategory | null>(null);
   const [title, setTitle] = useState('');
   const [content, setContent] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const { user } = useAuth();
   const navigate = useNavigate();
 
   useEffect(() => {
     if (!user) {
       navigate('/login');
       return;
     }
     if (categoryId) {
       fetchCategory();
     }
   }, [categoryId, user]);
 
   const fetchCategory = async () => {
     const { data } = await supabase
       .from('forum_categories')
       .select('*')
       .eq('id', categoryId)
       .maybeSingle();
 
     if (data) {
       setCategory(data as ForumCategory);
     }
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!user || !title.trim() || !content.trim()) return;
 
     setIsSubmitting(true);
 
     const { data, error } = await supabase
       .from('forum_topics')
       .insert({
         category_id: categoryId,
         author_id: user.id,
         title: title.trim(),
         content: content.trim(),
       })
       .select()
       .single();
 
     if (error) {
       toast.error('Помилка при створенні теми');
       setIsSubmitting(false);
       return;
     }
 
     toast.success('Тему створено');
     navigate(`/forum/topic/${data.id}`);
   };
 
   return (
     <Layout>
       <div className="container mx-auto px-4 py-8 max-w-3xl">
         {/* Breadcrumb */}
         <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
           <Link to="/forum" className="hover:text-primary transition-colors">
             Форум
           </Link>
           <span>/</span>
           <Link 
             to={`/forum/category/${categoryId}`} 
             className="hover:text-primary transition-colors"
           >
             {category?.name || 'Завантаження...'}
           </Link>
           <span>/</span>
           <span className="text-foreground">Нова тема</span>
         </div>
 
         {/* Header */}
         <div className="flex items-center gap-4 mb-8">
           <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
             <ArrowLeft className="h-5 w-5" />
           </Button>
           <h1 className="font-display text-2xl font-bold">Створити нову тему</h1>
         </div>
 
         {/* Form */}
         <form onSubmit={handleSubmit} className="space-y-6 p-6 rounded-xl border border-border/50 bg-card/50">
           <div className="space-y-2">
             <Label htmlFor="title">Заголовок теми</Label>
             <Input
               id="title"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               placeholder="Введіть заголовок..."
               required
               maxLength={200}
             />
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="content">Зміст</Label>
             <Textarea
               id="content"
               value={content}
               onChange={(e) => setContent(e.target.value)}
               placeholder="Напишіть ваше повідомлення..."
               rows={10}
               required
             />
           </div>
 
           <div className="flex items-center gap-4">
             <Button type="submit" disabled={isSubmitting || !title.trim() || !content.trim()}>
               <Send className="h-4 w-4 mr-2" />
               {isSubmitting ? 'Створення...' : 'Створити тему'}
             </Button>
             <Button type="button" variant="outline" onClick={() => navigate(-1)}>
               Скасувати
             </Button>
           </div>
         </form>
       </div>
     </Layout>
   );
 }