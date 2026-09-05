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

  // BibleGateway renders Psalm titles/superscriptions as real heading elements.
  // Examples:
  //   Psalm 13
  //   For the director of music. A psalm of David.
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

    if (verse === 1) {
      // Remove ONLY the structural Psalm title itself.
      // Important: do NOT consume an arbitrary following letter. A previous
      // version treated the F in "For the director..." as a footnote marker.
      const chapter = String(ref.chapter).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const psalmPrefix = new RegExp(`^Psalm\\s+${chapter}(?=\\s|$)\\s*`, "i");
      text = text.replace(psalmPrefix, "").trimStart();
    }

    // Remove any remaining real heading/superscription prefixes. More than
    // one heading may be stacked before verse 1, so repeat until stable.
    let changed = true;
    while (changed && text) {
      changed = false;

      for (const headingRaw of headings) {
        let heading = normalize(headingRaw);

        // Normalize Psalm heading footnote decorations in the heading itself,
        // e.g. "Psalm 13 a" or "Psalm 13 [a]", without touching verse text.
        if (/^Psalm\s+\d+/i.test(heading)) {
          heading = heading
            .replace(/\s*\[[^\]]+\]\s*$/g, "")
            .replace(/\s+\(?[a-z]\)?\s*$/g, "")
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
