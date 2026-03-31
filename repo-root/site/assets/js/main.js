(function () {
  var KEY = "perfumeReservation";
  var FINAL_KEY = "perfumeReservationFinal";
  var CSRF_KEY = "perfumeReservationCsrf";
  var MAX_PEOPLE = 10;
  var API_BASE = "https://project-kaori-fmup.onrender.com";
  var DEBUG = false;
  var COURSE_PRESETS = {
    "12blend": { id: "12blend", name: "12種ブレンド体験", label: "初心者向けコース", price: 4000, duration: "約60分" },
    "20blend": { id: "20blend", name: "20種ブレンド体験（月末限定）", label: "月末限定コース", price: 4000, duration: "約60分" }
  };

  function getData() { try { return JSON.parse(sessionStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function setData(next) { sessionStorage.setItem(KEY, JSON.stringify(next)); }
  function qs(selector, root) { return (root || document).querySelector(selector); }
  function qsa(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function toNumber(value) { var n = Number(value); return Number.isFinite(n) ? n : 0; }
  function formatYen(value) { return toNumber(value).toLocaleString("ja-JP") + "円"; }
  function formatMinutes(value) { var minutes = toNumber(value); return minutes ? ("約" + minutes + "分") : "約60分"; }
  function formatTime(value) { if (!value) return ""; return String(value).slice(0, 5); }

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
    if (cached) { try { return Promise.resolve(JSON.parse(cached)); } catch (e) { } }
    return fetchJson("/api/csrf").then(function (data) {
      sessionStorage.setItem(CSRF_KEY, JSON.stringify(data));
      return data;
    });
  }

  function getPlanIdFromCourse(course) {
    if (!course) return null;
    if (Number.isFinite(course.planId)) return course.planId;
    var numeric = Number(course.id);
    return Number.isFinite(numeric) ? numeric : null;
  }

  function renderCoursesFromApi(plans) {
    var container = qs(".p-app-courses");
    if (!container || !Array.isArray(plans) || !plans.length) return false;
    var html = plans.map(function (plan) {
      var rawName = String(plan.name || "プラン");
      var rawLabel = plan.description || (/月末/.test(rawName) ? "月末限定コース" : "初心者向けコース");
      var name = escapeHtml(rawName);
      var label = escapeHtml(rawLabel);
      var price = formatYen(plan.price);
      var duration = formatMinutes(plan.durationMinutes);
      return ''
        + '<article class="p-app-course">'
        + '<h2>' + name + '</h2>'
        + '<dl>'
        + '<div><dt>コース</dt><dd>' + label + '</dd></div>'
        + '<div><dt>所要時間</dt><dd>' + duration + '</dd></div>'
        + '<div><dt>料金</dt><dd>' + price + '</dd></div>'
        + '</dl>'
        + '<p class="p-app-button-row">'
        + '<button class="p-app-btn p-app-btn--muted js-course-select" type="button"'
        + ' data-course-id="' + escapeHtml(String(plan.id)) + '"'
        + ' data-plan-id="' + escapeHtml(String(plan.id)) + '"'
        + ' data-course-name="' + name + '"'
        + ' data-course-label="' + label + '"'
        + ' data-course-price="' + escapeHtml(String(plan.price || 0)) + '"'
        + ' data-course-duration="' + duration + '">日程を選択する</button>'
        + '</p>'
        + '</article>';
    }).join("");
    container.innerHTML = html;
    return true;
  }

  function loadCourses() {
    return fetchJson("/api/plans").then(function (plans) {
      if (renderCoursesFromApi(plans)) {
        qsa(".js-course-select").forEach(function (button) {
          button.addEventListener("click", function () {
            saveCourseSelection(getCourseFromElement(button));
            window.location.href = "reserve-select-slot.html";
          });
        });
      }
    }).catch(function () { return null; });
  }

  function getCoursePreset(id) { var preset = COURSE_PRESETS[id]; return preset ? Object.assign({}, preset) : null; }
  function saveCourseSelection(course) { var data = getData(); data.course = course; setData(data); }

  function getCourseFromElement(element) {
    var courseId = element.getAttribute("data-course-id");
    var planIdAttr = element.dataset.planId || element.getAttribute("data-plan-id");
    var planId = planIdAttr ? Number(planIdAttr) : null;
    return {
      id: courseId,
      planId: Number.isFinite(planId) ? planId : null,
      name: element.getAttribute("data-course-name") || (getCoursePreset(courseId) || {}).name,
      label: element.getAttribute("data-course-label") || (getCoursePreset(courseId) || {}).label,
      price: toNumber(element.getAttribute("data-course-price") || (getCoursePreset(courseId) || {}).price),
      duration: element.getAttribute("data-course-duration") || (getCoursePreset(courseId) || {}).duration
    };
  }

  function pad2(value) { return String(value).padStart(2, "0"); }
  function toDateKey(date) { return date.getFullYear() + "-" + pad2(date.getMonth() + 1) + "-" + pad2(date.getDate()); }
  function parseDateKey(value) { if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null; var parts = value.split("-").map(Number); return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0, 0); }
  function normalizeDate(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0); }
  function addMonths(date, months) { var base = normalizeDate(date); var year = base.getFullYear(); var month = base.getMonth(); var day = base.getDate(); var targetMonth = month + months; var targetYear = year + Math.floor(targetMonth / 12); targetMonth = ((targetMonth % 12) + 12) % 12; var lastDay = new Date(targetYear, targetMonth + 1, 0).getDate(); return new Date(targetYear, targetMonth, Math.min(day, lastDay), 12, 0, 0, 0); }
  function startOfMonth(date) { return new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0); }
  function formatDisplayDate(value) { var date = value instanceof Date ? normalizeDate(value) : parseDateKey(value); if (!date) return "未選択"; var weekdays = ["日", "月", "火", "水", "木", "金", "土"]; return date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日（" + weekdays[date.getDay()] + "）"; }

  function getNthWeekdayOfMonth(year, monthIndex, weekday, nth) { var first = new Date(year, monthIndex, 1, 12, 0, 0, 0); var offset = (7 + weekday - first.getDay()) % 7; return new Date(year, monthIndex, 1 + offset + (nth - 1) * 7, 12, 0, 0, 0); }
  function getVernalEquinoxDay(year) { return Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4)); }
  function getAutumnEquinoxDay(year) { return Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4)); }
  var holidayCache = {};
  function getJapaneseHolidaySet(year) {
    if (holidayCache[year]) return holidayCache[year];
    var holidays = {};
    function addHoliday(date) { holidays[toDateKey(date)] = true; }
    addHoliday(new Date(year, 0, 1, 12, 0, 0, 0));
    addHoliday(getNthWeekdayOfMonth(year, 0, 1, 2));
    addHoliday(new Date(year, 1, 11, 12, 0, 0, 0));
    if (year >= 2020) addHoliday(new Date(year, 1, 23, 12, 0, 0, 0));
    addHoliday(new Date(year, 2, getVernalEquinoxDay(year), 12, 0, 0, 0));
    addHoliday(new Date(year, 3, 29, 12, 0, 0, 0));
    addHoliday(new Date(year, 4, 3, 12, 0, 0, 0));
    addHoliday(new Date(year, 4, 4, 12, 0, 0, 0));
    addHoliday(new Date(year, 4, 5, 12, 0, 0, 0));
    addHoliday(getNthWeekdayOfMonth(year, 6, 1, 3));
    if (year >= 2016) addHoliday(new Date(year, 7, 11, 12, 0, 0, 0));
    addHoliday(getNthWeekdayOfMonth(year, 8, 1, 3));
    addHoliday(new Date(year, 8, getAutumnEquinoxDay(year), 12, 0, 0, 0));
    addHoliday(getNthWeekdayOfMonth(year, 9, 1, 2));
    addHoliday(new Date(year, 10, 3, 12, 0, 0, 0));
    addHoliday(new Date(year, 10, 23, 12, 0, 0, 0));
    function applyCitizenHoliday() {
      for (var month = 0; month < 12; month += 1) {
        var lastDay = new Date(year, month + 1, 0).getDate();
        for (var day = 2; day < lastDay; day += 1) {
          var date = new Date(year, month, day, 12, 0, 0, 0);
          var key = toDateKey(date);
          if (holidays[key]) continue;
          var prev = new Date(year, month, day - 1, 12, 0, 0, 0);
          var next = new Date(year, month, day + 1, 12, 0, 0, 0);
          if (holidays[toDateKey(prev)] && holidays[toDateKey(next)] && date.getDay() !== 0) {
            holidays[key] = true;
          }
        }
      }
    }
    function applySubstituteHoliday() {
      Object.keys(holidays).sort().forEach(function (key) {
        var holiday = parseDateKey(key);
        if (!holiday || holiday.getDay() !== 0) return;
        var substitute = new Date(holiday.getFullYear(), holiday.getMonth(), holiday.getDate() + 1, 12, 0, 0, 0);
        while (holidays[toDateKey(substitute)]) { substitute.setDate(substitute.getDate() + 1); }
        holidays[toDateKey(substitute)] = true;
      });
    }
    applyCitizenHoliday(); applySubstituteHoliday(); applyCitizenHoliday();
    holidayCache[year] = holidays;
    return holidays;
  }
  function isJapaneseHoliday(date) { return !!getJapaneseHolidaySet(date.getFullYear())[toDateKey(date)]; }
  function escapeHtml(value) { return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
  function normalizePhone(value) { return String(value || "").replace(/[０-９]/g, function (char) { return String.fromCharCode(char.charCodeAt(0) - 0xFEE0); }).replace(/[‐－ー―−]/g, "-").trim(); }
  function isKanaOnly(value) { return /^[\u3041-\u3096\u30A1-\u30FA\u30FC\s]+$/.test(String(value || "").trim()); }
  function convertAgeToGroup(age) {
    if (age < 20) return "10代";
    if (age < 30) return "20代";
    if (age < 40) return "30代";
    if (age < 50) return "40代";
    return "50代以上";
  }

  function buildParticipants(formParticipants, participantCount, customerName) {
    var base = Array.isArray(formParticipants) ? formParticipants.slice(0) : [];
    if (base.length < participantCount) {
      var total = Math.max(1, toNumber(participantCount));
      for (var i = base.length; i < total; i += 1) {
        base.push({ name: customerName, age: 30 });
      }
    }
    return base.map(function (p) {
      return {
        participantName: p.name,
        participantNameKana: p.name,
        ageGroup: convertAgeToGroup(p.age),
        allergyNote: ""
      };
    });
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
      saveCourseSelection(getCourseFromElement(button));
      window.location.href = "reserve-select-slot.html";
    });
  });

  qsa(".js-direct-course").forEach(function (link) {
    link.addEventListener("click", function () {
      var course = getCoursePreset(link.getAttribute("data-course-id")) || getCourseFromElement(link);
      if (course) saveCourseSelection(course);
    });
  });

  loadCourses();

  var courseText = qs(".js-chosen-course");
  if (courseText) {
    var courseData = getData().course;
    courseText.textContent = courseData ? courseData.name : "未選択";
  }

  var slotDate = qs(".js-slot-date");
  var selectedDateText = qs(".js-selected-date");
  var selectedTimeText = qs(".js-selected-time");
  var slotFetchStatus = "idle";
  var slotCache = {};

  if (slotDate) {
    var reservationData = getData();
    var courseFromQuery = null;
    try {
      var courseQuery = new URLSearchParams(window.location.search).get("course");
      courseFromQuery = courseQuery ? getCoursePreset(courseQuery) : null;
    } catch (e) { }
    if (courseFromQuery) {
      reservationData.course = courseFromQuery;
      setData(reservationData);
    }
    var slotData = reservationData.slot || {};
    var selectedCourse = reservationData.course || null;
    var calendarGrid = qs(".js-calendar-grid");
    var calendarTitle = qs(".js-calendar-title");
    var calendarPrev = qs(".js-calendar-prev");
    var calendarNext = qs(".js-calendar-next");
    var timeContainer = qs(".p-app-time");
    var nextButton = qs(".js-to-people");
    function setNextEnabled(enabled) {
      if (!nextButton) return;
      nextButton.disabled = !enabled;
      nextButton.setAttribute("aria-disabled", enabled ? "false" : "true");
    }
    if (timeContainer) {
      timeContainer.innerHTML = "";
    }
    setNextEnabled(false);
    var today = normalizeDate(new Date());
    var selectableStartMonth = startOfMonth(today);
    var selectableEndMonth = startOfMonth(addMonths(today, 2));
    var bookingStart = today;
    var bookingEnd = new Date(selectableEndMonth.getFullYear(), selectableEndMonth.getMonth() + 1, 0, 12, 0, 0, 0);

    function isWithinWindow(date) {
      return normalizeDate(date) >= bookingStart && normalizeDate(date) <= bookingEnd;
    }

    function isSelectableDate(date) {
      if (!isWithinWindow(date)) return false;
      var day = date.getDay();
      var isWeekendOrHoliday = day === 0 || day === 6 || isJapaneseHoliday(date);
      return isWeekendOrHoliday;
    }

    function getFirstSelectableDate() {
      for (var cursor = new Date(bookingStart); cursor <= bookingEnd; cursor.setDate(cursor.getDate() + 1)) {
        if (isSelectableDate(cursor)) return normalizeDate(cursor);
      }
      return null;
    }

    function setSelectedDate(date) {
      var key = date ? toDateKey(date) : "";
      slotDate.value = key;
      var data = getData();
      data.slot = data.slot || {};
      data.slot.date = key;
      data.slot.time = null;
      data.slot.id = null;
      data.slot.status = null;
      data.slot.remaining = null;
      data.slot.capacity = null;
      setData(data);
      slotData = data.slot;
      if (selectedTimeText) selectedTimeText.textContent = "未選択";
      if (key) loadTimeSlots(key);
      if (selectedDateText) selectedDateText.textContent = date ? formatDisplayDate(date) : "未選択";
    }

    var selectedDate = parseDateKey(slotData.date);
    if (!selectedDate || !isSelectableDate(selectedDate)) {
      selectedDate = getFirstSelectableDate();
    }
    setSelectedDate(selectedDate);
    if (selectedTimeText) selectedTimeText.textContent = slotData.time || "未選択";

    var displayMonth = selectedDate ? startOfMonth(selectedDate) : selectableStartMonth;

    function renderCalendar(monthDate) {
      if (!calendarGrid || !calendarTitle) return;
      var monthStart = startOfMonth(monthDate);
      var firstWeekday = monthStart.getDay();
      var lastDay = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
      var weekdays = ["日", "月", "火", "水", "木", "金", "土"];
      var cells = [];
      calendarTitle.textContent = monthStart.getFullYear() + "年" + (monthStart.getMonth() + 1) + "月";
      weekdays.forEach(function (label, index) {
        var extraClass = index === 0 ? " is-sunday" : index === 6 ? " is-saturday" : "";
        cells.push('<strong class="p-app-calendar-weekday' + extraClass + '">' + label + '</strong>');
      });
      for (var i = 0; i < firstWeekday; i += 1) { cells.push('<span class="is-blank" aria-hidden="true"></span>'); }
      for (var day = 1; day <= lastDay; day += 1) {
        var date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day, 12, 0, 0, 0);
        var key = toDateKey(date);
        var classes = [];
        if (!isWithinWindow(date)) classes.push("is-muted", "is-disabled");
        if (date.getDay() === 0) classes.push("is-sunday");
        if (date.getDay() === 6) classes.push("is-saturday");
        if (isJapaneseHoliday(date)) classes.push("is-holiday");
        if (selectedDate && key === toDateKey(selectedDate)) classes.push("is-selected");
        var planId = getPlanIdFromCourse(selectedCourse);
        var cacheKey = String(planId) + ":" + key;
        var cachedEmpty = !!(slotCache && slotCache[cacheKey] && slotCache[cacheKey].length === 0);
        if (cachedEmpty) classes.push("is-disabled");
        if (isSelectableDate(date) && !cachedEmpty) {
          cells.push('<button class="js-date-pick ' + classes.join(" ") + '" type="button" data-date="' + key + '">' + day + '</button>');
        } else {
          cells.push('<span class="' + classes.join(" ") + '">' + day + '</span>');
        }
      }
      while ((cells.length - 7) % 7 !== 0) { cells.push('<span class="is-blank" aria-hidden="true"></span>'); }
      calendarGrid.innerHTML = cells.join("");
      if (calendarPrev) calendarPrev.disabled = false;
      if (calendarNext) calendarNext.disabled = false;
    }

    renderCalendar(displayMonth);

    if (calendarGrid) {
      calendarGrid.addEventListener("click", function (e) {
        var btn = e.target.closest(".js-date-pick");
        if (!btn) return;
        var nextDate = parseDateKey(btn.getAttribute("data-date"));
        if (!nextDate || !isSelectableDate(nextDate)) return;
        selectedDate = normalizeDate(nextDate);
        renderCalendar(startOfMonth(selectedDate));
        setSelectedDate(selectedDate);
      });
    }

    if (calendarPrev) {
      calendarPrev.addEventListener("click", function () {
        var nextMonth = addMonths(displayMonth, -1);
        if (nextMonth < selectableStartMonth) return;
        displayMonth = nextMonth;
        renderCalendar(displayMonth);
      });
    }

    if (calendarNext) {
      calendarNext.addEventListener("click", function () {
        var nextMonth = addMonths(displayMonth, 1);
        if (nextMonth > selectableEndMonth) return;
        displayMonth = nextMonth;
        renderCalendar(displayMonth);
      });
    }

    function getSlotStatus(slot) {
      if (!slot) return "unknown";
      if (slot.isOpen === false) return "full";
      var capacity = toNumber(slot.capacity);
      var reserved = toNumber(slot.reservedCount);
      var remaining = capacity - reserved;
      if (remaining <= 0) return "full";
      if (remaining <= 2) return "few";
      return "available";
    }

    function renderTimeSlots(slots) {
      if (!timeContainer) return;
      if (!Array.isArray(slots) || !slots.length) {
        slotFetchStatus = "empty";
        timeContainer.innerHTML = '<p class="p-app-note">この日は予約枠がありません。</p>';
        setNextEnabled(false);
        return;
      }
      slotFetchStatus = "ok";
      var buttons = slots.map(function (slot) {
        var timeLabel = formatTime(slot.startTime);
        if (timeLabel) timeLabel = timeLabel + "〜";
        var capacity = toNumber(slot.capacity);
        var reserved = toNumber(slot.reservedCount);
        var remaining = capacity - reserved;
        var status = "available";
        if (slot.isOpen === false || remaining <= 0) {
          status = "full";
        } else if (remaining <= 3) {
          status = "few";
        }
        var symbol = status === "full" ? "×" : status === "few" ? "△" : "○";
        var disabled = status === "full";
        var slotIdValue = Number(slot.id);
        if (!Number.isInteger(slotIdValue) || slotIdValue <= 0) {
          disabled = true;
        }
        return '<button class="js-slot-select" type="button"'
          + ' data-slot-id="' + escapeHtml(String(slotIdValue)) + '"'
          + ' data-time="' + escapeHtml(timeLabel) + '"'
          + ' data-status="' + status + '"'
          + ' data-remaining="' + escapeHtml(String(remaining)) + '"'
          + ' data-capacity="' + escapeHtml(String(slot.capacity || 0)) + '"'
          + (disabled ? ' disabled aria-disabled="true"' : '')
          + '>' + symbol + ' ' + escapeHtml(timeLabel) + '</button>';
      }).join("");
      timeContainer.innerHTML = buttons;
      var matchedStatus = null;
      if (slotData && slotData.id) {
        qsa(".js-slot-select", timeContainer).forEach(function (btn) {
          if (btn.getAttribute("data-slot-id") === String(slotData.id)) {
            btn.classList.add("is-selected");
            matchedStatus = btn.getAttribute("data-status");
          }
        });
      }
      setNextEnabled(!!matchedStatus && matchedStatus !== "full");
    }

    function loadTimeSlots(dateKey) {
      var planId = getPlanIdFromCourse(selectedCourse);
      if (!planId || !dateKey) return;
      var cacheKey = String(planId) + ":" + dateKey;
      slotFetchStatus = "loading";
      if (timeContainer) {
        timeContainer.innerHTML = '<p class="p-app-note">読み込み中...</p>';
      }
      setNextEnabled(false);
      fetchJson("/api/plans/" + planId + "/time-slots?slotDate=" + encodeURIComponent(dateKey))
        .then(function (slots) {
          var list = slots || [];
          if (!list.length) {
            slotCache[cacheKey] = [];
          }
          renderTimeSlots(list);
        })
        .catch(function () {
          slotFetchStatus = "error";
          if (timeContainer) {
            timeContainer.innerHTML = '<p class="p-app-note">予約枠の取得に失敗しました。時間をおいて再度お試しください。</p>';
          }
          setNextEnabled(false);
        });
    }

    if (timeContainer && !timeContainer.getAttribute("data-bound")) {
      timeContainer.setAttribute("data-bound", "true");
      timeContainer.addEventListener("click", function (e) {
        var button = e.target.closest(".js-slot-select");
        if (!button || button.disabled) return;
        qsa(".js-slot-select", timeContainer).forEach(function (b) { b.classList.remove("is-selected"); });
        button.classList.add("is-selected");
        var data = getData();
        data.slot = data.slot || {};
        data.slot.date = slotDate.value;
        data.slot.time = button.getAttribute("data-time");
        var slotIdAttr = button.getAttribute("data-slot-id");
        var slotId = slotIdAttr ? Number(slotIdAttr) : NaN;
        if (!Number.isInteger(slotId) || slotId <= 0) return;
        data.slot.id = slotId;
        data.slot.status = button.getAttribute("data-status");
        data.slot.remaining = Number(button.getAttribute("data-remaining"));
        data.slot.capacity = Number(button.getAttribute("data-capacity"));
        setData(data);
        setNextEnabled(!!data.slot.id && data.slot.status !== "full");
        if (selectedTimeText) selectedTimeText.textContent = data.slot.time || "未選択";
        if (selectedDateText) selectedDateText.textContent = slotDate.value ? formatDisplayDate(slotDate.value) : "未選択";
      });
    }

    if (slotDate.value) { loadTimeSlots(slotDate.value); }
  }

  var toPeople = qs(".js-to-people");
  if (toPeople) {
    toPeople.addEventListener("click", function () {
      var data = getData();
      if (!data.course) { alert("先にコースを選択してください。"); window.location.href = "reserve-select-course.html"; return; }
      if (slotFetchStatus === "empty") { alert("この日は予約枠がありません。"); return; }
      if (slotFetchStatus === "error") { alert("予約枠の取得に失敗しました。ページを再読み込みしてください。"); return; }
      if (!data.slot || !data.slot.date || !data.slot.time) { alert("日程と時間を選択してください。"); return; }
      var slotId = Number(data.slot.id);
      if (!Number.isInteger(slotId) || slotId <= 0 || data.slot.status === "full") { alert("予約枠の取得に失敗しました。ページを再読み込みしてください。"); return; }
      window.location.href = "reserve.html";
    });
  }

  var peopleCount = qs(".js-people-count");
  if (peopleCount) {
    var dataPeople = getData();
    if (!dataPeople.course) { window.location.href = "reserve-select-course.html"; return; }
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
      var slotRemaining = d.slot && Number.isFinite(d.slot.remaining) ? d.slot.remaining : null;
      var maxPeople = slotRemaining && slotRemaining > 0 ? Math.min(MAX_PEOPLE, slotRemaining) : MAX_PEOPLE;
      people = Math.min(Math.max(1, people), maxPeople);
      var unit = d.course ? toNumber(d.course.price) : 4000;
      var total = unit * people;
      peopleCount.textContent = String(people);
      if (remainEl) { if (Number.isFinite(slotRemaining)) { remainEl.textContent = "空き" + Math.max(0, slotRemaining - people) + "枠"; } else { remainEl.textContent = "空き" + Math.max(0, MAX_PEOPLE - people) + "枠"; } }
      if (unitEl) unitEl.textContent = formatYen(unit);
      if (calcEl) calcEl.textContent = formatYen(unit) + " × " + people;
      if (totalEl) totalEl.textContent = formatYen(total);
      d.people = people; setData(d);
    }
    var dec = qs(".js-people-dec");
    var inc = qs(".js-people-inc");
    if (dec) { dec.addEventListener("click", function () { people = Math.max(1, people - 1); updatePeopleView(); }); }
    if (inc) { inc.addEventListener("click", function () { people = Math.min(MAX_PEOPLE, people + 1); updatePeopleView(); }); }
    updatePeopleView();
  }

  var toForm = qs(".js-to-form");
  if (toForm) {
    toForm.addEventListener("click", function () {
      var data = getData();
      if (!data.course || !data.slot || !data.slot.date || !data.slot.time || !data.slot.id) { alert("コースと日程を先に選択してください。"); window.location.href = "reserve-select-course.html"; return; }
      if (!data.people) { alert("人数を選択してください。"); return; }
      window.location.href = "reserve-form.html";
    });
  }

  var form = qs(".js-reserve-form");
  if (form) {
    var dataForForm = getData();
    if (!dataForForm.course || !dataForForm.slot || !dataForForm.people) { window.location.href = "reserve-select-course.html"; return; }
    var fCourse = qs(".js-form-course");
    var fDate = qs(".js-form-date");
    var fPeople = qs(".js-form-people");
    var fCalc = qs(".js-form-calc");
    var fTotal = qs(".js-form-total");
    var nameField = qs('[name="name"]', form);
    var unitPrice = dataForForm.course ? toNumber(dataForForm.course.price) : 4000;
    var totalPrice = unitPrice * toNumber(dataForForm.people);
    if (fCourse) fCourse.textContent = dataForForm.course.name;
    if (fDate) fDate.textContent = formatDisplayDate(dataForForm.slot.date) + " " + dataForForm.slot.time;
    if (fPeople) fPeople.textContent = String(dataForForm.people) + "\u4EBA";
    if (fCalc) fCalc.textContent = formatYen(unitPrice) + " \u00D7" + dataForForm.people;
    if (fTotal) fTotal.textContent = formatYen(totalPrice);
    if (dataForForm.user) { Object.keys(dataForForm.user).forEach(function (key) { var field = qs('[name="' + key + '"]', form); if (field) field.value = dataForForm.user[key] || ""; }); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var firstInvalid = null;
      function setError(name, message) { var input = qs('[name="' + name + '"]', form); var error = qs('[data-error="' + name + '"]', form); if (input) input.classList.toggle("is-error", !!message); if (error) error.textContent = message || ""; if (message) { ok = false; if (!firstInvalid && input) firstInvalid = input; } }
      var user = { name: qs('[name="name"]', form).value.trim(), email: qs('[name="email"]', form).value.trim(), phone: normalizePhone(qs('[name="phone"]', form).value), note: qs('[name="note"]', form).value.trim() };
      var katakanaPattern = /^[\u30A0-\u30FF\u30FC\s]+$/;
      if (!user.name) {
        setError("name", "お名前を入力してください。");
      } else if (!katakanaPattern.test(user.name)) {
        setError("name", "全角カタカナで入力してください。");
      } else {
        setError("name", "");
      }
      setError("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email) ? "" : "メールアドレスの形式が正しくありません。");
      setError("phone", /^[0-9\\-]{10,13}$/.test(user.phone) ? "" : "電話番号は10〜13桁の数字またはハイフンで入力してください。");
      if (!ok) { if (firstInvalid && typeof firstInvalid.focus === "function") { firstInvalid.focus(); } return; }
      var data = getData(); data.user = user; setData(data); window.location.href = "reserve-confirm.html";
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
      qs(".js-summary-datetime").textContent = formatDisplayDate(s.slot.date) + " " + s.slot.time;
      qs(".js-summary-people").textContent = s.people + "名様";
      qs(".js-summary-name").textContent = s.user.name;
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
      if (!data.course || !data.slot || !data.people || !data.user) { alert("予約情報が不足しています。最初から入力してください。"); window.location.href = "reserve-select-course.html"; return; }
      var planId = getPlanIdFromCourse(data.course);
      if (!planId || !data.slot.id) { alert("日程と時間を選択してください。"); window.location.href = "reserve-select-slot.html"; return; }
      var errorEl = qs(".js-confirm-error");
      if (!errorEl) { errorEl = document.createElement("p"); errorEl.className = "p-form__error js-confirm-error"; confirmBtn.parentNode.insertBefore(errorEl, confirmBtn.nextSibling); }
      errorEl.textContent = "";
      var originalText = confirmBtn.textContent;
      confirmBtn.disabled = true;
      confirmBtn.textContent = "送信中...";
      var payload = { planId: planId, planTimeSlotId: data.slot.id, participantCount: data.people, participants: buildParticipants(data.participants || [], data.people, data.user.name), customerName: data.user.name, email: data.user.email, phone: data.user.phone };
      getCsrfToken()
        .then(function (csrf) {
          var headers = {}; headers[csrf.headerName || "X-XSRF-TOKEN"] = csrf.token;
          return fetchJson("/api/reservations", { method: "POST", headers: headers, body: JSON.stringify(payload) });
        })
        .then(function (resp) {
          data.apiResponse = resp || null;
          sessionStorage.setItem(FINAL_KEY, JSON.stringify(data));
          sessionStorage.removeItem(KEY);
          window.location.href = "reserve-complete.html";
        })
        .catch(function (err) {
          confirmBtn.disabled = false;
          confirmBtn.textContent = originalText;
          if (errorEl) {
            if (err && (err.status === 403 || err.status === 401)) {
              errorEl.textContent = "セキュリティ確認に失敗しました。再読み込みして再度お試しください。";
            } else {
              errorEl.textContent = "送信に失敗しました。時間を置いて再度お試しください。";
            }
          }
        });
    });
  }

  var complete = qs(".js-complete-summary");
  if (complete) {
    var raw = sessionStorage.getItem(FINAL_KEY);
    if (!raw) { complete.innerHTML = "<p>予約情報が見つかりませんでした。<a href=\"reserve-select-course.html\">予約画面へ戻る</a></p>"; return; }
    var finalData = JSON.parse(raw);
    var finalUnit = finalData.course ? toNumber(finalData.course.price) : 4000;
    var finalTotal = finalUnit * toNumber(finalData.people || 1);
    qs(".js-complete-datetime").textContent = formatDisplayDate(finalData.slot.date) + " " + finalData.slot.time;
    qs(".js-complete-course").textContent = finalData.course.name;
    qs(".js-complete-people").textContent = (finalData.people || 1) + "名様";
    qs(".js-complete-total").textContent = formatYen(finalTotal);
    if (finalData.apiResponse && finalData.apiResponse.id) {
      var box = qs(".js-complete-summary");
      if (box && !qs(".js-complete-id", box)) { var p = document.createElement("p"); p.className = "js-complete-id"; p.textContent = "予約番号: " + finalData.apiResponse.id; box.appendChild(p); }
    }
  }

  function isPublicPage() { return document.body && document.body.classList.contains("perfume-site") && !document.body.classList.contains("p-app-page"); }
  function normalizeReserveLinks() { qsa('.p-home-side-cta, .c-button[href], .p-wire-map-link[href]').forEach(function (link) { if (link.classList.contains("js-direct-course")) return; var href = link.getAttribute("href"); if (!href || href.indexOf("http") === 0 || href.charAt(0) === "#" || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return; if (/^reserve(?:-[\\w-]+)?\\.html(?:#.*)?$/i.test(href)) { link.setAttribute("href", "reserve-select-course.html"); } }); }
  function disableCourseParentLink() { qsa(".p-home-sidebar .p-home-side-parent > a").forEach(function (link) { link.setAttribute("aria-disabled", "true"); link.setAttribute("tabindex", "-1"); link.addEventListener("click", function (e) { e.preventDefault(); }); }); }
  function initHeroSlideshow() { var root = qs(".js-hero-slideshow"); if (!root) return; var slides = qsa(".p-wire-hero-slide", root); if (slides.length < 2) return; var index = slides.findIndex(function (slide) { return slide.classList.contains("is-active"); }); if (index < 0) index = 0; function show(nextIndex) { slides.forEach(function (slide, i) { slide.classList.toggle("is-active", i === nextIndex); }); index = nextIndex; } show(index); window.setInterval(function () { show((index + 1) % slides.length); }, 5000); }
  function initMobileDrawer() { var sidebar = qs(".p-home-sidebar"); if (!sidebar) return; if (qs(".p-home-drawer-toggle")) return; var desktopMedia = window.matchMedia("(min-width: 1101px)"); var toggle = document.createElement("button"); toggle.type = "button"; toggle.className = "p-home-drawer-toggle"; toggle.setAttribute("aria-label", "メニューを開く"); toggle.setAttribute("aria-expanded", "false"); toggle.innerHTML = '<span aria-hidden="true">☰</span>'; var close = document.createElement("button"); close.type = "button"; close.className = "p-home-drawer-close"; close.setAttribute("aria-label", "メニューを閉じる"); close.innerHTML = '<span aria-hidden="true">×</span>'; var backdrop = document.createElement("button"); backdrop.type = "button"; backdrop.className = "p-home-drawer-backdrop"; backdrop.setAttribute("aria-label", "メニューを閉じる"); backdrop.hidden = true; sidebar.insertBefore(close, sidebar.firstChild); document.body.appendChild(toggle); document.body.appendChild(backdrop); function setOpen(open) { if (desktopMedia.matches) open = false; sidebar.classList.toggle("is-open", open); document.body.classList.toggle("is-drawer-open", open); toggle.setAttribute("aria-expanded", open ? "true" : "false"); backdrop.hidden = !open; document.body.style.overflow = open ? "hidden" : ""; } toggle.addEventListener("click", function () { setOpen(!sidebar.classList.contains("is-open")); }); close.addEventListener("click", function () { setOpen(false); }); backdrop.addEventListener("click", function () { setOpen(false); }); document.addEventListener("keydown", function (e) { if (e.key === "Escape" && sidebar.classList.contains("is-open")) { setOpen(false); } }); qsa("a[href]", sidebar).forEach(function (link) { if (link.closest(".p-home-side-parent")) return; link.addEventListener("click", function () { setOpen(false); }); }); window.addEventListener("resize", function () { if (desktopMedia.matches) { setOpen(false); } }); }
  if (isPublicPage()) { normalizeReserveLinks(); disableCourseParentLink(); initHeroSlideshow(); initMobileDrawer(); }
})();
