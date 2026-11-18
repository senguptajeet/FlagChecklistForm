/**
 * PDF generation and storage service module.
 */

/**
 * Retrieves target PDF folder in Drive using central CONFIG.PDF_FOLDER_ID.
 *
 * @return {GoogleAppsScript.Drive.Folder} Target Google Drive folder.
 */
function getOrCreatePDFFolder() {
  if (CONFIG.PDF_FOLDER_ID) {
    return DriveApp.getFolderById(CONFIG.PDF_FOLDER_ID);
  }
  const folders = DriveApp.getFoldersByName(CONFIG.PDF_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(CONFIG.PDF_FOLDER_NAME);
}

/**
 * Builds export URL for generating PDF from specific range (B1:L43).
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} formSheet Form sheet object.
 * @return {string} Configured Google Sheets export URL.
 */
function generatePDFUrl(formSheet) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetId = formSheet.getSheetId();

  // Margins converted from cm to inches
  const topMargin = (0.976 / 2.54).toFixed(3);
  const leftMargin = (0.795 / 2.54).toFixed(3);
  const rightMargin = (0.904 / 2.54).toFixed(3);
  const bottomMargin = (4.771 / 2.54).toFixed(3);

  // Selected cells B1:L43 (0-indexed: Row 1=0, Row 43=43, Col B=1, Col L=12)
  const r1 = 0;
  const c1 = 1;
  const r2 = 43;
  const c2 = 12;

  const baseUrl = 'https://docs.google.com/spreadsheets/d/';
  const exportPath = '/export?exportFormat=pdf&format=pdf';

  return baseUrl + ss.getId() + exportPath +
    '&size=A4' +
    '&portrait=true' +
    '&fitw=true' +
    '&sheetnames=false&printtitle=false&pagenumbers=false' +
    '&gridlines=false&fzr=false' +
    '&gid=' + sheetId +
    '&ir=false&ic=false' +
    '&r1=' + r1 + '&c1=' + c1 + '&r2=' + r2 + '&c2=' + c2 +
    '&top_margin=' + topMargin +
    '&left_margin=' + leftMargin +
    '&right_margin=' + rightMargin +
    '&bottom_margin=' + bottomMargin;
}

/**
 * Creates a PDF file from the form sheet and saves it in the designated Drive folder.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} formSheet Form sheet object.
 * @param {string} fileName Desired file name for the PDF.
 * @return {GoogleAppsScript.Drive.File} The created Google Drive File object.
 */
function createPDFFile(formSheet, fileName) {
  SpreadsheetApp.flush();
  const url = generatePDFUrl(formSheet);
  const token = ScriptApp.getOAuthToken();

  const response = UrlFetchApp.fetch(url, {
    headers: { 'Authorization': 'Bearer ' + token },
    muteHttpExceptions: true
  });

  if (response.getResponseCode() !== 200) {
    throw new Error('Export request failed with status code ' + response.getResponseCode());
  }

  const blob = response.getBlob();
  blob.setName(fileName);

  const folder = getOrCreatePDFFolder();
  const savedFile = folder.createFile(blob);
  console.log('Saved PDF file ID: ' + savedFile.getId() + ' to folder: ' + folder.getName());
  return savedFile;
}

/**
 * Generates and displays preview of form PDF in browser without creating a file in Drive.
 */
function previewAndPrintPDF() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const formSheet = ss.getSheetByName(CONFIG.SOURCE_SHEET);

  if (!formSheet) {
    showCustomModal('error', 'Worksheet Missing', 'Source worksheet ' + CONFIG.SOURCE_SHEET + ' not found.');
    return;
  }

  // Flush pending spreadsheet edits before checking validation
  SpreadsheetApp.flush();

  // Block PDF generation if the checklist is blank or missing mandatory fields
  const validation = validateChecklist(formSheet);
  if (!validation.isValid) {
    showCustomModal('validation', 'Cannot Generate PDF', validation.message);
    return;
  }

  try {
    const url = generatePDFUrl(formSheet);

    // Open PDF Preview in a new browser tab directly without creating a file in Drive
    const htmlContent = '<!DOCTYPE html><html><head><style>' +
      'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 24px; background: #ffffff; color: #1f2937; margin: 0; }' +
      '.spinner { border: 3px solid #f3f3f3; border-top: 3px solid #10b981; border-radius: 50%; width: 28px; height: 28px; animation: spin 0.8s linear infinite; margin: 0 auto 12px auto; }' +
      '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }' +
      '.msg { font-size: 14px; font-weight: 600; color: #374151; }' +
      '</style></head><body>' +
      '<div class="spinner"></div>' +
      '<div class="msg">Opening PDF preview in new tab...</div>' +
      '<script>' +
        'window.open("' + url + '", "_blank");' +
        'setTimeout(function() { google.script.host.close(); }, 700);' +
      '</script>' +
      '</body></html>';

    const html = HtmlService.createHtmlOutput(htmlContent)
      .setWidth(360)
      .setHeight(130);

    ui.showModalDialog(html, ' ');

  } catch (e) {
    console.error('PDF generation error: ' + e.message);
    showCustomModal('error', 'PDF Error', 'Failed to generate PDF preview:', e.toString());
  }
}
