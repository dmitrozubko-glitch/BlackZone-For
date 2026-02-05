 import { Crown, Shield, Star, HeartHandshake, Gem, User } from 'lucide-react';
 import type { AppRole } from '@/types/forum';
 import { ROLE_LABELS } from '@/types/forum';
 import { RankBadge } from '@/components/forum/RankBadge';
 
 interface RoleInfo {
   role: AppRole;
   icon: React.ReactNode;
   description: string;
   permissions: string[];
 }
 
 const rolesInfo: RoleInfo[] = [
   {
     role: 'owner',
     icon: <Crown className="h-6 w-6" />,
     description: 'Повний контроль над форумом та сервером',
     permissions: [
       'Призначення всіх рангів включно з адміністраторами',
       'Управління налаштуваннями форуму',
       'Видалення будь-яких даних',
       'Доступ до всіх функцій адмін панелі',
     ],
   },
   {
     role: 'admin',
     icon: <Shield className="h-6 w-6" />,
     description: 'Адміністратор з широкими правами',
     permissions: [
       'Призначення рангів (крім owner та admin)',
       'Управління категоріями',
       'Модерація всіх тем та повідомлень',
       'Бан користувачів',
     ],
   },
   {
     role: 'moderator',
     icon: <Star className="h-6 w-6" />,
     description: 'Модератор форуму',
     permissions: [
       'Закріплення та закриття тем',
       'Приховання та видалення повідомлень',
       'Попередження користувачів',
       'Перенесення тем між категоріями',
     ],
   },
   {
     role: 'support',
     icon: <HeartHandshake className="h-6 w-6" />,
     description: 'Технічна підтримка',
     permissions: [
       'Відповіді на скарги та запити',
       'Закриття тем підтримки',
       'Доступ до адмін панелі (обмежений)',
     ],
   },
   {
     role: 'vip',
     icon: <Gem className="h-6 w-6" />,
     description: 'VIP користувач',
     permissions: [
       'Особливий бейдж на профілі',
       'Доступ до VIP розділів',
       'Розширені можливості підпису',
     ],
   },
   {
     role: 'member',
     icon: <User className="h-6 w-6" />,
     description: 'Звичайний учасник форуму',
     permissions: [
       'Створення тем та відповідей',
       'Редагування власних повідомлень',
       'Лайки та репутація',
     ],
   },
 ];
 
 export default function RolesManagement() {
   return (
     <div className="space-y-6">
       <div>
         <h2 className="font-display text-xl font-bold mb-2">Система рангів</h2>
         <p className="text-muted-foreground">Опис рангів та їх можливостей</p>
       </div>
 
       <div className="grid gap-4">
         {rolesInfo.map((info) => (
           <div
             key={info.role}
             className="p-6 rounded-xl border border-border/50 bg-card/50 hover:border-primary/30 transition-colors"
           >
             <div className="flex items-start gap-4">
               <div className={`p-3 rounded-xl ${info.role}-gradient text-foreground`}>
                 {info.icon}
               </div>
               
               <div className="flex-1">
                 <div className="flex items-center gap-3 mb-2">
                   <h3 className="font-display text-lg font-semibold">{ROLE_LABELS[info.role]}</h3>
                   <RankBadge role={info.role} />
                 </div>
                 <p className="text-muted-foreground mb-4">{info.description}</p>
                 
                 <div>
                   <h4 className="text-sm font-medium mb-2">Можливості:</h4>
                   <ul className="space-y-1">
                     {info.permissions.map((perm, i) => (
                       <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                         <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                         {perm}
                       </li>
                     ))}
                   </ul>
                 </div>
               </div>
             </div>
           </div>
         ))}
       </div>
     </div>
   );
 }