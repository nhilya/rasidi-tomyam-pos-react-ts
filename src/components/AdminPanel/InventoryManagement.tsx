import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { getMenu, createMenuItem, updateMenuItem } from '@/api/menu';
import { ApiError } from '@/lib/api';
import type { ApiMenuItem } from '@/api/types';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: 'food' as 'food' | 'drink',
  stock: '',
  min_stock: '',
};

export default function InventoryManagement() {
  const { t } = useTranslation();
  const { can } = useAuth();
  const [menu, setMenu] = React.useState<ApiMenuItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY_FORM);

  React.useEffect(() => {
    getMenu()
      .then(res => setMenu(res.data))
      .catch(() => toast.error('Failed to load inventory'))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = menu.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRestock = async (item: ApiMenuItem) => {
    const input = prompt(t('inventory.restockPrompt'), '10');
    const amount = parseInt(input || '0');
    if (amount <= 0) return;
    try {
      const updated = await updateMenuItem(item.id, { stock: item.stock + amount });
      setMenu(prev => prev.map(m => m.id === updated.id ? updated : m));
      toast.success(t('inventory.restockSuccess'));
    } catch {
      toast.error('Failed to update stock');
    }
  };

  const handleAddItem = async () => {
    if (!form.name || !form.price || !form.stock || !form.min_stock) {
      toast.error(t('expenses.fillRequired'));
      return;
    }
    setSaving(true);
    try {
      const created = await createMenuItem({
        name: form.name,
        description: form.description || undefined,
        price: parseFloat(form.price),
        category: form.category,
        stock: parseInt(form.stock),
        min_stock: parseInt(form.min_stock),
      });
      setMenu(prev => [...prev, created]);
      toast.success(t('inventory.addSuccess'));
      setIsAddOpen(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to add item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">{t('inventory.title')}</h2>
          <p className="text-muted-foreground">{t('inventory.subtitle')}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder={t('inventory.search')}
              className="h-8 pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {can('create-menu') && (
            <Button variant="default" onClick={() => { setForm(EMPTY_FORM); setIsAddOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              {t('inventory.addItem')}
            </Button>
          )}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('inventory.newItem')}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>{t('inventory.form.name')}</Label>
                  <Input
                    placeholder="Tom Yam Soup"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('inventory.form.description')}</Label>
                  <Input
                    placeholder={t('inventory.form.descPlaceholder')}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>{t('inventory.form.price')}</Label>
                    <Input
                      type="number"
                      placeholder="12.90"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('inventory.form.category')}</Label>
                    <Select
                      value={form.category}
                      onValueChange={v => setForm({ ...form, category: v as 'food' | 'drink' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food">{t('categories.food')}</SelectItem>
                        <SelectItem value="drink">{t('categories.drink')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>{t('inventory.form.stock')}</Label>
                    <Input
                      type="number"
                      placeholder="50"
                      min="0"
                      value={form.stock}
                      onChange={e => setForm({ ...form, stock: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('inventory.form.minStock')}</Label>
                    <Input
                      type="number"
                      placeholder="10"
                      min="0"
                      value={form.min_stock}
                      onChange={e => setForm({ ...form, min_stock: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  {t('expenses.cancel')}
                </Button>
                <Button onClick={handleAddItem} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {t('expenses.save')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('inventory.stats.totalItems')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{loading ? '—' : menu.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('inventory.stats.lowStock')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {loading ? '—' : menu.filter(i => i.is_low_stock).length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('inventory.stats.outOfStock')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {loading ? '—' : menu.filter(i => i.stock === 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('inventory.table.name')}</TableHead>
              <TableHead>{t('inventory.table.category')}</TableHead>
              <TableHead>{t('inventory.table.stock')}</TableHead>
              <TableHead>{t('inventory.table.minLevel')}</TableHead>
              <TableHead>{t('inventory.table.status')}</TableHead>
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
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="capitalize">{item.category}</TableCell>
                  <TableCell>
                    <span className={item.is_low_stock ? 'text-red-600 font-bold' : ''}>
                      {t('inventory.units', { count: item.stock })}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {t('inventory.units', { count: item.min_stock })}
                  </TableCell>
                  <TableCell>
                    {item.stock === 0 ? (
                      <Badge variant="destructive">{t('inventory.status.outOfStock')}</Badge>
                    ) : item.is_low_stock ? (
                      <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900">
                        {t('inventory.status.lowStock')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900">
                        {t('inventory.status.healthy')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleRestock(item)}>
                      {t('dashboard.restock')}
                    </Button>
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
