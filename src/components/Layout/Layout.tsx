import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Utensils, ClipboardList, Package, BarChart3, Users, LogOut, Menu as MenuIcon, X, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { motion } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();
  const { user, setUser } = useStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

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
          <h1 className="text-xl font-serif font-bold text-foreground">Rasidi Tomyam</h1>
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
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 256 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:flex flex-col bg-sidebar border-r border-sidebar-border relative"
      >
        <div className={cn(
          "p-6 border-b border-sidebar-border flex items-center justify-between",
          isSidebarCollapsed && "px-4 justify-center"
        )}>
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="text-2xl font-serif font-bold text-sidebar-foreground whitespace-nowrap">Rasidi Tomyam</h1>
              <p className="text-xs text-sidebar-foreground/60 mt-1">Management System</p>
            </motion.div>
          )}
          {isSidebarCollapsed && (
            <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-serif font-bold text-xl">
              L
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 z-10 size-6 rounded-full border border-sidebar-border bg-sidebar shadow-sm hover:bg-sidebar-accent"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
        </Button>
        
        <nav className="flex-1 p-4 space-y-1">
          {filteredNav.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative",
                location.pathname === item.href
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                isSidebarCollapsed && "justify-center px-0"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="whitespace-nowrap"
                >
                  {item.name}
                </motion.span>
              )}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-sidebar-foreground text-sidebar-background text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className={cn(
            "flex items-center gap-3 px-3 py-2 mb-4",
            isSidebarCollapsed && "px-0 justify-center"
          )}>
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-foreground shrink-0">
              {user?.name.charAt(0)}
            </div>
            {!isSidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 overflow-hidden"
              >
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
                <p className="text-xs text-sidebar-foreground/50 capitalize">{user?.role.replace('_', ' ')}</p>
              </motion.div>
            )}
            {!isSidebarCollapsed && (
              <div className="flex gap-2">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
            )}
          </div>

          {isSidebarCollapsed && (
            <div className="flex flex-col items-center gap-2 mb-4">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          )}

          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10",
              isSidebarCollapsed && "justify-center px-0"
            )}
            onClick={() => setUser(null)}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span className="ml-2">{t('nav.logout')}</span>}
          </Button>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-background border-b border-border px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-serif font-bold text-foreground">Rasidi Tomyam</h1>
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
