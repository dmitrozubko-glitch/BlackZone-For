 import { useState, useEffect } from 'react';
 import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
 import { Shield, Users, FolderOpen, Settings, BarChart3, FileText, Crown, Home } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Layout } from '@/components/forum/Layout';
 import { useAuth } from '@/hooks/useAuth';
 import { cn } from '@/lib/utils';
 
 const adminNavItems = [
   { href: '/admin', label: 'Огляд', icon: BarChart3, exact: true },
   { href: '/admin/users', label: 'Користувачі', icon: Users },
   { href: '/admin/categories', label: 'Категорії', icon: FolderOpen },
   { href: '/admin/topics', label: 'Теми', icon: FileText },
   { href: '/admin/roles', label: 'Ранги', icon: Crown },
   { href: '/admin/settings', label: 'Налаштування', icon: Settings },
 ];
 
 export default function Admin() {
   const { user, isStaff, isLoading, role } = useAuth();
   const navigate = useNavigate();
   const location = useLocation();
 
   useEffect(() => {
     if (!isLoading && (!user || !isStaff)) {
       navigate('/');
     }
   }, [user, isStaff, isLoading, navigate]);
 
   if (isLoading) {
     return (
       <Layout>
         <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
           <div className="text-center">
             <Shield className="h-12 w-12 text-primary mx-auto animate-pulse" />
             <p className="mt-4 text-muted-foreground">Завантаження...</p>
           </div>
         </div>
       </Layout>
     );
   }
 
   if (!isStaff) {
     return null;
   }
 
   return (
     <Layout>
       <div className="container mx-auto px-4 py-8">
         {/* Header */}
         <div className="flex items-center gap-4 mb-8">
           <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
             <Shield className="h-8 w-8 text-primary" />
           </div>
           <div>
             <h1 className="font-display text-2xl font-bold">Адмін панель</h1>
             <p className="text-muted-foreground">Управління форумом BlackZone RP</p>
           </div>
         </div>
 
         <div className="flex flex-col lg:flex-row gap-8">
           {/* Sidebar */}
           <aside className="lg:w-64 flex-shrink-0">
             <nav className="space-y-1 p-4 rounded-xl border border-border/50 bg-card/50">
               <Button variant="ghost" className="w-full justify-start mb-2" asChild>
                 <Link to="/">
                   <Home className="h-4 w-4 mr-2" />
                   На головну
                 </Link>
               </Button>
               <div className="h-px bg-border my-2" />
               {adminNavItems.map((item) => {
                 const isActive = item.exact 
                   ? location.pathname === item.href
                   : location.pathname.startsWith(item.href);
                 
                 return (
                   <Link
                     key={item.href}
                     to={item.href}
                     className={cn(
                       "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                       isActive 
                         ? "bg-primary/10 text-primary border border-primary/20" 
                         : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                     )}
                   >
                     <item.icon className="h-4 w-4" />
                     {item.label}
                   </Link>
                 );
               })}
             </nav>
           </aside>
 
           {/* Content */}
           <main className="flex-1 min-w-0">
             <Outlet />
           </main>
         </div>
       </div>
     </Layout>
   );
 }