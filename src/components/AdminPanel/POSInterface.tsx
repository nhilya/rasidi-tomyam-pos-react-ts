import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Filter, CheckCircle2, Clock, FileText, Plus, ShoppingBag, Globe, RefreshCw, ClipboardList, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Receipt from '../Finance/Receipt';
import type { ApiOrder } from '@/api/types';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getOrders, patchOrderStatus } from '@/api/orders';
import type { OrderPlatform } from '@/types';

export default function POSInterface() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = React.useState<ApiOrder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedOrder, setSelectedOrder] = React.useState<ApiOrder | null>(null);
  const [isManualOrderOpen, setIsManualOrderOpen] = React.useState(false);
  const [manualOrder, setManualOrder] = React.useState({
    platform: 'foodpanda' as 'foodpanda' | 'shopeefood',
    total: '',
    notes: ''
  });

  const fetchOrders = React.useCallback(() => {
    return getOrders()
      .then(res => setOrders(res.data))
      .catch(() => toast.error('Failed to load orders'));
  }, []);

  React.useEffect(() => {
    fetchOrders().finally(() => setLoading(false));
  }, [fetchOrders]);

  const filteredOrders = orders.filter(o =>
    String(o.table_id ?? '').includes(searchTerm) ||
    String(o.id).includes(searchTerm) ||
    (o.customer?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.platform.includes(searchTerm.toLowerCase())
  );

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetchOrders();
      toast.success(t('pos.syncSuccess', { count: orders.length }));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, status: ApiOrder['status']) => {
    try {
      const updated = await patchOrderStatus(orderId, {
        status,
        ...(status === 'paid' ? { payment_method: 'cash' } : {}),
      });
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      toast.success(t('pos.orderUpdated', { id: String(orderId).slice(0, 4), status }));
    } catch {
      toast.error('Failed to update order status');
    }
  };

  const getPlatformIcon = (platform: OrderPlatform) => {
    switch (platform) {
      case 'foodpanda': return <ShoppingBag className="w-3 h-3 text-pink-500" />;
      case 'shopeefood': return <ShoppingBag className="w-3 h-3 text-orange-500" />;
      case 'customer_pwa': return <Globe className="w-3 h-3 text-blue-500" />;
      default: return <Monitor className="w-3 h-3 text-zinc-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'preparing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'served': return 'bg-green-100 text-green-700 border-green-200';
      case 'paid': return 'bg-zinc-100 text-zinc-700 border-zinc-200';
      default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">{t('pos.title')}</h2>
          <p className="text-muted-foreground">{t('pos.subtitle')}</p>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full flex-1 min-w-0">
            <Button
              variant="default"
              className="min-h-8 w-full border-border whitespace-normal sm:whitespace-nowrap break-words text-center flex items-center justify-center gap-1"
              onClick={() => navigate('/take-order')}
            >
              <ClipboardList className="w-4 h-4" />
              {t('pos.takeOrder')}
            </Button>

            <Button
              variant="outline"
              onClick={handleSync}
              disabled={isSyncing}
              className="min-h-8 w-full border-border whitespace-normal sm:whitespace-nowrap break-words text-center flex items-center justify-center gap-1"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? t('pos.syncing') : t('pos.sync')}
            </Button>

            <Dialog open={isManualOrderOpen} onOpenChange={setIsManualOrderOpen}>
              <DialogTrigger
                render={
                  <Button variant="default" className="min-h-8 w-full whitespace-normal sm:whitespace-nowrap break-words text-center flex items-center justify-center gap-1">
                    <Plus className="w-4 h-4" />
                    {t('pos.externalOrder')}
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{t('pos.recordExternal')}</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    toast.info('External order recording requires item-level data. Use the sync feature for platform orders.');
                    setIsManualOrderOpen(false);
                  }}
                  className="space-y-4 pt-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('pos.platform')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={manualOrder.platform === 'foodpanda' ? 'default' : 'outline'}
                        onClick={() => setManualOrder({ ...manualOrder, platform: 'foodpanda' })}
                        className="w-full"
                      >
                        FoodPanda
                      </Button>
                      <Button
                        type="button"
                        variant={manualOrder.platform === 'shopeefood' ? 'default' : 'outline'}
                        onClick={() => setManualOrder({ ...manualOrder, platform: 'shopeefood' })}
                        className="w-full"
                      >
                        ShopeeFood
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('pos.amount')}</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={manualOrder.total}
                      onChange={(e) => setManualOrder({ ...manualOrder, total: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('pos.notes')}</label>
                    <Input
                      placeholder={t('pos.notesPlaceholder')}
                      value={manualOrder.notes}
                      onChange={(e) => setManualOrder({ ...manualOrder, notes: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full">{t('pos.record')}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-2 w-full lg:w-auto max-w-full lg:max-w-[420px] min-w-0">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder={t('pos.search')}
                className="h-8 w-full pl-10 border border-border bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="shrink-0 h-8 w-8 p-0 border border-border">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>{t('pos.orderId')}</TableHead>
                  <TableHead>{t('pos.table')}</TableHead>
                  <TableHead>{t('pos.customer')}</TableHead>
                  <TableHead>{t('pos.total')}</TableHead>
                  <TableHead>{t('pos.status')}</TableHead>
                  <TableHead className="text-right">{t('pos.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      {t('pos.noOrders')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(order.platform)}
                          #{String(order.id).slice(0, 8)}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">
                        {order.table_id ? `${t('pos.table')} ${order.table_id}` : t('pos.delivery')}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p className="font-medium text-foreground">{order.customer?.name || t('pos.guest')}</p>
                          <p className="text-muted-foreground">{order.customer?.phone || t('pos.noPhone')}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">RM {parseFloat(order.total_amount).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger
                              render={
                                <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)}>
                                  <FileText className="w-4 h-4" />
                                </Button>
                              }
                            />
                            <DialogContent className="sm:max-w-[425px] bg-background">
                              <DialogHeader>
                                <DialogTitle>{t('pos.receipt')}</DialogTitle>
                              </DialogHeader>
                              {selectedOrder && <Receipt order={selectedOrder} />}
                            </DialogContent>
                          </Dialog>

                          {order.status === 'pending' && (
                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(order.id, 'preparing')}>
                              {t('pos.prepare')}
                            </Button>
                          )}
                          {order.status === 'preparing' && (
                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(order.id, 'served')}>
                              {t('pos.serve')}
                            </Button>
                          )}
                          {order.status === 'served' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(order.id, 'paid')}>
                              {t('pos.paid')}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">{t('pos.summary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-100 dark:border-amber-900">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-900 dark:text-amber-400">{t('receipt.pending') || 'Pending'}</span>
                </div>
                <span className="text-lg font-bold text-amber-900 dark:text-amber-400">
                  {orders.filter(o => o.status === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900">
                <div className="flex items-center gap-3">
                  <Utensils className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-400">{t('pos.prepare')}</span>
                </div>
                <span className="text-lg font-bold text-blue-900 dark:text-blue-400">
                  {orders.filter(o => o.status === 'preparing').length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-100 dark:border-green-900">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900 dark:text-green-400">{t('pos.serve')}</span>
                </div>
                <span className="text-lg font-bold text-green-900 dark:text-green-400">
                  {orders.filter(o => o.status === 'served').length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-lg">{t('pos.revenue')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                RM {orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + parseFloat(o.total_amount), 0).toFixed(2)}
              </div>
              <p className="text-primary-foreground/70 text-xs mt-2">
                {t('pos.completedOrders', { count: orders.filter(o => o.status === 'paid').length })}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Monitor(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
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
