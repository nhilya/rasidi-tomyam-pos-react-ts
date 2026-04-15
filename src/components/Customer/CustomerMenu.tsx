import React from 'react';
import { useStore } from '@/store';
import type { OrderItem, Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, User as UserIcon, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import Receipt from '../Finance/Receipt';
import LanguageSwitcher from '../Layout/LanguageSwitcher';
import ThemeToggle from '../Layout/ThemeToggle';

export default function CustomerMenu() {
  const { t } = useTranslation();
  const { menu, addOrder, user, setUser, addCustomer } = useStore();
  const [cart, setCart] = React.useState<{ [key: string]: number }>({});
  const [category, setCategory] = React.useState<'all' | 'food' | 'drink'>('all');
  const [step, setStep] = React.useState<'menu' | 'checkout' | 'success'>('menu');
  const [lastOrder, setLastOrder] = React.useState<Order | null>(null);
  
  const [customerInfo, setCustomerInfo] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const tableNumber = new URLSearchParams(window.location.search).get('table') || '1';

  const addToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const next = { ...prev };
      if (next[id] > 1) next[id]--;
      else delete next[id];
      return next;
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => (a as number) + (b as number), 0) as number;
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menu.find(m => m.id === id);
    return (sum as number) + (item?.price || 0) * (qty as number);
  }, 0) as number;

  const filteredMenu = menu.filter(item => category === 'all' || item.category === category);

  const handlePlaceOrder = () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      toast.error(t('customerInfo.error'));
      return;
    }

    const orderItems: OrderItem[] = Object.entries(cart).map(([id, qty]) => {
      const item = menu.find(m => m.id === id)!;
      return {
        menuItemId: id,
        quantity: qty as number,
        price: item.price
      };
    });

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      tableNumber,
      items: orderItems,
      status: 'pending',
      platform: 'customer_pwa',
      total: totalPrice,
      createdAt: new Date().toISOString(),
      createdBy: 'customer',
      customerDetails: customerInfo
    };

    addOrder(newOrder);
    
    // Save as guest if not logged in
    if (!user) {
      addCustomer({
        id: Math.random().toString(36).substr(2, 9),
        ...customerInfo,
        isRegistered: false,
        createdAt: new Date().toISOString()
      });
    }

    setLastOrder(newOrder);
    setCart({});
    setStep('success');
    toast.success(t('success.toast'));
  };

  if (step === 'success' && lastOrder) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground">{t('success.title')}</h2>
          <p className="text-muted-foreground">{t('success.desc')}</p>
        </div>
        
        <Receipt order={lastOrder} />
        
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => setStep('menu')}
        >
          {t('success.back')}
        </Button>
      </div>
    );
  }

  if (step === 'checkout') {
    return (
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setStep('menu')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-serif font-bold">{t('cart.checkout')}</h2>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">{t('customerInfo.title')}</CardTitle>
            <CardDescription className="text-muted-foreground">{t('customerInfo.desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('customerInfo.name')}</Label>
              <Input 
                id="name" 
                value={customerInfo.name} 
                onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('customerInfo.email')}</Label>
              <Input 
                id="email" 
                type="email"
                value={customerInfo.email} 
                onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('customerInfo.phone')}</Label>
              <Input 
                id="phone" 
                value={customerInfo.phone} 
                onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                placeholder="+60 12-345 6789"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">{t('cart.summary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(cart).map(([id, qty]) => {
              const item = menu.find(m => m.id === id)!;
              return (
                <div key={id} className="flex justify-between text-sm text-foreground">
                  <span>{item.name} x {qty}</span>
                  <span>${(item.price * (qty as number)).toFixed(2)}</span>
                </div>
              );
            })}
            <div className="pt-4 border-t border-border flex justify-between font-bold text-lg text-foreground">
              <span>{t('cart.total')}</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full h-14 text-lg font-bold bg-primary text-primary-foreground" onClick={handlePlaceOrder}>
          {t('cart.placeOrder')}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">{t('welcome')}</h2>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          {!user && (
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => toast.info(t('nav.loginSoon'))}>
              <UserIcon className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'food', 'drink'].map((cat) => (
          <Button
            key={cat}
            variant={category === cat ? 'default' : 'outline'}
            className="rounded-full capitalize"
            onClick={() => setCategory(cat as any)}
          >
            {t(`categories.${cat}`)}
          </Button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="grid gap-4">
        {filteredMenu.map((item) => (
          <motion.div
            layout
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex p-3 gap-4">
                <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center text-muted-foreground">
                  <Utensils className="w-8 h-8" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-foreground">{item.name}</h3>
                      <span className="font-bold text-foreground">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                  </div>
                  
                  <div className="flex justify-end items-center gap-3 mt-2">
                    {cart[item.id] ? (
                      <div className="flex items-center gap-3 bg-muted rounded-full px-2 py-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full text-foreground"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-bold min-w-[1rem] text-center text-foreground">{cart[item.id]}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full text-foreground"
                          onClick={() => addToCart(item.id)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="rounded-full h-8 px-4"
                        onClick={() => addToCart(item.id)}
                      >
                        {t('cart.add')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Floating Cart Bar */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-4 right-4 z-50"
          >
            <Button
              className="w-full h-14 rounded-2xl shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 flex justify-between px-6"
              onClick={() => setStep('checkout')}
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary-foreground/20 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">
                  {totalItems}
                </div>
                <span className="font-bold">{t('cart.viewOrder')}</span>
              </div>
              <span className="font-bold">${totalPrice.toFixed(2)}</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Utensils(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}
