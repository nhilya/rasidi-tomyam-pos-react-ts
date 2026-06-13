import type { ApiOrder } from '@/api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface ReceiptProps {
  order: ApiOrder;
}

export default function Receipt({ order }: ReceiptProps) {
  const { t } = useTranslation();

  const total = parseFloat(order.total_amount);
  const discount = parseFloat(order.discount_amount);

  return (
    <Card className="w-full max-w-sm mx-auto bg-card shadow-none border-border font-mono text-sm">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl font-serif font-bold text-foreground">Rasidi Tomyam</CardTitle>
        <p className="text-xs text-muted-foreground">123 Flavor Street, Food City</p>
        <p className="text-xs text-muted-foreground">Tel: +60 12-345 6789</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between text-[10px] text-muted-foreground uppercase">
          <span>{t('receipt.orderId')}{String(order.id).slice(0, 8)}</span>
          <span>{new Date(order.created_at).toLocaleString()}</span>
        </div>

        <Separator className="border-dashed" />

        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-foreground">
              <div className="flex-1">
                <p>{item.menu_item.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {item.quantity} x RM {parseFloat(item.price_at_sale).toFixed(2)}
                </p>
              </div>
              <p className="font-bold">RM {parseFloat(item.subtotal).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <Separator className="border-dashed" />

        <div className="space-y-1 text-foreground">
          <div className="flex justify-between">
            <span>{t('receipt.subtotal')}</span>
            <span>RM {total.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>{t('receipt.discount')}</span>
              <span>-RM {discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
            <span>{t('receipt.total')}</span>
            <span>RM {(total - discount).toFixed(2)}</span>
          </div>
        </div>

        <div className="pt-4 text-center space-y-4">
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">{t('receipt.paymentMethod')}</p>
            <p className="font-bold capitalize text-foreground">
              {order.payment_method || t('receipt.pending')}
            </p>
          </div>

          <p className="text-xs italic text-muted-foreground">{t('receipt.thanks')}</p>

          <div className="flex gap-2 no-print">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => window.print()}>
              <Printer className="w-3 h-3 mr-2" />
              {t('receipt.print')}
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Download className="w-3 h-3 mr-2" />
              {t('receipt.save')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
