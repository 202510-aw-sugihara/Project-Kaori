(function () {
  var API_BASE = "https://project-kaori-fmup.onrender.com";
  var CSRF_KEY = "adminCsrfToken";

  function qs(selector, root) { return (root || document).querySelector(selector); }
  function qsa(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }

  function fetchJson(path, options) {
    var url = path.indexOf("http") === 0 ? path : (API_BASE + path);
    var opt = options || {};
    var headers = Object.assign({ "Content-Type": "application/json" }, opt.headers || {});
    return fetch(url, Object.assign({ credentials: "include", headers: headers }, opt, { headers: headers }))
      .then(function (res) {
        if (!res.ok) {
          var err = new Error("Request failed");
          err.status = res.status;
          return res.text().then(function (text) { err.body = text; throw err; });
        }
        if (res.status === 204) return null;
        return res.json();
      });
  }

  function getCsrfToken() {
    var cached = sessionStorage.getItem(CSRF_KEY);
    if (cached) { try { return Promise.resolve(JSON.parse(cached)); } catch (e) {} }
    return fetchJson("/api/csrf").then(function (data) {
      sessionStorage.setItem(CSRF_KEY, JSON.stringify(data));
      return data;
    });
  }

  function withCsrf(options) {
    return getCsrfToken().then(function (csrf) {
      var headers = Object.assign({}, options && options.headers ? options.headers : {});
      headers[csrf.headerName || "X-XSRF-TOKEN"] = csrf.token;
      return Object.assign({}, options || {}, { headers: headers });
    });
  }

  function formatDate(value) { return value || ""; }
  function formatTime(value) { return value ? String(value).slice(0, 5) : ""; }
  function formatYen(value) { var num = Number(value || 0); return "¥" + num.toLocaleString("ja-JP"); }

  var userEl = qs(".js-admin-user");
  var logoutBtn = qs(".js-admin-logout");
  var loginForm = qs(".js-admin-login");
  var loginError = qs(".js-admin-login-error");

  function setUser(user) {
    if (userEl) userEl.textContent = user ? (user.name + " (" + user.email + ")") : "未ログイン";
    if (logoutBtn) logoutBtn.disabled = !user;
  }

  function loadMe() {
    return fetchJson("/api/admin/auth/me")
      .then(function (user) { setUser(user); return user; })
      .catch(function () { setUser(null); return null; });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (loginError) loginError.textContent = "";
      var data = {
        email: qs('[name="email"]', loginForm).value.trim(),
        password: qs('[name="password"]', loginForm).value
      };
      withCsrf({ method: "POST", body: JSON.stringify(data) })
        .then(function (opt) { return fetchJson("/api/admin/auth/login", opt); })
        .then(function (user) { setUser(user); refreshAll(); })
        .catch(function () { if (loginError) loginError.textContent = "ログインに失敗しました。"; });
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      withCsrf({ method: "POST" })
        .then(function (opt) { return fetchJson("/api/admin/auth/logout", opt); })
        .then(function () { setUser(null); })
        .catch(function () { setUser(null); });
    });
  }

  var reservationListEl = qs(".js-reservation-list");
  var reservationDetailEl = qs(".js-reservation-detail");

  function renderReservationList(list) {
    if (!reservationListEl) return;
    if (!Array.isArray(list) || !list.length) {
      reservationListEl.innerHTML = '<tr><td colspan="6" class="admin-muted">該当データなし</td></tr>';
      return;
    }
    reservationListEl.innerHTML = list.map(function (item) {
      return '<tr class="js-reservation-row" data-id="' + item.id + '">'
        + '<td>' + item.id + '</td>'
        + '<td>' + formatDate(item.reservationDate) + '</td>'
        + '<td>' + formatTime(item.startTime) + '</td>'
        + '<td>' + (item.planName || "") + '</td>'
        + '<td>' + (item.customerName || "") + '</td>'
        + '<td>' + (item.status || "") + '</td>'
        + '</tr>';
    }).join("");
  }

  function renderReservationDetail(item) {
    if (!reservationDetailEl) return;
    if (!item) {
      reservationDetailEl.textContent = "予約を選択してください。";
      reservationDetailEl.classList.add("admin-muted");
      return;
    }
    reservationDetailEl.classList.remove("admin-muted");
    var participants = (item.participants || []).map(function (p) {
      return '<li>' + (p.participantName || "") + ' / ' + (p.participantNameKana || "") + '</li>';
    }).join("");
    reservationDetailEl.innerHTML = ''
      + '<p><strong>ID:</strong> ' + item.id + '</p>'
      + '<p><strong>日時:</strong> ' + formatDate(item.reservationDate) + ' ' + formatTime(item.startTime) + '</p>'
      + '<p><strong>プラン:</strong> ' + (item.planName || "") + '</p>'
      + '<p><strong>氏名:</strong> ' + (item.customerName || "") + '</p>'
      + '<p><strong>連絡先:</strong> ' + (item.customerEmail || "") + ' / ' + (item.customerPhone || "") + '</p>'
      + '<p><strong>人数:</strong> ' + (item.participantCount || 0) + '</p>'
      + '<p><strong>金額:</strong> ' + formatYen(item.totalPrice) + '</p>'
      + '<p><strong>状態:</strong> ' + (item.status || "") + '</p>'
      + '<p><strong>参加者:</strong></p>'
      + '<ul>' + (participants || '<li>なし</li>') + '</ul>'
      + '<button class="admin-btn admin-btn--ghost js-reservation-cancel" type="button" data-id="' + item.id + '">キャンセル</button>';
  }

  function fetchReservations(params) {
    var query = new URLSearchParams(params || {}).toString();
    return fetchJson("/api/admin/reservations" + (query ? "?" + query : ""))
      .then(function (list) { renderReservationList(list || []); });
  }

  var reservationFilter = qs(".js-reservation-filter");
  if (reservationFilter) {
    reservationFilter.addEventListener("submit", function (e) {
      e.preventDefault();
      var params = {
        status: qs('[name="status"]', reservationFilter).value,
        reservationDate: qs('[name="reservationDate"]', reservationFilter).value,
        customerName: qs('[name="customerName"]', reservationFilter).value,
        page: 0,
        size: 50
      };
      fetchReservations(params);
    });
  }

  if (reservationListEl) {
    reservationListEl.addEventListener("click", function (e) {
      var row = e.target.closest(".js-reservation-row");
      if (!row) return;
      var id = row.getAttribute("data-id");
      fetchJson("/api/admin/reservations/" + id).then(renderReservationDetail);
    });
  }

  if (reservationDetailEl) {
    reservationDetailEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".js-reservation-cancel");
      if (!btn) return;
      var id = btn.getAttribute("data-id");
      if (!id) return;
      withCsrf({ method: "PATCH" })
        .then(function (opt) { return fetchJson("/api/admin/reservations/" + id + "/cancel", opt); })
        .then(function (item) {
          renderReservationDetail(item);
          fetchReservations({ page: 0, size: 50 });
        })
        .catch(function () { alert("キャンセルに失敗しました。"); });
    });
  }

  var slotListEl = qs(".js-slot-list");
  var slotFilter = qs(".js-slot-filter");
  var slotCache = {};

  function renderSlotList(list) {
    if (!slotListEl) return;
    slotCache = {};
    if (!Array.isArray(list) || !list.length) {
      slotListEl.innerHTML = '<tr><td colspan="8" class="admin-muted">該当データなし</td></tr>';
      return;
    }
    slotListEl.innerHTML = list.map(function (slot) {
      slotCache[slot.id] = slot;
      var status = slot.isOpen ? "開放" : "閉鎖";
      return '<tr>'
        + '<td>' + slot.id + '</td>'
        + '<td>' + slot.planId + '</td>'
        + '<td>' + formatDate(slot.slotDate) + '</td>'
        + '<td>' + formatTime(slot.startTime) + ' - ' + formatTime(slot.endTime) + '</td>'
        + '<td>' + slot.capacity + '</td>'
        + '<td>' + slot.reservedCount + '</td>'
        + '<td>' + status + '</td>'
        + '<td><button class="admin-btn admin-btn--ghost js-slot-toggle" type="button" data-id="' + slot.id + '">' + (slot.isOpen ? "閉じる" : "開ける") + '</button></td>'
        + '</tr>';
    }).join("");
  }

  function fetchSlots(params) {
    var query = new URLSearchParams(params || {}).toString();
    return fetchJson("/api/admin/plan-time-slots" + (query ? "?" + query : ""))
      .then(function (list) { renderSlotList(list || []); });
  }

  if (slotFilter) {
    slotFilter.addEventListener("submit", function (e) {
      e.preventDefault();
      var params = {
        planId: qs('[name="planId"]', slotFilter).value,
        slotDate: qs('[name="slotDate"]', slotFilter).value,
        isOpen: qs('[name="isOpen"]', slotFilter).value,
        page: 0,
        size: 50
      };
      fetchSlots(params);
    });
  }

  if (slotListEl) {
    slotListEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".js-slot-toggle");
      if (!btn) return;
      var id = btn.getAttribute("data-id");
      var slot = slotCache[id];
      if (!slot) return;
      var payload = {
        planId: slot.planId,
        slotDate: slot.slotDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        capacity: slot.capacity,
        isOpen: !slot.isOpen
      };
      withCsrf({ method: "PUT", body: JSON.stringify(payload) })
        .then(function (opt) { return fetchJson("/api/admin/plan-time-slots/" + id, opt); })
        .then(function (updated) {
          slotCache[updated.id] = updated;
          fetchSlots({ page: 0, size: 50 });
        })
        .catch(function () { alert("枠の更新に失敗しました。"); });
    });
  }

  var planListEl = qs(".js-plan-list");
  var planForm = qs(".js-plan-form");
  var planError = qs(".js-plan-error");
  var planCache = {};

  function renderPlanList(list) {
    if (!planListEl) return;
    planCache = {};
    if (!Array.isArray(list) || !list.length) {
      planListEl.innerHTML = '<tr><td colspan="4" class="admin-muted">該当データなし</td></tr>';
      return;
    }
    planListEl.innerHTML = list.map(function (plan) {
      planCache[plan.id] = plan;
      return '<tr class="js-plan-row" data-id="' + plan.id + '">'
        + '<td>' + plan.id + '</td>'
        + '<td>' + plan.name + '</td>'
        + '<td>' + (plan.durationMinutes || 0) + '分</td>'
        + '<td>' + formatYen(plan.price) + '</td>'
        + '</tr>';
    }).join("");
  }

  function fetchPlans() {
    return fetchJson("/api/admin/plans").then(function (list) { renderPlanList(list || []); });
  }

  if (planListEl) {
    planListEl.addEventListener("click", function (e) {
      var row = e.target.closest(".js-plan-row");
      if (!row || !planForm) return;
      var plan = planCache[row.getAttribute("data-id")];
      if (!plan) return;
      planForm.reset();
      qs('[name="id"]', planForm).value = plan.id;
      qs('[name="name"]', planForm).value = plan.name || "";
      qs('[name="description"]', planForm).value = plan.description || "";
      qs('[name="durationMinutes"]', planForm).value = plan.durationMinutes || 0;
      qs('[name="price"]', planForm).value = plan.price || 0;
      qs('[name="capacity"]', planForm).value = plan.capacity || 1;
    });
  }

  if (planForm) {
    planForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (planError) planError.textContent = "";
      var id = qs('[name="id"]', planForm).value;
      if (!id) { if (planError) planError.textContent = "更新するプランを選択してください。"; return; }
      var payload = {
        name: qs('[name="name"]', planForm).value.trim(),
        description: qs('[name="description"]', planForm).value.trim(),
        durationMinutes: Number(qs('[name="durationMinutes"]', planForm).value),
        price: Number(qs('[name="price"]', planForm).value),
        capacity: Number(qs('[name="capacity"]', planForm).value)
      };
      withCsrf({ method: "PUT", body: JSON.stringify(payload) })
        .then(function (opt) { return fetchJson("/api/admin/plans/" + id, opt); })
        .then(function () { fetchPlans(); })
        .catch(function () { if (planError) planError.textContent = "更新に失敗しました。"; });
    });
  }

  function refreshAll() {
    fetchReservations({ page: 0, size: 50 });
    fetchSlots({ page: 0, size: 50 });
    fetchPlans();
  }

  loadMe().then(function (user) { if (user) refreshAll(); });
})();
