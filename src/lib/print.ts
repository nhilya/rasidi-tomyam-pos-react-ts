export function printElement(element: HTMLElement, title = 'Receipt') {
  const styles = Array.from(document.querySelectorAll('style'))
    .map(s => s.outerHTML)
    .join('');
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map(l => l.outerHTML)
    .join('');

  const win = window.open('', '_blank', 'width=480,height=800');
  if (!win) {
    window.print();
    return;
  }

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  ${links}
  ${styles}
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 1rem; background: #fff; display: flex; justify-content: center; }
    .no-print { display: none !important; }
  </style>
</head>
<body>${element.outerHTML}</body>
</html>`);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 300);
}
