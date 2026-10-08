(() => {
  const welcome = document.getElementById("welcome");
  const site = document.getElementById("site-content");
  const openSurprise = document.getElementById("open-surprise");
  const openGift = document.getElementById("open-gift");
  const giftReveal = document.getElementById("gift-reveal");
  const giftCard = document.getElementById("gift-card");
  const music = document.getElementById("birthday-music");
  const musicToggle = document.getElementById("music-toggle");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function safeMusicState(label) {
    const labelNode = musicToggle.querySelector(".music-label");
    musicToggle.setAttribute("aria-label", label);
    labelNode.textContent = label;
  }

  function createConfetti() {
    if (reducedMotion) return;
    const colors = ["rose", "gold", "lavender"];
    for (let index = 0; index < 18; index += 1) {
      const piece = document.createElement("span");
      const angle = (Math.PI * 2 * index) / 18 + Math.random() * 0.25;
      const distance = 55 + Math.random() * 115;
      piece.className = `confetti-piece confetti-${colors[index % colors.length]}`;
      piece.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
      piece.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
      piece.style.setProperty("--rotation", `${Math.round(Math.random() * 420 - 210)}deg`);
      document.body.appendChild(piece);
      window.setTimeout(() => piece.remove(), 1100);
    }
  }

  openSurprise.addEventListener("click", () => {
    site.inert = false;
    site.classList.add("is-visible");
    welcome.classList.add("is-leaving");
    createConfetti();
    window.setTimeout(() => {
      welcome.hidden = true;
      document.getElementById("birthday-title").focus({ preventScroll: true });
    }, 700);
  });

  document.getElementById("birthday-title").setAttribute("tabindex", "-1");

  openGift.addEventListener("click", () => {
    const isOpen = openGift.getAttribute("aria-expanded") === "true";
    openGift.setAttribute("aria-expanded", String(!isOpen));
    openGift.innerHTML = isOpen
      ? 'Open Your Gift <span aria-hidden="true">↗</span>'
      : 'That was sweet <span aria-hidden="true">✳</span>';
    giftReveal.hidden = isOpen;
    giftCard.classList.toggle("is-open", !isOpen);
    if (!isOpen) giftReveal.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "nearest" });
  });

  function getTimeZoneOffsetMinutes(date, timeZone) {
    const offsetParts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(date);
    const zoneName = offsetParts.find((part) => part.type === "timeZoneName")?.value || "GMT+00:00";
    const match = zoneName.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/i);
    if (!match) return 0;
    const sign = match[1] === "+" ? 1 : -1;
    const hours = Number(match[2]) || 0;
    const minutes = Number(match[3]) || 0;
    return sign * (hours * 60 + minutes);
  }

  function getIndiaParts(date) {
    const parts = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    }).formatToParts(date);
    return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  }

  function updateCountdown() {
    const now = new Date();
    const india = getIndiaParts(now);
    const inKolkata = {
      year: Number(india.year),
      month: Number(india.month),
      day: Number(india.day),
    };
    const isBirthday = inKolkata.month === 11 && inKolkata.day === 14;
    const clock = document.getElementById("countdown-clock");
    const today = document.getElementById("countdown-today");

    if (isBirthday) {
      clock.hidden = true;
      today.hidden = false;
      return;
    }

    clock.hidden = false;
    today.hidden = true;
    const offsetMinutes = getTimeZoneOffsetMinutes(now, "Asia/Kolkata");
    const targetYear = inKolkata.month > 11 || (inKolkata.month === 11 && inKolkata.day > 14)
      ? inKolkata.year + 1
      : inKolkata.year;
    const targetUtcMs = Date.UTC(targetYear, 10, 14) - offsetMinutes * 60 * 1000;
    const remaining = Math.max(0, targetUtcMs - now.getTime());
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    document.getElementById("days").textContent = String(days).padStart(3, "0");
    document.getElementById("hours").textContent = String(hours).padStart(2, "0");
    document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
    document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
  }

  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  musicToggle.addEventListener("click", async () => {
    if (!music || !musicToggle) return;

    if (!music.paused) {
      music.pause();
      musicToggle.setAttribute("aria-pressed", "false");
      safeMusicState("Afreen Afreen · paused");
      return;
    }

    try {
      await music.play();
      musicToggle.setAttribute("aria-pressed", "true");
      safeMusicState("Afreen Afreen · playing");
    } catch (error) {
      musicToggle.setAttribute("aria-pressed", "false");
      safeMusicState("Add music.mp3");
    }
  });

  music.addEventListener("error", () => {
    if (!music.paused) return;
    safeMusicState("Add music.mp3");
    musicToggle.setAttribute("aria-pressed", "false");
  });

  music.addEventListener("pause", () => {
    if (music.ended) return;
    musicToggle.setAttribute("aria-pressed", "false");
    safeMusicState("Afreen Afreen · paused");
  });

  music.addEventListener("play", () => {
    musicToggle.setAttribute("aria-pressed", "true");
    safeMusicState("Afreen Afreen · playing");
  });

  if (music && music.error) {
    safeMusicState("Add music.mp3");
  } else {
    safeMusicState("Afreen Afreen · paused");
  }

  document.querySelectorAll(".photo-frame img").forEach((image) => {
    image.addEventListener("error", () => image.classList.add("image-missing"), { once: true });
  });

  const revealItems = document.querySelectorAll(".memory-card, .message-aside, .letter-card, .gift-card");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-revealed"));
  } else {
    revealItems.forEach((item) => item.classList.add("reveal-item"));
    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          activeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  }
})();
