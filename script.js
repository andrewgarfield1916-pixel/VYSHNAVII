// CONFIG
const DOB_CORRECT = "25/02/2006";
// Apps Script URL is no longer needed for the questions, but keeping in case you use it elsewhere
const SHEETS_URL = "https://script.google.com/macros/s/AKfycbyFzJCRwLnGOZcz0JDNkzeNsdWth6CFDhUbi58BDryOTMID_-dLQwsrm9Pi5hNT03xCmQ/exec";

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
            if (lockMsg) lockMsg.textContent = "That's not it. Try again? 🥺";
            dobInput.classList.add("shake-it");
            setTimeout(() => dobInput.classList.remove("shake-it"), 500);
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
    initFinalLock();
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

// --- STEPPER & GOOGLE FORMS LOGIC ---
function initStepper() {
    let currentStep = 1;
    const totalSteps = 5;
    const cards = document.querySelectorAll(".q-card");
    const dots = document.querySelectorAll(".dot");
    const label = document.getElementById("step-label");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    // Just for local use if you ever want it
    const finalResponses = {
        timestamp: new Date().toISOString(),
        device: navigator.userAgent
    };

    // Your Google Form URL
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdYMP43Ef4mRl65cLETR1HWTTmak1VVBDJnP5Vi7LiZDT9WqQ/viewform?usp=publish-editor";

    function updateStep() {
        cards.forEach(c => c.classList.remove("q-active"));
        dots.forEach(d => d.classList.remove("active-dot"));

        const activeCard = document.querySelector(`.q-card[data-step="${currentStep}"]`);
        if (activeCard) activeCard.classList.add("q-active");

        if (dots[currentStep - 1]) dots[currentStep - 1].classList.add("active-dot");

        if (label) label.textContent = `Question ${currentStep} of ${totalSteps}`;

        if (prevBtn) prevBtn.disabled = currentStep === 1;
        if (nextBtn) nextBtn.textContent = currentStep === totalSteps ? "Finish ✨" : "Next →";
    }

    function openForm() {
        window.open(FORM_URL, "_blank");
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", async () => {
            const currentCard = document.querySelector(`.q-card[data-step="${currentStep}"]`);
            const textarea = currentCard.querySelector("textarea");
            const selected = Array.from(currentCard.querySelectorAll(".chip.selected"))
                .map(c => c.textContent)
                .join(", ");

            if (!textarea.value.trim()) {
                textarea.classList.add("shake-it");
                textarea.placeholder = "hey… don’t escape this question 😌";
                setTimeout(() => textarea.classList.remove("shake-it"), 500);
                return;
            }

            const stepMap = {
                1: { q: "Q1 - What she likes", opt: "Q1 Options" },
                2: { q: "Q2 - When I'm annoying", opt: "Q2 Options" },
                3: { q: "Q3 - Which version", opt: "Q3 Options" },
                4: { q: "Q4 - Conversations feel like", opt: "Q4 Options" },
                5: { q: "Q5 - Miss most", opt: "Q5 Options" }
            };

            const mapping = stepMap[currentStep];
            finalResponses[mapping.q] = textarea.value.trim();
            finalResponses[mapping.opt] = selected || "None";

            if (currentStep < totalSteps) {
                currentStep++;
                updateStep();
            } else {
                openForm();
                nextBtn.parentElement.innerHTML = `
                    <div class="reveal revealed">
                        <p class="thanks-msg">
                            Last tiny thing: a secret form just opened in a new tab. Fill that too? 🫶
                        </p>
                    </div>
                `;
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

    // Chip Selection Logic
    document.querySelectorAll(".chips").forEach(chipGroup => {
        const type = chipGroup.dataset.type;
        chipGroup.querySelectorAll(".chip").forEach(chip => {
            chip.addEventListener("click", function() {
                if (type === "single") {
                    chipGroup.querySelectorAll(".chip").forEach(c => c.classList.remove("selected"));
                    this.classList.add("selected");
                } else {
                    this.classList.toggle("selected");
                }
            });
        });
    });

    // Initialize first step
    updateStep();
}

function initFinalLock() {
    const finalSection = document.getElementById('final-thanks');
    const lockSection = document.getElementById('final-lock');
    const input = document.getElementById('final-dob-input');
    const btn = document.getElementById('final-dob-btn');
    const hint = document.getElementById('final-dob-hint');
    if (!finalSection || !lockSection || !input || !btn) return;

    function normalize(v) { return v.replace(/[\s.-]/g, '').trim(); }
    const correct = normalize('29/09/2005');

    input.addEventListener("input", (e) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val.length > 2 && val.length <= 4) {
            val = val.slice(0, 2) + "/" + val.slice(2);
        } else if (val.length > 4) {
            val = val.slice(0, 2) + "/" + val.slice(2, 4) + "/" + val.slice(4, 8);
        }
        e.target.value = val;
    });

    btn.addEventListener('click', function () {
        const val = normalize(input.value);
        if (!val) { hint.textContent = "at least try guessing 😌"; return; }
        if (val === correct) {
            hint.textContent = "";
            lockSection.classList.add('fade-out');
            setTimeout(() => {
                lockSection.style.display = 'none';
                finalSection.style.display = 'block';
                startConfetti();
            }, 500);
        } else {
            hint.textContent = "close… but not really 😏";
            input.classList.add('shake-it');
            setTimeout(() => input.classList.remove('shake-it'), 400);
        }
    });
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
let particles = [];
let animationId = null;

function startConfetti() {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
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
    particles = [];
    for (let i = 0; i < 100; i++) particles.push(new Particle());
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        animationId = requestAnimationFrame(animate);
    }
    animate();
}
