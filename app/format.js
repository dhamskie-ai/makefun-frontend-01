// format.js — money, dates and safe text for the make.fun board.

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export function moneyUsd(v) {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (!Number.isFinite(n)) return '—';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
}

export function fmtInt(n) {
  return Number(n || 0).toLocaleString('en-US');
}

// A bounty's live pot when the API reports one, else its base reward.
export function potOf(b) {
  if (b.potUsd != null && b.potUsd !== '') return moneyUsd(b.potUsd);
  return moneyUsd(b.rewardAmount);
}

// "2d 5h left" / "Ends in 40m" / "Closed 3d ago" — entry availability is
// decided by the deadline, never by status alone: a bounty past its deadline
// may still read status "open" until its results are published.
export function timeLeft(deadline) {
  if (!deadline) return 'No deadline';
  const ms = new Date(deadline).getTime() - Date.now();
  const abs = Math.abs(ms);
  const d = Math.floor(abs / 86400000);
  const h = Math.floor((abs % 86400000) / 3600000);
  const m = Math.floor((abs % 3600000) / 60000);
  const span = d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
  return ms > 0 ? span + ' left' : 'Closed ' + span + ' ago';
}

export function entriesOpen(b) {
  return b.deadline ? new Date(b.deadline).getTime() > Date.now() : b.status === 'open';
}

export function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// Render a competition's markdown-ish description as safe HTML: paragraphs,
// ## / ### headings, - lists and `code`. Anything else is plain text.
export function renderMd(md) {
  const lines = String(md || '').split('\n');
  let html = '';
  let inList = false;
  const closeList = () => { if (inList) { html += '</ul>'; inList = false; } };
  const inline = (t) => esc(t).replace(/`([^`]+)`/g, '<code>$1</code>');
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith('### ')) { closeList(); html += '<h3>' + inline(line.slice(4)) + '</h3>'; }
    else if (line.startsWith('## ')) { closeList(); html += '<h2>' + inline(line.slice(3)) + '</h2>'; }
    else if (line.startsWith('- ')) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += '<li>' + inline(line.slice(2)) + '</li>';
    } else if (line.trim() === '') { closeList(); }
    else { closeList(); html += '<p>' + inline(line) + '</p>'; }
  }
  closeList();
  return html;
}
