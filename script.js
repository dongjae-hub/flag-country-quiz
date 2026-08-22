const COUNTRIES = [
  ["대한민국", "🇰🇷"], ["일본", "🇯🇵"], ["미국", "🇺🇸"], ["캐나다", "🇨🇦"],
  ["브라질", "🇧🇷"], ["영국", "🇬🇧"], ["프랑스", "🇫🇷"], ["독일", "🇩🇪"],
  ["이탈리아", "🇮🇹"], ["스페인", "🇪🇸"], ["인도", "🇮🇳"], ["호주", "🇦🇺"],
  ["멕시코", "🇲🇽"], ["스위스", "🇨🇭"], ["터키", "🇹🇷"], ["남아프리카공화국", "🇿🇦"],
];
const TOTAL = 10;
const flag = document.querySelector("#flag");
const answers = document.querySelector("#answers");
const feedback = document.querySelector("#feedback");
const next = document.querySelector("#next");
const restart = document.querySelector("#restart");
const result = document.querySelector("#result");
const questionNumber = document.querySelector("#question-number");
const scoreElement = document.querySelector("#score");
const streakElement = document.querySelector("#streak");
const finalScore = document.querySelector("#final-score");
const resultMessage = document.querySelector("#result-message");
let question = 0;
let score = 0;
let streak = 0;
let current = null;

function shuffle(items) { return [...items].sort(() => Math.random() - .5); }

function newQuestion() {
  if (question >= TOTAL) return finish();
  question += 1;
  const correct = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  const wrong = shuffle(COUNTRIES.filter(([name]) => name !== correct[0])).slice(0, 3);
  current = correct;
  questionNumber.textContent = `${question} / ${TOTAL}`;
  flag.textContent = correct[1];
  flag.setAttribute("aria-label", `${correct[0]} 국기`);
  feedback.textContent = "정답을 선택하세요";
  feedback.className = "feedback";
  next.hidden = true;
  answers.innerHTML = shuffle([correct, ...wrong]).map(([name]) => `<button class="answer" type="button" data-answer="${name}">${name}</button>`).join("");
}

function choose(button) {
  const chosen = button.dataset.answer;
  const correct = chosen === current[0];
  answers.querySelectorAll("button").forEach((item) => { item.disabled = true; if (item.dataset.answer === current[0]) item.classList.add("correct"); });
  if (correct) { score += 1; streak += 1; button.classList.add("correct"); feedback.textContent = "정답입니다!"; feedback.className = "feedback good"; }
  else { streak = 0; button.classList.add("wrong"); feedback.textContent = `아쉬워요. 정답은 ${current[0]}입니다.`; feedback.className = "feedback bad"; }
  scoreElement.textContent = score;
  streakElement.textContent = streak;
  next.hidden = false;
}

function finish() {
  document.querySelector(".quiz-card").hidden = true;
  finalScore.textContent = score;
  resultMessage.textContent = score >= 8 ? "대단해요! 국기 박사에 가까워졌습니다." : score >= 5 ? "좋아요! 조금만 더 연습해 보세요." : "다시 도전해서 점수를 높여보세요.";
  result.hidden = false;
}

answers.addEventListener("click", (event) => { const button = event.target.closest("[data-answer]"); if (button) choose(button); });
next.addEventListener("click", newQuestion);
restart.addEventListener("click", () => { question = 0; score = 0; streak = 0; scoreElement.textContent = "0"; streakElement.textContent = "0"; result.hidden = true; document.querySelector(".quiz-card").hidden = false; newQuestion(); });
newQuestion();
