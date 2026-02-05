 import { Link } from 'react-router-dom';
 import { MessageSquare, FileText, Megaphone, BookOpen, Briefcase, Users, Gamepad2, Wrench, FileEdit, ShoppingCart, Theater, MessageCircle, Palette, Archive, LucideIcon } from 'lucide-react';
 import type { ForumCategory } from '@/types/forum';
 import { cn } from '@/lib/utils';
 
 const iconMap: Record<string, LucideIcon> = {
   megaphone: Megaphone,
   'book-open': BookOpen,
   briefcase: Briefcase,
   users: Users,
   'gamepad-2': Gamepad2,
   wrench: Wrench,
   'file-text': FileEdit,
   'shopping-cart': ShoppingCart,
   theater: Theater,
   'message-circle': MessageCircle,
   palette: Palette,
   archive: Archive,
 };
 
 interface CategoryCardProps {
   category: ForumCategory;
 }
 
 export function CategoryCard({ category }: CategoryCardProps) {
   const IconComponent = category.icon ? iconMap[category.icon] || MessageSquare : MessageSquare;
 
   return (
     <Link
       to={`/forum/category/${category.id}`}
       className={cn(
         "block p-4 rounded-lg border border-border/50 bg-card/50",
         "hover:border-primary/50 hover:bg-card transition-all duration-300",
         "group card-hover"
       )}
     >
       <div className="flex items-start gap-4">
         {/* Icon */}
         <div className="flex-shrink-0 p-3 rounded-lg bg-secondary/50 text-primary group-hover:bg-primary/10 transition-colors">
           <IconComponent className="h-6 w-6" />
         </div>
 
         {/* Content */}
         <div className="flex-1 min-w-0">
           <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
             {category.name}
           </h3>
           {category.description && (
             <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
               {category.description}
             </p>
           )}
         </div>
 
         {/* Stats */}
         <div className="hidden sm:flex flex-col items-end gap-1 text-sm text-muted-foreground">
           <div className="flex items-center gap-1">
             <FileText className="h-4 w-4" />
             <span>{category.topics_count} тем</span>
           </div>
           <div className="flex items-center gap-1">
             <MessageSquare className="h-4 w-4" />
             <span>{category.posts_count} відповідей</span>
           </div>
         </div>
       </div>
     </Link>
   );
 }