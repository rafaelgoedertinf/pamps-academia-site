// Service worker do painel da Pamp's (/admin/): permite instalar como aplicativo e mostra os avisos por push.
// Não guarda páginas em cache (o painel precisa dos dados ao vivo).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { corpo: e.data && e.data.text() }; }
  const titulo = d.titulo || "Pamp's";
  e.waitUntil(self.registration.showNotification(titulo, {
    body: d.corpo || "Nova mensagem",
    tag: d.tag || undefined,
    renotify: !!d.tag,
    icon: "/admin/app/icone-192.png",
    badge: "/admin/app/badge-96.png",
    data: { url: d.url || "/admin/conversas" },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL(e.notification.data?.url || "/admin/conversas", self.location.origin).href;
  e.waitUntil((async () => {
    const abertas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of abertas) {
      if (c.url.includes("/admin")) { await c.focus(); if ("navigate" in c) return c.navigate(url); return; }
    }
    return self.clients.openWindow(url);
  })());
});
