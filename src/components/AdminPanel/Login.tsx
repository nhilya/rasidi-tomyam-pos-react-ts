import React from 'react';
import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Mail } from 'lucide-react';

import { useTranslation } from 'react-i18next';

export default function Login() {
  const { t } = useTranslation();
  const { setUser } = useStore();
  const [email, setEmail] = React.useState('');

  const handleLogin = (role: any) => {
    setUser({
      id: Math.random().toString(),
      name: role.split('_').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
      email: `${role}@shop.com`,
      role: role
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-serif font-bold text-foreground">{t('login.title')}</CardTitle>
          <CardDescription className="text-muted-foreground">{t('login.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <Button variant="outline" className="h-14 justify-start px-6 text-lg text-foreground" onClick={() => handleLogin('super_admin')}>
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 text-xs">SA</div>
              {t('login.roles.super_admin')}
            </Button>
            <Button variant="outline" className="h-14 justify-start px-6 text-lg text-foreground" onClick={() => handleLogin('manager')}>
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-3 text-xs">MG</div>
              {t('login.roles.manager')}
            </Button>
            <Button variant="outline" className="h-14 justify-start px-6 text-lg text-foreground" onClick={() => handleLogin('cashier')}>
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center mr-3 text-xs">CS</div>
              {t('login.roles.cashier')}
            </Button>
            <Button variant="outline" className="h-14 justify-start px-6 text-lg text-foreground" onClick={() => handleLogin('server')}>
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center mr-3 text-xs">SV</div>
              {t('login.roles.server')}
            </Button>
          </div>
          
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{t('login.orUse')}</span>
            </div>
          </div>

          <div className="space-y-4 opacity-50 pointer-events-none">
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input id="email" placeholder="moms@shop.com" className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('login.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input id="password" type="password" className="pl-10" />
              </div>
            </div>
            <Button className="w-full bg-zinc-900">{t('login.signIn')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
