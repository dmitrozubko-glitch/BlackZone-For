 import { Link } from 'react-router-dom';
 import { MessageSquare, Eye, Pin, Lock, Clock, User } from 'lucide-react';
 import { formatDistanceToNow } from 'date-fns';
 import { uk } from 'date-fns/locale';
 import type { ForumTopic, Profile, AppRole } from '@/types/forum';
 import { RankBadge } from './RankBadge';
 import { cn } from '@/lib/utils';
 
 interface TopicCardProps {
   topic: ForumTopic & { author?: Profile & { role?: AppRole } };
 }
 
 export function TopicCard({ topic }: TopicCardProps) {
   return (
     <Link
       to={`/forum/topic/${topic.id}`}
       className={cn(
         "block p-4 rounded-lg border border-border/50 bg-card/30",
         "hover:border-primary/30 hover:bg-card/50 transition-all duration-300",
         topic.is_pinned && "border-l-4 border-l-primary bg-primary/5"
       )}
     >
       <div className="flex items-start gap-4">
         {/* Author Avatar */}
         <div className="hidden sm:flex flex-shrink-0">
           <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
             {topic.author?.avatar_url ? (
               <img src={topic.author.avatar_url} alt="" className="h-full w-full object-cover" />
             ) : (
               <User className="h-5 w-5 text-muted-foreground" />
             )}
           </div>
         </div>
 
         {/* Content */}
         <div className="flex-1 min-w-0">
           <div className="flex items-center gap-2 flex-wrap">
             {topic.is_pinned && (
               <Pin className="h-4 w-4 text-primary flex-shrink-0" />
             )}
             {topic.is_locked && (
               <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
             )}
             <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
               {topic.title}
             </h3>
           </div>
           
           <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
             <span className="flex items-center gap-1">
               <User className="h-3 w-3" />
               {topic.author?.username || 'Видалений'}
             </span>
             {topic.author?.role && (
               <RankBadge role={topic.author.role} size="sm" />
             )}
             <span className="flex items-center gap-1">
               <Clock className="h-3 w-3" />
               {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: uk })}
             </span>
           </div>
         </div>
 
         {/* Stats */}
         <div className="flex items-center gap-4 text-sm text-muted-foreground">
           <div className="flex items-center gap-1">
             <MessageSquare className="h-4 w-4" />
             <span>{topic.replies_count}</span>
           </div>
           <div className="flex items-center gap-1">
             <Eye className="h-4 w-4" />
             <span>{topic.views_count}</span>
           </div>
         </div>
       </div>
     </Link>
   );
 }