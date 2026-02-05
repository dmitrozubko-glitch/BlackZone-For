 import { useState, useEffect } from 'react';
 import { Plus, Search } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Layout } from '@/components/forum/Layout';
 import { CategoryCard } from '@/components/forum/CategoryCard';
 import { supabase } from '@/integrations/supabase/client';
 import type { ForumCategory } from '@/types/forum';
 import { useAuth } from '@/hooks/useAuth';
 import { Link } from 'react-router-dom';
 import { Skeleton } from '@/components/ui/skeleton';
 
 export default function Forum() {
   const [categories, setCategories] = useState<ForumCategory[]>([]);
   const [searchQuery, setSearchQuery] = useState('');
   const [isLoading, setIsLoading] = useState(true);
   const { user } = useAuth();
 
   useEffect(() => {
     fetchCategories();
   }, []);
 
   const fetchCategories = async () => {
     const { data, error } = await supabase
       .from('forum_categories')
       .select('*')
       .is('parent_id', null)
       .order('sort_order', { ascending: true });
 
     if (!error && data) {
       setCategories(data as ForumCategory[]);
     }
     setIsLoading(false);
   };
 
   const filteredCategories = categories.filter(cat =>
     cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
   );
 
   return (
     <Layout>
       <div className="container mx-auto px-4 py-8">
         {/* Header */}
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
           <div>
             <h1 className="font-display text-3xl font-bold text-glow-sm">Форум</h1>
             <p className="text-muted-foreground mt-1">Спільнота BlackZone RP</p>
           </div>
 
           <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="relative flex-1 sm:flex-initial">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input
                 placeholder="Пошук категорій..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="pl-10 w-full sm:w-64"
               />
             </div>
           </div>
         </div>
 
         {/* Categories */}
         <div className="space-y-4">
           {isLoading ? (
             Array.from({ length: 6 }).map((_, i) => (
               <div key={i} className="p-4 rounded-lg border border-border/50 bg-card/50">
                 <div className="flex items-start gap-4">
                   <Skeleton className="h-12 w-12 rounded-lg" />
                   <div className="flex-1 space-y-2">
                     <Skeleton className="h-6 w-48" />
                     <Skeleton className="h-4 w-72" />
                   </div>
                 </div>
               </div>
             ))
           ) : filteredCategories.length > 0 ? (
             filteredCategories.map(category => (
               <CategoryCard key={category.id} category={category} />
             ))
           ) : (
             <div className="text-center py-12 text-muted-foreground">
               {searchQuery ? 'Категорії не знайдено' : 'Немає категорій'}
             </div>
           )}
         </div>
       </div>
     </Layout>
   );
 }