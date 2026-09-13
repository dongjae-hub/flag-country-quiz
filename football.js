import { FALLBACK_RANKINGS, KOREAN_NAMES, RANKING_CACHE_KEY } from "./ranking-data.js";

const API_ROOT = "https://api.fifa.com/api/v3";
const scheduleEndpoint = `${API_ROOT}/rankingschedules/all?type=0&gender=1&language=en`;
const PHASES = [{ label:"100강", from:100, to:64 }, { label:"64강", from:64, to:32 }, { label:"32강", from:32, to:16 }, { label:"16강", from:16, to:8 }, { label:"8강", from:8, to:4 }, { label:"4강", from:4, to:2 }, { label:"결승", from:2, to:1 }];
const HISTORY_KEY = "flag-country-quiz-football-history-v1";
const canvas = document.querySelector("#race-canvas");
const ctx = canvas.getContext("2d");
const loading = document.querySelector("#canvas-loading");
const startButton = document.querySelector("#start-race");
const resetButton = document.querySelector("#reset-race");
const clearHistoryButton = document.querySelector("#clear-history");
const roundLabel = document.querySelector("#round-label");
const teamCount = document.querySelector("#team-count");
const raceStatus = document.querySelector("#race-status");
const raceMessage = document.querySelector("#race-message");
const standingsList = document.querySelector("#standings-list");
const historyList = document.querySelector("#history-list");
const lastUpdate = document.querySelector("#last-update");
let teams = [];
let activeTeams = [];
let phaseIndex = 0;
let race = null;
let animationId = null;
let lastFrame = 0;

function fetchJson(url) { return fetch(url, { headers: { Accept:"application/json" } }).then((response) => { if (!response.ok) throw new Error(`FIFA API ${response.status}`); return response.json(); }); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[character])); }
function flagUrl(code) { return `https://api.fifa.com/api/v1/picture/flags-sq-4/${String(code).toLowerCase()}`; }
function randomBetween(min, max) { return min + Math.random() * (max - min); }
function weekKey(date = new Date()) { const monday = new Date(date); const day = monday.getDay(); monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1)); monday.setHours(0, 0, 0, 0); return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`; }
function readCachedRanking() { try { const cache = JSON.parse(localStorage.getItem(RANKING_CACHE_KEY) || "null"); return cache?.weekKey === weekKey() && cache.rows?.length ? cache : null; } catch { return null; } }
async function fetchFreshRanking() { const schedules = await fetchJson(scheduleEndpoint); const schedule = schedules.Results.filter((item) => item.Gender === 1).sort((a,b) => new Date(b.OfficialDate) - new Date(a.OfficialDate))[0]; if (!schedule) throw new Error("ranking schedule unavailable"); const data = await fetchJson(`${API_ROOT}/rankingsbyschedule?rankingScheduleId=${encodeURIComponent(schedule.IdRankingSchedule)}&language=en`); const rows = data.Results.filter((row) => row.StatusRanked !== 0 && row.Rank <= 100).sort((a,b) => a.Rank - b.Rank); const cache = { weekKey:weekKey(), savedAt:new Date().toISOString(), schedule, rows }; localStorage.setItem(RANKING_CACHE_KEY, JSON.stringify(cache)); return cache; }

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#8db9d8"); gradient.addColorStop(.5, "#cfe5f4"); gradient.addColorStop(1, "#86b2d2");
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255,255,255,.45)";
  for (let y = 28; y < canvas.height - 28; y += 7) ctx.fillRect(0, y, canvas.width, 1);
  ctx.fillStyle = "#fff"; ctx.fillRect(28, 0, 6, canvas.height); ctx.fillRect(canvas.width - 34, 0, 7, canvas.height);
  ctx.fillStyle = "#38506d"; ctx.font = "700 17px system-ui"; ctx.fillText("START", 10, 22); ctx.fillText("FINISH", canvas.width - 83, 22);
}

function createObstacles() {
  const types = ["wall", "bump", "net", "spinner"];
  return Array.from({ length: 11 }, (_, index) => ({ type: types[index % types.length], x: 105 + index * 67 + randomBetween(-15, 15), angle: randomBetween(-.35, .35), hit:new Set(), rotation:randomBetween(0, Math.PI * 2) }));
}

function startRound() {
  const phase = PHASES[phaseIndex];
  const runners = activeTeams.map((team, index) => ({ ...team, lane:index, progress:0, pause:0, finished:false, obstacles:new Set(), speed:randomBetween(.94,1.08) * (1 + (101 - team.rank) / 850) }));
  race = { runners, finishers:[], obstacles:createObstacles(), elapsed:0, target:phase.to };
  roundLabel.textContent = phase.label; teamCount.textContent = runners.length; raceStatus.textContent = "진행 중"; raceMessage.textContent = `${phase.label} 레이스: 먼저 결승선을 통과한 ${phase.to}개 팀이 다음 라운드로 진출합니다.`; startButton.disabled = true; lastFrame = performance.now();
  cancelAnimationFrame(animationId); animationId = requestAnimationFrame(tick);
}

function obstacleCollision(runner, obstacle) {
  if (runner.obstacles.has(obstacle)) return;
  if (Math.abs(runner.progress - obstacle.x) > 13) return;
  runner.obstacles.add(obstacle);
  if (obstacle.type === "net") runner.pause = 1;
  if (obstacle.type === "wall") runner.progress = Math.max(0, runner.progress - 7);
  if (obstacle.type === "bump") runner.speed *= .78;
  if (obstacle.type === "spinner") runner.speed *= .86;
}

function drawObstacle(obstacle) {
  ctx.save(); ctx.translate(obstacle.x, canvas.height / 2);
  if (obstacle.type === "wall") { ctx.rotate(obstacle.angle); ctx.fillStyle = "#75604e"; ctx.fillRect(-7, -canvas.height * .6, 14, canvas.height * 1.2); }
  if (obstacle.type === "bump") { ctx.fillStyle = "#977b68"; for (let y = -250; y < 251; y += 70) { ctx.beginPath(); ctx.arc(0, y, 18, 0, Math.PI * 2); ctx.fill(); } }
  if (obstacle.type === "net") { ctx.strokeStyle = "rgba(244,248,255,.95)"; ctx.lineWidth = 2; for (let y = -330; y < 331; y += 22) { ctx.beginPath(); ctx.moveTo(-8, y); ctx.lineTo(8, y + 28); ctx.stroke(); } ctx.strokeStyle = "#38506d"; ctx.lineWidth = 4; ctx.strokeRect(-10, -canvas.height * .46, 20, canvas.height * .92); }
  if (obstacle.type === "spinner") { ctx.rotate(obstacle.rotation + (race?.elapsed || 0) * 2); ctx.strokeStyle = "#d34d62"; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, -100); ctx.lineTo(0, 100); ctx.stroke(); ctx.fillStyle = "#8c2638"; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

function drawRunner(runner) {
  const laneHeight = (canvas.height - 40) / Math.max(1, race.runners.length - 1);
  const x = 40 + runner.progress;
  const y = 20 + runner.lane * laneHeight;
  const radius = 5 + ((runner.rank - 1) / 99) * 5;
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.clip();
  if (runner.image?.complete && runner.image.naturalWidth) ctx.drawImage(runner.image, x - radius, y - radius, radius * 2, radius * 2);
  else { ctx.fillStyle = `hsl(${(runner.rank * 37) % 360} 70% 52%)`; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2); }
  ctx.restore(); ctx.strokeStyle = runner.pause > 0 ? "#e22" : "#fff"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.stroke();
}

function drawFrame() { drawBackground(); race.obstacles.forEach(drawObstacle); race.runners.forEach(drawRunner); }

function tick(now) {
  const dt = Math.min(0.05, (now - lastFrame) / 1000); lastFrame = now; race.elapsed += dt;
  race.runners.forEach((runner) => { if (runner.finished) return; if (runner.pause > 0) runner.pause = Math.max(0, runner.pause - dt); else { runner.progress += 15 * runner.speed * dt * (phaseIndex ? 1.35 : 1); race.obstacles.forEach((obstacle) => obstacleCollision(runner, obstacle)); } if (runner.progress >= canvas.width - 80) { runner.progress = canvas.width - 80; runner.finished = true; race.finishers.push(runner); } });
  drawFrame();
  if (race.finishers.length >= race.target) return completeRound();
  animationId = requestAnimationFrame(tick);
}

function renderStandings(list) { standingsList.innerHTML = list.slice(0, 12).map((team, index) => `<li><strong>${index + 1}</strong><img class="mini-flag" src="${flagUrl(team.code)}" alt=""><span>${escapeHtml(team.name)}</span><span class="rank-note">FIFA #${team.rank}</span></li>`).join(""); }

function completeRound() {
  cancelAnimationFrame(animationId); const phase = PHASES[phaseIndex]; const qualified = race.finishers.slice(0, phase.to); activeTeams = qualified; renderStandings(race.finishers); raceStatus.textContent = phase.to === 1 ? "우승" : "완료"; raceMessage.textContent = phase.to === 1 ? `🏆 ${qualified[0].name}이(가) 최종 우승했습니다!` : `${phase.label} 완료 · ${qualified.length}개 팀이 다음 라운드에 진출합니다.`; saveHistoryIfFinished(qualified[0], phase.to === 1);
  if (phase.to === 1) { startButton.disabled = false; startButton.textContent = "새 토너먼트"; startButton.dataset.continue = "false"; return; }
  phaseIndex += 1; startButton.disabled = false; startButton.textContent = `${PHASES[phaseIndex].label} 시작`; startButton.dataset.continue = "true";
}

function saveHistoryIfFinished(winner, finished) { if (!finished) return; const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); history.unshift({ date:new Date().toISOString(), winner:winner.name, rank:winner.rank }); localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20))); renderHistory(); }
function renderHistory() { const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); historyList.innerHTML = history.length ? history.map((item) => `<li><span>${new Date(item.date).toLocaleString("ko-KR")}</span><strong>🏆 ${escapeHtml(item.winner)} <small>(FIFA #${item.rank})</small></strong></li>`).join("") : "<li>아직 기록이 없습니다.</li>"; }

async function loadTeams() {
  const cached = readCachedRanking();
  try {
    const ranking = cached || await fetchFreshRanking();
    const { schedule, rows } = ranking;
    teams = rows.map((row) => { const englishName = row.TeamName?.find((item) => item.Locale !== "ko-KR")?.Description || row.TeamName?.[0]?.Description || row.IdCountry; return { rank:row.Rank, name:row.TeamName?.find((item) => item.Locale === "ko-KR")?.Description || KOREAN_NAMES[englishName] || englishName, code:row.IdCountry, points:row.DecimalTotalPoints, image:Object.assign(new Image(), { src:flagUrl(row.IdCountry) }) }; });
    activeTeams = teams; loading.hidden = true; startButton.disabled = false; roundLabel.textContent = "FIFA TOP 100"; teamCount.textContent = teams.length; raceStatus.textContent = "준비"; lastUpdate.textContent = new Date(schedule.OfficialDate).toLocaleDateString("ko-KR"); raceMessage.textContent = `${teams.length}개 국가를 준비했습니다. ${cached ? "이번 주 저장된 FIFA 랭킹을 사용합니다." : "이번 주 FIFA 랭킹을 저장했습니다."}`; drawBackground();
  } catch (error) {
    const schedule = { OfficialDate:"2026-07-20T00:00:00Z" };
    localStorage.setItem(RANKING_CACHE_KEY, JSON.stringify({ weekKey:weekKey(), savedAt:new Date().toISOString(), schedule, rows:FALLBACK_RANKINGS }));
    teams = FALLBACK_RANKINGS.map((row) => ({ rank:row.Rank, name:row.TeamName[0].Description, code:row.IdCountry, points:row.DecimalTotalPoints, image:Object.assign(new Image(), { src:flagUrl(row.IdCountry) }) }));
    activeTeams = teams; loading.hidden = true; startButton.disabled = false; roundLabel.textContent = "FIFA TOP 100"; teamCount.textContent = teams.length; raceStatus.textContent = "준비"; lastUpdate.textContent = new Date(schedule.OfficialDate).toLocaleDateString("ko-KR"); raceMessage.textContent = "FIFA API 연결 실패로 예비 랭킹을 사용합니다. 레이스를 시작하세요."; drawBackground(); console.error(error);
  }
}

startButton.addEventListener("click", () => { if (!teams.length) return; if (startButton.dataset.continue !== "true") { activeTeams = teams; phaseIndex = 0; } startButton.dataset.continue = "false"; startRound(); });
resetButton.addEventListener("click", () => { cancelAnimationFrame(animationId); activeTeams = teams; phaseIndex = 0; race = null; startButton.textContent = "레이스 시작"; startButton.dataset.continue = "false"; startButton.disabled = !teams.length; teamCount.textContent = teams.length || 100; roundLabel.textContent = "FIFA TOP 100"; raceStatus.textContent = "준비"; raceMessage.textContent = teams.length ? "레이스를 시작하세요." : "FIFA TOP 100을 불러오는 중입니다…"; drawBackground(); standingsList.innerHTML = "<li>레이스를 시작하면 순위가 표시됩니다.</li>"; });
clearHistoryButton.addEventListener("click", () => { localStorage.removeItem(HISTORY_KEY); renderHistory(); });
renderHistory(); drawBackground(); loadTeams();
