# 🏳️ Subham Flag Checklist

A Google Sheets–based daily inspection checklist for recording AM and PM shift checks, previewing or printing an A4 PDF, and submitting a permanent PDF and response record to Google Drive and Google Sheets.

## Table of Contents

- [1. One-Time Setup](#1-one-time-setup-for-new-users)
- [2. Fill Out the Checklist](#2-fill-out-the-checklist)
- [3. Preview and Print PDF](#3-preview-and-print-the-pdf-optional)
- [4. Submit the Checklist](#4-submit-the-checklist)
- [5. Reset the Form](#5-reset-the-form-for-the-next-entry)
- [6. Troubleshooting](#6-quick-troubleshooting)
- [7. Project Files](#7-project-files-overview)

---

## 1. One-Time Setup (For New Users)

Before using the checklist for the first time, authorize the script to access Google Sheets and Google Drive.

1. Open the checklist Google Sheet.
2. Click **🏳️ Subham Flag Checklist** in the top menu bar.
3. Select **🔐 Authorize Script**.
4. Follow the Google authorization prompts and grant the requested permissions.
5. Wait for the green **Authorization Complete** confirmation.

The confirmation popup displays the connected Google account, form spreadsheet, Responses file, and **Flag Checklist Pdf** destination folder.

> **Note:** If access is denied later, repeat authorization and confirm that your Google account has permission to access the destination spreadsheet and Drive folder.

## 2. Fill Out the Checklist

Open the **SubhamFlagCheckListForm** tab and complete the applicable fields. The script validates the form before PDF preview or submission; missing mandatory information must be completed before continuing.

### 2.1 Date

Enter the inspection date in **C11**, or use the signature date cells **H36:H38**, as applicable.

### 2.2 Shift Selection

| Shift | Checkbox |
|---|---|
| AM Shift | E13 |
| PM Shift | I13 |

Select both checkboxes if the checklist covers both shifts.

### 2.3 Inspection Checkpoints

Complete the OK / FAIL checks for the applicable shift across rows **17–25**.

| Shift | Checkpoint columns | Rows |
|---|---|---|
| AM Shift | E and G | 17–25 |
| PM Shift | I and K | 17–25 |

For **Defect Reported** in row 25, select the applicable Yes / No response. The PM Shift checklist also includes the **Night Lighting** checkpoint in row 24.

### 2.4 Guard Name and Signature

| Shift | Guard name | Signature |
|---|---|---|
| AM Shift | Morning Guard Name — C12 | AM Signature — C36 |
| PM Shift | Evening Guard Name — E12 | PM Signature — C37 |

### 2.5 Additional Details

Complete these fields whenever applicable:

| Information | Cell / Range |
|---|---|
| Location / Mast ID | E11 |
| Supervisor | C13 |
| Defect details | C28:C32 and H28:H31 |
| Signature times | E36:E38 |

Verify the selected shift, inspection responses, date, and guard details before previewing or submitting.

## 3. Preview and Print the PDF (Optional)

Use the preview option to verify the layout or print a copy without saving a PDF to Google Drive.

1. Click **🏳️ Subham Flag Checklist** in the Google Sheets menu.
2. Select **👁️ Preview & Print PDF**.
3. The script validates the entries.
4. A PDF preview opens in a new browser tab.

**PDF layout:** A4 Portrait, covering spreadsheet range **B1:L43**.

Print the checklist from the browser preview or close the tab.

> **Important:** Previewing does not create or save a PDF file in Google Drive.

## 4. Submit the Checklist

After completing and checking the inspection:

1. Click **🏳️ Subham Flag Checklist**.
2. Select **✔️ Submit Checklist**.
3. Wait while the script validates and processes the submission.
4. Look for the green **Checklist Submitted!** confirmation.

### What happens during submission?

The script automatically:

1. Validates the mandatory checklist fields.
2. Generates a unique Submission ID in the format **SUB-yyyyMMdd-HHmmss**.
3. Generates a PDF named **Subham_Flag_Checklist_<SUB-ID>.pdf**.
4. Saves the PDF in the Google Drive folder named **Flag Checklist Pdf**.
5. Adds the checklist answers as a new row in the **Responses** sheet.
6. Adds the Submission ID in Column A as a hyperlink to the saved PDF.

The success popup displays the **Submission ID**, **Shift**, and **Response Row number**.

> **Important:** Wait for the success confirmation before resetting the form. This prevents clearing information before the submission has completed.

## 5. Reset the Form for the Next Entry

After a successful submission, reset the form so it is ready for the next inspection.

1. Click **🏳️ Subham Flag Checklist**.
2. Select **🔄 Reset Form**.
3. Confirm by clicking **Yes** in the confirmation prompt.

The reset operation clears the following fields.

**Checkboxes**
- E13, I13
- E17:E25, G17:G25
- I17:I25, K17:K25

**Text and date fields**
- C11:C13
- E11:E12
- C28:C32
- H28:H31
- C36:C38
- E36:E38
- H36:H38

> **Caution:** Resetting clears the listed form entries. Submit the checklist first and confirm that the submission succeeded.

## 6. Quick Troubleshooting

| Popup / Issue | What it means | What to do |
|---|---|---|
| **Validation Required / Cannot Generate PDF** | One or more mandatory fields are empty. | Complete the fields identified in the amber validation popup, then try again. |
| **System Busy** | Another user is submitting at the same time. | Wait a few seconds and click **Submit Checklist** again. |
| **Access Error / Authorization Failed** | Your Google account cannot access the Responses spreadsheet or Drive folder, or authorization is incomplete. | Run **🔐 Authorize Script** again. If the issue continues, ask the administrator to grant access to the destination spreadsheet and folder. |
| **Worksheet Missing** | A required worksheet tab may have been renamed or deleted. | Confirm that the tabs are named exactly **SubhamFlagCheckListForm** and **Responses**. |

### Before contacting the administrator

- Confirm that you are using the correct Google account.
- Check that the required worksheet tabs still exist and have the correct names.
- Run script authorization again if an access-related error appears.
- Note the exact popup message so the administrator can investigate efficiently.

## 7. Project Files Overview

| File | Responsibility |
|---|---|
| **code.js** | Stores spreadsheet and folder IDs and creates the custom **🏳️ Subham Flag Checklist** menu. |
| **Authorize.js** | Verifies and triggers Google Sheets, Google Drive, and OAuth permissions. |
| **Validator.js** | Checks for blank forms and missing mandatory shift, date, or guard information. |
| **FormHandler.js** | Handles submission locking, response-row logging, and form resets. |
| **PDFService.js** | Exports range **B1:L43** as an A4 Portrait PDF for Drive storage and browser preview. |
| **UIModal.js** | Displays styled Success, Error, Warning, and Validation popup dialogs. |

---

## Operational Reminder

**Recommended workflow:** Authorize once → Fill in the checklist → Preview and verify (optional) → Submit → Confirm successful submission → Reset for the next entry.

Always verify the success popup and the saved response before resetting the form.
