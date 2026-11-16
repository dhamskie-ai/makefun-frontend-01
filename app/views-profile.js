// views-profile.js — an account's public profile (#/account/<handle>): avatar,
// bio, record and entries. The avatar is an image the API itself points at,
// so it loads with crossorigin="anonymous" (make.fun sends
// Cross-Origin-Resource-Policy: same-origin on its images).
import { getProfile } from './api.js';
import { esc, moneyUsd, fmtInt, fmtDate } from './format.js';

export async function renderProfile(view, handle) {
  view.innerHTML = '<p class="loading">Loading profile…</p>';
  const p = await getProfile(handle);
  const rec = p.record || {};
  const sols = p.solutions || [];
  const stats = [
    ['Entered', fmtInt(rec.competitions_entered)],
    ['Placed', fmtInt(rec.competitions_placed)],
    ['Won', fmtInt(rec.competitions_won)],
    ['Best place', rec.best_placement != null ? '#' + fmtInt(rec.best_placement) : '—'],
    ['Prize money', moneyUsd(rec.prize_usd)],
  ];
  const statHtml = stats.map(([k, v]) => `<div><div class="k">${k}</div><div class="v">${v}</div></div>`).join('');
  const rows = sols.map((s) => `<tr>
    <td><a href="#/bounty/${esc(s.competition?.slug || '')}">${esc(s.title || '—')}</a></td>
    <td>${esc(s.competition?.title || '')}</td>
    <td class="num">${s.placement != null ? '#' + fmtInt(s.placement) : '—'}</td>
    <td class="num">${s.prize_usd != null ? moneyUsd(s.prize_usd) : '—'}</td>
    <td>${esc(fmtDate(s.entered_at))}</td>
  </tr>`).join('');
  const links = [
    p.github_login ? `GitHub @${esc(p.github_login)}` : '',
    p.x ? `X @${esc(p.x)}` : '',
  ].filter(Boolean).join(' · ');
  view.innerHTML = `<p class="linkrow"><a href="#/">← All bounties</a></p>
    <div class="profile-head">
      ${p.image ? `<img src="${esc(p.image)}" alt="" crossorigin="anonymous" referrerpolicy="no-referrer">` : ''}
      <div class="who">
        <p class="handle">@${esc(p.handle)}</p>
        ${p.display_name ? `<p class="muted">${esc(p.display_name)}</p>` : ''}
        ${p.bio ? `<p class="bio">${esc(p.bio)}</p>` : ''}
        <p class="small muted">Joined ${esc(fmtDate(p.joined_at))}${links ? ' · ' + links : ''}</p>
      </div>
    </div>
    <div class="kv">${statHtml}</div>
    <h2>Entries (${sols.length})</h2>
    ${rows ? `<table><thead><tr><th>Entry</th><th>Bounty</th><th class="num">Place</th><th class="num">Prize</th><th>Entered</th></tr></thead><tbody>${rows}</tbody></table>` : '<p class="muted">No public entries yet.</p>'}
    <p class="small muted"><a href="https://make.fun/u/${esc(p.handle)}" target="_blank" rel="noopener">View @${esc(p.handle)} on make.fun ↗</a></p>`;
}
