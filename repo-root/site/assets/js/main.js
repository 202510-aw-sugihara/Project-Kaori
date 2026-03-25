(function () {
  var KEY = "perfumeReservation";
  var FINAL_KEY = "perfumeReservationFinal";
  var CSRF_KEY = "perfumeReservationCsrf";
  var MAX_PEOPLE = 10;
  var API_BASE = "https://project-kaori-fmup.onrender.com";
  var COURSE_PRESETS = {
    "12blend": { id: "12blend", name: "12鬯ｩ蠅難ｽｩ・ｸ繝ｻ・ｽ繝ｻ・ｮ鬩幢ｽ｢隴弱・ﾂｧ繝ｻ蜿厄ｽｨ謚ｵ・ｽ・ｹ隴趣ｽ｢繝ｻ・ｽ繝ｻ・ｳ鬩幢ｽ｢隴弱・繝ｻ郢晢ｽｻ繝ｻ・ｽ鬯ｯ・･繝ｻ・ｴ郢晢ｽｻ繝ｻ・ｨ驛｢譎｢・ｽ・ｻ, label: "鬮ｯ蜈ｷ・ｽ・ｻ髫ｴ蜿門ｾ励・・ｽ繝ｻ・ｿ驛｢譎｢・ｽ・ｻ繝ｻ縺､ﾂ驛｢譎｢・ｽ・ｻ鬯ｯ・ｮ郢晢ｽｻ繝ｻ・ｸ繝ｻ・ｺ髣比ｼ夲ｽｽ・｣驍ｵ・ｺ隲ｷ蛹・ｽｽ・ｹ隴趣ｽ｢繝ｻ・ｽ繝ｻ・ｼ鬩幢ｽ｢繝ｻ・ｧ郢晢ｽｻ繝ｻ・ｹ", price: 4000, duration: "鬯ｩ蝣ｺ・ｸ鄙ｫ繝ｻ0鬮ｯ蜈ｷ・ｽ・ｻ驛｢譎｢・ｽ・ｻ },
    "20blend": { id: "20blend", name: "20鬯ｩ蠅難ｽｩ・ｸ繝ｻ・ｽ繝ｻ・ｮ鬩幢ｽ｢隴弱・ﾂｧ繝ｻ蜿厄ｽｨ謚ｵ・ｽ・ｹ隴趣ｽ｢繝ｻ・ｽ繝ｻ・ｳ鬩幢ｽ｢隴弱・繝ｻ郢晢ｽｻ繝ｻ・ｽ鬯ｯ・･繝ｻ・ｴ郢晢ｽｻ繝ｻ・ｨ鬯ｮ・ｮ繝ｻ・｣郢晢ｽｻ繝ｻ・ｼ髯懈瑳・ｻ逹｣ﾂ繝ｻ・ｦ鬮ｫ・ｴ陝ｷ・｢繝ｻ・ｽ繝ｻ・ｫ鬯ｯ・ｮ繝ｻ・ｯ髣皮甥驕懊・・ｽ繝ｻ・ｮ髯樊ｻゑｽｽ・ｲ郢晢ｽｻ繝ｻ・ｼ驛｢譎｢・ｽ・ｻ, label: "鬮ｫ・ｴ陝ｶ蟶ｶ・ｲ・ｺ髯滂ｽ｢繝ｻ・ｰ鬯ｯ・ｮ繝ｻ・ｯ髣皮甥驕懊・・ｽ繝ｻ・ｮ髯橸ｽ｢繝ｻ・ｹ驍ｵ・ｺ隲ｷ蛹・ｽｽ・ｹ隴趣ｽ｢繝ｻ・ｽ繝ｻ・ｼ鬩幢ｽ｢繝ｻ・ｧ郢晢ｽｻ繝ｻ・ｹ", price: 4000, duration: "鬯ｩ蝣ｺ・ｸ鄙ｫ繝ｻ0鬮ｯ蜈ｷ・ｽ・ｻ驛｢譎｢・ｽ・ｻ }
  };

  function getData() { try { return JSON.parse(sessionStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function setData(next) { sessionStorage.setItem(KEY, JSON.stringify(next)); }
  function qs(selector, root) { return (root || document).querySelector(selector); }
  function qsa(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function toNumber(value) { var n = Number(value); return Number.isFinite(n) ? n : 0; }
  function formatYen(value) { return "郢晢ｽｻ郢ｧ謇假ｽｽ・ｽ繝ｻ・･" + toNumber(value).toLocaleString("ja-JP"); }
  function formatMinutes(value) { var minutes = toNumber(value); return minutes ? ("鬯ｩ蝣ｺ・ｸ鄙ｫ繝ｻ + minutes + "鬮ｯ蜈ｷ・ｽ・ｻ驛｢譎｢・ｽ・ｻ) : "鬯ｩ蝣ｺ・ｸ鄙ｫ繝ｻ0鬮ｯ蜈ｷ・ｽ・ｻ驛｢譎｢・ｽ・ｻ; }
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
    if (cached) { try { return Promise.resolve(JSON.parse(cached)); } catch (e) {} }
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

  var planCache = [];
  function setPlanCache(plans) { planCache = Array.isArray(plans) ? plans : []; }
  function normalizeCourseText(value) { return String(value || "").replace(/[驛｢譎｢・ｽ・ｻ驛｢譎｢・ｽ・ｻ驛｢譎｢・ｽ・ｻ髯ｷ闌ｨ・ｽ・｢/g, function (char) { return String.fromCharCode(char.charCodeAt(0) - 0xFEE0); }).replace(/\s+/g, ""); }
  function findPlanForPreset(presetId, plans) {
    if (!presetId || !Array.isArray(plans) || !plans.length) return null;
    var is20 = presetId === "20blend";
    var is12 = presetId === "12blend";
    if (!is20 && !is12) return null;
    var target = null;
    for (var i = 0; i < plans.length; i += 1) {
      var plan = plans[i];
      if (!plan) continue;
      var text = normalizeCourseText((plan.name || "") + " " + (plan.description || ""));
      if (is20) {
        if (text.indexOf("20") !== -1 && text.indexOf("鬮ｫ・ｴ陝ｶ蟶ｶ・ｲ・ｺ髯滂ｽ｢繝ｻ・ｰ") !== -1) { target = plan; break; }
      } else if (is12) {
        if (text.indexOf("12") !== -1 && text.indexOf("鬮ｫ・ｴ陝ｶ蟶ｶ・ｲ・ｺ髯滂ｽ｢繝ｻ・ｰ") === -1) { target = plan; break; }
      }
    }
    return target;
  }
  function ensurePlanId(course, plans) {
    var planId = getPlanIdFromCourse(course);
    if (planId) return planId;
    var matched = findPlanForPreset(course ? course.id : null, plans || planCache);
    if (matched && Number.isFinite(matched.id)) {
      course.planId = matched.id;
      var data = getData();
      if (data && data.course && data.course.id === course.id) {
        data.course.planId = matched.id;
        setData(data);
      }
      return matched.id;
    }
    return null;
  }

  function renderCoursesFromApi(plans) {
    var container = qs(".p-app-courses");
    if (!container || !Array.isArray(plans) || !plans.length) return false;
    var html = plans.map(function (plan) {
      var rawName = String(plan.name || "鬩幢ｽ｢隴惹ｸ橸ｽｹ・ｲ繝ｻ荳ｻ・ｸ・ｷ繝ｻ・ｹ隴趣ｽ｢繝ｻ・ｽ繝ｻ・ｳ");
      var rawLabel = plan.description || (/鬮ｫ・ｴ陝ｶ蟶ｶ・ｲ・ｺ髯滂ｽ｢繝ｻ・ｰ/.test(rawName) ? "鬮ｫ・ｴ陝ｶ蟶ｶ・ｲ・ｺ髯滂ｽ｢繝ｻ・ｰ鬯ｯ・ｮ繝ｻ・ｯ髣皮甥驕懊・・ｽ繝ｻ・ｮ髯橸ｽ｢繝ｻ・ｹ驍ｵ・ｺ隲ｷ蛹・ｽｽ・ｹ隴趣ｽ｢繝ｻ・ｽ繝ｻ・ｼ鬩幢ｽ｢繝ｻ・ｧ郢晢ｽｻ繝ｻ・ｹ" : "鬮ｯ蜈ｷ・ｽ・ｻ髫ｴ蜿門ｾ励・・ｽ繝ｻ・ｿ驛｢譎｢・ｽ・ｻ繝ｻ縺､ﾂ驛｢譎｢・ｽ・ｻ鬯ｯ・ｮ郢晢ｽｻ繝ｻ・ｸ繝ｻ・ｺ髣比ｼ夲ｽｽ・｣驍ｵ・ｺ隲ｷ蛹・ｽｽ・ｹ隴趣ｽ｢繝ｻ・ｽ繝ｻ・ｼ鬩幢ｽ｢繝ｻ・ｧ郢晢ｽｻ繝ｻ・ｹ");
      var name = escapeHtml(rawName);
      var label = escapeHtml(rawLabel);
      var price = formatYen(plan.price);
      var duration = formatMinutes(plan.durationMinutes);
      return ''
        + '<article class="p-app-course">'
        + '<h2>' + name + '</h2>'
        + '<dl>'
        + '<div><dt>鬩幢ｽ｢繝ｻ・ｧ郢晢ｽｻ繝ｻ・ｳ鬩幢ｽ｢隴趣ｽ｢繝ｻ・ｽ繝ｻ・ｼ鬩幢ｽ｢繝ｻ・ｧ郢晢ｽｻ繝ｻ・ｹ</dt><dd>' + label + '</dd></div>'
        + '<div><dt>鬮ｫ・ｰ郢晢ｽｻ・つ鬯ｮ・ｫ髯ｬ諛域｡ｶ髯ｷ繝ｻ・ｽ・ｾ鬯ｯ・ｮ繝ｻ・｢驛｢譎｢・ｽ・ｻ/dt><dd>' + duration + '</dd></div>'
        + '<div><dt>鬮ｫ・ｴ遶乗凵蜍驕ｶ蛹・ｽｽ・｡</dt><dd>' + price + '</dd></div>'
        + '</dl>'
        + '<p class="p-app-button-row">'
        + '<button class="p-app-btn p-app-btn--muted js-course-select" type="button"'
        + ' data-course-id="' + escapeHtml(String(plan.id)) + '"'
        + ' data-plan-id="' + escapeHtml(String(plan.id)) + '"'
        + ' data-course-name="' + name + '"'
        + ' data-course-label="' + label + '"'
        + ' data-course-price="' + escapeHtml(String(plan.price || 0)) + '"'
        + ' data-course-duration="' + duration + '">鬮ｫ・ｴ鬲・ｼ夲ｽｽ・ｽ繝ｻ・･鬯ｩ蠅難ｽｨ雋ｻ・ｽ・ｹ隴趣ｽ｢繝ｻ・ｽ陝ｶ譎｢・ｽ・ｩ陋ｹ繝ｻ・ｽ・ｽ繝ｻ・ｸ鬮ｫ・ｰ陞｢・ｽ繝ｻ・ｧ繝ｻ・ｭ髫ｨ蛟･繝ｻ繝ｻ・ｹ繝ｻ・ｧ驛｢譎｢・ｽ・ｻ/button>'
        + '</p>'
        + '</article>';
    }).join("");
    container.innerHTML = html;
    return true;
  }

  function loadCourses() {
    return fetchJson("/api/plans").then(function (plans) {
      setPlanCache(plans);
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
    var planIdAttr = element.getAttribute("data-plan-id");
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
  function formatDisplayDate(value) { var date = value instanceof Date ? normalizeDate(value) : parseDateKey(value); if (!date) return "鬮ｫ・ｴ陝ｷ・｢繝ｻ・ｽ繝ｻ・ｪ鬯ｯ・ｩ陋ｹ繝ｻ・ｽ・ｽ繝ｻ・ｸ鬮ｫ・ｰ陞｢・ｹ郢晢ｽｻ; var weekdays = ["鬮ｫ・ｴ鬲・ｼ夲ｽｽ・ｽ繝ｻ・･", "鬮ｫ・ｴ陝ｶ蜷ｶ繝ｻ, "鬮ｴ髮｣・ｽ・｣郢晢ｽｻ繝ｻ・ｫ", "鬮ｮ譛ｱ・ｯ莨夲ｽｽ・ｽ繝ｻ・ｴ", "鬮ｫ・ｴ陝ｷ・｢繝ｻ・ｽ繝ｻ・ｨ", "鬯ｯ・ｩ繝ｻ・･驛｢譎｢・ｽ・ｻ, "鬮ｯ諛ｶ・ｽ・ｨ驛｢譎｢・ｽ・ｻ]; return date.getFullYear() + "鬮ｯ譎｢・ｽ・ｷ郢晢ｽｻ繝ｻ・ｴ" + (date.getMonth() + 1) + "鬮ｫ・ｴ陝ｶ蜷ｶ繝ｻ + date.getDate() + "鬮ｫ・ｴ鬲・ｼ夲ｽｽ・ｽ繝ｻ・･驛｢譎｢・ｽ・ｻ驛｢譎｢・ｽ・ｻ + weekdays[date.getDay()] + "驛｢譎｢・ｽ・ｻ驛｢譎｢・ｽ・ｻ; }

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
  function toKatakana(value) { return String(value || "").replace(/[\u3041-\u3096]/g, function (char) { return String.fromCharCode(char.charCodeAt(0) + 0x60); }).replace(/\s+/g, " ").trim(); }
  function normalizePhone(value) { return String(value || "").replace(/[驛｢譎｢・ｽ・ｻ驛｢譎｢・ｽ・ｻ驛｢譎｢・ｽ・ｻ髯ｷ闌ｨ・ｽ・｢/g, function (char) { return String.fromCharCode(char.charCodeAt(0) - 0xFEE0); }).replace(/[鬩包ｽｯ繝ｻ・ｶ髫ｰ・ｦ繝ｻ・ｰ郢晢ｽｻ繝ｻ・ｼ鬯ｮ・ｦ繝ｻ・ｪ驛｢譎｢・ｽ・ｻ鬩包ｽｯ繝ｻ・ｶ鬮ｯ・ｬ隲帷ｿｫ繝ｻ]/g, "-").trim(); }
  function isKanaOnly(value) { return /^[\u3041-\u3096\u30A1-\u30FA\u30FC\s]+$/.test(String(value || "").trim()); }
  function buildParticipants(user, count) {
    var total = Math.max(1, toNumber(count));
    var list = [];
    for (var i = 0; i < total; i += 1) {
      if (i === 0) {
        list.push({ participantName: user.name, participantNameKana: user.kana, ageGroup: "", allergyNote: user.note || "" });
      } else {
        list.push({ participantName: "鬮ｯ・ｷ繝ｻ・ｷ髯溷桁・ｽ・｡郢晢ｽｻ繝ｻ・ｼ郢晢ｽｻ繝ｻ・ｴ鬯ｮ・｢繝ｻ・ｰ驛｢譎｢・ｽ・ｻ + i, participantNameKana: "", ageGroup: "", allergyNote: "" });
      }
    }
    return list;
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
    courseText.textContent = courseData ? courseData.name : "鬮ｫ・ｴ陝ｷ・｢繝ｻ・ｽ繝ｻ・ｪ鬯ｯ・ｩ陋ｹ繝ｻ・ｽ・ｽ繝ｻ・ｸ鬮ｫ・ｰ陞｢・ｹ郢晢ｽｻ;
  }

  var slotDate = qs(".js-slot-date");
  var selectedDateText = qs(".js-selected-date");
  var selectedTimeText = qs(".js-selected-time");

  if (slotDate) {
    var reservationData = getData();
    var courseFromQuery = null;
    try {
      var courseQuery = new URLSearchParams(window.location.search).get("course");
      courseFromQuery = courseQuery ? getCoursePreset(courseQuery) : null;
    } catch (e) {}
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
    var today = normalizeDate(new Date());
    var selectableStartMonth = startOfMonth(today);
    var selectableEndMonth = startOfMonth(addMonths(today, 2));
    var bookingStart = today;
    var bookingEnd = new Date(selectableEndMonth.getFullYear(), selectableEndMonth.getMonth() + 1, 0, 12, 0, 0, 0);

    function isWithinWindow(date) {
      return normalizeDate(date) >= bookingStart && normalizeDate(date) <= bookingEnd;
    }

    function isMonthEndDate(date) {
      var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0, 12, 0, 0, 0).getDate();
      return date.getDate() >= lastDay - 6;
    }

    function isMonthEndCourse(course) {
      if (!course) return false;
      if (course.id === "20blend") return true;
      if (course.id === "12blend") return false;
      var text = normalizeCourseText((course.name || "") + " " + (course.label || ""));
      return text.indexOf("20") !== -1 && text.indexOf("鬮ｫ・ｴ陝ｶ蟶ｶ・ｲ・ｺ髯滂ｽ｢繝ｻ・ｰ") !== -1;
    }

    function isSelectableDate(date) {
      var day = date.getDay();
      var isWeekendOrHoliday = day === 0 || day === 6 || isJapaneseHoliday(date);
      if (!isWithinWindow(date)) return false;
      if (!isWeekendOrHoliday) return false;
      if (!selectedCourse) return true;
      if (isMonthEndCourse(selectedCourse)) return isMonthEndDate(date);
      if (selectedCourse.id === "12blend") return !isMonthEndDate(date);
      return true;
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
      data.slot.time = "";
      data.slot.id = null;
      data.slot.status = "";
      data.slot.remaining = null;
      data.slot.capacity = null;
      setData(data);
      if (selectedTimeText) selectedTimeText.textContent = "鬮ｫ・ｴ陝ｷ・｢繝ｻ・ｽ繝ｻ・ｪ鬯ｯ・ｩ陋ｹ繝ｻ・ｽ・ｽ繝ｻ・ｸ鬮ｫ・ｰ陞｢・ｹ郢晢ｽｻ;
      if (key) loadTimeSlots(key);
      if (selectedDateText) selectedDateText.textContent = date ? formatDisplayDate(date) : "鬮ｫ・ｴ陝ｷ・｢繝ｻ・ｽ繝ｻ・ｪ鬯ｯ・ｩ陋ｹ繝ｻ・ｽ・ｽ繝ｻ・ｸ鬮ｫ・ｰ陞｢・ｹ郢晢ｽｻ;
    }

    var selectedDate = parseDateKey(slotData.date);
    if (!selectedDate || !isSelectableDate(selectedDate)) {
      selectedDate = getFirstSelectableDate();
    }
    setSelectedDate(selectedDate);
    if (selectedTimeText) selectedTimeText.textContent = slotData.time || "鬮ｫ・ｴ陝ｷ・｢繝ｻ・ｽ繝ｻ・ｪ鬯ｯ・ｩ陋ｹ繝ｻ・ｽ・ｽ繝ｻ・ｸ鬮ｫ・ｰ陞｢・ｹ郢晢ｽｻ;

    var displayMonth = selectedDate ? startOfMonth(selectedDate) : selectableStartMonth;

    function renderCalendar(monthDate) {
      if (!calendarGrid || !calendarTitle) return;
      var monthStart = startOfMonth(monthDate);
      var firstWeekday = monthStart.getDay();
      var lastDay = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
      var weekdays = ["鬮ｫ・ｴ鬲・ｼ夲ｽｽ・ｽ繝ｻ・･", "鬮ｫ・ｴ陝ｶ蜷ｶ繝ｻ, "鬮ｴ髮｣・ｽ・｣郢晢ｽｻ繝ｻ・ｫ", "鬮ｮ譛ｱ・ｯ莨夲ｽｽ・ｽ繝ｻ・ｴ", "鬮ｫ・ｴ陝ｷ・｢繝ｻ・ｽ繝ｻ・ｨ", "鬯ｯ・ｩ繝ｻ・･驛｢譎｢・ｽ・ｻ, "鬮ｯ諛ｶ・ｽ・ｨ驛｢譎｢・ｽ・ｻ];
      var cells = [];
      calendarTitle.textContent = monthStart.getFullYear() + "鬮ｯ譎｢・ｽ・ｷ郢晢ｽｻ繝ｻ・ｴ" + (monthStart.getMonth() + 1) + "鬮ｫ・ｴ陝ｶ蜷ｶ繝ｻ;
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
        if (isSelectableDate(date)) {
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
        timeContainer.innerHTML = '<p class="p-app-note">鬮ｫ・ｴ陝ｷ・｢繝ｻ・ｽ繝ｻ・ｬ鬮ｫ・ｴ鬲・ｼ夲ｽｽ・ｽ繝ｻ・･鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｮ鬯ｩ蛹・ｽｽ・ｨ郢晢ｽｻ繝ｻ・ｺ鬩搾ｽｵ繝ｻ・ｺ鬮｢・ｧ繝ｻ・ｴ髫ｴ・ｽ繝ｻ・ｧ鬩搾ｽｵ繝ｻ・ｺ髯溷供・ｨ・ｯ隴鯉ｽｺ鬩幢ｽ｢繝ｻ・ｧ鬩怜遜・ｽ・ｫ驕ｶ謫ｾ・ｽ・ｪ鬩搾ｽｵ繝ｻ・ｺ髯晢ｽｶ陷ｻ・ｻ繝ｻ・ｽ鬪ｰ蜈ｷ・ｽ・ｸ繝ｻ・ｲ驛｢・ｧ郢晢ｽｻ髢ｧ・ｩ鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｮ鬮ｫ・ｴ鬲・ｼ夲ｽｽ・ｽ繝ｻ・･鬮｣逧ｮ逕･・つ繝ｻ・･郢晢ｽｻ陝ｶ譎｢・ｽ・ｩ陋ｹ繝ｻ・ｽ・ｽ繝ｻ・ｸ鬮ｫ・ｰ陞｢・ｽ繝ｻ・ｧ繝ｻ・ｭ郢晢ｽｻ繝ｻ・ｰ鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｦ鬩搾ｽｵ繝ｻ・ｺ髣包ｽｳ陝ｯ・ｩ陷ｻ・ｳ鬩搾ｽｵ繝ｻ・ｺ鬮ｴ驛・ｽｲ・ｻ繝ｻ・ｼ隶捺慣・ｽ・ｸ繝ｻ・ｲ驛｢譎｢・ｽ・ｻ/p>';
        return;
      }
      var buttons = slots.map(function (slot) {
        var timeLabel = formatTime(slot.startTime);
        var status = getSlotStatus(slot);
        var symbol = status === "full" ? "郢晢ｽｻ郢晢ｽｻ郢晢ｽｻ : status === "few" ? "鬮ｫ・ｨ郢晢ｽｻ繝ｻ・ｽ繝ｻ・ｳ" : "鬮ｫ・ｨ繝ｻ・ｳ驛｢譎｢・ｽ・ｻ;
        var remaining = toNumber(slot.capacity) - toNumber(slot.reservedCount);
        var disabled = status === "full";
        return '<button class="js-slot-select" type="button"'
          + ' data-slot-id="' + escapeHtml(String(slot.id)) + '"'
          + ' data-time="' + escapeHtml(timeLabel) + '"'
          + ' data-status="' + status + '"'
          + ' data-remaining="' + escapeHtml(String(remaining)) + '"'
          + ' data-capacity="' + escapeHtml(String(slot.capacity || 0)) + '"'
          + (disabled ? ' disabled aria-disabled="true"' : '')
          + '>' + symbol + ' ' + escapeHtml(timeLabel) + '</button>';
      }).join("");
      timeContainer.innerHTML = buttons;
      if (slotData.time) {
        qsa(".js-slot-select", timeContainer).forEach(function (btn) {
          if (btn.getAttribute("data-time") === slotData.time) {
            btn.classList.add("is-selected");
          }
        });
      }
    }
    function loadTimeSlots(dateKey) {
      if (!dateKey) return;
      function showSlotLoading() {
        if (timeContainer) {
          timeContainer.innerHTML = '<p class="p-app-note">隱ｭ縺ｿ霎ｼ縺ｿ荳ｭ縺ｧ縺・..</p>';
        }
      }
      function showSlotError() {
        if (timeContainer) {
          timeContainer.innerHTML = '<p class="p-app-note">譎る俣譫縺ｮ蜿門ｾ励↓螟ｱ謨励＠縺ｾ縺励◆縲ょ・蠎ｦ縺願ｩｦ縺励￥縺縺輔＞縲・/p>';
        }
      }
      function fetchSlots(planId) {
        showSlotLoading();
        fetchJson("/api/plans/" + planId + "/time-slots?slotDate=" + encodeURIComponent(dateKey))
          .then(function (slots) { renderTimeSlots(slots || []); })
          .catch(function () { showSlotError(); });
      }

      var planId = ensurePlanId(selectedCourse);
      if (planId) {
        fetchSlots(planId);
        return;
      }

      fetchJson("/api/plans")
        .then(function (plans) {
          setPlanCache(plans);
          planId = ensurePlanId(selectedCourse, plans);
          if (!planId) return;
          fetchSlots(planId);
        })
        .catch(function () { showSlotError(); });
    }
      }
      function showSlotError() {
        if (timeContainer) {
          timeContainer.innerHTML = '髯樊ｺｽ蛻､霎溘・Error 驍ｵ・ｺ繝ｻ・ｯ鬮ｫ・ｱ繝ｻ・ｭ驍ｵ・ｺ繝ｻ・ｿ髯ｷ・ｿ隰費ｽｶ繝ｻ鬘俶ｰ｣郢ｧ閾･闊樣し・ｺ繝ｻ・ｾ驍ｵ・ｺ雋・･繝ｻ髯橸ｽｳ陞｢・ｽ霎溷､ゑｽｸ・ｺ繝ｻ・ｧ驍ｵ・ｺ郢ｧ繝ｻ・ｽ迢暦ｽｸ・ｺ雋・∞・ｽ竏ｫ・ｸ・ｲ遶擾ｽｽ繝ｻ・ｸ鬯・､ｧ・ｶ讙趣ｽｸ・ｺ鬮ｦ・ｪ邵ｲ蝣､・ｸ・ｺ鬮ｦ・ｪ遶擾ｽｪ驍ｵ・ｺ陝ｶ蜻ｻ・ｽ骰具ｽｸ・ｲ郢晢ｽｻ驍ｵ・ｺ髦ｮ蜷ｶ繝ｻ驛｢・ｧ繝ｻ・ｷ驛｢・ｧ繝ｻ・ｹ驛｢譏ｴ繝ｻ・主､・ｸ・ｺ繝ｻ・ｧ驍ｵ・ｺ繝ｻ・ｯ驛｢・ｧ繝ｻ・ｹ驛｢・ｧ繝ｻ・ｯ驛｢譎｢・ｽ・ｪ驛｢譎丞ｹｲ郢晢ｽｨ驍ｵ・ｺ繝ｻ・ｮ髯橸ｽｳ雋・ｽｯ繝ｻ・｡陟募ｨｯﾂ・ｲ髴取ｻゑｽｽ・｡髯ｷ莨夲ｽｽ・ｹ驍ｵ・ｺ繝ｻ・ｫ驍ｵ・ｺ繝ｻ・ｪ驍ｵ・ｺ繝ｻ・｣驍ｵ・ｺ繝ｻ・ｦ驍ｵ・ｺ郢晢ｽｻ繝ｻ迢暦ｽｸ・ｺ雋・∞・ｽ竏ｫ・ｸ・ｲ遶丞｣ｹﾎｨ驛｢・ｧ繝ｻ・｡驛｢・ｧ繝ｻ・､驛｢譎｢・ｽ・ｫ C:\Users\academia\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1 驛｢・ｧ陞ｳ螟ｲ・ｽ・ｪ繝ｻ・ｭ驍ｵ・ｺ繝ｻ・ｿ鬮ｴ雜｣・ｽ・ｼ驛｢・ｧ・つ驍ｵ・ｺ髦ｮ蜷ｮ繝ｻ驍ｵ・ｺ陟募ｾ個蝣､・ｸ・ｺ鬮ｦ・ｪ遶擾ｽｪ驍ｵ・ｺ陝ｶ蜻ｻ・ｽ骰具ｽｸ・ｲ郢ｧ螂・ｽｽ・ｩ繝ｻ・ｳ鬩肴得・ｽ・ｰ驍ｵ・ｺ繝ｻ・ｫ驍ｵ・ｺ繝ｻ・､驍ｵ・ｺ郢晢ｽｻ遯ｶ・ｻ驍ｵ・ｺ繝ｻ・ｯ驍ｵ・ｲ遶丞仰陟輔・out_Execution_Policies驍ｵ・ｲ郢晢ｽｻhttps://go.microsoft.com/fwlink/?LinkID=135170) 驛｢・ｧ髮区ｨ貞ｴ滄恷・｣繝ｻ・ｧ驍ｵ・ｺ陷会ｽｱ遯ｶ・ｻ驍ｵ・ｺ闕ｳ蟯ｩ蜻ｳ驍ｵ・ｺ髴郁ｲｻ・ｼ讓抵ｽｸ・ｲ郢晢ｽｻ;
        }
      }
      function fetchSlots(planId) {
        showSlotLoading();
        fetchJson("/api/plans/" + planId + "/time-slots?slotDate=" + encodeURIComponent(dateKey))
          .then(function (slots) { renderTimeSlots(slots || []); })
          .catch(function () { showSlotError(); });
      }

      var planId = ensurePlanId(selectedCourse);
      if (planId) {
        fetchSlots(planId);
        return;
      }

      fetchJson("/api/plans")
        .then(function (plans) {
          setPlanCache(plans);
          planId = ensurePlanId(selectedCourse, plans);
          if (!planId) return;
          fetchSlots(planId);
        })
        .catch(function () { showSlotError(); });
    }
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
        data.slot.id = Number(button.getAttribute("data-slot-id"));
        data.slot.status = button.getAttribute("data-status");
        data.slot.remaining = Number(button.getAttribute("data-remaining"));
        data.slot.capacity = Number(button.getAttribute("data-capacity"));
        setData(data);
        if (selectedTimeText) selectedTimeText.textContent = data.slot.time || "鬮ｫ・ｴ陝ｷ・｢繝ｻ・ｽ繝ｻ・ｪ鬯ｯ・ｩ陋ｹ繝ｻ・ｽ・ｽ繝ｻ・ｸ鬮ｫ・ｰ陞｢・ｹ郢晢ｽｻ;
        if (selectedDateText) selectedDateText.textContent = slotDate.value ? formatDisplayDate(slotDate.value) : "鬮ｫ・ｴ陝ｷ・｢繝ｻ・ｽ繝ｻ・ｪ鬯ｯ・ｩ陋ｹ繝ｻ・ｽ・ｽ繝ｻ・ｸ鬮ｫ・ｰ陞｢・ｹ郢晢ｽｻ;
      });
    }

    if (slotDate.value) { loadTimeSlots(slotDate.value); }
  }

  var toPeople = qs(".js-to-people");
  if (toPeople) {
    toPeople.addEventListener("click", function () {
      var data = getData();
      if (!data.course) { alert("鬮ｯ・ｷ闔・･霑ｴ・ｾ驕ｶ莨∬ｱｪ繝ｻ・ｹ繝ｻ・ｧ郢晢ｽｻ繝ｻ・ｳ鬩幢ｽ｢隴趣ｽ｢繝ｻ・ｽ繝ｻ・ｼ鬩幢ｽ｢繝ｻ・ｧ郢晢ｽｻ繝ｻ・ｹ鬩幢ｽ｢繝ｻ・ｧ髯晢ｽｶ隴擾ｽｶ郢晢ｽｻ鬮ｫ・ｰ陞｢・ｽ繝ｻ・ｧ繝ｻ・ｭ郢晢ｽｻ繝ｻ・ｰ鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｦ鬩搾ｽｵ繝ｻ・ｺ髣包ｽｳ陝ｯ・ｩ陷ｻ・ｳ鬩搾ｽｵ繝ｻ・ｺ鬮ｴ驛・ｽｲ・ｻ繝ｻ・ｼ隶捺慣・ｽ・ｸ繝ｻ・ｲ驛｢譎｢・ｽ・ｻ); window.location.href = "reserve-select-course.html"; return; }
      if (!data.slot || !data.slot.date || !data.slot.time || !data.slot.id || data.slot.status === "full") { alert("鬮ｫ・ｴ鬲・ｼ夲ｽｽ・ｽ繝ｻ・･鬯ｩ蠅難ｽｨ雋ｻ・ｽ・ｹ隴擾ｽｶ郢晢ｽｻ鬮ｫ・ｴ陟托ｽｱ繝ｻ邇門ｰ・・・｣鬩幢ｽ｢繝ｻ・ｧ髯晢ｽｶ隴擾ｽｶ郢晢ｽｻ鬮ｫ・ｰ陞｢・ｽ繝ｻ・ｧ繝ｻ・ｭ郢晢ｽｻ繝ｻ・ｰ鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｦ鬩搾ｽｵ繝ｻ・ｺ髣包ｽｳ陝ｯ・ｩ陷ｻ・ｳ鬩搾ｽｵ繝ｻ・ｺ鬮ｴ驛・ｽｲ・ｻ繝ｻ・ｼ隶捺慣・ｽ・ｸ繝ｻ・ｲ驛｢譎｢・ｽ・ｻ); return; }
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
      if (remainEl) { if (Number.isFinite(slotRemaining)) { remainEl.textContent = "鬯ｩ蛹・ｽｽ・ｨ郢晢ｽｻ繝ｻ・ｺ鬩搾ｽｵ繝ｻ・ｺ驛｢譎｢・ｽ・ｻ + Math.max(0, slotRemaining - people) + "鬮ｫ・ｴ繝ｻ・ｫ郢晢ｽｻ繝ｻ・ｰ"; } else { remainEl.textContent = "鬯ｩ蛹・ｽｽ・ｨ郢晢ｽｻ繝ｻ・ｺ鬩搾ｽｵ繝ｻ・ｺ驛｢譎｢・ｽ・ｻ + Math.max(0, MAX_PEOPLE - people) + "鬮ｫ・ｴ繝ｻ・ｫ郢晢ｽｻ繝ｻ・ｰ"; } }
      if (unitEl) unitEl.textContent = formatYen(unit);
      if (calcEl) calcEl.textContent = formatYen(unit) + " 郢晢ｽｻ郢晢ｽｻ郢晢ｽｻ" + people;
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
      if (!data.course || !data.slot || !data.slot.date || !data.slot.time || !data.slot.id) { alert("鬩幢ｽ｢繝ｻ・ｧ郢晢ｽｻ繝ｻ・ｳ鬩幢ｽ｢隴趣ｽ｢繝ｻ・ｽ繝ｻ・ｼ鬩幢ｽ｢繝ｻ・ｧ郢晢ｽｻ繝ｻ・ｹ鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｨ鬮ｫ・ｴ鬲・ｼ夲ｽｽ・ｽ繝ｻ・･鬯ｩ蠅難ｽｨ雋ｻ・ｽ・ｹ隴趣ｽ｢繝ｻ・ｽ陞ｳ螢ｽﾂ・ｦ髯具ｽｹ繝ｻ・ｻ驕ｶ莨・ｽｦ・ｴ繝ｻ・ｩ陋ｹ繝ｻ・ｽ・ｽ繝ｻ・ｸ鬮ｫ・ｰ陞｢・ｽ繝ｻ・ｧ繝ｻ・ｭ郢晢ｽｻ繝ｻ・ｰ鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｦ鬩搾ｽｵ繝ｻ・ｺ髣包ｽｳ陝ｯ・ｩ陷ｻ・ｳ鬩搾ｽｵ繝ｻ・ｺ鬮ｴ驛・ｽｲ・ｻ繝ｻ・ｼ隶捺慣・ｽ・ｸ繝ｻ・ｲ驛｢譎｢・ｽ・ｻ); window.location.href = "reserve-select-course.html"; return; }
      if (!data.people) { alert("鬮｣雋ｻ・｣・ｰ郢晢ｽｻ繝ｻ・ｺ鬮ｫ・ｰ繝ｻ・ｨ郢晢ｽｻ繝ｻ・ｰ鬩幢ｽ｢繝ｻ・ｧ髯晢ｽｶ隴擾ｽｶ郢晢ｽｻ鬮ｫ・ｰ陞｢・ｽ繝ｻ・ｧ繝ｻ・ｭ郢晢ｽｻ繝ｻ・ｰ鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｦ鬩搾ｽｵ繝ｻ・ｺ髣包ｽｳ陝ｯ・ｩ陷ｻ・ｳ鬩搾ｽｵ繝ｻ・ｺ鬮ｴ驛・ｽｲ・ｻ繝ｻ・ｼ隶捺慣・ｽ・ｸ繝ｻ・ｲ驛｢譎｢・ｽ・ｻ); return; }
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
    var nameField = qs(';
        }
      }
      function fetchSlots(planId) {
        showSlotLoading();
        fetchJson("/api/plans/" + planId + "/time-slots?slotDate=" + encodeURIComponent(dateKey))
          .then(function (slots) { renderTimeSlots(slots || []); })
          .catch(function () { showSlotError(); });
      }

      var planId = ensurePlanId(selectedCourse);
      if (planId) {
        fetchSlots(planId);
        return;
      }

      fetchJson("/api/plans")
        .then(function (plans) {
          setPlanCache(plans);
          planId = ensurePlanId(selectedCourse, plans);
          if (!planId) return;
          fetchSlots(planId);
        })
        .catch(function () { showSlotError(); });
    }
    if (nameField) { nameField.addEventListener("input", syncKanaFromName); nameField.addEventListener("compositionend", syncKanaFromName); nameField.addEventListener("blur", syncKanaFromName); }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var firstInvalid = null;
      function setError(name, message) { var input = qs('[name="' + name + '"]', form); var error = qs('[data-error="' + name + '"]', form); if (input) input.classList.toggle("is-error", !!message); if (error) error.textContent = message || ""; if (message) { ok = false; if (!firstInvalid && input) firstInvalid = input; } }
      var user = { name: qs('[name="name"]', form).value.trim(), kana: toKatakana(qs('[name="kana"]', form).value.trim()), email: qs('[name="email"]', form).value.trim(), phone: normalizePhone(qs('[name="phone"]', form).value), note: qs('[name="note"]', form).value.trim() };
      setError("name", user.name ? "" : "鬩搾ｽｵ繝ｻ・ｺ鬯ｮ・ｮ郢晢ｽｻ陋滂ｽｹ鬮ｯ・ｷ魄・ｽｹ闔繧・・陞ｳ螢ｽﾂ・ｦ郢晢ｽｻ繝ｻ・･鬮ｯ・ｷ霑壼遜・ｽ・ｸ陷ｻ・ｻ繝ｻ・ｼ繝ｻ・ｰ鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｦ鬩搾ｽｵ繝ｻ・ｺ髣包ｽｳ陝ｯ・ｩ陷ｻ・ｳ鬩搾ｽｵ繝ｻ・ｺ鬮ｴ驛・ｽｲ・ｻ繝ｻ・ｼ隶捺慣・ｽ・ｸ繝ｻ・ｲ驛｢譎｢・ｽ・ｻ);
      setError("kana", user.kana ? "" : "鬩幢ｽ｢隴弱・・ｽ・ｼ鬩･繝ｻ繽阪・・ｹ繝ｻ・ｧ郢晢ｽｻ繝ｻ・ｬ鬩幢ｽ｢隴惹ｼ夲ｽｽ・ｿ繝ｻ・ｫ郢晢ｽｻ陞ｳ螢ｽﾂ・ｦ郢晢ｽｻ繝ｻ・･鬮ｯ・ｷ霑壼遜・ｽ・ｸ陷ｻ・ｻ繝ｻ・ｼ繝ｻ・ｰ鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｦ鬩搾ｽｵ繝ｻ・ｺ髣包ｽｳ陝ｯ・ｩ陷ｻ・ｳ鬩搾ｽｵ繝ｻ・ｺ鬮ｴ驛・ｽｲ・ｻ繝ｻ・ｼ隶捺慣・ｽ・ｸ繝ｻ・ｲ驛｢譎｢・ｽ・ｻ);
      setError("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email) ? "" : "鬩幢ｽ｢隴趣ｽ｢繝ｻ・ｽ繝ｻ・｡鬩幢ｽ｢隴趣ｽ｢繝ｻ・ｽ繝ｻ・ｼ鬩幢ｽ｢隴趣ｽ｢繝ｻ・ｽ繝ｻ・ｫ鬩幢ｽ｢繝ｻ・ｧ郢晢ｽｻ繝ｻ・｢鬩幢ｽ｢隴取得・ｽ・ｳ繝ｻ・ｨ繝ｻ蜿厄ｽｨ謚ｵ・ｽ・ｹ繝ｻ・ｧ郢晢ｽｻ繝ｻ・ｹ鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｮ鬮ｯ貅ｷ遘√・・ｽ繝ｻ・｢鬮ｯ貅ｷ蠎翫・・ｸ陝ｯ・ｩ・つ繝ｻ・ｲ鬮ｮ蠑ｱ繝ｻ繝ｻ・ｽ繝ｻ・｣鬩搾ｽｵ繝ｻ・ｺ髯ｷ莨夲ｽｽ・ｱ郢晢ｽｻ繝ｻ・･鬩搾ｽｵ繝ｻ・ｺ驛｢・ｧ郢晢ｽｻ繝ｻ・ｽ鬯倩ｲｻ・ｽ・ｸ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｾ鬩搾ｽｵ繝ｻ・ｺ髯晢ｽｶ陷ｻ・ｻ繝ｻ・ｽ鬪ｰ蜈ｷ・ｽ・ｸ繝ｻ・ｲ驛｢譎｢・ｽ・ｻ);
      setError("phone", /^[0-9\\-]{10,13}$/.test(user.phone) ? "" : "鬯ｯ・ｮ繝ｻ・ｮ郢晢ｽｻ繝ｻ・ｻ鬯ｮ・ｫ繝ｻ・ｧ郢晢ｽｻ繝ｻ・ｱ鬯ｨ・ｾ繝ｻ・｡郢晢ｽｻ繝ｻ・ｪ鬮ｯ・ｷ繝ｻ・ｿ郢晢ｽｻ繝ｻ・ｷ鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｯ10鬩搾ｽｵ繝ｻ・ｲ驛｢譎｢・ｽ・ｻ3鬮ｫ・ｴ繝ｻ・ｯ驕ｶ荳橸ｽ｣・ｹ郢晢ｽｻ鬮ｫ・ｰ繝ｻ・ｨ郢晢ｽｻ繝ｻ・ｰ鬮ｯ譏ｴ繝ｻ陝ｷ・ｲ驕ｶ謫ｾ・ｽ・ｪ鬩搾ｽｵ繝ｻ・ｺ髮九・ﾂ・･郢晢ｽｻ鬩幢ｽ｢隴乗・・ｽ・ｸ驗呻ｽｫ遶包ｽｧ鬩幢ｽ｢隴弱・・ｽ・ｼ鬩･繝ｻ・ｽ・ｦ鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｧ鬮ｯ・ｷ髣鯉ｽｨ繝ｻ・ｽ繝ｻ・･鬮ｯ・ｷ霑壼遜・ｽ・ｸ陷ｻ・ｻ繝ｻ・ｼ繝ｻ・ｰ鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｦ鬩搾ｽｵ繝ｻ・ｺ髣包ｽｳ陝ｯ・ｩ陷ｻ・ｳ鬩搾ｽｵ繝ｻ・ｺ鬮ｴ驛・ｽｲ・ｻ繝ｻ・ｼ隶捺慣・ｽ・ｸ繝ｻ・ｲ驛｢譎｢・ｽ・ｻ);
      if (!ok) { if (firstInvalid && typeof firstInvalid.focus === "function") { firstInvalid.focus(); } return; }
      var data = getData(); data.user = user; setData(data); window.location.href = "reserve-confirm.html";
    });
  }

  var summaryBlock = qs(".js-reserve-summary");
  if (summaryBlock) {
    var s = getData();
    if (!s.course || !s.slot || !s.people || !s.user) {
      summaryBlock.innerHTML = "<p>鬮｣雋ｻ・｣・ｰ鬮｢・ｧ繝ｻ・ｲ郢晢ｽｻ繝ｻ・ｴ驛｢譎｢・ｽ・ｻ驛｢譎｢・ｽ・･鬮ｯ諛ｶ・ｽ・｣郢晢ｽｻ繝ｻ・ｱ鬩搾ｽｵ繝ｻ・ｺ髯溷桁・ｽ・｡郢晢ｽｻ繝ｻ・ｸ髯晢｣ｰ髮懶ｽ｣繝ｻ・ｽ繝ｻ・ｶ郢晢ｽｻ繝ｻ・ｳ鬩搾ｽｵ繝ｻ・ｺ髯ｷ莨夲ｽｽ・ｱ驕ｯ・ｶ繝ｻ・ｻ鬩搾ｽｵ繝ｻ・ｺ驛｢譎｢・ｽ・ｻ驕ｶ謫ｾ・ｽ・ｪ鬩搾ｽｵ繝ｻ・ｺ髯ｷ・ｷ繝ｻ・ｶ繝ｻ縺､ﾂ驛｢譎｢・ｽ・ｻ/p>";
    } else {
      var unit = toNumber(s.course.price);
      var total = unit * toNumber(s.people);
      qs(".js-summary-course").textContent = s.course.name;
      qs(".js-summary-datetime").textContent = formatDisplayDate(s.slot.date) + " " + s.slot.time;
      qs(".js-summary-people").textContent = s.people + "鬮ｯ・ｷ繝ｻ・ｷ鬮｢・ｧ繝ｻ・ｴ郢晢ｽｻ繝ｻ・ｧ驛｢譎｢・ｽ・ｻ;
      qs(".js-summary-name").textContent = s.user.name + "驛｢譎｢・ｽ・ｻ驛｢譎｢・ｽ・ｻ + s.user.kana + "驛｢譎｢・ｽ・ｻ驛｢譎｢・ｽ・ｻ;
      qs(".js-summary-email").textContent = s.user.email;
      qs(".js-summary-phone").textContent = s.user.phone;
      qs(".js-summary-note").textContent = s.user.note || "鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｪ鬩搾ｽｵ繝ｻ・ｺ驛｢譎｢・ｽ・ｻ;
      qs(".js-summary-calc").textContent = formatYen(unit) + " 郢晢ｽｻ郢晢ｽｻ郢晢ｽｻ" + s.people;
      qs(".js-summary-total").textContent = formatYen(total);
    }
  }

  var confirmBtn = qs(".js-reserve-confirm");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", function () {
      var data = getData();
      if (!data.course || !data.slot || !data.people || !data.user) { alert("鬮｣雋ｻ・｣・ｰ鬮｢・ｧ繝ｻ・ｲ郢晢ｽｻ繝ｻ・ｴ驛｢譎｢・ｽ・ｻ驛｢譎｢・ｽ・･鬮ｯ諛ｶ・ｽ・｣郢晢ｽｻ繝ｻ・ｱ鬩搾ｽｵ繝ｻ・ｺ髯溷桁・ｽ・｡郢晢ｽｻ繝ｻ・ｸ髯晢｣ｰ髮懶ｽ｣繝ｻ・ｽ繝ｻ・ｶ郢晢ｽｻ繝ｻ・ｳ鬩搾ｽｵ繝ｻ・ｺ髯ｷ莨夲ｽｽ・ｱ驕ｯ・ｶ繝ｻ・ｻ鬩搾ｽｵ繝ｻ・ｺ驛｢譎｢・ｽ・ｻ驕ｶ謫ｾ・ｽ・ｪ鬩搾ｽｵ繝ｻ・ｺ髯ｷ・ｷ繝ｻ・ｶ繝ｻ縺､ﾂ驛｢・ｧ陜捺ｷ楪陷ｻ・ｵ陝謌奇ｽｭ謫ｾ・ｽ・ｴ繝ｻ繧托ｽｽ・ｰ鬩幢ｽ｢繝ｻ・ｧ髴大｣ｼ逕溽ｹ晢ｽｻ鬮ｯ・ｷ霑壼遜・ｽ・ｸ陷ｻ・ｻ繝ｻ・ｼ繝ｻ・ｰ鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｦ鬩搾ｽｵ繝ｻ・ｺ髣包ｽｳ陝ｯ・ｩ陷ｻ・ｳ鬩搾ｽｵ繝ｻ・ｺ鬮ｴ驛・ｽｲ・ｻ繝ｻ・ｼ隶捺慣・ｽ・ｸ繝ｻ・ｲ驛｢譎｢・ｽ・ｻ); window.location.href = "reserve-select-course.html"; return; }
      var planId = ensurePlanId(data.course);
      if (!planId || !data.slot.id) { alert("鬮ｫ・ｴ鬲・ｼ夲ｽｽ・ｽ繝ｻ・･鬯ｩ蠅難ｽｨ雋ｻ・ｽ・ｹ隴擾ｽｶ郢晢ｽｻ鬮ｫ・ｴ陟托ｽｱ繝ｻ邇門ｰ・・・｣鬩幢ｽ｢繝ｻ・ｧ髯晢ｽｶ隴擾ｽｶ郢晢ｽｻ鬮ｫ・ｰ陞｢・ｽ繝ｻ・ｧ繝ｻ・ｭ郢晢ｽｻ繝ｻ・ｰ鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｦ鬩搾ｽｵ繝ｻ・ｺ髣包ｽｳ陝ｯ・ｩ陷ｻ・ｳ鬩搾ｽｵ繝ｻ・ｺ鬮ｴ驛・ｽｲ・ｻ繝ｻ・ｼ隶捺慣・ｽ・ｸ繝ｻ・ｲ驛｢譎｢・ｽ・ｻ); window.location.href = "reserve-select-slot.html"; return; }
      var errorEl = qs(".js-confirm-error");
      if (!errorEl) { errorEl = document.createElement("p"); errorEl.className = "p-form__error js-confirm-error"; confirmBtn.parentNode.insertBefore(errorEl, confirmBtn.nextSibling); }
      errorEl.textContent = "";
      var originalText = confirmBtn.textContent;
      confirmBtn.disabled = true;
      confirmBtn.textContent = "鬯ｯ・ｨ繝ｻ・ｾ驕ｶ謫ｾ・ｽ・ｽ郢晢ｽｻ繝ｻ・ｿ郢晢ｽｻ繝ｻ・｡鬮｣蛹・ｽｽ・ｳ郢晢ｽｻ繝ｻ・ｭ...";
      var payload = { planId: planId, planTimeSlotId: data.slot.id, participantCount: data.people, participants: buildParticipants(data.user, data.people), customerName: data.user.name, email: data.user.email, phone: data.user.phone };
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
              errorEl.textContent = "鬩幢ｽ｢繝ｻ・ｧ郢晢ｽｻ繝ｻ・ｻ鬩幢ｽ｢繝ｻ・ｧ郢晢ｽｻ繝ｻ・ｭ鬩幢ｽ｢隴趣ｽ｢繝ｻ・ｽ繝ｻ・･鬩幢ｽ｢隴趣ｽ｢繝ｻ・ｽ繝ｻ・ｪ鬩幢ｽ｢隴擾ｽｴ郢晢ｽｻ驍ｵ・ｺ郢晢ｽｻ繝ｻ・｡郢晢ｽｻ繝ｻ・ｺ鬯ｮ・ｫ繝ｻ・ｱ鬯ｮ・ｦ繝ｻ・ｪ驕ｶ鬆托ｽ･・｢隴ｽ譁舌・繝ｻ・ｱ鬮ｫ・ｰ繝ｻ・ｨ髯ｷ莨夲ｽｽ・ｱ郢晢ｽｻ繝ｻ・ｰ鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｾ鬩搾ｽｵ繝ｻ・ｺ髯ｷ莨夲ｽｽ・ｱ髫ｨ・ｳ郢晢ｽｻ繝ｻ・ｸ繝ｻ・ｲ驛｢・ｧ郢晢ｽｻ郢晢ｽｻ鬯ｮ・ｫ繝ｻ・ｱ郢晢ｽｻ繝ｻ・ｭ鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｿ鬯ｮ・ｴ髮懶ｽ｣繝ｻ・ｽ繝ｻ・ｼ鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｿ鬩搾ｽｵ繝ｻ・ｺ髯ｷ莨夲ｽｽ・ｱ驕ｯ・ｶ繝ｻ・ｻ鬮ｯ・ｷ・つ髫ｶ荳ｻ・･繝ｻ・ｽ・ｽ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｦ鬩搾ｽｵ繝ｻ・ｺ鬯ｯ莨懌・繝ｻ・ｽ繝ｻ・ｩ郢晢ｽｻ繝ｻ・ｦ鬩搾ｽｵ繝ｻ・ｺ髯ｷ莨夲ｽｽ・ｱ郢晢ｽｻ繝ｻ・･鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｰ鬩搾ｽｵ繝ｻ・ｺ鬮ｴ驛・ｽｲ・ｻ繝ｻ・ｼ隶捺慣・ｽ・ｸ繝ｻ・ｲ驛｢譎｢・ｽ・ｻ;
            } else {
              errorEl.textContent = "鬯ｯ・ｨ繝ｻ・ｾ驕ｶ謫ｾ・ｽ・ｽ郢晢ｽｻ繝ｻ・ｿ郢晢ｽｻ繝ｻ・｡鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｫ鬮ｯ讓奇ｽｻ繧托ｽｽ・ｽ繝ｻ・ｱ鬮ｫ・ｰ繝ｻ・ｨ髯ｷ莨夲ｽｽ・ｱ郢晢ｽｻ繝ｻ・ｰ鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｾ鬩搾ｽｵ繝ｻ・ｺ髯ｷ莨夲ｽｽ・ｱ髫ｨ・ｳ郢晢ｽｻ繝ｻ・ｸ繝ｻ・ｲ驛｢・ｧ闔・･郢晢ｽｻ鬯ｯ・ｮ繝ｻ・｢鬮ｦ・ｮ陷ｻ・ｻ繝ｻ・ｽ陝ｶ譌δ郢晢ｽｻ繝ｻ・ｮ鬩搾ｽｵ繝ｻ・ｺ驛｢譎｢・ｽ・ｻ驕ｯ・ｶ繝ｻ・ｻ鬮ｯ・ｷ・つ髫ｶ荳ｻ・･繝ｻ・ｽ・ｽ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｦ鬩搾ｽｵ繝ｻ・ｺ鬯ｯ莨懌・繝ｻ・ｽ繝ｻ・ｩ郢晢ｽｻ繝ｻ・ｦ鬩搾ｽｵ繝ｻ・ｺ髯ｷ莨夲ｽｽ・ｱ郢晢ｽｻ繝ｻ・･鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｰ鬩搾ｽｵ繝ｻ・ｺ鬮ｴ驛・ｽｲ・ｻ繝ｻ・ｼ隶捺慣・ｽ・ｸ繝ｻ・ｲ驛｢譎｢・ｽ・ｻ;
            }
          }
        });
    });
  }

  var complete = qs(".js-complete-summary");
  if (complete) {
    var raw = sessionStorage.getItem(FINAL_KEY);
    if (!raw) { complete.innerHTML = "<p>鬮｣雋ｻ・｣・ｰ鬮｢・ｧ繝ｻ・ｲ郢晢ｽｻ繝ｻ・ｴ驛｢譎｢・ｽ・ｻ驛｢譎｢・ｽ・･鬮ｯ諛ｶ・ｽ・｣郢晢ｽｻ繝ｻ・ｱ鬩搾ｽｵ繝ｻ・ｺ髴托ｽｹ陞滂ｽｲ繝ｻ・ｽ繝ｻ・ｦ髣包ｽｵ隴擾ｽｶ陷ｻ・ｽ鬩搾ｽｵ繝ｻ・ｺ髣包ｽｵ隴趣ｽ｢繝ｻ・ｽ鬯倩ｲｻ・ｽ・ｸ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｾ鬩搾ｽｵ繝ｻ・ｺ髯晢ｽｶ陷ｻ・ｻ繝ｻ・ｽ鬪ｰ蜈ｷ・ｽ・ｸ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｧ鬩搾ｽｵ繝ｻ・ｺ髯ｷ莨夲ｽｽ・ｱ髫ｨ・ｳ郢晢ｽｻ繝ｻ・ｸ繝ｻ・ｲ驛｢譎｢・ｽ・ｻa href=\"reserve-select-course.html\">鬮｣雋ｻ・｣・ｰ鬮｢・ｧ繝ｻ・ｲ郢晢ｽｻ繝ｻ・ｴ驛｢譎｢・ｽ・ｻ髯具ｽｻ繝ｻ・､鬯ｯ・ｮ繝ｻ・ｱ郢晢ｽｻ繝ｻ・｢鬩搾ｽｵ繝ｻ・ｺ郢晢ｽｻ繝ｻ・ｸ鬮ｫ・ｰ鬲・ｼ夲ｽｽ・ｽ繝ｻ・ｻ鬩幢ｽ｢繝ｻ・ｧ驛｢譎｢・ｽ・ｻ/a></p>"; return; }
    var finalData = JSON.parse(raw);
    var finalUnit = finalData.course ? toNumber(finalData.course.price) : 4000;
    var finalTotal = finalUnit * toNumber(finalData.people || 1);
    qs(".js-complete-datetime").textContent = formatDisplayDate(finalData.slot.date) + " " + finalData.slot.time;
    qs(".js-complete-course").textContent = finalData.course.name;
    qs(".js-complete-people").textContent = (finalData.people || 1) + "鬮ｯ・ｷ繝ｻ・ｷ鬮｢・ｧ繝ｻ・ｴ郢晢ｽｻ繝ｻ・ｧ驛｢譎｢・ｽ・ｻ;
    qs(".js-complete-total").textContent = formatYen(finalTotal);
    if (finalData.apiResponse && finalData.apiResponse.id) {
      var box = qs(".js-complete-summary");
      if (box && !qs(".js-complete-id", box)) { var p = document.createElement("p"); p.className = "js-complete-id"; p.textContent = "鬮｣雋ｻ・｣・ｰ鬮｢・ｧ繝ｻ・ｲ郢晢ｽｻ繝ｻ・ｴ驛｢譎｢・ｽ・ｻ髯具ｽｻ郢晢ｽｻ隲｢・ｾ郢晢ｽｻ繝ｻ・ｷ: " + finalData.apiResponse.id; box.appendChild(p); }
    }
  }

  function isPublicPage() { return document.body && document.body.classList.contains("perfume-site") && !document.body.classList.contains("p-app-page"); }
  function normalizeReserveLinks() { qsa('.p-home-side-cta, .c-button[href], .p-wire-map-link[href]').forEach(function (link) { if (link.classList.contains("js-direct-course")) return; var href = link.getAttribute("href"); if (!href || href.indexOf("http") === 0 || href.charAt(0) === "#" || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return; if (/^reserve(?:-[\\w-]+)?\\.html(?:#.*)?$/i.test(href)) { link.setAttribute("href", "reserve-select-course.html"); } }); }
  function disableCourseParentLink() { qsa(".p-home-sidebar .p-home-side-parent > a").forEach(function (link) { link.setAttribute("aria-disabled", "true"); link.setAttribute("tabindex", "-1"); link.addEventListener("click", function (e) { e.preventDefault(); }); }); }
  function initHeroSlideshow() { var root = qs(".js-hero-slideshow"); if (!root) return; var slides = qsa(".p-wire-hero-slide", root); if (slides.length < 2) return; var index = slides.findIndex(function (slide) { return slide.classList.contains("is-active"); }); if (index < 0) index = 0; function show(nextIndex) { slides.forEach(function (slide, i) { slide.classList.toggle("is-active", i === nextIndex); }); index = nextIndex; } show(index); window.setInterval(function () { show((index + 1) % slides.length); }, 5000); }
  function initMobileDrawer() { var sidebar = qs(".p-home-sidebar"); if (!sidebar) return; if (qs(".p-home-drawer-toggle")) return; var desktopMedia = window.matchMedia("(min-width: 1101px)"); var toggle = document.createElement("button"); toggle.type = "button"; toggle.className = "p-home-drawer-toggle"; toggle.setAttribute("aria-label", "鬩幢ｽ｢隴趣ｽ｢繝ｻ・ｽ繝ｻ・｡鬩幢ｽ｢隴乗・・ｽ・ｹ隴∵ｺｽ・､・ｼ繝ｻ・ｹ隴趣ｽ｢繝ｻ・ｽ繝ｻ・ｼ鬩幢ｽ｢繝ｻ・ｧ髯晢ｽｶ隴取得・ｽ・ｹ隲ｷ蛹・ｽｽ・ｸ繝ｻ・ｺ驛｢譎｢・ｽ・ｻ); toggle.setAttribute("aria-expanded", "false"); toggle.innerHTML = '<span aria-hidden="true">鬮ｫ・ｨ陋帙・・ｽ・ｽ繝ｻ・ｰ</span>'; var close = document.createElement("button"); close.type = "button"; close.className = "p-home-drawer-close"; close.setAttribute("aria-label", "鬩幢ｽ｢隴趣ｽ｢繝ｻ・ｽ繝ｻ・｡鬩幢ｽ｢隴乗・・ｽ・ｹ隴∵ｺｽ・､・ｼ繝ｻ・ｹ隴趣ｽ｢繝ｻ・ｽ繝ｻ・ｼ鬩幢ｽ｢繝ｻ・ｧ髯晢ｽｶ隴主沁蛹暮ｩ搾ｽｵ繝ｻ・ｺ髯区ｻゑｽｽ・･郢晢ｽｻ郢晢ｽｻ); close.innerHTML = '<span aria-hidden="true">郢晢ｽｻ郢晢ｽｻ郢晢ｽｻ/span>'; var backdrop = document.createElement("button"); backdrop.type = "button"; backdrop.className = "p-home-drawer-backdrop"; backdrop.setAttribute("aria-label", "鬩幢ｽ｢隴趣ｽ｢繝ｻ・ｽ繝ｻ・｡鬩幢ｽ｢隴乗・・ｽ・ｹ隴∵ｺｽ・､・ｼ繝ｻ・ｹ隴趣ｽ｢繝ｻ・ｽ繝ｻ・ｼ鬩幢ｽ｢繝ｻ・ｧ髯晢ｽｶ隴主沁蛹暮ｩ搾ｽｵ繝ｻ・ｺ髯区ｻゑｽｽ・･郢晢ｽｻ郢晢ｽｻ); backdrop.hidden = true; sidebar.insertBefore(close, sidebar.firstChild); document.body.appendChild(toggle); document.body.appendChild(backdrop); function setOpen(open) { if (desktopMedia.matches) open = false; sidebar.classList.toggle("is-open", open); document.body.classList.toggle("is-drawer-open", open); toggle.setAttribute("aria-expanded", open ? "true" : "false"); backdrop.hidden = !open; document.body.style.overflow = open ? "hidden" : ""; } toggle.addEventListener("click", function () { setOpen(!sidebar.classList.contains("is-open")); }); close.addEventListener("click", function () { setOpen(false); }); backdrop.addEventListener("click", function () { setOpen(false); }); document.addEventListener("keydown", function (e) { if (e.key === "Escape" && sidebar.classList.contains("is-open")) { setOpen(false); } }); qsa("a[href]", sidebar).forEach(function (link) { if (link.closest(".p-home-side-parent")) return; link.addEventListener("click", function () { setOpen(false); }); }); window.addEventListener("resize", function () { if (desktopMedia.matches) { setOpen(false); } }); }
    function applyReservationStopNotice() { var config = window.__OPS__ || {}; var enabled = config.reservationStop === true; var message = config.reservationStopMessage; var lines = Array.isArray(message) ? message : (message ? [String(message)] : null); qsa(".p-reservation-stop").forEach(function (el) { el.hidden = !enabled; if (!enabled || !lines || !lines.length) return; while (el.firstChild) { el.removeChild(el.firstChild); } lines.forEach(function (line) { var p = document.createElement("p"); p.textContent = line; el.appendChild(p); }); }); }
  applyReservationStopNotice();
  if (isPublicPage()) { normalizeReserveLinks(); disableCourseParentLink(); initHeroSlideshow(); initMobileDrawer(); }
})();
