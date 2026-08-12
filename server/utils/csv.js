/**
 * A small, correct CSV reader and writer.
 *
 * No dependency, because the only consumer is a pair of scripts and the format
 * is small enough to get right. It does handle the parts people actually hit:
 * quoted fields, delimiters and newlines inside quotes, and doubled quotes.
 *
 * Two details matter specifically for this client:
 *
 *   - Excel in a French locale writes CSV with `;` as the delimiter, not `,`.
 *     The delimiter is sniffed from the header row rather than assumed.
 *   - Excel needs a UTF-8 byte order mark or it renders "Canapé" as "CanapÃ©".
 *     Files we write start with one; files we read have it stripped.
 */

const BOM = '﻿';

/** Sniffs the delimiter from the header line: whichever separator wins outside quotes. */
export function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  const candidates = [';', ',', '\t'];

  let best = ',';
  let bestCount = 0;

  for (const d of candidates) {
    let count = 0;
    let inQuotes = false;
    for (let i = 0; i < firstLine.length; i += 1) {
      const ch = firstLine[i];
      if (ch === '"') inQuotes = !inQuotes;
      else if (ch === d && !inQuotes) count += 1;
    }
    if (count > bestCount) {
      best = d;
      bestCount = count;
    }
  }

  return best;
}

/**
 * Parses CSV into an array of objects keyed by the header row.
 * Blank lines are skipped. Values are trimmed.
 */
export function parseCsv(input, { delimiter } = {}) {
  let text = String(input);
  if (text.startsWith(BOM)) text = text.slice(1);

  const d = delimiter || detectDelimiter(text);

  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  const endField = () => {
    row.push(field.trim());
    field = '';
  };
  const endRow = () => {
    endField();
    // Skip rows that are entirely empty, which trailing newlines produce.
    if (row.some((v) => v !== '')) rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') inQuotes = true;
    else if (ch === d) endField();
    else if (ch === '\r') {
      // Swallow CRLF as one break.
      if (text[i + 1] === '\n') i += 1;
      endRow();
    } else if (ch === '\n') endRow();
    else field += ch;
  }

  if (field !== '' || row.length) endRow();

  if (!rows.length) return { rows: [], headers: [], delimiter: d };

  const headers = rows[0].map((h) => h.trim());
  const out = rows.slice(1).map((cells, index) => {
    const obj = { __line: index + 2 }; // 1-indexed, plus the header row
    headers.forEach((h, i) => {
      obj[h] = cells[i] ?? '';
    });
    return obj;
  });

  return { rows: out, headers, delimiter: d };
}

/** Quotes a value only when it needs it. */
function quote(value, delimiter) {
  const s = value === null || value === undefined ? '' : String(value);
  if (s.includes('"') || s.includes(delimiter) || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Writes rows to CSV. Defaults to `;` and a BOM, which is what French Excel
 * opens cleanly on a double click.
 */
export function toCsv(headers, rows, { delimiter = ';', bom = true } = {}) {
  const lines = [headers.map((h) => quote(h, delimiter)).join(delimiter)];
  for (const row of rows) {
    lines.push(headers.map((h) => quote(row[h], delimiter)).join(delimiter));
  }
  return (bom ? BOM : '') + lines.join('\r\n') + '\r\n';
}

export { BOM };
