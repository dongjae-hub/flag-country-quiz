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

async function loadRankings() {
  refreshButton.disabled = true;
  rankingStatus.textContent = "FIFA 공식 랭킹을 불러오는 중입니다…";
  try {
    const schedules = await fetchJson(scheduleEndpoint);
    const schedule = schedules.Results?.filter((item) => item.Gender === 1).sort((a, b) => new Date(b.OfficialDate) - new Date(a.OfficialDate))[0];
    if (!schedule) throw new Error("ranking schedule unavailable");
    const data = await fetchJson(`${API_ROOT}/rankingsbyschedule?rankingScheduleId=${encodeURIComponent(schedule.IdRankingSchedule)}&language=en`);
    const rows = (data.Results || []).filter((row) => row.StatusRanked !== 0 && row.Rank <= 100).sort((a, b) => a.Rank - b.Rank);
    rankingList.innerHTML = rows.map((row) => {
      const name = row.TeamName?.find((item) => item.Locale === "ko-KR")?.Description || row.TeamName?.[0]?.Description || row.IdCountry;
      const points = Number(row.DecimalTotalPoints ?? row.TotalPoints).toLocaleString("ko-KR", { maximumFractionDigits: 2 });
      const flagUrl = `https://api.fifa.com/api/v1/picture/flags-sq-4/${String(row.IdCountry).toLowerCase()}`;
      return `<tr><td><strong>${row.Rank}</strong></td><td><span class="team"><img src="${flagUrl}" alt="">${escapeHtml(name)}</span></td><td>${movementMarkup(row)}</td><td>${points}</td></tr>`;
    }).join("");
    const officialDate = new Date(schedule.OfficialDate).toLocaleDateString("ko-KR", { year:"numeric", month:"long", day:"numeric" });
    rankingMeta.textContent = `공식 업데이트: ${officialDate} · 남자 국가대표팀 · 1~100위`;
    rankingStatus.textContent = `${rows.length}개 국가를 표시했습니다.`;
  } catch (error) {
    rankingList.innerHTML = "";
    rankingStatus.textContent = "랭킹을 불러오지 못했습니다. 잠시 후 다시 시도하거나 FIFA 공식 페이지를 확인해 주세요.";
    rankingMeta.textContent = "실시간 FIFA 공식 데이터 연결 실패";
    console.error(error);
  } finally {
    refreshButton.disabled = false;
  }
}

refreshButton.addEventListener("click", loadRankings);
loadRankings();
