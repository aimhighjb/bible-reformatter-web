# Bible Reformatter Web

Web version of the Colab Bible Reformatter.

## Features
- Korean references such as `창1:2-3`, `이사야 26장 4절~16절`, `요3:16`
- 개역개정 + NIV
- Optional highlighted words
- One verse: verse number hidden
- Multiple verses: verse numbers shown without `.`
- Blank line after every two verses
- Copy title
- Copy each 2-verse block
- Copy all
- Mobile / iPhone responsive UI

## Hosting
Designed for **Cloudflare Pages** with GitHub integration.

- Static files: `index.html`, `styles.css`, `app.js`
- Server function: `functions/api/source.js`
- Framework preset: None
- Build command: leave blank
- Build output directory: `/`

## Important
This project retrieves Bible text from external sources at request time. Before operating a public production service, confirm that your intended use complies with the copyright/licensing and terms of the Bible text providers.
