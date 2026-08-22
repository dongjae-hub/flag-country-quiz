const COUNTRY_DATA = [
  ["대한민국","KR"],["일본","JP"],["중국","CN"],["몽골","MN"],["대만","TW"],["베트남","VN"],["태국","TH"],["필리핀","PH"],["인도네시아","ID"],["말레이시아","MY"],["싱가포르","SG"],["인도","IN"],["파키스탄","PK"],["방글라데시","BD"],["네팔","NP"],["스리랑카","LK"],["미얀마","MM"],["캄보디아","KH"],["라오스","LA"],["브루나이","BN"],["부탄","BT"],["몰디브","MV"],["동티모르","TL"],
  ["미국","US"],["캐나다","CA"],["멕시코","MX"],["브라질","BR"],["아르헨티나","AR"],["칠레","CL"],["페루","PE"],["콜롬비아","CO"],["에콰도르","EC"],["볼리비아","BO"],["파라과이","PY"],["우루과이","UY"],["베네수엘라","VE"],["쿠바","CU"],["자메이카","JM"],["아이티","HT"],["도미니카공화국","DO"],["코스타리카","CR"],["파나마","PA"],["과테말라","GT"],["온두라스","HN"],["엘살바도르","SV"],["니카라과","NI"],["바하마","BS"],["바베이도스","BB"],["트리니다드토바고","TT"],["가이아나","GY"],["수리남","SR"],["벨리즈","BZ"],["그레나다","GD"],["세인트루시아","LC"],["도미니카연방","DM"],["피지","FJ"],["파푸아뉴기니","PG"],["사모아","WS"],["통가","TO"],["바누아투","VU"],["솔로몬제도","SB"],["미크로네시아","FM"],["팔라우","PW"],["마셜제도","MH"],["키리바시","KI"],["나우루","NR"],["투발루","TV"],["호주","AU"],["뉴질랜드","NZ"],
  ["영국","GB"],["아일랜드","IE"],["프랑스","FR"],["독일","DE"],["이탈리아","IT"],["스페인","ES"],["포르투갈","PT"],["네덜란드","NL"],["벨기에","BE"],["룩셈부르크","LU"],["스위스","CH"],["오스트리아","AT"],["폴란드","PL"],["체코","CZ"],["슬로바키아","SK"],["헝가리","HU"],["루마니아","RO"],["불가리아","BG"],["그리스","GR"],["크로아티아","HR"],["슬로베니아","SI"],["세르비아","RS"],["보스니아 헤르체고비나","BA"],["몬테네그로","ME"],["북마케도니아","MK"],["알바니아","AL"],["우크라이나","UA"],["벨라루스","BY"],["몰도바","MD"],["러시아","RU"],["에스토니아","EE"],["라트비아","LV"],["리투아니아","LT"],["핀란드","FI"],["스웨덴","SE"],["노르웨이","NO"],["덴마크","DK"],["아이슬란드","IS"],["몰타","MT"],["키프로스","CY"],["튀르키예","TR"],
  ["이집트","EG"],["모로코","MA"],["알제리","DZ"],["튀니지","TN"],["리비아","LY"],["수단","SD"],["에티오피아","ET"],["케냐","KE"],["탄자니아","TZ"],["우간다","UG"],["르완다","RW"],["부룬디","BI"],["소말리아","SO"],["지부티","DJ"],["에리트레아","ER"],["남아프리카공화국","ZA"],["나미비아","NA"],["보츠와나","BW"],["짐바브웨","ZW"],["잠비아","ZM"],["모잠비크","MZ"],["마다가스카르","MG"],["모리셔스","MU"],["세이셸","SC"],["앙골라","AO"],["콩고민주공화국","CD"],["콩고공화국","CG"],["가나","GH"],["나이지리아","NG"],["카메룬","CM"],["세네갈","SN"],["말리","ML"],["니제르","NE"],["차드","TD"],["부르키나파소","BF"],["코트디부아르","CI"],["기니","GN"],["시에라리온","SL"],["라이베리아","LR"],["감비아","GM"],["기니비사우","GW"],["카보베르데","CV"],["베냉","BJ"],["토고","TG"],["가봉","GA"],["적도기니","GQ"],["중앙아프리카공화국","CF"],["남수단","SS"],
  ["사우디아라비아","SA"],["아랍에미리트","AE"],["카타르","QA"],["쿠웨이트","KW"],["바레인","BH"],["오만","OM"],["예멘","YE"],["이라크","IQ"],["이란","IR"],["이스라엘","IL"],["요르단","JO"],["레바논","LB"],["시리아","SY"],["아프가니스탄","AF"],["카자흐스탄","KZ"],["우즈베키스탄","UZ"],["투르크메니스탄","TM"],["키르기스스탄","KG"],["타지키스탄","TJ"],["아르메니아","AM"],["아제르바이잔","AZ"],["조지아","GE"],["팔레스타인","PS"],
];

function flagEmoji(code) {
  return [...code].map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0))).join("");
}

const COUNTRIES = COUNTRY_DATA.map(([name, code]) => [name, flagEmoji(code)]);
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
