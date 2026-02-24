// CONFIG
const DOB_CORRECT = "25/02/2006";

// DOM ELEMENTS
const lockScreen = document.getElementById("lock-screen");
const dobInput = document.getElementById("dob-input");
const unlockBtn = document.getElementById("unlock-btn");
const lockMsg = document.getElementById("lock-msg");

const leaflet = document.getElementById("leaflet");
const mainExp = document.getElementById("main");

const audioBtn = document.getElementById("audio-btn");
const bgMusic = document.getElementById("bg-music");

// --- LOCK SCREEN LOGIC ---
if (dobInput) {
    dobInput.addEventListener("input", (e) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val.length > 2 && val.length <= 4) {
            val = val.slice(0, 2) + "/" + val.slice(2);
        } else if (val.length > 4) {
            val = val.slice(0, 2) + "/" + val.slice(2, 4) + "/" + val.slice(4, 8);
        }
        e.target.value = val;
    });
}

if (unlockBtn) {
    unlockBtn.addEventListener("click", () => {
        if (dobInput.value === DOB_CORRECT) {
            unlockExperience();
        } else {
            lockMsg.textContent = "That's not it. Try again? 🥺";
            dobInput.classList.add("shake");
            setTimeout(() => dobInput.classList.remove("shake"), 500);
        }
    });
}

function unlockExperience() {
    lockScreen.classList.add("lock-hidden");
    setTimeout(() => {
        lockScreen.style.display = "none";
        leaflet.classList.remove("leaflet-hidden");
        tryStartMusic();
        setTimeout(() => {
            leaflet.classList.add("leaflet-open");
            setTimeout(() => {
                leaflet.style.display = "none";
                mainExp.classList.remove("main-hidden");
                initMain();
            }, 1200);
        }, 1000);
    }, 800);
}

// --- MUSIC LOGIC ---
let isPlaying = false;
function tryStartMusic() {
    if (bgMusic) {
        bgMusic.play().then(() => {
            isPlaying = true;
            if (audioBtn) audioBtn.textContent = "🔊";
        }).catch(() => {});
    }
}

if (audioBtn) {
    audioBtn.addEventListener("click", () => {
        if (isPlaying) {
            bgMusic.pause();
            audioBtn.textContent = "🔇";
        } else {
            bgMusic.play();
            audioBtn.textContent = "🔊";
        }
        isPlaying = !isPlaying;
    });
}

// --- MAIN INITIALIZATION ---
function initMain() {
    initScrollReveal();
    initStepper();
    initFunSection();
}

function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

function initStepper() {
    let currentStep = 1;
    const cards = document.querySelectorAll(".q-card");
    const dots = document.querySelectorAll(".dot");
    const label = document.getElementById("step-label");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    function updateStep() {
        cards.forEach(c => c.classList.remove("q-active"));
        dots.forEach(d => d.classList.remove("active-dot"));
        const activeCard = document.querySelector(`.q-card[data-step="${currentStep}"]`);
        if (activeCard) activeCard.classList.add("q-active");
        if (dots[currentStep - 1]) dots[currentStep - 1].classList.add("active-dot");
        if (label) label.textContent = `Question ${currentStep} of 3`;
        if (prevBtn) prevBtn.disabled = currentStep === 1;
        if (nextBtn) nextBtn.textContent = currentStep === 3 ? "Finish ✨" : "Next →";
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (currentStep < 3) {
                currentStep++;
                updateStep();
            } else {
                nextBtn.parentElement.innerHTML = "<p class='q-thanks'>Thanks for being honest. Let's keep going. 👇</p>";
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (currentStep > 1) {
                currentStep--;
                updateStep();
            }
        });
    }

    document.querySelectorAll(".chip").forEach(chip => {
        chip.addEventListener("click", function() {
            this.parentElement.querySelectorAll(".chip").forEach(c => c.classList.remove("selected"));
            this.classList.add("selected");
        });
    });

    const slider = document.getElementById("annoy-slider");
    const numDisplay = document.getElementById("annoy-num");
    if (slider && numDisplay) {
        slider.addEventListener("input", (e) => {
            numDisplay.textContent = e.target.value;
        });
    }
}

function initFunSection() {
    const section = document.querySelector(".fun");
    const container = document.getElementById("fun-canvas-container");
    const emojis = ["❤️", "✨", "🐼", "🎂", "🎉", "🔥", "🌸", "⭐"];
    if (section && container) {
        section.addEventListener("click", (e) => {
            const emoji = document.createElement("span");
            emoji.className = "floating-emoji";
            emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            emoji.style.left = `${e.clientX}px`;
            emoji.style.top = `${e.clientY}px`;
            container.appendChild(emoji);
            setTimeout(() => emoji.remove(), 2000);
        });
    }
}

const canvas = document.getElementById("c-canvas");
if (canvas) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = -20;
            this.size = Math.random() * 8 + 4;
            this.speedY = Math.random() * 3 + 2;
            this.speedX = (Math.random() - 0.5) * 2;
            this.color = `hsl(${Math.random() * 360}, 70%, 70%)`;
            this.rotation = Math.random() * 360;
            this.rotSpeed = (Math.random() - 0.5) * 10;
        }
        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.rotation += this.rotSpeed;
            if (this.y > canvas.height) this.reset();
        }
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
            ctx.restore();
        }
    }

    function startConfetti() {
        particles = [];
        for (let i = 0; i < 100; i++) particles.push(new Particle());
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animate);
        }
        animate();
    }

    const finalTrigger = document.querySelector(".final-confetti-trigger");
    if (finalTrigger) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) startConfetti();
        }, { threshold: 0.1 });
        observer.observe(finalTrigger);
    }
}
