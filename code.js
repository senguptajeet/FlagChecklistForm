/**
 * Subham Flag Checklist Automation
 * Main configuration and UI menu setup.
 */

const CONFIG = {
  SOURCE_SHEET: 'SubhamFlagCheckListForm',
  DEST_SHEET: 'Responses',
  DEST_SPREADSHEET_ID: '1GR1X5MmEGsFdtUF7am_GSaCdttkmZijTv0TaROzwqNc',
  PDF_FOLDER_ID: '1IHuKLA3K-P1MCG6Wnq-URV-cvNyt_Dul',
  PDF_FOLDER_NAME: 'Flag Checklist Pdf'
};

/**
 * Creates custom menu when spreadsheet is opened.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏳Subham Flag Checklist')
    .addItem('✔Submit Checklist', 'submitChecklist')
    .addSeparator()
    .addItem('👁‍🗨Preview & Print PDF', 'previewAndPrintPDF')
    .addSeparator()
    .addItem('🔄Reset Form', 'resetForm')
    .addSeparator()
    .addItem('🔐Authorize Script', 'authorizeScript')
    .addToUi();
}
