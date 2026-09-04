const CACHE_NAME = 'rocket-cp-calculator-v4';
const ASSETS = [
  './',
  './index.html',
  './cpCalculator.js',
  './manifest.json',
  './image/rocket.png',
  './image/icon32.png',
  './image/icon64.png',
  './image/icon128.png',
  './image/icon256.png',
  './image/icon512.png',
  './image/icon1024.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      // 待機せずに新しい Service Worker へ交代する。
      // これが無いと、サイトのタブを全部閉じるまで古い版が動き続ける。
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(keys.map(key => (key !== CACHE_NAME ? caches.delete(key) : null)))
      )
      // すでに開いているタブも、すぐ新しい Service Worker の管理下に置く。
      .then(() => self.clients.claim())
  );
});

/**
 * ページ本体(HTML)はネットワーク優先、それ以外はキャッシュ優先。
 *
 * HTML までキャッシュ優先にすると、サイトを更新しても古い画面が出続ける。
 * オンラインなら常に最新を取りに行き、つながらないときだけキャッシュを使う。
 */
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  // 別ドメインへのリクエストには手を出さない
  if (new URL(request.url).origin !== self.location.origin) return;

  const isPage = request.mode === 'navigate' || request.destination === 'document';
  event.respondWith(isPage ? networkFirst(request) : cacheFirst(request));
});

/**
 * まずネットワーク。だめならキャッシュ。それも無ければトップページを返す。
 *
 * cache:'reload' でブラウザの HTTP キャッシュも迂回する。これが無いと、
 * サーバーに問い合わせたつもりでも HTTP キャッシュの古い HTML が返ってくる。
 * request をそのまま渡すと mode:'navigate' のため init を付けられないので、
 * URL 文字列から取り直している。
 */
function networkFirst(request) {
  return fetch(request.url, { cache: 'reload', credentials: 'same-origin' })
    .then(response => {
      store(request, response.clone());
      return response;
    })
    .catch(() =>
      caches.match(request).then(cached => cached || caches.match('./index.html'))
    );
}

/** まずキャッシュ。無ければネットワークから取って保存する。 */
function cacheFirst(request) {
  return caches.match(request).then(cached =>
    cached || fetch(request).then(response => {
      store(request, response.clone());
      return response;
    })
  );
}

function store(request, response) {
  if (!response || !response.ok) return;
  caches.open(CACHE_NAME).then(cache => cache.put(request, response));
}
