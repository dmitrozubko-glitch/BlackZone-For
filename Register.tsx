 import { useState } from 'react';
 import { Link, useNavigate } from 'react-router-dom';
 import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, User } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { useAuth } from '@/hooks/useAuth';
 import { Layout } from '@/components/forum/Layout';
 
 export default function Register() {
   const [username, setUsername] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [error, setError] = useState('');
   const [success, setSuccess] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const { signUp } = useAuth();
   const navigate = useNavigate();
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setError('');
 
     if (password !== confirmPassword) {
       setError('Паролі не співпадають');
       return;
     }
 
     if (password.length < 6) {
       setError('Пароль повинен бути не менше 6 символів');
       return;
     }
 
     if (username.length < 3) {
       setError('Нікнейм повинен бути не менше 3 символів');
       return;
     }
 
     setIsLoading(true);
 
     const { error } = await signUp(email, password, username);
     
     if (error) {
       setError(error.message || 'Помилка реєстрації');
       setIsLoading(false);
       return;
     }
 
     setSuccess(true);
   };
 
   if (success) {
     return (
       <Layout>
         <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
           <div className="w-full max-w-md text-center p-8 rounded-xl border border-primary/30 bg-card/50 backdrop-blur">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
               <Mail className="h-8 w-8 text-primary" />
             </div>
             <h2 className="font-display text-2xl font-bold mb-2">Перевірте вашу пошту</h2>
             <p className="text-muted-foreground mb-4">
               Ми відправили вам лист для підтвердження email на <span className="text-foreground">{email}</span>
             </p>
             <Button variant="outline" onClick={() => navigate('/login')}>
               Перейти до входу
             </Button>
           </div>
         </div>
       </Layout>
     );
   }
 
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
             <h1 className="font-display text-2xl font-bold">Реєстрація</h1>
             <p className="text-muted-foreground mt-2">
               Приєднуйся до нашої спільноти
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
               <Label htmlFor="username">Нікнейм</Label>
               <div className="relative">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input
                   id="username"
                   type="text"
                   value={username}
                   onChange={(e) => setUsername(e.target.value)}
                   placeholder="YourNickname"
                   className="pl-10"
                   required
                 />
               </div>
             </div>
 
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
 
             <div className="space-y-2">
               <Label htmlFor="confirmPassword">Підтвердження пароля</Label>
               <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input
                   id="confirmPassword"
                   type={showPassword ? 'text' : 'password'}
                   value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)}
                   placeholder="••••••••"
                   className="pl-10"
                   required
                 />
               </div>
             </div>
 
             <Button type="submit" className="w-full" disabled={isLoading}>
               {isLoading ? 'Реєстрація...' : 'Зареєструватися'}
             </Button>
 
             <p className="text-center text-sm text-muted-foreground">
               Вже є акаунт?{' '}
               <Link to="/login" className="text-primary hover:underline">
                 Увійти
               </Link>
             </p>
           </form>
         </div>
       </div>
     </Layout>
   );
 }