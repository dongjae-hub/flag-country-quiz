const COUNTRY_DATA = [
  ["대한민국","KR"],["일본","JP"],["중국","CN"],["몽골","MN"],["대만","TW"],["베트남","VN"],["태국","TH"],["필리핀","PH"],["인도네시아","ID"],["말레이시아","MY"],["싱가포르","SG"],["인도","IN"],["파키스탄","PK"],["방글라데시","BD"],["네팔","NP"],["스리랑카","LK"],["미얀마","MM"],["캄보디아","KH"],["라오스","LA"],["브루나이","BN"],["부탄","BT"],["몰디브","MV"],["동티모르","TL"],
  ["미국","US"],["캐나다","CA"],["멕시코","MX"],["브라질","BR"],["아르헨티나","AR"],["칠레","CL"],["페루","PE"],["콜롬비아","CO"],["에콰도르","EC"],["볼리비아","BO"],["파라과이","PY"],["우루과이","UY"],["베네수엘라","VE"],["쿠바","CU"],["자메이카","JM"],["아이티","HT"],["도미니카공화국","DO"],["코스타리카","CR"],["파나마","PA"],["과테말라","GT"],["온두라스","HN"],["엘살바도르","SV"],["니카라과","NI"],["바하마","BS"],["바베이도스","BB"],["트리니다드토바고","TT"],["가이아나","GY"],["수리남","SR"],["벨리즈","BZ"],["그레나다","GD"],["세인트루시아","LC"],["도미니카연방","DM"],["피지","FJ"],["파푸아뉴기니","PG"],["사모아","WS"],["통가","TO"],["바누아투","VU"],["솔로몬제도","SB"],["미크로네시아","FM"],["팔라우","PW"],["마셜제도","MH"],["키리바시","KI"],["나우루","NR"],["투발루","TV"],["호주","AU"],["뉴질랜드","NZ"],
  ["영국","GB"],["아일랜드","IE"],["프랑스","FR"],["독일","DE"],["이탈리아","IT"],["스페인","ES"],["포르투갈","PT"],["네덜란드","NL"],["벨기에","BE"],["룩셈부르크","LU"],["스위스","CH"],["오스트리아","AT"],["폴란드","PL"],["체코","CZ"],["슬로바키아","SK"],["헝가리","HU"],["루마니아","RO"],["불가리아","BG"],["그리스","GR"],["크로아티아","HR"],["슬로베니아","SI"],["세르비아","RS"],["보스니아 헤르체고비나","BA"],["몬테네그로","ME"],["북마케도니아","MK"],["알바니아","AL"],["우크라이나","UA"],["벨라루스","BY"],["몰도바","MD"],["러시아","RU"],["에스토니아","EE"],["라트비아","LV"],["리투아니아","LT"],["핀란드","FI"],["스웨덴","SE"],["노르웨이","NO"],["덴마크","DK"],["아이슬란드","IS"],["몰타","MT"],["키프로스","CY"],["튀르키예","TR"],
  ["이집트","EG"],["모로코","MA"],["알제리","DZ"],["튀니지","TN"],["리비아","LY"],["수단","SD"],["에티오피아","ET"],["케냐","KE"],["탄자니아","TZ"],["우간다","UG"],["르완다","RW"],["부룬디","BI"],["소말리아","SO"],["지부티","DJ"],["에리트레아","ER"],["남아프리카공화국","ZA"],["나미비아","NA"],["보츠와나","BW"],["짐바브웨","ZW"],["잠비아","ZM"],["모잠비크","MZ"],["마다가스카르","MG"],["모리셔스","MU"],["세이셸","SC"],["앙골라","AO"],["콩고민주공화국","CD"],["콩고공화국","CG"],["가나","GH"],["나이지리아","NG"],["카메룬","CM"],["세네갈","SN"],["말리","ML"],["니제르","NE"],["차드","TD"],["부르키나파소","BF"],["코트디부아르","CI"],["기니","GN"],["시에라리온","SL"],["라이베리아","LR"],["감비아","GM"],["기니비사우","GW"],["카보베르데","CV"],["베냉","BJ"],["토고","TG"],["가봉","GA"],["적도기니","GQ"],["중앙아프리카공화국","CF"],["남수단","SS"],
  ["사우디아라비아","SA"],["아랍에미리트","AE"],["카타르","QA"],["쿠웨이트","KW"],["바레인","BH"],["오만","OM"],["예멘","YE"],["이라크","IQ"],["이란","IR"],["이스라엘","IL"],["요르단","JO"],["레바논","LB"],["시리아","SY"],["아프가니스탄","AF"],["카자흐스탄","KZ"],["우즈베키스탄","UZ"],["투르크메니스탄","TM"],["키르기스스탄","KG"],["타지키스탄","TJ"],["아르메니아","AM"],["아제르바이잔","AZ"],["조지아","GE"],["팔레스타인","PS"],
];

const COUNTRIES = COUNTRY_DATA.map(([name, code]) => [name, code]);
const CAPITALS = { KR:"서울", JP:"도쿄", CN:"베이징", MN:"울란바토르", TW:"타이베이", VN:"하노이", TH:"방콕", PH:"마닐라", ID:"자카르타", MY:"쿠알라룸푸르", SG:"싱가포르", IN:"뉴델리", PK:"이슬라마바드", BD:"다카", NP:"카트만두", LK:"스리자야와르데네푸라코테", MM:"네피도", KH:"프놈펜", LA:"비엔티안", BN:"반다르스리브가완", BT:"팀푸", MV:"말레", TL:"딜리", US:"워싱턴 D.C.", CA:"오타와", MX:"멕시코시티", BR:"브라질리아", AR:"부에노스아이레스", CL:"산티아고", PE:"리마", CO:"보고타", EC:"키토", BO:"수크레", PY:"아순시온", UY:"몬테비데오", VE:"카라카스", CU:"아바나", JM:"킹스턴", HT:"포르토프랭스", DO:"산토도밍고", CR:"산호세", PA:"파나마시티", GT:"과테말라시티", HN:"테구시갈파", SV:"산살바도르", NI:"마나과", BS:"나소", BB:"브리지타운", TT:"포트오브스페인", GY:"조지타운", SR:"파라마리보", BZ:"벨모판", GD:"세인트조지스", LC:"캐스트리스", DM:"로조", FJ:"수바", PG:"포트모르즈비", WS:"아피아", TO:"누쿠알로파", VU:"포트빌라", SB:"호니아라", FM:"팔리키르", PW:"응게룰무드", MH:"마주로", KI:"사우스타라와", NR:"야렌", TV:"푸나푸티", AU:"캔버라", NZ:"웰링턴", GB:"런던", IE:"더블린", FR:"파리", DE:"베를린", IT:"로마", ES:"마드리드", PT:"리스본", NL:"암스테르담", BE:"브뤼셀", LU:"룩셈부르크", CH:"베른", AT:"빈", PL:"바르샤바", CZ:"프라하", SK:"브라티슬라바", HU:"부다페스트", RO:"부쿠레슈티", BG:"소피아", GR:"아테네", HR:"자그레브", SI:"류블랴나", RS:"베오그라드", BA:"사라예보", ME:"포드고리차", MK:"스코페", AL:"티라나", UA:"키이우", BY:"민스크", MD:"키시너우", RU:"모스크바", EE:"탈린", LV:"리가", LT:"빌뉴스", FI:"헬싱키", SE:"스톡홀름", NO:"오슬로", DK:"코펜하겐", IS:"레이캬비크", MT:"발레타", CY:"니코시아", TR:"앙카라", EG:"카이로", MA:"라바트", DZ:"알제", TN:"튀니스", LY:"트리폴리", SD:"하르툼", ET:"아디스아바바", KE:"나이로비", TZ:"도도마", UG:"캄팔라", RW:"키갈리", BI:"기테가", SO:"모가디슈", DJ:"지부티", ER:"아스마라", ZA:"프리토리아", NA:"빈트후크", BW:"가보로네", ZW:"하라레", ZM:"루사카", MZ:"마푸투", MG:"안타나나리보", MU:"포트루이스", SC:"빅토리아", AO:"루안다", CD:"킨샤사", CG:"브라자빌", GH:"아크라", NG:"아부자", CM:"야운데", SN:"다카르", ML:"바마코", NE:"니아메", TD:"은자메나", BF:"와가두구", CI:"야무수크로", GN:"코나크리", SL:"프리타운", LR:"몬로비아", GM:"반줄", GW:"비사우", CV:"프라이아", BJ:"포르토노보", TG:"로메", GA:"리브르빌", GQ:"말라보", CF:"방기", SS:"주바", SA:"리야드", AE:"아부다비", QA:"도하", KW:"쿠웨이트시티", BH:"마나마", OM:"무스카트", YE:"사나", IQ:"바그다드", IR:"테헤란", IL:"예루살렘", JO:"암만", LB:"베이루트", SY:"다마스쿠스", AF:"카불", KZ:"아스타나", UZ:"타슈켄트", TM:"아시가바트", KG:"비슈케크", TJ:"두샨베", AM:"예레반", AZ:"바쿠", GE:"트빌리시", PS:"라말라" };
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
let category = "flag-country";

function shuffle(items) { return [...items].sort(() => Math.random() - .5); }

function loadFlag(code) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(`https://flagcdn.com/w320/${code.toLowerCase()}.png`);
    image.onerror = () => reject(new Error(`Flag image unavailable: ${code}`));
    image.src = `https://flagcdn.com/w320/${code.toLowerCase()}.png`;
  });
}

async function newQuestion() {
  if (question >= TOTAL) return finish();
  feedback.textContent = "문제를 준비하는 중입니다…";
  feedback.className = "feedback";
  let correct;
  let imageUrl;
  const pool = category === "country-capital" ? COUNTRIES.filter(([, code]) => CAPITALS[code]) : COUNTRIES;
  for (const candidate of shuffle(pool)) {
    if (category === "country-capital") { correct = candidate; break; }
    try {
      imageUrl = await loadFlag(candidate[1]);
      correct = candidate;
      break;
    } catch (error) { console.warn(error.message); }
  }
  if (!correct) {
    feedback.textContent = "사용 가능한 문제를 찾지 못했습니다. 잠시 후 다시 시도해 주세요.";
    feedback.className = "feedback bad";
    return;
  }
  question += 1;
  const wrong = shuffle(pool.filter(([name]) => name !== correct[0])).slice(0, 3);
  current = correct;
  questionNumber.textContent = `${question} / ${TOTAL}`;
  flag.hidden = category !== "flag-country";
  if (category === "flag-country") {
    flag.innerHTML = `<img src="${imageUrl}" alt="${correct[0]} 국기" loading="eager">`;
    flag.setAttribute("aria-label", `${correct[0]} 국기`);
    document.querySelector("#prompt").textContent = "이 국기는 어느 나라일까요?";
  } else if (category === "country-flag") {
    document.querySelector("#prompt").innerHTML = `<strong>${correct[0]}</strong>의 국기는 무엇일까요?`;
  } else {
    document.querySelector("#prompt").innerHTML = `<strong>${correct[0]}</strong>의 수도는 어디일까요?`;
  }
  feedback.textContent = "정답을 선택하세요";
  feedback.className = "feedback";
  next.hidden = true;
  if (category === "country-flag") {
    const options = shuffle([correct, ...wrong]);
    const urls = await Promise.all(options.map(([, code]) => loadFlag(code).catch(() => null)));
    if (urls.some((url) => !url)) return newQuestion();
    answers.innerHTML = options.map(([name], index) => `<button class="answer" type="button" data-answer="${name}" data-country="${name}"><img class="answer-flag" src="${urls[index]}" alt="${name} 국기"> </button>`).join("");
  } else {
    answers.innerHTML = shuffle([correct, ...wrong]).map(([name, code]) => `<button class="answer" type="button" data-answer="${category === "country-capital" ? CAPITALS[code] : name}" data-country="${name}">${category === "country-capital" ? CAPITALS[code] : name}</button>`).join("");
  }
}

function choose(button) {
  const chosen = button.dataset.answer;
  const correctAnswer = category === "country-capital" ? CAPITALS[current[1]] : current[0];
  const correct = chosen === correctAnswer;
  answers.querySelectorAll("button").forEach((item) => { item.disabled = true; if (item.dataset.answer === correctAnswer) item.classList.add("correct"); });
  if (category === "country-flag" || category === "country-capital") {
    answers.querySelectorAll("button").forEach((item) => {
      if (!item.querySelector(".answer-label")) item.insertAdjacentHTML("beforeend", `<span class="answer-label">${item.dataset.country}</span>`);
    });
  }
  if (correct) { score += 1; streak += 1; button.classList.add("correct"); feedback.textContent = "정답입니다!"; feedback.className = "feedback good"; }
  else { streak = 0; button.classList.add("wrong"); feedback.textContent = `아쉬워요. 정답은 ${correctAnswer}입니다.`; feedback.className = "feedback bad"; }
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
document.querySelectorAll("[data-category]").forEach((button) => button.addEventListener("click", () => {
  category = button.dataset.category;
  document.querySelectorAll("[data-category]").forEach((item) => item.classList.toggle("active", item === button));
  question = 0; score = 0; streak = 0; scoreElement.textContent = "0"; streakElement.textContent = "0"; result.hidden = true; document.querySelector(".quiz-card").hidden = false; newQuestion();
}));
next.addEventListener("click", newQuestion);
restart.addEventListener("click", () => { question = 0; score = 0; streak = 0; scoreElement.textContent = "0"; streakElement.textContent = "0"; result.hidden = true; document.querySelector(".quiz-card").hidden = false; newQuestion(); });
newQuestion();
