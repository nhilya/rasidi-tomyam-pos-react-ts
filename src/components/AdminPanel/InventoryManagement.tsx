import React from 'react';
import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

import { useTranslation } from 'react-i18next';

export default function InventoryManagement() {
  const { t } = useTranslation();
  const { menu, setMenu } = useStore();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredItems = menu.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRestock = (id: string) => {
    const amount = parseInt(prompt(t('inventory.restockPrompt'), '10') || '0');
    if (amount > 0) {
      setMenu(menu.map(item => 
        item.id === id ? { ...item, stock: item.stock + amount } : item
      ));
      toast.success(t('inventory.restockSuccess'));
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
          <Button variant="default">
            <Plus className="w-4 h-4 mr-2" />
            {t('inventory.addItem')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('inventory.stats.totalItems')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{menu.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('inventory.stats.lowStock')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {menu.filter(i => i.stock <= i.minStock).length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('inventory.stats.outOfStock')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {menu.filter(i => i.stock === 0).length}
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
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="capitalize">{item.category}</TableCell>
                <TableCell>
                  <span className={item.stock <= item.minStock ? "text-red-600 font-bold" : ""}>
                    {t('inventory.units', { count: item.stock })}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{t('inventory.units', { count: item.minStock })}</TableCell>
                <TableCell>
                  {item.stock === 0 ? (
                    <Badge variant="destructive">{t('inventory.status.outOfStock')}</Badge>
                  ) : item.stock <= item.minStock ? (
                    <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900">{t('inventory.status.lowStock')}</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900">{t('inventory.status.healthy')}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleRestock(item.id)}>
                    {t('dashboard.restock')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
