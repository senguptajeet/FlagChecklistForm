/**
 * Validation module for Subham Flag Checklist.
 */

/**
 * Validates the checklist to ensure it is not blank and all mandatory fields for the selected shift are filled.
 * Used by both submitChecklist() and previewAndPrintPDF().
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} formSheet The checklist source sheet.
 * @return {Object} Object containing isValid boolean, status message, and extracted validation details.
 */
function validateChecklist(formSheet) {
  if (!formSheet) {
    return {
      isValid: false,
      message: 'Source worksheet is invalid or missing.'
    };
  }

  const data = formSheet.getRange('A1:L43').getValues();

  const cell = (colLetter, rowNum) => {
    const colIdx = colLetter.charCodeAt(0) - 65;
    const rowIdx = rowNum - 1;
    return data[rowIdx][colIdx];
  };

  const isChecked = (val) => val === true || String(val).trim().toUpperCase() === 'TRUE';
  const hasText = (val) => val !== '' && val !== null && val !== undefined && String(val).trim() !== '';

  // 1. Check if ANY checkpoint item is ticked
  let amCheckpointsCount = 0;
  let pmCheckpointsCount = 0;

  for (let r = 17; r <= 25; r++) {
    if (isChecked(cell('E', r)) || isChecked(cell('G', r))) amCheckpointsCount++;
    if (isChecked(cell('I', r)) || isChecked(cell('K', r))) pmCheckpointsCount++;
  }

  const isAM = isChecked(cell('E', 13)) || amCheckpointsCount > 0;
  const isPM = isChecked(cell('I', 13)) || pmCheckpointsCount > 0;

  // Check if entire form is completely blank
  const anyHeaderText = hasText(cell('C', 11)) || hasText(cell('E', 11)) ||
                        hasText(cell('C', 12)) || hasText(cell('E', 12)) || hasText(cell('C', 13));

  if (!isAM && !isPM && !anyHeaderText) {
    return {
      isValid: false,
      message: 'The checklist is completely blank. Please fill out the checklist before submitting or generating a PDF.'
    };
  }

  const missingFields = [];

  // 2. Validate Shift Selection
  if (!isAM && !isPM) {
    missingFields.push('• Shift selection (Tick AM Shift at E13 or PM Shift at I13)');
  }

  // 3. Validate Checklist Items for the selected shift
  if (isAM && amCheckpointsCount === 0) {
    missingFields.push('• AM Shift Checkpoints (No AM inspection items are checked in rows 17–25)');
  }
  if (isPM && pmCheckpointsCount === 0) {
    missingFields.push('• PM Shift Checkpoints (No PM inspection items are checked in rows 17–25)');
  }

  // 4. Validate Date
  const formDate = cell('C', 11) || cell('H', 36) || cell('H', 37) || cell('H', 38);
  if (!hasText(formDate)) {
    missingFields.push('• Date (Fill in C11 or Signature Date in H36:H38)');
  }

  // 5. Validate Guard / Supervisor Names based on active shift
  if (isAM && !hasText(cell('C', 12)) && !hasText(cell('C', 36))) {
    missingFields.push('• Morning Guard Name (C12) or AM Signature (C36)');
  }
  if (isPM && !hasText(cell('E', 12)) && !hasText(cell('C', 37))) {
    missingFields.push('• Evening Guard Name (E12) or PM Signature (C37)');
  }

  if (missingFields.length > 0) {
    return {
      isValid: false,
      message: 'Action blocked. Please complete the following mandatory fields:\n\n' + missingFields.join('\n')
    };
  }

  return {
    isValid: true,
    data: data,
    cell: cell,
    isChecked: isChecked,
    isAM: isAM,
    isPM: isPM,
    formDate: formDate
  };
}
