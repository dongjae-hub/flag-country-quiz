import { FALLBACK_RANKINGS, KOREAN_NAMES, RANKING_CACHE_KEY } from "./ranking-data.js";

const API_ROOT = "https://api.fifa.com/api/v3";
const scheduleEndpoint = `${API_ROOT}/rankingschedules/all?type=0&gender=1&language=en`;
const rankingList = document.querySelector("#ranking-list");
const rankingMeta = document.querySelector("#ranking-meta");
const rankingStatus = document.querySelector("#ranking-status");
const refreshButton = document.querySelector("#refresh-rankings");

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[character]));
}

function movementMarkup(row) {
  const movement = Number(row.RankingMovement ?? ((row.PrevRank ?? row.Rank) - row.Rank));
  if (movement > 0) return `<span class="movement-up" aria-label="${movement}계단 상승">▲ ${movement}</span>`;
  if (movement < 0) return `<span class="movement-down" aria-label="${Math.abs(movement)}계단 하락">▼ ${Math.abs(movement)}</span>`;
  return `<span class="movement-same" aria-label="변동 없음">—</span>`;
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`FIFA API ${response.status}`);
  return response.json();
}

function weekKey(date = new Date()) {
  const monday = new Date(date);
  const day = monday.getDay();
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
}

function readCachedRanking() {
  try {
    const cache = JSON.parse(localStorage.getItem(RANKING_CACHE_KEY) || "null");
    return cache?.weekKey === weekKey() && cache.rows?.length ? cache : null;
  } catch { return null; }
}

async function fetchFreshRanking() {
  const schedules = await fetchJson(scheduleEndpoint);
  const schedule = schedules.Results?.filter((item) => item.Gender === 1).sort((a, b) => new Date(b.OfficialDate) - new Date(a.OfficialDate))[0];
  if (!schedule) throw new Error("ranking schedule unavailable");
  const data = await fetchJson(`${API_ROOT}/rankingsbyschedule?rankingScheduleId=${encodeURIComponent(schedule.IdRankingSchedule)}&language=en`);
  const rows = (data.Results || []).filter((row) => row.StatusRanked !== 0 && row.Rank <= 100).sort((a, b) => a.Rank - b.Rank);
  const cache = { weekKey: weekKey(), savedAt: new Date().toISOString(), schedule, rows };
  localStorage.setItem(RANKING_CACHE_KEY, JSON.stringify(cache));
  return cache;
}

async function loadRankings() {
  refreshButton.disabled = true;
  rankingStatus.textContent = "FIFA 공식 랭킹을 불러오는 중입니다…";
  let cached = readCachedRanking();
  let ranking;
  let sourceMessage;
  try {
    ranking = cached || await fetchFreshRanking();
    const { schedule, rows } = ranking;
    rankingList.innerHTML = rows.map((row) => {
      const englishName = row.TeamName?.find((item) => item.Locale !== "ko-KR")?.Description || row.TeamName?.[0]?.Description || row.IdCountry;
      const name = row.TeamName?.find((item) => item.Locale === "ko-KR")?.Description || KOREAN_NAMES[englishName] || englishName;
      const points = Number(row.DecimalTotalPoints ?? row.TotalPoints).toLocaleString("ko-KR", { maximumFractionDigits: 2 });
      const flagUrl = `https://api.fifa.com/api/v1/picture/flags-sq-4/${String(row.IdCountry).toLowerCase()}`;
      return `<tr><td><strong>${row.Rank}</strong></td><td><span class="team"><img src="${flagUrl}" alt="">${escapeHtml(name)}</span></td><td>${movementMarkup(row)}</td><td>${points}</td></tr>`;
    }).join("");
    const officialDate = new Date(schedule.OfficialDate).toLocaleDateString("ko-KR", { year:"numeric", month:"long", day:"numeric" });
    rankingMeta.textContent = `공식 업데이트: ${officialDate} · 남자 국가대표팀 · 1~100위`;
    rankingStatus.textContent = `${rows.length}개 국가를 표시했습니다. ${cached ? "이번 주 저장 데이터를 사용했습니다." : "이번 주 FIFA 데이터를 저장했습니다."}`;
  } catch (error) {
    ranking = { schedule:{ OfficialDate:"2026-07-20T00:00:00Z" }, rows:FALLBACK_RANKINGS };
    localStorage.setItem(RANKING_CACHE_KEY, JSON.stringify({ weekKey:weekKey(), savedAt:new Date().toISOString(), schedule:ranking.schedule, rows:ranking.rows }));
    const { schedule, rows } = ranking;
    rankingList.innerHTML = rows.map((row) => {
      const englishName = row.TeamName?.find((item) => item.Locale !== "ko-KR")?.Description || row.TeamName?.[0]?.Description || row.IdCountry;
      const name = row.TeamName?.find((item) => item.Locale === "ko-KR")?.Description || KOREAN_NAMES[englishName] || englishName;
      const points = Number(row.DecimalTotalPoints ?? row.TotalPoints).toLocaleString("ko-KR", { maximumFractionDigits: 2 });
      const flagUrl = `https://api.fifa.com/api/v1/picture/flags-sq-4/${String(row.IdCountry).toLowerCase()}`;
      return `<tr><td><strong>${row.Rank}</strong></td><td><span class="team"><img src="${flagUrl}" alt="">${escapeHtml(name)}</span></td><td>${movementMarkup(row)}</td><td>${points}</td></tr>`;
    }).join("");
    rankingMeta.textContent = `예비 데이터 기준 업데이트: ${new Date(schedule.OfficialDate).toLocaleDateString("ko-KR")} · 남자 국가대표팀 · 1~100위`;
    rankingStatus.textContent = "FIFA API 연결에 실패해 제공된 예비 랭킹을 사용했습니다.";
    console.error(error);
  } finally {
    refreshButton.disabled = false;
  }
}

refreshButton.addEventListener("click", loadRankings);
loadRankings();
