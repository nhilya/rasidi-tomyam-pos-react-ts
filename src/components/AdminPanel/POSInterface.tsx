import React from 'react';
import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Filter, CheckCircle2, Clock, FileText, Plus, ShoppingBag, Globe, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Receipt from '../Receipt';
import { Order, OrderPlatform } from '@/types';

import { useTranslation } from 'react-i18next';

export default function POSInterface() {
  const { t } = useTranslation();
  const { orders, addOrder, updateOrder, menu, user } = useStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [isManualOrderOpen, setIsManualOrderOpen] = React.useState(false);
  const [manualOrder, setManualOrder] = React.useState({
    platform: 'foodpanda' as OrderPlatform,
    total: '',
    notes: ''
  });

  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    // Simulate API call
    setTimeout(() => {
      const mockExternalOrders: Order[] = [
        {
          id: 'fp-' + Math.random().toString(36).substr(2, 5),
          tableNumber: 'EXT',
          items: [],
          status: 'paid',
          platform: 'foodpanda',
          total: 45.50,
          createdAt: new Date().toISOString(),
          paidAt: new Date().toISOString(),
          paymentMethod: 'online',
          createdBy: 'system',
          customerDetails: { name: 'FOODPANDA Sync', email: '', phone: '' }
        },
        {
          id: 'sf-' + Math.random().toString(36).substr(2, 5),
          tableNumber: 'EXT',
          items: [],
          status: 'paid',
          platform: 'shopeefood',
          total: 32.80,
          createdAt: new Date().toISOString(),
          paidAt: new Date().toISOString(),
          paymentMethod: 'online',
          createdBy: 'system',
          customerDetails: { name: 'SHOPEEFOOD Sync', email: '', phone: '' }
        }
      ];
      
      mockExternalOrders.forEach(addOrder);
      setIsSyncing(false);
      toast.success(t('pos.syncSuccess', { count: 2 }));
    }, 2000);
  };

  const filteredOrders = orders.filter(o => 
    o.tableNumber.includes(searchTerm) || 
    o.id.includes(searchTerm) ||
    o.customerDetails?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.platform.includes(searchTerm.toLowerCase())
  );

  const handleManualOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualOrder.total) return;

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      tableNumber: 'EXT',
      items: [], // Bulk entry doesn't track individual items for simplicity
      status: 'paid',
      platform: manualOrder.platform,
      total: parseFloat(manualOrder.total),
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      paymentMethod: 'online',
      createdBy: user?.id || 'admin',
      customerDetails: {
        name: manualOrder.platform.toUpperCase() + ' Order',
        email: '',
        phone: ''
      }
    };

    addOrder(newOrder);
    setIsManualOrderOpen(false);
    setManualOrder({ platform: 'foodpanda', total: '', notes: '' });
    toast.success(t('pos.orderRecorded', { platform: manualOrder.platform }));
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

  const handleStatusUpdate = (orderId: string, status: any) => {
    updateOrder(orderId, { 
      status,
      ...(status === 'paid' ? { paidAt: new Date().toISOString(), paymentMethod: 'cash' } : {})
    });
    toast.success(t('pos.orderUpdated', { id: orderId.slice(0, 4), status }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">{t('pos.title')}</h2>
          <p className="text-muted-foreground">{t('pos.subtitle')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Action Buttons Group */}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={handleSync} 
              disabled={isSyncing}
              className="flex-1 sm:flex-none border-border h-8 min-w-[10rem]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? t('pos.syncing') : t('pos.sync')}
            </Button>

            <Dialog open={isManualOrderOpen} onOpenChange={setIsManualOrderOpen}>
              <DialogTrigger
                render={
                  <Button variant="default" className="flex-1 sm:flex-none h-8 min-w-[10rem]">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('pos.externalOrder')}
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{t('pos.recordExternal')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleManualOrderSubmit} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('pos.platform')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        type="button"
                        variant={manualOrder.platform === 'foodpanda' ? 'default' : 'outline'}
                        onClick={() => setManualOrder({...manualOrder, platform: 'foodpanda'})}
                        className="w-full"
                      >
                        FoodPanda
                      </Button>
                      <Button 
                        type="button"
                        variant={manualOrder.platform === 'shopeefood' ? 'default' : 'outline'}
                        onClick={() => setManualOrder({...manualOrder, platform: 'shopeefood'})}
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
                      onChange={(e) => setManualOrder({...manualOrder, total: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('pos.notes')}</label>
                    <Input 
                      placeholder={t('pos.notesPlaceholder')} 
                      value={manualOrder.notes}
                      onChange={(e) => setManualOrder({...manualOrder, notes: e.target.value})}
                    />
                  </div>
                  <Button type="submit" className="w-full">{t('pos.record')}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filter Group */}
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input 
                placeholder={t('pos.search')} 
                className="h-8 w-full pl-10 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="shrink-0 h-8 w-8 p-0">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Orders List */}
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
                {filteredOrders.length === 0 ? (
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
                          #{order.id.slice(0, 8)}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">
                        {order.tableNumber === 'EXT' ? t('pos.delivery') : `${t('pos.table')} ${order.tableNumber}`}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p className="font-medium text-foreground">{order.customerDetails?.name || t('pos.guest')}</p>
                          <p className="text-muted-foreground">{order.customerDetails?.phone || t('pos.noPhone')}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">${order.total.toFixed(2)}</TableCell>
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

        {/* Quick Stats / Summary */}
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
                ${orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.total, 0).toFixed(2)}
              </div>
              <p className="text-primary-foreground/70 text-xs mt-2">{t('pos.completedOrders', { count: orders.filter(o => o.status === 'paid').length })}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Monitor(props: any) {
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
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
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
