const BOOKS = [
  ["창세기","Genesis","GEN","Gen",["창","창세","창세기"]],
  ["출애굽기","Exodus","EXO","Exod",["출","출애굽","출애굽기"]],
  ["레위기","Leviticus","LEV","Lev",["레","레위","레위기"]],
  ["민수기","Numbers","NUM","Num",["민","민수","민수기"]],
  ["신명기","Deuteronomy","DEU","Deut",["신","신명","신명기"]],
  ["여호수아","Joshua","JOS","Josh",["수","여호수아"]],
  ["사사기","Judges","JDG","Judg",["삿","사사","사사기"]],
  ["룻기","Ruth","RUT","Ruth",["룻","룻기"]],
  ["사무엘상","1 Samuel","1SA","1Sam",["삼상","사무엘상"]],
  ["사무엘하","2 Samuel","2SA","2Sam",["삼하","사무엘하"]],
  ["열왕기상","1 Kings","1KI","1Kgs",["왕상","열왕기상"]],
  ["열왕기하","2 Kings","2KI","2Kgs",["왕하","열왕기하"]],
  ["역대상","1 Chronicles","1CH","1Chr",["대상","역대상"]],
  ["역대하","2 Chronicles","2CH","2Chr",["대하","역대하"]],
  ["에스라","Ezra","EZR","Ezra",["스","에스라"]],
  ["느헤미야","Nehemiah","NEH","Neh",["느","느헤미야"]],
  ["에스더","Esther","EST","Esth",["에","에스더"]],
  ["욥기","Job","JOB","Job",["욥","욥기"]],
  ["시편","Psalms","PSA","Ps",["시","시편"]],
  ["잠언","Proverbs","PRO","Prov",["잠","잠언"]],
  ["전도서","Ecclesiastes","ECC","Eccl",["전","전도","전도서"]],
  ["아가","Song of Songs","SNG","Song",["아","아가","아가서"]],
  ["이사야","Isaiah","ISA","Isa",["사","이사야"]],
  ["예레미야","Jeremiah","JER","Jer",["렘","예레미야"]],
  ["예레미야애가","Lamentations","LAM","Lam",["애","예레미야애가"]],
  ["에스겔","Ezekiel","EZK","Ezek",["겔","에스겔"]],
  ["다니엘","Daniel","DAN","Dan",["단","다니엘"]],
  ["호세아","Hosea","HOS","Hos",["호","호세아"]],
  ["요엘","Joel","JOL","Joel",["욜","요엘"]],
  ["아모스","Amos","AMO","Amos",["암","아모스"]],
  ["오바댜","Obadiah","OBA","Obad",["옵","오바댜"]],
  ["요나","Jonah","JNH","Jonah",["욘","요나"]],
  ["미가","Micah","MIC","Mic",["미","미가"]],
  ["나훔","Nahum","NAM","Nah",["나","나훔"]],
  ["하박국","Habakkuk","HAB","Hab",["합","하박국"]],
  ["스바냐","Zephaniah","ZEP","Zeph",["습","스바냐"]],
  ["학개","Haggai","HAG","Hag",["학","학개"]],
  ["스가랴","Zechariah","ZEC","Zech",["슥","스가랴"]],
  ["말라기","Malachi","MAL","Mal",["말","말라기"]],
  ["마태복음","Matthew","MAT","Matt",["마","마태","마태복음"]],
  ["마가복음","Mark","MRK","Mark",["막","마가","마가복음"]],
  ["누가복음","Luke","LUK","Luke",["눅","누가","누가복음"]],
  ["요한복음","John","JHN","John",["요","요한","요한복음"]],
  ["사도행전","Acts","ACT","Acts",["행","사도행전"]],
  ["로마서","Romans","ROM","Rom",["롬","로마","로마서"]],
  ["고린도전서","1 Corinthians","1CO","1Cor",["고전","고린도전서"]],
  ["고린도후서","2 Corinthians","2CO","2Cor",["고후","고린도후서"]],
  ["갈라디아서","Galatians","GAL","Gal",["갈","갈라디아서"]],
  ["에베소서","Ephesians","EPH","Eph",["엡","에베소서"]],
  ["빌립보서","Philippians","PHP","Phil",["빌","빌립보서"]],
  ["골로새서","Colossians","COL","Col",["골","골로새서"]],
  ["데살로니가전서","1 Thessalonians","1TH","1Thess",["살전","데살로니가전서"]],
  ["데살로니가후서","2 Thessalonians","2TH","2Thess",["살후","데살로니가후서"]],
  ["디모데전서","1 Timothy","1TI","1Tim",["딤전","디모데전서"]],
  ["디모데후서","2 Timothy","2TI","2Tim",["딤후","디모데후서"]],
  ["디도서","Titus","TIT","Titus",["딛","디도서"]],
  ["빌레몬서","Philemon","PHM","Phlm",["몬","빌레몬서"]],
  ["히브리서","Hebrews","HEB","Heb",["히","히브리서"]],
  ["야고보서","James","JAS","Jas",["약","야고보서"]],
  ["베드로전서","1 Peter","1PE","1Pet",["벧전","베드로전서"]],
  ["베드로후서","2 Peter","2PE","2Pet",["벧후","베드로후서"]],
  ["요한일서","1 John","1JN","1John",["요일","요한일서","요한1서"]],
  ["요한이서","2 John","2JN","2John",["요이","요한이서","요한2서"]],
  ["요한삼서","3 John","3JN","3John",["요삼","요한삼서","요한3서"]],
  ["유다서","Jude","JUD","Jude",["유","유다","유다서"]],
  ["요한계시록","Revelation","REV","Rev",["계","계시록","요한계시록"]],
];

const ALIAS = new Map();
for (const row of BOOKS) {
  const [ko,en,bsk,bg,aliases] = row;
  for (const a of [...aliases, ko]) ALIAS.set(a.replaceAll(" ",""), {ko,en,bsk,bg});
}

const $ = (id) => document.getElementById(id);

function parseReference(input) {
  let s = input.trim()
    .replace(/[–—−~～∼]/g, "-")
    .replaceAll("：", ":")
    .replace(/\s+/g, "")
    .replaceAll("장", ":")
    .replaceAll("절", "")
    .replace(/:+/g, ":");

  const m = s.match(/^([가-힣0-9]+?)(\d+):(\d+)(?:-(\d+))?$/);
  if (!m) throw new Error("장절 형식을 인식하지 못했습니다. 예: 창1:2-3 / 이사야 26장 4절~16절");

  const [, bookRaw, chRaw, v1Raw, v2Raw] = m;
  const book = ALIAS.get(bookRaw);
  if (!book) throw new Error(`성경 책 이름을 인식하지 못했습니다: ${bookRaw}`);

  const chapter = Number(chRaw);
  const v1 = Number(v1Raw);
  const v2 = v2Raw ? Number(v2Raw) : v1;

  if (chapter < 1 || v1 < 1 || v2 < v1) throw new Error("잘못된 장절 범위입니다.");
  return {...book, chapter, v1, v2};
}

function escRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanText(s) {
  return (s || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

async function fetchSource(params) {
  const qs = new URLSearchParams(params);
  const r = await fetch(`/api/source?${qs.toString()}`, {cache:"no-store"});
  if (!r.ok) {
    const msg = await r.text().catch(()=>"");
    throw new Error(msg || `Source request failed (${r.status})`);
  }
  return await r.text();
}

function parseKorean(html, ref) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const root = doc.querySelector("main, article, [role='main']") || doc.body;

  root.querySelectorAll("script,style,noscript,svg,iframe,nav,footer,button,form,h1,h2,h3,h4,h5,h6")
    .forEach(el => el.remove());

  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const tokens = [];
  let node;
  while ((node = walker.nextNode())) {
    const t = cleanText(node.nodeValue);
    if (!t) continue;
    if (/성경전서 개역개정판|Korean Bible Society|New Korean Revised Version/.test(t)) break;
    tokens.push(t);
  }

  const isStart = (token, v) => {
    if (token === String(v)) return {ok:true, rest:""};
    let m = token.match(new RegExp(`^${v}\\s+(.+)$`));
    if (m) return {ok:true, rest:m[1].trim()};
    m = token.match(new RegExp(`^${v}(?!\\d)([가-힣A-Za-z\"“‘(].*)$`));
    if (m) return {ok:true, rest:m[1].trim()};
    return {ok:false, rest:""};
  };

  const starts = new Map();
  let cursor = 0;
  for (let v = ref.v1; v <= ref.v2 + 1; v++) {
    let found = null;
    for (let i = cursor; i < tokens.length; i++) {
      const test = isStart(tokens[i], v);
      if (!test.ok) continue;
      const neighborhood = tokens.slice(i, i+4).join(" ");
      if (!/[가-힣]/.test(neighborhood)) continue;
      found = {idx:i, rest:test.rest};
      break;
    }
    if (!found) {
      if (v === ref.v2 + 1) break;
      throw new Error(`개역개정 ${v}절의 시작 위치를 찾지 못했습니다.`);
    }
    starts.set(v, found);
    cursor = found.idx + 1;
  }

  const out = new Map();
  for (let v = ref.v1; v <= ref.v2; v++) {
    const start = starts.get(v);
    const next = starts.get(v+1);
    if (!start) throw new Error(`개역개정 ${v}절을 읽지 못했습니다.`);
    const stop = next ? next.idx : tokens.length;
    const parts = [];
    if (start.rest) parts.push(start.rest);
    for (const t of tokens.slice(start.idx+1, stop)) {
      if (t === "개역개정" || t === "본문만 보기") continue;
      parts.push(t);
    }
    let text = cleanText(parts.join(" "));
    if (!text) throw new Error(`개역개정 ${v}절 본문이 비어 있습니다.`);
    out.set(v, text);
  }
  return out;
}

function parseEnglish(html, ref) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const out = new Map();

  for (let v = ref.v1; v <= ref.v2; v++) {
    const cls = `${ref.bg}-${ref.chapter}-${v}`;
    const all = [...doc.querySelectorAll(`.${CSS.escape(cls)}.text`)];

    const leaf = all.filter(tag => !all.some(other => other !== tag && tag.contains(other)));
    const candidates = leaf.length ? leaf : all.filter(x => x.tagName === "SPAN").concat(all);

    const pieces = [];
    for (const original of candidates) {
      const clone = original.cloneNode(true);
      clone.querySelectorAll(
        "sup,.footnote,.crossreference,.footnotes,a.footnote,a.crossreference,.study-note," +
        ".passage-display-bcv,.passage-title,.heading,.psalm-title,h1,h2,h3,h4,h5,h6"
      ).forEach(x => x.remove());

      let text = cleanText(clone.textContent).replace(/^\d+\s*/, "");
      if (text && !pieces.includes(text)) pieces.push(text);
    }

    const text = cleanText(pieces.join(" "));
    if (!text) throw new Error(`NIV ${v}절을 읽지 못했습니다.`);
    out.set(v, text);
  }
  return out;
}

function highlightHtml(text, words) {
  if (!words.length) return escapeHtml(text);
  const sorted = [...new Set(words)].sort((a,b)=>b.length-a.length);
  let html = escapeHtml(text);
  for (const word of sorted) {
    const safeWord = escapeHtml(word);
    html = html.replace(new RegExp(escRegExp(safeWord), "g"), `<mark>${safeWord}</mark>`);
  }
  return html;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[ch]));
}

async function copyText(text, button) {
  await navigator.clipboard.writeText(text);
  const old = button.textContent;
  button.textContent = "✓ 복사됨";
  setTimeout(()=> button.textContent = old, 900);
}

function buildOutput(ref, ko, en, highlightWords) {
  const single = ref.v1 === ref.v2;
  const range = single ? `${ref.chapter}:${ref.v1}` : `${ref.chapter}:${ref.v1}-${ref.v2}`;
  const title = `${ref.ko} ${ref.en} ${range}`;

  const groups = [];
  const allLines = [title, ""];

  for (let start = ref.v1; start <= ref.v2; start += 2) {
    const end = Math.min(start + 1, ref.v2);
    const group = [];
    const rawLines = [];

    for (let v = start; v <= end; v++) {
      const koText = ko.get(v);
      const enText = en.get(v);
      const koRaw = single ? koText : `${v} ${koText}`;
      rawLines.push(koRaw, enText);
      allLines.push(koRaw, enText);
      group.push({v, koText, enText, koRaw});
    }
    if (end < ref.v2) allLines.push("");
    groups.push({start,end,raw:rawLines.join("\n"),items:group});
  }

  return {title, groups, allText:allLines.join("\n").trimEnd(), single};
}

function render(output, words) {
  $("passageTitle").textContent = output.title;
  const groupsEl = $("groups");
  groupsEl.innerHTML = "";

  for (const group of output.groups) {
    const wrap = document.createElement("section");
    wrap.className = "verse-group";

    for (const item of group.items) {
      const verse = document.createElement("div");
      verse.className = "verse";
      verse.innerHTML = `
        <div class="ko">${output.single ? "" : `<span class="verse-number">${item.v} </span>`}${highlightHtml(item.koText, words)}</div>
        <div class="en">${highlightHtml(item.enText, words)}</div>
      `;
      wrap.appendChild(verse);
    }

    const btn = document.createElement("button");
    btn.className = "copy-btn group-copy";
    btn.textContent = group.start === group.end
      ? `📋 ${group.start}절 복사`
      : `📋 ${group.start}-${group.end}절 복사`;
    btn.addEventListener("click", ()=>copyText(group.raw, btn));
    wrap.appendChild(btn);
    groupsEl.appendChild(wrap);
  }

  $("copyTitleBtn").onclick = () => copyText(output.title, $("copyTitleBtn"));
  $("copyAllBtn").onclick = () => copyText(output.allText, $("copyAllBtn"));
  $("resultPanel").classList.remove("hidden");
}

async function run() {
  const btn = $("submitBtn");
  const status = $("status");
  status.className = "status";
  $("resultPanel").classList.add("hidden");

  try {
    const ref = parseReference($("reference").value);
    const words = $("highlight").value.split(",").map(x=>x.trim()).filter(Boolean);

    btn.disabled = true;
    status.textContent = "말씀을 불러오는 중...";

    const enSearch = `${ref.en} ${ref.chapter}:${ref.v1}${ref.v2 !== ref.v1 ? `-${ref.v2}` : ""}`;

    const [koHtml, enHtml] = await Promise.all([
      fetchSource({source:"ko", book:ref.bsk, chapter:ref.chapter}),
      fetchSource({source:"en", search:enSearch})
    ]);

    const ko = parseKorean(koHtml, ref);
    const en = parseEnglish(enHtml, ref);
    const output = buildOutput(ref, ko, en, words);
    render(output, words);

    status.textContent = "";
    history.replaceState(null, "", `#${encodeURIComponent($("reference").value.trim())}`);
  } catch (err) {
    console.error(err);
    status.className = "status error";
    status.textContent = `오류: ${err.message}`;
  } finally {
    btn.disabled = false;
  }
}

$("submitBtn").addEventListener("click", run);
$("clearBtn").addEventListener("click", () => {
  $("reference").value = "";
  $("highlight").value = "";
  $("status").textContent = "";
  $("resultPanel").classList.add("hidden");
  $("reference").focus();
});
$("reference").addEventListener("keydown", e => {
  if (e.key === "Enter") run();
});
$("highlight").addEventListener("keydown", e => {
  if (e.key === "Enter") run();
});

if (location.hash.length > 1) {
  try { $("reference").value = decodeURIComponent(location.hash.slice(1)); } catch {}
}
