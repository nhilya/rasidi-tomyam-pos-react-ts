import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, FileText, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { getExpenses, createExpense } from '@/api/expenses';
import type { ApiExpense } from '@/api/types';

export default function ExpensesManagement() {
  const { t } = useTranslation();
  const { can, hasRole } = useAuth();
  const isStaff = hasRole('staff');
  const [expenses, setExpenses] = React.useState<ApiExpense[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [receiptFile, setReceiptFile] = React.useState<File | null>(null);

  const [newExpense, setNewExpense] = React.useState({
    type: 'inventory' as ApiExpense['type'],
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  React.useEffect(() => {
    getExpenses()
      .then(res => setExpenses(res.data))
      .catch(() => toast.error('Failed to load expenses'))
      .finally(() => setLoading(false));
  }, []);

  const filteredExpenses = expenses.filter(e =>
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddExpense = async () => {
    if (!newExpense.amount || !newExpense.description) {
      toast.error(t('expenses.fillRequired'));
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('type', newExpense.type);
      fd.append('amount', parseFloat(newExpense.amount).toString());
      fd.append('description', newExpense.description);
      fd.append('date', newExpense.date);
      if (receiptFile) fd.append('receipt', receiptFile);

      const created = await createExpense(fd);
      setExpenses(prev => [created, ...prev]);
      setIsAddOpen(false);
      setReceiptFile(null);
      setNewExpense({
        type: 'inventory',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      toast.success(t('expenses.saveSuccess'));
    } catch {
      toast.error('Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

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
          {can('create-expenses') && (
            <Button variant="default" onClick={() => setIsAddOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('expenses.record')}
            </Button>
          )}
        </div>
      </div>

      {/* Record Expense Dialog — rendered outside header, state-controlled */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('expenses.newExpense')}</DialogTitle>
            <CardDescription>{t('expenses.expenseDesc')}</CardDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">{t('expenses.type')}</Label>
              <Select
                value={newExpense.type}
                onValueChange={(v) => setNewExpense({ ...newExpense, type: v as ApiExpense['type'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('expenses.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  {!isStaff && <SelectItem value="salary">{t('expenses.types.salary')}</SelectItem>}
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
                onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">{t('expenses.description')}</Label>
              <Input
                id="description"
                placeholder={t('expenses.descPlaceholder')}
                value={newExpense.description}
                onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">{t('expenses.date')}</Label>
              <Input
                id="date"
                type="date"
                value={newExpense.date}
                onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>
                {t('expenses.receiptUpload')}
                <span className="text-muted-foreground text-xs ml-1">(Optional)</span>
              </Label>
              {receiptFile ? (
                <div className="flex items-center gap-2 border rounded-md px-3 py-2 text-sm text-foreground">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 truncate">{receiptFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setReceiptFile(null)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 border-2 border-dashed border-border rounded-md px-4 py-6 cursor-pointer hover:border-primary hover:bg-muted/30 transition-colors">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t('expenses.uploadClick')}</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={e => setReceiptFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>{t('expenses.cancel')}</Button>
            <Button onClick={handleAddExpense} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t('expenses.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('expenses.stats.total')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? '—' : `RM ${totalExpenses.toFixed(2)}`}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('expenses.stats.inventory')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? '—' : `RM ${expenses.filter(e => e.type === 'inventory').reduce((s, e) => s + parseFloat(e.amount), 0).toFixed(2)}`}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('expenses.stats.salary')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? '—' : `RM ${expenses.filter(e => e.type === 'salary').reduce((s, e) => s + parseFloat(e.amount), 0).toFixed(2)}`}
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredExpenses.length === 0 ? (
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
                  <TableCell className="font-bold text-red-600">-RM {parseFloat(expense.amount).toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{expense.recorded_by.name}</TableCell>
                  <TableCell className="text-right">
                    {can('delete-expenses') && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <FileText className="w-4 h-4" />
                      </Button>
                    )}
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
