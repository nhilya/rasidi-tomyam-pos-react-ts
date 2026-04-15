import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, DollarSign, ShoppingBag, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export default function Reports() {
  const { t } = useTranslation();
  const { orders, expenses } = useStore();

  const totalRevenue = orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Platform breakdown
  const platformData = [
    { name: t('reports.platforms.instore'), value: orders.filter(o => o.platform === 'pos' && o.status === 'paid').reduce((sum, o) => sum + o.total, 0) },
    { name: t('reports.platforms.pwa'), value: orders.filter(o => o.platform === 'customer_pwa' && o.status === 'paid').reduce((sum, o) => sum + o.total, 0) },
    { name: t('reports.platforms.foodpanda'), value: orders.filter(o => o.platform === 'foodpanda' && o.status === 'paid').reduce((sum, o) => sum + o.total, 0) },
    { name: t('reports.platforms.shopeefood'), value: orders.filter(o => o.platform === 'shopeefood' && o.status === 'paid').reduce((sum, o) => sum + o.total, 0) },
  ].filter(d => d.value > 0);

  const COLORS = ['hsl(var(--primary))', '#3b82f6', '#ec4899', '#f97316'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">{t('reports.title')}</h2>
          <p className="text-muted-foreground">{t('reports.subtitle')}</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          {t('reports.export')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('reports.stats.revenue')} value={`$${totalRevenue.toFixed(2)}`} change="+12.5%" icon={DollarSign} />
        <StatCard title={t('reports.stats.expenses')} value={`$${totalExpenses.toFixed(2)}`} change="-2.4%" icon={ShoppingBag} />
        <StatCard title={t('reports.stats.profit')} value={`$${netProfit.toFixed(2)}`} change="+18.2%" icon={TrendingUp} />
        <StatCard title={t('reports.stats.orders')} value={orders.length.toString()} change="+5.1%" icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">{t('reports.revenueByPlatform')}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {platformData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--popover-foreground))' }}
                    itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">{t('reports.noSales')}</p>
            )}
          </CardContent>
          <div className="px-6 pb-6 flex flex-wrap gap-4 justify-center">
            {platformData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-muted-foreground">{d.name}: ${d.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">{t('reports.recentExpenses')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenses.slice(0, 5).map((e) => (
                <div key={e.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-foreground">{e.description}</p>
                    <p className="text-xs text-muted-foreground">{e.date} • {t(`expenses.types.${e.type}`)}</p>
                  </div>
                  <span className="font-bold text-red-600">-${e.amount.toFixed(2)}</span>
                </div>
              ))}
              {expenses.length === 0 && <p className="text-center text-muted-foreground py-8">{t('expenses.noExpenses')}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon: Icon }: any) {
  const isPositive = change.startsWith('+');
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{value}</h3>
            <p className={cn(
              "text-xs font-medium mt-1",
              isPositive ? "text-green-600" : "text-red-600"
            )}>
              {change} <span className="text-muted-foreground font-normal">{useTranslation().t('reports.vsLastMonth')}</span>
            </p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <Icon className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
