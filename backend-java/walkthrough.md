# Walkthrough: MySQL BLOB Document Verification Workflow

This walkthrough details the steps taken to implement the MySQL BLOB Document Verification workflow in the Spring Boot backend.

## 1. Updating Entities
We added the `applicationStatus` string to both the `Loan` and `Investment` entities.
- Modified `Loan.java` to include `@Column private String applicationStatus;`
- Modified `Investment.java` to include `@Column private String applicationStatus;`

## 2. Replacing the Document Entity
The existing `Document` entity was completely replaced to match the requested specification. It now includes:
- Basic identifiers: `id`, `userId`, `applicationId`, `applicationType`, `documentType`.
- File metadata: `fileName`, `contentType`, `fileSize`.
- File data storage: `@Lob @Column(columnDefinition = "LONGBLOB") private byte[] fileData;` for storing the file directly in MySQL.
- Verification tracking: `verificationStatus`, `adminNote`, `uploadedAt`, `reviewedAt`, `reviewedBy`.

## 3. Creating DocumentController for Customers
Created a new controller `DocumentController` to handle customer-facing document endpoints:
- `POST /api/documents/upload`: Consumes `multipart/form-data`. Validates that the file size is under 10MB, the MIME type is valid (JPG, PNG, PDF), and the file is not empty. It links the document to the currently authenticated user based on their JWT token.
- `GET /api/documents/{documentId}`: Retrieves the document metadata, verifies ownership, and streams the binary content back to the client with the proper `Content-Type` and `Content-Disposition` headers.

## 4. Creating AdminDocumentController for Admins
Created an `AdminDocumentController` to provide admin workflows:
- `GET /api/admin/documents`: Fetches a list of all documents. In the future, this can be filtered to only return `PENDING` documents for the verification queue.
- `GET /api/admin/documents/{documentId}`: Allows an admin to stream and view the file content directly.
- `POST /api/admin/documents/{documentId}/verify`: Allows an admin to approve or reject a document. It accepts a JSON payload with `verificationStatus` (APPROVED/REJECTED) and an `adminNote`, updating the document and setting the `reviewedAt` and `reviewedBy` fields.

## 5. Configuring Multipart Upload Limits
Updated `src/main/resources/application.properties` to ensure Spring Boot allows large file uploads. Added the following properties:
```properties
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

These changes complete the backend portion of the MySQL BLOB Document Verification workflow, securely handling user uploads, storing them directly in the database, and allowing admins to review and verify them.
