// Psalm-specific NIV cleanup.
// BibleGateway can prepend the Psalm heading and superscription to verse 1.
// Keep this isolated so other Bible books are unaffected.

const parseEnglishBeforePsalmFix = parseEnglish;

parseEnglish = function parseEnglishWithPsalmFix(html, ref) {
  const out = parseEnglishBeforePsalmFix(html, ref);

  const isPsalm = ref?.bg === "Ps" || ref?.en === "Psalms" || ref?.ko === "시편";
  if (!isPsalm) return out;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const normalize = (s) => String(s || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Collect actual heading text from BibleGateway. This includes the Psalm
  // superscription such as "For the director of music. A psalm of David."
  const headingSelector = [
    "h1", "h2", "h3", "h4", "h5", "h6",
    ".passage-title", ".heading", ".psalm-title",
    ".section-heading", ".s1", ".s2", ".s3"
  ].join(",");

  const headings = [...new Set(
    [...doc.querySelectorAll(headingSelector)]
      .map(el => normalize(el.textContent))
      .filter(Boolean)
  )].sort((a, b) => b.length - a.length);

  for (const [verse, rawText] of out.entries()) {
    let text = normalize(rawText);

    // BibleGateway may merge "Psalm 13" into verse 1 text. Remove that
    // structural chapter title first. An optional one-letter footnote marker
    // immediately after the number is also tolerated.
    if (verse === 1) {
      const chapter = String(ref.chapter).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const psalmPrefix = new RegExp(
        `^Psalm\\s+${chapter}(?:\\s*(?:\\[[^\\]]+\\]|\\([^)]*\\)|[a-z]))?\\s*`,
        "i"
      );
      text = text.replace(psalmPrefix, "").trimStart();
    }

    // Remove any remaining real heading/superscription prefixes. More than
    // one heading may be stacked before verse 1, so repeat until stable.
    let changed = true;
    while (changed && text) {
      changed = false;
      for (const headingRaw of headings) {
        let heading = normalize(headingRaw);

        // BibleGateway heading text can include a trailing footnote marker,
        // e.g. "Psalm 13 a". Normalize that for prefix matching.
        if (/^Psalm\s+\d+/i.test(heading)) {
          heading = heading
            .replace(/\s*\[[^\]]+\]\s*$/g, "")
            .replace(/\s+\(?[a-z]\)?\s*$/i, "")
            .trim();
        }

        if (!heading) continue;
        if (text === heading) {
          text = "";
          changed = true;
          break;
        }
        if (text.startsWith(heading + " ")) {
          text = text.slice(heading.length).trimStart();
          changed = true;
          break;
        }
      }
    }

    if (!text) {
      throw new Error(`NIV ${verse}절 본문이 비어 있습니다.`);
    }

    out.set(verse, text);
  }

  return out;
};
