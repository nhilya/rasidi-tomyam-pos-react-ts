import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Package, BarChart3, Users, LogOut, Menu as MenuIcon, X, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();
  const { user, setUser } = useStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: t('nav.dashboard'), href: '/admin', icon: LayoutDashboard, roles: ['super_admin', 'manager'] },
    { name: t('nav.pos'), href: '/pos', icon: ClipboardList, roles: ['super_admin', 'manager', 'cashier', 'server'] },
    { name: t('nav.inventory'), href: '/inventory', icon: Package, roles: ['super_admin', 'manager', 'supervisor'] },
    { name: t('nav.expenses'), href: '/expenses', icon: DollarSign, roles: ['super_admin', 'manager'] },
    { name: t('nav.customers'), href: '/customers', icon: Users, roles: ['super_admin', 'manager'] },
    { name: t('nav.reports'), href: '/reports', icon: BarChart3, roles: ['super_admin', 'manager'] },
    { name: t('nav.employees'), href: '/employees', icon: Users, roles: ['super_admin'] },
  ];

  const filteredNav = navigation.filter(item => !item.roles || (user && item.roles.includes(user.role)));

  // If it's a customer menu (QR code), we might want a different layout
  const isCustomerView = location.pathname.startsWith('/menu');

  if (isCustomerView) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-serif font-bold text-foreground">MomsShop</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <span className="text-xs font-medium px-2 py-1 bg-muted rounded-full text-muted-foreground">{t('nav.table', { number: new URLSearchParams(location.search).get('table') || 'N/A' })}</span>
          </div>
        </header>
        <main className="pb-24">{children}</main>
        <Toaster position="top-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-2xl font-serif font-bold text-sidebar-foreground">Lumina POS</h1>
          <p className="text-xs text-sidebar-foreground/60 mt-1">Management System</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {filteredNav.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-foreground">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/50 capitalize">{user?.role.replace('_', ' ')}</p>
            </div>
            <div className="flex gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
            onClick={() => setUser(null)}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('nav.logout')}
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-background border-b border-border px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-serif font-bold text-foreground">Lumina POS</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <MenuIcon />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background pt-16">
          <nav className="p-4 space-y-2">
            {filteredNav.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium",
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground bg-muted"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
            <Button 
              variant="ghost" 
              className="w-full justify-start text-lg py-6 text-destructive"
              onClick={() => {
                setUser(null);
                setIsMobileMenuOpen(false);
              }}
            >
              <LogOut className="w-5 h-5 mr-3" />
              {t('nav.logout')}
            </Button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
