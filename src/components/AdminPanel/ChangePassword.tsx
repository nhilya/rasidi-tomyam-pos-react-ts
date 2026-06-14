import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { changePassword } from '@/api/auth';
import { useStore } from '@/store';
import { ApiError } from '@/lib/api';

export default function ChangePasswordForced() {
  const { user, setUser } = useStore();
  const [form, setForm] = React.useState({ current: '', password: '', confirm: '' });
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setSaving(true);
    try {
      await changePassword({
        current_password: form.current,
        password: form.password,
        password_confirmation: form.confirm,
      });
      if (user) setUser({ ...user, must_change_password: false });
      toast.success('Password changed successfully.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-xl border-border">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Password Change Required</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Set a new password before continuing.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={form.current}
                onChange={e => setForm({ ...form, current: e.target.value })}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                autoComplete="new-password"
                required
              />
            </div>
            <Button type="submit" className="w-full mt-1" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
