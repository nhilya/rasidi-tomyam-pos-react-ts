import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, Plus } from 'lucide-react';

import { useTranslation } from 'react-i18next';

export default function QRGenerator() {
  const { t } = useTranslation();
  const [tables, setTables] = React.useState(['1', '2', '3', '4', '5']);
  const [newTable, setNewTable] = React.useState('');

  const addTable = () => {
    if (newTable && !tables.includes(newTable)) {
      setTables([...tables, newTable].sort((a, b) => parseInt(a) - parseInt(b)));
      setNewTable('');
    }
  };

  const baseUrl = window.location.origin + '/menu?table=';

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
            value={newTable}
            onChange={(e) => setNewTable(e.target.value)}
          />
          <Button onClick={addTable}>
            <Plus className="w-4 h-4 mr-2" />
            {t('qr.addTable')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => (
          <Card key={table} className="border-border shadow-sm overflow-hidden group">
            <CardHeader className="bg-muted border-b border-border py-3">
              <CardTitle className="text-center text-sm font-bold text-foreground">{t('nav.table', { number: table })}</CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex flex-col items-center gap-6">
              <div className="p-4 bg-white rounded-2xl shadow-inner border border-border">
                <QRCodeSVG 
                  value={`${baseUrl}${table}`} 
                  size={160}
                  level="H"
                />
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground font-mono break-all max-w-[180px]">
                  {baseUrl}{table}
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
        ))}
      </div>
    </div>
  );
}
