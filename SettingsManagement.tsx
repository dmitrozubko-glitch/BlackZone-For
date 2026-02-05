 import { useState } from 'react';
 import { Save, Globe, Bell, Shield, Palette } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Switch } from '@/components/ui/switch';
 import { Textarea } from '@/components/ui/textarea';
 import { toast } from 'sonner';
 
 export default function SettingsManagement() {
   const [settings, setSettings] = useState({
     siteName: 'BlackZone RP',
     siteDescription: 'Найкращий український GTA V RP сервер',
     maintenanceMode: false,
     registrationOpen: true,
     emailVerification: true,
     defaultRole: 'member',
   });
 
   const handleSave = () => {
     toast.success('Налаштування збережено');
   };
 
   return (
     <div className="space-y-6">
       <div>
         <h2 className="font-display text-xl font-bold mb-2">Налаштування</h2>
         <p className="text-muted-foreground">Загальні налаштування форуму</p>
       </div>
 
       <div className="space-y-6">
         {/* General Settings */}
         <div className="p-6 rounded-xl border border-border/50 bg-card/50">
           <div className="flex items-center gap-3 mb-6">
             <Globe className="h-5 w-5 text-primary" />
             <h3 className="font-display font-semibold">Загальні</h3>
           </div>
 
           <div className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="siteName">Назва сайту</Label>
               <Input
                 id="siteName"
                 value={settings.siteName}
                 onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="siteDescription">Опис сайту</Label>
               <Textarea
                 id="siteDescription"
                 value={settings.siteDescription}
                 onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                 rows={3}
               />
             </div>
           </div>
         </div>
 
         {/* Security Settings */}
         <div className="p-6 rounded-xl border border-border/50 bg-card/50">
           <div className="flex items-center gap-3 mb-6">
             <Shield className="h-5 w-5 text-primary" />
             <h3 className="font-display font-semibold">Безпека та реєстрація</h3>
           </div>
 
           <div className="space-y-4">
             <div className="flex items-center justify-between">
               <div>
                 <Label>Режим обслуговування</Label>
                 <p className="text-sm text-muted-foreground">Закрити сайт для всіх крім адміністраторів</p>
               </div>
               <Switch
                 checked={settings.maintenanceMode}
                 onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
               />
             </div>
 
             <div className="flex items-center justify-between">
               <div>
                 <Label>Реєстрація відкрита</Label>
                 <p className="text-sm text-muted-foreground">Дозволити реєстрацію нових користувачів</p>
               </div>
               <Switch
                 checked={settings.registrationOpen}
                 onCheckedChange={(checked) => setSettings({ ...settings, registrationOpen: checked })}
               />
             </div>
 
             <div className="flex items-center justify-between">
               <div>
                 <Label>Підтвердження email</Label>
                 <p className="text-sm text-muted-foreground">Вимагати підтвердження email при реєстрації</p>
               </div>
               <Switch
                 checked={settings.emailVerification}
                 onCheckedChange={(checked) => setSettings({ ...settings, emailVerification: checked })}
               />
             </div>
           </div>
         </div>
 
         <Button onClick={handleSave} className="w-full sm:w-auto">
           <Save className="h-4 w-4 mr-2" />
           Зберегти налаштування
         </Button>
       </div>
     </div>
   );
 }