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
  let musicState = "paused";
  let playAttempt = 0;

  function setMusicState(state, label) {
    musicState = state;
    const labelNode = musicToggle.querySelector(".music-label");
    musicToggle.setAttribute("aria-label", label);
    musicToggle.setAttribute("aria-pressed", String(state === "playing"));
    musicToggle.dataset.state = state;
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
      ? 'Read One Last Note <span aria-hidden="true">↗</span>'
      : 'Got it <span aria-hidden="true">✳</span>';
    giftReveal.hidden = isOpen;
    giftCard.classList.toggle("is-open", !isOpen);
    if (!isOpen) giftReveal.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "nearest" });
  });

  musicToggle.addEventListener("click", async () => {
    if (!music || !musicToggle) return;

    if (musicState === "loading" || musicState === "playing") {
      playAttempt += 1;
      music.pause();
      setMusicState("paused", "Background music");
      return;
    }

    const attempt = ++playAttempt;
    setMusicState("loading", "Loading music…");
    try {
      await music.play();
      if (attempt === playAttempt) {
        setMusicState("playing", "Music playing");
      }
    } catch (error) {
      if (attempt === playAttempt) {
        setMusicState("error", "Music unavailable · try again");
        console.error("Background music could not be played.", error);
      }
    }
  });

  music.addEventListener("error", () => {
    if (musicState !== "paused") {
      setMusicState("error", "Music unavailable · try again");
    }
  });

  music.addEventListener("pause", () => {
    if (music.ended) return;
    if (musicState !== "error" && musicState !== "paused") {
      setMusicState("paused", "Background music");
    }
  });

  music.addEventListener("play", () => {
    if (!music.paused && musicState !== "paused" && musicState !== "error") {
      setMusicState("loading", "Loading music…");
    }
  });

  music.addEventListener("playing", () => {
    if (!music.paused && musicState !== "paused" && musicState !== "error") {
      setMusicState("playing", "Music playing");
    }
  });

  music.addEventListener("waiting", () => {
    if (!music.paused && musicState !== "paused" && musicState !== "error") {
      setMusicState("loading", "Loading music…");
    }
  });

  music.addEventListener("ended", () => {
    setMusicState("paused", "Background music");
  });

  setMusicState("paused", "Background music");

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
