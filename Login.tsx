 import { useState } from 'react';
 import { Link, useNavigate } from 'react-router-dom';
 import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { useAuth } from '@/hooks/useAuth';
 import { Layout } from '@/components/forum/Layout';
 
 export default function Login() {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [error, setError] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const { signIn } = useAuth();
   const navigate = useNavigate();
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setError('');
     setIsLoading(true);
 
     const { error } = await signIn(email, password);
     
     if (error) {
       setError('Невірний email або пароль');
       setIsLoading(false);
       return;
     }
 
     navigate('/');
   };
 
   return (
     <Layout>
       <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
         <div className="w-full max-w-md">
           {/* Header */}
           <div className="text-center mb-8">
             <div className="inline-flex items-center gap-3 mb-4">
               <Shield className="h-10 w-10 text-primary" />
               <span className="font-display text-2xl font-bold">
                 BLACK<span className="text-primary">ZONE</span>
               </span>
             </div>
             <h1 className="font-display text-2xl font-bold">Вхід до акаунту</h1>
             <p className="text-muted-foreground mt-2">
               Раді бачити вас знову на сервері
             </p>
           </div>
 
           {/* Form */}
           <form onSubmit={handleSubmit} className="space-y-6 p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur">
             {error && (
               <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                 <AlertCircle className="h-4 w-4 flex-shrink-0" />
                 <span>{error}</span>
               </div>
             )}
 
             <div className="space-y-2">
               <Label htmlFor="email">Email</Label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input
                   id="email"
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="your@email.com"
                   className="pl-10"
                   required
                 />
               </div>
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="password">Пароль</Label>
               <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input
                   id="password"
                   type={showPassword ? 'text' : 'password'}
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="••••••••"
                   className="pl-10 pr-10"
                   required
                 />
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                 >
                   {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                 </button>
               </div>
             </div>
 
             <Button type="submit" className="w-full" disabled={isLoading}>
               {isLoading ? 'Вхід...' : 'Увійти'}
             </Button>
 
             <p className="text-center text-sm text-muted-foreground">
               Немає акаунту?{' '}
               <Link to="/register" className="text-primary hover:underline">
                 Зареєструватися
               </Link>
             </p>
           </form>
         </div>
       </div>
     </Layout>
   );
 }