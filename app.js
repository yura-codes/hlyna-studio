/* ============================================================
   HLYNA — interactive layer.
   Vanilla ES2018, no dependencies. Handles: navigation, filters,
   schedule picker, booking drawer, Мій запис, lightbox, FAQ.
   ============================================================ */
"use strict";

(function () {
	/* ---------- Data ---------- */

	var WORKSHOPS = [
		{
			id: "persha-chashka",
			title: "Перша чашка",
			short: "Ручне ліплення чашки або миски з грудки глини — без кола й без поспіху. Найм'якший вхід у кераміку для тих, хто ніколи не працював із глиною.",
			durationLabel: "2,5 години",
			levelLabel: "для початківців",
			groupLabel: "до 8 учасників",
			price: 890,
			priceUnit: "грн / особа",
			minCount: 1,
			maxCount: 4,
			capacity: 8,
			includes: [
				"Глина, інструменти та фартух",
				"Сушіння, два випали та прозора полива",
				"Супровід майстра протягом усього заняття",
				"Фільтр-кава або узвар"
			],
			img: "assets/img/hero.jpg",
			alt: "Руки формують стінки глиняної чашки за робочим столом",
			schedule: [
				{ days: [2, 4], times: ["18:30"] },
				{ days: [6], times: ["11:00", "15:00"] }
			]
		},
		{
			id: "honcharne-kolo",
			title: "Гончарне коло",
			short: "Перше знайомство з колом: центрування, витягування стінок і одна-дві форми, які ви зробите власноруч. Кожен працює за окремим колом.",
			durationLabel: "2 години",
			levelLabel: "для початківців",
			groupLabel: "до 4 учасників",
			price: 1100,
			priceUnit: "грн / особа",
			minCount: 1,
			maxCount: 2,
			capacity: 4,
			includes: [
				"1 кг глини та робота за окремим колом",
				"Випал однієї обраної речі з поливою",
				"Фартух і все необхідне для роботи",
				"Кава або чай після заняття"
			],
			img: "assets/img/wheel.jpg",
			alt: "Центрування глини на гончарному колі, руки в ангобі",
			schedule: [
				{ days: [3, 5], times: ["18:00"] },
				{ days: [0], times: ["12:00", "16:00"] }
			]
		},
		{
			id: "liplennia-dlia-dvokh",
			title: "Ліплення для двох",
			short: "Спільний стіл, дві грудки глини й дві з половиною години тихої роботи поруч. Формат для пар, друзів або дорослого з підлітком.",
			durationLabel: "2,5 години",
			levelLabel: "для двох",
			groupLabel: "до 3 пар у залі",
			price: 1650,
			priceUnit: "грн за двох",
			minCount: 2,
			maxCount: 2,
			fixedCount: 2,
			capacity: 3,
			includes: [
				"Глина та інструменти на двох",
				"Випал двох речей і полива на вибір",
				"Окремий стіл тільки для вас",
				"По чашці кави або какао"
			],
			img: "assets/img/pair.jpg",
			alt: "Двоє ліплять із глини за спільним дерев'яним столом",
			schedule: [
				{ days: [5], times: ["19:00"] },
				{ days: [6], times: ["17:30"] }
			]
		},
		{
			id: "vilna-maisternia",
			title: "Вільна майстерня",
			short: "Робоче місце, глина та інструменти для тих, хто вже ліпив чи працював за колом і хоче практикуватися в своєму темпі, без програми.",
			durationLabel: "3 години",
			levelLabel: "з досвідом",
			groupLabel: "до 6 місць",
			price: 450,
			priceUnit: "грн / особа",
			minCount: 1,
			maxCount: 2,
			capacity: 6,
			includes: [
				"Робоче місце та інструменти на 3 години",
				"2 кг глини",
				"Полиця для сушіння ваших робіт",
				"Випал — за домовленістю, від 80 грн за річ"
			],
			img: "assets/img/table.jpg",
			alt: "Висушені керамічні вироби та інструменти на робочому столі",
			schedule: [
				{ days: [3], times: ["15:00"] },
				{ days: [0], times: ["10:00"] }
			]
		}
	];

	var STORAGE_KEY = "hlyna_booking";
	var MONTHS_GEN = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
	var WEEKDAYS_SHORT = ["нд", "пн", "вт", "ср", "чт", "пт", "сб"];

	/* ---------- Utils ---------- */

	function byId(id) {
		return document.getElementById(id);
	}

	function getWorkshop(id) {
		for (var i = 0; i < WORKSHOPS.length; i++) {
			if (WORKSHOPS[i].id === id) return WORKSHOPS[i];
		}
		return WORKSHOPS[0];
	}

	function hashStr(s) {
		var h = 0;
		for (var i = 0; i < s.length; i++) {
			h = (h * 31 + s.charCodeAt(i)) | 0;
		}
		return Math.abs(h);
	}

	function pad2(n) {
		return n < 10 ? "0" + n : "" + n;
	}

	function toISO(d) {
		return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
	}

	function parseISO(s) {
		var p = s.split("-");
		return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
	}

	function fmtDateShort(iso) {
		var d = parseISO(iso);
		return WEEKDAYS_SHORT[d.getDay()] + ", " + d.getDate() + " " + MONTHS_GEN[d.getMonth()];
	}

	function fmtDateFull(iso) {
		var d = parseISO(iso);
		return d.getDate() + " " + MONTHS_GEN[d.getMonth()] + " (" + WEEKDAYS_SHORT[d.getDay()] + ")";
	}

	function peopleLabel(n) {
		if (n === 1) return "1 особа";
		if (n >= 2 && n <= 4) return n + " особи";
		return n + " осіб";
	}

	function seatsLabel(n) {
		if (n === 1) return "1 місце";
		if (n >= 2 && n <= 4) return n + " місця";
		return n + " місць";
	}

	function moneyLabel(n) {
		return n + " грн";
	}

	function bookingTotal(ws, count) {
		return ws.fixedCount ? ws.price : ws.price * count;
	}

	function neededSeats(ws, count) {
		return ws.fixedCount ? 1 : count;
	}

	function escapeHtml(s) {
		return String(s)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");
	}

	/* ---------- Slots (deterministic demo schedule) ---------- */

	var SLOTS = {};

	function generateSlots() {
		var now = new Date();
		var minTime = now.getTime() + 24 * 3600 * 1000;
		WORKSHOPS.forEach(function (ws) {
			var list = [];
			for (var off = 1; off <= 28; off++) {
				var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + off);
				var dow = d.getDay();
				ws.schedule.forEach(function (rule) {
					if (rule.days.indexOf(dow) === -1) return;
					rule.times.forEach(function (time) {
						var hm = time.split(":");
						var slotDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), Number(hm[0]), Number(hm[1]));
						if (slotDate.getTime() < minTime) return;
						var iso = toISO(d);
						var h = hashStr(ws.id + iso + time);
						var left = h % (ws.capacity + 2);
						if (left > ws.capacity) left = ws.capacity;
						list.push({ date: iso, time: time, left: left });
					});
				});
			}
			list.sort(function (a, b) {
				return a.date === b.date ? (a.time < b.time ? -1 : 1) : (a.date < b.date ? -1 : 1);
			});
			SLOTS[ws.id] = list;
		});
	}

	function slotsFor(wsId) {
		return SLOTS[wsId] || [];
	}

	function findSlot(wsId, date, time) {
		var list = slotsFor(wsId);
		for (var i = 0; i < list.length; i++) {
			if (list[i].date === date && list[i].time === time) return list[i];
		}
		return null;
	}

	function availableDates(ws, needed) {
		var seen = {};
		var out = [];
		slotsFor(ws.id).forEach(function (s) {
			if (seen[s.date]) return;
			seen[s.date] = true;
			out.push(s.date);
		});
		return out;
	}

	function dateHasSeats(ws, date, needed) {
		return slotsFor(ws.id).some(function (s) {
			return s.date === date && s.left >= needed;
		});
	}

	/* ---------- Storage ---------- */

	function loadBooking() {
		try {
			var raw = window.localStorage.getItem(STORAGE_KEY);
			if (!raw) return null;
			var b = JSON.parse(raw);
			if (!b || typeof b.ref !== "string" || typeof b.workshopId !== "string") return null;
			return b;
		} catch (err) {
			return null;
		}
	}

	function saveBooking(b) {
		try {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
		} catch (err) { /* private mode — booking just won't persist */ }
	}

	function clearBooking() {
		try {
			window.localStorage.removeItem(STORAGE_KEY);
		} catch (err) { /* ignore */ }
	}

	function makeRef() {
		var s = "";
		var chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
		for (var i = 0; i < 6; i++) {
			s += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return "HL-" + s;
	}

	function updateBookingDot() {
		var has = loadBooking() !== null;
		var dot = byId("myBookingDot");
		if (dot) dot.hidden = !has;
	}

	/* ---------- Layers (Esc / scroll-lock manager) ---------- */

	var layers = [];

	function pushLayer(name, closeFn) {
		layers.push({ name: name, close: closeFn });
		document.body.classList.add("no-scroll");
	}

	function popLayer(name) {
		layers = layers.filter(function (l) { return l.name !== name; });
		if (layers.length === 0) document.body.classList.remove("no-scroll");
	}

	document.addEventListener("keydown", function (e) {
		if (e.key === "Escape" && layers.length > 0) {
			layers[layers.length - 1].close();
		}
	});

	function trapFocus(container) {
		container.addEventListener("keydown", function (e) {
			if (e.key !== "Tab") return;
			var sel = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
			var els = Array.prototype.filter.call(container.querySelectorAll(sel), function (el) {
				return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
			});
			if (els.length === 0) return;
			var first = els[0];
			var last = els[els.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		});
	}

	/* ---------- Header, nav, mobile menu ---------- */

	var header = byId("siteHeader");
	var burger = byId("burgerBtn");
	var mobileMenu = byId("mobileMenu");
	var menuOpen = false;

	function onScrollHeader() {
		if (header) header.classList.toggle("scrolled", window.scrollY > 4);
	}

	function openMenu() {
		if (!mobileMenu || !burger) return;
		menuOpen = true;
		mobileMenu.hidden = false;
		burger.setAttribute("aria-expanded", "true");
		burger.setAttribute("aria-label", "Закрити меню");
		pushLayer("menu", closeMenu);
	}

	function closeMenu() {
		if (!mobileMenu || !burger) return;
		menuOpen = false;
		mobileMenu.hidden = true;
		burger.setAttribute("aria-expanded", "false");
		burger.setAttribute("aria-label", "Відкрити меню");
		popLayer("menu");
	}

	function initMenu() {
		if (!burger) return;
		burger.addEventListener("click", function () {
			if (menuOpen) closeMenu(); else openMenu();
		});
		Array.prototype.forEach.call(document.querySelectorAll("[data-mnav]"), function (link) {
			link.addEventListener("click", function () {
				closeMenu();
			});
		});
	}

	function initNavActive() {
		var links = Array.prototype.slice.call(document.querySelectorAll("[data-navlink]"));
		var map = [];
		links.forEach(function (link) {
			var href = link.getAttribute("href") || "";
			if (href.charAt(0) !== "#") return;
			var sec = document.getElementById(href.slice(1));
			if (sec) map.push({ link: link, sec: sec });
		});
		if (map.length === 0) return;
		var ticking = false;
		function update() {
			ticking = false;
			var pos = window.scrollY + 140;
			var current = null;
			map.forEach(function (m) {
				if (m.sec.offsetTop <= pos) current = m;
			});
			if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 8) {
				current = map[map.length - 1];
			}
			map.forEach(function (m) {
				m.link.classList.toggle("is-active", current !== null && m.link === current.link);
			});
		}
		window.addEventListener("scroll", function () {
			onScrollHeader();
			if (!ticking) {
				ticking = true;
				window.requestAnimationFrame(update);
			}
		}, { passive: true });
		update();
		onScrollHeader();
	}

	/* ---------- Hero: today status + next workshop ---------- */

	function initHeroInfo() {
		var statusEl = byId("todayStatus");
		var nextEl = byId("nextWorkshop");
		if (statusEl) {
			var now = new Date();
			var day = now.getDay();
			var hour = now.getHours() + now.getMinutes() / 60;
			var text;
			if (day === 1) {
				text = "Сьогодні вихідний — день випалу";
			} else {
				var open = (day === 0 || day === 6) ? 11 : 10;
				var close = (day === 0 || day === 6) ? 19 : 20;
				if (hour >= open && hour < close) {
					text = "Відчинено до " + close + ":00";
				} else if (hour < open) {
					text = "Сьогодні відчинимось о " + open + ":00";
				} else {
					text = "Вже зачинено — чекаємо завтра";
				}
			}
			statusEl.textContent = text;
		}
		if (nextEl) {
			var best = null;
			var bestWs = null;
			WORKSHOPS.forEach(function (ws) {
				slotsFor(ws.id).some(function (s) {
					if (s.left > 0) {
						if (best === null || s.date < best.date || (s.date === best.date && s.time < best.time)) {
							best = s;
							bestWs = ws;
						}
						return true;
					}
					return false;
				});
			});
			if (best !== null && bestWs !== null) {
				nextEl.textContent = fmtDateShort(best.date) + ", " + best.time + " — «" + bestWs.title + "»";
			}
		}
	}

	/* ---------- Workshop rows: dates + filters ---------- */

	function initWorkshopRows() {
		WORKSHOPS.forEach(function (ws) {
			var el = document.querySelector('[data-ws-dates="' + ws.id + '"]');
			if (!el) return;
			var dates = [];
			var seen = {};
			slotsFor(ws.id).forEach(function (s) {
				if (s.left > 0 && !seen[s.date] && dates.length < 3) {
					seen[s.date] = true;
					dates.push(fmtDateShort(s.date));
				}
			});
			if (dates.length > 0) {
				el.innerHTML = "Найближчі дати: <strong>" + dates.join(" · ") + "</strong>";
			} else {
				el.textContent = "Найближчі дати з'являться в розкладі згодом.";
			}
		});

		Array.prototype.forEach.call(document.querySelectorAll("[data-details]"), function (btn) {
			btn.addEventListener("click", function () {
				openDetailDrawer(getWorkshop(btn.getAttribute("data-details")));
			});
		});
		Array.prototype.forEach.call(document.querySelectorAll("[data-book]"), function (btn) {
			btn.addEventListener("click", function () {
				openBookingDrawer({ wsId: btn.getAttribute("data-book") });
			});
		});
	}

	function initWorkshopFilters() {
		var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
		var rows = Array.prototype.slice.call(document.querySelectorAll("[data-level]"));
		var empty = byId("wsEmpty");
		var reset = byId("wsEmptyReset");
		if (buttons.length === 0) return;

		function apply(filter) {
			buttons.forEach(function (b) {
				var active = b.getAttribute("data-filter") === filter;
				b.classList.toggle("is-active", active);
				b.setAttribute("aria-pressed", active ? "true" : "false");
			});
			var visible = 0;
			rows.forEach(function (row) {
				var show = filter === "all" || row.getAttribute("data-level") === filter;
				row.classList.toggle("is-hidden", !show);
				if (show) visible++;
			});
			if (empty) empty.hidden = visible !== 0;
		}

		buttons.forEach(function (b) {
			b.addEventListener("click", function () {
				apply(b.getAttribute("data-filter") || "all");
			});
		});
		if (reset) {
			reset.addEventListener("click", function () { apply("all"); });
		}
		apply("all");
	}

	/* ---------- Coffee menu filter ---------- */

	function initCoffeeFilter() {
		var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-menu-filter]"));
		var items = Array.prototype.slice.call(document.querySelectorAll("[data-cat]"));
		if (buttons.length === 0) return;
		buttons.forEach(function (b) {
			b.addEventListener("click", function () {
				var filter = b.getAttribute("data-menu-filter") || "all";
				buttons.forEach(function (x) {
					var active = x === b;
					x.classList.toggle("is-active", active);
					x.setAttribute("aria-pressed", active ? "true" : "false");
				});
				items.forEach(function (item) {
					item.classList.toggle("is-hidden", filter !== "all" && item.getAttribute("data-cat") !== filter);
				});
			});
		});
	}

	/* ---------- FAQ accordion ---------- */

	function initFaq() {
		Array.prototype.forEach.call(document.querySelectorAll(".faq-q"), function (btn) {
			btn.addEventListener("click", function () {
				var item = btn.closest(".faq-item");
				if (!item) return;
				var open = item.classList.toggle("is-open");
				btn.setAttribute("aria-expanded", open ? "true" : "false");
			});
		});
	}

	/* ---------- Lightbox ---------- */

	var lightbox = byId("lightbox");
	var lbImg = byId("lbImg");
	var lbCaption = byId("lbCaption");
	var lbIndex = 0;
	var lbItems = [];
	var lbLastFocus = null;

	function collectGallery() {
		lbItems = [];
		Array.prototype.forEach.call(document.querySelectorAll("[data-lightbox]"), function (btn) {
			var img = btn.querySelector("img");
			var fig = btn.closest("figure");
			var cap = fig ? fig.querySelector("figcaption") : null;
			if (img) {
				lbItems.push({
					src: img.getAttribute("src") || "",
					alt: img.getAttribute("alt") || "",
					caption: cap ? cap.textContent || "" : ""
				});
			}
		});
	}

	function lbShow(i) {
		if (lbItems.length === 0 || !lbImg || !lbCaption) return;
		lbIndex = (i + lbItems.length) % lbItems.length;
		var item = lbItems[lbIndex];
		lbImg.setAttribute("src", item.src);
		lbImg.setAttribute("alt", item.alt);
		lbCaption.textContent = item.caption + " · " + (lbIndex + 1) + " / " + lbItems.length;
	}

	function openLightbox(i) {
		if (!lightbox) return;
		lbLastFocus = document.activeElement;
		lightbox.hidden = false;
		lbShow(i);
		pushLayer("lightbox", closeLightbox);
		var closeBtn = byId("lbClose");
		if (closeBtn) closeBtn.focus();
	}

	function closeLightbox() {
		if (!lightbox) return;
		lightbox.hidden = true;
		popLayer("lightbox");
		if (lbLastFocus && typeof lbLastFocus.focus === "function") lbLastFocus.focus();
	}

	function initLightbox() {
		if (!lightbox) return;
		collectGallery();
		Array.prototype.forEach.call(document.querySelectorAll("[data-lightbox]"), function (btn) {
			btn.addEventListener("click", function () {
				openLightbox(Number(btn.getAttribute("data-lightbox")) || 0);
			});
		});
		var closeBtn = byId("lbClose");
		var prevBtn = byId("lbPrev");
		var nextBtn = byId("lbNext");
		if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
		if (prevBtn) prevBtn.addEventListener("click", function () { lbShow(lbIndex - 1); });
		if (nextBtn) nextBtn.addEventListener("click", function () { lbShow(lbIndex + 1); });
		document.addEventListener("keydown", function (e) {
			if (lightbox.hidden) return;
			if (e.key === "ArrowLeft") lbShow(lbIndex - 1);
			if (e.key === "ArrowRight") lbShow(lbIndex + 1);
		});
		lightbox.addEventListener("click", function (e) {
			if (e.target === lightbox) closeLightbox();
		});
		trapFocus(lightbox);
	}

	/* ---------- Privacy modal ---------- */

	var privacyLastFocus = null;

	function openPrivacy() {
		var modal = byId("privacyModal");
		var overlay = byId("privacyOverlay");
		if (!modal || !overlay) return;
		privacyLastFocus = document.activeElement;
		overlay.hidden = false;
		modal.hidden = false;
		window.requestAnimationFrame(function () {
			overlay.classList.add("is-visible");
		});
		pushLayer("privacy", closePrivacy);
		var closeBtn = byId("privacyClose");
		if (closeBtn) closeBtn.focus();
	}

	function closePrivacy() {
		var modal = byId("privacyModal");
		var overlay = byId("privacyOverlay");
		if (!modal || !overlay) return;
		overlay.classList.remove("is-visible");
		modal.hidden = true;
		overlay.hidden = true;
		popLayer("privacy");
		if (privacyLastFocus && typeof privacyLastFocus.focus === "function") privacyLastFocus.focus();
	}

	function initPrivacy() {
		var btn = byId("privacyBtn");
		var closeBtn = byId("privacyClose");
		var overlay = byId("privacyOverlay");
		var modal = byId("privacyModal");
		if (btn) btn.addEventListener("click", openPrivacy);
		if (closeBtn) closeBtn.addEventListener("click", closePrivacy);
		if (overlay) overlay.addEventListener("click", closePrivacy);
		if (modal) trapFocus(modal);
	}

	/* ---------- Reveal on scroll ---------- */

	function initReveal() {
		if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		if (typeof window.IntersectionObserver !== "function") return;
		var targets = document.querySelectorAll(".ws-row, .process-step, .g-item, .story-media, .coffee-media");
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-visible");
					io.unobserve(entry.target);
				}
			});
		}, { threshold: 0.1 });
		Array.prototype.forEach.call(targets, function (el) {
			el.classList.add("reveal");
			io.observe(el);
		});
	}

	/* ---------- Schedule picker ---------- */

	var schedWs = WORKSHOPS[0];
	var schedDate = null;
	var schedTime = null;
	var schedCountVal = 1;

	function renderSchedWorkshops() {
		var box = byId("schedWsList");
		if (!box) return;
		box.innerHTML = "";
		WORKSHOPS.forEach(function (ws) {
			var btn = document.createElement("button");
			btn.type = "button";
			btn.className = "sched-ws-btn" + (ws.id === schedWs.id ? " is-active" : "");
			btn.setAttribute("aria-pressed", ws.id === schedWs.id ? "true" : "false");
			btn.innerHTML = '<span class="sched-ws-name">' + escapeHtml(ws.title) + '</span><span class="sched-ws-price">' + ws.price + " " + escapeHtml(ws.priceUnit) + "</span>";
			btn.addEventListener("click", function () {
				schedWs = ws;
				schedDate = null;
				schedTime = null;
				schedCountVal = ws.fixedCount ? ws.fixedCount : 1;
				renderSchedWorkshops();
				renderSchedDates();
				renderSchedTimes();
				renderSchedCount();
				updateSummary();
			});
			box.appendChild(btn);
		});
	}

	function renderSchedDates() {
		var box = byId("schedDates");
		if (!box) return;
		box.innerHTML = "";
		var needed = neededSeats(schedWs, schedCountVal);
		var dates = availableDates(schedWs).slice(0, 8);
		dates.forEach(function (date) {
			var has = dateHasSeats(schedWs, date, needed);
			var btn = document.createElement("button");
			btn.type = "button";
			btn.className = "chip" + (date === schedDate ? " is-active" : "");
			btn.setAttribute("aria-pressed", date === schedDate ? "true" : "false");
			btn.textContent = fmtDateShort(date);
			if (!has) {
				btn.disabled = true;
				btn.title = "На цю дату місць немає";
			}
			btn.addEventListener("click", function () {
				schedDate = date;
				schedTime = null;
				renderSchedDates();
				renderSchedTimes();
				updateSummary();
			});
			box.appendChild(btn);
		});
	}

	function renderSchedTimes() {
		var box = byId("schedTimes");
		if (!box) return;
		box.innerHTML = "";
		if (!schedDate) {
			var note = document.createElement("p");
			note.className = "sched-note";
			note.textContent = "Спершу оберіть дату.";
			box.appendChild(note);
			return;
		}
		var needed = neededSeats(schedWs, schedCountVal);
		slotsFor(schedWs.id).forEach(function (s) {
			if (s.date !== schedDate) return;
			var ok = s.left >= needed;
			var btn = document.createElement("button");
			btn.type = "button";
			btn.className = "chip" + (s.time === schedTime ? " is-active" : "");
			btn.setAttribute("aria-pressed", s.time === schedTime ? "true" : "false");
			var noteText = s.left === 0 ? "місць немає" : (schedWs.fixedCount ? seatsLabel(s.left).replace("місце", "стіл").replace("місця", "столи").replace("місць", "столів") : seatsLabel(s.left));
			btn.innerHTML = escapeHtml(s.time) + ' <span class="chip-note">· ' + escapeHtml(noteText) + "</span>";
			if (!ok) {
				btn.disabled = true;
			}
			btn.addEventListener("click", function () {
				schedTime = s.time;
				renderSchedTimes();
				updateSummary();
			});
			box.appendChild(btn);
		});
	}

	function renderSchedCount() {
		var countEl = byId("schedCount");
		var minus = byId("schedMinus");
		var plus = byId("schedPlus");
		var note = byId("schedCountNote");
		if (!countEl || !minus || !plus) return;
		countEl.textContent = String(schedCountVal);
		if (schedWs.fixedCount) {
			minus.disabled = true;
			plus.disabled = true;
			if (note) note.textContent = "Формат фіксований: двоє учасників за одним столом.";
		} else {
			minus.disabled = schedCountVal <= schedWs.minCount;
			plus.disabled = schedCountVal >= schedWs.maxCount;
			if (note) note.textContent = "До " + schedWs.maxCount + " місць в одному записі.";
		}
	}

	function updateSummary() {
		var sumWs = byId("sumWs");
		var sumDate = byId("sumDate");
		var sumTime = byId("sumTime");
		var sumCount = byId("sumCount");
		var sumTotal = byId("sumTotal");
		var proceed = byId("schedProceed");
		var hint = byId("schedHint");
		if (sumWs) sumWs.textContent = "«" + schedWs.title + "»";
		if (sumDate) sumDate.textContent = schedDate ? fmtDateFull(schedDate) : "—";
		if (sumTime) sumTime.textContent = schedTime ? schedTime : "—";
		if (sumCount) sumCount.textContent = peopleLabel(schedCountVal);
		if (sumTotal) sumTotal.textContent = moneyLabel(bookingTotal(schedWs, schedCountVal));
		var ready = Boolean(schedDate && schedTime);
		if (proceed) proceed.disabled = !ready;
		if (hint) {
			if (ready) {
				hint.textContent = "Готово — залишилося вказати контакти.";
			} else if (!schedDate) {
				hint.textContent = "Оберіть дату, щоб побачити вільні години.";
			} else {
				hint.textContent = "Оберіть час із доступних.";
			}
		}
	}

	function initSchedule() {
		var minus = byId("schedMinus");
		var plus = byId("schedPlus");
		var proceed = byId("schedProceed");
		if (minus) minus.addEventListener("click", function () {
			if (schedCountVal > schedWs.minCount) {
				schedCountVal--;
				renderSchedCount();
				renderSchedDates();
				renderSchedTimes();
				updateSummary();
			}
		});
		if (plus) plus.addEventListener("click", function () {
			if (schedCountVal < schedWs.maxCount) {
				schedCountVal++;
				var needed = neededSeats(schedWs, schedCountVal);
				if (schedDate && schedTime) {
					var slot = findSlot(schedWs.id, schedDate, schedTime);
					if (!slot || slot.left < needed) schedTime = null;
				}
				if (schedDate && !dateHasSeats(schedWs, schedDate, needed)) {
					schedDate = null;
					schedTime = null;
				}
				renderSchedCount();
				renderSchedDates();
				renderSchedTimes();
				updateSummary();
			}
		});
		if (proceed) proceed.addEventListener("click", function () {
			openBookingDrawer({
				wsId: schedWs.id,
				date: schedDate || undefined,
				time: schedTime || undefined,
				count: schedCountVal
			});
		});
		renderSchedWorkshops();
		renderSchedDates();
		renderSchedTimes();
		renderSchedCount();
		updateSummary();
	}

	/* ---------- Drawer ---------- */

	var drawer = byId("drawer");
	var drawerOverlay = byId("drawerOverlay");
	var drawerBody = byId("drawerBody");
	var drawerTitle = byId("drawerTitle");
	var drawerKicker = byId("drawerKicker");
	var drawerOpen = false;
	var drawerLastFocus = null;

	function setDrawerHead(kicker, title) {
		if (drawerKicker) drawerKicker.textContent = kicker;
		if (drawerTitle) drawerTitle.textContent = title;
	}

	function openDrawer() {
		if (!drawer || !drawerOverlay) return;
		if (drawerOpen) return;
		drawerOpen = true;
		drawerLastFocus = document.activeElement;
		drawerOverlay.hidden = false;
		drawer.hidden = false;
		/* force reflow so the transition plays */
		void drawer.offsetWidth;
		drawer.classList.add("is-open");
		drawerOverlay.classList.add("is-visible");
		pushLayer("drawer", closeDrawer);
		var closeBtn = byId("drawerClose");
		if (closeBtn) closeBtn.focus();
	}

	function closeDrawer() {
		if (!drawer || !drawerOverlay) return;
		if (!drawerOpen) return;
		drawerOpen = false;
		drawer.classList.remove("is-open");
		drawerOverlay.classList.remove("is-visible");
		popLayer("drawer");
		window.setTimeout(function () {
			if (!drawerOpen) {
				drawer.hidden = true;
				drawerOverlay.hidden = true;
			}
		}, 320);
		if (drawerLastFocus && typeof drawerLastFocus.focus === "function") drawerLastFocus.focus();
	}

	function initDrawer() {
		var closeBtn = byId("drawerClose");
		if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
		if (drawerOverlay) drawerOverlay.addEventListener("click", closeDrawer);
		if (drawer) trapFocus(drawer);
	}

	/* ---------- Drawer view: workshop details ---------- */

	/* ---------- Smooth view swap inside the drawer ---------- */

	var drawerSwapTimer = null;

	function swapDrawerView(render) {
		var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (!drawerOpen || reduce || !drawer || !drawerBody) {
			render();
			return;
		}
		if (drawerSwapTimer) window.clearTimeout(drawerSwapTimer);
		drawer.classList.add("is-swapping");
		drawerSwapTimer = window.setTimeout(function () {
			drawerSwapTimer = null;
			render();
			drawerBody.scrollTop = 0;
			void drawerBody.offsetWidth;
			drawer.classList.remove("is-swapping");
		}, 170);
	}

	function openDetailDrawer(ws) {
		swapDrawerView(function () { openDetailDrawerNow(ws); });
	}

	function openDetailDrawerNow(ws) {
		if (!drawerBody) return;
		setDrawerHead("Майстерня", ws.title);
		var slots = [];
		slotsFor(ws.id).forEach(function (s) {
			if (s.left > 0 && slots.length < 5) slots.push(s);
		});
		var slotsHtml = slots.map(function (s) {
			return '<button type="button" class="chip" data-slot-date="' + s.date + '" data-slot-time="' + s.time + '">' + fmtDateShort(s.date) + ", " + s.time + "</button>";
		}).join("");
		drawerBody.innerHTML =
			'<img class="dw-img" src="' + ws.img + '" alt="' + escapeHtml(ws.alt) + '">' +
			'<p class="dw-meta">' + escapeHtml(ws.durationLabel) + " · " + escapeHtml(ws.levelLabel) + " · " + escapeHtml(ws.groupLabel) + "</p>" +
			'<p class="dw-desc">' + escapeHtml(ws.short) + "</p>" +
			'<p class="dw-sub">Що входить у вартість</p>' +
			'<ul class="dw-includes">' + ws.includes.map(function (i) { return "<li>" + escapeHtml(i) + "</li>"; }).join("") + "</ul>" +
			'<p class="dw-sub">Найближчі вільні слоти</p>' +
			'<div class="dw-slots">' + (slotsHtml || '<p class="sched-note">Найближчим часом вільних місць немає.</p>') + "</div>" +
			'<div class="dw-price-line"><span>' + escapeHtml(ws.priceUnit) + "</span><strong>" + moneyLabel(ws.price) + "</strong></div>" +
			'<div class="dw-actions"><button type="button" class="btn btn-primary btn-wide" id="dwBook">Забронювати цю майстерню</button></div>';
		var bookBtn = byId("dwBook");
		if (bookBtn) bookBtn.addEventListener("click", function () {
			openBookingDrawer({ wsId: ws.id });
		});
		Array.prototype.forEach.call(drawerBody.querySelectorAll("[data-slot-date]"), function (chip) {
			chip.addEventListener("click", function () {
				openBookingDrawer({
					wsId: ws.id,
					date: chip.getAttribute("data-slot-date") || undefined,
					time: chip.getAttribute("data-slot-time") || undefined
				});
			});
		});
		openDrawer();
	}

	/* ---------- Drawer view: booking form ---------- */

	function fillDateSelect(select, ws, needed, selected) {
		select.innerHTML = '<option value="">Оберіть дату</option>';
		availableDates(ws).forEach(function (date) {
			if (!dateHasSeats(ws, date, needed)) return;
			var opt = document.createElement("option");
			opt.value = date;
			opt.textContent = fmtDateFull(date);
			if (date === selected) opt.selected = true;
			select.appendChild(opt);
		});
	}

	function fillTimeSelect(select, ws, date, needed, selected) {
		select.innerHTML = '<option value="">Оберіть час</option>';
		if (!date) return;
		slotsFor(ws.id).forEach(function (s) {
			if (s.date !== date) return;
			var opt = document.createElement("option");
			opt.value = s.time;
			if (s.left >= needed) {
				opt.textContent = s.time;
				if (s.time === selected) opt.selected = true;
			} else {
				opt.textContent = s.time + " — місць немає";
				opt.disabled = true;
			}
			select.appendChild(opt);
		});
	}

	function fillCountSelect(select, ws, selected) {
		select.innerHTML = "";
		if (ws.fixedCount) {
			var opt = document.createElement("option");
			opt.value = String(ws.fixedCount);
			opt.textContent = peopleLabel(ws.fixedCount) + " (фіксований формат)";
			select.appendChild(opt);
			select.disabled = true;
			return;
		}
		select.disabled = false;
		for (var n = ws.minCount; n <= ws.maxCount; n++) {
			var o = document.createElement("option");
			o.value = String(n);
			o.textContent = peopleLabel(n);
			if (n === selected) o.selected = true;
			select.appendChild(o);
		}
	}

	function setFieldError(fieldId, errId, message) {
		var field = byId(fieldId);
		var err = byId(errId);
		if (field) field.classList.toggle("has-error", Boolean(message));
		if (err) err.textContent = message || "";
	}

	function validPhone(raw) {
		var cleaned = raw.replace(/[\s\-()]/g, "");
		return /^(\+?38)?0\d{9}$/.test(cleaned);
	}

	function openBookingDrawer(pre) {
		swapDrawerView(function () { openBookingDrawerNow(pre); });
	}

	function openBookingDrawerNow(pre) {
		if (!drawerBody) return;
		var ws = getWorkshop(pre.wsId || WORKSHOPS[0].id);
		var count = ws.fixedCount ? ws.fixedCount : Math.min(Math.max(pre.count || 1, ws.minCount), ws.maxCount);
		setDrawerHead("Бронювання", "Запис на майстерню");

		drawerBody.innerHTML =
			'<form id="bookingForm" novalidate>' +
			'<div class="bf-field"><label class="bf-label" for="bfWorkshop">Майстерня</label><select id="bfWorkshop" class="bf-select"></select></div>' +
			'<div class="bf-row">' +
			'<div class="bf-field" id="fieldDate"><label class="bf-label" for="bfDate">Дата</label><select id="bfDate" class="bf-select"></select><p class="bf-error" id="errDate"></p></div>' +
			'<div class="bf-field" id="fieldTime"><label class="bf-label" for="bfTime">Час</label><select id="bfTime" class="bf-select"></select><p class="bf-error" id="errTime"></p></div>' +
			"</div>" +
			'<div class="bf-field"><label class="bf-label" for="bfCount">Кількість учасників</label><select id="bfCount" class="bf-select"></select></div>' +
			'<div class="bf-field" id="fieldName"><label class="bf-label" for="bfName">Ім&#39;я</label><input id="bfName" class="bf-input" type="text" autocomplete="name"><p class="bf-error" id="errName"></p></div>' +
			'<div class="bf-field" id="fieldPhone"><label class="bf-label" for="bfPhone">Телефон</label><input id="bfPhone" class="bf-input" type="tel" inputmode="tel" placeholder="+38 067 123 45 67" autocomplete="tel"><p class="bf-error" id="errPhone"></p></div>' +
			'<div class="bf-field"><label class="bf-label" for="bfSocial">Instagram або Telegram <span class="opt">(необов&#39;язково)</span></label><input id="bfSocial" class="bf-input" type="text" placeholder="@nickname"></div>' +
			'<div class="bf-field"><label class="bf-label" for="bfComment">Коментар <span class="opt">(необов&#39;язково)</span></label><textarea id="bfComment" class="bf-textarea" placeholder="Наприклад: прийдемо трохи раніше"></textarea></div>' +
			'<div class="bf-check-wrap" id="fieldAgree"><div class="bf-check"><input type="checkbox" id="bfAgree"><label for="bfAgree">Погоджуюся з умовами відвідування та політикою перенесення записів.</label></div><p class="bf-error" id="errAgree"></p></div>' +
			'<div class="dw-price-line"><span>Разом</span><strong id="bfTotal"></strong></div>' +
			'<button type="submit" class="btn btn-primary btn-wide bf-submit" id="bfSubmit">Підтвердити запис</button>' +
			'<p class="bf-demo-note">Це демо для портфоліо: оплата не потрібна, дані нікуди не надсилаються й зберігаються лише у вашому браузері.</p>' +
			"</form>";

		var form = byId("bookingForm");
		var wsSel = byId("bfWorkshop");
		var dateSel = byId("bfDate");
		var timeSel = byId("bfTime");
		var countSel = byId("bfCount");
		var nameInp = byId("bfName");
		var phoneInp = byId("bfPhone");
		var socialInp = byId("bfSocial");
		var commentInp = byId("bfComment");
		var agreeInp = byId("bfAgree");
		var totalEl = byId("bfTotal");
		var submitBtn = byId("bfSubmit");
		if (!form || !wsSel || !dateSel || !timeSel || !countSel || !nameInp || !phoneInp || !agreeInp || !totalEl || !submitBtn) return;

		WORKSHOPS.forEach(function (w) {
			var opt = document.createElement("option");
			opt.value = w.id;
			opt.textContent = w.title + " · " + w.price + " " + w.priceUnit;
			if (w.id === ws.id) opt.selected = true;
			wsSel.appendChild(opt);
		});

		function currentWs() { return getWorkshop(wsSel.value); }
		function currentCount() {
			var w = currentWs();
			return w.fixedCount ? w.fixedCount : (Number(countSel.value) || w.minCount);
		}
		function refreshTotal() {
			totalEl.textContent = moneyLabel(bookingTotal(currentWs(), currentCount()));
		}
		function refreshDates(keepDate, keepTime) {
			var w = currentWs();
			var needed = neededSeats(w, currentCount());
			fillDateSelect(dateSel, w, needed, keepDate || "");
			fillTimeSelect(timeSel, w, dateSel.value, needed, keepTime || "");
		}

		fillCountSelect(countSel, ws, count);
		refreshDates(pre.date, pre.time);
		refreshTotal();

		wsSel.addEventListener("change", function () {
			var w = currentWs();
			fillCountSelect(countSel, w, w.fixedCount ? w.fixedCount : w.minCount);
			refreshDates();
			refreshTotal();
		});
		countSel.addEventListener("change", function () {
			refreshDates(dateSel.value, timeSel.value);
			refreshTotal();
		});
		dateSel.addEventListener("change", function () {
			var w = currentWs();
			fillTimeSelect(timeSel, w, dateSel.value, neededSeats(w, currentCount()), "");
			setFieldError("fieldDate", "errDate", "");
		});
		timeSel.addEventListener("change", function () {
			setFieldError("fieldTime", "errTime", "");
		});
		nameInp.addEventListener("input", function () {
			if (nameInp.value.trim().length >= 2) setFieldError("fieldName", "errName", "");
		});
		phoneInp.addEventListener("input", function () {
			if (validPhone(phoneInp.value)) setFieldError("fieldPhone", "errPhone", "");
		});
		agreeInp.addEventListener("change", function () {
			if (agreeInp.checked) setFieldError("fieldAgree", "errAgree", "");
		});

		form.addEventListener("submit", function (e) {
			e.preventDefault();
			var w = currentWs();
			var cnt = currentCount();
			var firstBad = null;
			if (!dateSel.value) {
				setFieldError("fieldDate", "errDate", "Оберіть дату.");
				firstBad = firstBad || dateSel;
			}
			if (!timeSel.value) {
				setFieldError("fieldTime", "errTime", "Оберіть час.");
				firstBad = firstBad || timeSel;
			}
			if (dateSel.value && timeSel.value) {
				var slot = findSlot(w.id, dateSel.value, timeSel.value);
				if (!slot || slot.left < neededSeats(w, cnt)) {
					setFieldError("fieldTime", "errTime", "На цей час уже немає місць — оберіть інший.");
					firstBad = firstBad || timeSel;
				}
			}
			if (nameInp.value.trim().length < 2) {
				setFieldError("fieldName", "errName", "Вкажіть ім&#39;я (щонайменше 2 літери).".replace("&#39;", "'"));
				firstBad = firstBad || nameInp;
			}
			if (!validPhone(phoneInp.value)) {
				setFieldError("fieldPhone", "errPhone", "Введіть український номер у форматі +38 067 123 45 67.");
				firstBad = firstBad || phoneInp;
			}
			if (!agreeInp.checked) {
				setFieldError("fieldAgree", "errAgree", "Потрібна згода з умовами, щоб завершити запис.");
				firstBad = firstBad || agreeInp;
			}
			if (firstBad) {
				firstBad.focus();
				return;
			}

			submitBtn.disabled = true;
			submitBtn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Надсилаємо…';

			var booking = {
				ref: makeRef(),
				workshopId: w.id,
				date: dateSel.value,
				time: timeSel.value,
				count: cnt,
				name: nameInp.value.trim(),
				phone: phoneInp.value.trim(),
				social: socialInp ? socialInp.value.trim() : "",
				comment: commentInp ? commentInp.value.trim() : "",
				total: bookingTotal(w, cnt),
				createdAt: new Date().toISOString()
			};

			window.setTimeout(function () {
				saveBooking(booking);
				updateBookingDot();
				renderSuccessView(booking);
			}, 900);
		});

		openDrawer();
	}

	/* ---------- Drawer view: success ---------- */

	function bookingSummaryHtml(b) {
		var w = getWorkshop(b.workshopId);
		return '<ul class="booking-summary">' +
			"<li><span>Майстерня</span><span>«" + escapeHtml(w.title) + "»</span></li>" +
			"<li><span>Дата</span><span>" + fmtDateFull(b.date) + "</span></li>" +
			"<li><span>Час</span><span>" + escapeHtml(b.time) + "</span></li>" +
			"<li><span>Учасники</span><span>" + peopleLabel(b.count) + "</span></li>" +
			"<li><span>Ім&#39;я</span><span>" + escapeHtml(b.name) + "</span></li>" +
			"<li><span>Телефон</span><span>" + escapeHtml(b.phone) + "</span></li>" +
			(b.social ? "<li><span>Контакт</span><span>" + escapeHtml(b.social) + "</span></li>" : "") +
			(b.comment ? "<li><span>Коментар</span><span>" + escapeHtml(b.comment) + "</span></li>" : "") +
			"<li><span>Разом</span><span><strong>" + moneyLabel(b.total) + "</strong></span></li>" +
			"</ul>";
	}

	function renderSuccessView(b) {
		swapDrawerView(function () { renderSuccessViewNow(b); });
	}

	function renderSuccessViewNow(b) {
		if (!drawerBody) return;
		setDrawerHead("Готово", "Вас записано");
		drawerBody.innerHTML =
			'<svg class="success-mark" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="26" fill="none" stroke="#A64A2F" stroke-width="2"/><path d="M17 29l8 8 14-16" fill="none" stroke="#A64A2F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
			"<p>Ваш запис підтверджено. Номер запису:</p>" +
			'<span class="success-ref">' + escapeHtml(b.ref) + "</span>" +
			bookingSummaryHtml(b) +
			'<div class="success-note">Це демонстраційний сайт для портфоліо. Бронювання не є реальним, оплата не списувалась, а дані збережено лише у вашому браузері.</div>' +
			'<div class="dw-actions">' +
			'<button type="button" class="btn btn-primary btn-wide" id="successView">Переглянути мій запис</button>' +
			'<button type="button" class="btn btn-ghost btn-wide" id="successHome">Повернутися на головну</button>' +
			"</div>";
		var viewBtn = byId("successView");
		var homeBtn = byId("successHome");
		if (viewBtn) viewBtn.addEventListener("click", renderMyBookingView);
		if (homeBtn) homeBtn.addEventListener("click", function () {
			closeDrawer();
			window.scrollTo({ top: 0, behavior: "smooth" });
		});
	}

	/* ---------- Drawer view: Мій запис ---------- */

	function renderMyBookingView() {
		swapDrawerView(renderMyBookingViewNow);
	}

	function renderMyBookingViewNow() {
		if (!drawerBody) return;
		var b = loadBooking();
		setDrawerHead("Мій запис", b ? "Запис " + b.ref : "Поки порожньо");

		if (!b) {
			drawerBody.innerHTML =
				'<div class="mybk-empty">' +
				'<p class="serif">У вас ще немає активного запису.</p>' +
				"<p>Оберіть майстерню, дату й час — і ваш запис з'явиться тут. Він зберігається в цьому браузері навіть після перезавантаження сторінки.</p>" +
				'<button type="button" class="btn btn-primary" id="mybkGo">Обрати майстерню</button>' +
				"</div>";
			var goBtn = byId("mybkGo");
			if (goBtn) goBtn.addEventListener("click", function () {
				closeDrawer();
				var sec = byId("maisterni");
				if (sec) sec.scrollIntoView({ behavior: "smooth" });
			});
			return;
		}

		var w = getWorkshop(b.workshopId);
		drawerBody.innerHTML =
			'<span class="mybk-status">Активний запис</span>' +
			bookingSummaryHtml(b) +
			'<div class="mybk-edit-block">' +
			'<p class="dw-sub">Перенести на іншу дату</p>' +
			'<div class="bf-row">' +
			'<div class="bf-field"><label class="bf-label" for="mbDate">Нова дата</label><select id="mbDate" class="bf-select"></select></div>' +
			'<div class="bf-field"><label class="bf-label" for="mbTime">Новий час</label><select id="mbTime" class="bf-select"></select></div>' +
			"</div>" +
			'<p class="bf-error" id="mbErr" style="display:block"></p>' +
			'<div class="dw-actions">' +
			'<button type="button" class="btn btn-ghost btn-wide" id="mbSave">Зберегти нову дату</button>' +
			'<button type="button" class="btn btn-line" id="mbCancel">Скасувати запис</button>' +
			"</div>" +
			'<div class="mybk-confirm" id="mbConfirm" hidden>' +
			"<p>Скасувати запис " + escapeHtml(b.ref) + "? Місце звільниться для інших.</p>" +
			'<div class="dw-actions">' +
			'<button type="button" class="btn btn-primary" id="mbCancelYes">Так, скасувати</button>' +
			'<button type="button" class="btn btn-ghost" id="mbCancelNo">Залишити запис</button>' +
			"</div></div></div>";

		var mbDate = byId("mbDate");
		var mbTime = byId("mbTime");
		var mbErr = byId("mbErr");
		var mbSave = byId("mbSave");
		var mbCancel = byId("mbCancel");
		var mbConfirm = byId("mbConfirm");
		var needed = neededSeats(w, b.count);
		if (mbDate && mbTime) {
			fillDateSelect(mbDate, w, needed, b.date);
			fillTimeSelect(mbTime, w, mbDate.value || b.date, needed, b.time);
			mbDate.addEventListener("change", function () {
				fillTimeSelect(mbTime, w, mbDate.value, needed, "");
				if (mbErr) mbErr.textContent = "";
			});
			mbTime.addEventListener("change", function () {
				if (mbErr) mbErr.textContent = "";
			});
		}
		if (mbSave) mbSave.addEventListener("click", function () {
			if (!mbDate || !mbTime) return;
			if (!mbDate.value || !mbTime.value) {
				if (mbErr) mbErr.textContent = "Оберіть нову дату й час.";
				return;
			}
			var slot = findSlot(w.id, mbDate.value, mbTime.value);
			if (!slot || slot.left < needed) {
				if (mbErr) mbErr.textContent = "На цей час місць немає — оберіть інший.";
				return;
			}
			b.date = mbDate.value;
			b.time = mbTime.value;
			saveBooking(b);
			renderMyBookingView();
		});
		if (mbCancel && mbConfirm) mbCancel.addEventListener("click", function () {
			mbConfirm.hidden = false;
			var yes = byId("mbCancelYes");
			if (yes) yes.focus();
		});
		var yesBtn = byId("mbCancelYes");
		var noBtn = byId("mbCancelNo");
		if (yesBtn) yesBtn.addEventListener("click", function () {
			clearBooking();
			updateBookingDot();
			renderMyBookingView();
		});
		if (noBtn && mbConfirm) noBtn.addEventListener("click", function () {
			mbConfirm.hidden = true;
		});
	}

	function openMyBookingDrawer() {
		renderMyBookingView();
		openDrawer();
	}

	/* ---------- Header actions ---------- */

	function initHeaderActions() {
		var wordmark = document.querySelector(".wordmark");
		if (wordmark) wordmark.addEventListener("click", function (e) {
			e.preventDefault();
			var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
		});
		var headerBook = byId("headerBookBtn");
		var mobileBook = byId("mobileBookBtn");
		var myBooking = byId("myBookingBtn");
		var mobileMy = byId("mobileMyBookingBtn");
		function bookNow() {
			openBookingDrawer({
				wsId: schedWs.id,
				date: schedDate || undefined,
				time: schedTime || undefined,
				count: schedCountVal
			});
		}
		if (headerBook) headerBook.addEventListener("click", bookNow);
		if (mobileBook) mobileBook.addEventListener("click", function () {
			closeMenu();
			bookNow();
		});
		if (myBooking) myBooking.addEventListener("click", openMyBookingDrawer);
		if (mobileMy) mobileMy.addEventListener("click", function () {
			closeMenu();
			openMyBookingDrawer();
		});
	}

	/* ---------- Footer year ---------- */

	function initFooter() {
		var year = byId("footerYear");
		if (year) year.textContent = String(new Date().getFullYear());
	}

	/* ---------- Init ---------- */

	generateSlots();
	initMenu();
	initNavActive();
	initHeroInfo();
	initWorkshopRows();
	initWorkshopFilters();
	initCoffeeFilter();
	initFaq();
	initLightbox();
	initPrivacy();
	initReveal();
	initSchedule();
	initDrawer();
	initHeaderActions();
	initFooter();
	updateBookingDot();
})();
