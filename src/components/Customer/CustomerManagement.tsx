import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Phone, Mail, History, ExternalLink, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Receipt from '../Finance/Receipt';
import { useTranslation } from 'react-i18next';
import { getCustomers, getCustomerHistory } from '@/api/customers';
import type { ApiCustomer, ApiOrder } from '@/api/types';
import { toast } from 'sonner';

export default function CustomerManagement() {
  const { t } = useTranslation();
  const [customers, setCustomers] = React.useState<ApiCustomer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [historyMap, setHistoryMap] = React.useState<Record<number, ApiOrder[]>>({});
  const [loadingHistory, setLoadingHistory] = React.useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = React.useState<ApiOrder | null>(null);

  React.useEffect(() => {
    getCustomers()
      .then(res => setCustomers(res.data))
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false));
  }, []);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone ?? '').includes(searchTerm)
  );

  const loadHistory = async (customerId: number) => {
    if (historyMap[customerId]) return;
    setLoadingHistory(customerId);
    try {
      const res = await getCustomerHistory(customerId);
      setHistoryMap(prev => ({ ...prev, [customerId]: res.data }));
    } catch {
      toast.error('Failed to load order history');
    } finally {
      setLoadingHistory(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">{t('customers.title')}</h2>
          <p className="text-muted-foreground">{t('customers.subtitle')}</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder={t('customers.search')}
            className="h-8 pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('customers.table.customer')}</TableHead>
              <TableHead>{t('customers.table.contact')}</TableHead>
              <TableHead>{t('customers.table.status')}</TableHead>
              <TableHead>{t('customers.table.joined')}</TableHead>
              <TableHead className="text-right">{t('customers.table.history')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  {t('customers.noCustomers')}
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {customer.name.charAt(0)}
                      </div>
                      <span className="font-medium text-foreground">{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      {customer.email && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="w-3 h-3" /> {customer.email}
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="w-3 h-3" /> {customer.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={customer.is_registered ? 'default' : 'outline'}
                      className="text-[10px] uppercase"
                    >
                      {customer.is_registered ? t('customers.status.registered') : t('customers.status.guest')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadHistory(customer.id)}
                          >
                            <History className="w-4 h-4 mr-2" />
                            {t('customers.viewOrders')}
                          </Button>
                        }
                      />
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle>{t('customers.historyTitle', { name: customer.name })}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          {loadingHistory === customer.id ? (
                            <div className="flex justify-center py-8">
                              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                            </div>
                          ) : !historyMap[customer.id] || historyMap[customer.id].length === 0 ? (
                            <p className="text-center py-8 text-zinc-500">{t('customers.noOrders')}</p>
                          ) : (
                            historyMap[customer.id].map((order) => (
                              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                  <p className="font-bold">{t('customers.orderNum', { id: String(order.id).slice(0, 8) })}</p>
                                  <p className="text-xs text-zinc-500">{new Date(order.created_at).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="font-bold">RM {parseFloat(order.total_amount).toFixed(2)}</p>
                                    <Badge variant="outline" className="text-[10px] uppercase">{order.status}</Badge>
                                  </div>
                                  <Dialog>
                                    <DialogTrigger
                                      render={
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          onClick={() => setSelectedOrder(order)}
                                        >
                                          <ExternalLink className="w-4 h-4" />
                                        </Button>
                                      }
                                    />
                                    <DialogContent className="sm:max-w-[425px]">
                                      {selectedOrder && <Receipt order={selectedOrder} />}
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
