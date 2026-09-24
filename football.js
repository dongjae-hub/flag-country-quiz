import { FALLBACK_RANKINGS, KOREAN_NAMES, RANKING_CACHE_KEY } from "./ranking-data.js";

const API_ROOT = "https://api.fifa.com/api/v3";
const scheduleEndpoint = `${API_ROOT}/rankingschedules/all?type=0&gender=1&language=en`;
const HISTORY_KEY = "flag-country-quiz-football-history-v1";
const TRACK = { left: 34, right: 866, top: 20, bottom: 680 };
const TRACK_LENGTH = (TRACK.right - TRACK.left) * 20;
let cameraX = 0;
const PHASES = [
  { label: "예선 1경기", heat: true, target: 4 },
  { label: "예선 2경기", heat: true, target: 4 },
  { label: "예선 3경기", heat: true, target: 4 },
  { label: "예선 4경기", heat: true, target: 4 },
  { label: "16강", target: 8 }, { label: "8강", target: 4 },
  { label: "4강", target: 2 }, { label: "결승", target: 1 }
];
const canvas = document.querySelector("#race-canvas");
const ctx = canvas.getContext("2d");
const Matter = window.Matter;
const physics = Matter.Engine.create({ gravity: { x: 0, y: 0, scale: 0 }, enableSleeping: false });
physics.positionIterations = 10;
physics.velocityIterations = 8;
const physicsBodies = { runners: [], obstacles: [], moving: [] };
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
let teams = [], activeTeams = [], heatGroups = [], heatQualified = [], phaseIndex = 0, race = null, animationId = null, lastFrame = 0;

function fetchJson(url) { return fetch(url, { headers: { Accept: "application/json" } }).then((r) => { if (!r.ok) throw new Error(`FIFA API ${r.status}`); return r.json(); }); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c])); }
function flagUrl(code) { return `https://api.fifa.com/api/v1/picture/flags-sq-4/${String(code).toLowerCase()}`; }
function shuffle(items) { return [...items].sort(() => Math.random() - 0.5); }
function random(min, max) { return min + Math.random() * (max - min); }
function weekKey(date = new Date()) { const monday = new Date(date); const day = monday.getDay(); monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1)); monday.setHours(0, 0, 0, 0); return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`; }
function readCachedRanking() { try { const cache = JSON.parse(localStorage.getItem(RANKING_CACHE_KEY) || "null"); return cache?.weekKey === weekKey() && cache.rows?.length ? cache : null; } catch { return null; } }
async function fetchFreshRanking() { const schedules = await fetchJson(scheduleEndpoint); const schedule = schedules.Results.filter((item) => item.Gender === 1).sort((a, b) => new Date(b.OfficialDate) - new Date(a.OfficialDate))[0]; if (!schedule) throw new Error("ranking schedule unavailable"); const data = await fetchJson(`${API_ROOT}/rankingsbyschedule?rankingScheduleId=${encodeURIComponent(schedule.IdRankingSchedule)}&language=en`); const rows = data.Results.filter((row) => row.StatusRanked !== 0 && row.Rank <= 100).sort((a, b) => a.Rank - b.Rank); const cache = { weekKey: weekKey(), savedAt: new Date().toISOString(), schedule, rows }; localStorage.setItem(RANKING_CACHE_KEY, JSON.stringify(cache)); return cache; }
function makeTeam(row) { const english = row.TeamName?.find((item) => item.Locale !== "ko-KR")?.Description || row.TeamName?.[0]?.Description || row.IdCountry; const name = row.TeamName?.find((item) => item.Locale === "ko-KR")?.Description || KOREAN_NAMES[english] || english; const image = new Image(); image.onload = () => { if (race) drawFrame(); else if (activeTeams.length) drawPreview(); }; image.src = flagUrl(row.IdCountry); return { rank: row.Rank, name, code: row.IdCountry, points: row.DecimalTotalPoints, image }; }
function laneY(index, count) { return TRACK.top + ((TRACK.bottom - TRACK.top) * (index + 0.5)) / count; }
function startPosition(index, count) { const columns = Math.min(5, Math.max(1, Math.ceil(Math.sqrt(count)))); const rows = Math.ceil(count / columns); return { x: TRACK.left + 22 + (index % columns) * 72, y: laneY(Math.floor(index / columns), rows) }; }
function radiusFor(rank) { return 18 + ((Math.max(1, Math.min(100, rank)) - 1) / 99) * 12; }
function createObstacles() {
  const obstacles = [];
  for (let index = 0; index < 70; index += 1) {
    const x = TRACK.left + 150 + index * ((TRACK_LENGTH - 300) / 69);
    const y = random(80, 620), length = random(80, 145), angle = random(-0.8, 0.8);
    const body = Matter.Bodies.rectangle(x, y, length, 14, { label: "spinner", density: 0.004, friction: 0, frictionAir: 0, restitution: 0.5 });
    Matter.Body.setAngle(body, angle);
    Matter.Body.setAngularVelocity(body, random(-0.045, 0.045));
    const anchor = Matter.Constraint.create({ pointA: { x, y }, bodyB: body, pointB: { x: 0, y: 0 }, length: 0, stiffness: 1, damping: 0.1 });
    obstacles.push({ type: "spinner", body, anchor, x, y, length });
  }
  Array.from({ length: 20 }, (_, index) => 0.045 + index * (0.91 / 19)).forEach((ratio, index) => {
    const x = TRACK.left + TRACK_LENGTH * ratio, baseY = random(90, 610), radius = 18;
    const body = Matter.Bodies.circle(x, baseY, radius, { label: "moving-obstacle", isStatic: true, restitution: 0.7 });
    obstacles.push({ type: "moving", body, x, baseY, radius, speed: random(1.1, 1.8), phase: index * 1.7 });
  });
  return obstacles;
}
function rebuildPhysics(runners, obstacles) {
  Matter.Composite.clear(physics.world, false, true);
  Matter.Engine.clear(physics);
  const walls = [
    Matter.Bodies.rectangle(TRACK.left + TRACK_LENGTH / 2, TRACK.top - 30, TRACK_LENGTH + 100, 60, { isStatic: true, label: "track-wall" }),
    Matter.Bodies.rectangle(TRACK.left + TRACK_LENGTH / 2, TRACK.bottom + 30, TRACK_LENGTH + 100, 60, { isStatic: true, label: "track-wall" }),
    Matter.Bodies.rectangle(TRACK.left - 30, (TRACK.top + TRACK.bottom) / 2, 60, TRACK.bottom - TRACK.top, { isStatic: true, label: "track-wall" })
  ];
  physicsBodies.runners = runners.map((runner) => {
    const body = Matter.Bodies.circle(runner.x, runner.y, runner.radius, { label: `runner:${runner.rank}`, restitution: 0.42, friction: 0.015, frictionAir: 0.018, density: 0.0015, slop: 0.01 });
    runner.body = body;
    Matter.Body.setVelocity(body, { x: random(5.5, 6.5), y: random(-0.12, 0.12) });
    return body;
  });
  physicsBodies.obstacles = obstacles.map((o) => o.body);
  physicsBodies.moving = obstacles.filter((o) => o.type === "moving");
  Matter.Composite.add(physics.world, [...walls, ...physicsBodies.runners, ...obstacles.flatMap((o) => o.anchor ? [o.body, o.anchor] : [o.body])]);
  Matter.Events.off(physics, "collisionStart");
  Matter.Events.on(physics, "collisionStart", ({ pairs }) => {
    for (const pair of pairs) {
      const a = pair.bodyA, b = pair.bodyB;
      const runnerBody = a.label.startsWith("runner:") ? a : b.label.startsWith("runner:") ? b : null;
      const otherBody = runnerBody === a ? b : a;
      if (runnerBody && (otherBody.label === "spinner" || otherBody.label === "moving-obstacle")) {
        const runner = runners.find((item) => item.body === runnerBody);
        if (runner) { runner.recovery = 1; runner.bounce = 0.35; }
      }
    }
  });
}
function drawBackground() { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "#526174"; ctx.font = "700 13px system-ui"; ctx.fillText("START", 8, 16); ctx.fillText("FINISH", canvas.width - 52, 16); }
function drawObstacle(o) { ctx.save(); if (o.type === "moving") { ctx.fillStyle = "#28384d"; ctx.beginPath(); ctx.arc(o.body.position.x, o.body.position.y, o.radius, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#efb53e"; ctx.lineWidth = 3; ctx.stroke(); } else { ctx.translate(o.body.position.x, o.body.position.y); ctx.rotate(o.body.angle); ctx.fillStyle = "#cb3d4e"; ctx.fillRect(-o.length / 2, -7, o.length, 14); ctx.fillStyle = "#7e2234"; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
function drawRunner(runner) { const r = runner.radius; ctx.save(); ctx.beginPath(); ctx.arc(runner.x, runner.y, r, 0, Math.PI * 2); ctx.clip(); if (runner.image?.complete && runner.image.naturalWidth) ctx.drawImage(runner.image, runner.x - r, runner.y - r, r * 2, r * 2); else { ctx.fillStyle = "#fff"; ctx.fillRect(runner.x - r, runner.y - r, r * 2, r * 2); ctx.fillStyle = "#26364a"; ctx.font = `700 ${Math.max(8, Math.min(15, r * 0.52))}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(runner.name || "국가", runner.x, runner.y, r * 1.8); } ctx.restore(); ctx.strokeStyle = runner.bounce > 0 ? "#f28b28" : "#1e2b3d"; ctx.lineWidth = runner.bounce > 0 ? 3 : 1.5; ctx.beginPath(); ctx.arc(runner.x, runner.y, r, 0, Math.PI * 2); ctx.stroke(); }
function drawFrame() { drawBackground(); if (!race) { ctx.save(); ctx.strokeStyle = "#182536"; ctx.lineWidth = 2; ctx.strokeRect(TRACK.left, TRACK.top, TRACK.right - TRACK.left, TRACK.bottom - TRACK.top); ctx.restore(); return; } const leader = race.runners.reduce((best, runner) => Math.max(best, runner.body.position.x), TRACK.left); cameraX = Math.max(0, Math.min(TRACK_LENGTH - canvas.width, leader - canvas.width * 0.28)); ctx.save(); ctx.translate(-cameraX, 0); ctx.strokeStyle = "#182536"; ctx.lineWidth = 2; ctx.strokeRect(TRACK.left, TRACK.top, TRACK_LENGTH, TRACK.bottom - TRACK.top); ctx.strokeStyle = "#17834b"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(TRACK.left, TRACK.top); ctx.lineTo(TRACK.left, TRACK.bottom); ctx.stroke(); ctx.strokeStyle = "#d63d4f"; ctx.beginPath(); ctx.moveTo(TRACK.left + TRACK_LENGTH, TRACK.top); ctx.lineTo(TRACK.left + TRACK_LENGTH, TRACK.bottom); ctx.stroke(); race.obstacles.forEach(drawObstacle); race.runners.forEach((runner) => { runner.x = runner.body.position.x; runner.y = runner.body.position.y; drawRunner(runner); }); ctx.restore(); }
function startRound() { const phase = PHASES[phaseIndex], count = activeTeams.length; const runners = activeTeams.map((team, index) => { const position = startPosition(index, count); return { ...team, x: position.x, y: position.y, vx: 0, vy: 0, radius: radiusFor(team.rank), finished: false, bounce: 0, recovery: 0 }; }); const obstacles = createObstacles(); rebuildPhysics(runners, obstacles); race = { runners, finishers: [], obstacles, elapsed: 0, target: phase.target, accumulator: 0 }; roundLabel.textContent = phase.heat ? `${phase.label} · 25개 팀` : phase.label; teamCount.textContent = count; raceStatus.textContent = "진행 중"; raceMessage.textContent = phase.heat ? "25개 팀이 물리 엔진 기반 충돌을 통과하며 경쟁합니다. 상위 4팀이 진출합니다." : `${phase.label}에서 상위 ${phase.target}팀이 다음 라운드로 진출합니다.`; startButton.disabled = true; lastFrame = performance.now(); cancelAnimationFrame(animationId); animationId = requestAnimationFrame(tick); }
function tick(now) { if (!race) return; const dt = Math.min(0.05, Math.max(0.001, (now - lastFrame) / 1000)); lastFrame = now; race.elapsed += dt; race.accumulator += dt * 1000; const fixedStep = 1000 / 120; while (race.accumulator >= fixedStep) { for (const runner of race.runners) { if (runner.finished) continue; runner.recovery = Math.max(0, runner.recovery - fixedStep / 1000); const recovering = runner.recovery > 0; Matter.Body.applyForce(runner.body, runner.body.position, { x: recovering ? 0.0018 : 0.00042, y: 0 }); const maxSpeed = recovering ? 12 : 8; const velocity = runner.body.velocity; if (velocity.x > maxSpeed) Matter.Body.setVelocity(runner.body, { x: maxSpeed, y: velocity.y }); if (velocity.x < 2) Matter.Body.setVelocity(runner.body, { x: 2, y: velocity.y }); } for (const obstacle of physicsBodies.moving) Matter.Body.setPosition(obstacle.body, { x: obstacle.x, y: obstacle.baseY + Math.sin(race.elapsed * obstacle.speed + obstacle.phase) * 190 }); Matter.Engine.update(physics, fixedStep); race.accumulator -= fixedStep; } for (const runner of race.runners) if (!runner.finished && runner.body.position.x >= TRACK.left + TRACK_LENGTH - runner.radius) { runner.finished = true; race.finishers.push(runner); } drawFrame(); if (race.finishers.length >= race.target) return completeRound(); animationId = requestAnimationFrame(tick); }
function renderStandings(list) { standingsList.innerHTML = list.slice(0, 16).map((team, index) => `<li><strong>${index + 1}</strong><img class="mini-flag" src="${flagUrl(team.code)}" alt=""><span>${escapeHtml(team.name)}</span><span class="rank-note">FIFA #${team.rank}</span></li>`).join(""); }
function completeRound() { cancelAnimationFrame(animationId); const phase = PHASES[phaseIndex], qualified = race.finishers.slice(0, phase.target); renderStandings(race.finishers); if (phase.heat) { heatQualified.push(...qualified); if (phaseIndex < 3) { phaseIndex += 1; activeTeams = heatGroups[phaseIndex]; startButton.disabled = false; startButton.dataset.continue = "true"; startButton.textContent = `${PHASES[phaseIndex].label} 시작`; raceStatus.textContent = "예선 완료"; raceMessage.textContent = `${qualified.map((team) => team.name).join(", ")} 진출 · 다음 25개 팀 경기를 시작하세요.`; return; } activeTeams = heatQualified; phaseIndex = 4; startButton.disabled = false; startButton.dataset.continue = "true"; startButton.textContent = "16강 시작"; raceStatus.textContent = "16강 진출"; raceMessage.textContent = "4회 예선에서 선발된 16개 팀이 결정되었습니다."; return; } activeTeams = qualified; if (phase.target === 1) { raceStatus.textContent = "우승"; raceMessage.textContent = `🏆 ${qualified[0].name}이(가) 최종 우승했습니다!`; saveHistory(qualified[0]); startButton.disabled = false; startButton.dataset.continue = "false"; startButton.textContent = "새 토너먼트"; return; } phaseIndex += 1; startButton.disabled = false; startButton.dataset.continue = "true"; startButton.textContent = `${PHASES[phaseIndex].label} 시작`; raceStatus.textContent = "라운드 완료"; raceMessage.textContent = `${phase.label} 완료 · 다음 라운드를 시작하세요.`; }
function saveHistory(winner) { const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); history.unshift({ date: new Date().toISOString(), winner: winner.name, rank: winner.rank }); localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20))); renderHistory(); }
function renderHistory() { const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); historyList.innerHTML = history.length ? history.map((item) => `<li><span>${new Date(item.date).toLocaleString("ko-KR")}</span><strong>🏆 ${escapeHtml(item.winner)} <small>(FIFA #${item.rank})</small></strong></li>`).join("") : "<li>아직 기록이 없습니다.</li>"; }
function setupTournament() { const shuffled = shuffle(teams); heatGroups = [0, 1, 2, 3].map((index) => shuffled.slice(index * 25, (index + 1) * 25)); heatQualified = []; activeTeams = heatGroups[0]; phaseIndex = 0; race = null; startButton.dataset.continue = "false"; startButton.textContent = "예선 1경기 시작"; teamCount.textContent = 25; roundLabel.textContent = "예선 1경기 · 25개 팀"; raceStatus.textContent = "준비"; raceMessage.textContent = "100개 팀을 무작위 25개씩 나눈 첫 번째 경기입니다."; drawPreview(); }
function drawPreview() { drawBackground(); activeTeams.forEach((team, index) => { const position = startPosition(index, activeTeams.length || 25); drawRunner({ ...team, x: position.x, y: position.y, radius: radiusFor(team.rank), slide: 0, bounce: 0 }); }); }
async function loadTeams() { const cached = readCachedRanking(); try { const ranking = cached || await fetchFreshRanking(); teams = ranking.rows.map(makeTeam); lastUpdate.textContent = new Date(ranking.schedule.OfficialDate).toLocaleDateString("ko-KR"); raceMessage.textContent = cached ? "이번 주 저장된 FIFA 랭킹을 사용합니다." : "이번 주 FIFA 랭킹을 저장했습니다."; } catch (error) { const schedule = { OfficialDate: "2026-07-20T00:00:00Z" }; localStorage.setItem(RANKING_CACHE_KEY, JSON.stringify({ weekKey: weekKey(), savedAt: new Date().toISOString(), schedule, rows: FALLBACK_RANKINGS })); teams = FALLBACK_RANKINGS.map(makeTeam); lastUpdate.textContent = new Date(schedule.OfficialDate).toLocaleDateString("ko-KR"); console.error(error); raceMessage.textContent = "FIFA API 연결 실패로 예비 랭킹을 사용합니다."; } loading.hidden = true; startButton.disabled = false; setupTournament(); }
startButton.addEventListener("click", () => { if (!teams.length) return; if (startButton.dataset.continue !== "true") setupTournament(); startRound(); });
resetButton.addEventListener("click", () => { cancelAnimationFrame(animationId); setupTournament(); standingsList.innerHTML = "<li>레이스를 시작하면 순위가 표시됩니다.</li>"; });
clearHistoryButton.addEventListener("click", () => { localStorage.removeItem(HISTORY_KEY); renderHistory(); });
renderHistory(); drawBackground(); loadTeams();
