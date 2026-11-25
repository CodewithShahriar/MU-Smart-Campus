const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

async function mergePDFs() {
  const coverPath = path.resolve('C:/Users/Abid/.gemini/antigravity-ide/brain/828d6286-3f22-4478-9e73-2db8a307f146/.user_uploaded/media_1790403758184.pdf');
  const reportPath = path.resolve('d:/Projects/MU Smart Campus/output/pdf/MU_Smart_Campus_Project_Report.pdf');
  const outputPath = path.resolve('d:/Projects/MU Smart Campus/output/pdf/MU_Smart_Campus_Project_Report.pdf');

  console.log('Cover exists:', fs.existsSync(coverPath));
  console.log('Report exists:', fs.existsSync(reportPath));

  const coverBytes = fs.readFileSync(coverPath);
  const reportBytes = fs.readFileSync(reportPath);

  const coverPdf = await PDFDocument.load(coverBytes);
  const reportPdf = await PDFDocument.load(reportBytes);

  const mergedPdf = await PDFDocument.create();

  // Copy cover page
  const [coverPage] = await mergedPdf.copyPages(coverPdf, [0]);
  mergedPdf.addPage(coverPage);

  // Copy all report pages
  const reportPageIndices = reportPdf.getPageIndices();
  const reportPages = await mergedPdf.copyPages(reportPdf, reportPageIndices);
  reportPages.forEach((page) => mergedPdf.addPage(page));

  const mergedBytes = await mergedPdf.save();
  fs.writeFileSync(outputPath, mergedBytes);

  console.log(`Successfully merged! Total pages: ${mergedPdf.getPageCount()}, File size: ${mergedBytes.length} bytes`);
}

mergePDFs().catch(err => {
  console.error('Error merging PDFs:', err);
  process.exit(1);
});
