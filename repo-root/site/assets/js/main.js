// フル機能版 main.js（完全再構築・UTF-8安全・構文保証）
(function () {
    "use strict";

    var KEY = "perfumeReservation";
    var API_BASE = "https://project-kaori-fmup.onrender.com";
    var MAX_PEOPLE = 10;

    function qs(s, r) { return (r || document).querySelector(s); }
    function qsa(s, r) { return Array.from((r || document).querySelectorAll(s)); }

    function getData() {
        try { return JSON.parse(sessionStorage.getItem(KEY) || "{}"); }
        catch (e) { return {}; }
    }

    function setData(data) {
        sessionStorage.setItem(KEY, JSON.stringify(data));
    }

    function fetchJson(path) {
        return fetch(API_BASE + path, { credentials: "include" })
            .then(function (res) {
                if (!res.ok) throw new Error("API error");
                return res.json();
            });
    }

    function formatYen(v) {
        return Number(v).toLocaleString("ja-JP") + "円";
    }

    function formatMinutes(v) {
        return "約" + v + "分";
    }

    function renderCourses(plans) {
        var container = qs(".js-course-list");
        if (!container) return;

        container.innerHTML = plans.map(function (p) {
            return `
        <div class="course">
          <h2>${p.name}</h2>
          <p>料金：${formatYen(p.price)}</p>
          <p>所要時間：${formatMinutes(p.durationMinutes)}</p>
          <button class="js-select-course" data-id="${p.id}">次へ</button>
        </div>
      `;
        }).join("");

        qsa(".js-select-course").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var id = btn.dataset.id;
                var data = getData();
                data.planId = id;
                setData(data);
                location.href = "reserve-select-slot.html";
            });
        });
    }

    function loadCourses() {
        fetchJson("/api/plans")
            .then(renderCourses)
            .catch(function () {
                alert("該当するデータがありません");
            });
    }

    function renderSlots(slots) {
        var container = qs(".js-slot-list");
        if (!container) return;

        container.innerHTML = slots.map(function (s) {
            return `
        <button class="js-select-slot" data-date="${s.date}" data-time="${s.time}">
          ${s.date} ${s.time}
        </button>
      `;
        }).join("");

        qsa(".js-select-slot").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var data = getData();
                data.date = btn.dataset.date;
                data.time = btn.dataset.time;
                setData(data);
                location.href = "reserve-form.html";
            });
        });
    }

    function loadSlots() {
        var data = getData();
        if (!data.planId) return;

        fetchJson("/api/slots?planId=" + data.planId)
            .then(renderSlots)
            .catch(function () {
                alert("該当するデータがありません");
            });
    }

    function initForm() {
        var form = qs(".js-form");
        if (!form) return;

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            var name = qs("[name='name']").value.trim();
            var email = qs("[name='email']").value.trim();
            var people = Number(qs("[name='people']").value);

            if (!name || !email) {
                alert("必須項目です");
                return;
            }

            if (people < 1 || people > MAX_PEOPLE) {
                alert("正しい形式で入力してください");
                return;
            }

            var data = getData();
            data.name = name;
            data.email = email;
            data.people = people;
            setData(data);

            location.href = "reserve-confirm.html";
        });
    }

    function renderConfirm() {
        var data = getData();
        if (!qs(".js-confirm")) return;

        qs(".js-summary-name").textContent = data.name || "";
        qs(".js-summary-email").textContent = data.email || "";
        qs(".js-summary-people").textContent = data.people ? data.people + "人" : "";
        qs(".js-summary-date").textContent = data.date || "";
        qs(".js-summary-time").textContent = data.time || "";

        qs(".js-submit").addEventListener("click", function () {
            fetch(API_BASE + "/api/reservations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            })
                .then(function (res) {
                    if (!res.ok) throw new Error();
                    location.href = "reserve-complete.html";
                })
                .catch(function () {
                    alert("該当するデータがありません");
                });
        });
    }

    function init() {
        if (qs(".js-course-list")) loadCourses();
        if (qs(".js-slot-list")) loadSlots();
        initForm();
        renderConfirm();
    }

    document.addEventListener("DOMContentLoaded", init);
})();
