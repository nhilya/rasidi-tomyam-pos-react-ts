import { useStore } from '@/store';

export function useAuth() {
  const { user } = useStore();
  return {
    user,
    can: (permission: string): boolean => user?.permissions.includes(permission) ?? false,
    hasRole: (role: string): boolean => user?.role === role,
  };
}
