import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getTables, createTable, deleteTable } from '@/api/tables';
import { ApiError } from '@/lib/api';
import type { ApiTable } from '@/api/types';

const BRAND = 'RASIDI TOMYAM';

function getSvgFromRef(ref: HTMLDivElement | null): SVGSVGElement | null {
  return ref?.querySelector('svg') ?? null;
}

function downloadSticker(table: ApiTable, svgEl: SVGSVGElement | null) {
  if (!svgEl) { toast.error('QR not ready'); return; }

  const W = 420, H = 520;
  const QR_SIZE = 240;
  const QR_X = (W - QR_SIZE) / 2;
  const QR_Y = 180;

  const svgData = new XMLSerializer().serializeToString(svgEl);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // outer border
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    // brand
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 20px serif';
    ctx.textAlign = 'center';
    ctx.fillText(BRAND, W / 2, 46);

    // divider
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, 62); ctx.lineTo(W - 40, 62); ctx.stroke();

    // label
    ctx.fillStyle = '#6b7280';
    ctx.font = '13px sans-serif';
    ctx.fillText('MEJA · TABLE', W / 2, 88);

    // table number
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 76px sans-serif';
    ctx.fillText(table.number, W / 2, 165);

    // QR code
    ctx.drawImage(img, QR_X, QR_Y, QR_SIZE, QR_SIZE);

    // divider
    const divY = QR_Y + QR_SIZE + 18;
    ctx.strokeStyle = '#e5e7eb';
    ctx.beginPath(); ctx.moveTo(40, divY); ctx.lineTo(W - 40, divY); ctx.stroke();

    // scan text
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Imbas untuk memesan', W / 2, divY + 26);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px sans-serif';
    ctx.fillText('Scan to order', W / 2, divY + 44);

    URL.revokeObjectURL(url);

    const a = document.createElement('a');
    a.download = `sticker-meja-${table.number}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };
  img.src = url;
}

function printSticker(table: ApiTable, svgEl: SVGSVGElement | null) {
  if (!svgEl) { toast.error('QR not ready'); return; }

  const svgClone = svgEl.cloneNode(true) as SVGSVGElement;
  svgClone.setAttribute('width', '50mm');
  svgClone.setAttribute('height', '50mm');
  const svgString = new XMLSerializer().serializeToString(svgClone);

  const win = window.open('', '_blank');
  if (!win) { toast.error('Allow popups to print'); return; }

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Sticker – Meja ${table.number}</title>
  <style>
    @page { size: 80mm 105mm; margin: 0; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 80mm; height: 105mm; background: #fff; }
    body { display: flex; justify-content: center; align-items: center; }
    .sticker {
      width: 76mm; height: 101mm;
      border: 1.5px solid #d1d5db;
      border-radius: 3mm;
      display: flex; flex-direction: column;
      align-items: center; justify-content: space-between;
      padding: 5mm 4mm;
      text-align: center;
      font-family: system-ui, sans-serif;
    }
    .brand { font-family: Georgia, serif; font-size: 11pt; font-weight: bold; letter-spacing: 1.5px; color: #111; }
    .divider { width: 70%; border: none; border-top: 1px solid #e5e7eb; margin: 1.5mm 0; }
    .label { font-size: 7pt; color: #6b7280; letter-spacing: 1px; }
    .number { font-size: 32pt; font-weight: 900; color: #111; line-height: 1.1; }
    .qr { padding: 2mm; }
    .scan { font-size: 8.5pt; font-weight: 600; color: #374151; }
    .scan-sub { font-size: 7pt; color: #9ca3af; margin-top: 0.8mm; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="sticker">
    <div>
      <div class="brand">${BRAND}</div>
      <hr class="divider"/>
      <div class="label">MEJA &middot; TABLE</div>
      <div class="number">${table.number}</div>
    </div>
    <div class="qr">${svgString}</div>
    <div>
      <hr class="divider"/>
      <div class="scan">Imbas untuk memesan</div>
      <div class="scan-sub">Scan to order</div>
    </div>
  </div>
  <script>setTimeout(() => { window.print(); window.close(); }, 400);</script>
</body>
</html>`);
  win.document.close();
}

export default function QRGenerator() {
  const { t } = useTranslation();
  const [tables, setTables] = React.useState<ApiTable[]>([]);
  const [newTableNumber, setNewTableNumber] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);
  const svgRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());

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
      svgRefs.current.delete(id);
    } catch {
      toast.error('Failed to delete table');
    }
  };

  const baseUrl = window.location.origin + '/menu?token=';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">{t('qr.title')}</h2>
          <p className="text-muted-foreground">{t('qr.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder={t('qr.tablePlaceholder')}
            className="h-9 w-28"
            value={newTableNumber}
            onChange={e => setNewTableNumber(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <Button onClick={handleAdd} disabled={creating || !newTableNumber.trim()}>
            {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            {t('qr.addTable')}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading tables…
        </div>
      ) : tables.length === 0 ? (
        <p className="text-muted-foreground text-sm">No tables yet. Add one above.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map(table => {
            const qrUrl = `${baseUrl}${table.qr_token}`;
            return (
              <Card key={table.id} className="border-border shadow-sm overflow-hidden">
                {/* hidden SVG for canvas/print */}
                <div
                  ref={el => { if (el) svgRefs.current.set(table.id, el); }}
                  className="hidden"
                  aria-hidden
                >
                  <QRCodeSVG value={qrUrl} size={300} level="H" />
                </div>

                <CardContent className="p-0 relative">
                  {/* delete — top right */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(table.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>

                  {/* sticker preview */}
                  <div className="flex flex-col items-center gap-3 p-5 pb-4 border-b border-border bg-white dark:bg-white text-black">
                    <div className="text-center">
                      <p className="font-serif font-bold tracking-widest text-sm text-black">{BRAND}</p>
                      <div className="h-px bg-gray-200 my-1.5 w-32 mx-auto" />
                      <p className="text-[10px] text-gray-500 tracking-widest font-medium">MEJA · TABLE</p>
                      <p className="text-4xl font-black text-black leading-tight mt-0.5">{table.number}</p>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <QRCodeSVG value={qrUrl} size={148} level="H" />
                    </div>
                    <div className="text-center">
                      <div className="h-px bg-gray-200 mb-2 w-28 mx-auto" />
                      <p className="text-[11px] font-semibold text-gray-700">Imbas untuk memesan</p>
                      <p className="text-[10px] text-gray-400">Scan to order</p>
                    </div>
                  </div>

                  {/* actions */}
                  <div className="grid grid-cols-2 divide-x divide-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-none h-10 text-xs font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => downloadSticker(table, getSvgFromRef(svgRefs.current.get(table.id) ?? null))}
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      {t('qr.save')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-none h-10 text-xs font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => printSticker(table, getSvgFromRef(svgRefs.current.get(table.id) ?? null))}
                    >
                      <Printer className="w-3.5 h-3.5 mr-1.5" />
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
