(function () {
  var meta = document.querySelector('meta[name="comments-api"]');
  var API = (meta && meta.content) || "/api/comments";
  var box = document.getElementById("comments");
  if (!box) return;
  var post = box.getAttribute("data-post");
  var list = box.querySelector(".clist");
  var form = box.querySelector(".cform");
  var status = form.querySelector(".status");
  var btn = form.querySelector("button");
  form.t.value = String(Date.now());
  var err = /[?&]e=([^&#]*)/.exec(location.search);
  if (err) status.textContent = decodeURIComponent(err[1].replace(/\+/g, " "));

  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {}
    return null;
  }
  var saved = store("name");
  if (saved) form.name.value = saved;

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function date(iso) {
    var d = new Date(iso);
    return pad(d.getDate()) + "." + pad(d.getMonth() + 1) + "." + String(d.getFullYear()).slice(2);
  }
  function render(items) {
    list.innerHTML = "";
    var cc = document.getElementById("ccount");
    if (cc) cc.textContent = String(items.length);
    items.forEach(function (c) {
      var li = document.createElement("li");
      var who = document.createElement("div");
      who.className = "who";
      var n = document.createElement("span"); n.textContent = c.name;
      var d = document.createElement("span"); d.textContent = date(c.date);
      who.appendChild(n); who.appendChild(d);
      var p = document.createElement("p"); p.textContent = c.text;
      li.appendChild(who); li.appendChild(p);
      list.appendChild(li);
    });
  }

  fetch(API + "?post=" + encodeURIComponent(post))
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(render)
    .catch(function () {});

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.name.value.trim(), text = form.text.value.trim();
    if (!name || !text) return;
    store("name", name);
    btn.disabled = true;
    status.textContent = "ОТПРАВЛЯЮ…";
    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ post: post, name: name, text: text, website: form.website.value, t: form.t.value })
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.j && res.j.error);
        render(res.j);
        form.text.value = "";
        status.textContent = "ГОТОВО";
      })
      .catch(function (err) {
        status.textContent = (err && err.message) || "НЕ ОТПРАВИЛОСЬ. ПОПРОБУЙТЕ ЕЩЁ РАЗ";
      })
      .then(function () { btn.disabled = false; });
  });
})();
