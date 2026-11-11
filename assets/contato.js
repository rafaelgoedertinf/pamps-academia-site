// Formulário "Fale com a gente": nome, telefone e mensagem vão direto para o CRM da Pamp's
// (RPC criar_lead no Supabase compartilhado, empresa "pamps"). A chave abaixo é a pública (anon).
(function () {
  var URL = "https://ypeykhkzkzhcxkfirahj.supabase.co/rest/v1/rpc/criar_lead";
  var KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZXlraGt6a3poY3hrZmlyYWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzMzc0NTAsImV4cCI6MjEwOTkxMzQ1MH0.z2BVBnWab8M9ZhOX5K5VO1R9kCkk-WojFViVrrGDxsE";
  var WA = "https://wa.me/554733325868?text=" + encodeURIComponent("Olá! Vim pelo site e quero conhecer a Pamp's Academia.");

  var html =
    '<div class="ct" data-lenis-prevent role="dialog" aria-modal="true" aria-labelledby="ct-t" hidden>' +
    '<div class="ct__fundo" data-fechar></div>' +
    '<div class="ct__caixa">' +
    '<button class="ct__x" type="button" data-fechar aria-label="Fechar">×</button>' +
    '<form class="ct__form" novalidate>' +
    '<p class="ct__k">Fale com a gente</p>' +
    '<h2 class="ct__t" id="ct-t">Vamos conversar<br><em>sobre o seu treino.</em></h2>' +
    '<p class="ct__s">Deixe seus dados que a recepção chama você no WhatsApp.</p>' +
    '<label class="ct__c"><span>Nome</span><input name="nome" autocomplete="name" required maxlength="120" placeholder="Seu nome"></label>' +
    '<label class="ct__c"><span>Telefone / WhatsApp</span><input name="telefone" type="tel" inputmode="tel" autocomplete="tel-national" required placeholder="(47) 99999-9999"></label>' +
    '<label class="ct__c"><span>Mensagem</span><textarea name="mensagem" rows="3" maxlength="1500" placeholder="Conte o que você procura (opcional)"></textarea></label>' +
    '<p class="ct__erro" aria-live="polite"></p>' +
    '<button class="btn btn--volt ct__env" type="submit"><span>Enviar</span><b>↗</b></button>' +
    '<p class="ct__priv">Usamos seus dados só para responder ao seu contato.</p>' +
    '</form>' +
    '<div class="ct__ok" hidden>' +
    '<p class="ct__k">Recebido</p>' +
    '<h2 class="ct__t">Obrigado,<br><em class="ct__nome">até já!</em></h2>' +
    '<p class="ct__s">A recepção vai falar com você pelo WhatsApp em breve. Se preferir, chame agora:</p>' +
    '<a class="btn btn--ghost" target="_blank" rel="noopener" href="' + WA + '"><span>Abrir o WhatsApp</span></a>' +
    '</div>' +
    '</div></div>';

  var wrap = document.createElement("div");
  wrap.innerHTML = html;
  var ct = wrap.firstChild;
  document.body.appendChild(ct);
  var form = ct.querySelector("form");
  var erro = ct.querySelector(".ct__erro");
  var env = ct.querySelector(".ct__env");
  var ultimoFoco = null;

  function abrir(e) {
    if (e) e.preventDefault();
    ultimoFoco = document.activeElement;
    ct.hidden = false;
    document.documentElement.classList.add("ct-aberto");
    if (window.__lenis) window.__lenis.stop();
    setTimeout(function () { ct.classList.add("on"); form.nome.focus(); }, 10);
  }
  function fechar() {
    ct.classList.remove("on");
    document.documentElement.classList.remove("ct-aberto");
    if (window.__lenis) window.__lenis.start();
    setTimeout(function () { ct.hidden = true; if (ultimoFoco) ultimoFoco.focus(); }, 250);
  }
  ct.addEventListener("click", function (e) { if (e.target.hasAttribute("data-fechar")) fechar(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !ct.hidden) fechar(); });
  document.querySelectorAll("[data-form]").forEach(function (b) { b.addEventListener("click", abrir); });

  form.telefone.addEventListener("input", function () {
    var d = this.value.replace(/\D/g, "").slice(0, 11);
    var f = d.length > 10 ? "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7)
      : d.length > 6 ? "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6)
      : d.length > 2 ? "(" + d.slice(0, 2) + ") " + d.slice(2) : d;
    this.value = f;
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    erro.textContent = "";
    var nome = form.nome.value.trim();
    var tel = form.telefone.value.replace(/\D/g, "");
    if (nome.length < 2) { erro.textContent = "Informe seu nome."; form.nome.focus(); return; }
    if (tel.length < 10 || tel.length > 11) { erro.textContent = "Informe um telefone com DDD."; form.telefone.focus(); return; }
    var q = new URLSearchParams(location.search), utm = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) { if (q.get(k)) utm[k] = q.get(k); });
    env.disabled = true; env.querySelector("span").textContent = "Enviando…";
    fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: KEY, Authorization: "Bearer " + KEY },
      body: JSON.stringify({
        _nome: nome, _telefone: tel, _mensagem: form.mensagem.value.trim() || null,
        _pagina: location.pathname, _utm: utm, _referrer: document.referrer || null, _empresa: "pamps",
      }),
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) throw new Error((j && j.message) || "Não foi possível enviar.");
      });
    }).then(function () {
      form.hidden = true;
      ct.querySelector(".ct__ok").hidden = false;
      ct.querySelector(".ct__nome").textContent = nome.split(" ")[0] + "!";
    }).catch(function (err) {
      erro.textContent = err.message === "Failed to fetch" ? "Sem conexão. Tente de novo ou chame no WhatsApp." : err.message;
    }).finally(function () {
      env.disabled = false; env.querySelector("span").textContent = "Enviar";
    });
  });
})();
