# Walkthrough: Implementing Document Verification Frontend

This walkthrough explains the frontend changes made to support the new BLOB-based Document Verification workflow in the Kalpanaaa Finance application.

## 1. Customer Loan Wizard Document Upload
**File:** `frontend/src/pages/customer/CustomerLoansPage.jsx`

We added a new "Document Upload" step to the loan application process. This step is injected before the final "Review & Submit" screen. 
- It presents users with file inputs for their PAN Card, Aadhaar Card, and Bank Statement. 
- If the selected loan type is "Business Loan", it dynamically asks for a GST Certificate.
- On submission, it creates a `FormData` object mimicking the `multipart/form-data` structure expected by the `POST /api/documents/upload` endpoint.

## 2. Customer Dashboard Verification Status
**File:** `frontend/src/pages/CustomerDashboard.jsx`

The customer dashboard sidebar was updated to provide immediate visual feedback regarding the customer's application and verification status.
- **Verified Badge:** We check `user?.verificationStatus === 'VERIFIED'` and render a green "Verified" badge next to the user's name using the `BadgeCheck` icon from `lucide-react`.
- **Application Status:** We replaced the hardcoded "UNDER REVIEW" widget with a dynamic readout of `user?.applicationStatus`, mapping status codes like `APPROVED` or `UNDER_REVIEW` to appropriate color dots.

## 3. Admin Verification Queue
**Files:** 
- `frontend/src/pages/admin/AdminVerificationQueue.jsx`
- `frontend/src/components/layouts/AdminLayout.jsx`
- `frontend/src/App.jsx`

To allow admins to review uploaded documents, we created a brand-new page called `AdminVerificationQueue`.
- **Data Fetching:** It fetches pending documents from `GET /api/admin/documents`.
- **Review Modal:** Admins can click "Review" on a document to open a modal.
- **Viewing Files:** The modal includes a "View Uploaded File" button that opens `GET /api/admin/documents/{documentId}` in a new secure tab.
- **Approval/Rejection:** Admins can input a note and either click "Approve" or "Request Resubmission", which sends a `POST` request to `/api/admin/documents/{documentId}/verify`.

Finally, we registered this new route `/admin/verification-queue` in `App.jsx` and added a matching link to the sidebar navigation in `AdminLayout.jsx`.

## 4. Build Verification
The React app was successfully compiled using `npm run build`, ensuring no syntax errors or broken imports were introduced during these changes.

---

# Walkthrough: Implementing "Only One Current EMI" Backend Logic

This walkthrough explains the backend changes made to support displaying a single current EMI and the EMI history.

## 1. Repository Enhancements
**File:** `backend-java/src/main/java/com/kalpanaaafinance/repository/LoanInstallmentRepository.java`

We introduced custom JPA methods to efficiently query EMIs:
- `findFirstByLoanIdAndStatusInOrderByDueDateAsc`: Grabs the single most pressing EMI by filtering for actionable statuses (`PENDING`, `OVERDUE`, `PARTIALLY_PAID`) and sorting by due date.
- `findByLoanIdAndStatusOrderByDueDateDesc`: Grabs the history of EMIs by finding those marked as `PAID`.

## 2. Customer Loan Controller
**File:** `backend-java/src/main/java/com/kalpanaaafinance/controller/LoanController.java`
**File:** `backend-java/src/main/java/com/kalpanaaafinance/entity/LoanInstallment.java`

Created a new `LoanController` specifically serving customer-facing EMI endpoints:
- `GET /api/loans/{id}/current-emi`: Returns the next actionable EMI for a given loan ID.
- `GET /api/loans/{id}/emi-history`: Returns a list of past paid EMIs for a given loan ID.
- To prevent Jackson from entering an infinite recursion loop between `Loan` and `LoanInstallment`, we added `@JsonIgnore` to the `loan` field in the `LoanInstallment` entity.

## 3. Admin User Controller
**File:** `backend-java/src/main/java/com/kalpanaaafinance/controller/AdminUserController.java`

Refactored the `GET /api/admin/users/{userId}/loan-installments` endpoint to structure the data appropriately for the admin UI.
- Instead of returning a raw list of all installments across all of a user's loans, it now calculates the most pressing `currentEmi` overall and aggregates the paid `history`, returning them as a JSON object: `{ currentEmi: ..., history: [...] }`.

## 4. Backend Build Verification
Verified that the Java application compiles without errors by executing `mvnw clean compile`.

---

# Walkthrough: Implementing "Only One Current EMI" Frontend Logic

This walkthrough explains the frontend changes made to consume the new split current EMI / history APIs.

## 1. Customer Repayments View
**File:** `frontend/src/pages/customer/CustomerEmiRepaymentsPage.jsx`

We overhauled the EMI Repayments page to drop the hardcoded list of multiple future EMIs.
- It now executes two separate `useQuery` calls to fetch `GET /api/loans/{id}/current-emi` and `GET /api/loans/{id}/emi-history`.
- A single "Active Repayment" card is shown if a `currentEmi` exists, highlighting the amount due and due date.
- Below it, a "Payment History" list renders all historical payments correctly formatted.

## 2. Admin User Details EMI View
**File:** `frontend/src/pages/admin/AdminUserDetails.jsx`

Updated the `TabLoanInstallments` sub-component to consume the refactored admin endpoint `GET /api/admin/users/{userId}/loan-installments`.
- It dynamically reads `data.currentEmi` and `data.history` instead of mapping over an array of all installments.
- The UI was visually split to mirror the customer experience: an upper block highlights the actionable `currentEmi`, and a lower block lists the `history`.

## 3. Frontend Build Verification
Verified that the React application compiles without errors by executing `npm run build`.
