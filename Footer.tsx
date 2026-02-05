 import { Link } from 'react-router-dom';
 import { Shield, MessageCircle, Users, Activity } from 'lucide-react';
 
 export function Footer() {
   return (
     <footer className="border-t border-border/50 bg-card/50 mt-auto">
       <div className="container mx-auto px-4 py-8">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           {/* Logo & Description */}
           <div className="md:col-span-2">
             <Link to="/" className="flex items-center gap-3 mb-4">
               <Shield className="h-8 w-8 text-primary" />
               <span className="font-display text-xl font-bold">
                 BLACK<span className="text-primary">ZONE</span> RP
               </span>
             </Link>
             <p className="text-sm text-muted-foreground max-w-md">
               Найкращий український GTA V RP сервер. Приєднуйся до нас та створи свою унікальну історію у віртуальному світі.
             </p>
           </div>
 
           {/* Quick Links */}
           <div>
             <h3 className="font-display text-sm font-semibold mb-4 text-primary">Навігація</h3>
             <ul className="space-y-2 text-sm">
               <li>
                 <Link to="/forum" className="text-muted-foreground hover:text-primary transition-colors">
                   Форум
                 </Link>
               </li>
               <li>
                 <Link to="/members" className="text-muted-foreground hover:text-primary transition-colors">
                   Учасники
                 </Link>
               </li>
               <li>
                 <Link to="/rules" className="text-muted-foreground hover:text-primary transition-colors">
                   Правила
                 </Link>
               </li>
             </ul>
           </div>
 
           {/* Stats */}
           <div>
             <h3 className="font-display text-sm font-semibold mb-4 text-primary">Статистика</h3>
             <ul className="space-y-2 text-sm text-muted-foreground">
               <li className="flex items-center gap-2">
                 <Users className="h-4 w-4 text-primary" />
                 <span>Користувачів онлайн: <span className="text-foreground">0</span></span>
               </li>
               <li className="flex items-center gap-2">
                 <MessageCircle className="h-4 w-4 text-primary" />
                 <span>Всього тем: <span className="text-foreground">0</span></span>
               </li>
               <li className="flex items-center gap-2">
                 <Activity className="h-4 w-4 text-primary" />
                 <span>Повідомлень: <span className="text-foreground">0</span></span>
               </li>
             </ul>
           </div>
         </div>
 
         {/* Copyright */}
         <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
           <p>&copy; {new Date().getFullYear()} BlackZone RP. Всі права захищено.</p>
         </div>
       </div>
     </footer>
   );
 }