self.addEventListener('install', (e) => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

// 최소한의 Fetch 이벤트 리스너(오프라인 캐싱은 구현하지 않고 그냥 통과시킴, 구글 크롬 PWA 설치 프롬프트 띄우기 용도)
self.addEventListener('fetch', (e) => {
  // do nothing
});
