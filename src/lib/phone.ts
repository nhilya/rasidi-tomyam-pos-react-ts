export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '');

  if (d.startsWith('011')) {
    const n = d.slice(0, 11);
    if (n.length <= 3) return n;
    if (n.length <= 7) return `${n.slice(0, 3)}-${n.slice(3)}`;
    return `${n.slice(0, 3)}-${n.slice(3, 7)} ${n.slice(7)}`;
  }

  if (d.startsWith('01')) {
    const n = d.slice(0, 10);
    if (n.length <= 3) return n;
    if (n.length <= 6) return `${n.slice(0, 3)}-${n.slice(3)}`;
    return `${n.slice(0, 3)}-${n.slice(3, 6)} ${n.slice(6)}`;
  }

  if (d.startsWith('0')) {
    const n = d.slice(0, 10);
    if (n.length <= 2) return n;
    if (n.length <= 6) return `${n.slice(0, 2)}-${n.slice(2)}`;
    return `${n.slice(0, 2)}-${n.slice(2, 6)} ${n.slice(6)}`;
  }

  return d.slice(0, 12);
}

export function rawPhone(formatted: string): string {
  return formatted.replace(/\D/g, '');
}
