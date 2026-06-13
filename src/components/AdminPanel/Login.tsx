import React from 'react';
import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Phone, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { login } from '@/api/auth';
import type { Role } from '@/types';
import { formatPhone, rawPhone } from '@/lib/phone';

const QUICK_FILL = [
  {
    label: 'SA',
    phone: '0102877317',
    color: 'bg-primary text-primary-foreground',
    role: 'super_admin'
  },
  {
    label: 'BS',
    phone: '0111000000',
    color: 'bg-rose-700 text-white',
    role: 'boss'
  },
  {
    label: 'MG',
    phone: '0111000002',
    color: 'bg-blue-600 text-white',
    role: 'manager'
  },
  {
    label: 'SP',
    phone: '0111000003',
    color: 'bg-purple-600 text-white',
    role: 'supervisor'
  },
  {
    label: 'CS',
    phone: '0111000004',
    color: 'bg-green-600 text-white',
    role: 'cashier'
  },
  {
    label: 'SV',
    phone: '0111000005',
    color: 'bg-amber-600 text-white',
    role: 'server'
  },
] as const;

export default function Login() {
  const { t } = useTranslation();
  const { setUser } = useStore();
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!phone || !password) return;
    setLoading(true);
    try {
      const { user } = await login(phone, password);
      setUser({
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: (user.roles[0] as Role) ?? 'cashier',
        phone: user.phone ?? undefined,
      });
    } catch {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-serif font-bold text-foreground">{t('login.title')}</CardTitle>
          <CardDescription className="text-muted-foreground">{t('login.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 justify-center">
            {QUICK_FILL.map(({ label, phone: p, color, role }) => (
              <button
                key={role}
                type="button"
                title={t(`login.roles.${role}`)}
                onClick={() => { setPhone(p); setPassword('password123'); }}
                className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-xs font-bold shrink-0 hover:opacity-80 transition-opacity`}
              >
                {label}
              </button>
            ))}
          </div>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{t('login.phone')}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="011-1234 5678"
                  className="pl-10"
                  value={formatPhone(phone)}
                  onChange={e => setPhone(rawPhone(e.target.value))}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('login.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="pl-10 pr-10"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading || !phone || !password}>
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t('login.signIn')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
