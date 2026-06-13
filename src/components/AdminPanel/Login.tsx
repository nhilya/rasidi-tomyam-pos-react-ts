import React from 'react';
import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { login } from '@/api/auth';
import type { Role } from '@/types';

const TEST_USERS = [
  { role: 'super_admin' as Role, label: 'SA', color: 'bg-primary text-primary-foreground',  email: 'nuhailya.dev@gmail.com' },
  { role: 'manager'     as Role, label: 'MG', color: 'bg-blue-600 text-white',              email: 'manager@gmail.com' },
  { role: 'supervisor'  as Role, label: 'SP', color: 'bg-purple-600 text-white',             email: 'supervisor@gmail.com' },
  { role: 'cashier'     as Role, label: 'CS', color: 'bg-green-600 text-white',              email: 'cashier@gmail.com' },
  { role: 'server'      as Role, label: 'SV', color: 'bg-amber-600 text-white',              email: 'server@gmail.com' },
] as const;

const TEST_PASSWORD = 'password123';

export default function Login() {
  const { t } = useTranslation();
  const { setUser } = useStore();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async (loginEmail: string, loginPassword: string) => {
    setLoading(true);
    try {
      const { user } = await login(loginEmail, loginPassword);
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

  const handleQuickLogin = (testEmail: string) => {
    handleLogin(testEmail, TEST_PASSWORD);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    handleLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-serif font-bold text-foreground">{t('login.title')}</CardTitle>
          <CardDescription className="text-muted-foreground">{t('login.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick test logins */}
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Quick login (dev only)</p>
          <div className="grid grid-cols-1 gap-3">
            {TEST_USERS.map(({ role, label, color, email: testEmail }) => (
              <button
                key={role}
                disabled={loading}
                onClick={() => handleQuickLogin(testEmail)}
                className="flex items-center gap-3 w-full rounded-lg border border-border px-4 py-3 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-xs font-bold shrink-0`}>
                  {label}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{t(`login.roles.${role}`)}</p>
                  <p className="text-xs text-muted-foreground truncate">{testEmail}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{t('login.orUse')}</span>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  className="pl-10"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                  type="password"
                  className="pl-10"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading || !email || !password}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t('login.signIn')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
