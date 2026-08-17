export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const source = url.searchParams.get("source");

  let target;
  if (source === "ko") {
    const book = (url.searchParams.get("book") || "").toUpperCase();
    const chapter = url.searchParams.get("chapter") || "";
    if (!/^[0-9A-Z]{3}$/.test(book) || !/^\d{1,3}$/.test(chapter)) {
      return new Response("Invalid Korean source parameters.", {status: 400});
    }
    target = `https://bible.bskorea.or.kr/bible/NKRV/${book}.${chapter}`;
  } else if (source === "en") {
    const search = url.searchParams.get("search") || "";
    if (!search || search.length > 100) {
      return new Response("Invalid English source parameters.", {status: 400});
    }
    target = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(search)}&version=NIV`;
  } else {
    return new Response("Unknown source.", {status: 400});
  }

  const upstream = await fetch(target, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; BibleReformatter/1.0)",
      "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7"
    },
    cf: { cacheTtl: 300, cacheEverything: false }
  });

  if (!upstream.ok) {
    return new Response(`Upstream source error (${upstream.status})`, {status: 502});
  }

  const body = await upstream.text();
  return new Response(body, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
