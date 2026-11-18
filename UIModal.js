/**
 * UI Modal Service module for displaying styled HTML modal dialogs.
 * Replaces standard Apps Script native ui.alert dialogs with modern card notifications.
 */

/**
 * Displays a styled HTML modal dialog for Success, Error, Warning, or Validation notifications.
 *
 * @param {string} type Modal theme type: 'success' | 'error' | 'warning' | 'validation'
 * @param {string} title Modal headline title
 * @param {string} message Primary descriptive message content
 * @param {Array<{label: string, value: string}>|string} [details] Optional key-value structured details or raw error text
 */
function showCustomModal(type, title, message, details) {
  const ui = SpreadsheetApp.getUi();

  let themeColor = '#10b981'; // Emerald Green
  let bgColor = '#ecfdf5';
  let iconSvg = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';

  if (type === 'error') {
    themeColor = '#ef4444'; // Crimson Red
    bgColor = '#fef2f2';
    iconSvg = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
  } else if (type === 'warning' || type === 'validation') {
    themeColor = '#f59e0b'; // Amber Warning
    bgColor = '#fffbeb';
    iconSvg = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
  }

  let detailsHtml = '';
  if (Array.isArray(details) && details.length > 0) {
    detailsHtml = '<div style="margin-top: 14px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; text-align: left;">';
    details.forEach(function(item) {
      detailsHtml += '<div style="display: flex; justify-content: space-between; align-items: center; margin: 6px 0; font-size: 13px;">' +
        '<span style="color: #6b7280; font-weight: 500;">' + escapeModalHtml(item.label) + '</span>' +
        '<span style="color: #111827; font-weight: 600; font-family: monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">' + escapeModalHtml(item.value) + '</span>' +
      '</div>';
    });
    detailsHtml += '</div>';
  } else if (typeof details === 'string' && details.trim() !== '') {
    detailsHtml = '<div style="margin-top: 14px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; text-align: left; font-size: 12px; font-family: monospace; color: #374151; white-space: pre-wrap; word-break: break-word; max-height: 130px; overflow-y: auto;">' +
      escapeModalHtml(details) +
    '</div>';
  }

  const formattedMessage = escapeModalHtml(message).replace(/\n/g, '<br>');

  const htmlContent = '<!DOCTYPE html><html><head><style>' +
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 16px; background-color: #f9fafb; color: #1f2937; box-sizing: border-box; text-align: center; }' +
    '.modal-card { background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }' +
    '.icon-box { width: 52px; height: 52px; border-radius: 50%; background: ' + bgColor + '; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto 12px auto; }' +
    '.title { font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 8px 0; }' +
    '.message { font-size: 13px; color: #4b5563; line-height: 1.5; margin: 0; }' +
    '.btn { margin-top: 16px; background-color: ' + themeColor + '; color: #ffffff; border: none; padding: 10px 20px; font-size: 14px; font-weight: 600; border-radius: 6px; cursor: pointer; transition: opacity 0.2s; width: 100%; }' +
    '.btn:hover { opacity: 0.9; }' +
    '</style></head><body>' +
    '<div class="modal-card">' +
      '<div class="icon-box">' + iconSvg + '</div>' +
      '<h2 class="title">' + escapeModalHtml(title) + '</h2>' +
      '<div class="message">' + formattedMessage + '</div>' +
      detailsHtml +
      '<button class="btn" onclick="google.script.host.close()">OK</button>' +
    '</div>' +
    '</body></html>';

  const dialogHeight = (detailsHtml ? 390 : 290);
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(450)
    .setHeight(dialogHeight);

  ui.showModalDialog(htmlOutput, ' ');
}

/**
 * Escapes special HTML characters to prevent XSS.
 *
 * @param {string} str Raw text string.
 * @return {string} Escaped HTML string.
 */
function escapeModalHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
