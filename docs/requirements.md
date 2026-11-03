# Construction Client Portal
## Software Requirements Specification

### 1. Project Overview

Build a secure mobile application for a construction company to manage projects, share documents with clients and builders, and communicate construction progress.

The application will initially support approximately 12 clients, with around 10 to 20 documents per client. The architecture should allow future growth without unnecessary complexity.

The application must prioritise security, reliability, usability and protection of confidential construction documents.

## 2. User Roles

The application will support three roles.

### 2.1 Owner

The owner has administrative control over the construction company.

The owner can:

1. Create, edit and archive projects.
2. Create accounts for clients and builders.
3. Assign users to projects and manage their permissions.
4. Upload, view, download, organise and delete documents.
5. Publish construction progress updates and photographs.
6. View project activity.
7. Reset user passwords and revoke access.
8. Manage project members.

### 2.2 Builder

Builders can access projects to which they have been assigned.

They can:

1. View their assigned projects.
2. View and download permitted project documents.
3. Upload documents if authorised.
4. Publish progress photographs and updates if authorised.
5. Receive notifications about relevant project activity.

Builders must not access administrative functions unless explicitly authorised.

### 2.3 Client

Clients can access their assigned construction projects.

They can:

1. View project information.
2. View and download available documents.
3. View construction progress photographs and updates.
4. Receive relevant notifications.
5. Manage their own account settings and password.

Clients must not access other clients' projects or private internal information.

## 3. Project Management

The application must allow the owner to create and manage construction projects.

Each project should contain:

1. Project name.
2. Project description.
3. Client assignment.
4. Assigned builders.
5. Project status.
6. Creation and modification dates.
7. Documents.
8. Progress updates.
9. Project activity history.

The owner must be able to update project details, change assignments and archive completed projects.

Archiving a project must not automatically destroy its documents or historical records.

## 4. Account Creation and Authentication

### 4.1 Account Creation

1. The owner creates accounts by entering the user's email address and assigning their project and role.
2. The application generates a temporary password for the account.
3. The owner shares the login credentials manually through WhatsApp, text message or in person.
4. The application must not require integrated email delivery.
5. Users must change their temporary password on their first login.
6. Passwords must be securely hashed by the authentication provider and never stored as plain text.
7. Users must not gain access to projects until the backend has established their authorised project membership.

### 4.2 Persistent Sessions

1. Users should remain logged in after their initial login when reopening the application.
2. Sessions must renew automatically without requiring repeated credential entry during normal use.
3. Session credentials must be stored using appropriate secure device storage.
4. Sessions must be revocable if a device is lost, an account is compromised or access needs to be withdrawn.
5. Users must be able to log out manually.
6. The application must not promise permanent sessions that cannot expire or be revoked.

### 4.3 Password Management

1. Users must be able to change their passwords.
2. The owner must be able to reset a user's password and generate a replacement temporary password.
3. Users must change replacement temporary passwords at their next login.
4. Password reset and account recovery must not depend on integrated email delivery.
5. Temporary passwords must not be logged or stored in plaintext.
6. The system must provide a secure way to recover accounts if users forget their passwords.

The recovery process must be designed before implementation. Manual recovery may be used initially, provided the owner's authority is verified.

### 4.4 Access Revocation

1. The owner can remove users from projects.
2. Removing a user must immediately prevent access to that project's protected resources.
3. Removing a user from one project must not automatically remove access to other projects to which they remain assigned.
4. The owner can disable accounts and revoke sessions when necessary.

## 5. Document Management

### 5.1 Supported Documents

The application should support common construction documents, including:

1. PDF files.
2. Word documents.
3. Excel spreadsheets.
4. Construction plans and drawings.
5. Contracts and quotations.
6. Invoices.
7. Certificates and inspection reports.
8. Specifications.
9. Site photographs.

The supported formats and maximum file sizes must be explicitly configured.

### 5.2 Uploading Documents

1. Authorised users can upload documents to the appropriate project.
2. Every document must be associated with a project.
3. The application must display upload progress.
4. Failed uploads must produce a clear error and allow the user to retry.
5. Interrupted uploads must not result in incomplete documents being presented as successfully uploaded.
6. Duplicate submissions should be handled safely.
7. The system must validate file types and sizes.
8. Uploaded files must be checked for malware according to the agreed security design.

### 5.3 Document Organisation

Documents must be organised by project and support useful metadata, including:

1. Filename.
2. Document type or category.
3. Uploading user.
4. Upload date.
5. File size.
6. Optional description.

Users should be able to find documents without searching through unrelated projects.

### 5.4 Viewing and Downloading

1. Authorised users can preview supported documents.
2. Users can download permitted documents.
3. Unsupported preview formats must offer a download option.
4. Document access must be authorised by the backend.
5. Private documents must never be publicly accessible through predictable URLs.
6. Download links must be short lived or otherwise protected.
7. The application must handle deleted, unavailable and corrupted files gracefully.

### 5.5 Document Deletion and Versioning

The owner must be able to delete documents.

The design must define whether deleted documents are recoverable and how long they remain in recovery storage.

Document version history should be considered so updated plans, quotations and contracts do not silently overwrite important previous versions.

## 6. Construction Progress Updates

The application must allow authorised users to communicate construction progress.

Each update should support:

1. Photographs.
2. A written description.
3. The associated project.
4. The author.
5. The creation date and time.

Users must be able to view updates in chronological order.

The system must preserve the association between updates and their projects and prevent users from viewing updates belonging to unauthorised projects.

The owner should be able to remove inappropriate or incorrect updates.

## 7. Notifications

The application should notify relevant users when important project activity occurs.

Potential notification events include:

1. A new document is uploaded.
2. A progress update is published.
3. A document is updated.
4. A user is assigned to a project.
5. A project is archived.

Users should only receive information about projects they are authorised to access.

The notification mechanism must be selected during architecture design. Notifications should not expose confidential document contents or sensitive information on a locked device.

## 8. User Interface and Mobile Experience

The application will initially be designed as a mobile application using React Native and Expo.

The interface must:

1. Be simple enough for clients and construction workers to use without technical knowledge.
2. Provide clear navigation between projects, documents and progress updates.
3. Make uploading photographs and documents straightforward.
4. Display loading, success and error states.
5. Handle poor connectivity and interrupted operations gracefully.
6. Prevent accidental destructive actions through confirmation where appropriate.
7. Support appropriate accessibility and readable text sizes.

Face ID or fingerprint authentication may be offered as a convenient way to unlock access to an existing session. It must not replace backend authorisation checks.

The design should use the construction company's branding, with the final colour scheme and visual identity agreed before implementation.

## 9. Security and Authorisation

Security is a core requirement because the application stores confidential business and client documents.

### 9.1 Project Isolation

1. Users must only access projects to which they have been assigned.
2. The backend must verify permissions on every protected request.
3. Changing a project ID in a request must never grant access to another project.
4. Document identifiers and download URLs must not bypass project permissions.
5. Frontend checks must not be treated as a security boundary.

### 9.2 Data Protection

1. All network traffic must use HTTPS.
2. Sensitive credentials must not be embedded in the mobile application.
3. Database credentials and privileged API keys must remain on the server.
4. Database and storage permissions must follow least privilege.
5. Sensitive information must not be unnecessarily written to application logs.
6. Secure storage must be used for mobile session credentials.
7. Data must be protected at rest using appropriate platform capabilities.
8. Access to administrative actions must be restricted to authorised users.

### 9.3 Abuse Protection

The system must include appropriate rate limiting, input validation and protection against unauthorised requests.

The architecture should be reviewed for risks such as brute force login attempts, malicious uploads and denial of service.

### 9.4 Audit Logging

The system should record important security and administrative events, including:

1. Account creation and disabling.
2. Password resets.
3. Project membership changes.
4. Document uploads and deletions.
5. Permission changes.
6. Relevant administrative actions.

Logs must not contain passwords, raw session tokens or other unnecessary secrets.

## 10. Data Storage and Architecture

The initial proposed technology stack is:

| Component | Proposed technology |
|---|---|
| Mobile frontend | React Native with Expo |
| Backend API | Next.js Route Handlers |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Document and photograph storage | Private S3 compatible object storage |
| Hosting | To be selected after reviewing operational requirements |

The final stack must be confirmed before implementation.

### 10.1 Database

PostgreSQL should store structured application information, including:

1. Users and account references.
2. Projects.
3. Project Members and roles.
4. Invitations, if required by the final account creation flow.
5. Document metadata.
6. Progress updates.
7. Notifications.
8. Audit logs.

Large documents and photographs should be stored in object storage rather than directly in ordinary database records.

### 10.2 File Upload Architecture

The backend should authorise uploads and generate short lived upload URLs.

The mobile application can then upload files directly to private object storage.

After upload, the backend must verify that the upload completed successfully before making the document available to other users.

### 10.3 Data Integrity

The system must prevent inconsistent records, orphaned file references and duplicate processing where practical.

Database operations must use appropriate transactions and constraints.

The application must handle failures between file upload and database recording without silently losing track of documents.

## 11. Backups and Recovery

The application must have a documented backup and recovery strategy before real client documents are stored.

Requirements include:

1. Automated database backups.
2. Appropriate protection and recovery options for stored files.
3. Defined retention periods.
4. Protection of backup access credentials.
5. A documented restoration process.
6. Periodic restoration tests.
7. Clear procedures for recovering accidentally deleted documents or corrupted data.

Database backups alone are insufficient because the actual documents and photographs reside in object storage.

## 12. Reliability and Error Handling

The application must handle expected failures without losing or exposing client data.

It must:

1. Display understandable errors.
2. Avoid reporting failed uploads as successful.
3. Handle expired sessions and revoked access.
4. Retry suitable transient operations safely.
5. Prevent duplicate submissions where possible.
6. Log operational errors without exposing secrets.
7. Provide sufficient monitoring to identify failed uploads, API errors and service outages.

The system should fail securely when authorisation checks or required security services cannot be completed.

## 13. Testing Requirements

Testing must be planned before implementation.

### 13.1 Functional Testing

Verify that users can perform the actions permitted by their roles.

### 13.2 Authorisation Testing

Verify that:

1. Clients cannot access other clients' projects.
2. Builders cannot access unauthorised administrative functions.
3. Removed members immediately lose access to the relevant project.
4. Expired or revoked sessions cannot access protected resources.
5. Direct requests cannot bypass frontend permissions.

### 13.3 Document Testing

Test successful uploads, large files, invalid formats, interrupted uploads, failed downloads, deletion and recovery.

### 13.4 Authentication Testing

Test first login, temporary password changes, persistent sessions, token renewal, password resets, account disabling and session revocation.

### 13.5 Recovery Testing

Test database restoration and document recovery before launch.

Critical security and data integrity tests must pass before real clients use the application.

## 14. Deployment and Maintenance

The application must have separate development and production environments.

Production secrets must be isolated from development credentials.

The deployment process should include:

1. Database migrations.
2. Automated tests.
3. Configuration validation.
4. Monitoring and error reporting.
5. Backup verification.
6. A documented rollback procedure.
7. A process for applying security updates.

The application must not depend on a developer manually intervening for routine operations.

## 15. Initial Scope and Exclusions

The initial release will focus on project management, documents, progress updates, account management and secure access.

The following are not required for the initial release unless separately approved:

1. AI features.
2. Payment processing.
3. Accounting integrations.
4. Complex construction scheduling.
5. Real time messaging.
6. Advanced analytics.
7. Multi company self service onboarding.

The architecture should avoid unnecessarily restricting future expansion.

## 16. Acceptance Criteria

The application is ready for initial production use only when:

1. The owner can create projects and assign users.
2. Clients and builders can access only their authorised projects.
3. Account creation and password management work without integrated email delivery.
4. Users remain logged in through normal app closures and session renewal.
5. The owner can revoke access when necessary.
6. Documents can be uploaded, retrieved and viewed reliably.
7. Progress photographs and updates are associated with the correct projects.
8. Security and project isolation tests pass.
9. Backups and restoration have been tested.
10. Monitoring and error handling are operational.
11. The application has passed user acceptance testing with the construction company.

The application must not be released to real clients until critical security, permission, document integrity and recovery requirements have been verified.
