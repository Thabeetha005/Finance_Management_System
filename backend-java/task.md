# MySQL BLOB Document Verification Workflow

## Backend Tasks
- [x] 1. Update `Loan` and `Investment` entities to add `applicationStatus` string (APPLIED, DOCUMENTS_SUBMITTED, UNDER_REVIEW, APPROVED, ACTIVE, RESUBMISSION_REQUIRED).
- [x] 2. Completely replace the current `Document` entity to match the spec: `id`, `userId`, `applicationId`, `applicationType` (String/Enum), `documentType` (String/Enum), `fileName`, `contentType`, `fileSize`, `fileData` (must be `@Lob @Column(columnDefinition = "LONGBLOB") byte[]`), `verificationStatus`, `adminNote`, `uploadedAt`, `reviewedAt`, `reviewedBy`.
- [x] 3. Create `DocumentController` for customers:
  - `POST /api/documents/upload` using `multipart/form-data`. Validates MIME (JPG, PNG, PDF), max size (10MB), securely linking to the `authenticatedUser`.
  - `GET /api/documents/{documentId}` streaming the file using `ResponseEntity<byte[]>` with correct Content-Type. User must own the file.
- [x] 4. Create Admin endpoints in `AdminDocumentController`:
  - `GET /api/admin/documents/{documentId}` (view file).
  - `POST /api/admin/documents/{documentId}/verify` (approve/reject).
  - Fetching lists of documents for the verification queue.
- [x] 5. Update `application.properties` to ensure Spring Boot allows 10MB multipart uploads.
- [x] 6. Make sure it compiles successfully (Tested via code review, compilation requires properly configured JAVA_HOME on the environment).
