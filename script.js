// LOCK SCREEN -------------------------------------

const DOB_CORRECT = "25/02/2006";

const lockScreen = document.getElementById("lock-screen");
const dobInput = document.getElementById("dob-input");
const unlockBtn = document.getElementById("unlock-btn");
const lockMessage = document.getElementById("lock-message");

const leafletSection = document.getElementById("leaflet-transition");
const leafletWrapper = document.querySelector(".leaflet-wrapper");
const mainExperience = document.getElementById("main-experience");

// optional audio
const bgMusic = document.getElementById("bg-music");
const audioToggleBtn = document.getElementById("audio-toggle");
let musicEnabled = false;

// auto-format DD/MM/YYYY
dobInput.addEventListener("input", (e) => {
  let value = e.target.value.replace(/[^\d]/g, "");
  if (value.length >= 3 && value.length <= 4) {
    value = value.slice(0, 2) + "/" + value.slice(2);
  } else if (value.length > 4) {
    value = value.slice(0, 2) + "/" + value.slice(2, 4) + "/" + value.slice(4, 8);
  }
  e.target.value = value.slice(0, 10);
});

dobInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") unlockBtn.click();
});

unlockBtn.addEventListener("click", () => {
  const entered = dobInput.value.trim();
  if (entered === DOB_CORRECT) {
    handleCorrectUnlock();
  } else {
    handleWrongUnlock();
  }
});

function handleWrongUnlock() {
  lockMessage.textContent = "Not quite… try again 😌";
  lockMessage.style.color = "#b91c1c";

  dobInput.classList.remove("shake");
  void dobInput.offsetWidth; // force reflow
  dobInput.classList.add("shake");
}

function handleCorrectUnlock() {
  lockMessage.textContent = "Unlocked 💛";
  lockMessage.style.color = "#166534";
  unlockBtn.classList.add("unlock-glow");

  setTimeout(() => {
    lockScreen.classList.add("fade-out");
  }, 400);

  setTimeout(() => {
    lockScreen.classList.remove("active-view");
    startLeafletTransition();
  }, 1200);
}

function startLeafletTransition() {
  leafletSection.classList.remove("leaflet-hidden");
  leafletSection.classList.add("leaflet-active");

  requestAnimationFrame(() => {
    leafletWrapper.classList.add("leaflet-open");
  });

  setTimeout(() => {
    leafletSection.classList.remove("leaflet-active");
    leafletSection.classList.add("leaflet-hidden");
    mainExperience.classList.remove("main-hidden");
    mainExperience.classList.add("main-visible");
    window.scrollTo({ top: 0, behavior: "instant" });
  }, 1200);
}

// AUDIO TOGGLE ------------------------------------

if (audioToggleBtn) {
  audioToggleBtn.addEventListener("click", () => {
    if (!bgMusic) return;
    if (!musicEnabled) {
      bgMusic
        .play()
        .then(() => {
          musicEnabled = true;
          audioToggleBtn.textContent = "🔊";
        })
        .catch(() => {});
    } else {
      bgMusic.pause();
      musicEnabled = false;
      audioToggleBtn.textContent = "🔇";
    }
  });
}

// SCROLL REVEAL -----------------------------------

const revealElements = document.querySelectorAll(".scroll-reveal");

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.25 }
);

revealElements.forEach((el) => io.observe(el));

// PARALLAX CARDS ----------------------------------

const parallaxCards = document.querySelectorAll(".parallax-card");

window.addEventListener("scroll", () => {
  parallaxCards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const offset = rect.top + rect.height / 2 - window.innerHeight / 2;
    const parallax = -offset * 0.05;
    card.style.transform = `translateY(${parallax}px)`;
  });
});

// QUESTIONS ---------------------------------------

const questionCards = document.querySelectorAll(".question-card");
const prevBtn = document.getElementById("prev-question");
const nextBtn = document.getElementById("next-question");
const stepLabel = document.getElementById("step-label");
const dots = document.querySelectorAll(".step-dots .dot");

let currentStep = 1;
const totalSteps = questionCards.length;

let q1Answered = false;
let q2Answered = false;
let q3Interacted = false;

const q1Options = document.querySelectorAll("[data-q1-option]");
const q1Text = document.getElementById("q1-text");

const q2Options = document.querySelectorAll("[data-q2-option]");

const annoySlider = document.getElementById("annoy-slider");
const annoyOutput = document.getElementById("annoy-output");

function updateStepView() {
  questionCards.forEach((card) => {
    card.classList.toggle("active-question", Number(card.dataset.step) === currentStep);
  });

  stepLabel.textContent = `Question ${currentStep} of ${totalSteps}`;

  dots.forEach((dot, index) => {
    dot.classList.toggle("dot-active", index + 1 === currentStep);
  });

  prevBtn.style.visibility = currentStep === 1 ? "hidden" : "visible";
  validateCurrentStep();
}

function enableNext() {
  nextBtn.classList.remove("disabled");
}

function disableNext() {
  nextBtn.classList.add("disabled");
}

function validateCurrentStep() {
  if (currentStep === 1) {
    if (q1Answered && q1Text.value.trim().length > 0) enableNext();
    else disableNext();
  } else if (currentStep === 2) {
    if (q2Answered) enableNext();
    else disableNext();
  } else if (currentStep === 3) {
    if (q3Interacted) enableNext();
    else disableNext();
  }
}

// Q1
q1Options.forEach((btn) => {
  btn.addEventListener("click", () => {
    q1Options.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    q1Answered = true;
    validateCurrentStep();
  });
});

q1Text.addEventListener("input", () => {
  if (q1Text.value.trim().length > 0) q1Answered = true;
  validateCurrentStep();
});

// Q2
q2Options.forEach((btn) => {
  btn.addEventListener("click", () => {
    q2Options.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    q2Answered = true;
    validateCurrentStep();
  });
});

// Q3
if (annoySlider) {
  annoySlider.addEventListener("input", (e) => {
    annoyOutput.textContent = e.target.value;
    q3Interacted = true;
    validateCurrentStep();
  });
}

prevBtn.addEventListener("click", () => {
  if (currentStep > 1) {
    currentStep--;
    updateStepView();
  }
});

nextBtn.addEventListener("click", () => {
  if (nextBtn.classList.contains("disabled")) return;

  if (currentStep < totalSteps) {
    currentStep++;
    updateStepView();
  } else {
    triggerConfetti();
    scrollToFunSection();
  }
});

function scrollToFunSection() {
  const funSection = document.querySelector(".fun-section");
  if (funSection) funSection.scrollIntoView({ behavior: "smooth" });
}

updateStepView();

// FUN REACTIONS + CONFETTI ------------------------

const reactionArea = document.getElementById("reaction-area");
const confettiCanvas = document.getElementById("confetti-canvas");
const ctx = confettiCanvas.getContext("2d");

let confettiPieces = [];
let confettiAnimationFrame;

function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createConfettiBurst(x, y) {
  const colors = ["#f97316", "#22c55e", "#3b82f6", "#facc15", "#ec4899"];

  for (let i = 0; i < 80; i++) {
    confettiPieces.push({
      x,
      y,
      dx: (Math.random() - 0.5) * 6,
      dy: Math.random() * -6 - 2,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife: 90 + Math.random() * 40
    });
  }

  if (!confettiAnimationFrame) animateConfetti();
}

function animateConfetti() {
  confettiAnimationFrame = requestAnimationFrame(animateConfetti);
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiPieces.forEach((piece, index) => {
    piece.x += piece.dx;
    piece.y += piece.dy;
    piece.dy += 0.12;
    piece.life++;

    ctx.fillStyle = piece.color;
    ctx.globalAlpha = 1 - piece.life / piece.maxLife;
    ctx.fillRect(piece.x, piece.y, piece.size, piece.size);

    if (piece.life >= piece.maxLife) {
      confettiPieces.splice(index, 1);
    }
  });

  if (confettiPieces.length === 0) {
    cancelAnimationFrame(confettiAnimationFrame);
    confettiAnimationFrame = null;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

function triggerConfetti() {
  createConfettiBurst(window.innerWidth / 2, window.innerHeight / 3);
}

if (reactionArea) {
  const reactionEmojis = ["💛", "🤣", "🥹", "😌", "💫", "🐼", "✨"];

  reactionArea.addEventListener("click", (e) => {
    const rect = reactionArea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const emoji = document.createElement("span");
    emoji.classList.add("reaction-emoji");
    emoji.textContent =
      reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
    emoji.style.left = `${x}px`;
    emoji.style.top = `${y}px`;
    reactionArea.appendChild(emoji);

    createConfettiBurst(e.clientX, e.clientY);

    setTimeout(() => emoji.remove(), 1300);
  });
}
