/* =========================================
   NOVA AI STUDIO — SMART PRELOADER
   6 Languages + Full Video Buffer Detection
========================================= */

(() => {
  "use strict";

  const preloader = document.getElementById("novaPreloader");
  const video = document.getElementById("novaFilmVideo");

  if (!preloader || !video) return;

  const label = document.getElementById("novaPreloaderLabel");
  const bar = document.getElementById("novaPreloaderBar");
  const percent = document.getElementById("novaPreloaderPercent");
  const message = document.getElementById("novaPreloaderMessage");
  const submessage = document.getElementById("novaPreloaderSubmessage");
  const languageSelect = document.getElementById("novaPreloaderLanguage");
  const continueButton = document.getElementById("novaPreloaderContinue");

  const messages = {
    en: {
      loading: "LOADING",
      continue: "Continue anyway",
      error: "The film could not be loaded.",
      items: [
        ["Preparing your experience.", "A new dimension is about to begin."],
        ["Building something beyond ordinary.", "Innovation starts with imagination."],
        ["Design meets intelligence.", "Technology becomes an experience."],
        ["Every detail matters.", "Every interaction tells a story."],
        ["Welcome to a different perspective.", "Welcome to the Nova universe."]
      ]
    },

    fa: {
      loading: "در حال بارگذاری",
      continue: "ورود به سایت",
      error: "بارگذاری فیلم با مشکل مواجه شد.",
      items: [
        ["در حال آماده‌سازی تجربه شما هستیم.", "بُعدی تازه در آستانه آغاز است."],
        ["در حال ساخت چیزی فراتر از معمول.", "نوآوری با تخیل آغاز می‌شود."],
        ["تلاقی طراحی و هوشمندی.", "فناوری به یک تجربه تبدیل می‌شود."],
        ["هر جزئیاتی اهمیت دارد.", "هر تعامل، داستانی روایت می‌کند."],
        ["به نگاهی متفاوت خوش آمدید.", "به جهان نوا خوش آمدید."]
      ]
    },

    ar: {
      loading: "جارٍ التحميل",
      continue: "المتابعة إلى الموقع",
      error: "تعذر تحميل الفيلم.",
      items: [
        ["نعمل على تجهيز تجربتك.", "بُعد جديد على وشك أن يبدأ."],
        ["نبني شيئاً يتجاوز المألوف.", "يبدأ الابتكار بالخيال."],
        ["حيث يلتقي التصميم بالذكاء.", "تتحول التكنولوجيا إلى تجربة."],
        ["كل تفصيل مهم.", "كل تفاعل يروي قصة."],
        ["مرحباً بك في منظور مختلف.", "مرحباً بك في عالم نوفا."]
      ]
    },

    fr: {
      loading: "CHARGEMENT",
      continue: "Continuer",
      error: "Impossible de charger le film.",
      items: [
        ["Préparation de votre expérience.", "Une nouvelle dimension va commencer."],
        ["Créer quelque chose d'exceptionnel.", "L'innovation commence par l'imagination."],
        ["Le design rencontre l'intelligence.", "La technologie devient une expérience."],
        ["Chaque détail compte.", "Chaque interaction raconte une histoire."],
        ["Bienvenue dans une nouvelle perspective.", "Bienvenue dans l'univers Nova."]
      ]
    },

    de: {
      loading: "WIRD GELADEN",
      continue: "Weiter zur Website",
      error: "Der Film konnte nicht geladen werden.",
      items: [
        ["Wir bereiten Ihr Erlebnis vor.", "Eine neue Dimension beginnt gleich."],
        ["Wir schaffen etwas Außergewöhnliches.", "Innovation beginnt mit Vorstellungskraft."],
        ["Design trifft auf Intelligenz.", "Technologie wird zum Erlebnis."],
        ["Jedes Detail zählt.", "Jede Interaktion erzählt eine Geschichte."],
        ["Willkommen in einer neuen Perspektive.", "Willkommen im Nova-Universum."]
      ]
    },

    zh: {
      loading: "正在加载",
      continue: "继续进入网站",
      error: "影片无法加载。",
      items: [
        ["正在为您准备体验。", "一个全新的维度即将开启。"],
        ["创造超越寻常的体验。", "创新始于想象。"],
        ["设计与智能相遇。", "科技成为一种体验。"],
        ["每个细节都很重要。", "每一次互动都在讲述故事。"],
        ["欢迎体验不同的视角。", "欢迎来到 Nova 宇宙。"]
      ]
    }
  };

  const locales = {
    en: "en",
    fa: "fa-IR",
    ar: "ar",
    fr: "fr",
    de: "de",
    zh: "zh-CN"
  };

  let currentLanguage = "en";
  let currentMessage = 0;
  let messageTimer = null;
  let finished = false;
  let videoFailed = false;
   let downloadObjectUrl = null;
let downloadStarted = false;

  function getSavedLanguage() {
    try {
      return localStorage.getItem("nova-language") || "en";
    } catch {
      return "en";
    }
  }

  function renderMessage(index) {
    const content = messages[currentLanguage].items[index];

    message.textContent = content[0];
    submessage.textContent = content[1];
  }

  function changeLanguage(language) {
    currentLanguage = messages[language] ? language : "en";

    const translation = messages[currentLanguage];

    label.textContent = translation.loading;
    continueButton.textContent = translation.continue;

    preloader.dir = ["fa", "ar"].includes(currentLanguage)
      ? "rtl"
      : "ltr";

    languageSelect.value = currentLanguage;

    renderMessage(currentMessage);

    try {
      localStorage.setItem("nova-language", currentLanguage);
    } catch {}

    // Synchronize with the original website language selector.
    const siteLanguageSelect = document.getElementById("languageSelect");

    if (siteLanguageSelect) {
      siteLanguageSelect.value = currentLanguage;
      siteLanguageSelect.dispatchEvent(new Event("change", {
        bubbles: true
      }));
    } else {
      document.documentElement.lang = currentLanguage;
      document.documentElement.dir = preloader.dir;
    }
  }

  function rotateMessages() {
    clearInterval(messageTimer);

    messageTimer = setInterval(() => {
      message.classList.add("is-changing");

      setTimeout(() => {
        currentMessage =
          (currentMessage + 1) % messages[currentLanguage].items.length;

        renderMessage(currentMessage);
        message.classList.remove("is-changing");
      }, 350);

    }, 5500);
  }

function setProgress(value) {
  value = Math.max(0, Math.min(100, Math.floor(value)));

  percent.textContent = new Intl.NumberFormat(
    locales[currentLanguage]
  ).format(value);

  bar.style.width = `${value}%`;
}

async function downloadFullVideo() {
  if (downloadStarted || finished) return;

  downloadStarted = true;

  try {
    const source = video.querySelector("source");

const videoUrl = new URL(
  source ? source.getAttribute("src") : video.src,
  document.baseURI
).href;

    const response = await fetch(videoUrl, {
      cache: "force-cache"
    });

    if (!response.ok) {
      throw new Error("Video download failed");
    }

    const total = Number(
      response.headers.get("content-length")
    );

    if (!response.body || !total) {
      const blob = await response.blob();

      setProgress(100);

      await prepareVideo(blob);
      return;
    }

    const reader = response.body.getReader();

    const chunks = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      received += value.length;

      setProgress((received / total) * 100);
    }

    const blob = new Blob(chunks, {
      type: response.headers.get("content-type") || "video/mp4"
    });

    await prepareVideo(blob);

  } catch (error) {
    console.error("Nova video loading:", error);

    videoFailed = true;

    message.textContent = messages[currentLanguage].error;
    submessage.textContent = "";

    showContinueButton();
  }
}

async function prepareVideo(blob) {
  downloadObjectUrl = URL.createObjectURL(blob);

  video.src = downloadObjectUrl;
  video.load();

  await new Promise((resolve, reject) => {
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      resolve();
      return;
    }

    video.addEventListener("loadeddata", resolve, {
      once: true
    });

    video.addEventListener("error", reject, {
      once: true
    });
  });

  setProgress(100);
  finishPreloader();
}

function finishPreloader() {
  if (finished) return;

  finished = true;

  clearInterval(messageTimer);

  preloader.classList.add("is-hidden");
  preloader.setAttribute("aria-hidden", "true");

  setTimeout(() => {
    document.body.classList.remove("nova-loading-active");
    preloader.remove();
  }, 900);
}

  function showContinueButton() {
    continueButton.hidden = false;
  }

  function handleVideoError() {
    videoFailed = true;

    message.textContent = messages[currentLanguage].error;
    submessage.textContent = "";
    showContinueButton();
  }

  // Initial language
  changeLanguage(getSavedLanguage());

  // Language changes do not restart video loading.
  languageSelect.addEventListener("change", event => {
    currentMessage = 0;
    changeLanguage(event.target.value);
  });

  continueButton.addEventListener("click", finishPreloader);

  // Lock scrolling while loading.
  document.body.classList.add("nova-loading-active");

// Handle video errors.
video.addEventListener("error", handleVideoError);

  // Show a manual fallback if loading takes too long.
  setTimeout(() => {
    if (!finished) showContinueButton();
  }, 45000);

  renderMessage(0);
  rotateMessages();

// Download the complete cinematic video.
downloadFullVideo();

})();
