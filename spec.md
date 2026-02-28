# Cinema Huduga – Kannada Movie Quiz

## Current State
A mobile-first Kannada cinema quiz game in `src/frontend/src/App.tsx` (1867 lines). Features:
- Splash screen with golden spotlight, fade-in/out, app logo, Kannada text
- Home screen with animated background, best score glassmorphism card, sound toggle
- Level select: 4 levels, locked/unlocked via localStorage (`unlockedLevels`)
- Quiz screen: 15s circular timer, 3 lives (hearts), score counter, progress bar, answer feedback, vibration on wrong
- Level complete screen: pass/fail (70% threshold), unlock next level, share score
- Game over screen: cinematic score reveal, confetti if >70%, share button
- Sound engine via `useSoundEngine` hook (Web Audio API)
- All UI in Kannada, Noto Sans Kannada font
- Questions: 35 total (15 Level1, 5 each Level2-4) in hardcoded `QUESTIONS` array
- Best score, unlocked levels stored in localStorage

## Requested Changes (Diff)

### Add
1. **Coin System** – `coins` stored in localStorage (default 100). Display coin counter (🪙 N) at top-right of every screen alongside sound toggle. Award coins: +10 correct answer, +50 level complete, +20 on 3-streak, +50 on 5-streak. Floating "+10 🪙" toast animation on coin award. Coin balance must persist.
2. **Streak System** – Track consecutive correct answers in quiz state. Show animated streak banner: "🔥 Streak x3!" at streak=3, "🔥🔥 Super Streak!" at streak=5+. Reset streak on wrong/timeout.
3. **Power-Ups Row** – In quiz screen, add a row of 3 power-up buttons below the top bar:
   - 50/50 (cost 30): hide 2 wrong options (mark as invisible but keep layout)
   - Extra Life (cost 50): restore 1 life (max 3)
   - Skip Question (cost 40): advance to next question (no life lost)
   - Disable if insufficient coins; show Kannada alert "ಸಾಕಷ್ಟು ನಾಣ್ಯಗಳಿಲ್ಲ!"
4. **Daily Challenge Mode** – New screen `"dailyChallenge"`. 10 random questions from all levels. One attempt per day (store `dailyChallengeDate` in localStorage as ISO date string). On home screen add "ದೈನಂದಿನ ಸವಾಲು 🏅" button. Higher rewards: +20 coins per correct, +100 coins on completion. Show "ಇಂದಿನ ಸವಾಲು ಮುಗಿದಿದೆ! ನಾಳೆ ಮತ್ತೆ ಬನ್ನಿ" if already attempted.
5. **Shop Screen** – New screen `"shop"`. Accessible from home via "ಅಂಗಡಿ 🛒" button. Two cards:
   - Watch Ad → Get 50 coins (placeholder button, shows "ಜಾಹೀರಾತು ನೋಡಿ" alert)
   - Watch Ad → Get 100 coins (placeholder button)
   Clean gold + black design with coin counter at top.
6. **Game Over screen coins earned** – Show coins earned this session in game over screen alongside the score.
7. **Floating coin toast animation** – CSS keyframe animation for "+10 🪙" floating up and fading out.

### Modify
1. **QuizScreen** – Add streak tracking (reset on wrong/timeout), power-ups row, coin awarding logic, streak banner display. Pass `coins`, `setCoins` down from App. Pass `isDailyChallenge` flag for different rewards.
2. **HomeScreen** – Add "ದೈನಂದಿನ ಸವಾಲು 🏅" and "ಅಂಗಡಿ 🛒" buttons. Show coin counter badge.
3. **GameOverScreen** – Show `coinsEarned` prop in result card.
4. **LevelCompleteScreen** – Award +50 coins on level complete, show coins earned.
5. **App state** – Add `coins` state (localStorage-backed), `screen` type to include `"shop"` and `"dailyChallenge"`, `coinsEarned` tracking per session, `isDailyChallenge` flag.
6. **index.css** – Add floating coin toast animation keyframes, streak banner animation keyframes.

### Remove
- Nothing removed. All existing questions, level logic, scoring, and unlocking are preserved exactly.

## Implementation Plan
1. Add `getCoins`/`setCoins` localStorage helpers alongside existing `getBestScore`/`setBestScore`.
2. Extend `Screen` type with `"shop"` and `"dailyChallenge"`.
3. Add `coins` state to App, pass to all screens that need it.
4. Add `CoinDisplay` component (coin icon + count, top-right area or inline with sound toggle).
5. Add streak state to QuizScreen; display streak banner with CSS animation.
6. Add `FloatingCoinToast` component with keyframe animation in CSS.
7. Add power-ups row to QuizScreen with 50/50, Extra Life, Skip logic.
8. Add daily challenge logic: check localStorage date, draw 10 random questions from full QUESTIONS array.
9. Add DailyChallengeScreen component (reuses quiz logic with `isDailyChallenge` flag).
10. Add ShopScreen component with two ad placeholder cards.
11. Update HomeScreen with new buttons (Daily Challenge, Shop).
12. Update GameOverScreen and LevelCompleteScreen to show coins earned.
13. Add CSS keyframes for streak banner, floating coin toast in index.css.
