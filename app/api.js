// api.js — read-only GET client for make.fun's public API, with ETag revalidation.
// make.fun's ETags are bound to the minute: an If-None-Match inside the same
// minute answers 304, so revalidating on every navigation costs almost nothing.
export const API = 'https://make.fun/api';

// url -> { etag, body, at }: one entry per endpoint, kept for the session.
const cache = new Map();
let requests = 0;

async function getJson(path) {
  const url = API + path;
  const hit = cache.get(url);
  const headers = { Accept: 'application/json' };
  if (hit && hit.etag) headers['If-None-Match'] = hit.etag;
  requests += 1;
  const res = await fetch(url, { headers });
  if (res.status === 304 && hit) {
    hit.at = Date.now();
    return hit.body;
  }
  if (!res.ok) {
    const err = new Error(`make.fun API ${res.status} for ${path}`);
    err.status = res.status;
    throw err;
  }
  const body = await res.json();
  const etag = res.headers.get('etag');
  cache.set(url, { etag, body, at: Date.now() });
  return body;
}

// The competitions list paginates with next_cursor; follow it until done.
export async function listCompetitions() {
  const items = [];
  let cursor = null;
  for (let page = 0; page < 10; page++) {
    const q = '?status=open&limit=50' + (cursor ? '&cursor=' + encodeURIComponent(cursor) : '');
    const data = await getJson('/competitions' + q);
    items.push(...(data.items || []));
    cursor = data.next_cursor || null;
    if (!cursor) break;
  }
  return items;
}

export function getCompetition(slug) {
  return getJson('/competitions/' + encodeURIComponent(slug));
}

export function getLeaderboard(slug) {
  return getJson('/competitions/' + encodeURIComponent(slug) + '/leaderboard');
}

export function getProfile(handle) {
  return getJson('/profiles/' + encodeURIComponent(handle));
}

// How many API calls this session has made (shown in the footer of each view).
export function requestCount() {
  return requests;
}
