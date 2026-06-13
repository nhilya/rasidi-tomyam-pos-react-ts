import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getTables, createTable, deleteTable } from '@/api/tables';
import { ApiError } from '@/lib/api';
import type { ApiTable } from '@/api/types';

export default function QRGenerator() {
  const { t } = useTranslation();
  const [tables, setTables] = React.useState<ApiTable[]>([]);
  const [newTableNumber, setNewTableNumber] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    getTables()
      .then(res => setTables(res.data))
      .catch(() => toast.error('Failed to load tables'))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    const num = newTableNumber.trim();
    if (!num) return;
    setCreating(true);
    try {
      const table = await createTable(num);
      setTables(prev => [...prev, table].sort((a, b) => a.number.localeCompare(b.number)));
      setNewTableNumber('');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create table');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTable(id);
      setTables(prev => prev.filter(t => t.id !== id));
    } catch {
      toast.error('Failed to delete table');
    }
  };

  const baseUrl = window.location.origin + '/menu?token=';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">{t('qr.title')}</h2>
          <p className="text-muted-foreground">{t('qr.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder={t('qr.tablePlaceholder')}
            className="h-8 w-24"
            value={newTableNumber}
            onChange={(e) => setNewTableNumber(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button onClick={handleAdd} disabled={creating || !newTableNumber.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            {t('qr.addTable')}
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading tables…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map((table) => {
            const qrUrl = `${baseUrl}${table.qr_token}`;
            return (
              <Card key={table.id} className="border-border shadow-sm overflow-hidden group">
                <CardHeader className="bg-muted border-b border-border py-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground">
                    {t('nav.table', { number: table.number })}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(table.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </CardHeader>
                <CardContent className="p-8 flex flex-col items-center gap-6">
                  <div className="p-4 bg-white rounded-2xl shadow-inner border border-border">
                    <QRCodeSVG value={qrUrl} size={160} level="H" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground font-mono break-all max-w-[180px]">
                      {qrUrl}
                    </p>
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="w-3 h-3 mr-2" />
                      {t('qr.save')}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Printer className="w-3 h-3 mr-2" />
                      {t('qr.print')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
