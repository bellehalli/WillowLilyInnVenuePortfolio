(() => {
  "use strict";

  const STORAGE_KEY = "willowLilyDemoV1";
  const EVENT_KEY = "willowLilyDemoEvents";
  const DEFAULT_STATE = {
    version: 1,
    entryViewed: false,
    wedding: {
      ceremony: null,
      guestCount: 125,
      guestRange: "75–125",
      package: "Full Weekend",
      investment: 14000,
      inn: true,
      eveningPreferences: ["Dancing", "Bonfire"],
      season: "Autumn",
      originalDate: "2027-10-16",
      selectedDate: "2027-10-16"
    },
    availability: {
      originalStatus: null,
      alternatives: [
        { date: "2027-10-23", status: "AVAILABLE", package: "Full Weekend" },
        { date: "2027-10-09", status: "COURTESY HOLD", package: "One Day" },
        { date: "2027-11-06", status: "AVAILABLE", package: "Full Weekend" }
      ],
      acceptedAlternative: null,
      finalDate: null
    },
    tour: {
      requestedDate: null,
      requestedTime: null,
      firstName: "",
      partnerName: "",
      email: "",
      phone: "",
      message: ""
    },
    journey: {
      source: "Google Search",
      locationsViewed: [],
      pagesViewed: [],
      builderStarted: false,
      builderCompleted: false,
      availabilitySearched: false,
      tourRequested: false
    }
  };

  const clone = value => JSON.parse(JSON.stringify(value));
  const mergeState = saved => ({
    ...clone(DEFAULT_STATE),
    ...saved,
    wedding: { ...clone(DEFAULT_STATE.wedding), ...(saved?.wedding || {}) },
    availability: { ...clone(DEFAULT_STATE.availability), ...(saved?.availability || {}) },
    tour: { ...clone(DEFAULT_STATE.tour), ...(saved?.tour || {}) },
    journey: { ...clone(DEFAULT_STATE.journey), ...(saved?.journey || {}) }
  });

  let state;
  try { state = mergeState(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null")); }
  catch { state = clone(DEFAULT_STATE); }

  const saveState = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const page = document.documentElement.dataset.page || location.pathname;
  const formatDate = (date, options = { month: "long", day: "numeric", year: "numeric" }) => {
    if (!date) return "Date to be selected";
    const [year, month, day] = date.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", options).format(new Date(year, month - 1, day));
  };
  const money = amount => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);

  const analytics = {
    listeners: new Set(),
    track(name, detail = {}) {
      const event = { name, detail, page, at: new Date().toISOString() };
      let events = [];
      try { events = JSON.parse(sessionStorage.getItem(EVENT_KEY) || "[]"); } catch {}
      events.push(event);
      sessionStorage.setItem(EVENT_KEY, JSON.stringify(events.slice(-100)));
      window.dispatchEvent(new CustomEvent("willow:analytics", { detail: event }));
      this.listeners.forEach(listener => listener(event));
    },
    subscribe(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); },
    history() { try { return JSON.parse(sessionStorage.getItem(EVENT_KEY) || "[]"); } catch { return []; } }
  };
  window.WillowAnalytics = analytics;
  window.WillowDemo = { getState: () => clone(state), reset: () => { localStorage.removeItem(STORAGE_KEY); sessionStorage.removeItem(EVENT_KEY); location.href = "/"; } };

  const HEADER = `
  <header class="site-header" data-header>
    <button class="menu-trigger" type="button" data-menu-open aria-label="Open navigation" aria-expanded="false">Menu</button>
    <a class="wordmark" href="/" aria-label="Willow Lily home">Willow Lily<span>Inn &amp; Estate</span></a>
    <a class="header-action" href="/availability">Check your date</a>
  </header>
  <div class="menu-panel" data-menu hidden>
    <button class="menu-close" type="button" data-menu-close aria-label="Close navigation">Close</button>
    <nav aria-label="Primary navigation">
      <a href="/explore"><span>01</span>Explore the Estate</a><a href="/weddings"><span>02</span>Weddings</a><a href="/wedding-weekend"><span>03</span>The Weekend</a><a href="/inn"><span>04</span>The Inn</a><a href="/investment"><span>05</span>Investment</a><a href="/visit"><span>06</span>Plan Your Visit</a>
    </nav><p>Eight acres · Four ceremony settings · Private Inn · Up to 160 guests</p>
  </div>`;
  const FOOTER = `<footer class="site-footer"><div><p class="footer-mark">WL</p><h2>Willow Lily</h2><p>Inn &amp; Estate · Fenton, Michigan</p></div><nav aria-label="Footer navigation"><a href="/explore">The Estate</a><a href="/investment">Investment</a><a href="/availability">Availability</a><a href="/visit">Private Tours</a></nav><p class="demo-credit">A fictional venue sales-platform demonstration by A. Halliwell Studio.</p></footer>`;
  const PERSISTENT = `<a class="mobile-date-cta" href="/availability">Check your date</a><div class="wedding-drawer" data-wedding-drawer hidden><div><span>Your wedding</span><strong data-drawer-ceremony>Riverside</strong></div><a href="/build">Continue building</a></div>`;
  document.querySelector("[data-shell]")?.insertAdjacentHTML("beforeend", HEADER);
  document.querySelector("[data-footer]")?.insertAdjacentHTML("beforeend", FOOTER);
  document.querySelector("[data-persistent-ui]")?.insertAdjacentHTML("beforeend", PERSISTENT);

  const menu = document.querySelector("[data-menu]");
  const menuOpen = document.querySelector("[data-menu-open]");
  const menuClose = document.querySelector("[data-menu-close]");
  const closeMenu = () => {
    if (!menu) return;
    menu.hidden = true;
    document.body.classList.remove("no-scroll");
    menuOpen?.setAttribute("aria-expanded", "false");
    menuOpen?.focus();
  };
  menuOpen?.addEventListener("click", () => {
    menu.hidden = false;
    document.body.classList.add("no-scroll");
    menuOpen.setAttribute("aria-expanded", "true");
    menuClose?.focus();
  });
  menuClose?.addEventListener("click", closeMenu);
  menu?.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });

  const header = document.querySelector("[data-header]");
  const updateHeader = () => header?.classList.toggle("scrolled", scrollY > 24);
  addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  const path = location.pathname.replace(/\/$/, "") || "/";
  if (!state.journey.pagesViewed.includes(path)) state.journey.pagesViewed.push(path);
  if (page === "riverside" && !state.journey.locationsViewed.includes("Riverside")) state.journey.locationsViewed.push("Riverside");
  saveState();

  const pageEvents = { home: "hero_viewed", explore: "estate_explorer_opened", riverside: "estate_location_viewed", build: "builder_started", availability: "availability_started", visit: "tour_started" };
  if (pageEvents[page]) analytics.track(pageEvents[page], page === "riverside" ? { location: "Riverside" } : {});

  const entry = document.querySelector("[data-entry]");
  if (entry) {
    if (state.entryViewed) entry.remove();
    else analytics.track("entry_viewed");
    document.querySelector("[data-enter]")?.addEventListener("click", () => {
      state.entryViewed = true;
      saveState();
      entry.classList.add("dismissed");
      setTimeout(() => entry.remove(), 900);
    });
  }

  const revealObserver = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("visible"); revealObserver.unobserve(entry.target); } });
  }, { threshold: .12 }) : null;
  document.querySelectorAll(".reveal").forEach(element => revealObserver ? revealObserver.observe(element) : element.classList.add("visible"));

  const updateWeddingDrawer = () => {
    const drawer = document.querySelector("[data-wedding-drawer]");
    if (!drawer) return;
    drawer.hidden = !state.wedding.ceremony || ["build", "availability", "visit", "venue-demo"].includes(page);
    drawer.querySelector("[data-drawer-ceremony]")?.replaceChildren(state.wedding.ceremony || "Riverside");
  };
  updateWeddingDrawer();

  document.querySelectorAll("[data-save-ceremony]").forEach(button => button.addEventListener("click", () => {
    const ceremony = button.dataset.saveCeremony;
    state.wedding.ceremony = ceremony;
    if (!state.journey.locationsViewed.includes(ceremony)) state.journey.locationsViewed.push(ceremony);
    saveState();
    analytics.track("ceremony_saved", { ceremony });
    document.querySelectorAll("[data-save-label]").forEach(label => label.textContent = ceremony + " is yours.");
    document.querySelectorAll("[data-save-ceremony]").forEach(control => control.setAttribute("aria-pressed", "true"));
    updateWeddingDrawer();
  }));
  if (state.wedding.ceremony === "Riverside") {
    document.querySelectorAll("[data-save-label]").forEach(label => label.textContent = "Riverside is yours.");
    document.querySelectorAll("[data-save-ceremony]").forEach(control => control.setAttribute("aria-pressed", "true"));
  }

  document.querySelector("[data-quick-check]")?.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.wedding.originalDate = data.get("date");
    state.wedding.selectedDate = data.get("date");
    state.wedding.guestCount = Number(data.get("guests"));
    state.wedding.guestRange = state.wedding.guestCount === 75 ? "Up to 75" : state.wedding.guestCount === 125 ? "75–125" : "126–160";
    state.wedding.package = data.get("package");
    state.wedding.investment = { Sunday: 8000, "One Day": 10000, "Full Weekend": 14000 }[state.wedding.package];
    state.wedding.inn = true;
    saveState();
    analytics.track("availability_started", { source: "homepage_quick_check" });
    location.href = "/availability";
  });

  const builder = document.querySelector("[data-builder]");
  if (builder) {
    state.journey.builderStarted = true;
    saveState();
    let step = 1;
    const panels = [...document.querySelectorAll("[data-builder-step]")];
    const next = document.querySelector("[data-builder-next]");
    const back = document.querySelector("[data-builder-back]");
    const showStep = target => {
      step = Math.max(1, Math.min(7, target));
      panels.forEach(panel => panel.classList.toggle("active", Number(panel.dataset.builderStep) === step));
      document.querySelector("[data-step-number]").textContent = step;
      document.querySelector("[data-progress-bar]").style.width = (step / 7 * 100) + "%";
      back.disabled = step === 1;
      next.textContent = step === 7 ? "Reveal my wedding" : "Continue";
      document.querySelector(".builder-intro").scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const hydrateBuilder = () => {
      const setChecked = (name, value) => { const input = builder.querySelector(`[name="${name}"][value="${CSS.escape(String(value))}"]`); if (input) input.checked = true; };
      setChecked("guests", state.wedding.guestCount);
      setChecked("ceremony", state.wedding.ceremony || "Riverside");
      setChecked("package", state.wedding.package);
      setChecked("season", state.wedding.season);
      builder.elements.weddingDate.value = state.wedding.originalDate || "2027-10-16";
      builder.querySelectorAll('[name="evening"]').forEach(input => input.checked = state.wedding.eveningPreferences.includes(input.value));
    };
    hydrateBuilder();
    const captureBuilder = () => {
      const form = new FormData(builder);
      const guestInput = builder.querySelector('[name="guests"]:checked');
      const packageInput = builder.querySelector('[name="package"]:checked');
      state.wedding.guestCount = Number(form.get("guests"));
      state.wedding.guestRange = guestInput?.dataset.range || "75–125";
      state.wedding.ceremony = form.get("ceremony") || "Riverside";
      state.wedding.package = form.get("package") || "Full Weekend";
      state.wedding.investment = Number(packageInput?.dataset.price || 14000);
      state.wedding.inn = state.wedding.package === "Full Weekend" || true;
      state.wedding.eveningPreferences = form.getAll("evening");
      state.wedding.season = form.get("season") || "Autumn";
      state.wedding.originalDate = form.get("weddingDate");
      state.wedding.selectedDate = form.get("weddingDate");
      saveState();
    };
    next.addEventListener("click", () => {
      captureBuilder();
      if (step < 7) {
        const eventMap = { 1: "guest_count_selected", 2: "ceremony_saved", 3: "package_selected", 6: "season_selected" };
        if (eventMap[step]) analytics.track(eventMap[step], { wedding: clone(state.wedding) });
        showStep(step + 1);
      } else {
        state.journey.builderCompleted = true;
        saveState();
        analytics.track("builder_completed", { investment: state.wedding.investment });
        builder.hidden = true;
        document.querySelector(".builder-intro").hidden = true;
        renderSummary();
        const summary = document.querySelector("[data-summary]");
        summary.hidden = false;
        summary.scrollIntoView({ behavior: "smooth" });
        analytics.track("wedding_summary_viewed");
      }
    });
    back.addEventListener("click", () => showStep(step - 1));
    const renderSummary = () => {
      document.querySelector("[data-summary-date]").textContent = formatDate(state.wedding.selectedDate);
      document.querySelector("[data-summary-ceremony]").textContent = state.wedding.ceremony;
      document.querySelector("[data-summary-guests]").textContent = state.wedding.guestCount + " guests";
      document.querySelector("[data-summary-package]").textContent = state.wedding.package;
      document.querySelector("[data-summary-evening]").textContent = state.wedding.eveningPreferences.join(" + ") || "A quiet close";
      document.querySelector("[data-summary-season]").textContent = state.wedding.season;
      document.querySelector("[data-summary-price]").textContent = money(state.wedding.investment);
    };
    document.querySelector("[data-edit-wedding]")?.addEventListener("click", () => {
      document.querySelector("[data-summary]").hidden = true;
      builder.hidden = false;
      document.querySelector(".builder-intro").hidden = false;
      showStep(1);
    });
    document.querySelector("[data-share-wedding]")?.addEventListener("click", async event => {
      const share = { title: "Our Willow Lily Wedding", text: `${formatDate(state.wedding.selectedDate)} · ${state.wedding.ceremony} · ${state.wedding.package}`, url: location.href };
      try { if (navigator.share) await navigator.share(share); else { await navigator.clipboard.writeText(share.text + " " + share.url); event.currentTarget.textContent = "Wedding copied"; } } catch {}
    });
  }

  const dateSearch = document.querySelector("[data-date-search]");
  if (dateSearch) {
    const input = dateSearch.elements.date;
    input.value = state.wedding.selectedDate || state.wedding.originalDate || "2027-10-16";
    document.querySelector("[data-requested-date]").textContent = formatDate(input.value);
    const checkDate = date => {
      state.wedding.originalDate ||= date;
      state.wedding.selectedDate = date;
      state.journey.availabilitySearched = true;
      const reserved = date === "2027-10-16";
      state.availability.originalStatus = reserved ? "RESERVED" : "AVAILABLE";
      saveState();
      analytics.track("availability_searched", { date });
      analytics.track("date_checked", { date, status: state.availability.originalStatus });
      const result = document.querySelector("[data-date-result]");
      const alternatives = document.querySelector("[data-alternatives]");
      const available = document.querySelector("[data-available]");
      if (reserved) {
        result.className = "date-result reserved";
        result.innerHTML = `<p class="kicker">October 16, 2027</p><h2>That weekend has<br>been reserved.</h2><p>Nothing about your wedding needs to be reconsidered. Let’s move the date—not the vision.</p>`;
        alternatives.hidden = false;
        available.hidden = true;
        analytics.track("date_unavailable", { date });
        analytics.track("alternative_dates_shown", { count: state.availability.alternatives.length });
      } else {
        result.hidden = true;
        alternatives.hidden = true;
        available.hidden = false;
        document.querySelector("[data-final-date]").textContent = formatDate(date, { month: "long", day: "numeric" });
        state.availability.finalDate = date;
        saveState();
        analytics.track("date_available", { date });
      }
    };
    dateSearch.addEventListener("submit", event => { event.preventDefault(); checkDate(input.value); });
    document.querySelectorAll("[data-alternative]").forEach(button => button.addEventListener("click", () => {
      const date = button.dataset.alternative;
      if (date === "2027-10-09") {
        input.value = date;
        const result = document.querySelector("[data-date-result]");
        result.hidden = false;
        result.className = "date-result";
        result.innerHTML = '<p class="kicker">Courtesy hold</p><h2>October 9 is being considered.</h2><p>Choose an available weekend for the strongest next step, or contact the venue when this demonstration becomes a real integration.</p>';
        return;
      }
      state.availability.acceptedAlternative = date;
      state.availability.finalDate = date;
      state.wedding.selectedDate = date;
      saveState();
      analytics.track("alternative_date_selected", { original: state.wedding.originalDate, alternative: date });
      document.querySelector("[data-date-result]").hidden = true;
      document.querySelector("[data-alternatives]").hidden = true;
      document.querySelector("[data-available]").hidden = false;
      document.querySelector("[data-final-date]").textContent = formatDate(date, { month: "long", day: "numeric" });
      analytics.track("date_available", { date });
      document.querySelector("[data-available]").scrollIntoView({ behavior: "smooth", block: "center" });
    }));
    document.querySelector("[data-more-dates]")?.addEventListener("click", () => {
      document.querySelector("[data-available]").hidden = true;
      document.querySelector("[data-alternatives]").hidden = false;
    });
  }

  const tourForm = document.querySelector("[data-tour-form]");
  if (tourForm) {
    document.querySelector("[data-tour-wedding-date]").textContent = formatDate(state.availability.finalDate || state.wedding.selectedDate || "2027-10-23");
    document.querySelector("[data-tour-ceremony]").textContent = state.wedding.ceremony || "Riverside";
    tourForm.addEventListener("change", event => {
      if (event.target.name === "time") analytics.track("tour_slot_selected", { time: event.target.value });
    });
    tourForm.addEventListener("submit", event => {
      event.preventDefault();
      const data = new FormData(tourForm);
      state.tour = {
        requestedDate: "2026-10-03",
        requestedTime: data.get("time"),
        firstName: String(data.get("firstName")).trim(),
        partnerName: String(data.get("partnerName")).trim(),
        email: String(data.get("email")).trim(),
        phone: String(data.get("phone")).trim(),
        message: String(data.get("message")).trim()
      };
      state.journey.tourRequested = true;
      state.availability.finalDate ||= state.availability.acceptedAlternative || state.wedding.selectedDate || "2027-10-23";
      saveState();
      analytics.track("tour_requested", { time: state.tour.requestedTime, weddingDate: state.availability.finalDate });
      document.querySelector("[data-tour-form-view]").hidden = true;
      const confirmation = document.querySelector("[data-tour-confirmation]");
      confirmation.hidden = false;
      document.querySelector("[data-confirm-name]").textContent = state.tour.firstName + " + " + state.tour.partnerName;
      document.querySelector("[data-confirm-time]").textContent = state.tour.requestedTime;
      document.querySelector("[data-confirm-wedding]").textContent = formatDate(state.availability.finalDate);
      confirmation.scrollIntoView({ block: "start" });
    });
    document.querySelector("[data-calendar]")?.addEventListener("click", () => {
      const ics = ["BEGIN:VCALENDAR","VERSION:2.0","BEGIN:VEVENT","DTSTART:20261003T160000Z","DTEND:20261003T170000Z","SUMMARY:Willow Lily Private Tour — Portfolio Demo","DESCRIPTION:Fictional portfolio demonstration. No real appointment or address.","LOCATION:Fenton, Michigan — Fictional Venue Demo","END:VEVENT","END:VCALENDAR"].join("\r\n");
      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
      link.download = "willow-lily-demo-tour.ics";
      link.click();
      URL.revokeObjectURL(link.href);
    });
    document.querySelector("[data-directions]")?.addEventListener("click", event => {
      analytics.track("directions_clicked");
      event.currentTarget.textContent = "Fictional venue · no address";
    });
  }

  if (page === "venue-demo") {
    const names = state.tour.firstName ? state.tour.firstName + " + " + (state.tour.partnerName || "Partner") : "Sarah + James";
    document.querySelector("[data-lead-names]").textContent = names;
    document.querySelector("[data-lead-date]").textContent = formatDate(state.availability.finalDate || "2027-10-23");
    document.querySelector("[data-lead-tour]").textContent = state.tour.requestedTime || "12:00 PM";
  }

  document.querySelectorAll('a[href="/inn"]').forEach(link => link.addEventListener("click", () => analytics.track("inn_clicked")));
})();
