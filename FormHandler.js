/**
 * Form submission and reset handlers.
 */

/**
 * Handles form submission with concurrency lock and structured row appending.
 */
function submitChecklist() {
  const lock = LockService.getScriptLock();
  const ui = SpreadsheetApp.getUi();

  try {
    lock.waitLock(10000);
  } catch (e) {
    console.warn('Lock timeout during checklist submission: ' + e.message);
    showCustomModal('warning', 'System Busy', 'Another submission is currently in progress. Please try again in a moment.');
    return;
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const formSheet = ss.getSheetByName(CONFIG.SOURCE_SHEET);

    let destSpreadsheet = ss;
    if (CONFIG.DEST_SPREADSHEET_ID) {
      try {
        destSpreadsheet = SpreadsheetApp.openById(CONFIG.DEST_SPREADSHEET_ID);
      } catch (err) {
        showCustomModal('error', 'Access Error', 'Unable to open destination spreadsheet (ID: ' + CONFIG.DEST_SPREADSHEET_ID + '). Ensure you have access permissions to it.');
        return;
      }
    }

    const responseSheet = destSpreadsheet.getSheetByName(CONFIG.DEST_SHEET);

    if (!formSheet || !responseSheet) {
      showCustomModal('error', 'Worksheet Missing', 'Required worksheets were not found. Ensure names match SubhamFlagCheckListForm and Responses.');
      return;
    }

    // Run strict blank / mandatory validation
    const validation = validateChecklist(formSheet);
    if (!validation.isValid) {
      showCustomModal('validation', 'Validation Required', validation.message);
      return;
    }

    const { cell, isChecked, isAM, isPM, formDate } = validation;

    const getStatus = (okCol, failCol, rowNum) => {
      if (isChecked(cell(okCol, rowNum))) return 'OK';
      if (isChecked(cell(failCol, rowNum))) return 'FAIL';
      return '';
    };

    const getYesNo = (yesCol, noCol, rowNum) => {
      if (isChecked(cell(yesCol, rowNum))) return 'Yes';
      if (isChecked(cell(noCol, rowNum))) return 'No';
      return '';
    };

    const timestamp = new Date();
    const subId = 'SUB-' + Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
    const shiftString = (isAM && isPM) ? 'Both' : (isAM ? 'AM' : 'PM');

    // Generate and save PDF file for this submission
    const pdfFileName = 'Subham_Flag_Checklist_' + subId + '.pdf';
    const pdfFile = createPDFFile(formSheet, pdfFileName);
    const pdfUrl = pdfFile.getUrl();
    const subIdLink = '=HYPERLINK("' + pdfUrl + '", "' + subId + '")';

    const newRow = [
      subIdLink,                          // Col A: Submission_ID (Hyperlinked to PDF)
      timestamp,                          // Col B: Timestamp
      formDate,                           // Col C: Form_Date (C11)
      cell('E', 11),                      // Col D: Location_Mast_ID (E11)
      shiftString,                        // Col E: Shift_Submitted (E13 / I13)
      cell('C', 12),                      // Col F: Morning_Guard (C12)
      cell('E', 12),                      // Col G: Evening_Guard (E12)
      cell('C', 13),                      // Col H: Supervisor (C13)
      getStatus('E', 'G', 17),            // Col I: AM_1_FlagPresent
      getStatus('E', 'G', 18),            // Col J: AM_2_Clean
      getStatus('E', 'G', 19),            // Col K: AM_3_FreeFlying
      getStatus('E', 'G', 20),            // Col L: AM_4_Clear
      getStatus('E', 'G', 21),            // Col M: AM_5_MastSecure
      getStatus('E', 'G', 22),            // Col N: AM_6_NoDamage
      getStatus('E', 'G', 23),            // Col O: AM_7_AreaSafe
      getYesNo('E', 'G', 25),             // Col P: AM_9_DefectReported
      getStatus('I', 'K', 17),            // Col Q: PM_1_FlagPresent
      getStatus('I', 'K', 18),            // Col R: PM_2_Clean
      getStatus('I', 'K', 19),            // Col S: PM_3_FreeFlying
      getStatus('I', 'K', 20),            // Col T: PM_4_Clear
      getStatus('I', 'K', 21),            // Col U: PM_5_MastSecure
      getStatus('I', 'K', 22),            // Col V: PM_6_NoDamage
      getStatus('I', 'K', 23),            // Col W: PM_7_AreaSafe
      getStatus('I', 'K', 24),            // Col X: PM_8_NightLighting
      getYesNo('I', 'K', 25),             // Col Y: PM_9_DefectReported
      cell('C', 28),                      // Col Z: Defect_Noted (C28)
      cell('H', 28),                      // Col AA: Time_Reported (H28)
      cell('C', 29),                      // Col AB: Immediate_Safety_Control (C29)
      cell('C', 30),                      // Col AC: FollowUp_Owner (C30)
      cell('C', 31),                      // Col AD: Action_Ticket_No (C31)
      cell('C', 32),                      // Col AE: Defect_Resolution_Notes (C32)
      cell('H', 29),                      // Col AF: Reported_To (H29)
      cell('H', 30),                      // Col AG: Target_DateTime (H30)
      cell('H', 31),                      // Col AH: Closure_DateTime (H31)
      cell('C', 36),                      // Col AI: AM_Guard_Signature (C36)
      cell('E', 36),                      // Col AJ: AM_Sign_Time (E36)
      cell('C', 37),                      // Col AK: PM_Guard_Signature (C37)
      cell('E', 37),                      // Col AL: PM_Sign_Time (E37)
      cell('C', 38),                      // Col AM: Supervisor_Signature (C38)
      cell('E', 38)                       // Col AN: Supervisor_Sign_Time (E38)
    ];

    responseSheet.appendRow(newRow);

    console.log('Successfully recorded submission ID: ' + subId + ' with PDF link.');

    showCustomModal(
      'success',
      'Checklist Submitted!',
      'Your daily flag checklist response has been recorded and saved.',
      [
        { label: 'Submission ID', value: subId },
        { label: 'Shift Submitted', value: shiftString },
        { label: 'Response Row', value: 'Row #' + responseSheet.getLastRow() },
        { label: 'PDF Storage', value: 'Saved in Drive' }
      ]
    );

  } catch (e) {
    console.error('Submission error: ' + e.message);
    showCustomModal('error', 'Submission Failed', 'An unexpected error occurred during submission:', e.message);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Resets user inputs in the checklist form to default empty states.
 */
function resetForm() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('Confirm Reset', 'Are you sure you want to clear all user inputs from this form?', ui.ButtonSet.YES_NO);

  if (response === ui.Button.YES) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const formSheet = ss.getSheetByName(CONFIG.SOURCE_SHEET);

    if (!formSheet) {
      showCustomModal('error', 'Worksheet Missing', 'Source sheet not found.');
      return;
    }

    // Reset Checkboxes strictly to false
    const checkboxes = ['E13', 'I13', 'E17:E25', 'G17:G25', 'I17:I25', 'K17:K25'];
    formSheet.getRangeList(checkboxes).setValue(false);

    // Clear Text/Date Fields
    const textFields = ['C11', 'C12', 'C13', 'E11', 'E12', 'C28:C32', 'H28:H31', 'C36:C38', 'E36:E38', 'H36:H38'];
    formSheet.getRangeList(textFields).clearContent();

    console.log('Form reset completed successfully.');
  }
}
