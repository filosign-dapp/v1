# API Reference

Portal's backend API handles file uploads to IPFS and metadata storage.

## Base URL
```
Production: https://portal-plgenesis.onrender.com/api/v1
Development: http://localhost:3000/api/v1
```

## Main Endpoints

### Upload File
```http
POST /file
Content-Type: multipart/form-data
```
Upload single file to IPFS and store metadata.

### Upload Directory
```http
POST /file/directory
Content-Type: multipart/form-data
```
Upload multiple files as directory to IPFS.

### Get File Info
```http
GET /file/download/:cid
```
Retrieve file metadata by Content ID.

### List Files
```http
GET /file?page=1&limit=10
```
Get paginated list of files.

## Response Format
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

## Authentication
- Rate limiting: 300 requests/second
- Admin endpoints require bearer token
- Include `X-Api-Key` header for requests 