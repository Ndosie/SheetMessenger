# SheetMessenger

A small browser utility that reads an Excel file and generates per-row messages ready to paste into a chat or SMS app. It includes an emoji picker so you can annotate "expected", "partial" and "full" payment statuses with emojis.

## Demo
![Demo](SheetMessenger.gif)


![Live Demo](https://ndosie.github.io/SheetMessenger/) - See it in action

## Features

- Upload an Excel (.xlsx) file from your computer.
- Convert the first worksheet into message lines (one line per row).
- Emoji picker to choose icons for "expected", "partial" and "full" statuses.
- Outputs a plain text block you can copy/paste.

## Project files

- `index.html` — UI for selecting the Excel file, emojis and generating messages.
- `scripts/script.js` — Main client-side logic that reads the file, parses the sheet using SheetJS (`XLSX`), constructs messages and writes the result to a textarea.
- `styles/styles.css` — Styling for the page.

## Prerequisites

- A modern web browser (Chrome, Edge, Firefox).
- The project uses SheetJS (`XLSX`) to parse Excel files. Ensure `index.html` includes the SheetJS script (a CDN line such as `https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js` or similar).
- Optionally, Python or Node.js to run a quick local static server for testing (recommended for consistent behavior when loading local files).

## How to use

1. Open `index.html` in your browser (double-click to open file or serve the folder via a local HTTP server).
2. Use the file input to select your Excel file.
3. Choose emojis using the emoji picker for the three emoji displays.
4. Click the "Generate" button (or whichever button is wired to `generateMessages`) to parse the workbook and produce output in the text area.
5. Copy the generated messages and paste them into your messaging app.

## Expected spreadsheet format

The script expects the first worksheet to contain rows with these columns (in order):

1. `sn` (serial number) — column A
2. `name` — column B
3. `amountToBePaid` — column C
4. `amountPaid` — column D (optional / empty if nothing paid yet)

There are two common ways this is handled in the code:

- If the code uses `XLSX.utils.sheet_to_json(firstSheet, { header: ["sn","name","amountToBePaid","amountPaid"], defval: "" })`, the header option forces those property names and every row is returned as an object with those keys. In this mode the **first row is treated as data**, not a header row, so the code often skips index 0 to ignore a real header row.

- If you prefer to let the first row act as headers, call `sheet_to_json` without a `header` array (or with `header: 1` to return arrays), and adjust the parsing accordingly.

If your sheet has a header row (i.e., column labels in row 1), either:

- Remove the `header: [ ... ]` option and let SheetJS infer keys from the first row, or
- Keep the `header` array but skip the first parsed row (the current code uses `if (index === 0) return;` inside a `forEach` to do this).

## Troubleshooting checklist

- Make sure `XLSX` (SheetJS) is loaded in `index.html`.
- Verify the Excel file is valid and has at least one sheet.
- If output is empty, check the browser console for errors and ensure `reader.onload` ran (no early return).
- If rows are read but empty, apply the blank-row filter shown above.

## Contributing / Next steps

- Enable users to use different formats for columns
- Add automated tests for the parsing logic (node script that uses `xlsx` to parse sample files).
- Add a small UI indicator while parsing large files.
- Improve error messages for corrupt or unsupported workbooks.