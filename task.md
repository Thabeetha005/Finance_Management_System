# Document Verification Workflow Frontend Tasks

## Tasks Completed
1. **Customer Loan Wizards:** Updated `CustomerLoansPage.jsx` to include a "Document Upload" step (Step 4) asking for PAN, Aadhaar, Bank Statement, and GST (for business loans) before the Review & Submit step.
2. **Customer Dashboard:** Modified `CustomerDashboard.jsx` to show the application status under the user profile, replacing the hardcoded "UNDER REVIEW" with dynamic checking of `user.applicationStatus`. Also added a "Verified" badge using the `BadgeCheck` icon if `user.verificationStatus === 'VERIFIED'`.
3. **Admin Portal Verification Queue:** Created `AdminVerificationQueue.jsx` for admins to view pending documents, stream the file (`window.open`), and approve or reject with a note. Integrated this page into `App.jsx` and added a navigation link in `AdminLayout.jsx`.
4. **React Build:** Ran `npm run build` to verify that there are no compilation errors and the React code builds successfully.

# Only One Current EMI - Backend Tasks

## Tasks Completed
1. **Repository Queries:** Updated `LoanInstallmentRepository` with custom queries `findFirstByLoanIdAndStatusInOrderByDueDateAsc` and `findByLoanIdAndStatusOrderByDueDateDesc`.
2. **Customer LoanController:** Created `LoanController` providing `GET /api/loans/{id}/current-emi` and `GET /api/loans/{id}/emi-history`. Also added `@JsonIgnore` on the `loan` field in `LoanInstallment` to prevent infinite recursion during JSON serialization.
3. **AdminUserController:** Refactored `GET /api/admin/users/{userId}/loan-installments` to return a `Map<String, Object>` containing `{ currentEmi: LoanInstallment, history: List<LoanInstallment> }`.
4. **Backend Build:** Verified compilation success with `mvnw clean compile`.

# Only One Current EMI - Frontend Tasks

## Tasks Completed
1. **Customer Repayments View**: Updated `CustomerEmiRepaymentsPage.jsx` to fetch and display the single current actionable EMI and a separate history list using `@tanstack/react-query`.
2. **Admin User Details**: Updated `AdminUserDetails.jsx`'s `TabLoanInstallments` to render the new split view payload (`currentEmi` vs `history`) sent by the backend.
3. **Frontend Build**: Verified the React build successfully compiled via `npm run build`.

## Next Steps
- Integrate actual backend API endpoints for file uploads (currently using mock formData implementation).
- Hook up actual user state for `applicationStatus` and `verificationStatus` from the auth context.
- Verify admin document streaming works across different file types via the backend `GET /api/admin/documents/{documentId}` endpoint.
