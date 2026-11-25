const fs = require('fs');
const zlib = require('zlib');
const { PDFDocument } = require('pdf-lib');

async function inspect() {
  const pdfBytes = fs.readFileSync('output/pdf/MU_Smart_Campus_Project_Report.pdf');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  console.log('Total pages:', pages.length);

  // In the 7-page PDF, page 0 is cover, page 1 is the 2nd page (the first page of the report).
  const page2 = pages[1];
  const { Contents } = page2.node.normalizedEntries();
  console.log('Contents ref or array:', Contents);

  // Let's inspect all stream objects in the raw PDF
  const raw = pdfBytes.toString('latin1');
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;
  let idx = 0;
  while ((match = streamRegex.exec(raw)) !== null) {
    idx++;
    try {
      const buffer = Buffer.from(match[1], 'latin1');
      const decompressed = zlib.inflateSync(buffer).toString('utf-8');
      if (decompressed.includes('Prepared:') || decompressed.includes('Institutional context')) {
        console.log(`FOUND in stream #${idx}:`);
        console.log(decompressed.substring(0, 500));
      }
    } catch (e) {
      // not compressed or different format
      if (match[1].includes('Prepared:') || match[1].includes('Institutional context')) {
        console.log(`FOUND uncompressed in stream #${idx}:`);
        console.log(match[1].substring(0, 500));
      }
    }
  }
}

inspect().catch(console.error);
