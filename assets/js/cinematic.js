
/* =============================================
   NOVA AI STUDIO — CINEMATIC SCROLL EXPERIENCE
   Scroll-synchronised video + GSAP + 6 languages
============================================= */

(() => {
  "use strict";

  const section = document.getElementById("nova-film");
  const video = document.getElementById("novaFilmVideo");

  if (!section || !video || !window.gsap || !window.ScrollTrigger) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const nodes = {
    kicker: document.getElementById("novaFilmKicker"),
    title: document.getElementById("novaFilmTitle"),
    subtitle: document.getElementById("novaFilmSubtitle"),
    counter: document.getElementById("novaFilmCounter"),
    progress: document.getElementById("novaFilmProgress"),
    time: document.getElementById("novaFilmTime"),
    hint: document.getElementById("novaFilmHint"),
    brand: document.getElementById("novaFilmBrand"),
    copy: document.getElementById("novaFilmCopy"),
    loading: document.getElementById("novaFilmLoading")
  };

  const requiredNodes = Object.values(nodes);

  if (requiredNodes.some(node => !node)) {
    console.warn("NOVA CINEMATIC: Required HTML elements are missing.");
    return;
  }

  /* =============================================
     MULTILINGUAL CONTENT
  ============================================= */

  const copy = {
    en: [
      ["Enter the Nova Universe.", "A new dimension of digital creation."],
      ["Beyond the Ordinary.", "Where imagination meets precision."],
      ["Ideas Become Connected.", "Intelligence is built through connection."],
      ["Shape What Comes Next.", "Transforming signals into possibility."],
      ["Designed to Create Impact.", "Technology, design and meaningful experiences."],
      ["This Is Nova.", "Independent thinking. Intelligent building."]
    ],

    fa: [
      ["به جهان نوا وارد شوید.", "بُعدی تازه از آفرینش دیجیتال."],
      ["فراتر از معمول.", "جایی که تخیل با دقت پیوند می‌خورد."],
      ["ایده‌ها به هم متصل می‌شوند.", "هوشمندی از دل ارتباط شکل می‌گیرد."],
      ["آینده را شکل دهید.", "تبدیل داده‌ها به امکان‌های تازه."],
      ["برای خلق تأثیر طراحی شده.", "فناوری، طراحی و تجربه‌های معنادار."],
      ["این نواست.", "اندیشه مستقل. ساخت هوشمندانه."]
    ],

    ar: [
      ["ادخل عالم نوفا.", "بُعد جديد من الإبداع الرقمي."],
      ["ما وراء المألوف.", "حيث يلتقي الخيال بالدقة."],
      ["الأفكار تصبح مترابطة.", "الذكاء ينمو من خلال التواصل."],
      ["اصنع ملامح القادم.", "نحوّل البيانات إلى آفاق جديدة."],
      ["مصمم لصناعة الأثر.", "تقنية وتصميم وتجارب ذات معنى."],
      ["هذه هي نوفا.", "تفكير مستقل. بناء ذكي."]
    ],

    fr: [
      ["Entrez dans l’univers Nova.", "Une nouvelle dimension de création numérique."],
      ["Au-delà de l’ordinaire.", "L’imagination rencontre la précision."],
      ["Les idées se connectent.", "L’intelligence naît des connexions."],
      ["Façonnez la suite.", "Transformer les signaux en possibilités."],
      ["Conçu pour créer un impact.", "Technologie, design et expériences utiles."],
      ["Voici Nova.", "Une pensée indépendante. Une création intelligente."]
    ],

    de: [
      ["Willkommen im Nova-Universum.", "Eine neue Dimension digitaler Kreativität."],
      ["Jenseits des Gewöhnlichen.", "Wo Vorstellungskraft auf Präzision trifft."],
      ["Ideen werden vernetzt.", "Intelligenz entsteht durch Verbindung."],
      ["Gestalte, was als Nächstes kommt.", "Aus Daten werden neue Möglichkeiten."],
      ["Entwickelt, um Wirkung zu schaffen.", "Technologie, Design und sinnvolle Erlebnisse."],
      ["Das ist Nova.", "Unabhängig denken. Intelligent gestalten."]
    ],

    zh: [
      ["进入 Nova 宇宙。", "数字创意的全新维度。"],
      ["超越寻常。", "让想象力与精准相遇。"],
      ["让创意彼此连接。", "连接构建智能。"],
      ["塑造下一个未来。", "将信号转化为无限可能。"],
      ["为创造影响而设计。", "科技、设计与有意义的体验。"],
      ["这就是 Nova。", "独立思考，智能创造。"]
    ]
  };

  const labels = {
    en: ["SCROLL TO MOVE THROUGH THE FILM", "CHAPTER"],
    fa: ["با اسکرول در فیلم حرکت کنید", "فصل"],
    ar: ["مرّر للتنقل داخل الفيلم", "الفصل"],
    fr: ["FAITES DÉFILER POUR AVANCER", "CHAPITRE"],
    de: ["SCROLLEN, UM DEN FILM ZU STEUERN", "KAPITEL"],
    zh: ["滚动以推进影片", "章节"]
  };

  /* =============================================
     CONFIGURATION
  ============================================= */

  const chapterPoints = [
    0,
    0.185,
    0.365,
    0.545,
    0.735,
    0.82
  ];

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const mobile = window.matchMedia(
    "(max-width: 700px)"
  ).matches;

  const fps = 24;

  let duration = 27.166667;
  let targetTime = 0;
  let seekFrame = 0;
  let seeking = false;
  let metadataReady = false;
  let lastFrame = -1;
  let activeChapter = -1;
  let timeline = null;

  /* =============================================
     HELPERS
  ============================================= */

  const formatTime = seconds => {
    const safe = Math.max(0, seconds || 0);

    return (
      `${String(Math.floor(safe / 60)).padStart(2, "0")}:` +
      `${String(Math.floor(safe % 60)).padStart(2, "0")}`
    );
  };

  function currentLanguage() {
    const lang = document.documentElement.lang || "en";

    return copy[lang] ? lang : "en";
  }

  /* =============================================
     CHAPTER RENDERING
  ============================================= */

  function renderChapter(index, force = false) {
    const chapter = Math.max(0, Math.min(5, index));

    if (!force && chapter === activeChapter) return;

    activeChapter = chapter;

    const lang = currentLanguage();
    const rtl = ["fa", "ar"].includes(lang);

    const [title, subtitle] = copy[lang][chapter];

    nodes.kicker.textContent =
      `${labels[lang][1]} ${String(chapter + 1).padStart(2, "0")}`;

    nodes.title.textContent = title;
    nodes.subtitle.textContent = subtitle;

    nodes.counter.textContent =
      `${String(chapter + 1).padStart(2, "0")} — 06`;

    nodes.hint.textContent = labels[lang][0];

    section.dir = rtl ? "rtl" : "ltr";
  }

  /* =============================================
     VIDEO SEEK ENGINE
  ============================================= */

  function requestSeek(time) {
    if (!metadataReady || !Number.isFinite(time)) return;

    targetTime = Math.max(0, Math.min(duration, time));

    if (!seekFrame) {
      seekFrame = requestAnimationFrame(flushSeek);
    }
  }

  function flushSeek() {
    seekFrame = 0;

    if (!metadataReady || seeking) return;

    const frame = Math.round(targetTime * fps);

    if (frame === lastFrame) return;

    const next = Math.min(duration, frame / fps);

    if (Math.abs(video.currentTime - next) < 0.0005) {
      lastFrame = frame;
      return;
    }

    seeking = true;
    lastFrame = frame;

    try {
      video.currentTime = next;
    } catch (error) {
      seeking = false;
    }
  }

  video.addEventListener("seeked", () => {
    seeking = false;

    if (Math.abs(targetTime - video.currentTime) > 1 / fps) {
      if (!seekFrame) {
        seekFrame = requestAnimationFrame(flushSeek);
      }
    }
  });

  /* =============================================
     VIDEO METADATA
  ============================================= */

  video.addEventListener("loadedmetadata", () => {
    metadataReady = true;

    duration = Number.isFinite(video.duration)
      ? video.duration
      : duration;

    nodes.loading.classList.add("is-hidden");

    nodes.time.textContent =
      `${formatTime(0)} / ${formatTime(duration)}`;

    ScrollTrigger.refresh();
  }, { once: true });

  video.addEventListener("error", () => {
    nodes.loading.textContent = "THE FILM COULD NOT BE LOADED";
    nodes.loading.classList.add("has-error");
  });

  /* =============================================
     SCROLL PROGRESS
  ============================================= */

  function updateFromProgress(progress) {
    const p = Math.max(0, Math.min(1, progress));

    const time = p * duration;

    requestSeek(time);

    /*
      The progress ID should be on the INNER <i>
      element, not on its parent container.
    */

    nodes.progress.style.transform = `scaleX(${p})`;

    nodes.time.textContent =
      `${formatTime(time)} / ${formatTime(duration)}`;

    let chapter = 0;

    for (let i = 1; i < chapterPoints.length; i++) {
      if (p >= chapterPoints[i]) {
        chapter = i;
      }
    }

    renderChapter(chapter);
  }

  /* =============================================
     CINEMATIC MASTER TIMELINE
  ============================================= */

  function buildTimeline() {
    const total = duration;

    const master = gsap.timeline({
      defaults: {
        ease: "none"
      },

      scrollTrigger: {
        trigger: section,

        start: "top top",

        end: () =>
          `+=${Math.round(total * (mobile ? 72 : 92))}`,

        pin: ".nova-film-stage",
        pinSpacing: true,
        scrub: 0.12,
        anticipatePin: 1,
        invalidateOnRefresh: true,

        onUpdate: self => {
          updateFromProgress(self.progress);
        },

        onRefresh: self => {
          updateFromProgress(self.progress);
        }
      }
    });

    const chapterStarts = chapterPoints.map(
      point => point * total
    );

    /* =========================================
       CHAPTER TEXT ANIMATIONS
    ========================================= */

    chapterStarts.forEach((at, index) => {
      const next = chapterStarts[index + 1] ?? total;

      const hold = Math.max(
        0.12,
        Math.min(0.38, (next - at) * 0.07)
      );

      const copyStart = Math.min(
        total - 0.01,
        at + (index === 0 ? 0.12 : 0)
      );

      master.fromTo(
        nodes.copy,

        {
          autoAlpha: 0,
          y: 26,
          scale: 0.96,
          filter: "blur(12px)"
        },

        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: hold,
          ease: "power2.out",
          immediateRender: false
        },

        copyStart
      );

      if (index < 5) {
        master.to(
          nodes.copy,

          {
            autoAlpha: 0,
            y: -18,
            scale: 1.035,
            filter: "blur(10px)",

            duration: Math.min(
              0.32,
              Math.max(0.16, (next - at) * 0.06)
            ),

            ease: "power2.in"
          },

          Math.max(copyStart + hold, next - 0.38)
        );
      }
    });

    /* =========================================
       FINAL CHAPTER FADE OUT
       Chapter 6 disappears before logo reveal.
    ========================================= */

    master.to(
      nodes.copy,

      {
        autoAlpha: 0,
        y: -18,
        scale: 1.035,
        filter: "blur(10px)",
        duration: 0.45,
        ease: "power2.in"
      },

      total * 0.875
    );

    /* =========================================
       FINAL LOGO REVEAL
    ========================================= */

    master.fromTo(
      nodes.brand,

      {
        autoAlpha: 0,
        scale: 0.78,
        y: 22,
        filter: "blur(16px)"
      },

      {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.15,
        ease: "power3.out",
        immediateRender: false
      },

      total * 0.91
    );

    master.to(
      nodes.brand,

      {
        scale: 1.035,
        duration: total * 0.09,
        ease: "none"
      },

      total * 0.91
    );

    timeline = master;
  }

  /* =============================================
     INITIALIZATION
  ============================================= */

  renderChapter(0, true);

  video.pause();
  video.removeAttribute("autoplay");

  if (reducedMotion) {
    section.classList.add("is-reduced-motion");

    video.controls = true;

    nodes.loading.classList.add("is-hidden");

    nodes.hint.textContent = "USE VIDEO CONTROLS TO WATCH";

    nodes.brand.classList.add("is-visible");

  } else {
    buildTimeline();
  }

  /* =============================================
     LANGUAGE SWITCHING
  ============================================= */

  const languageSelect = document.getElementById(
    "languageSelect"
  );

  if (languageSelect) {
    languageSelect.addEventListener("change", () => {
      renderChapter(activeChapter, true);
    });
  }

  window.addEventListener("nova:languagechange", () => {
    renderChapter(activeChapter, true);
  });

  /* =============================================
     PAGE VISIBILITY
  ============================================= */

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (seekFrame) {
        cancelAnimationFrame(seekFrame);
      }

      seekFrame = 0;

    } else if (
      Math.abs(targetTime - video.currentTime) > 1 / fps
    ) {
      if (!seekFrame) {
        seekFrame = requestAnimationFrame(flushSeek);
      }
    }
  });

  /* =============================================
     CLEANUP
  ============================================= */

  window.addEventListener("pagehide", () => {
    if (seekFrame) {
      cancelAnimationFrame(seekFrame);
    }

    if (timeline) {
      timeline.scrollTrigger?.kill();
      timeline.kill();
    }

    video.pause();

  }, { once: true });

})();
