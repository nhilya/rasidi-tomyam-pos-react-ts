import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, DollarSign, ShoppingBag, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { getFinancials } from '@/api/reports';
import { getExpenses } from '@/api/expenses';
import { getOrders } from '@/api/orders';
import type { FinancialsReport, ApiExpense } from '@/api/types';
import { printElement } from '@/lib/print';

export default function Reports() {
  const { t } = useTranslation();
  const reportRef = React.useRef<HTMLDivElement>(null);
  const [financials, setFinancials] = React.useState<FinancialsReport | null>(null);
  const [expenses, setExpenses] = React.useState<ApiExpense[]>([]);
  const [ordersTotal, setOrdersTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const now = new Date();
    Promise.all([
      getFinancials(now.getFullYear(), now.getMonth() + 1),
      getExpenses(),
      getOrders(),
    ])
      .then(([fin, expRes, ordRes]) => {
        setFinancials(fin);
        setExpenses(expRes.data);
        setOrdersTotal(ordRes.meta.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = parseFloat(financials?.total_sales ?? '0');
  const totalExpenses = parseFloat(financials?.total_expenses ?? '0');
  const netProfit = parseFloat(financials?.net_profit ?? '0');

  const COLORS = ['hsl(var(--primary))', '#3b82f6', '#ec4899', '#f97316'];

  const expensesByType = (financials?.expenses_by_type ?? []).map(e => ({
    name: t(`expenses.types.${e.type}`),
    value: parseFloat(e.total),
  })).filter(e => e.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">{t('reports.title')}</h2>
          <p className="text-muted-foreground">{t('reports.subtitle')}</p>
        </div>
        <Button variant="outline" onClick={() => reportRef.current && printElement(reportRef.current, 'Financial Report')}>
          <Download className="w-4 h-4 mr-2" />
          {t('reports.export')}
        </Button>
      </div>

      <div ref={reportRef} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('reports.stats.revenue')} value={loading ? '—' : `RM ${totalRevenue.toFixed(2)}`} icon={DollarSign} />
        <StatCard title={t('reports.stats.expenses')} value={loading ? '—' : `RM ${totalExpenses.toFixed(2)}`} icon={ShoppingBag} />
        <StatCard title={t('reports.stats.profit')} value={loading ? '—' : `RM ${netProfit.toFixed(2)}`} icon={TrendingUp} />
        <StatCard title={t('reports.stats.orders')} value={loading ? '—' : ordersTotal.toString()} icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">{t('reports.expensesByType', 'Expenses by Type')}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : expensesByType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expensesByType.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--popover-foreground))' }}
                    itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                    formatter={(value: unknown) => `RM ${Number(value ?? 0).toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">{t('reports.noSales')}</p>
            )}
          </CardContent>
          <div className="px-6 pb-6 flex flex-wrap gap-4 justify-center">
            {expensesByType.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-muted-foreground">{d.name}: RM {d.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">{t('reports.recentExpenses')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {expenses.slice(0, 5).map((e) => (
                  <div key={e.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-foreground">{e.description}</p>
                      <p className="text-xs text-muted-foreground">{e.date} • {t(`expenses.types.${e.type}`)}</p>
                    </div>
                    <span className="font-bold text-red-600">-RM {parseFloat(e.amount).toFixed(2)}</span>
                  </div>
                ))}
                {expenses.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">{t('expenses.noExpenses')}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{value}</h3>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <Icon className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
