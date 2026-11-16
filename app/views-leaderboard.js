// views-leaderboard.js — a bounty's leaderboard (#/bounty/<slug>/leaderboard):
// entries ranked by judge win rate, paged 20 at a time; each entrant links
// to their public profile. The pager rewrites only the table, not the page.
import { getLeaderboard } from './api.js';
import { esc, fmtInt } from './format.js';

const PER_PAGE = 20;

function rate(entry) {
  const v = entry.values?.judge;
  return typeof v === 'number' ? (v / 10000).toFixed(1) + '%' : '—';
}

export async function renderLeaderboard(view, slug) {
  view.innerHTML = '<p class="loading">Loading leaderboard…</p>';
  const data = await getLeaderboard(slug);
  const entries = data.entries || [];
  const title = data.competition?.title || slug;
  const totalPages = Math.max(1, Math.ceil(entries.length / PER_PAGE));
  let page = 0;

  const tableHtml = () => {
    const slice = entries.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
    const rows = slice.map((e) => `<tr>
      <td>${esc(e.rank ?? '—')}</td>
      <td><a href="#/account/${esc(e.handle)}">${esc(e.handle)}</a></td>
      <td>${esc(e.title || '—')}</td>
      <td class="num">${esc(rate(e))}</td>
      <td class="num">${e.values?.bytes != null ? fmtInt(e.values.bytes) + ' B' : '—'}</td>
    </tr>`).join('');
    return `<table><thead><tr><th>Rank</th><th>Entrant</th><th>Entry</th><th class="num">Win rate</th><th class="num">Size</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="pager">
      <button class="btn ghost" id="lb-prev" ${page === 0 ? 'disabled' : ''}>← Prev</button>
      <span class="pageinfo">Page ${page + 1} of ${totalPages} · ${entries.length} entries</span>
      <button class="btn ghost" id="lb-next" ${page >= totalPages - 1 ? 'disabled' : ''}>Next →</button>
    </div>`;
  };

  const wirePager = () => {
    const list = view.querySelector('#lb-list');
    const prev = view.querySelector('#lb-prev');
    const next = view.querySelector('#lb-next');
    if (prev) prev.addEventListener('click', () => { page -= 1; list.innerHTML = tableHtml(); wirePager(); });
    if (next) next.addEventListener('click', () => { page += 1; list.innerHTML = tableHtml(); wirePager(); });
  };

  view.innerHTML = `<p class="linkrow"><a href="#/bounty/${esc(slug)}">← Back to bounty</a><a href="#/">All bounties</a></p>
    <h1>Leaderboard</h1>
    <p class="lede">${esc(title)} · ${entries.length} entries ranked by judge win rate.</p>
    <div id="lb-list">${tableHtml()}</div>`;
  wirePager();
}
