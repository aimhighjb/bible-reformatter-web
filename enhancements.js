// Bible Reformatter Web enhancements
// - Alt+B: clipboard -> reference -> load -> scroll to result
// - Accept chapter.verse (e.g. 요3.16) as chapter:verse
// - Visually gray copied verse groups after a successful copy
// - Remove BibleGateway section headings from NIV verse text

function normalizeReferenceSeparators(raw) {
  return String(raw || "")
    .trim()
    .replace(/(\d)\.(\d)/g, "$1:$2");
}

function normalizeReferenceInput() {
  const input = document.getElementById("reference");
  if (!input) return;
  input.value = normalizeReferenceSeparators(input.value);
}

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

    // A heading can occasionally be nested in the same DOM container selected
    // for a verse. Remove it only when it is a literal prefix of that verse text.
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
  // Normalize 요3.16 before app.js handles Enter.
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

      // Preserve the current highlight field exactly as requested.
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
