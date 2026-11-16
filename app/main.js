// main.js — hash router for the four surfaces. Each view module is loaded
// with a literal import() only when its route is first visited, so the first
// load is just index.html, the stylesheet and this file; the view code and
// the API client follow on demand. Every route sets window.__shotReady =
// false while it loads and true once its data rendered, so a screenshot
// script can wait on it.
const view = document.getElementById('view');

function parseRoute() {
  const hash = location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/').filter(Boolean);
  if (parts.length === 0) return { name: 'board' };
  if (parts[0] === 'bounty' && parts[1] && parts[2] === 'leaderboard') {
    return { name: 'leaderboard', slug: decodeURIComponent(parts[1]) };
  }
  if (parts[0] === 'bounty' && parts[1]) {
    return { name: 'bounty', slug: decodeURIComponent(parts[1]) };
  }
  if (parts[0] === 'account' && parts[1]) {
    return { name: 'profile', handle: decodeURIComponent(parts[1]) };
  }
  return { name: 'board' };
}

async function route() {
  window.__shotReady = false;
  const r = parseRoute();
  try {
    if (r.name === 'board') {
      const m = await import('./views-board.js');
      await m.renderBoard(view);
    } else if (r.name === 'bounty') {
      const m = await import('./views-bounty.js');
      await m.renderBounty(view, r.slug);
    } else if (r.name === 'leaderboard') {
      const m = await import('./views-leaderboard.js');
      await m.renderLeaderboard(view, r.slug);
    } else {
      const m = await import('./views-profile.js');
      await m.renderProfile(view, r.handle);
    }
  } catch (err) {
    view.innerHTML = `<p class="error">Could not load this view: ${err.message}.</p>
      <p><a href="#/">Back to the board</a> · <a href="https://make.fun">make.fun ↗</a></p>`;
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

document.getElementById('acct-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const handle = new FormData(e.target).get('handle').trim().replace(/^@/, '');
  if (handle) location.hash = '#/account/' + encodeURIComponent(handle);
});

window.addEventListener('hashchange', route);
route();
