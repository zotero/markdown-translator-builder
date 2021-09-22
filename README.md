# Markdown Translator Builder

Does various transformations to ProseMirror generated notes and uses [Turndown](https://github.com/mixmark-io/turndown) to convert to Markdown.

## Build

```
git clone https://github.com/zotero/markdown-translator-builder
```

Edit translator and update `lastUpdated` in `src/translator.js` metadata.
```
npm i
npm test
npm run build
```

Copy `build/markdown.js` to [https://github.com/zotero/translators/markdown.js](https://github.com/zotero/translators/markdown.js).
