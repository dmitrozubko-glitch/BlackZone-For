 import { Link } from 'react-router-dom';
 import { useState } from 'react';
 import { Menu, X, User, Shield, LogOut, Settings } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { useAuth } from '@/hooks/useAuth';
 import { RankBadge } from './RankBadge';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 
 export function Header() {
   const { user, profile, role, isStaff, signOut } = useAuth();
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 
   const navLinks = [
     { href: '/', label: 'Головна' },
     { href: '/forum', label: 'Форум' },
     { href: '/members', label: 'Учасники' },
   ];
 
   return (
     <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl">
       <div className="container mx-auto px-4">
         <div className="flex h-16 items-center justify-between">
           {/* Logo */}
           <Link to="/" className="flex items-center gap-3 group">
             <div className="relative">
               <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full group-hover:bg-primary/50 transition-colors" />
               <Shield className="relative h-8 w-8 text-primary" />
             </div>
             <span className="font-display text-xl font-bold text-glow-sm">
               BLACK<span className="text-primary">ZONE</span> RP
             </span>
           </Link>
 
           {/* Desktop Navigation */}
           <nav className="hidden md:flex items-center gap-6">
             {navLinks.map((link) => (
               <Link
                 key={link.href}
                 to={link.href}
                 className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
               >
                 {link.label}
               </Link>
             ))}
           </nav>
 
           {/* User Menu */}
           <div className="flex items-center gap-4">
             {user ? (
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" className="flex items-center gap-2">
                     <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                       {profile?.avatar_url ? (
                         <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                       ) : (
                         <User className="h-4 w-4" />
                       )}
                     </div>
                     <span className="hidden sm:inline text-sm">{profile?.username}</span>
                     {role && <RankBadge role={role} size="sm" />}
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-56">
                   <div className="px-2 py-1.5">
                     <p className="text-sm font-medium">{profile?.username}</p>
                     <p className="text-xs text-muted-foreground">{user.email}</p>
                   </div>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem asChild>
                     <Link to="/profile" className="cursor-pointer">
                       <User className="mr-2 h-4 w-4" />
                       Профіль
                     </Link>
                   </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                     <Link to="/settings" className="cursor-pointer">
                       <Settings className="mr-2 h-4 w-4" />
                       Налаштування
                     </Link>
                   </DropdownMenuItem>
                   {isStaff && (
                     <>
                       <DropdownMenuSeparator />
                       <DropdownMenuItem asChild>
                         <Link to="/admin" className="cursor-pointer text-primary">
                           <Shield className="mr-2 h-4 w-4" />
                           Адмін панель
                         </Link>
                       </DropdownMenuItem>
                     </>
                   )}
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                     <LogOut className="mr-2 h-4 w-4" />
                     Вийти
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
             ) : (
               <div className="flex items-center gap-2">
                 <Button variant="ghost" asChild>
                   <Link to="/login">Увійти</Link>
                 </Button>
                 <Button asChild>
                   <Link to="/register">Реєстрація</Link>
                 </Button>
               </div>
             )}
 
             {/* Mobile Menu Button */}
             <Button
               variant="ghost"
               size="icon"
               className="md:hidden"
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
             >
               {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
             </Button>
           </div>
         </div>
 
         {/* Mobile Navigation */}
         {mobileMenuOpen && (
           <nav className="md:hidden py-4 border-t border-border/50 animate-fade-in">
             <div className="flex flex-col gap-2">
               {navLinks.map((link) => (
                 <Link
                   key={link.href}
                   to={link.href}
                   className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-md transition-colors"
                   onClick={() => setMobileMenuOpen(false)}
                 >
                   {link.label}
                 </Link>
               ))}
             </div>
           </nav>
         )}
       </div>
     </header>
   );
 }