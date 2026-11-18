/**
 * Authorization utility module for Subham Flag Checklist.
 * Running this function prompts Google Apps Script to request all necessary OAuth permissions.
 */

/**
 * Triggers permission authorization by explicitly accessing SpreadsheetApp, DriveApp, and Session services.
 * Run this function from the menu or Apps Script editor to authorize the project.
 */
function authorizeScript() {
  try {
    // 1. Verify SpreadsheetApp permissions on source spreadsheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetCount = ss.getSheets().length;

    // 2. Verify destination spreadsheet permissions
    let destSheetName = '';
    if (typeof CONFIG !== 'undefined' && CONFIG.DEST_SPREADSHEET_ID) {
      const destSs = SpreadsheetApp.openById(CONFIG.DEST_SPREADSHEET_ID);
      const destSheet = destSs.getSheetByName(CONFIG.DEST_SHEET);
      destSheetName = destSs.getName() + ' (' + (destSheet ? destSheet.getName() : 'Sheet Not Found') + ')';
    }

    // 3. Verify DriveApp permissions for shared target folder
    const folderId = (typeof CONFIG !== 'undefined' && CONFIG.PDF_FOLDER_ID) ? CONFIG.PDF_FOLDER_ID : '1IHuKLA3K-P1MCG6Wnq-URV-cvNyt_Dul';
    const targetFolder = DriveApp.getFolderById(folderId);
    const folderName = targetFolder.getName();

    // 4. Verify Session & OAuth Token permissions
    const userEmail = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
    const token = ScriptApp.getOAuthToken();

    console.log(`Authorization successful for user: ${userEmail}. Sheets: ${sheetCount}, Dest SS: ${destSheetName}, Target Folder: ${folderName}`);

    showCustomModal(
      'success',
      'Authorization Complete',
      'Permissions have been successfully granted for your account.',
      [
        { label: 'Authorized User', value: userEmail },
        { label: 'Form Spreadsheet', value: ss.getName() },
        { label: 'Responses File', value: destSheetName },
        { label: 'Target PDF Folder', value: folderName }
      ]
    );
  } catch (e) {
    console.error('Authorization check error: ' + e.message);
    showCustomModal('error', 'Authorization Failed', 'Unable to verify permissions for Google Drive or Sheets:', e.message);
  }
}
