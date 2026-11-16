// views-board.js — the bounty board (#/): live bounties with reward / live
// pot, entry fee, deadline and time left, and entry count. The list is
// fetched once (api.js revalidates it with ETags on revisit) and paged
// client-side; the pager rewrites only the list, never the whole page.
import { listCompetitions } from './api.js';
import { esc, moneyUsd, fmtInt, potOf, timeLeft, entriesOpen } from './format.js';

const PER_PAGE = 12;

const board = { items: [], filter: 'open', page: 0, loaded: false };

function card(b) {
  const open = entriesOpen(b);
  const fee = b.entryFeeUsd != null && b.entryFeeUsd !== ''
    ? `<dt>Entry fee</dt><dd class="fee">${moneyUsd(b.entryFeeUsd)}</dd>` : '';
  const blurb = esc((b.summary || b.description || '').slice(0, 140));
  return `<article class="card">
    <div class="cat">${esc(b.category || 'Bounty')} · ${esc(b.sponsor?.name || '')}</div>
    <h3><a href="#/bounty/${esc(b.slug)}">${esc(b.title)}</a></h3>
    <dl class="facts">
      <dt>Reward</dt><dd class="pot">${esc(potOf(b))}</dd>
      ${fee}
      <dt>Time left</dt><dd class="left">${esc(timeLeft(b.deadline))}</dd>
      <dt>Entries</dt><dd>${fmtInt(b.submissionCount)}</dd>
    </dl>
    <p class="desc">${blurb}</p>
    <a class="go" href="#/bounty/${esc(b.slug)}">${open ? 'Enter →' : 'View results →'}</a>
  </article>`;
}

function visibleItems() {
  if (board.filter === 'open') return board.items.filter(entriesOpen);
  if (board.filter === 'closed') return board.items.filter((b) => !entriesOpen(b));
  return board.items;
}

function listHtml() {
  const items = visibleItems();
  const pages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  board.page = Math.min(board.page, pages - 1);
  const slice = items.slice(board.page * PER_PAGE, (board.page + 1) * PER_PAGE);
  const cards = slice.map(card).join('') || '<p class="muted">No bounties in this view.</p>';
  return `<div class="grid">${cards}</div>
  <div class="pager">
    <button class="btn ghost" id="prev-page" ${board.page === 0 ? 'disabled' : ''}>← Newer</button>
    <span class="pageinfo">Page ${board.page + 1} of ${pages} · ${items.length} bounties</span>
    <button class="btn ghost" id="next-page" ${board.page >= pages - 1 ? 'disabled' : ''}>Older →</button>
  </div>`;
}

function wirePager(view) {
  const list = view.querySelector('#board-list');
  const repaginate = () => { list.innerHTML = listHtml(); wirePager(view); };
  const prev = view.querySelector('#prev-page');
  const next = view.querySelector('#next-page');
  if (prev) prev.addEventListener('click', () => { board.page -= 1; repaginate(); });
  if (next) next.addEventListener('click', () => { board.page += 1; repaginate(); });
}

export async function renderBoard(view) {
  if (!board.loaded) {
    view.innerHTML = '<p class="loading">Loading live bounties from make.fun…</p>';
    board.items = await listCompetitions();
    board.loaded = true;
  }
  const open = board.items.filter(entriesOpen).length;
  const pot = board.items.reduce((s, b) => s + (parseFloat(b.potUsd ?? b.rewardAmount) || 0), 0);
  view.innerHTML = `<h1>Live bounties</h1>
    <p class="lede">${open} open for entries · ${board.items.length} listed · ${moneyUsd(pot)} in rewards on the board. Entry availability follows each bounty's deadline.</p>
    <div class="tabs" role="group" aria-label="Filter bounties">
      <button class="btn ${board.filter === 'open' ? '' : 'ghost'}" data-filter="open" aria-pressed="${board.filter === 'open'}">Open for entries</button>
      <button class="btn ${board.filter === 'all' ? '' : 'ghost'}" data-filter="all" aria-pressed="${board.filter === 'all'}">All</button>
      <button class="btn ${board.filter === 'closed' ? '' : 'ghost'}" data-filter="closed" aria-pressed="${board.filter === 'closed'}">Closed</button>
    </div>
    <div id="board-list">${listHtml()}</div>`;
  view.querySelectorAll('[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      board.filter = btn.dataset.filter;
      board.page = 0;
      renderBoard(view);
    });
  });
  wirePager(view);
}
