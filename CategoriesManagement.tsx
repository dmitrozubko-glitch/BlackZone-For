 import { useState, useEffect } from 'react';
 import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Textarea } from '@/components/ui/textarea';
 import { Label } from '@/components/ui/label';
 import { Switch } from '@/components/ui/switch';
 import { supabase } from '@/integrations/supabase/client';
 import type { ForumCategory } from '@/types/forum';
 import { toast } from 'sonner';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
 } from '@/components/ui/dialog';
 import { Skeleton } from '@/components/ui/skeleton';
 
 export default function CategoriesManagement() {
   const [categories, setCategories] = useState<ForumCategory[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(null);
   const [formData, setFormData] = useState({
     name: '',
     description: '',
     icon: '',
     is_visible: true,
   });
 
   useEffect(() => {
     fetchCategories();
   }, []);
 
   const fetchCategories = async () => {
     const { data } = await supabase
       .from('forum_categories')
       .select('*')
       .order('sort_order', { ascending: true });
 
     if (data) {
       setCategories(data as ForumCategory[]);
     }
     setIsLoading(false);
   };
 
   const openCreateDialog = () => {
     setEditingCategory(null);
     setFormData({ name: '', description: '', icon: '', is_visible: true });
     setIsDialogOpen(true);
   };
 
   const openEditDialog = (category: ForumCategory) => {
     setEditingCategory(category);
     setFormData({
       name: category.name,
       description: category.description || '',
       icon: category.icon || '',
       is_visible: category.is_visible,
     });
     setIsDialogOpen(true);
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (!formData.name.trim()) {
       toast.error('Введіть назву категорії');
       return;
     }
 
     if (editingCategory) {
       const { error } = await supabase
         .from('forum_categories')
         .update({
           name: formData.name,
           description: formData.description || null,
           icon: formData.icon || null,
           is_visible: formData.is_visible,
         })
         .eq('id', editingCategory.id);
 
       if (error) {
         toast.error('Помилка оновлення категорії');
       } else {
         toast.success('Категорію оновлено');
         fetchCategories();
         setIsDialogOpen(false);
       }
     } else {
       const maxSortOrder = Math.max(...categories.map(c => c.sort_order), 0);
       
       const { error } = await supabase
         .from('forum_categories')
         .insert({
           name: formData.name,
           description: formData.description || null,
           icon: formData.icon || null,
           is_visible: formData.is_visible,
           sort_order: maxSortOrder + 1,
         });
 
       if (error) {
         toast.error('Помилка створення категорії');
       } else {
         toast.success('Категорію створено');
         fetchCategories();
         setIsDialogOpen(false);
       }
     }
   };
 
   const deleteCategory = async (id: string) => {
     if (!confirm('Ви впевнені? Всі теми в цій категорії будуть видалені!')) return;
 
     const { error } = await supabase
       .from('forum_categories')
       .delete()
       .eq('id', id);
 
     if (error) {
       toast.error('Помилка видалення категорії');
     } else {
       toast.success('Категорію видалено');
       fetchCategories();
     }
   };
 
   const toggleVisibility = async (category: ForumCategory) => {
     const { error } = await supabase
       .from('forum_categories')
       .update({ is_visible: !category.is_visible })
       .eq('id', category.id);
 
     if (!error) {
       toast.success(category.is_visible ? 'Категорію приховано' : 'Категорію показано');
       fetchCategories();
     }
   };
 
   return (
     <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
           <h2 className="font-display text-xl font-bold mb-2">Категорії</h2>
           <p className="text-muted-foreground">Управління розділами форуму</p>
         </div>
 
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
           <DialogTrigger asChild>
             <Button onClick={openCreateDialog}>
               <Plus className="h-4 w-4 mr-2" />
               Нова категорія
             </Button>
           </DialogTrigger>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>
                 {editingCategory ? 'Редагувати категорію' : 'Нова категорія'}
               </DialogTitle>
             </DialogHeader>
             <form onSubmit={handleSubmit} className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="name">Назва</Label>
                 <Input
                   id="name"
                   value={formData.name}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                   placeholder="Назва категорії"
                   required
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="description">Опис</Label>
                 <Textarea
                   id="description"
                   value={formData.description}
                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                   placeholder="Короткий опис категорії"
                   rows={3}
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="icon">Іконка (назва lucide icon)</Label>
                 <Input
                   id="icon"
                   value={formData.icon}
                   onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                   placeholder="message-circle"
                 />
               </div>
               <div className="flex items-center justify-between">
                 <Label htmlFor="visible">Видима</Label>
                 <Switch
                   id="visible"
                   checked={formData.is_visible}
                   onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                 />
               </div>
               <div className="flex gap-2 justify-end">
                 <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                   Скасувати
                 </Button>
                 <Button type="submit">
                   {editingCategory ? 'Зберегти' : 'Створити'}
                 </Button>
               </div>
             </form>
           </DialogContent>
         </Dialog>
       </div>
 
       {/* Categories List */}
       <div className="space-y-3">
         {isLoading ? (
           Array.from({ length: 5 }).map((_, i) => (
             <div key={i} className="p-4 rounded-xl border border-border/50 bg-card/50">
               <div className="flex items-center gap-4">
                 <Skeleton className="h-6 w-6" />
                 <div className="flex-1 space-y-2">
                   <Skeleton className="h-5 w-48" />
                   <Skeleton className="h-4 w-72" />
                 </div>
               </div>
             </div>
           ))
         ) : categories.length > 0 ? (
           categories.map((category) => (
             <div
               key={category.id}
               className={`p-4 rounded-xl border bg-card/50 transition-colors ${
                 category.is_visible ? 'border-border/50' : 'border-border/30 opacity-60'
               }`}
             >
               <div className="flex items-center gap-4">
                 <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                 
                 <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2">
                     <h3 className="font-medium">{category.name}</h3>
                     {!category.is_visible && (
                       <EyeOff className="h-4 w-4 text-muted-foreground" />
                     )}
                   </div>
                   {category.description && (
                     <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                   )}
                   <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                     <span>{category.topics_count} тем</span>
                     <span>{category.posts_count} повідомлень</span>
                   </div>
                 </div>
 
                 <div className="flex items-center gap-2">
                   <Button
                     variant="ghost"
                     size="icon"
                     onClick={() => toggleVisibility(category)}
                   >
                     {category.is_visible ? (
                       <Eye className="h-4 w-4" />
                     ) : (
                       <EyeOff className="h-4 w-4" />
                     )}
                   </Button>
                   <Button
                     variant="ghost"
                     size="icon"
                     onClick={() => openEditDialog(category)}
                   >
                     <Edit className="h-4 w-4" />
                   </Button>
                   <Button
                     variant="ghost"
                     size="icon"
                     onClick={() => deleteCategory(category.id)}
                     className="text-destructive hover:text-destructive"
                   >
                     <Trash2 className="h-4 w-4" />
                   </Button>
                 </div>
               </div>
             </div>
           ))
         ) : (
           <div className="text-center py-12 text-muted-foreground">
             Немає категорій
           </div>
         )}
       </div>
     </div>
   );
 }