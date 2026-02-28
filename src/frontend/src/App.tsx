import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  | "gameOver"
  | "dailyChallenge"
  | "shop";

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
        touchAction: "manipulation",
      }}
    >
      {soundOn ? "🔊" : "🔇"}
    </button>
  );
}

// ── Coin Display ───────────────────────────────────────────────────────────
function CoinDisplay({ coins }: { coins: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "1.25rem",
        right: "4.25rem",
        background: "oklch(0.16 0.04 85)",
        border: "1.5px solid oklch(0.82 0.16 85 / 0.5)",
        borderRadius: "2rem",
        padding: "0.28rem 0.75rem",
        display: "flex",
        alignItems: "center",
        gap: "0.3rem",
        zIndex: 2,
        fontSize: "0.85rem",
        fontWeight: 800,
        color: "oklch(0.86 0.18 88)",
        fontFamily: '"Bricolage Grotesque", "Noto Sans Kannada", sans-serif',
        letterSpacing: "0.03em",
        boxShadow: "0 2px 10px oklch(0.82 0.16 85 / 0.15)",
        whiteSpace: "nowrap",
      }}
    >
      🪙 {coins}
    </div>
  );
}

// ── Streak Banner ──────────────────────────────────────────────────────────
function StreakBanner({ message }: { message: string }) {
  return (
    <div className="streak-banner" aria-live="polite">
      {message}
    </div>
  );
}

// ── Floating Coin Toast ────────────────────────────────────────────────────
interface CoinToast {
  id: number;
  amount: number;
  x: number;
  y: number;
}

function FloatingCoinToast({ toast }: { toast: CoinToast }) {
  return (
    <div
      className="coin-toast"
      style={{ left: toast.x, top: toast.y }}
      aria-hidden="true"
    >
      +{toast.amount} 🪙
    </div>
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
          src="/assets/uploads/ChatGPT-Image-Mar-1-2026-02_58_16-AM-1.png"
          alt="Cinema Huduga"
          width={120}
          height={120}
          style={{
            display: "block",
            objectFit: "contain",
            borderRadius: "22%",
          }}
        />
      </div>
      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <div
          className="splash-text-primary"
          style={{
            fontSize: "clamp(2rem, 8vw, 2.8rem)",
            fontWeight: 900,
            lineHeight: 1.3,
            letterSpacing: "0.02em",
            color: "oklch(0.86 0.18 88)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
            textShadow: "0 0 30px oklch(0.82 0.16 85 / 0.4)",
            overflow: "visible",
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
            lineHeight: 1.7,
            color: "oklch(0.6 0.01 95)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
            overflow: "visible",
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
  // ಹಂತ 1 – ಇತ್ತೀಚಿನ ಸಿನಿಮಾ
  {
    question: "ಕೆಜಿಎಫ್ ಚಿತ್ರದಲ್ಲಿ ರಾಕಿ ಪಾತ್ರವನ್ನು ನಿರ್ವಹಿಸಿದವರು ಯಾರು?",
    options: ["ರಿಷಬ್ ಶೆಟ್ಟಿ", "ಯಶ್", "ಸುಧೀಪ್", "ದರ್ಶನ್"],
    correctIndex: 1,
    level: 1,
  },
  {
    question: "ಕಾಂತಾರ ಚಿತ್ರವನ್ನು ನಿರ್ದೇಶಿಸಿದವರು ಯಾರು?",
    options: ["ಪ್ರಶಾಂತ್ ನೀಲ್", "ರಿಷಬ್ ಶೆಟ್ಟಿ", "ರಕ್ಷಿತ್ ಶೆಟ್ಟಿ", "ಗಣೇಶ್"],
    correctIndex: 1,
    level: 1,
  },
  {
    question: "777 ಚಾರ್ಲಿ ಚಿತ್ರದಲ್ಲಿ ಯಾವ ಪ್ರಾಣಿಯ ಕಥೆ ಇದೆ?",
    options: ["ಕುದುರೆ", "ನಾಯಿ", "ಹುಲಿ", "ಹಸು"],
    correctIndex: 1,
    level: 1,
  },
  {
    question: "ವಿಕ್ರಾಂತ್ ರೋಣ ಚಿತ್ರದಲ್ಲಿ ನಾಯಕ ಯಾರು?",
    options: ["ಯಶ್", "ಸುಧೀಪ್", "ದರ್ಶನ್", "ರಕ್ಷಿತ್ ಶೆಟ್ಟಿ"],
    correctIndex: 1,
    level: 1,
  },
  {
    question: "ಜೇಮ್ಸ್ ಚಿತ್ರದಲ್ಲಿ ಅಭಿನಯಿಸಿದವರು ಯಾರು?",
    options: ["ಯಶ್", "ಪುನೀತ್ ರಾಜ್‌ಕುಮಾರ್", "ಸುಧೀಪ್", "ಗಣೇಶ್"],
    correctIndex: 1,
    level: 1,
  },
  {
    question: "ಲವ್ ಮಾಕ್‌ಟೇಲ್ ಚಿತ್ರದ ನಾಯಕ ಯಾರು?",
    options: ["ಡಾರ್ಲಿಂಗ್ ಕೃಷ್ಣ", "ಯಶ್", "ಸುಧೀಪ್", "ದರ್ಶನ್"],
    correctIndex: 0,
    level: 1,
  },
  {
    question: "ಯುವರತ್ನ ಚಿತ್ರದಲ್ಲಿ ನಾಯಕ ಯಾರು?",
    options: ["ಪುನೀತ್ ರಾಜ್‌ಕುಮಾರ್", "ಯಶ್", "ದರ್ಶನ್", "ಗಣೇಶ್"],
    correctIndex: 0,
    level: 1,
  },
  {
    question: "ಅವನೇ ಶ್ರೀಮನ್ನಾರಾಯಣ ಚಿತ್ರದಲ್ಲಿ ನಾಯಕ ಯಾರು?",
    options: ["ರಕ್ಷಿತ್ ಶೆಟ್ಟಿ", "ದರ್ಶನ್", "ಯಶ್", "ಗಣೇಶ್"],
    correctIndex: 0,
    level: 1,
  },
  {
    question: "ರಾಬರ್ಟ್ ಚಿತ್ರದಲ್ಲಿ ನಾಯಕ ಯಾರು?",
    options: ["ದರ್ಶನ್", "ಯಶ್", "ಸುಧೀಪ್", "ರಕ್ಷಿತ್ ಶೆಟ್ಟಿ"],
    correctIndex: 0,
    level: 1,
  },
  {
    question: "ಕೆಜಿಎಫ್ ಕಥೆಯ ಹಿನ್ನೆಲೆ ಯಾವುದು?",
    options: ["ಚಿನ್ನದ ಗಣಿ", "ಕಾಲೇಜು", "ಕ್ರಿಕೆಟ್", "ರಾಜಕೀಯ"],
    correctIndex: 0,
    level: 1,
  },
  {
    question: "777 ಚಾರ್ಲಿ ಬಿಡುಗಡೆಯಾದ ವರ್ಷ ಯಾವುದು?",
    options: ["2022", "2021", "2020", "2019"],
    correctIndex: 0,
    level: 1,
  },
  {
    question: "ಕಾಂತಾರ ಚಿತ್ರದ ನಾಯಕಿ ಯಾರು?",
    options: ["ಸಪ್ತಮಿ ಗೌಡ", "ರಶ್ಮಿಕಾ", "ಮಿಲನಾ", "ಆಶಿಕಾ"],
    correctIndex: 0,
    level: 1,
  },
  {
    question: "ಕೆಜಿಎಫ್ ಅಧ್ಯಾಯ 1 ಬಿಡುಗಡೆಯಾದ ವರ್ಷ?",
    options: ["2018", "2019", "2020", "2022"],
    correctIndex: 0,
    level: 1,
  },
  {
    question: "ವಿಕ್ರಾಂತ್ ರೋಣ ಬಿಡುಗಡೆಯಾದ ವರ್ಷ?",
    options: ["2022", "2021", "2020", "2019"],
    correctIndex: 0,
    level: 1,
  },
  {
    question: "ಜೇಮ್ಸ್ ಚಿತ್ರ ಯಾವ ವರ್ಷದಲ್ಲಿ ಬಿಡುಗಡೆಯಾಯಿತು?",
    options: ["2022", "2021", "2020", "2019"],
    correctIndex: 0,
    level: 1,
  },

  // ಹಂತ 2 – ನಟರು
  {
    question: "ಸುಧೀಪ್ ಅವರ ಪ್ರಸಿದ್ಧ ಬಿರುದು ಯಾವುದು?",
    options: ["ಕಿಚ್ಚ", "ರಾಕಿಂಗ್ ಸ್ಟಾರ್", "ಗೋಲ್ಡನ್ ಸ್ಟಾರ್", "ಪವರ್ ಸ್ಟಾರ್"],
    correctIndex: 0,
    level: 2,
  },
  {
    question: "ಯಶ್ ಅವರಿಗೆ ಯಾವ ಬಿರುದು ಇದೆ?",
    options: ["ರಾಕಿಂಗ್ ಸ್ಟಾರ್", "ಚಾಲೆಂಜಿಂಗ್ ಸ್ಟಾರ್", "ಪವರ್ ಸ್ಟಾರ್", "ಗೋಲ್ಡನ್ ಸ್ಟಾರ್"],
    correctIndex: 0,
    level: 2,
  },
  {
    question: "ದರ್ಶನ್ ಅವರ ಮೊದಲ ಸಿನಿಮಾ ಯಾವುದು?",
    options: ["ಮಾಜೆಸ್ಟಿಕ್", "ರಾಬರ್ಟ್", "ಗಜ", "ಸಾರಥಿ"],
    correctIndex: 0,
    level: 2,
  },
  {
    question: "ರಿಷಬ್ ಶೆಟ್ಟಿ ಯಾವ ಚಿತ್ರದಲ್ಲಿ ನಟಿಸಿ ನಿರ್ದೇಶಿಸಿದರು?",
    options: ["ಕಾಂತಾರ", "ಕೆಜಿಎಫ್", "ರಾಬರ್ಟ್", "ಜೇಮ್ಸ್"],
    correctIndex: 0,
    level: 2,
  },
  {
    question: "ಪುನೀತ್ ರಾಜ್‌ಕುಮಾರ್ ಅವರ ತಂದೆ ಯಾರು?",
    options: ["ಡಾ. ರಾಜ್‌ಕುಮಾರ್", "ವಿಷ್ಣುವರ್ಧನ್", "ಅಂಬರೀಶ್", "ಶಿವರಾಜ್‌ಕುಮಾರ್"],
    correctIndex: 0,
    level: 2,
  },

  // ಹಂತ 3 – ನಿರ್ದೇಶಕರು
  {
    question: "ಉಪೇಂದ್ರ ಯಾವ ಚಿತ್ರವನ್ನು ನಿರ್ದೇಶಿಸಿದರು?",
    options: ["A", "ಕೆಜಿಎಫ್", "ಕಾಂತಾರ", "ರಾಬರ್ಟ್"],
    correctIndex: 0,
    level: 3,
  },
  {
    question: "ಜೋಗಿ ಚಿತ್ರವನ್ನು ನಿರ್ದೇಶಿಸಿದವರು ಯಾರು?",
    options: ["ಪ್ರೇಮ್", "ಪ್ರಶಾಂತ್ ನೀಲ್", "ರಿಷಬ್ ಶೆಟ್ಟಿ", "ಉಪೇಂದ್ರ"],
    correctIndex: 0,
    level: 3,
  },
  {
    question: "ಉಲಿದವರು ಕಂಡಂತೆ ಚಿತ್ರ ನಿರ್ದೇಶಕ ಯಾರು?",
    options: ["ರಕ್ಷಿತ್ ಶೆಟ್ಟಿ", "ರಿಷಬ್ ಶೆಟ್ಟಿ", "ಪ್ರೇಮ್", "ಉಪೇಂದ್ರ"],
    correctIndex: 0,
    level: 3,
  },
  {
    question: "777 ಚಾರ್ಲಿ ನಿರ್ದೇಶಕ ಯಾರು?",
    options: ["ಕಿರಣ್ ರಾಜ್", "ಪ್ರಶಾಂತ್ ನೀಲ್", "ಪ್ರೇಮ್", "ಉಪೇಂದ್ರ"],
    correctIndex: 0,
    level: 3,
  },
  {
    question: "ರಾಬರ್ಟ್ ಚಿತ್ರ ನಿರ್ದೇಶಕ ಯಾರು?",
    options: ["ತರುಣ್ ಸುಧೀರ್", "ಪ್ರೇಮ್", "ರಿಷಬ್ ಶೆಟ್ಟಿ", "ಉಪೇಂದ್ರ"],
    correctIndex: 0,
    level: 3,
  },

  // ಹಂತ 4 – ಬಾಕ್ಸ್ ಆಫೀಸ್
  {
    question: "ಕೆಜಿಎಫ್ ಅಧ್ಯಾಯ 1 ಅಂದಾಜು ಎಷ್ಟು ಸಂಗ್ರಹಿಸಿತು?",
    options: ["₹250 ಕೋಟಿ+", "₹100 ಕೋಟಿ", "₹50 ಕೋಟಿ", "₹500 ಕೋಟಿ"],
    correctIndex: 0,
    level: 4,
  },
  {
    question: "ಜೇಮ್ಸ್ ಚಿತ್ರ ಅಂದಾಜು ಎಷ್ಟು ಸಂಗ್ರಹಿಸಿತು?",
    options: ["₹150 ಕೋಟಿ+", "₹50 ಕೋಟಿ", "₹30 ಕೋಟಿ", "₹500 ಕೋಟಿ"],
    correctIndex: 0,
    level: 4,
  },
  {
    question: "ಲವ್ ಮಾಕ್‌ಟೇಲ್ ಕಡಿಮೆ ಬಜೆಟ್‌ನಲ್ಲೂ ಯಶಸ್ವಿಯಾದ್ದೇ?",
    options: ["ಹೌದು", "ಇಲ್ಲ", "ಮಧ್ಯಮ ಯಶಸ್ಸು", "ನಷ್ಟವಾಯಿತು"],
    correctIndex: 0,
    level: 4,
  },
  {
    question: "ಸ್ಯಾಂಡಲ್‌ವುಡ್ ಎಂದರೆ ಯಾವ ಚಿತ್ರರಂಗ?",
    options: ["ಕನ್ನಡ", "ಹಿಂದಿ", "ತೆಲುಗು", "ತಮಿಳು"],
    correctIndex: 0,
    level: 4,
  },
  {
    question: "ಕಾಂತಾರ ಯಾವ ಮಟ್ಟದಲ್ಲಿ ಯಶಸ್ವಿಯಾಯಿತು?",
    options: ["ಪ್ಯಾನ್ ಇಂಡಿಯಾ", "ಮಾತ್ರ ಕರ್ನಾಟಕ", "ವಿಫಲ", "OTT ಮಾತ್ರ"],
    correctIndex: 0,
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

// ── Coin helpers ───────────────────────────────────────────────────────────
function getCoins(): number {
  const val = Number.parseInt(localStorage.getItem("coins") ?? "100", 10);
  return Number.isNaN(val) ? 100 : val;
}

function saveCoins(c: number): void {
  localStorage.setItem("coins", String(Math.max(0, c)));
}

// ── Daily Challenge helpers ────────────────────────────────────────────────
function getDailyChallengeDate(): string {
  return localStorage.getItem("dailyChallengeDate") ?? "";
}

function setDailyChallengeDate(): void {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem("dailyChallengeDate", today);
}

function isDailyChallengeAvailable(): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return getDailyChallengeDate() !== today;
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
            lineHeight: 1.7,
            letterSpacing: "0.02em",
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
          <li className="flex gap-2">
            <span className="text-base">🪙</span>
            <span>
              ಸರಿ ಉತ್ತರಕ್ಕೆ{" "}
              <strong style={{ color: "oklch(0.82 0.16 85)" }}>+10 ನಾಣ್ಯ</strong>
              , ಸ್ಟ್ರೀಕ್‌ಗೆ ಬೋನಸ್.
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
  coins,
  onDailyChallenge,
  onShop,
}: {
  onPlay: () => void;
  bestScore: number;
  soundOn: boolean;
  onToggleSound: () => void;
  play: (name: "click") => void;
  coins: number;
  onDailyChallenge: () => void;
  onShop: () => void;
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

      {/* Coin display */}
      <CoinDisplay coins={coins} />

      {/* Title block */}
      <div
        className="space-y-2 pb-1"
        style={{ position: "relative", zIndex: 1 }}
      >
        <div
          className="font-black leading-none"
          style={{
            fontSize: "clamp(2.8rem, 10vw, 3.6rem)",
            color: "oklch(0.86 0.18 88)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
            fontWeight: 900,
            letterSpacing: "0.02em",
            overflow: "visible",
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
        className="w-full max-w-xs space-y-4 mt-2"
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
            background: "oklch(0.18 0.04 85)",
            color: "oklch(0.86 0.18 88)",
            border: "1.5px solid oklch(0.82 0.16 85 / 0.4)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
            transition:
              "transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.12s ease",
            cursor: "pointer",
            touchAction: "manipulation",
          }}
          onClick={() => {
            play("click");
            onDailyChallenge();
          }}
        >
          <span style={{ marginRight: "0.5rem" }}>🏅</span>ದೈನಂದಿನ ಸವಾಲು
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
            cursor: "pointer",
            touchAction: "manipulation",
          }}
          onClick={() => {
            play("click");
            onShop();
          }}
        >
          <span style={{ marginRight: "0.5rem" }}>🛒</span>ಅಂಗಡಿ
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
  coins,
}: {
  onSelectLevel: (level: 1 | 2 | 3 | 4) => void;
  onHome: () => void;
  unlockedLevels: number[];
  soundOn: boolean;
  onToggleSound: () => void;
  play: (name: "click") => void;
  coins: number;
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

      {/* Coin display */}
      <CoinDisplay coins={coins} />

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
  streak: number;
}

function QuizScreen({
  level,
  onComplete,
  onGameOver,
  soundOn,
  onToggleSound,
  play,
  coins,
  awardCoins,
  spendCoins,
  isDailyChallenge,
}: {
  level: 1 | 2 | 3 | 4;
  onComplete: (
    score: number,
    correctCount: number,
    totalCount: number,
    sessionCoins: number,
  ) => void;
  onGameOver: (
    score: number,
    correctCount: number,
    totalAsked: number,
    sessionCoins: number,
  ) => void;
  soundOn: boolean;
  onToggleSound: () => void;
  play: (
    name: "click" | "correct" | "wrong" | "levelComplete" | "gameOver",
  ) => void;
  coins: number;
  awardCoins: (amount: number, x?: number, y?: number) => void;
  spendCoins: (amount: number) => boolean;
  isDailyChallenge?: boolean;
}) {
  const levelQuestions = useMemo(
    () =>
      isDailyChallenge
        ? shuffle(QUESTIONS).slice(0, 10)
        : QUESTIONS.filter((q) => q.level === level),
    [level, isDailyChallenge],
  );

  const [state, setState] = useState<QuizState>(() => ({
    questions: shuffle(levelQuestions),
    currentIndex: 0,
    score: 0,
    lives: 3,
    correctCount: 0,
    selectedIndex: null,
    answerState: "idle",
    streak: 0,
  }));

  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answerRef = useRef<QuizState["answerState"]>("idle");
  const timeLeftRef = useRef(TIMER_DURATION);
  const sessionCoinsRef = useRef(0);

  // Power-up state
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);

  // Streak banner
  const [streakBanner, setStreakBanner] = useState<string | null>(null);
  const streakBannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Coin toasts
  const [coinToasts, setCoinToasts] = useState<CoinToast[]>([]);
  const toastIdRef = useRef(0);

  const currentQ = state.questions[state.currentIndex];
  const isAnswered = state.answerState !== "idle";

  const showCoinToast = useCallback((amount: number) => {
    const id = ++toastIdRef.current;
    const x = 50 + Math.random() * 80;
    const y = 180 + Math.random() * 60;
    setCoinToasts((prev) => [...prev, { id, amount, x, y }]);
    setTimeout(() => {
      setCoinToasts((prev) => prev.filter((t) => t.id !== id));
    }, 1300);
  }, []);

  const triggerStreak = useCallback(
    (streak: number) => {
      if (streakBannerTimerRef.current)
        clearTimeout(streakBannerTimerRef.current);

      if (streak === 3) {
        awardCoins(20);
        sessionCoinsRef.current += 20;
        showCoinToast(20);
        setStreakBanner("🔥 Streak x3! +20 🪙");
      } else if (streak === 5) {
        awardCoins(50);
        sessionCoinsRef.current += 50;
        showCoinToast(50);
        setStreakBanner("🔥🔥 Super Streak! +50 🪙");
      } else if (streak > 5 && streak % 3 === 0) {
        awardCoins(20);
        sessionCoinsRef.current += 20;
        showCoinToast(20);
        setStreakBanner(`🔥 Streak x${streak}! +20 🪙`);
      } else {
        setStreakBanner(null);
        return;
      }

      streakBannerTimerRef.current = setTimeout(() => {
        setStreakBanner(null);
      }, 1500);
    },
    [awardCoins, showCoinToast],
  );

  const advanceQuestion = useCallback(
    (newState: QuizState) => {
      const nextIndex = newState.currentIndex + 1;
      if (nextIndex >= newState.questions.length) {
        onComplete(
          newState.score,
          newState.correctCount,
          newState.questions.length,
          sessionCoinsRef.current,
        );
        return;
      }
      if (newState.lives <= 0) {
        onGameOver(
          newState.score,
          newState.correctCount,
          newState.currentIndex + 1,
          sessionCoinsRef.current,
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
      const coinsPerCorrect = isDailyChallenge ? 20 : 10;
      const pointsGained = isCorrect ? 10 + speedBonus : 0;

      const newAnswerState: QuizState["answerState"] = isCorrect
        ? "correct"
        : "wrong";
      answerRef.current = newAnswerState;

      // Play sound immediately
      play(isCorrect ? "correct" : "wrong");
      if (!isCorrect && navigator.vibrate) navigator.vibrate(200);

      if (isCorrect) {
        awardCoins(coinsPerCorrect);
        sessionCoinsRef.current += coinsPerCorrect;
        showCoinToast(coinsPerCorrect);
      }

      setState((prev) => {
        const newScore = prev.score + pointsGained;
        const newLives = isCorrect ? prev.lives : prev.lives - 1;
        const newCorrectCount = isCorrect
          ? prev.correctCount + 1
          : prev.correctCount;
        const newStreak = isCorrect ? prev.streak + 1 : 0;

        const next: QuizState = {
          ...prev,
          score: newScore,
          lives: newLives,
          correctCount: newCorrectCount,
          selectedIndex: index,
          answerState: newAnswerState,
          streak: newStreak,
        };

        if (isCorrect) {
          triggerStreak(newStreak);
        }

        setTimeout(() => {
          answerRef.current = "idle";
          advanceQuestion(next);
        }, 1500);

        return next;
      });
    },
    [
      currentQ,
      advanceQuestion,
      play,
      awardCoins,
      showCoinToast,
      triggerStreak,
      isDailyChallenge,
    ],
  );

  // Reset power-ups on new question
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - currentIndex triggers reset
  useEffect(() => {
    setFiftyFiftyUsed(false);
    setHiddenOptions([]);
  }, [state.currentIndex]);

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
            streak: 0,
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

  // Power-up: 50/50
  const handleFiftyFifty = useCallback(() => {
    if (fiftyFiftyUsed || isAnswered) return;
    if (coins < 30) {
      alert("ಸಾಕಷ್ಟು ನಾಣ್ಯಗಳಿಲ್ಲ! (30 🪙 ಬೇಕು)");
      return;
    }
    if (!spendCoins(30)) return;
    sessionCoinsRef.current -= 30;
    // Pick 2 wrong option indices
    const wrongIndices = [0, 1, 2, 3].filter(
      (i) => i !== currentQ.correctIndex,
    );
    const toHide = shuffle(wrongIndices).slice(0, 2);
    setHiddenOptions(toHide);
    setFiftyFiftyUsed(true);
  }, [fiftyFiftyUsed, isAnswered, coins, currentQ, spendCoins]);

  // Power-up: Extra Life
  const handleExtraLife = useCallback(() => {
    if (isAnswered) return;
    if (state.lives >= 3) return;
    if (coins < 50) {
      alert("ಸಾಕಷ್ಟು ನಾಣ್ಯಗಳಿಲ್ಲ! (50 🪙 ಬೇಕು)");
      return;
    }
    if (!spendCoins(50)) return;
    sessionCoinsRef.current -= 50;
    setState((prev) => ({ ...prev, lives: Math.min(3, prev.lives + 1) }));
  }, [isAnswered, state.lives, coins, spendCoins]);

  // Power-up: Skip
  const handleSkip = useCallback(() => {
    if (isAnswered) return;
    if (coins < 40) {
      alert("ಸಾಕಷ್ಟು ನಾಣ್ಯಗಳಿಲ್ಲ! (40 🪙 ಬೇಕು)");
      return;
    }
    if (!spendCoins(40)) return;
    sessionCoinsRef.current -= 40;
    if (timerRef.current) clearInterval(timerRef.current);
    answerRef.current = "idle";
    setState((prev) => {
      const next: QuizState = { ...prev };
      advanceQuestion(next);
      return next;
    });
  }, [isAnswered, coins, spendCoins, advanceQuestion]);

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

      {/* Coin display */}
      <CoinDisplay coins={coins} />

      {/* Streak banner */}
      {streakBanner && <StreakBanner message={streakBanner} />}

      {/* Floating coin toasts */}
      {coinToasts.map((t) => (
        <FloatingCoinToast key={t.id} toast={t} />
      ))}

      {/* Top bar */}
      <div
        className="flex items-center justify-between mb-2"
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
          className="text-xs font-medium tracking-wider text-center"
          style={{
            color: "oklch(0.55 0.01 85)",
            fontFamily: '"Noto Sans Kannada", "Sora", sans-serif',
          }}
        >
          {isDailyChallenge ? "ದೈನಂದಿನ ಸವಾಲು 🏅" : LEVEL_NAMES[level]}
        </div>
        <HeartIcons lives={state.lives} />
      </div>

      {/* Streak indicator */}
      {state.streak >= 2 && (
        <div
          className="text-center text-xs mb-1"
          style={{
            color: "oklch(0.82 0.16 85)",
            fontFamily: '"Bricolage Grotesque", sans-serif',
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          🔥 {state.streak} streak
        </div>
      )}

      {/* Power-ups row */}
      <div
        className="flex gap-2 justify-center mb-2"
        style={{ paddingRight: "0" }}
      >
        {/* 50/50 */}
        <button
          type="button"
          onClick={handleFiftyFifty}
          disabled={fiftyFiftyUsed || isAnswered || coins < 30}
          className="powerup-btn"
          title="50/50 – 2 ತಪ್ಪು ಆಯ್ಕೆ ತೆಗೆಯಿರಿ"
          style={{
            opacity: fiftyFiftyUsed || coins < 30 ? 0.4 : 1,
            cursor:
              fiftyFiftyUsed || coins < 30 || isAnswered
                ? "not-allowed"
                : "pointer",
          }}
        >
          <span className="powerup-icon">🎯</span>
          <span className="powerup-cost">30🪙</span>
        </button>

        {/* Extra Life */}
        <button
          type="button"
          onClick={handleExtraLife}
          disabled={isAnswered || state.lives >= 3 || coins < 50}
          className="powerup-btn"
          title="Extra Life – 1 ಜೀವ ಮರಳಿ ಪಡೆಯಿರಿ"
          style={{
            opacity: state.lives >= 3 || coins < 50 ? 0.4 : 1,
            cursor:
              state.lives >= 3 || coins < 50 || isAnswered
                ? "not-allowed"
                : "pointer",
          }}
        >
          <span className="powerup-icon">❤️</span>
          <span className="powerup-cost">50🪙</span>
        </button>

        {/* Skip */}
        <button
          type="button"
          onClick={handleSkip}
          disabled={isAnswered || coins < 40}
          className="powerup-btn"
          title="Skip – ಈ ಪ್ರಶ್ನೆ ಬಿಡಿ"
          style={{
            opacity: coins < 40 ? 0.4 : 1,
            cursor: coins < 40 || isAnswered ? "not-allowed" : "pointer",
          }}
        >
          <span className="powerup-icon">⏭️</span>
          <span className="powerup-cost">40🪙</span>
        </button>
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
            className="title-font font-semibold text-center"
            style={{
              fontSize: "clamp(1rem, 4vw, 1.2rem)",
              color: "oklch(0.92 0.01 95)",
              lineHeight: 1.65,
              letterSpacing: "0.02em",
              overflow: "visible",
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
              style={{
                visibility: hiddenOptions.includes(idx) ? "hidden" : "visible",
              }}
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
  coinsEarned,
  onPlayAgain,
  onHome,
  soundOn,
  onToggleSound,
  play,
  coins,
}: {
  level: 1 | 2 | 3 | 4;
  score: number;
  correctCount: number;
  totalCount: number;
  coinsEarned: number;
  onPlayAgain: () => void;
  onHome: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
  play: (name: "click" | "levelComplete") => void;
  coins: number;
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

      {/* Coin display */}
      <CoinDisplay coins={coins} />

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
        {coinsEarned > 0 && (
          <div className="flex justify-between">
            <span
              style={{
                color: "oklch(0.55 0.01 85)",
                fontFamily: '"Noto Sans Kannada", sans-serif',
              }}
            >
              ಗಳಿಸಿದ ನಾಣ್ಯ
            </span>
            <span
              className="title-font font-bold"
              style={{ color: "oklch(0.86 0.18 88)" }}
            >
              +{coinsEarned} 🪙
            </span>
          </div>
        )}
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

      <div className="w-full max-w-xs space-y-4">
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
            border: "1.5px solid oklch(0.82 0.16 85 / 0.3)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
            cursor: "pointer",
            touchAction: "manipulation",
            transition: "opacity 0.15s ease",
          }}
          onClick={() => {
            play("click");
            const text = `🔥 ನಾನು Cinema Huduga ನಲ್ಲಿ ${score} ಅಂಕ ಗಳಿಸಿದ್ದೇನೆ! ನೀನು ಗೆಲ್ಲಬಲ್ಲೆಯಾ?`;
            if (navigator.share) {
              navigator.share({ text }).catch(() => {});
            } else {
              navigator.clipboard
                .writeText(text)
                .then(() => alert("ಅಂಕ ಕಾಪಿ ಆಗಿದೆ!"))
                .catch(() => {});
            }
          }}
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
            touchAction: "manipulation",
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
  const pieces = useMemo<ConfettiPiece[]>(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 1.5}s`,
        duration: `${2 + Math.random() * 2}s`,
        color:
          CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: `${6 + Math.random() * 6}px`,
        rotate: `${Math.random() * 360}deg`,
      })),
    [],
  );

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
  coinsEarned,
  onPlayAgain,
  onHome,
  soundOn,
  onToggleSound,
  play,
  coins,
}: {
  score: number;
  correctCount: number;
  totalAsked: number;
  coinsEarned: number;
  onPlayAgain: () => void;
  onHome: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
  play: (name: "click" | "gameOver") => void;
  coins: number;
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
    const text = `🔥 ನಾನು Cinema Huduga ನಲ್ಲಿ ${score} ಅಂಕ ಗಳಿಸಿದ್ದೇನೆ! ನೀನು ಗೆಲ್ಲಬಲ್ಲೆಯಾ?`;
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

      {/* Coin display */}
      <CoinDisplay coins={coins} />

      {/* Title */}
      <div
        style={{
          fontSize: "clamp(1.4rem, 5.5vw, 1.8rem)",
          fontWeight: 900,
          color: "oklch(0.7 0.2 30)",
          fontFamily: '"Noto Sans Kannada", sans-serif',
          letterSpacing: "0.04em",
          lineHeight: 1.5,
          overflow: "visible",
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
            letterSpacing: "0.08em",
            lineHeight: 1.7,
            textTransform: "uppercase",
            fontFamily: '"Noto Sans Kannada", sans-serif',
            overflow: "visible",
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
        {coinsEarned > 0 && (
          <div
            style={{
              color: "oklch(0.86 0.18 88)",
              fontSize: "0.9rem",
              fontWeight: 700,
              fontFamily: '"Noto Sans Kannada", sans-serif',
            }}
          >
            ಗಳಿಸಿದ ನಾಣ್ಯ: +{coinsEarned} 🪙
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="w-full max-w-xs space-y-4 mt-2">
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

// ── Daily Challenge Screen ─────────────────────────────────────────────────
function DailyChallengeScreen({
  onHome,
  soundOn,
  onToggleSound,
  play,
  coins,
  awardCoins,
  spendCoins,
  onGameOver,
}: {
  onHome: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
  play: (
    name: "click" | "correct" | "wrong" | "levelComplete" | "gameOver",
  ) => void;
  coins: number;
  awardCoins: (amount: number, x?: number, y?: number) => void;
  spendCoins: (amount: number) => boolean;
  onGameOver: (
    score: number,
    correctCount: number,
    totalAsked: number,
    sessionCoins: number,
  ) => void;
}) {
  const available = isDailyChallengeAvailable();
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    correctCount: number;
    total: number;
  } | null>(null);
  const [quizKey, setQuizKey] = useState(0);

  const handleStart = useCallback(() => {
    setDailyChallengeDate();
    setStarted(true);
    setQuizKey((k) => k + 1);
  }, []);

  const handleComplete = useCallback(
    (
      score: number,
      correctCount: number,
      totalCount: number,
      sessionCoins: number,
    ) => {
      // Bonus +100 coins for completing daily challenge
      awardCoins(100);
      setResult({ score, correctCount, total: totalCount });
      setCompleted(true);
      play("levelComplete");
      void sessionCoins;
    },
    [awardCoins, play],
  );

  const handleDailyGameOver = useCallback(
    (
      score: number,
      correctCount: number,
      totalAsked: number,
      sessionCoins: number,
    ) => {
      onGameOver(score, correctCount, totalAsked, sessionCoins);
    },
    [onGameOver],
  );

  if (!available && !started) {
    return (
      <div
        className="screen justify-center items-center text-center gap-6"
        style={{ position: "relative" }}
      >
        <SoundToggle
          soundOn={soundOn}
          onToggle={() => {
            play("click");
            onToggleSound();
          }}
        />
        <CoinDisplay coins={coins} />

        <div
          className="text-5xl"
          style={{ filter: "drop-shadow(0 0 20px oklch(0.82 0.16 85 / 0.5))" }}
        >
          🏅
        </div>
        <h1
          className="font-black text-2xl"
          style={{
            color: "oklch(0.86 0.18 88)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
            fontWeight: 900,
          }}
        >
          ದೈನಂದಿನ ಸವಾಲು
        </h1>
        <div
          className="card-dark w-full max-w-xs p-6 text-center"
          style={{ borderColor: "oklch(0.82 0.16 85 / 0.3)" }}
        >
          <div className="text-4xl mb-3">⏳</div>
          <p
            className="text-base font-semibold"
            style={{
              color: "oklch(0.75 0.01 95)",
              fontFamily: '"Noto Sans Kannada", sans-serif',
              lineHeight: 1.7,
            }}
          >
            ಇಂದಿನ ಸವಾಲು ಮುಗಿದಿದೆ!
            <br />
            ನಾಳೆ ಮತ್ತೆ ಬನ್ನಿ
          </p>
          <p
            className="text-xs mt-2"
            style={{
              color: "oklch(0.45 0.01 85)",
              fontFamily: '"Noto Sans Kannada", sans-serif',
            }}
          >
            ಪ್ರತಿ ದಿನ ಹೊಸ 10 ಪ್ರಶ್ನೆಗಳು
          </p>
        </div>
        <button
          type="button"
          className="gold-btn w-full max-w-xs py-3 text-base"
          onClick={() => {
            play("click");
            onHome();
          }}
        >
          ← ಮನೆ
        </button>
      </div>
    );
  }

  if (completed && result) {
    return (
      <div
        className="screen justify-center items-center text-center gap-6"
        style={{ position: "relative" }}
      >
        <ConfettiRain />
        <SoundToggle
          soundOn={soundOn}
          onToggle={() => {
            play("click");
            onToggleSound();
          }}
        />
        <CoinDisplay coins={coins} />

        <div
          className="text-5xl"
          style={{ filter: "drop-shadow(0 0 20px oklch(0.82 0.16 85 / 0.6))" }}
        >
          🏅
        </div>
        <h1
          className="font-black text-3xl"
          style={{
            color: "oklch(0.86 0.18 88)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
          }}
        >
          ಸವಾಲು ಪೂರ್ಣ!
        </h1>
        <div
          className="card-dark w-full max-w-xs p-5 space-y-3"
          style={{ borderColor: "oklch(0.82 0.16 85 / 0.4)" }}
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
              {result.score}
            </span>
          </div>
          <div className="flex justify-between">
            <span
              style={{
                color: "oklch(0.55 0.01 85)",
                fontFamily: '"Noto Sans Kannada", sans-serif',
              }}
            >
              ಸರಿ ಉತ್ತರ
            </span>
            <span style={{ color: "oklch(0.72 0.19 145)" }}>
              {result.correctCount}/{result.total}
            </span>
          </div>
          <div className="flex justify-between">
            <span
              style={{
                color: "oklch(0.55 0.01 85)",
                fontFamily: '"Noto Sans Kannada", sans-serif',
              }}
            >
              ಬೋನಸ್
            </span>
            <span
              className="title-font font-bold"
              style={{ color: "oklch(0.86 0.18 88)" }}
            >
              +100 🪙
            </span>
          </div>
        </div>
        <button
          type="button"
          className="gold-btn w-full max-w-xs py-4 text-base"
          onClick={() => {
            play("click");
            onHome();
          }}
        >
          ← ಮನೆ
        </button>
      </div>
    );
  }

  if (!started) {
    return (
      <div
        className="screen justify-center items-center text-center gap-6"
        style={{ position: "relative" }}
      >
        <SoundToggle
          soundOn={soundOn}
          onToggle={() => {
            play("click");
            onToggleSound();
          }}
        />
        <CoinDisplay coins={coins} />

        <div
          className="text-5xl"
          style={{ filter: "drop-shadow(0 0 20px oklch(0.82 0.16 85 / 0.5))" }}
        >
          🏅
        </div>
        <h1
          className="font-black text-3xl"
          style={{
            color: "oklch(0.86 0.18 88)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
            fontWeight: 900,
          }}
        >
          ದೈನಂದಿನ ಸವಾಲು
        </h1>
        <div
          className="card-dark w-full max-w-xs p-5"
          style={{ borderColor: "oklch(0.82 0.16 85 / 0.3)" }}
        >
          <ul
            className="space-y-2 text-sm text-left"
            style={{
              fontFamily: '"Noto Sans Kannada", sans-serif',
              color: "oklch(0.72 0.01 95)",
              lineHeight: 1.7,
            }}
          >
            <li>🎯 10 ಯಾದೃಚ್ಛಿಕ ಪ್ರಶ್ನೆಗಳು</li>
            <li>🪙 ಸರಿ ಉತ್ತರಕ್ಕೆ +20 ನಾಣ್ಯ</li>
            <li>🏆 ಪೂರ್ಣ ಮಾಡಿದರೆ +100 ಬೋನಸ್</li>
            <li>⏰ ಪ್ರತಿ ದಿನ ಒಂದೇ ಅವಕಾಶ</li>
          </ul>
        </div>
        <div className="w-full max-w-xs space-y-3">
          <button
            type="button"
            className="gold-btn press-btn w-full py-4 text-lg"
            onClick={() => {
              play("click");
              handleStart();
            }}
          >
            ಸವಾಲು ಶುರು ಮಾಡಿ 🚀
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
              touchAction: "manipulation",
            }}
            onClick={() => {
              play("click");
              onHome();
            }}
          >
            ← ಹಿಂದೆ
          </button>
        </div>
      </div>
    );
  }

  return (
    <QuizScreen
      key={quizKey}
      level={1}
      onComplete={handleComplete}
      onGameOver={handleDailyGameOver}
      soundOn={soundOn}
      onToggleSound={onToggleSound}
      play={play}
      coins={coins}
      awardCoins={awardCoins}
      spendCoins={spendCoins}
      isDailyChallenge
    />
  );
}

// ── Shop Screen ────────────────────────────────────────────────────────────
function ShopScreen({
  onHome,
  soundOn,
  onToggleSound,
  play,
  coins,
  awardCoins,
}: {
  onHome: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
  play: (name: "click") => void;
  coins: number;
  awardCoins: (amount: number) => void;
}) {
  return (
    <div className="screen gap-6" style={{ position: "relative" }}>
      <SoundToggle
        soundOn={soundOn}
        onToggle={() => {
          play("click");
          onToggleSound();
        }}
      />
      <CoinDisplay coins={coins} />

      {/* Header */}
      <div
        className="flex items-center gap-3 mb-2"
        style={{ paddingRight: "8rem" }}
      >
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
          ←
        </button>
        <h1
          className="font-bold text-2xl flex items-center gap-2"
          style={{
            color: "oklch(0.86 0.18 88)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
            fontWeight: 900,
          }}
        >
          🛒 ಅಂಗಡಿ
        </h1>
      </div>

      {/* Balance display */}
      <div
        className="card-dark p-4 text-center"
        style={{ borderColor: "oklch(0.82 0.16 85 / 0.4)" }}
      >
        <div
          className="text-3xl font-bold title-font"
          style={{ color: "oklch(0.86 0.18 88)" }}
        >
          🪙 {coins}
        </div>
        <div
          className="text-xs mt-1"
          style={{
            color: "oklch(0.55 0.01 85)",
            fontFamily: '"Noto Sans Kannada", sans-serif',
          }}
        >
          ನಿಮ್ಮ ಪ್ರಸ್ತುತ ನಾಣ್ಯ ಬ್ಯಾಲೆನ್ಸ್
        </div>
      </div>

      {/* Shop cards */}
      <div className="space-y-4">
        {/* Card 1 – 50 coins */}
        <div
          className="card-dark p-5"
          style={{
            borderColor: "oklch(0.82 0.16 85 / 0.5)",
            background: "oklch(0.14 0.04 85 / 0.8)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <div
                className="font-black text-xl title-font"
                style={{ color: "oklch(0.86 0.18 88)" }}
              >
                50 🪙 ಗಳಿಸಿ
              </div>
              <div
                className="text-xs mt-0.5"
                style={{
                  color: "oklch(0.55 0.01 85)",
                  fontFamily: '"Noto Sans Kannada", sans-serif',
                }}
              >
                ಜಾಹೀರಾತು ನೋಡಿ ನಾಣ್ಯ ಗಳಿಸಿ
              </div>
            </div>
            <div className="text-3xl">📺</div>
          </div>
          <button
            type="button"
            className="gold-btn w-full py-3 text-sm"
            onClick={() => {
              play("click");
              alert("ಜಾಹೀರಾತು ಶೀಘ್ರದಲ್ಲೇ ಲಭ್ಯ!");
              awardCoins(50);
            }}
          >
            ಜಾಹೀರಾತು ನೋಡಿ → +50 🪙
          </button>
        </div>

        {/* Card 2 – 100 coins */}
        <div
          className="card-dark p-5"
          style={{
            borderColor: "oklch(0.82 0.16 85 / 0.5)",
            background: "oklch(0.14 0.06 85 / 0.8)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <div
                className="font-black text-xl title-font"
                style={{ color: "oklch(0.86 0.18 88)" }}
              >
                100 🪙 ಗಳಿಸಿ
              </div>
              <div
                className="text-xs mt-0.5"
                style={{
                  color: "oklch(0.55 0.01 85)",
                  fontFamily: '"Noto Sans Kannada", sans-serif',
                }}
              >
                ದೊಡ್ಡ ಜಾಹೀರಾತು – ಹೆಚ್ಚು ನಾಣ್ಯ!
              </div>
            </div>
            <div className="text-3xl">🎬</div>
          </div>
          <button
            type="button"
            className="w-full py-3 text-sm font-bold rounded-xl"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.2 0.08 85), oklch(0.16 0.05 85))",
              color: "oklch(0.86 0.18 88)",
              border: "1.5px solid oklch(0.82 0.16 85 / 0.6)",
              fontFamily:
                '"Bricolage Grotesque", "Noto Sans Kannada", sans-serif',
              cursor: "pointer",
              touchAction: "manipulation",
              letterSpacing: "0.03em",
              transition: "transform 0.1s ease",
            }}
            onClick={() => {
              play("click");
              alert("ಜಾಹೀರಾತು ಶೀಘ್ರದಲ್ಲೇ ಲಭ್ಯ!");
              awardCoins(100);
            }}
          >
            ಜಾಹೀರಾತು ನೋಡಿ (ದೊಡ್ಡದು) → +100 🪙
          </button>
        </div>
      </div>

      {/* Info note */}
      <div
        className="text-center text-xs"
        style={{
          color: "oklch(0.38 0.01 85)",
          fontFamily: '"Noto Sans Kannada", sans-serif',
        }}
      >
        ✨ ನಾಣ್ಯಗಳನ್ನು ಪವರ್-ಅಪ್ ಖರೀದಿಸಲು ಬಳಸಿ
      </div>
    </div>
  );
}

// ── Screen Transition Wrapper ─────────────────────────────────────────────
function ScreenTransition({
  screenKey,
  children,
}: {
  screenKey: string;
  children: React.ReactNode;
}) {
  return (
    <div key={screenKey} className="screen-enter w-full flex justify-center">
      {children}
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
    coinsEarned: number;
  } | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  const [finalCorrectCount, setFinalCorrectCount] = useState(0);
  const [finalTotalAsked, setFinalTotalAsked] = useState(0);
  const [finalCoinsEarned, setFinalCoinsEarned] = useState(0);
  const [bestScore, setBestScoreState] = useState(getBestScore);
  const [unlockedLevels, setUnlockedLevels] = useState(getUnlockedLevels);
  const [quizKey, setQuizKey] = useState(0);
  const [screenTransitionKey, setScreenTransitionKey] = useState(0);

  // Coin system
  const [coins, setCoins] = useState(getCoins);

  const awardCoins = useCallback((amount: number) => {
    setCoins((prev) => {
      const next = prev + amount;
      saveCoins(next);
      return next;
    });
  }, []);

  const spendCoins = useCallback((amount: number): boolean => {
    let success = false;
    setCoins((prev) => {
      if (prev < amount) return prev;
      success = true;
      const next = prev - amount;
      saveCoins(next);
      return next;
    });
    return success;
  }, []);

  const { soundOn, toggleSound, play } = useSoundEngine();

  const navigateTo = useCallback((next: Screen) => {
    setScreen(next);
    setScreenTransitionKey((k) => k + 1);
  }, []);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    setScreenTransitionKey((k) => k + 1);
    setScreen("home");
    requestAnimationFrame(() => setContentVisible(true));
  }, []);

  const handlePlay = useCallback(() => navigateTo("levelSelect"), [navigateTo]);

  const handleSelectLevel = useCallback(
    (level: 1 | 2 | 3 | 4) => {
      setSelectedLevel(level);
      setQuizKey((k) => k + 1);
      navigateTo("quiz");
    },
    [navigateTo],
  );

  const handleLevelComplete = useCallback(
    (
      score: number,
      correctCount: number,
      totalCount: number,
      sessionCoins: number,
    ) => {
      // Award level complete bonus
      awardCoins(50);
      const totalCoinsEarned = sessionCoins + 50;
      setQuizResult({
        score,
        correctCount,
        totalCount,
        coinsEarned: totalCoinsEarned,
      });
      setBestScore(score);
      setBestScoreState(getBestScore());
      setUnlockedLevels(getUnlockedLevels());
      navigateTo("levelComplete");
    },
    [navigateTo, awardCoins],
  );

  const handleGameOver = useCallback(
    (
      score: number,
      correctCount: number,
      totalAsked: number,
      sessionCoins: number,
    ) => {
      setFinalScore(score);
      setFinalCorrectCount(correctCount);
      setFinalTotalAsked(totalAsked);
      setFinalCoinsEarned(sessionCoins);
      setBestScore(score);
      setBestScoreState(getBestScore());
      navigateTo("gameOver");
    },
    [navigateTo],
  );

  const handlePlayAgain = useCallback(
    () => navigateTo("levelSelect"),
    [navigateTo],
  );

  const handleHome = useCallback(() => {
    setBestScoreState(getBestScore());
    navigateTo("home");
  }, [navigateTo]);

  const handleDailyChallenge = useCallback(
    () => navigateTo("dailyChallenge"),
    [navigateTo],
  );

  const handleShop = useCallback(() => navigateTo("shop"), [navigateTo]);

  const renderScreen = () => {
    switch (screen) {
      case "home":
        return (
          <HomeScreen
            onPlay={handlePlay}
            bestScore={bestScore}
            soundOn={soundOn}
            onToggleSound={toggleSound}
            play={play}
            coins={coins}
            onDailyChallenge={handleDailyChallenge}
            onShop={handleShop}
          />
        );
      case "levelSelect":
        return (
          <LevelSelectScreen
            onSelectLevel={handleSelectLevel}
            onHome={handleHome}
            unlockedLevels={unlockedLevels}
            soundOn={soundOn}
            onToggleSound={toggleSound}
            play={play}
            coins={coins}
          />
        );
      case "quiz":
        return (
          <QuizScreen
            key={quizKey}
            level={selectedLevel}
            onComplete={handleLevelComplete}
            onGameOver={handleGameOver}
            soundOn={soundOn}
            onToggleSound={toggleSound}
            play={play}
            coins={coins}
            awardCoins={awardCoins}
            spendCoins={spendCoins}
          />
        );
      case "levelComplete":
        return quizResult ? (
          <LevelCompleteScreen
            level={selectedLevel}
            score={quizResult.score}
            correctCount={quizResult.correctCount}
            totalCount={quizResult.totalCount}
            coinsEarned={quizResult.coinsEarned}
            onPlayAgain={handlePlayAgain}
            onHome={handleHome}
            soundOn={soundOn}
            onToggleSound={toggleSound}
            play={play}
            coins={coins}
          />
        ) : null;
      case "gameOver":
        return (
          <GameOverScreen
            score={finalScore}
            correctCount={finalCorrectCount}
            totalAsked={finalTotalAsked}
            coinsEarned={finalCoinsEarned}
            onPlayAgain={handlePlayAgain}
            onHome={handleHome}
            soundOn={soundOn}
            onToggleSound={toggleSound}
            play={play}
            coins={coins}
          />
        );
      case "dailyChallenge":
        return (
          <DailyChallengeScreen
            onHome={handleHome}
            soundOn={soundOn}
            onToggleSound={toggleSound}
            play={play}
            coins={coins}
            awardCoins={awardCoins}
            spendCoins={spendCoins}
            onGameOver={handleGameOver}
          />
        );
      case "shop":
        return (
          <ShopScreen
            onHome={handleHome}
            soundOn={soundOn}
            onToggleSound={toggleSound}
            play={play}
            coins={coins}
            awardCoins={awardCoins}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="game-container noise-bg">
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <div
        className={`relative z-10 w-full ${
          contentVisible ? "content-fade-in" : "content-hidden"
        }`}
      >
        <ScreenTransition screenKey={`${screen}-${screenTransitionKey}`}>
          {renderScreen()}
        </ScreenTransition>
      </div>
    </div>
  );
}
