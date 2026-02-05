 import { Link } from 'react-router-dom';
 import { Shield, Users, MessageSquare, Star, ArrowRight, Gamepad2 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Layout } from '@/components/forum/Layout';
 
 export default function Index() {
   return (
     <Layout>
       {/* Hero Section */}
       <section className="relative overflow-hidden">
         <div className="absolute inset-0 gradient-hero" />
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
         
         <div className="relative container mx-auto px-4 py-24 sm:py-32">
           <div className="text-center max-w-3xl mx-auto">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-pulse-glow">
               <Gamepad2 className="h-4 w-4 text-primary" />
               <span className="text-sm text-primary font-medium">GTA V Roleplay Server</span>
             </div>
             
             <h1 className="font-display text-4xl sm:text-6xl font-bold mb-6">
               <span className="text-glow">BLACK</span>
               <span className="text-primary text-glow">ZONE</span>
               <span className="text-glow"> RP</span>
             </h1>
             
             <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
               Зануртесь у світ реалістичного рольового досвіду. Створіть свою унікальну історію 
               на найкращому українському GTA V RP сервері.
             </p>
             
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <Button size="lg" asChild className="group">
                 <Link to="/forum">
                   Перейти на форум
                   <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                 </Link>
               </Button>
               <Button size="lg" variant="outline" asChild>
                 <Link to="/register">Реєстрація</Link>
               </Button>
             </div>
           </div>
         </div>
       </section>
 
       {/* Features */}
       <section className="container mx-auto px-4 py-16">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-6 rounded-xl border border-border/50 bg-card/50 card-hover">
             <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
               <Users className="h-6 w-6 text-primary" />
             </div>
             <h3 className="font-display text-lg font-semibold mb-2">Активна спільнота</h3>
             <p className="text-muted-foreground text-sm">
               Приєднуйтесь до тисяч гравців, які вже обрали BlackZone RP
             </p>
           </div>
 
           <div className="p-6 rounded-xl border border-border/50 bg-card/50 card-hover">
             <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
               <MessageSquare className="h-6 w-6 text-primary" />
             </div>
             <h3 className="font-display text-lg font-semibold mb-2">Форум спільноти</h3>
             <p className="text-muted-foreground text-sm">
               Обговорюйте, діліться досвідом та знаходьте нових друзів
             </p>
           </div>
 
           <div className="p-6 rounded-xl border border-border/50 bg-card/50 card-hover">
             <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
               <Star className="h-6 w-6 text-primary" />
             </div>
             <h3 className="font-display text-lg font-semibold mb-2">Унікальний досвід</h3>
             <p className="text-muted-foreground text-sm">
               Реалістична економіка, робочі організації та багато можливостей
             </p>
           </div>
         </div>
       </section>
     </Layout>
   );
 }
