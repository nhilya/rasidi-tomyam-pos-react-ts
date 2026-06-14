import React from 'react';
import { useStore } from '@/store';
import type { ApiMenuItem, ApiOrder, ApiTable } from '@/api/types';
import { resolveTable } from '@/api/tables';
import { getMenu, getCategories } from '@/api/menu';
import type { ApiCategory } from '@/api/types';
import { createOrder } from '@/api/orders';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, User as UserIcon, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import Receipt from '../Finance/Receipt';
import LanguageSwitcher from '../Layout/LanguageSwitcher';
import ThemeToggle from '../Layout/ThemeToggle';

export default function CustomerMenu() {
  const { t } = useTranslation();
  const { user } = useStore();

  const [apiMenu, setApiMenu] = React.useState<ApiMenuItem[]>([]);
  const [categories, setCategories] = React.useState<ApiCategory[]>([]);
  const [menuLoading, setMenuLoading] = React.useState(true);
  const [cart, setCart] = React.useState<{ [key: number]: number }>({});
  const [categoryId, setCategoryId] = React.useState<number | null>(null);
  const [step, setStep] = React.useState<'menu' | 'checkout' | 'success'>('menu');
  const [lastOrder, setLastOrder] = React.useState<ApiOrder | null>(null);
  const [tableInfo, setTableInfo] = React.useState<ApiTable | null>(null);
  const [tableError, setTableError] = React.useState(false);
  const [placing, setPlacing] = React.useState(false);

  const [customerInfo, setCustomerInfo] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const qrToken = new URLSearchParams(window.location.search).get('token');

  React.useEffect(() => {
    Promise.all([getMenu(), getCategories().catch(() => [])])
      .then(([menuRes, cats]) => {
        setApiMenu(menuRes.data);
        setCategories(cats);
      })
      .catch(() => toast.error('Failed to load menu'))
      .finally(() => setMenuLoading(false));

    if (!qrToken) return;
    resolveTable(qrToken)
      .then(setTableInfo)
      .catch(() => setTableError(true));
  }, [qrToken]);

  const addToCart = (id: number) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => {
      const next = { ...prev };
      if (next[id] > 1) next[id]--;
      else delete next[id];
      return next;
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = apiMenu.find(m => m.id === Number(id));
    return sum + (item ? parseFloat(item.price) : 0) * qty;
  }, 0);

  const filteredMenu = apiMenu.filter(item => categoryId === null || item.category.id === categoryId);

  const handlePlaceOrder = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      toast.error(t('customerInfo.error'));
      return;
    }
    setPlacing(true);
    try {
      const order = await createOrder({
        table_id: tableInfo?.id,
        platform: 'customer_pwa',
        items: Object.entries(cart).map(([id, qty]) => ({
          menu_item_id: Number(id),
          quantity: qty,
        })),
      });
      setLastOrder(order);
      setCart({});
      setStep('success');
      toast.success(t('success.toast'));
    } catch {
      toast.error('Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (tableError) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-2xl font-serif font-bold text-foreground">{t('table.invalidQr', 'Invalid QR code')}</p>
        <p className="text-muted-foreground">{t('table.scanAgain', 'Please scan the QR code on your table again.')}</p>
      </div>
    );
  }

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

        <Button variant="outline" className="w-full" onClick={() => setStep('menu')}>
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
                onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('customerInfo.email')}</Label>
              <Input
                id="email"
                type="email"
                value={customerInfo.email}
                onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('customerInfo.phone')}</Label>
              <Input
                id="phone"
                value={customerInfo.phone}
                onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
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
              const item = apiMenu.find(m => m.id === Number(id))!;
              return (
                <div key={id} className="flex justify-between text-sm text-foreground">
                  <span>{item.name} x {qty}</span>
                  <span>RM {(parseFloat(item.price) * qty).toFixed(2)}</span>
                </div>
              );
            })}
            <div className="pt-4 border-t border-border flex justify-between font-bold text-lg text-foreground">
              <span>{t('cart.total')}</span>
              <span>RM {totalPrice.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full h-14 text-lg font-bold bg-primary text-primary-foreground"
          onClick={handlePlaceOrder}
          disabled={placing}
        >
          {placing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
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
          {tableInfo && (
            <p className="text-sm font-medium text-primary mt-1">Table {tableInfo.number}</p>
          )}
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

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <Button
          variant={categoryId === null ? 'default' : 'outline'}
          className="rounded-full"
          onClick={() => setCategoryId(null)}
        >
          {t('categories.all')}
        </Button>
        {categories.map(cat => (
          <Button
            key={cat.id}
            variant={categoryId === cat.id ? 'default' : 'outline'}
            className="rounded-full"
            onClick={() => setCategoryId(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {menuLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredMenu.map((item) => (
            <motion.div layout key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex p-3 gap-4">
                  <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center text-muted-foreground">
                    <Utensils className="w-8 h-8" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-foreground">{item.name}</h3>
                        <span className="font-bold text-foreground">RM {parseFloat(item.price).toFixed(2)}</span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                      )}
                    </div>

                    <div className="flex justify-end items-center gap-3 mt-2">
                      {cart[item.id] ? (
                        <div className="flex items-center gap-3 bg-muted rounded-full px-2 py-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-foreground" onClick={() => removeFromCart(item.id)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-bold min-w-[1rem] text-center text-foreground">{cart[item.id]}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-foreground" onClick={() => addToCart(item.id)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" className="rounded-full h-8 px-4" onClick={() => addToCart(item.id)}>
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
      )}

      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-6 left-4 right-4 z-50">
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
              <span className="font-bold">RM {totalPrice.toFixed(2)}</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Utensils(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}
