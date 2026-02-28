import { useCallback, useEffect, useRef, useState } from "react";
import { useSoundEngine } from "./hooks/useSoundEngine";

// ── Types ──────────────────────────────────────────────────────────────────
interface Question {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  level: 1 | 2 | 3 | 4;
}

type Screen =
  | "splash"
  | "home"
  | "levelSelect"
  | "quiz"
  | "levelComplete"
  | "gameOver";

// ── Sound Toggle Button ────────────────────────────────────────────────────
function SoundToggle({
  soundOn,
  onToggle,
}: {
  soundOn: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={soundOn ? "ಸೌಂಡ್ ಆಫ್ ಮಾಡಿ" : "ಸೌಂಡ್ ಆನ್ ಮಾಡಿ"}
      onClick={onToggle}
      style={{
        position: "absolute",
        top: "1.25rem",
        right: "1.25rem",
        background: "oklch(0.14 0.01 85)",
        border: "1px solid oklch(0.28 0.01 85)",
        borderRadius: "50%",
        width: "2.5rem",
        height: "2.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: "1.1rem",
        zIndex: 2,
        transition: "background 0.15s",
        flexShrink: 0,
      }}
    >
      {soundOn ? "🔊" : "🔇"}
    </button>
  );
}

// ── Splash Screen ──────────────────────────────────────────────────────────
function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"entering" | "exiting">("entering");

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => setPhase("exiting"), 2500);
    const unmountTimer = setTimeout(() => onComplete(), 3300);
    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(unmountTimer);
    };
  }, [onComplete]);

  return (
    <div className={`splash-screen ${phase}`} aria-hidden="true">
      <div className="splash-spotlight-outer" />
      <div className="splash-spotlight" />
      <div className="splash-logo">
        <img
          src="/assets/generated/cinema-huduga-logo-transparent.dim_200x200.png"
          alt="Cinema Huduga"
          width={120}
          height={120}
          style={{ display: "block", objectFit: "contain" }}
        />
      </div>
      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <div
          className="splash-text-primary"
          style={{
            fontSize: "clamp(2rem, 8vw, 2.8rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            color: "oklch(0.86 0.18 88)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
            textShadow: "0 0 30px oklch(0.82 0.16 85 / 0.4)",
          }}
        >
          ಸಿನಿಮಾ ಹುಡುಗ
        </div>
        <div
          className="splash-text-secondary"
          style={{
            marginTop: "0.5rem",
            fontSize: "clamp(0.75rem, 3vw, 0.95rem)",
            fontWeight: 500,
            letterSpacing: "0.06em",
            color: "oklch(0.6 0.01 95)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
          }}
        >
          ಕನ್ನಡ ಸಿನಿಮಾ ಪ್ರಶ್ನೋತ್ತರ
        </div>
      </div>
    </div>
  );
}

// ── Question Database ──────────────────────────────────────────────────────
const QUESTIONS: Question[] = [
  // Level 1 – Recent Movies
  {
    question:
      "Which Kannada movie starred Yash and became a pan-India blockbuster?",
    options: ["KGF", "Tagaru", "Ugramm", "Ricky"],
    correctIndex: 0,
    level: 1,
  },
  {
    question: "Who directed the movie 'KGF Chapter 1'?",
    options: ["Pawan Kumar", "Prashanth Neel", "Guruprasad", "Suri"],
    correctIndex: 1,
    level: 1,
  },
  {
    question:
      "Which 2022 Kannada film featured Rishab Shetty in the lead role?",
    options: ["777 Charlie", "Kantara", "Vikrant Rona", "Bell Bottom"],
    correctIndex: 1,
    level: 1,
  },
  {
    question: "Which actor is known as 'Rocking Star' in Kannada cinema?",
    options: ["Darshan", "Yash", "Sudeep", "Ramya"],
    correctIndex: 1,
    level: 1,
  },
  {
    question: "What was the name of Puneeth Rajkumar's last released film?",
    options: ["Yuvarathnaa", "James", "Raajakumara", "Nata Sarvabhouma"],
    correctIndex: 1,
    level: 1,
  },
  {
    question: "Which Kannada film had the tagline 'Real Star'?",
    options: ["Eega", "Mugulu Nage", "Kotigobba 2", "Pailwaan"],
    correctIndex: 3,
    level: 1,
  },
  {
    question: "In which year was 'KGF Chapter 2' released?",
    options: ["2020", "2021", "2022", "2023"],
    correctIndex: 2,
    level: 1,
  },
  {
    question: "Who played the villain in KGF Chapter 2?",
    options: ["Sanjay Dutt", "Raveena Tandon", "Prakash Raj", "Yash"],
    correctIndex: 0,
    level: 1,
  },
  {
    question: "Which Kannada movie features the song 'Bombe Helutaite'?",
    options: ["Mungaru Male", "Jothe Jotheyali", "Duniya", "Jogi"],
    correctIndex: 0,
    level: 1,
  },
  {
    question: "Kannada actor Sudeep is also known by which name?",
    options: ["Power Star", "Real Star", "Kichcha", "Rocking Star"],
    correctIndex: 2,
    level: 1,
  },
  {
    question:
      "Which recent Kannada film stars Rakshit Shetty as a fisherman fighting a mythical entity?",
    options: [
      "Avane Srimannarayana",
      "777 Charlie",
      "Kantara",
      "Ulidavaru Kandanthe",
    ],
    correctIndex: 2,
    level: 1,
  },
  {
    question: "What is the name of the Kannada film industry popularly called?",
    options: ["Bollywood", "Kollywood", "Sandalwood", "Mollywood"],
    correctIndex: 2,
    level: 1,
  },
  {
    question: "Who is the 'Power Star' of Kannada cinema?",
    options: ["Puneeth Rajkumar", "Darshan", "Yash", "Sudeep"],
    correctIndex: 0,
    level: 1,
  },
  {
    question:
      "Which Kannada movie featuring a dog became a massive family hit?",
    options: [
      "Godhi Banna Sadharana Mykattu",
      "777 Charlie",
      "Ayogya",
      "Mufasa",
    ],
    correctIndex: 1,
    level: 1,
  },
  {
    question: "Who directed 'Vikrant Rona'?",
    options: ["Anup Bhandari", "Suri", "Tarun Sudhir", "Chethan Kumar"],
    correctIndex: 0,
    level: 1,
  },
  {
    question:
      "Which Kannada actor also appeared in the Hindi movie 'Dabangg 3'?",
    options: ["Yash", "Darshan", "Sudeep", "Chiranjeevi Sarja"],
    correctIndex: 2,
    level: 1,
  },
  {
    question: "What genre is the movie 'Ugramm'?",
    options: ["Romantic", "Action", "Horror", "Comedy"],
    correctIndex: 1,
    level: 1,
  },
  {
    question:
      "Which Kannada film won the National Award for Best Film in 2022?",
    options: ["KGF Chapter 2", "Kantara", "777 Charlie", "Vikrant Rona"],
    correctIndex: 1,
    level: 1,
  },
  {
    question: "Who composed music for 'Mungaru Male'?",
    options: ["Ravi Basrur", "V Harikrishna", "Manomurthy", "Rajesh Krishnan"],
    correctIndex: 1,
    level: 1,
  },
  {
    question: "Which Kannada movie is based on gold mining in Kolar?",
    options: ["Raajakumara", "KGF", "Tagaru", "Pailwaan"],
    correctIndex: 1,
    level: 1,
  },
  {
    question: "What does 'KGF' stand for?",
    options: [
      "Kolar Gold Farm",
      "Kolar Gold Fields",
      "King Gold Fort",
      "Karnataka Gold Falls",
    ],
    correctIndex: 1,
    level: 1,
  },
  {
    question: "Who plays the main antagonist 'Adheera' in KGF Chapter 2?",
    options: ["Prakash Raj", "Sanjay Dutt", "Raveena Tandon", "Achyuth Kumar"],
    correctIndex: 1,
    level: 1,
  },

  // Level 2 – Actors
  {
    question: "Which Kannada actor is known as 'Challenging Star'?",
    options: ["Yash", "Darshan", "Sudeep", "Puneeth"],
    correctIndex: 1,
    level: 2,
  },
  {
    question:
      "Which actor starred in both Kannada and Telugu blockbusters as a pan-India star?",
    options: ["Sudeep", "Yash", "Darshan", "Shiva Rajkumar"],
    correctIndex: 1,
    level: 2,
  },
  {
    question: "Who is the son of legendary Kannada actor Dr. Rajkumar?",
    options: ["Ramesh Aravind", "Puneeth Rajkumar", "Sudeep", "Jaggesh"],
    correctIndex: 1,
    level: 2,
  },
  {
    question:
      "Which Kannada actress starred in 'Mungaru Male' opposite Ganesh?",
    options: ["Ramya", "Pooja Gandhi", "Parvathy", "Rachita Ram"],
    correctIndex: 0,
    level: 2,
  },
  {
    question:
      "Rishab Shetty is best known for directing and acting in which 2022 film?",
    options: ["777 Charlie", "Vikrant Rona", "Kantara", "Avane Srimannarayana"],
    correctIndex: 2,
    level: 2,
  },

  // Level 3 – Directors
  {
    question: "Who directed the iconic Kannada film 'Mungaru Male'?",
    options: ["Yogaraj Bhat", "Upendra", "Pawan Kumar", "Guruprasad"],
    correctIndex: 0,
    level: 3,
  },
  {
    question: "Which director is known for the quirky film 'Lucia' in Kannada?",
    options: ["Rishab Shetty", "Pawan Kumar", "Suri", "Tarun Sudhir"],
    correctIndex: 1,
    level: 3,
  },
  {
    question: "Prashanth Neel is known for directing which franchise?",
    options: ["Tagaru", "KGF", "Kantara", "Ugramm"],
    correctIndex: 1,
    level: 3,
  },
  {
    question: "Who directed the Kannada film 'Ulidavaru Kandanthe'?",
    options: ["Rakshit Shetty", "Hemanth Rao", "Pawan Kumar", "Rishab Shetty"],
    correctIndex: 0,
    level: 3,
  },
  {
    question:
      "Which director is famous for films like 'OM' and 'Apthamitra' in Kannada?",
    options: ["P. Vasu", "Upendra", "Guruprasad", "Suri"],
    correctIndex: 0,
    level: 3,
  },

  // Level 4 – Box Office
  {
    question:
      "Which Kannada film crossed ₹1200 crore worldwide at the box office?",
    options: ["Kantara", "KGF Chapter 2", "Vikrant Rona", "777 Charlie"],
    correctIndex: 1,
    level: 4,
  },
  {
    question: "Approximately how much did 'Kantara' earn worldwide?",
    options: ["₹100 crore", "₹300 crore", "₹400 crore", "₹600 crore"],
    correctIndex: 3,
    level: 4,
  },
  {
    question:
      "Which was the first Kannada film to cross ₹100 crore in box office collections?",
    options: ["Raajakumara", "Pailwaan", "KGF Chapter 1", "Tagaru"],
    correctIndex: 2,
    level: 4,
  },
  {
    question:
      "KGF Chapter 2 earned record opening day collections – approximately how much?",
    options: ["₹50 crore", "₹100 crore", "₹150 crore", "₹200 crore"],
    correctIndex: 2,
    level: 4,
  },
  {
    question:
      "Which Kannada film had the highest-ever opening week in Karnataka?",
    options: ["Kantara", "777 Charlie", "KGF Chapter 2", "Vikrant Rona"],
    correctIndex: 2,
    level: 4,
  },
];

const LEVEL_NAMES: Record<number, string> = {
  1: "ಹಂತ 1 – ಇತ್ತೀಚಿನ ಸಿನಿಮಾ",
  2: "ಹಂತ 2 – ನಟರು",
  3: "ಹಂತ 3 – ನಿರ್ದೇಶಕರು",
  4: "ಹಂತ 4 – ಬಾಕ್ಸ್ ಆಫೀಸ್",
};

const LEVEL_LABELS: Record<number, string> = {
  1: "ಸುಲಭ – ಇತ್ತೀಚಿನ ಸಿನಿಮಾ",
  2: "ನಟರು",
  3: "ನಿರ್ದೇಶಕರು",
  4: "ಬಾಕ್ಸ್ ಆಫೀಸ್",
};

// ── Helpers ────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getBestScore(): number {
  return Number.parseInt(localStorage.getItem("bestScore") ?? "0", 10) || 0;
}

function setBestScore(score: number): void {
  const current = getBestScore();
  if (score > current) localStorage.setItem("bestScore", String(score));
}

function getUnlockedLevels(): number[] {
  try {
    return JSON.parse(
      localStorage.getItem("unlockedLevels") ?? "[1]",
    ) as number[];
  } catch {
    return [1];
  }
}

function unlockLevel(level: number): void {
  const current = getUnlockedLevels();
  if (!current.includes(level)) {
    localStorage.setItem("unlockedLevels", JSON.stringify([...current, level]));
  }
}

const TIMER_DURATION = 15;

// ── Circular Timer ─────────────────────────────────────────────────────────
function CircularTimer({
  timeLeft,
  totalTime,
}: {
  timeLeft: number;
  totalTime: number;
}) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius; // ≈ 226.19
  const progress = timeLeft / totalTime;
  const dashOffset = circumference * (1 - progress);
  const isWarning = timeLeft <= 5;
  const color = isWarning ? "oklch(0.7 0.22 30)" : "oklch(0.82 0.16 85)";

  return (
    <div
      style={{ width: 80, height: 80, position: "relative", flexShrink: 0 }}
      aria-label={`ಉಳಿದ ಸಮಯ: ${timeLeft} ಸೆಕೆಂಡ್`}
      role="timer"
    >
      <svg
        width={80}
        height={80}
        viewBox="0 0 80 80"
        className={isWarning ? "circular-timer-warning" : ""}
        style={{ display: "block" }}
        aria-hidden="true"
      >
        {/* Background track */}
        <circle
          cx={40}
          cy={40}
          r={radius}
          fill="none"
          stroke="oklch(0.2 0.01 85)"
          strokeWidth={6}
        />
        {/* Foreground arc */}
        <circle
          cx={40}
          cy={40}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 40 40)"
          style={{
            transition: "stroke-dashoffset 0.95s linear, stroke 0.3s ease",
          }}
        />
      </svg>
      {/* Centered number */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.35rem",
          fontWeight: 800,
          color,
          fontFamily: '"Bricolage Grotesque", "Sora", sans-serif',
          transition: "color 0.3s ease",
          lineHeight: 1,
          pointerEvents: "none",
        }}
      >
        {timeLeft}
      </div>
    </div>
  );
}

// ── Subcomponents ──────────────────────────────────────────────────────────

const HEART_KEYS = ["h1", "h2", "h3"];

function HeartIcons({ lives }: { lives: number }) {
  return (
    <div className="flex gap-1">
      {HEART_KEYS.map((key, i) => (
        <span
          key={key}
          className="text-xl leading-none"
          style={{ filter: i < lives ? "none" : "grayscale(1) opacity(0.3)" }}
        >
          ❤️
        </span>
      ))}
    </div>
  );
}

function HowToPlayModal({
  onClose,
  play,
}: {
  onClose: () => void;
  play: (name: "click") => void;
}) {
  return (
    <dialog
      open
      className="modal-backdrop"
      onClick={() => {
        play("click");
        onClose();
      }}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      aria-label="ಹೇಗೆ ಆಡಬೇಕು"
      style={{
        border: "none",
        background: "transparent",
        padding: 0,
        margin: 0,
        maxWidth: "100vw",
        maxHeight: "100vh",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        className="card-dark w-full max-w-sm p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        style={{ position: "relative", zIndex: 51 }}
      >
        <h2
          className="text-xl font-bold text-center"
          style={{
            color: "oklch(0.82 0.16 85)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
            fontWeight: 800,
          }}
        >
          ಹೇಗೆ ಆಡಬೇಕು
        </h2>
        <ul
          className="space-y-3 text-sm"
          style={{
            color: "oklch(0.78 0.01 95)",
            fontFamily: '"Noto Sans Kannada", "Sora", sans-serif',
          }}
        >
          <li className="flex gap-2">
            <span className="text-base">🎯</span>
            <span>ಕನ್ನಡ ಸಿನಿಮಾದ ಬಗ್ಗೆ 4 ಆಯ್ಕೆಗಳ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-base">✅</span>
            <span>
              <strong style={{ color: "oklch(0.82 0.16 85)" }}>+10 ಅಂಕ</strong>{" "}
              ಸರಿಯಾದ ಉತ್ತರಕ್ಕೆ.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-base">⚡</span>
            <span>
              <strong style={{ color: "oklch(0.82 0.16 85)" }}>
                +5 ವೇಗದ ಬೋನಸ್
              </strong>{" "}
              5 ಸೆಕೆಂಡ್ ಒಳಗೆ ಉತ್ತರಿಸಿದರೆ.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-base">❤️</span>
            <span>
              ನಿಮಗೆ{" "}
              <strong style={{ color: "oklch(0.82 0.16 85)" }}>
                3 ಅವಕಾಶಗಳಿವೆ
              </strong>
              . ತಪ್ಪು ಉತ್ತರ ಅಥವಾ ಸಮಯ ಮೀರಿದರೆ 1 ಅವಕಾಶ ಕಳೆದುಕೊಳ್ಳುವಿರಿ.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-base">⏱️</span>
            <span>
              <strong style={{ color: "oklch(0.82 0.16 85)" }}>15 ಸೆಕೆಂಡ್</strong>{" "}
              ಪ್ರತಿ ಪ್ರಶ್ನೆಗೆ.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-base">🔓</span>
            <span>
              <strong style={{ color: "oklch(0.82 0.16 85)" }}>70%+</strong> ಸರಿ
              ಉತ್ತರ ನೀಡಿ ಮುಂದಿನ ಹಂತ ತೆರೆಯಿರಿ.
            </span>
          </li>
        </ul>
        <button
          type="button"
          className="gold-btn w-full py-3 text-sm mt-2"
          onClick={() => {
            play("click");
            onClose();
          }}
        >
          ಅರ್ಥವಾಯಿತು!
        </button>
      </div>
    </dialog>
  );
}

// ── Screens ────────────────────────────────────────────────────────────────

function HomeScreen({
  onPlay,
  bestScore,
  soundOn,
  onToggleSound,
  play,
}: {
  onPlay: () => void;
  bestScore: number;
  soundOn: boolean;
  onToggleSound: () => void;
  play: (name: "click") => void;
}) {
  const [showHowTo, setShowHowTo] = useState(false);

  return (
    <div
      className="screen justify-center items-center text-center gap-7"
      style={{ position: "relative" }}
    >
      {/* Animated background */}
      <div className="home-animated-bg" aria-hidden="true" />

      {/* Sound toggle — top right */}
      <SoundToggle
        soundOn={soundOn}
        onToggle={() => {
          play("click");
          onToggleSound();
        }}
      />

      {/* Title block */}
      <div
        className="space-y-2 pb-1"
        style={{ position: "relative", zIndex: 1 }}
      >
        <div
          className="font-black leading-none tracking-tight"
          style={{
            fontSize: "clamp(2.8rem, 10vw, 3.6rem)",
            color: "oklch(0.86 0.18 88)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
            fontWeight: 900,
          }}
        >
          ಸಿನಿಮಾ
          <br />
          ಹುಡುಗ
        </div>
        <div
          className="font-semibold text-sm mt-1"
          style={{
            color: "oklch(0.6 0.01 95)",
            letterSpacing: "0.04em",
            fontFamily: '"Noto Sans Kannada", sans-serif',
          }}
        >
          ಕನ್ನಡ ಸಿನಿಮಾ ಪ್ರಶ್ನೋತ್ತರ
        </div>
      </div>

      {/* Film reel decorative */}
      <div
        className="flex items-center gap-4 opacity-40 my-1"
        style={{ position: "relative", zIndex: 1 }}
      >
        {["r0", "r1", "r2", "r3", "r4"].map((key, i) => (
          <div
            key={key}
            className="rounded-sm"
            style={{
              width: i === 2 ? "10px" : "6px",
              height: i === 2 ? "10px" : "6px",
              background: "oklch(0.82 0.16 85)",
            }}
          />
        ))}
      </div>

      {/* Best Score — glassmorphism card */}
      {bestScore > 0 && (
        <div
          className="px-8 py-4 text-center"
          style={{
            position: "relative",
            zIndex: 1,
            background: "oklch(0.82 0.16 85 / 0.07)",
            border: "1px solid oklch(0.82 0.16 85 / 0.25)",
            borderRadius: "1.25rem",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow:
              "0 4px 24px oklch(0.82 0.16 85 / 0.08), inset 0 1px 0 oklch(1 0 0 / 0.06)",
          }}
        >
          <div
            className="text-xs uppercase tracking-widest mb-1"
            style={{
              color: "oklch(0.55 0.01 85)",
              fontFamily: '"Noto Sans Kannada", sans-serif',
            }}
          >
            ಅತ್ಯುತ್ತಮ ಅಂಕ
          </div>
          <div
            className="title-font font-bold text-2xl"
            style={{ color: "oklch(0.82 0.16 85)" }}
          >
            {bestScore}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div
        className="w-full max-w-xs space-y-3"
        style={{ position: "relative", zIndex: 1 }}
      >
        <button
          type="button"
          className="gold-btn press-btn w-full py-4 text-lg"
          onClick={() => {
            play("click");
            onPlay();
          }}
        >
          <span style={{ marginRight: "0.5rem" }}>🎬</span>ಈಗ ಆಟ ಆಡಿರಿ
        </button>
        <button
          type="button"
          className="press-btn w-full py-3 text-sm font-medium rounded-xl"
          style={{
            background: "oklch(0.16 0.01 85)",
            color: "oklch(0.75 0.01 95)",
            border: "1.5px solid oklch(0.28 0.01 85)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
            transition:
              "transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.12s ease",
          }}
          onClick={() => {
            play("click");
            setShowHowTo(true);
          }}
        >
          <span style={{ marginRight: "0.5rem" }}>📖</span>ಹೇಗೆ ಆಡಬೇಕು
        </button>
      </div>

      {/* Footer */}
      <div
        className="mt-auto pt-8 text-xs"
        style={{
          position: "relative",
          zIndex: 1,
          color: "oklch(0.35 0.01 85)",
          fontFamily: '"Noto Sans Kannada", "Sora", sans-serif',
        }}
      >
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "oklch(0.55 0.12 85)" }}
        >
          caffeine.ai
        </a>{" "}
        ನೊಂದಿಗೆ ❤️ ಮಾಡಲಾಗಿದೆ
      </div>

      {showHowTo && (
        <HowToPlayModal onClose={() => setShowHowTo(false)} play={play} />
      )}
    </div>
  );
}

function LevelSelectScreen({
  onSelectLevel,
  onHome,
  unlockedLevels,
  soundOn,
  onToggleSound,
  play,
}: {
  onSelectLevel: (level: 1 | 2 | 3 | 4) => void;
  onHome: () => void;
  unlockedLevels: number[];
  soundOn: boolean;
  onToggleSound: () => void;
  play: (name: "click") => void;
}) {
  const levels = [1, 2, 3, 4] as const;

  return (
    <div className="screen gap-6" style={{ position: "relative" }}>
      {/* Sound toggle */}
      <SoundToggle
        soundOn={soundOn}
        onToggle={() => {
          play("click");
          onToggleSound();
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          type="button"
          onClick={() => {
            play("click");
            onHome();
          }}
          className="p-2 rounded-lg transition-opacity hover:opacity-70"
          style={{
            color: "oklch(0.65 0.01 85)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
          }}
          aria-label="ಮನೆಗೆ ಹಿಂದೆ"
        >
          ← ಹಿಂದೆ
        </button>
        <h1
          className="font-bold text-xl"
          style={{
            color: "oklch(0.86 0.18 88)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
            fontWeight: 800,
          }}
        >
          ಹಂತ ಆಯ್ಕೆ ಮಾಡಿ
        </h1>
      </div>

      {/* Level cards */}
      <div className="space-y-3">
        {levels.map((lvl) => {
          const unlocked = unlockedLevels.includes(lvl);
          return (
            <button
              type="button"
              key={lvl}
              disabled={!unlocked}
              onClick={() => {
                if (unlocked) {
                  play("click");
                  onSelectLevel(lvl);
                }
              }}
              className="w-full text-left rounded-2xl p-4 transition-all duration-150"
              style={{
                background: unlocked
                  ? "oklch(0.14 0.01 85)"
                  : "oklch(0.1 0.005 85)",
                border: `1.5px solid ${unlocked ? "oklch(0.82 0.16 85 / 0.5)" : "oklch(0.2 0.005 85)"}`,
                opacity: unlocked ? 1 : 0.5,
                cursor: unlocked ? "pointer" : "not-allowed",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className="font-bold text-base"
                    style={{
                      color: unlocked
                        ? "oklch(0.86 0.18 88)"
                        : "oklch(0.45 0.01 85)",
                      fontFamily: '"Noto Sans Kannada", sans-serif',
                    }}
                  >
                    ಹಂತ {lvl}
                  </div>
                  <div
                    className="text-sm mt-0.5"
                    style={{
                      color: unlocked
                        ? "oklch(0.65 0.01 85)"
                        : "oklch(0.38 0.01 85)",
                      fontFamily: '"Noto Sans Kannada", sans-serif',
                    }}
                  >
                    {LEVEL_LABELS[lvl]}
                  </div>
                </div>
                <div className="text-xl">{unlocked ? "▶" : "🔒"}</div>
              </div>
              {!unlocked && (
                <div
                  className="text-xs mt-1.5"
                  style={{
                    color: "oklch(0.45 0.1 85)",
                    fontFamily: '"Noto Sans Kannada", sans-serif',
                  }}
                >
                  ಹಂತ {lvl - 1} ರಲ್ಲಿ 70%+ ಸ್ಕೋರ್ ಮಾಡಿ ತೆರೆಯಿರಿ
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface QuizState {
  questions: Question[];
  currentIndex: number;
  score: number;
  lives: number;
  correctCount: number;
  selectedIndex: number | null;
  answerState: "idle" | "correct" | "wrong" | "timeout";
}

function QuizScreen({
  level,
  onComplete,
  onGameOver,
  soundOn,
  onToggleSound,
  play,
}: {
  level: 1 | 2 | 3 | 4;
  onComplete: (score: number, correctCount: number, totalCount: number) => void;
  onGameOver: (score: number, correctCount: number, totalAsked: number) => void;
  soundOn: boolean;
  onToggleSound: () => void;
  play: (
    name: "click" | "correct" | "wrong" | "levelComplete" | "gameOver",
  ) => void;
}) {
  const levelQuestions = QUESTIONS.filter((q) => q.level === level);
  const [state, setState] = useState<QuizState>(() => ({
    questions: shuffle(levelQuestions),
    currentIndex: 0,
    score: 0,
    lives: 3,
    correctCount: 0,
    selectedIndex: null,
    answerState: "idle",
  }));

  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answerRef = useRef<QuizState["answerState"]>("idle");
  const timeLeftRef = useRef(TIMER_DURATION);

  const currentQ = state.questions[state.currentIndex];
  const isAnswered = state.answerState !== "idle";

  const advanceQuestion = useCallback(
    (newState: QuizState) => {
      const nextIndex = newState.currentIndex + 1;
      if (nextIndex >= newState.questions.length) {
        onComplete(
          newState.score,
          newState.correctCount,
          newState.questions.length,
        );
        return;
      }
      if (newState.lives <= 0) {
        onGameOver(
          newState.score,
          newState.correctCount,
          newState.currentIndex + 1,
        );
        return;
      }
      setState({
        ...newState,
        currentIndex: nextIndex,
        selectedIndex: null,
        answerState: "idle",
      });
      setTimeLeft(TIMER_DURATION);
      timeLeftRef.current = TIMER_DURATION;
    },
    [onComplete, onGameOver],
  );

  const handleAnswer = useCallback(
    (index: number) => {
      if (answerRef.current !== "idle") return;
      if (timerRef.current) clearInterval(timerRef.current);

      const isCorrect = index === currentQ.correctIndex;
      const elapsed = TIMER_DURATION - timeLeftRef.current;
      const speedBonus = isCorrect && elapsed < 5 ? 5 : 0;
      const pointsGained = isCorrect ? 10 + speedBonus : 0;

      const newAnswerState: QuizState["answerState"] = isCorrect
        ? "correct"
        : "wrong";
      answerRef.current = newAnswerState;

      // Play sound immediately
      play(isCorrect ? "correct" : "wrong");
      if (!isCorrect && navigator.vibrate) navigator.vibrate(200);

      setState((prev) => {
        const newScore = prev.score + pointsGained;
        const newLives = isCorrect ? prev.lives : prev.lives - 1;
        const newCorrectCount = isCorrect
          ? prev.correctCount + 1
          : prev.correctCount;
        const next: QuizState = {
          ...prev,
          score: newScore,
          lives: newLives,
          correctCount: newCorrectCount,
          selectedIndex: index,
          answerState: newAnswerState,
        };

        setTimeout(() => {
          answerRef.current = "idle";
          advanceQuestion(next);
        }, 1500);

        return next;
      });
    },
    [currentQ, advanceQuestion, play],
  );

  // Timer
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - currentIndex triggers reset
  useEffect(() => {
    answerRef.current = "idle";
    setTimeLeft(TIMER_DURATION);
    timeLeftRef.current = TIMER_DURATION;

    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);

      if (timeLeftRef.current <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (answerRef.current !== "idle") return;

        answerRef.current = "timeout";
        play("wrong"); // timeout = wrong sound
        if (navigator.vibrate) navigator.vibrate(200);
        setState((prev) => {
          const newLives = prev.lives - 1;
          const next: QuizState = {
            ...prev,
            lives: newLives,
            selectedIndex: null,
            answerState: "timeout",
          };
          setTimeout(() => {
            answerRef.current = "idle";
            advanceQuestion(next);
          }, 1500);
          return next;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.currentIndex, advanceQuestion, play]);

  const getButtonClass = (idx: number): string => {
    const base = "answer-btn";
    if (!isAnswered) return base;
    if (idx === currentQ.correctIndex) return `${base} correct`;
    if (idx === state.selectedIndex && state.answerState === "wrong")
      return `${base} wrong`;
    return base;
  };

  return (
    <div className="screen gap-0" style={{ position: "relative" }}>
      {/* Sound toggle */}
      <SoundToggle
        soundOn={soundOn}
        onToggle={() => {
          play("click");
          onToggleSound();
        }}
      />

      {/* Top bar */}
      <div
        className="flex items-center justify-between mb-3"
        style={{ paddingRight: "3.5rem" }}
      >
        <div className="card-dark px-3 py-1.5">
          <span
            className="text-xs"
            style={{
              color: "oklch(0.55 0.01 85)",
              fontFamily: '"Noto Sans Kannada", "Sora", sans-serif',
            }}
          >
            ಅಂಕ{" "}
          </span>
          <span
            className="title-font font-bold text-base"
            style={{ color: "oklch(0.82 0.16 85)" }}
          >
            {state.score}
          </span>
        </div>
        <div
          className="text-xs font-medium tracking-wider"
          style={{
            color: "oklch(0.55 0.01 85)",
            fontFamily: '"Noto Sans Kannada", "Sora", sans-serif',
          }}
        >
          {LEVEL_NAMES[level]}
        </div>
        <HeartIcons lives={state.lives} />
      </div>

      {/* Progress text */}
      <div
        className="text-xs text-right mb-2"
        style={{ color: "oklch(0.45 0.01 85)" }}
      >
        {state.currentIndex + 1} / {state.questions.length}
      </div>

      {/* Circular timer — centered */}
      <div className="flex justify-center my-3">
        <CircularTimer timeLeft={timeLeft} totalTime={TIMER_DURATION} />
      </div>

      {/* Question + options — animated per question */}
      <div
        key={state.currentIndex}
        className="question-enter"
        style={{ display: "flex", flexDirection: "column", flex: 1 }}
      >
        {/* Question */}
        <div
          className="card-dark p-5 mb-4 flex-1 flex items-center justify-center min-h-[100px]"
          style={{ borderColor: "oklch(0.28 0.01 85)" }}
        >
          <p
            className="title-font font-semibold text-center leading-snug"
            style={{
              fontSize: "clamp(1rem, 4vw, 1.2rem)",
              color: "oklch(0.92 0.01 95)",
            }}
          >
            {currentQ.question}
          </p>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: "3px",
            background: "oklch(0.18 0.01 85)",
            borderRadius: "99px",
            marginBottom: "1.25rem",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${((state.currentIndex + 1) / state.questions.length) * 100}%`,
              background:
                "linear-gradient(90deg, oklch(0.76 0.19 78), oklch(0.86 0.18 90))",
              borderRadius: "99px",
              transition: "width 0.5s ease",
            }}
          />
        </div>

        {/* Answer options */}
        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => (
            <button
              type="button"
              key={`opt-${idx}-${currentQ.question.slice(0, 10)}`}
              className={getButtonClass(idx)}
              disabled={isAnswered}
              onClick={() => handleAnswer(idx)}
            >
              <span
                className="inline-block w-6 h-6 rounded-full text-center text-xs font-bold mr-2 leading-6 flex-shrink-0"
                style={{
                  background: "oklch(0.22 0.01 85)",
                  color: "oklch(0.6 0.01 85)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {["A", "B", "C", "D"][idx]}
              </span>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {state.answerState !== "idle" && (
        <div
          className="text-center mt-4 font-semibold text-sm"
          style={{
            color:
              state.answerState === "correct"
                ? "oklch(0.72 0.19 145)"
                : state.answerState === "timeout"
                  ? "oklch(0.7 0.15 60)"
                  : "oklch(0.7 0.2 30)",
            fontFamily: '"Noto Sans Kannada", "Sora", sans-serif',
          }}
        >
          {state.answerState === "correct" && (
            <>
              ✓ ಸರಿಯಾದ ಉತ್ತರ!
              {TIMER_DURATION - timeLeft < 5 && (
                <span style={{ color: "oklch(0.82 0.16 85)" }}>
                  {" "}
                  +5 ವೇಗದ ಬೋನಸ್!
                </span>
              )}
            </>
          )}
          {state.answerState === "wrong" && "✗ ತಪ್ಪು ಉತ್ತರ"}
          {state.answerState === "timeout" && "⏰ ಸಮಯ ಮುಗಿದಿದೆ!"}
        </div>
      )}
    </div>
  );
}

function LevelCompleteScreen({
  level,
  score,
  correctCount,
  totalCount,
  onPlayAgain,
  onHome,
  soundOn,
  onToggleSound,
  play,
}: {
  level: 1 | 2 | 3 | 4;
  score: number;
  correctCount: number;
  totalCount: number;
  onPlayAgain: () => void;
  onHome: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
  play: (name: "click" | "levelComplete") => void;
}) {
  const percentage = Math.round((correctCount / totalCount) * 100);
  const passed = percentage >= 70;
  const nextLevel = level < 4 ? ((level + 1) as 2 | 3 | 4) : null;

  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    if (passed && nextLevel) unlockLevel(nextLevel);
    play("levelComplete");
  }, [passed, nextLevel, play]);

  return (
    <div
      className="screen justify-center items-center text-center gap-6"
      style={{ position: "relative" }}
    >
      {/* Sound toggle */}
      <SoundToggle
        soundOn={soundOn}
        onToggle={() => {
          play("click");
          onToggleSound();
        }}
      />

      <div
        className="text-5xl"
        style={{ filter: "drop-shadow(0 0 20px oklch(0.82 0.16 85 / 0.6))" }}
      >
        {passed ? "🏆" : "🎬"}
      </div>

      <div>
        <h1
          className="font-black text-3xl mb-1"
          style={{
            color: "oklch(0.86 0.18 88)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
            fontWeight: 900,
          }}
        >
          ಹಂತ ಪೂರ್ಣ!
        </h1>
        <p
          className="text-sm"
          style={{
            color: "oklch(0.55 0.01 85)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
          }}
        >
          {LEVEL_NAMES[level]}
        </p>
      </div>

      {/* Score card */}
      <div
        className="card-dark w-full max-w-xs p-5 space-y-3"
        style={{ borderColor: "oklch(0.82 0.16 85 / 0.3)" }}
      >
        <div className="flex justify-between">
          <span
            style={{
              color: "oklch(0.55 0.01 85)",
              fontFamily: '"Noto Sans Kannada", sans-serif',
            }}
          >
            ಅಂಕ
          </span>
          <span
            className="title-font font-bold"
            style={{ color: "oklch(0.82 0.16 85)" }}
          >
            {score}
          </span>
        </div>
        <div className="flex justify-between">
          <span
            style={{
              color: "oklch(0.55 0.01 85)",
              fontFamily: '"Noto Sans Kannada", sans-serif',
            }}
          >
            ಸರಿ
          </span>
          <span
            className="font-semibold"
            style={{ color: "oklch(0.72 0.19 145)" }}
          >
            {correctCount}/{totalCount}
          </span>
        </div>
        <div className="flex justify-between">
          <span
            style={{
              color: "oklch(0.55 0.01 85)",
              fontFamily: '"Noto Sans Kannada", sans-serif',
            }}
          >
            ನಿಖರತೆ
          </span>
          <span
            className="title-font font-bold text-lg"
            style={{
              color: passed ? "oklch(0.72 0.19 145)" : "oklch(0.7 0.2 30)",
            }}
          >
            {percentage}%
          </span>
        </div>
      </div>

      {passed && nextLevel && (
        <div
          className="rounded-xl px-5 py-3 text-sm font-semibold"
          style={{
            background: "oklch(0.2 0.1 85)",
            border: "1px solid oklch(0.82 0.16 85 / 0.5)",
            color: "oklch(0.86 0.18 88)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
          }}
        >
          🔓 ಹಂತ {nextLevel} ತೆರೆದಿದೆ!
        </div>
      )}
      {!passed && (
        <div
          className="rounded-xl px-5 py-3 text-sm"
          style={{
            background: "oklch(0.16 0.01 85)",
            border: "1px solid oklch(0.3 0.01 85)",
            color: "oklch(0.6 0.01 85)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
          }}
        >
          ಮುಂದಿನ ಹಂತ ತೆರೆಯಲು 70%+ ಸ್ಕೋರ್ ಮಾಡಿ
        </div>
      )}

      <div className="w-full max-w-xs space-y-3">
        <button
          type="button"
          className="gold-btn w-full py-4 text-base"
          onClick={() => {
            play("click");
            onPlayAgain();
          }}
        >
          ಮತ್ತೆ ಆಡಿರಿ
        </button>
        <button
          type="button"
          className="w-full py-3 text-sm font-medium rounded-xl"
          style={{
            background: "oklch(0.16 0.01 85)",
            color: "oklch(0.75 0.01 95)",
            border: "1.5px solid oklch(0.28 0.01 85)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
          }}
          onClick={() => {
            play("click");
            onHome();
          }}
        >
          ಮನೆ
        </button>
      </div>
    </div>
  );
}

// ── Confetti Rain ─────────────────────────────────────────────────────────
const CONFETTI_COLORS = [
  "oklch(0.82 0.16 85)",
  "oklch(0.86 0.18 90)",
  "oklch(0.76 0.19 78)",
  "oklch(0.9 0.12 70)",
  "oklch(0.72 0.19 145)",
];

interface ConfettiPiece {
  id: number;
  left: string;
  delay: string;
  duration: string;
  color: string;
  size: string;
  rotate: string;
}

function ConfettiRain() {
  const pieces: ConfettiPiece[] = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.5}s`,
    duration: `${2 + Math.random() * 2}s`,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: `${6 + Math.random() * 6}px`,
    rotate: `${Math.random() * 360}deg`,
  }));

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            top: "-10px",
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: p.duration,
            animationDelay: p.delay,
            transform: `rotate(${p.rotate})`,
          }}
        />
      ))}
    </>
  );
}

function GameOverScreen({
  score,
  correctCount,
  totalAsked,
  onPlayAgain,
  onHome,
  soundOn,
  onToggleSound,
  play,
}: {
  score: number;
  correctCount: number;
  totalAsked: number;
  onPlayAgain: () => void;
  onHome: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
  play: (name: "click" | "gameOver") => void;
}) {
  const bestScore = getBestScore();

  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    setBestScore(score);
    play("gameOver");
  }, [score, play]);

  const isNewBest = score > 0 && score >= bestScore;
  const showConfetti = totalAsked > 0 && correctCount / totalAsked >= 0.7;

  const handleShare = () => {
    const text = `ಸಿನಿಮಾ ಹುಡುಗ ಆಟದಲ್ಲಿ ನಾನು ${score} ಅಂಕ ಗಳಿಸಿದೆ! 🎬🏆 ನೀವೂ ಆಡಿ: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard
        .writeText(text)
        .then(() => alert("ಅಂಕ ಕಾಪಿ ಆಗಿದೆ!"))
        .catch(() => {});
    }
  };

  return (
    <div
      className="screen justify-center items-center text-center gap-5 gameover-fade-in"
      style={{ position: "relative" }}
    >
      {showConfetti && <ConfettiRain />}

      {/* Sound toggle */}
      <SoundToggle
        soundOn={soundOn}
        onToggle={() => {
          play("click");
          onToggleSound();
        }}
      />

      {/* Title */}
      <div
        style={{
          fontSize: "clamp(1.4rem, 5.5vw, 1.8rem)",
          fontWeight: 900,
          color: "oklch(0.7 0.2 30)",
          fontFamily: '"Noto Sans Kannada", sans-serif',
          letterSpacing: "0.02em",
          textShadow: "0 0 24px oklch(0.7 0.2 30 / 0.5)",
        }}
      >
        💀 ಆಟ ಮುಗಿದಿದೆ 💀
      </div>

      {/* Large score display */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        <div
          style={{
            color: "oklch(0.55 0.01 85)",
            fontSize: "0.8rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontFamily: '"Noto Sans Kannada", sans-serif',
          }}
        >
          ನಿಮ್ಮ ಅಂಕ
        </div>
        <div
          className="gameover-score-number title-font"
          style={{
            fontSize: "clamp(5rem, 20vw, 7rem)",
            fontWeight: 900,
            lineHeight: 1,
            color: "oklch(0.86 0.18 88)",
            textShadow:
              "0 0 40px oklch(0.82 0.16 85 / 0.6), 0 0 80px oklch(0.86 0.18 88 / 0.3)",
          }}
        >
          {score}
        </div>
        {isNewBest && (
          <div
            style={{
              color: "oklch(0.82 0.16 85)",
              fontSize: "0.9rem",
              fontWeight: 700,
              fontFamily: '"Noto Sans Kannada", sans-serif',
            }}
          >
            🌟 ಹೊಸ ದಾಖಲೆ!
          </div>
        )}
        <div
          style={{
            color: "oklch(0.45 0.01 85)",
            fontSize: "0.85rem",
            fontFamily: '"Noto Sans Kannada", sans-serif',
          }}
        >
          ಅತ್ಯುತ್ತಮ ಅಂಕ: {Math.max(score, bestScore)}
        </div>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-xs space-y-3 mt-2">
        <button
          type="button"
          className="gold-btn gameover-play-btn w-full py-5 text-xl"
          onClick={() => {
            play("click");
            onPlayAgain();
          }}
        >
          ಮತ್ತೆ ಆಡಿರಿ
        </button>
        <button
          type="button"
          className="w-full py-3 text-sm font-medium rounded-xl"
          style={{
            background: "oklch(0.16 0.01 85)",
            color: "oklch(0.75 0.01 95)",
            border: "1.5px solid oklch(0.82 0.16 85 / 0.3)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
            cursor: "pointer",
            transition: "opacity 0.15s ease",
          }}
          onClick={handleShare}
        >
          📤 ಅಂಕ ಹಂಚಿಕೊಳ್ಳಿ
        </button>
        <button
          type="button"
          className="w-full py-3 text-sm font-medium rounded-xl"
          style={{
            background: "oklch(0.13 0.005 85)",
            color: "oklch(0.55 0.01 85)",
            border: "1.5px solid oklch(0.22 0.01 85)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
            cursor: "pointer",
            transition: "opacity 0.15s ease",
          }}
          onClick={() => {
            play("click");
            onHome();
          }}
        >
          ಮನೆ
        </button>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [showSplash, setShowSplash] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3 | 4>(1);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    correctCount: number;
    totalCount: number;
  } | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  const [finalCorrectCount, setFinalCorrectCount] = useState(0);
  const [finalTotalAsked, setFinalTotalAsked] = useState(0);
  const [bestScore, setBestScoreState] = useState(getBestScore);
  const [unlockedLevels, setUnlockedLevels] = useState(getUnlockedLevels);
  const [quizKey, setQuizKey] = useState(0);

  const { soundOn, toggleSound, play } = useSoundEngine();

  const refreshUnlocked = () => setUnlockedLevels(getUnlockedLevels());

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    setScreen("home");
    requestAnimationFrame(() => setContentVisible(true));
  }, []);

  const handlePlay = () => setScreen("levelSelect");

  const handleSelectLevel = (level: 1 | 2 | 3 | 4) => {
    setSelectedLevel(level);
    setQuizKey((k) => k + 1);
    setScreen("quiz");
  };

  const handleLevelComplete = (
    score: number,
    correctCount: number,
    totalCount: number,
  ) => {
    setQuizResult({ score, correctCount, totalCount });
    setBestScore(score);
    setBestScoreState(getBestScore());
    refreshUnlocked();
    setScreen("levelComplete");
  };

  const handleGameOver = (
    score: number,
    correctCount: number,
    totalAsked: number,
  ) => {
    setFinalScore(score);
    setFinalCorrectCount(correctCount);
    setFinalTotalAsked(totalAsked);
    setBestScore(score);
    setBestScoreState(getBestScore());
    setScreen("gameOver");
  };

  const handlePlayAgain = () => setScreen("levelSelect");

  const handleHome = () => {
    setBestScoreState(getBestScore());
    setScreen("home");
  };

  return (
    <div className="game-container noise-bg">
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <div
        className={`relative z-10 w-full flex justify-center ${
          contentVisible ? "content-fade-in" : "content-hidden"
        }`}
      >
        {screen === "home" && (
          <HomeScreen
            onPlay={handlePlay}
            bestScore={bestScore}
            soundOn={soundOn}
            onToggleSound={toggleSound}
            play={play}
          />
        )}
        {screen === "levelSelect" && (
          <LevelSelectScreen
            onSelectLevel={handleSelectLevel}
            onHome={handleHome}
            unlockedLevels={unlockedLevels}
            soundOn={soundOn}
            onToggleSound={toggleSound}
            play={play}
          />
        )}
        {screen === "quiz" && (
          <QuizScreen
            key={quizKey}
            level={selectedLevel}
            onComplete={handleLevelComplete}
            onGameOver={handleGameOver}
            soundOn={soundOn}
            onToggleSound={toggleSound}
            play={play}
          />
        )}
        {screen === "levelComplete" && quizResult && (
          <LevelCompleteScreen
            level={selectedLevel}
            score={quizResult.score}
            correctCount={quizResult.correctCount}
            totalCount={quizResult.totalCount}
            onPlayAgain={handlePlayAgain}
            onHome={handleHome}
            soundOn={soundOn}
            onToggleSound={toggleSound}
            play={play}
          />
        )}
        {screen === "gameOver" && (
          <GameOverScreen
            score={finalScore}
            correctCount={finalCorrectCount}
            totalAsked={finalTotalAsked}
            onPlayAgain={handlePlayAgain}
            onHome={handleHome}
            soundOn={soundOn}
            onToggleSound={toggleSound}
            play={play}
          />
        )}
      </div>
    </div>
  );
}
