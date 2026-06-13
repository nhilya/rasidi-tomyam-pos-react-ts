import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDailySales, getOrders, getMenu, getCustomers } from '@/api';
import type { ApiOrder, ApiMenuItem, DailySalesReport } from '@/api/types';

export default function AdminDashboard() {
  const { t } = useTranslation();

  const [dailySales, setDailySales] = React.useState<DailySalesReport | null>(null);
  const [recentOrders, setRecentOrders] = React.useState<ApiOrder[]>([]);
  const [activeCount, setActiveCount] = React.useState(0);
  const [lowStockItems, setLowStockItems] = React.useState<ApiMenuItem[]>([]);
  const [customerTotal, setCustomerTotal] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);

    Promise.all([
      getDailySales(today),
      getOrders({ date: today }),
      getMenu({ low_stock: 1 }),
      getCustomers(),
    ])
      .then(([sales, orders, menuRes, customersRes]) => {
        setDailySales(sales);
        setRecentOrders(orders.data.slice(0, 5));
        setActiveCount(
          orders.data.filter(o => o.status !== 'paid' && o.status !== 'cancelled').length
        );
        setLowStockItems(menuRes.data);
        setCustomerTotal(customersRes.meta.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-serif font-bold text-foreground">{t('dashboard.welcome')}</h2>
        <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.stats.todaySales')}
          value={loading ? '—' : `RM ${parseFloat(dailySales?.total_sales ?? '0').toFixed(2)}`}
          icon={TrendingUp}
          color="text-green-600"
        />
        <StatCard
          title={t('dashboard.stats.activeOrders')}
          value={loading ? '—' : activeCount.toString()}
          icon={ShoppingCart}
          color="text-blue-600"
        />
        <StatCard
          title={t('dashboard.stats.lowStock')}
          value={loading ? '—' : lowStockItems.length.toString()}
          icon={Package}
          color="text-amber-600"
        />
        <StatCard
          title={t('dashboard.stats.totalCustomers')}
          value={loading ? '—' : (customerTotal ?? 0).toString()}
          icon={Users}
          color="text-foreground"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t('dashboard.recentOrders')}</CardTitle>
            <Link to="/pos">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                {t('dashboard.viewAll')} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">{t('dashboard.noOrders')}</p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {order.table_id ? t('dashboard.table', { number: order.table_id }) : `#${order.id}`}
                        </p>
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">RM {parseFloat(order.total_amount).toFixed(2)}</p>
                      <Badge variant="outline" className="text-[10px] uppercase px-1 h-4">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Alerts */}
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t('dashboard.inventoryAlerts')}</CardTitle>
            <Link to="/inventory">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                {t('dashboard.manage')} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 text-green-100 dark:text-green-900 mb-2" />
                  <p>{t('dashboard.allHealthy')}</p>
                </div>
              ) : (
                lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{item.name}</p>
                        <p className="text-xs text-amber-700 dark:text-amber-400">{t('dashboard.onlyLeft', { count: item.stock })}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-8">
                      {t('dashboard.restock')}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-xl bg-muted", color)}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold text-foreground">{value}</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
