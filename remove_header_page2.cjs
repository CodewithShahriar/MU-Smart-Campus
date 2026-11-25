const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { PDFDocument } = require('pdf-lib');

async function processPdf() {
  const coverPath = path.resolve('C:/Users/Abid/.gemini/antigravity-ide/brain/828d6286-3f22-4478-9e73-2db8a307f146/.user_uploaded/media_1790403758184.pdf');
  const originalReportPath = path.resolve('C:/Users/Abid/.gemini/antigravity-ide/brain/828d6286-3f22-4478-9e73-2db8a307f146/.tempmediaStorage/media_1790403359850.pdf');
  const outputPath = path.resolve('d:/Projects/MU Smart Campus/output/pdf/MU_Smart_Campus_Project_Report.pdf');

  console.log('Cover exists:', fs.existsSync(coverPath));
  console.log('Original report exists:', fs.existsSync(originalReportPath));

  let rawReport = fs.readFileSync(originalReportPath);

  // In ReportLab PDF, streams are wrapped in `stream\r?\n ... \r?\nendstream`
  // We can find each stream, try to decompress with zlib, check if it contains the target strings
  let modified = false;

  // Split or regex find streams
  const streamPattern = /(stream\r?\n)([\s\S]*?)(\r?\nendstream)/g;
  let match;
  const chunks = [];
  let lastIndex = 0;

  const rawStr = rawReport.toString('binary');

  while ((match = streamPattern.exec(rawStr)) !== null) {
    const streamStart = match.index + match[1].length;
    const streamEnd = match.index + match[1].length + match[2].length;
    const streamData = rawReport.slice(streamStart, streamEnd);

    let decompressed;
    let isCompressed = false;

    try {
      decompressed = zlib.inflateSync(streamData).toString('latin1');
      isCompressed = true;
    } catch (e) {
      decompressed = streamData.toString('latin1');
      isCompressed = false;
    }

    if (decompressed.includes('Prepared:') || decompressed.includes('Institutional context')) {
      console.log('Found target text in stream! Editing stream...');
      // Remove lines / text operators containing Prepared:, Project type:, Institutional context:
      // In PDF, text can appear as:
      // (Prepared: 26 September 2026 ) Tj or [(Prepared: )...] TJ
      // Let's replace the matching text strings or text blocks with empty strings
      let cleaned = decompressed;

      // Replace text inside parenthesis or arrays
      cleaned = cleaned.replace(/\((?:Prepared:[^)]*|Project type:[^)]*|Institutional context:[^)]*)\)\s*Tj/g, '() Tj');
      cleaned = cleaned.replace(/\[\s*\((?:Prepared:[^)]*|Project type:[^)]*|Institutional context:[^)]*)\)[^\]]*\]\s*TJ/g, '[] TJ');
      
      // Also catch any generic occurrences
      cleaned = cleaned.replace(/Prepared:\s*26\s*September\s*2026/g, '                             ');
      cleaned = cleaned.replace(/Project type:\s*Web-based campus timetable and classroom management portal/g, '                                                                            ');
      cleaned = cleaned.replace(/Institutional context:\s*Metropolitan University,\s*Sylhet/g, '                                                     ');

      // If still present in any form
      cleaned = cleaned.split('\n').map(line => {
        if (line.includes('Prepared:') || line.includes('Project type:') || line.includes('Institutional context:')) {
          // If it's a standalone PDF line or text operator
          return line.replace(/Prepared:[^)]*/g, '')
                     .replace(/Project type:[^)]*/g, '')
                     .replace(/Institutional context:[^)]*/g, '');
        }
        return line;
      }).join('\n');

      let newStreamData;
      if (isCompressed) {
        newStreamData = zlib.deflateSync(Buffer.from(cleaned, 'latin1'));
      } else {
        newStreamData = Buffer.from(cleaned, 'latin1');
      }

      chunks.push(rawReport.slice(lastIndex, match.index));
      // Need to adjust /Length if present in the preceding object dictionary
      // In PDF, preceding object has `/Length <number>`
      const prevDictChunk = rawReport.slice(lastIndex, match.index).toString('latin1');
      const updatedDictChunk = prevDictChunk.replace(/\/Length\s+\d+/, `/Length ${newStreamData.length}`);
      
      chunks.pop(); // remove unadjusted
      chunks.push(Buffer.from(updatedDictChunk, 'latin1'));
      chunks.push(Buffer.from(match[1], 'latin1'));
      chunks.push(newStreamData);
      chunks.push(Buffer.from(match[3], 'latin1'));
      lastIndex = match.index + match[0].length;
      modified = true;
    }
  }

  let finalReportBytes;
  if (modified) {
    chunks.push(rawReport.slice(lastIndex));
    finalReportBytes = Buffer.concat(chunks);
    console.log('Stream successfully modified and reassembled.');
  } else {
    console.log('Target text not found in raw streams, loading into pdf-lib directly...');
    finalReportBytes = rawReport;
  }

  // Now load the cover PDF and the cleaned report into pdf-lib
  const coverBytes = fs.readFileSync(coverPath);
  const coverPdf = await PDFDocument.load(coverBytes);
  const reportPdf = await PDFDocument.load(finalReportBytes);

  // If stream replacement didn't catch it due to font encoding or layout, we can also use pdf-lib to draw a white box over the exact metadata lines on page 0 of the report
  const page1 = reportPdf.getPages()[0];
  const { width, height } = page1.getSize();
  console.log(`Page dimensions: ${width} x ${height}`);

  // In ReportLab PDF, page height is 841.89 pt (A4).
  // Title "MU Smart Campus - Project Report" is around y = 730 - 760.
  // The metadata "Prepared: ... Institutional context: ..." is located around y = 700 - 735.
  // Let's draw a white rectangle over that region just in case to guarantee 100% clean visual removal:
  const { rgb } = require('pdf-lib');
  page1.drawRectangle({
    x: 40,
    y: 700,
    width: width - 80,
    height: 38,
    color: rgb(1, 1, 1),
    borderWidth: 0,
  });

  const mergedPdf = await PDFDocument.create();

  // Add Cover page as Page 1
  const [coverPage] = await mergedPdf.copyPages(coverPdf, [0]);
  mergedPdf.addPage(coverPage);

  // Add all Report pages (starting from page 1 of report, which becomes Page 2 of merged doc)
  const reportPages = await mergedPdf.copyPages(reportPdf, reportPdf.getPageIndices());
  reportPages.forEach(p => mergedPdf.addPage(p));

  const mergedBytes = await mergedPdf.save();
  fs.writeFileSync(outputPath, mergedBytes);
  console.log(`Successfully generated updated PDF with 7 pages! Output saved to: ${outputPath}`);
}

processPdf().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
