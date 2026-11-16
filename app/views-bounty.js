// views-bounty.js — a bounty's page (#/bounty/<slug>): summary, description,
// rewards table with the live pot, dates and status. Entry availability is
// decided by the deadline, never by status alone.
import { getCompetition } from './api.js';
import { esc, moneyUsd, fmtInt, potOf, timeLeft, entriesOpen, fmtDate, fmtDateTime, renderMd } from './format.js';

function rewardRows(b) {
  const now = b.rewardsNow;
  if (Array.isArray(now) && now.length) {
    return now.map((r) => `<tr><td>${esc(r.place)}</td><td class="num">${moneyUsd(r.baseUsd)}</td><td class="num">${moneyUsd(r.feeShareUsd)}</td><td class="num"><strong>${moneyUsd(r.amountUsd)}</strong></td></tr>`).join('');
  }
  return Object.entries(b.rewards || {}).map(([place, amt]) =>
    `<tr><td>${esc(place)}</td><td class="num" colspan="3">${moneyUsd(amt)}</td></tr>`).join('');
}

export async function renderBounty(view, slug) {
  view.innerHTML = '<p class="loading">Loading bounty…</p>';
  const b = await getCompetition(slug);
  const open = entriesOpen(b);
  const facts = [
    ['Live pot', esc(potOf(b))],
    ...(b.entryFeeUsd != null && b.entryFeeUsd !== '' ? [['Entry fee', moneyUsd(b.entryFeeUsd)]] : []),
    ['Time left', esc(timeLeft(b.deadline))],
    ['Entries', fmtInt(b.submissionCount)],
    ['Deadline', `<small>${esc(fmtDateTime(b.deadline))}</small>`],
    ['Category', `<small>${esc(b.category || '—')}</small>`],
  ];
  const factHtml = facts.map(([k, v]) => `<div><div class="k">${k}</div><div class="v">${v}</div></div>`).join('');
  const rows = rewardRows(b);
  view.innerHTML = `<p class="linkrow"><a href="#/">← All bounties</a><a href="#/bounty/${esc(b.slug)}/leaderboard">Leaderboard →</a><a href="https://make.fun/bounty/${esc(b.slug)}" target="_blank" rel="noopener">View on make.fun ↗</a></p>
    <span class="badge ${open ? 'open' : 'closed'}">${open ? 'Open for entries' : 'Closed'}</span>
    <h1>${esc(b.title)}</h1>
    <p class="lede">${esc(b.summary || '')}</p>
    <div class="kv">${factHtml}</div>
    ${rows ? `<h2>Rewards — live pot ${esc(potOf(b))}</h2>
    <table><thead><tr><th>Place</th><th class="num">Base</th><th class="num">Fee share</th><th class="num">Total now</th></tr></thead><tbody>${rows}</tbody></table>` : ''}
    <h2>About this bounty</h2>
    <div class="prose">${renderMd(b.description || '')}</div>
    <p class="small muted">Sponsor: ${esc(b.sponsor?.name || '—')}${b.sponsor?.isVerified ? ' ✓ verified' : ''} · Published ${esc(fmtDate(b.publishedAt))} · Status on make.fun: ${esc(b.status || '—')}</p>`;
}
