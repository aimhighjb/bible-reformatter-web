// Bible Reformatter Web enhancements
// - Alt+B: clipboard -> reference -> load -> scroll to result
// - Accept chapter.verse (e.g. 요3.16) as chapter:verse
// - Visually gray copied verse groups

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
  const group = button.closest(".verse-group");
  if (group) group.classList.add("copied-group");
}

// Capture phase makes sure dot normalization happens before app.js click/Enter handlers.
document.addEventListener("click", (event) => {
  const submit = event.target.closest("#submitBtn");
  if (submit) normalizeReferenceInput();

  const groupCopy = event.target.closest(".group-copy");
  if (groupCopy) {
    // app.js performs the actual clipboard copy. Keep a persistent visual marker
    // for the current result so the user can see which block was already copied.
    markCopiedGroup(groupCopy);
  }
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
