import React from 'react';
import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, FileText, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { useTranslation } from 'react-i18next';

export default function ExpensesManagement() {
  const { t } = useTranslation();
  const { expenses, addExpense, user } = useStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  
  const [newExpense, setNewExpense] = React.useState({
    type: 'inventory' as any,
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    receiptUrl: ''
  });

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.description) {
      toast.error(t('expenses.fillRequired'));
      return;
    }

    addExpense({
      id: Math.random().toString(36).substr(2, 9),
      type: newExpense.type,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      date: newExpense.date,
      receiptUrl: newExpense.receiptUrl,
      recordedBy: user?.name || 'Admin'
    });

    setIsAddOpen(false);
    setNewExpense({
      type: 'inventory',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      receiptUrl: ''
    });
    toast.success(t('expenses.saveSuccess'));
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">{t('expenses.title')}</h2>
          <p className="text-muted-foreground">{t('expenses.subtitle')}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input 
              placeholder={t('expenses.search')} 
              className="h-8 pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger
              render={
                <Button variant="default">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('expenses.record')}
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('expenses.newExpense')}</DialogTitle>
                <CardDescription>{t('expenses.expenseDesc')}</CardDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">{t('expenses.type')}</Label>
                  <Select 
                    value={newExpense.type} 
                    onValueChange={(v) => setNewExpense({...newExpense, type: v as any})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('expenses.selectType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary">{t('expenses.types.salary')}</SelectItem>
                      <SelectItem value="inventory">{t('expenses.types.inventory')}</SelectItem>
                      <SelectItem value="utility">{t('expenses.types.utility')}</SelectItem>
                      <SelectItem value="other">{t('expenses.types.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">{t('expenses.amount')}</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">{t('expenses.description')}</Label>
                  <Input 
                    id="description" 
                    placeholder={t('expenses.descPlaceholder')}
                    value={newExpense.description}
                    onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">{t('expenses.date')}</Label>
                  <Input 
                    id="date" 
                    type="date"
                    value={newExpense.date}
                    onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('expenses.receiptUpload')}</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer">
                    <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">{t('expenses.uploadClick')}</p>
                    <input type="file" className="hidden" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>{t('expenses.cancel')}</Button>
                <Button onClick={handleAddExpense}>{t('expenses.save')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('expenses.stats.total')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalExpenses.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('expenses.stats.inventory')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${expenses.filter(e => e.type === 'inventory').reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('expenses.stats.salary')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${expenses.filter(e => e.type === 'salary').reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('expenses.table.date')}</TableHead>
              <TableHead>{t('expenses.table.type')}</TableHead>
              <TableHead>{t('expenses.table.description')}</TableHead>
              <TableHead>{t('expenses.table.amount')}</TableHead>
              <TableHead>{t('expenses.table.recordedBy')}</TableHead>
              <TableHead className="text-right">{t('expenses.table.receipt')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  {t('expenses.noExpenses')}
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="text-muted-foreground">{expense.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {t(`expenses.types.${expense.type}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{expense.description}</TableCell>
                  <TableCell className="font-bold text-red-600">-${expense.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{expense.recordedBy}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <FileText className="w-4 h-4" />
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
