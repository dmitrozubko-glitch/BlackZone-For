 import { cn } from '@/lib/utils';
 import type { AppRole } from '@/types/forum';
 import { ROLE_LABELS, ROLE_COLORS } from '@/types/forum';
 
 interface RankBadgeProps {
   role: AppRole;
   size?: 'sm' | 'md' | 'lg';
   className?: string;
 }
 
 export function RankBadge({ role, size = 'md', className }: RankBadgeProps) {
   const sizeClasses = {
     sm: 'px-1.5 py-0.5 text-[10px]',
     md: 'px-2 py-1 text-xs',
     lg: 'px-3 py-1.5 text-sm',
   };
 
   return (
     <span
       className={cn(
         'inline-flex items-center rounded-md font-semibold uppercase tracking-wider',
         ROLE_COLORS[role],
         sizeClasses[size],
         className
       )}
     >
       {ROLE_LABELS[role]}
     </span>
   );
 }