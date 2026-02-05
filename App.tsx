 import { Toaster } from "@/components/ui/toaster";
 import { Toaster as Sonner } from "@/components/ui/sonner";
 import { TooltipProvider } from "@/components/ui/tooltip";
 import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
 import { BrowserRouter, Routes, Route } from "react-router-dom";
 import { AuthProvider } from "@/hooks/useAuth";
 import Index from "./pages/Index";
 import Login from "./pages/Login";
 import Register from "./pages/Register";
 import Forum from "./pages/Forum";
 import Category from "./pages/Category";
 import Topic from "./pages/Topic";
 import NewTopic from "./pages/NewTopic";
 import Admin from "./pages/Admin";
 import AdminOverview from "./pages/admin/Overview";
 import UsersManagement from "./pages/admin/UsersManagement";
 import CategoriesManagement from "./pages/admin/CategoriesManagement";
 import TopicsManagement from "./pages/admin/TopicsManagement";
 import RolesManagement from "./pages/admin/RolesManagement";
 import SettingsManagement from "./pages/admin/SettingsManagement";
 import NotFound from "./pages/NotFound";
 
 const queryClient = new QueryClient();
 
 const App = () => (
   <QueryClientProvider client={queryClient}>
     <AuthProvider>
       <TooltipProvider>
         <Toaster />
         <Sonner />
         <BrowserRouter>
           <Routes>
             <Route path="/" element={<Index />} />
             <Route path="/login" element={<Login />} />
             <Route path="/register" element={<Register />} />
             <Route path="/forum" element={<Forum />} />
             <Route path="/forum/category/:id" element={<Category />} />
             <Route path="/forum/category/:categoryId/new-topic" element={<NewTopic />} />
             <Route path="/forum/topic/:id" element={<Topic />} />
             <Route path="/admin" element={<Admin />}>
               <Route index element={<AdminOverview />} />
               <Route path="users" element={<UsersManagement />} />
               <Route path="categories" element={<CategoriesManagement />} />
               <Route path="topics" element={<TopicsManagement />} />
               <Route path="roles" element={<RolesManagement />} />
               <Route path="settings" element={<SettingsManagement />} />
             </Route>
             <Route path="*" element={<NotFound />} />
           </Routes>
         </BrowserRouter>
       </TooltipProvider>
     </AuthProvider>
   </QueryClientProvider>
 );
 
 export default App;
