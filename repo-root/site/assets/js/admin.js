(function () {
  var apiBaseFromOps = (window.__OPS__ && window.__OPS__.apiBase) ? String(window.__OPS__.apiBase) : "";
  var API_BASE = (apiBaseFromOps ? apiBaseFromOps.replace(/\/+$/, "") : "https://project-kaori.onrender.com");
  var CSRF_KEY = "adminCsrfToken";

  function qs(selector, root) { return (root || document).querySelector(selector); }
  function qsa(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }

  function fetchJson(path, options) {
    var url = path.indexOf("http") === 0 ? path : (API_BASE + path);
    var opt = options || {};
    var headers = Object.assign({}, opt.headers || {});
    if (opt.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
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
    if (cached) { try { return Promise.resolve(JSON.parse(cached)); } catch (e) { } }
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
  function formatYen(value) { var num = Number(value || 0); return num.toLocaleString("ja-JP") + "円"; }
  function formatStatus(status) {
    switch (status) {
      case "pending": return "受付中";
      case "confirmed": return "確定";
      case "cancelled": return "キャンセル";
      default: return status || "";
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function parseErrorBody(err) {
    if (!err || !err.body) return null;
    try {
      return JSON.parse(err.body);
    } catch (e) {
      return null;
    }
  }

  var userEl = qs(".js-admin-user");
  var logoutBtn = qs(".js-admin-logout");
  var loginForm = qs(".js-admin-login");
  var loginError = qs(".js-admin-login-error");
  var loginSection = qs(".js-login-section");

  function setUser(user) {
    if (userEl) userEl.textContent = user ? (user.name + " (" + user.email + ")") : "未ログイン";
    if (logoutBtn) logoutBtn.disabled = !user;
    if (loginSection) loginSection.hidden = !!user;
  }

  function loadMe() {
    var url = API_BASE + "/api/admin/auth/me";
    return fetch(url, { credentials: "include" })
      .then(function (res) {
        if (res.status === 401) return null;
        if (!res.ok) {
          var err = new Error("Request failed");
          err.status = res.status;
          return res.text().then(function (text) { err.body = text; throw err; });
        }
        return res.json();
      })
      .then(function (user) { setUser(user); setCreateReservationEnabled(!!user); return user; })
      .catch(function () { setUser(null); setCreateReservationEnabled(false); return null; });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (loginForm.checkValidity && !loginForm.checkValidity()) {
        if (loginForm.reportValidity) loginForm.reportValidity();
        return;
      }
      if (loginError) loginError.textContent = "";
      var data = {
        email: qs('[name="email"]', loginForm).value.trim(),
        password: qs('[name="password"]', loginForm).value
      };
      withCsrf({ method: "POST", body: JSON.stringify(data) })
        .then(function (opt) { return fetchJson("/api/admin/auth/login", opt); })
        .then(function (user) { setUser(user); setCreateReservationEnabled(true); refreshAll(); })
        .catch(function () { if (loginError) loginError.textContent = "ログインに失敗しました。"; });
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      withCsrf({ method: "POST" })
        .then(function (opt) { return fetchJson("/api/admin/auth/logout", opt); })
        .then(function () { setUser(null); setCreateReservationEnabled(false); })
        .catch(function () { setUser(null); setCreateReservationEnabled(false); });
    });
  }

  var reservationListEl = qs(".js-reservation-list");
  var reservationDetailEl = qs(".js-reservation-detail");
  var isEditMode = false;
  var currentReservation = null;
  function setReservationDetailState(state) {
    if (!reservationDetailEl) return;
    reservationDetailEl.setAttribute("data-state", state);
  }


  function renderReservationList(list) {
    if (!reservationListEl) return;
    if (!Array.isArray(list) || !list.length) {
      reservationListEl.innerHTML = '<tr><td colspan="7" class="admin-muted">該当する予約はありません</td></tr>';
      return;
    }
    reservationListEl.innerHTML = list.map(function (item) {
      return '<tr class="js-reservation-row" data-id="' + item.id + '">'
        + '<td>' + item.id + '</td>'
        + '<td>' + formatDate(item.reservationDate) + '</td>'
        + '<td>' + formatTime(item.startTime) + '</td>'
        + '<td>' + (item.planName || "") + '</td>'
        + '<td>' + (item.customerName || "") + '</td>'
        + '<td><span class="status-' + item.status + '">' + formatStatus(item.status) + '</span></td>'

        + '<td><button class="admin-btn admin-btn--ghost js-reservation-detail-btn" type="button" data-id="' + item.id + '">詳細</button></td>'
        + '</tr>';
    }).join("");
  }

  function renderReservationDetail(item) {
    if (!reservationDetailEl) return;
    currentReservation = item || null;
    if (isEditMode && item) {
      renderReservationEdit(item);
      return;
    }
    if (!item) {
      reservationDetailEl.textContent = "予約を選択してください。";
      reservationDetailEl.classList.add("admin-muted");
      setReservationDetailState("empty");
      return;
    }
    reservationDetailEl.classList.remove("admin-muted");
    setReservationDetailState("loaded");
    var participants = (item.participants || []).map(function (p) {
      return '<li>' + (p.participantName || "") + ' / ' + (p.participantNameKana || "") + '</li>';
    }).join("");
    reservationDetailEl.innerHTML = ''
      + '<p><strong>ID:</strong> ' + item.id + '</p>'
      + '<p><strong>日付</strong> ' + formatDate(item.reservationDate) + ' ' + formatTime(item.startTime) + '</p>'
      + '<p><strong>プラン:</strong> ' + (item.planName || "") + '</p>'
      + '<p><strong>顧客名:</strong> ' + (item.customerName || "") + '</p>'
      + '<p><strong>連絡先</strong> ' + (item.customerEmail || "") + ' / ' + (item.customerPhone || "") + '</p>'
      + '<p><strong>人数:</strong> ' + (item.participantCount || 0) + '</p>'
      + '<p><strong>金額</strong> ' + formatYen(item.totalPrice) + '</p>'
      + '<p><strong>状況:</strong> <span class="status-' + item.status + '">' + formatStatus(item.status) + '</span></p>'
      + '<p><strong>参加者</strong></p>'
      + '<ul>' + (participants || '<li>参加者なし</li>') + '</ul>'
      + '<div class="admin-form-actions">'
      + '<button class="admin-btn admin-btn--ghost js-reservation-edit" type="button" data-id="' + item.id + '">編集</button>'
      + (
        item.status === "cancelled"
          ? '<button class="admin-btn admin-btn--ghost js-reservation-status" type="button" data-id="' + item.id + '" data-status="pending">キャンセル解除</button>'
          : '<button class="admin-btn admin-btn--ghost js-reservation-status" type="button" data-id="' + item.id + '" data-status="confirmed"' + (item.status === "confirmed" ? " disabled" : "") + '>予約確定</button>'
          + '<button class="admin-btn admin-btn--ghost js-reservation-status" type="button" data-id="' + item.id + '" data-status="cancelled"' + (item.status === "cancelled" ? " disabled" : "") + '>キャンセル</button>'
      )
      + '</div>';
  }

  function renderReservationEdit(item) {
    if (!reservationDetailEl) return;
    reservationDetailEl.classList.remove("admin-muted");
    setReservationDetailState("loaded");
    var participants = (item.participants || []).map(function (p) {
      return '<li>' + (p.participantName || "") + ' / ' + (p.participantNameKana || "") + '</li>';
    }).join("");
    reservationDetailEl.innerHTML = ''
      + '<p><strong>ID:</strong> ' + item.id + '</p>'
      + '<p><strong>予約日:</strong> ' + formatDate(item.reservationDate) + ' ' + formatTime(item.startTime) + '</p>'
      + '<p><strong>プラン:</strong> ' + (item.planName || "") + '</p>'
      + '<p><strong>氏名:</strong> <input class="admin-input" type="text" name="editCustomerName" value="' + escapeHtml(item.customerName || "") + '" /></p>'
      + '<p><strong>連絡先</strong> '
      + '<input class="admin-input" type="email" name="editCustomerEmail" value="' + escapeHtml(item.customerEmail || "") + '" />'
      + ' / '
      + '<input class="admin-input" type="text" name="editCustomerPhone" value="' + escapeHtml(item.customerPhone || "") + '" />'
      + '</p>'
      + '<p><strong>人数:</strong> <input class="admin-input" type="number" min="1" name="editParticipantCount" value="' + (item.participantCount || 0) + '" /></p>'
      + '<p><strong>金額</strong> ' + formatYen(item.totalPrice) + '</p>'
      + '<p><strong>状況:</strong> <span class="status-' + item.status + '">' + formatStatus(item.status) + '</span></p>'
      + '<p><strong>参加者</strong></p>'
      + '<ul>' + (participants || '<li>参加者なし</li>') + '</ul>'
      + '<div class="admin-form-actions">'
      + '<button class="admin-btn admin-btn--primary js-reservation-edit-save" type="button" data-id="' + item.id + '">Save</button>'
      + '<button class="admin-btn admin-btn--ghost js-reservation-edit-cancel" type="button" data-id="' + item.id + '">キャンセル</button>'
      + '</div>';
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
      var statusValue = qs('[name="status"]', reservationFilter).value;
      var params = {
        status: statusValue ? statusValue.toLowerCase() : "",
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
      var btn = e.target.closest(".js-reservation-detail-btn");
      if (!btn) return;

      var id = btn.getAttribute("data-id");
      setReservationDetailState("loading");

      fetchJson("/api/admin/reservations/" + id)
        .then(renderReservationDetail)
        .catch(function () {
          if (!reservationDetailEl) return;
          reservationDetailEl.textContent = "予約詳細の取得に失敗しました。";
          reservationDetailEl.classList.add("admin-muted");
          setReservationDetailState("error");
        });
    });
  }

  if (reservationDetailEl) {
    reservationDetailEl.addEventListener("click", function (e) {
      var editBtn = e.target.closest(".js-reservation-edit");
      if (editBtn) {
        if (!currentReservation) return;
        isEditMode = true;
        renderReservationEdit(currentReservation);
        return;
      }
      var cancelBtn = e.target.closest(".js-reservation-edit-cancel");
      if (cancelBtn) {
        isEditMode = false;
        renderReservationDetail(currentReservation);
        return;
      }
      var saveBtn = e.target.closest(".js-reservation-edit-save");
      if (saveBtn) {
        if (!currentReservation) return;
        var nameInput = qs('[name="editCustomerName"]', reservationDetailEl);
        var emailInput = qs('[name="editCustomerEmail"]', reservationDetailEl);
        var phoneInput = qs('[name="editCustomerPhone"]', reservationDetailEl);
        var countInput = qs('[name="editParticipantCount"]', reservationDetailEl);
        var participantCount = Number(countInput ? countInput.value : 0) || 0;
        if (participantCount < 1) {
          alert("参加人数は1以上で入力してください。");
          return;
        }
        var nextName = nameInput ? nameInput.value.trim() : "";
        var nextEmail = emailInput ? emailInput.value.trim() : "";
        var nextPhone = phoneInput ? phoneInput.value.trim() : "";
        if (!nextName || !nextEmail || !nextPhone) {
          alert("必須項目を入力してください");
          return;
        }
        var existingParticipants = currentReservation.participants || [];

        // ★人数増加対応（追加）
        if (participantCount > existingParticipants.length) {
          for (var i = existingParticipants.length; i < participantCount; i++) {
            existingParticipants.push({
              participantName: "Participant " + (i + 1),
              participantNameKana: "",
              ageGroup: null,
              allergyNote: null
            });
          }
        }

        // ★減少対応（既存ロジック）
        var normalizedParticipants = existingParticipants.slice(0, participantCount);

        var payload = {
          planId: currentReservation.planId,
          planTimeSlotId: currentReservation.planTimeSlotId,
          participantCount: participantCount,
          participants: normalizedParticipants.map(function (participant) {
            return {
              participantName: participant.participantName,
              participantNameKana: participant.participantNameKana,
              ageGroup: participant.ageGroup || null,
              allergyNote: participant.allergyNote || null
            };
          }),
          customerName: nextName,
          email: nextEmail,
          phone: nextPhone
        };

        withCsrf({ method: "PUT", body: JSON.stringify(payload) })
          .then(function (opt) { return fetchJson("/api/admin/reservations/" + currentReservation.id, opt); })
          .then(function (item) {
            renderReservationDetail(item);
            fetchReservations({ page: 0, size: 50 });
          })
          .catch(function (err) {
            console.error(err);
            alert("更新に失敗しました。");
          });

        return;
      }
      var btn = e.target.closest(".js-reservation-status");
      if (!btn) return;
      if (btn.getAttribute("data-status") === "cancelled") {
        if (!confirm("本当にキャンセルしますか？この操作は取り消せます。")) {
          return;
        }
      }
      var id = btn.getAttribute("data-id");
      if (!id) return;
      var status = btn.getAttribute("data-status");
      withCsrf({
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: status })
      })
        .then(function (opt) {
          opt.credentials = "include"; // ←これ追加
          return fetchJson("/api/admin/reservations/" + id + "/status", opt);
        })

        .then(function (item) {
          renderReservationDetail(item);
          fetchReservations({ page: 0, size: 50 });
          //loadPlanTimeSlots();
        })
        .catch(function () {
          alert("ステータス更新に失敗しました。");
        });

    });
  }

  var slotListEl = qs(".js-slot-list");
  var slotFilter = qs(".js-slot-filter");
  var slotCache = {};

  function renderSlotList(list) {
    if (!slotListEl) return;
    slotCache = {};
    if (!Array.isArray(list) || !list.length) {
      slotListEl.innerHTML = '<tr><td colspan="8" class="admin-muted">データがありません</td></tr>';
      return;
    }
    slotListEl.innerHTML = list.map(function (slot) {
      slotCache[slot.id] = slot;
      var status = slot.isOpen ? "公開" : "非公開";
      return '<tr>'
        + '<td>' + slot.id + '</td>'
        + '<td>' + slot.planId + '</td>'
        + '<td>' + formatDate(slot.slotDate) + '</td>'
        + '<td>' + formatTime(slot.startTime) + ' - ' + formatTime(slot.endTime) + '</td>'
        + '<td>' + slot.capacity + '</td>'
        + '<td>' + slot.reservedCount + '</td>'
        + '<td>' + status + '</td>'
        + '<td><button class="admin-btn admin-btn--ghost js-slot-toggle" type="button" data-id="' + slot.id + '">' + (slot.isOpen ? "停止する" : "再開する") + '</button></td>'
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
      planListEl.innerHTML = '<tr><td colspan="4" class="admin-muted">データがありません</td></tr>';
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
    return fetchJson("/api/admin/plans").then(function (list) {
      var plans = list || [];
      renderPlanList(plans);
      renderCreatePlanOptions(plans);
    });
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
        .catch(function () { if (planError) planError.textContent = "プランの更新に失敗しました。"; });
    });
  }

  var createReservationForm = qs(".js-admin-create-reservation");
  var createReservationSection = createReservationForm ? createReservationForm.closest(".admin-card") : null;
  var createParticipantListEl = qs(".js-create-participant-list");
  var createPreviewEl = qs(".js-create-reservation-preview");
  var createErrorEl = qs(".js-create-reservation-error");
  var createSuccessEl = qs(".js-create-reservation-success");
  var createLoginNoticeEl = qs(".js-create-login-notice");
  var createSlotHelpEl = qs(".js-create-slot-help");
  var createLoadSlotsBtn = qs(".js-load-create-slots");
  var createPreviewBtn = qs(".js-create-preview");
  var createSubmitBtn = qs(".js-create-submit");
  var createPlanSelect = createReservationForm ? qs('[name="planId"]', createReservationForm) : null;
  var createDateInput = createReservationForm ? qs('[name="slotDate"]', createReservationForm) : null;
  var createSlotSelect = createReservationForm ? qs('[name="planTimeSlotId"]', createReservationForm) : null;
  var createParticipantCountInput = createReservationForm ? qs('[name="participantCount"]', createReservationForm) : null;
  var createCustomerKanaInput = createReservationForm ? qs('[name="customerNameKana"]', createReservationForm) : null;
  var createNoteInput = createReservationForm ? qs('[name="note"]', createReservationForm) : null;
  var createSlotCache = {};
  var createPreviewConfirmed = false;
  var createReservationEnabled = false;

  function getCreateErrorEl(field) {
    return createReservationForm ? qs('[data-error-for="' + field + '"]', createReservationForm) : null;
  }

  function setCreateAlert(el, message) {
    if (!el) return;
    if (!message) {
      el.hidden = true;
      el.innerHTML = "";
      return;
    }
    el.hidden = false;
    el.innerHTML = message;
  }

  function clearCreateAlerts() {
    setCreateAlert(createErrorEl, "");
    setCreateAlert(createSuccessEl, "");
  }

  function setCreatePreviewConfirmed(value) {
    createPreviewConfirmed = !!value;
    if (createReservationForm) {
      createReservationForm.setAttribute("data-confirmed", createPreviewConfirmed ? "true" : "false");
    }
  }

  function setCreateReservationEnabled(enabled) {
    createReservationEnabled = !!enabled;
    if (!createReservationForm) return;

    qsa("input, select, textarea, button", createReservationForm).forEach(function (el) {
      if (el.classList.contains("js-create-submit")) return;
      el.disabled = !enabled;
    });

    if (createReservationSection) {
      createReservationSection.classList.toggle("admin-create-disabled", !enabled);
    }
    if (createLoginNoticeEl) {
      createLoginNoticeEl.hidden = !!enabled;
    }
    if (!enabled) {
      clearCreateAlerts();
      clearCreateErrors();
      setCreatePreviewConfirmed(false);
      resetCreateSlotOptions("先に管理者ログインしてください");
      if (createSlotHelpEl) createSlotHelpEl.textContent = "ログイン後に枠を取得できます。";
      if (createPreviewEl) {
        createPreviewEl.classList.add("admin-muted");
        createPreviewEl.innerHTML = "ログインしてください。ログイン後に予約プレビューが表示されます。";
      }
    } else {
      renderReservationPreview(null);
    }
    updateCreateSubmitState();
  }

  function clearCreateErrors() {
    if (!createReservationForm) return;
    qsa(".admin-field-error", createReservationForm).forEach(function (el) {
      el.textContent = "";
    });
  }

  function renderCreateErrors(errors) {
    clearCreateErrors();
    Object.keys(errors || {}).forEach(function (key) {
      var el = getCreateErrorEl(key);
      if (el) el.textContent = errors[key];
    });
  }

  function renderCreatePlanOptions(list) {
    if (!createPlanSelect) return;
    var selected = createPlanSelect.value;
    var options = ['<option value="">プランを選択</option>'].concat((list || []).map(function (plan) {
      return '<option value="' + plan.id + '">' + escapeHtml(plan.name) + "</option>";
    }));
    createPlanSelect.innerHTML = options.join("");
    if (selected && planCache[selected]) {
      createPlanSelect.value = selected;
    }
  }

  function getParticipantCountValue() {
    if (!createParticipantCountInput) return 1;
    return Math.max(1, Number(createParticipantCountInput.value || 1));
  }

  function setSlotLoadingState(isLoading, message) {
    if (createLoadSlotsBtn) createLoadSlotsBtn.disabled = !!isLoading;
    if (createSlotSelect) createSlotSelect.disabled = !!isLoading;
    if (createSlotHelpEl && message) createSlotHelpEl.textContent = message;
    if (createSlotSelect) createSlotSelect.classList.toggle("admin-loading", !!isLoading);
  }

  function resetCreateSlotOptions(message) {
    createSlotCache = {};
    if (!createSlotSelect) return;
    createSlotSelect.innerHTML = '<option value="">' + escapeHtml(message || "先に空き枠を取得してください") + "</option>";
    createSlotSelect.disabled = true;
  }

  function getSlotRemainingCapacity(slot) {
    return Number(slot.capacity || 0) - Number(slot.reservedCount || 0);
  }

  function renderCreateSlotOptions(slots) {
    if (!createSlotSelect) return;
    var selected = createSlotSelect.value;
    var participantCount = getParticipantCountValue();
    createSlotCache = {};
    var filtered = (slots || []).filter(function (slot) {
      return getSlotRemainingCapacity(slot) >= participantCount;
    });
    if (!filtered.length) {
      resetCreateSlotOptions("選択した日付に空き枠がありません");
      if (createSlotHelpEl) createSlotHelpEl.textContent = "条件に合う枠がありません。";
      updateCreateSubmitState();
      return;
    }
    createSlotSelect.disabled = false;
    createSlotSelect.innerHTML = ['<option value="">時間枠を選択</option>'].concat(filtered.map(function (slot) {
      createSlotCache[slot.id] = slot;
      return '<option value="' + slot.id + '">' + escapeHtml(formatTime(slot.startTime) + " - " + formatTime(slot.endTime) + " / 残り " + getSlotRemainingCapacity(slot)) + "</option>";
    })).join("");
    if (selected && createSlotCache[selected]) {
      createSlotSelect.value = selected;
    }
    if (createSlotHelpEl) createSlotHelpEl.textContent = filtered.length + "件の枠があります。";
    updateCreateSubmitState();
  }

  function getSubmitErrorMessage(err) {
    var parsed = parseErrorBody(err);
    if (err && err.status === 401) return "セッションが切れました。再ログインしてください。";
    if (err && err.status === 403) return "この操作は許可されていません。";
    if (parsed && parsed.message) {
      if (parsed.status === 409 && /slot/i.test(parsed.message)) {
        return "選択した枠は利用できません。別の枠を選択してください。";
      }
      return parsed.message;
    }
    if (err && err.status >= 500) return "サーバーエラーが発生しました。時間をおいて再試行してください。";
    return "リクエストに失敗しました。入力内容を確認してください。";
  }

  function loadAvailableSlots() {
    if (!createPlanSelect || !createDateInput) return Promise.resolve();
    clearCreateAlerts();
    clearCreateErrors();
    setCreatePreviewConfirmed(false);
    updateCreateSubmitState();

    var planId = createPlanSelect.value;
    var slotDate = createDateInput.value;
    if (!planId || !slotDate) {
      renderCreateErrors({
        planId: planId ? "" : "プランを選択してください。",
        slotDate: slotDate ? "" : "日付を選択してください。"
      });
      resetCreateSlotOptions("先にプランと日付を選択してください");
      if (createSlotHelpEl) createSlotHelpEl.textContent = "プランと日付を選択してください。";
      return Promise.resolve();
    }

    setSlotLoadingState(true, "空き枠を読み込み中です...");
    return fetchJson("/api/plans/" + encodeURIComponent(planId) + "/time-slots?slotDate=" + encodeURIComponent(slotDate))
      .then(function (slots) {
        renderCreateSlotOptions(slots || []);
      })
      .catch(function (err) {
        resetCreateSlotOptions("空き枠の読み込みに失敗しました");
        setCreateAlert(createErrorEl, escapeHtml(getSubmitErrorMessage(err)));
      })
      .then(function () {
        setSlotLoadingState(false);
      });
  }

  function readParticipantValues() {
    if (!createParticipantListEl) return [];
    return qsa(".js-create-participant-card", createParticipantListEl).map(function (card) {
      return {
        participantName: qs('[name="participantName"]', card).value.trim(),
        participantNameKana: qs('[name="participantNameKana"]', card).value.trim(),
        ageGroup: qs('[name="ageGroup"]', card).value.trim(),
        allergyNote: qs('[name="allergyNote"]', card).value.trim()
      };
    });
  }

  function renderParticipantFields(count) {
    if (!createParticipantListEl) return;
    var safeCount = Math.max(1, Number(count || 1));
    var existing = readParticipantValues();
    var cards = [];
    for (var i = 0; i < safeCount; i += 1) {
      var current = existing[i] || {};
      cards.push(
        '<section class="admin-participant-card js-create-participant-card" data-index="' + i + '">'
        + "<h4>参加者" + (i + 1) + "</h4>"
        + '<div class="admin-participant-grid">'
        + "<label><span>参加者名</span>"
        + '<input type="text" name="participantName" maxlength="100" value="' + escapeHtml(current.participantName || "") + '" required />'
        + '<span class="admin-field-error" data-error-for="participants.' + i + '.participantName"></span></label>'
        + "<label><span>参加者名（カナ）</span>"
        + '<input type="text" name="participantNameKana" maxlength="100" value="' + escapeHtml(current.participantNameKana || "") + '" required />'
        + '<span class="admin-field-error" data-error-for="participants.' + i + '.participantNameKana"></span></label>'
        + "<label><span>年代</span>"
        + '<input type="text" name="ageGroup" maxlength="50" value="' + escapeHtml(current.ageGroup || "") + '" />'
        + '<span class="admin-field-error" data-error-for="participants.' + i + '.ageGroup"></span></label>'
        + "<label><span>アレルギー備考</span>"
        + '<input type="text" name="allergyNote" maxlength="255" value="' + escapeHtml(current.allergyNote || "") + '" />'
        + '<span class="admin-field-error" data-error-for="participants.' + i + '.allergyNote"></span></label>'
        + "</div>"
        + "</section>"
      );
    }
    createParticipantListEl.innerHTML = cards.join("");
  }

  function collectReservationFormData() {
    if (!createReservationForm) return null;
    return {
      planId: Number(createPlanSelect.value || 0) || null,
      slotDate: createDateInput.value,
      planTimeSlotId: Number(createSlotSelect.value || 0) || null,
      customerName: qs('[name="customerName"]', createReservationForm).value.trim(),
      customerNameKana: createCustomerKanaInput ? createCustomerKanaInput.value.trim() : "",
      email: qs('[name="email"]', createReservationForm).value.trim(),
      phone: qs('[name="phone"]', createReservationForm).value.trim(),
      participantCount: getParticipantCountValue(),
      participants: readParticipantValues(),
      note: createNoteInput ? createNoteInput.value.trim() : ""
    };
  }

  function validateReservationForm(data, options) {
    var errors = {};
    var requireConfirm = !options || options.requireConfirm !== false;
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.planId) errors.planId = "プランを選択してください。";
    if (!data.slotDate) errors.slotDate = "日付を選択してください。";
    if (!data.planTimeSlotId) errors.planTimeSlotId = "時間枠を選択してください。";
    if (!data.customerName) errors.customerName = "お客様名を入力してください。";
    if (!data.email) errors.email = "メールアドレスを入力してください。";
    else if (!emailPattern.test(data.email)) errors.email = "メールアドレスの形式が正しくありません。";
    if (!data.phone) errors.phone = "電話番号を入力してください。";
    if (!data.participantCount || data.participantCount < 1) errors.participantCount = "参加人数は1以上で入力してください。";
    if (!Array.isArray(data.participants) || data.participants.length !== data.participantCount) {
      errors.participants = "参加人数と参加者情報の数が一致しません。";
    }

    (data.participants || []).forEach(function (participant, index) {
      if (!participant.participantName) {
        errors["participants." + index + ".participantName"] = "参加者名を入力してください。";
      }
      if (!participant.participantNameKana) {
        errors["participants." + index + ".participantNameKana"] = "参加者名（カナ）を入力してください。";
      }
    });

    if (requireConfirm && !createPreviewConfirmed) {
      errors.participants = errors.participants || "プレビューを実行してください。";
    }

    return errors;
  }

  function renderReservationPreview(data) {
    if (!createPreviewEl) return;
    var plan = data && data.planId ? planCache[data.planId] : null;
    var slot = data && data.planTimeSlotId ? createSlotCache[data.planTimeSlotId] : null;
    if (!data) {
      createPreviewEl.classList.add("admin-muted");
      createPreviewEl.innerHTML = "必要項目を入力してプレビューを作成してください。";
      return;
    }
    createPreviewEl.classList.remove("admin-muted");
    createPreviewEl.innerHTML = ""
      + '<p class="admin-preview-meta"><strong>プラン:</strong> ' + escapeHtml(plan ? plan.name : "") + "</p>"
      + '<p class="admin-preview-meta"><strong>日付</strong> ' + escapeHtml((data.slotDate || "") + (slot ? " " + formatTime(slot.startTime) + " - " + formatTime(slot.endTime) : "")) + "</p>"
      + '<p class="admin-preview-meta"><strong>顧客名</strong> ' + escapeHtml(data.customerName) + "</p>"
      + '<p class="admin-preview-meta"><strong>メールアドレス:</strong> ' + escapeHtml(data.email) + "</p>"
      + '<p class="admin-preview-meta"><strong>電話番号:</strong> ' + escapeHtml(data.phone) + "</p>"
      + '<p class="admin-preview-meta"><strong>参加人数:</strong> ' + escapeHtml(data.participantCount) + "</p>"
      + '<ul class="admin-preview-list">' + data.participants.map(function (participant) {
        return "<li>" + escapeHtml(participant.participantName + (participant.participantNameKana ? " / " + participant.participantNameKana : "")) + "</li>";
      }).join("") + "</ul>";
  }

  function renderCreatedReservationSummary(reservation, fallbackData) {
    if (!createPreviewEl) return;
    var source = reservation || {};
    var participants = source.participants || (fallbackData ? fallbackData.participants : []) || [];
    createPreviewEl.classList.remove("admin-muted");
    createPreviewEl.innerHTML = ""
      + '<p class="admin-preview-meta"><strong>予約ID:</strong> ' + escapeHtml(source.id || "") + "</p>"
      + '<p class="admin-preview-meta"><strong>プラン:</strong> ' + escapeHtml(source.planName || (fallbackData && planCache[fallbackData.planId] ? planCache[fallbackData.planId].name : "")) + "</p>"
      + '<p class="admin-preview-meta"><strong>日付</strong> ' + escapeHtml((source.reservationDate || (fallbackData && fallbackData.slotDate) || "") + (source.startTime ? " " + formatTime(source.startTime) : "")) + "</p>"
      + '<p class="admin-preview-meta"><strong>顧客名</strong> ' + escapeHtml(source.customerName || (fallbackData && fallbackData.customerName) || "") + "</p>"
      + '<p class="admin-preview-meta"><strong>メールアドレス:</strong> ' + escapeHtml(source.customerEmail || (fallbackData && fallbackData.email) || "") + "</p>"
      + '<p class="admin-preview-meta"><strong>電話番号:</strong> ' + escapeHtml(source.customerPhone || (fallbackData && fallbackData.phone) || "") + "</p>"
      + '<p class="admin-preview-meta"><strong>状況</strong> ' + escapeHtml(source.status || "") + "</p>"
      + '<ul class="admin-preview-list">' + participants.map(function (participant) {
        return "<li>" + escapeHtml((participant.participantName || "") + ((participant.participantNameKana || "") ? " / " + participant.participantNameKana : "")) + "</li>";
      }).join("") + "</ul>";
  }

  function applyServerValidation(err) {
    var parsed = parseErrorBody(err);
    var fieldErrors = {};
    if (parsed && Array.isArray(parsed.details)) {
      parsed.details.forEach(function (detail) {
        if (!detail || !detail.field) return;
        var field = detail.field;
        if (field.indexOf("participants[") === 0) {
          field = field.replace(/\[(\d+)\]\./g, ".$1.");
        }
        fieldErrors[field] = detail.reason || parsed.message;
      });
    }
    renderCreateErrors(fieldErrors);
    return Object.keys(fieldErrors).length > 0;
  }

  function buildParticipantsFromCustomer(data) {
    var total = Math.max(1, Number(data.participantCount || 1));
    var list = [];
    for (var i = 0; i < total; i += 1) {
      if (i === 0) {
        list.push({
          participantName: data.customerName || "",
          participantNameKana: data.customerNameKana || "",
          ageGroup: "",
          allergyNote: data.note || null
        });
      } else {
        list.push({
          participantName: "Participant " + i,
          participantNameKana: "",
          ageGroup: "",
          allergyNote: null
        });
      }
    }
    return list;
  }

  function normalizeParticipants(data) {
    var base = Array.isArray(data.participants) ? data.participants.slice(0) : [];
    var total = Math.max(1, Number(data.participantCount || 1));
    if (base.length !== total) {
      base = buildParticipantsFromCustomer(data);
    }
    if (base[0]) {
      base[0].participantName = base[0].participantName || data.customerName || "";
      base[0].participantNameKana = base[0].participantNameKana || data.customerNameKana || "";
      if (data.note && !base[0].allergyNote) {
        base[0].allergyNote = data.note;
      }
    }
    return base;
  }

  function buildReservationPayload(data) {
    var participants = normalizeParticipants(data);
    return {
      planId: data.planId,
      planTimeSlotId: data.planTimeSlotId,
      participantCount: data.participantCount,
      participants: participants.map(function (participant) {
        return {
          participantName: participant.participantName,
          participantNameKana: participant.participantNameKana,
          ageGroup: participant.ageGroup || null,
          allergyNote: participant.allergyNote || null
        };
      }),
      customerName: data.customerName,
      email: data.email,
      phone: data.phone
    };
  }

  function updateCreateSubmitState() {
    if (!createSubmitBtn || !createReservationForm) return;
    if (!createReservationEnabled) {
      createSubmitBtn.disabled = true;
      return;
    }
    var data = collectReservationFormData();
    var hasErrors = Object.keys(validateReservationForm(data, { requireConfirm: false })).length > 0;
    createSubmitBtn.disabled = hasErrors || !createPreviewConfirmed;
  }

  function resetReservationForm(options) {
    if (!createReservationForm) return;
    var keepPlan = options && options.keepPlanDate;
    var planValue = keepPlan && createPlanSelect ? createPlanSelect.value : "";
    var dateValue = keepPlan && createDateInput ? createDateInput.value : "";
    createReservationForm.reset();
    if (createPlanSelect) createPlanSelect.value = planValue;
    if (createDateInput) createDateInput.value = dateValue;
    if (createParticipantCountInput) createParticipantCountInput.value = "1";
    clearCreateErrors();
    clearCreateAlerts();
    setCreatePreviewConfirmed(false);
    resetCreateSlotOptions(keepPlan
      ? "予約内容を変更したため、空き枠を再取得してください"
      : "空き枠を取得してください");
    if (createSlotHelpEl) createSlotHelpEl.textContent = keepPlan
      ? "予約内容を変更したため、枠を再取得してください。"
      : "プランと日付を選択すると枠を取得できます。";
    renderParticipantFields(1);
    renderReservationPreview(null);
    updateCreateSubmitState();
  }

  function submitAdminReservation(data) {
    return withCsrf({ method: "POST", body: JSON.stringify(buildReservationPayload(data)) })
      .then(function (opt) { return fetchJson("/api/admin/reservations", opt); });
  }

  if (createReservationForm) {
    renderParticipantFields(getParticipantCountValue());
    renderReservationPreview(null);
    resetCreateSlotOptions("空き枠を取得してください");
    setCreateReservationEnabled(false);
    updateCreateSubmitState();

    createReservationForm.addEventListener("input", function (e) {
      clearCreateAlerts();
      if (e.target === createParticipantCountInput) {
        renderParticipantFields(getParticipantCountValue());
        resetCreateSlotOptions("参加人数が変わったため、空き枠を再取得してください");
        if (createSlotHelpEl) createSlotHelpEl.textContent = "参加人数が変わったため、枠を再取得してください。";
      }
      setCreatePreviewConfirmed(false);
      updateCreateSubmitState();
    });

    createReservationForm.addEventListener("change", function (e) {
      if (e.target === createPlanSelect || e.target === createDateInput) {
        setCreatePreviewConfirmed(false);
        resetCreateSlotOptions("プランまたは日付が変わったため、空き枠を再取得してください");
        if (createSlotHelpEl) createSlotHelpEl.textContent = "プランまたは日付が変わったため、枠を再取得してください。";
      }
      if (e.target === createSlotSelect) {
        setCreatePreviewConfirmed(false);
      }
      updateCreateSubmitState();
    });

    if (createLoadSlotsBtn) {
      createLoadSlotsBtn.addEventListener("click", function () {
        loadAvailableSlots();
      });
    }

    if (createPreviewBtn) {
      createPreviewBtn.addEventListener("click", function () {
        clearCreateAlerts();
        var data = collectReservationFormData();
        var errors = validateReservationForm(data, { requireConfirm: false });
        renderCreateErrors(errors);
        if (Object.keys(errors).length) {
          setCreatePreviewConfirmed(false);
          renderReservationPreview(null);
          setCreateAlert(createErrorEl, "必要項目を確認してプレビューを作成してください。");
          updateCreateSubmitState();
          return;
        }
        setCreatePreviewConfirmed(true);
        renderReservationPreview(data);
        setCreateAlert(createSuccessEl, "プレビューが作成されました。続けて予約を確定できます。");
        updateCreateSubmitState();
      });
    }

    createReservationForm.addEventListener("reset", function () {
      window.setTimeout(function () {
        resetReservationForm();
      }, 0);
    });

    createReservationForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearCreateAlerts();
      var data = collectReservationFormData();
      var errors = validateReservationForm(data);
      renderCreateErrors(errors);
      if (Object.keys(errors).length) {
        setCreateAlert(createErrorEl, "入力内容を確認して予約を送信してください。");
        updateCreateSubmitState();
        return;
      }

      if (createSubmitBtn) createSubmitBtn.disabled = true;

      submitAdminReservation(data)
        .then(function (reservation) {
          var summary = "予約を登録しました";
          if (reservation && reservation.id) {
            summary += " (ID: " + reservation.id + ")";
          }
          fetchReservations({ page: 0, size: 50 });
          resetReservationForm({ keepPlanDate: true });
          loadAvailableSlots();
          renderCreatedReservationSummary(reservation, data);
          setCreateAlert(createSuccessEl, summary + ".");
          createSubmitBtn.disabled = false;
        })
        .catch(function (err) {
          applyServerValidation(err);
          setCreateAlert(createErrorEl, escapeHtml(getSubmitErrorMessage(err)));
          setCreatePreviewConfirmed(false);
          updateCreateSubmitState();
          if (createSubmitBtn) createSubmitBtn.disabled = false;
        });
    });
  } // ← if (createReservationForm) を閉じる（これが抜けてた）

  function refreshAll() {
    fetchReservations({ page: 0, size: 50 });
    fetchSlots({ page: 0, size: 50 });
    fetchPlans();
  }

  function applyReservationStopNotice() {
    var config = window.__OPS__ || {};
    var enabled = config.reservationStop === true;
    var message = config.reservationStopMessage;
    var lines = Array.isArray(message) ? message : (message ? [String(message)] : null);
    qsa(".js-reservation-stop").forEach(function (el) {
      el.hidden = !enabled;
      if (!enabled || !lines || !lines.length) return;
      while (el.firstChild) { el.removeChild(el.firstChild); }
      lines.forEach(function (line) {
        var p = document.createElement("p");
        p.textContent = line;
        el.appendChild(p);
      });
    });
  }

  applyReservationStopNotice();
  loadMe().then(function (user) {
    if (user) refreshAll();
  });
})();
