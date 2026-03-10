(function () {
  var KEY = "perfumeReservation";
  var FINAL_KEY = "perfumeReservationFinal";
  var MAX_PEOPLE = 4;

  function getData() {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function setData(next) {
    sessionStorage.setItem(KEY, JSON.stringify(next));
  }

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function toNumber(value) {
    var n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function formatYen(value) {
    return "¥" + toNumber(value).toLocaleString("ja-JP");
  }

  qsa('.js-smooth[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      var target = qs(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  qsa(".js-faq-toggle").forEach(function (button) {
    button.addEventListener("click", function () {
      var panel = qs("#" + button.getAttribute("aria-controls"));
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", expanded ? "false" : "true");
      if (panel) panel.hidden = expanded;
    });
  });

  qsa(".js-course-select").forEach(function (button) {
    button.addEventListener("click", function () {
      var data = getData();
      data.course = {
        id: button.getAttribute("data-course-id"),
        name: button.getAttribute("data-course-name"),
        label: button.getAttribute("data-course-label"),
        price: toNumber(button.getAttribute("data-course-price")),
        duration: button.getAttribute("data-course-duration")
      };
      setData(data);
      window.location.href = "reserve-select-slot.html";
    });
  });

  var courseText = qs(".js-chosen-course");
  if (courseText) {
    var courseData = getData().course;
    courseText.textContent = courseData ? courseData.name : "未選択";
  }

  var slotDate = qs(".js-slot-date");
  var selectedDateText = qs(".js-selected-date");
  var selectedTimeText = qs(".js-selected-time");

  if (slotDate) {
    var slotData = getData().slot || {};
    if (slotData.date) slotDate.value = slotData.date;
    if (selectedDateText) selectedDateText.textContent = slotData.date || "未選択";
    if (selectedTimeText) selectedTimeText.textContent = slotData.time || "未選択";

    qsa(".js-date-pick").forEach(function (btn) {
      btn.addEventListener("click", function () {
        qsa(".js-date-pick").forEach(function (b) {
          b.classList.remove("is-selected");
        });
        btn.classList.add("is-selected");
        var dateValue = btn.getAttribute("data-date");
        slotDate.value = dateValue;
        var data = getData();
        data.slot = data.slot || {};
        data.slot.date = dateValue;
        setData(data);
        if (selectedDateText) selectedDateText.textContent = dateValue;
      });
    });

    qsa(".js-slot-select").forEach(function (button) {
      if (button.getAttribute("data-status") === "full") {
        button.disabled = true;
        button.setAttribute("aria-disabled", "true");
      }
      if (slotData.time === button.getAttribute("data-time")) {
        button.classList.add("is-selected");
      }
      button.addEventListener("click", function () {
        if (button.disabled) return;
        qsa(".js-slot-select").forEach(function (b) {
          b.classList.remove("is-selected");
        });
        button.classList.add("is-selected");
        var data = getData();
        data.slot = data.slot || {};
        data.slot.date = slotDate.value;
        data.slot.time = button.getAttribute("data-time");
        data.slot.status = button.getAttribute("data-status");
        setData(data);
        if (selectedTimeText) selectedTimeText.textContent = data.slot.time;
        if (selectedDateText) selectedDateText.textContent = data.slot.date || "未選択";
      });
    });
  }

  var toPeople = qs(".js-to-people");
  if (toPeople) {
    toPeople.addEventListener("click", function () {
      var data = getData();
      if (!data.course) {
        alert("先にコースを選択してください。");
        window.location.href = "reserve-select-course.html";
        return;
      }
      if (!data.slot || !data.slot.date || !data.slot.time || data.slot.status === "full") {
        alert("日程と時間を選択してください。");
        return;
      }
      window.location.href = "reserve.html";
    });
  }

  var peopleCount = qs(".js-people-count");
  if (peopleCount) {
    var dataPeople = getData();
    if (!dataPeople.course) {
      window.location.href = "reserve-select-course.html";
      return;
    }

    var people = toNumber(dataPeople.people || 2);
    if (people < 1) people = 1;
    if (people > MAX_PEOPLE) people = MAX_PEOPLE;
    dataPeople.people = people;
    setData(dataPeople);

    var remainEl = qs(".js-people-remaining");
    var unitEl = qs(".js-price-unit");
    var calcEl = qs(".js-price-calc");
    var totalEl = qs(".js-price-total");

    function updatePeopleView() {
      var d = getData();
      var unit = d.course ? toNumber(d.course.price) : 4000;
      var total = unit * people;
      peopleCount.textContent = String(people);
      if (remainEl) remainEl.textContent = "空き" + (MAX_PEOPLE - people) + "枠";
      if (unitEl) unitEl.textContent = formatYen(unit);
      if (calcEl) calcEl.textContent = formatYen(unit) + " × " + people;
      if (totalEl) totalEl.textContent = formatYen(total);
      d.people = people;
      setData(d);
    }

    var dec = qs(".js-people-dec");
    var inc = qs(".js-people-inc");
    if (dec) {
      dec.addEventListener("click", function () {
        people = Math.max(1, people - 1);
        updatePeopleView();
      });
    }
    if (inc) {
      inc.addEventListener("click", function () {
        people = Math.min(MAX_PEOPLE, people + 1);
        updatePeopleView();
      });
    }

    updatePeopleView();
  }

  var toForm = qs(".js-to-form");
  if (toForm) {
    toForm.addEventListener("click", function () {
      var data = getData();
      if (!data.course || !data.slot || !data.slot.date || !data.slot.time) {
        alert("コースと日程を先に選択してください。");
        window.location.href = "reserve-select-course.html";
        return;
      }
      if (!data.people) {
        alert("人数を選択してください。");
        return;
      }
      window.location.href = "reserve-form.html";
    });
  }

  var form = qs(".js-reserve-form");
  if (form) {
    var dataForForm = getData();
    if (!dataForForm.course || !dataForForm.slot || !dataForForm.people) {
      window.location.href = "reserve-select-course.html";
      return;
    }

    var fCourse = qs(".js-form-course");
    var fDate = qs(".js-form-date");
    var fPeople = qs(".js-form-people");
    var fCalc = qs(".js-form-calc");
    var fTotal = qs(".js-form-total");
    var unitPrice = dataForForm.course ? toNumber(dataForForm.course.price) : 4000;
    var totalPrice = unitPrice * toNumber(dataForForm.people);

    if (fCourse) fCourse.textContent = dataForForm.course.name;
    if (fDate) fDate.textContent = dataForForm.slot.date + " " + dataForForm.slot.time;
    if (fPeople) fPeople.textContent = String(dataForForm.people) + "名";
    if (fCalc) fCalc.textContent = formatYen(unitPrice) + " × " + dataForForm.people;
    if (fTotal) fTotal.textContent = formatYen(totalPrice);

    if (dataForForm.user) {
      Object.keys(dataForForm.user).forEach(function (key) {
        var field = qs('[name="' + key + '"]', form);
        if (field) field.value = dataForForm.user[key] || "";
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;

      function setError(name, message) {
        var input = qs('[name="' + name + '"]', form);
        var error = qs('[data-error="' + name + '"]', form);
        if (input) input.classList.toggle("is-error", !!message);
        if (error) error.textContent = message || "";
        if (message) ok = false;
      }

      var user = {
        name: qs('[name="name"]', form).value.trim(),
        kana: qs('[name="kana"]', form).value.trim(),
        email: qs('[name="email"]', form).value.trim(),
        phone: qs('[name="phone"]', form).value.trim(),
        note: qs('[name="note"]', form).value.trim()
      };

      setError("name", user.name ? "" : "お名前を入力してください。");
      setError("kana", user.kana ? "" : "フリガナを入力してください。");
      setError("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email) ? "" : "メールアドレスの形式が正しくありません。");
      setError("phone", /^[0-9\-]{10,13}$/.test(user.phone) ? "" : "電話番号は10〜13桁の数字またはハイフンで入力してください。");

      if (!ok) return;

      var data = getData();
      data.user = user;
      setData(data);
      window.location.href = "reserve-confirm.html";
    });
  }

  var summaryBlock = qs(".js-reserve-summary");
  if (summaryBlock) {
    var s = getData();
    if (!s.course || !s.slot || !s.people || !s.user) {
      summaryBlock.innerHTML = "<p>予約情報が不足しています。</p>";
    } else {
      var unit = toNumber(s.course.price);
      var total = unit * toNumber(s.people);
      qs(".js-summary-course").textContent = s.course.name;
      qs(".js-summary-datetime").textContent = s.slot.date + " " + s.slot.time;
      qs(".js-summary-people").textContent = s.people + "名様";
      qs(".js-summary-name").textContent = s.user.name + "（" + s.user.kana + "）";
      qs(".js-summary-email").textContent = s.user.email;
      qs(".js-summary-phone").textContent = s.user.phone;
      qs(".js-summary-note").textContent = s.user.note || "なし";
      qs(".js-summary-calc").textContent = formatYen(unit) + " × " + s.people;
      qs(".js-summary-total").textContent = formatYen(total);
    }
  }

  var confirmBtn = qs(".js-reserve-confirm");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", function () {
      var data = getData();
      if (!data.course || !data.slot || !data.people || !data.user) {
        alert("予約情報が不足しています。最初から入力してください。");
        window.location.href = "reserve-select-course.html";
        return;
      }
      sessionStorage.setItem(FINAL_KEY, JSON.stringify(data));
      sessionStorage.removeItem(KEY);
      window.location.href = "reserve-complete.html";
    });
  }

  var complete = qs(".js-complete-summary");
  if (complete) {
    var raw = sessionStorage.getItem(FINAL_KEY);
    if (!raw) {
      complete.innerHTML = "<p>予約情報が見つかりませんでした。<a href=\"reserve-select-course.html\">予約画面へ戻る</a></p>";
      return;
    }
    var finalData = JSON.parse(raw);
    var finalUnit = finalData.course ? toNumber(finalData.course.price) : 4000;
    var finalTotal = finalUnit * toNumber(finalData.people || 1);

    qs(".js-complete-datetime").textContent = finalData.slot.date + " " + finalData.slot.time;
    qs(".js-complete-course").textContent = finalData.course.name;
    qs(".js-complete-people").textContent = (finalData.people || 1) + "名様";
    qs(".js-complete-total").textContent = formatYen(finalTotal);
  }
})();
