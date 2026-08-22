// Bible Reformatter Web enhancements
// - Alt+B: clipboard -> reference -> load -> scroll to result
// - Accept chapter.verse (e.g. 요3.16) as chapter:verse
// - Accept comma-separated / non-contiguous verses
// - Visually gray copied verse groups after a successful copy
// - Remove BibleGateway section headings from NIV verse text

function normalizeReferenceSeparators(raw) {
  return String(raw || "")
    .trim()
    .replace(/[，、]/g, ",")
    .replace(/(\d)\.(\d)/g, "$1:$2");
}

function normalizeReferenceInput() {
  const input = document.getElementById("reference");
  if (!input) return;
  input.value = normalizeReferenceSeparators(input.value);
}

function compressVerseList(verses) {
  const sorted = [...new Set(verses)].sort((a, b) => a - b);
  const parts = [];

  for (let i = 0; i < sorted.length; ) {
    const start = sorted[i];
    let end = start;
    let j = i + 1;

    while (j < sorted.length && sorted[j] === end + 1) {
      end = sorted[j];
      j++;
    }

    parts.push(start === end ? String(start) : `${start}-${end}`);
    i = j;
  }

  return parts.join(", ");
}

// Extend the original parser while preserving all existing book aliases.
parseReference = function enhancedParseReference(input) {
  let s = normalizeReferenceSeparators(input)
    .replace(/[–—−~～∼]/g, "-")
    .replaceAll("：", ":")
    .replace(/\s+/g, "")
    .replaceAll("장", ":")
    .replaceAll("절", "")
    .replace(/:+/g, ":");

  const m = s.match(/^([가-힣0-9]+?)(\d+):(.+)$/);
  if (!m) {
    throw new Error(
      "장절 형식을 인식하지 못했습니다. 예: 행15:16-17 / 사도행전 15장 16절, 19절"
    );
  }

  const [, bookRaw, chRaw, selectionRaw] = m;
  const book = ALIAS.get(bookRaw);
  if (!book) throw new Error(`성경 책 이름을 인식하지 못했습니다: ${bookRaw}`);

  const chapter = Number(chRaw);
  if (!Number.isInteger(chapter) || chapter < 1) {
    throw new Error("잘못된 장 번호입니다.");
  }

  const selected = [];
  const pieces = selectionRaw.split(",").filter(Boolean);
  if (!pieces.length) throw new Error("절 번호가 없습니다.");

  for (const piece of pieces) {
    const rangeMatch = piece.match(/^(\d+)(?:-(\d+))?$/);
    if (!rangeMatch) {
      throw new Error(`절 형식을 인식하지 못했습니다: ${piece}`);
    }

    const start = Number(rangeMatch[1]);
    const end = rangeMatch[2] ? Number(rangeMatch[2]) : start;

    if (start < 1 || end < start) {
      throw new Error(`잘못된 절 범위입니다: ${piece}`);
    }

    for (let v = start; v <= end; v++) selected.push(v);
  }

  const selectedVerses = [...new Set(selected)].sort((a, b) => a - b);
  if (!selectedVerses.length) throw new Error("절 번호가 없습니다.");
  if (selectedVerses.length > 100) throw new Error("한 번에 최대 100절까지 불러올 수 있습니다.");

  const v1 = selectedVerses[0];
  const v2 = selectedVerses[selectedVerses.length - 1];

  return {
    ...book,
    chapter,
    v1,
    v2,
    selectedVerses,
    selectionLabel: compressVerseList(selectedVerses),
  };
};

// Build output from only the explicitly selected verses.
buildOutput = function enhancedBuildOutput(ref, ko, en, highlightWords) {
  const verses = ref.selectedVerses || Array.from(
    { length: ref.v2 - ref.v1 + 1 },
    (_, i) => ref.v1 + i
  );

  const single = verses.length === 1;
  const selectionLabel = ref.selectionLabel || compressVerseList(verses);
  const title = `${ref.ko} ${ref.en} ${ref.chapter}:${selectionLabel}`;

  const groups = [];
  const allLines = [title, ""];

  for (let i = 0; i < verses.length; ) {
    const start = verses[i];
    let groupVerses = [start];

    // Preserve the existing two-verse copy grouping, but only pair verses
    // that are actually consecutive selections.
    if (i + 1 < verses.length && verses[i + 1] === start + 1) {
      groupVerses.push(verses[i + 1]);
    }

    const end = groupVerses[groupVerses.length - 1];
    const group = [];
    const rawLines = [];

    for (const v of groupVerses) {
      const koText = ko.get(v);
      const enText = en.get(v);
      if (!koText) throw new Error(`개역개정 ${v}절을 읽지 못했습니다.`);
      if (!enText) throw new Error(`NIV ${v}절을 읽지 못했습니다.`);

      const koRaw = single ? koText : `${v} ${koText}`;
      rawLines.push(koRaw, enText);
      allLines.push(koRaw, enText);
      group.push({ v, koText, enText, koRaw });
    }

    i += groupVerses.length;
    if (i < verses.length) allLines.push("");
    groups.push({ start, end, raw: rawLines.join("\n"), items: group });
  }

  return {
    title,
    groups,
    allText: allLines.join("\n").trimEnd(),
    single,
  };
};

function markCopiedGroup(button) {
  const group = button?.closest?.(".verse-group");
  if (group) group.classList.add("copied-group");
}

// Mark a verse group gray only after clipboard copy really succeeds.
const originalCopyText = copyText;
copyText = async function enhancedCopyText(text, button) {
  await originalCopyText(text, button);
  if (button?.classList?.contains("group-copy")) {
    markCopiedGroup(button);
  }
};

// BibleGateway sometimes places a section heading such as
// "Israel’s Restoration" in the same matched container as the first verse.
// Collect real heading elements from the source document and strip only a
// matching heading found at the beginning of a parsed verse.
const originalParseEnglish = parseEnglish;
parseEnglish = function enhancedParseEnglish(html, ref) {
  const out = originalParseEnglish(html, ref);
  const doc = new DOMParser().parseFromString(html, "text/html");

  const headingSelector = [
    "h1", "h2", "h3", "h4", "h5", "h6",
    ".passage-title", ".heading", ".psalm-title",
    ".section-heading", ".s1", ".s2", ".s3"
  ].join(",");

  const headings = [...doc.querySelectorAll(headingSelector)]
    .map(el => (el.textContent || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  for (const [verse, originalText] of out.entries()) {
    let text = originalText;

    for (const heading of headings) {
      if (text === heading) {
        text = "";
        break;
      }
      if (text.startsWith(heading + " ")) {
        text = text.slice(heading.length).trimStart();
        break;
      }
    }

    if (!text) {
      throw new Error(`NIV ${verse}절 본문이 비어 있습니다.`);
    }
    out.set(verse, text);
  }

  return out;
};

// Capture phase makes sure dot normalization happens before app.js click/Enter handlers.
document.addEventListener("click", (event) => {
  const submit = event.target.closest("#submitBtn");
  if (submit) normalizeReferenceInput();
}, true);

document.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    normalizeReferenceInput();
  }

  // Alt+B = Bible clipboard shortcut.
  if (
    event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    event.key.toLowerCase() === "b"
  ) {
    event.preventDefault();
    event.stopPropagation();

    const input = document.getElementById("reference");
    const status = document.getElementById("status");
    const resultPanel = document.getElementById("resultPanel");

    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        throw new Error("이 브라우저에서는 클립보드 읽기를 지원하지 않습니다.");
      }

      if (status) {
        status.className = "status";
        status.textContent = "클립보드의 성경구절을 읽는 중...";
      }

      const clipboardText = await navigator.clipboard.readText();
      const reference = normalizeReferenceSeparators(clipboardText);

      if (!reference) {
        throw new Error("클립보드가 비어 있습니다.");
      }

      input.value = reference;

      // Preserve the current highlight field.
      await run();

      if (resultPanel && !resultPanel.classList.contains("hidden")) {
        requestAnimationFrame(() => {
          resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    } catch (error) {
      console.error(error);
      if (status) {
        status.className = "status error";
        status.textContent = `Alt+B 오류: ${error.message}`;
      }
    }
  }
}, true);
