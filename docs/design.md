# Construction Client Portal
## MVP Application Design

## 1. Application Overview

**Platform:** iOS and Android mobile application.

**Purpose:** Give construction companies one central place to manage projects, documents and keep clients informed about progress.

### Main Features

1. Project management
2. User and account management
3. Document management
4. Progress updates and photos
5. Push notifications
6. Document downloads
7. Offline access to downloaded documents
8. Authentication and account security

## 2. User Roles

Potential roles:

| Role | Description |
|---|---|
| Owner | Manages the entire company account |
| Builder | Works on assigned projects |
| Architect | Works on assigned projects |
| Client | Views their project information |

Final roles and permissions will be decided later. We will not implement the permissions matrix until all user types have been agreed.

## 3. Authentication and Accounts

### Account Creation

The Owner creates accounts manually.

| Field | Description |
|---|---|
| Full name | User's name |
| Email | Used as username |
| Password | Temporary password |
| Role | Assigned once roles are finalised |

### First Login

1. Owner creates the account.
2. Owner sends login credentials through WhatsApp.
3. User logs in using their email and temporary password.
4. App forces the user to create a new password.
5. User enters the application.
6. App keeps the user signed in using persistent authentication.

### Subsequent Logins

Users remain signed in unless:

1. They log out.
2. They change devices.
3. They reinstall the application.
4. Their session expires or is revoked.

The app automatically refreshes authentication tokens where possible.

### Forgotten Password

1. User contacts the Owner.
2. Owner opens the user's profile.
3. Owner selects Reset Password.
4. Backend generates a new temporary password.
5. Owner sends it through WhatsApp.
6. User logs in and must create a new password.

### Security Requirements

1. Passwords are stored as secure hashes.
2. Owner cannot view existing passwords.
3. Resetting a password invalidates existing sessions.
4. No email integration is required.

## 4. Project Management

The Owner manages all construction projects.

### Creating a Project

Example: Smith Residence Renovation.

Proposed project information:

| Field | Example |
|---|---|
| Project name | Smith Residence Renovation |
| Client | John Smith |
| Address | 25 Example Road |
| Description | Full residential renovation |
| Start date | 01/11/2026 |
| Expected completion | 01/05/2027 |
| Status | In progress |

These fields are proposed and require confirmation.

### Project Dashboard

Each project should have:

1. Project overview
2. Assigned users
3. Documents
4. Progress updates
5. Project information

### Project Membership

Users are assigned to projects.

A user can only access projects they have been assigned to, subject to their role permissions.

The Owner can access every project.

### Removing Users

When a user is removed from a project:

1. They immediately lose access to the project in the app.
2. They cannot view or download its documents.
3. Previously downloaded documents remain on their phone.
4. The app does not attempt to delete local copies.

## 5. Document Management

### Supported Document Types

- PDF
- Word
- Excel
- Images
- Construction plans and drawings
- Contracts
- Quotes
- Invoices
- Certificates
- Inspection reports
- Specifications

### Upload Process

1. User selects a project.
2. User opens Documents.
3. User selects Upload.
4. User chooses a file.
5. App sends an upload request to the backend.
6. Backend checks permissions.
7. File uploads to private object storage.
8. PostgreSQL stores the document metadata.

### Storage Architecture

**Object Storage Bucket**

Stores the actual files.

**PostgreSQL**

Stores document metadata:

| Field | Description |
|---|---|
| ID | Document identifier |
| Project ID | Associated project |
| Filename | Original filename |
| File type | PDF, DOCX, XLSX etc. |
| File size | Size in bytes |
| Storage key | Location in bucket |
| Uploaded by | User ID |
| Created at | Upload timestamp |
| SHA-256 hash | Duplicate detection |

### Duplicate Prevention

SHA-256 hashing will be used.

Duplicate detection applies within each project.

Example:

- Project A already contains contract.pdf.
- Someone uploads an identical copy to Project A.
- The system detects the matching hash and displays a duplicate warning.
- The same file can still be uploaded to Project B.

### Document Viewing

| File type | Viewing method |
|---|---|
| PDF | In-app preview |
| Images | In-app preview |
| Word | External application |
| Excel | External application |
| Unsupported formats | Download or external application |

### Editing Documents

For the MVP:

1. User downloads the Word or Excel document.
2. Opens it in the relevant application.
3. Makes changes.
4. Saves the updated file.
5. Returns to the construction app.
6. Uses Replace Document to upload the updated copy.

No Microsoft 365 integration for now.

No document version history.

### Document Deletion

Permission rules will be finalised later when all user roles have been agreed.

The system will support deletion and replacement.

### Downloading Documents

1. All users assigned to a project can download its documents.
2. Users manually select which documents to download.
3. Downloads require an internet connection.
4. If there is no internet connection, display:

"No internet connection. Connect to the internet to download this document."

5. Once downloaded, the document is the user's local copy.
6. The application does not manage its deletion or expiry.

## 6. Progress Updates

### Creating an Update

Users with the appropriate permissions can:

1. Open a project.
2. Navigate to Progress Updates.
3. Enter a written description.
4. Attach multiple photos.
5. Publish the update.

Example:

**Progress update: Ground floor plumbing completed**

Description:

"First fix plumbing has been completed throughout the ground floor. Next stage is electrical installation."

Photos can include plumbing installation, pipework and completed bathroom connections.

### Photo Storage

Actual photos are stored in private object storage.

PostgreSQL stores their metadata and relationships to the progress update.

### Display

Progress updates appear in chronological order, newest first.

Each update displays:

1. Description
2. Date and time
3. Author
4. Attached photos

### Comments

No commenting functionality.

Progress updates are read-only for users viewing them.

## 7. Notifications

For the MVP, notifications are limited to progress updates.

### Notification Workflow

1. User publishes a progress update.
2. Backend saves the update and photos.
3. Backend identifies other users assigned to the project.
4. Push notifications are sent.
5. User taps the notification.
6. App opens the relevant project and progress update.

Document uploads will not trigger notifications.

## 8. Offline Functionality

The application requires internet access to communicate with the backend.

### Without Internet

Users can:

- Navigate previously loaded screens.
- View previously downloaded documents.

Users cannot:

- Upload documents.
- Download new documents.
- Publish progress updates.
- Retrieve new project information.
- Receive live updates.

When internet connectivity returns, the app retrieves the latest information.

Downloaded documents remain on the user's device, even if they subsequently lose access to the project.

## 9. Technical Architecture

Recommended implementation stack:

| Component | Technology |
|---|---|
| Mobile application | React Native |
| Development framework | Expo |
| Backend | Node.js + Express |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | Access and refresh tokens |
| File storage | Private S3-compatible bucket |
| Push notifications | Expo Notifications |
| Hosting | Railway |

### High-Level Architecture

```text
          iOS / Android App
           React Native
                 |
                 | HTTPS API requests
                 |
           Express Backend
                 |
        +--------+--------+
        |                 |
    PostgreSQL       Object Storage
        |                 |
  User information     Documents
  Projects             Photos
  Members
  Metadata
  Notifications
        |
        |
   Push Notifications
        |
        v
    User's Phone
```

### Database Design

Proposed tables:

| Table | Purpose |
|---|---|
| Users | User accounts |
| Projects | Construction projects |
| ProjectMembers | Connects users to projects |
| Documents | Document metadata |
| ProgressUpdates | Written progress updates |
| ProgressPhotos | Photos attached to updates |
| Notifications | Notification records |
| Sessions | Persistent login sessions |

### Database Relationships

- One project has many documents.
- One project has many progress updates.
- One progress update has many photos.
- Users and projects have a many-to-many relationship through ProjectMembers.
- One user has many sessions.

## 10. Security and Reliability

### Authentication

- Secure password hashing.
- Short-lived access tokens.
- Refresh token rotation.
- Secure token storage on devices.
- Session revocation.

### Authorisation

- Backend checks permissions on every protected request.
- Users cannot access projects they are not assigned to.
- Users cannot access documents from other projects.
- Project membership is checked before generating download URLs.

### File Security

- Private object storage.
- Signed URLs for uploads and downloads.
- File type validation.
- File size limits.
- Secure filename handling.
- Duplicate detection.

### Data Reliability

- Automated database backups.
- Object storage backups or replication.
- Upload failure handling.
- Error logging.
- Monitoring.
- Recovery procedures.

### API Reliability

- Request validation.
- Consistent error responses.
- Rate limiting.
- Upload retries.
- Duplicate request protection.
- Proper handling of failed uploads.

A failed upload should not leave the application showing a document that does not actually exist.
