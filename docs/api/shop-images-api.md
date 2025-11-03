# Shop Images API Documentation

> Edge Functions for managing shop images (upload, delete, reorder)

## Overview

This document describes the Edge Functions for managing shop images in the Gacha Store Admin system. All image APIs are integrated with Supabase Storage (bucket: `shop-images`).

---

## Base URL

```
https://{project-id}.supabase.co/functions/v1
```

---

## Authentication

All endpoints require authentication with JWT token in the `Authorization` header:

```
Authorization: Bearer {access_token}
```

**Required Role**: `admin`

---

## Endpoints

### 1. Upload Shop Images

Upload one or multiple images for a shop.

**Endpoint**: `POST /upload-shop-images`

**Content-Type**: `multipart/form-data`

#### Request Body (Form Data)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `shop_id` | string (UUID) | ✓ | Shop ID to upload images for |
| `images` | File[] | ✓ | Array of image files (multiple files with same field name) |
| `display_orders` | string (JSON) | - | JSON array of display orders `[1, 2, 3]` |

#### File Constraints

- **Max file size**: 10MB per image
- **Allowed formats**: JPEG, JPG, PNG, WebP, GIF
- **MIME types**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif`

#### Example Request

```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/upload-shop-images \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "shop_id=123e4567-e89b-12d3-a456-426614174000" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.png" \
  -F 'display_orders=[1,2]'
```

#### Response (200 OK)

```json
{
  "success": true,
  "uploaded": [
    {
      "id": "img-uuid-1",
      "shop_id": "shop-uuid",
      "image_path": "shops/shop-uuid/1234567890_0.jpg",
      "display_order": 1,
      "alt_text": "image1.jpg",
      "width": null,
      "height": null,
      "file_size": 2048576,
      "created_at": "2025-01-12T10:00:00Z",
      "public_url": "https://.../storage/v1/object/public/shop-images/shops/..."
    },
    {
      "id": "img-uuid-2",
      "shop_id": "shop-uuid",
      "image_path": "shops/shop-uuid/1234567890_1.png",
      "display_order": 2,
      "alt_text": "image2.png",
      "width": null,
      "height": null,
      "file_size": 1536789,
      "created_at": "2025-01-12T10:00:01Z",
      "public_url": "https://.../storage/v1/object/public/shop-images/shops/..."
    }
  ],
  "errors": [
    {
      "file": "invalid.txt",
      "error": "Invalid file type. Allowed: JPEG, PNG, WebP, GIF"
    }
  ],
  "message": "Successfully uploaded 2 of 3 images"
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "error": "shop_id is required"
}
```

**404 Not Found**
```json
{
  "error": "Shop not found"
}
```

**401 Unauthorized**
```json
{
  "error": "Unauthorized"
}
```

---

### 2. Delete Shop Image

Delete a single image from a shop (removes both DB record and Storage file).

**Endpoint**: `DELETE /delete-shop-image`

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | ✓ | Image ID to delete |

#### Example Request

```bash
curl -X DELETE \
  "https://your-project.supabase.co/functions/v1/delete-shop-image?id=img-uuid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Image deleted successfully",
  "deleted_image_id": "img-uuid"
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "error": "Image ID is required"
}
```

**404 Not Found**
```json
{
  "error": "Image not found"
}
```

**401 Unauthorized**
```json
{
  "error": "Unauthorized"
}
```

---

### 3. Update Image Display Order

Update the display order of multiple images (useful for reordering or changing featured image).

**Endpoint**: `PUT /update-shop-image-order`

**Content-Type**: `application/json`

#### Request Body

```json
{
  "shop_id": "shop-uuid",
  "images": [
    {
      "id": "img-uuid-1",
      "display_order": 2
    },
    {
      "id": "img-uuid-2",
      "display_order": 1
    },
    {
      "id": "img-uuid-3",
      "display_order": 3
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `shop_id` | string (UUID) | ✓ | Shop ID |
| `images` | array | ✓ | Array of image updates |
| `images[].id` | string (UUID) | ✓ | Image ID |
| `images[].display_order` | integer | ✓ | New display order (>= 1, must be unique) |

#### Constraints

- All `display_order` values must be >= 1
- No duplicate `display_order` values allowed
- All image IDs must belong to the specified shop

#### Example Request

```bash
curl -X PUT \
  https://your-project.supabase.co/functions/v1/update-shop-image-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shop_id": "shop-uuid",
    "images": [
      {"id": "img-uuid-1", "display_order": 2},
      {"id": "img-uuid-2", "display_order": 1}
    ]
  }'
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Updated display order for 2 images",
  "images": [
    {
      "id": "img-uuid-2",
      "shop_id": "shop-uuid",
      "image_path": "shops/shop-uuid/image2.jpg",
      "display_order": 1,
      "public_url": "https://..."
    },
    {
      "id": "img-uuid-1",
      "shop_id": "shop-uuid",
      "image_path": "shops/shop-uuid/image1.jpg",
      "display_order": 2,
      "public_url": "https://..."
    }
  ],
  "featured_image": {
    "id": "img-uuid-2",
    "display_order": 1,
    "public_url": "https://..."
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "error": "Duplicate display_order values are not allowed"
}
```

**404 Not Found**
```json
{
  "error": "Shop not found"
}
```

---

### 4. Get Shop with Images (Updated)

Retrieve a single shop with all images included.

**Endpoint**: `GET /admin-get-shop`

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | ✓ | Shop ID |

#### Example Request

```bash
curl -X GET \
  "https://your-project.supabase.co/functions/v1/admin-get-shop?id=shop-uuid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Response (200 OK)

```json
{
  "data": {
    "id": "shop-uuid",
    "name": "Tokyo Gacha Store",
    "shop_type": "gacha",
    "verification_status": "verified",
    "shop_tags": [...],
    "shop_images": [
      {
        "id": "img-uuid-1",
        "image_path": "shops/shop-uuid/image1.jpg",
        "display_order": 1,
        "alt_text": "Store front",
        "width": 1920,
        "height": 1080,
        "file_size": 2048576,
        "created_at": "2025-01-12T10:00:00Z",
        "public_url": "https://.../storage/v1/object/public/shop-images/shops/..."
      },
      {
        "id": "img-uuid-2",
        "display_order": 2,
        "public_url": "https://..."
      }
    ],
    "featured_image": {
      "id": "img-uuid-1",
      "display_order": 1,
      "public_url": "https://..."
    }
  }
}
```

**Notes**:
- `shop_images` are automatically ordered by `display_order` (ascending)
- `featured_image` is the image with `display_order = 1`
- `public_url` is automatically generated for each image

---

### 5. List Shops with Images (Updated)

Retrieve paginated list of shops with images included.

**Endpoint**: `GET /admin-list-shops`

**Query Parameters**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | - | 1 | Page number |
| `limit` | integer | - | 10 | Items per page |
| `shop_type` | string | - | - | Filter by shop type |
| `verification_status` | string | - | - | Filter by verification status |
| `search` | string | - | - | Search in name, address fields |

#### Example Request

```bash
curl -X GET \
  "https://your-project.supabase.co/functions/v1/admin-list-shops?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Response (200 OK)

```json
{
  "data": [
    {
      "id": "shop-uuid",
      "name": "Tokyo Gacha Store",
      "shop_type": "gacha",
      "shop_tags": [...],
      "shop_images": [
        {
          "id": "img-uuid-1",
          "display_order": 1,
          "public_url": "https://..."
        }
      ],
      "featured_image": {
        "id": "img-uuid-1",
        "display_order": 1,
        "public_url": "https://..."
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

## Image Storage Structure

All images are stored in the `shop-images` bucket with the following structure:

```
shop-images/                           (Public Bucket)
└── shops/
    └── {shop_id}/
        ├── {timestamp}_0.jpg         (display_order: 1 - Featured image)
        ├── {timestamp}_1.png         (display_order: 2)
        └── {timestamp}_2.webp        (display_order: 3)
```

**Public URL Format**:
```
https://{project-id}.supabase.co/storage/v1/object/public/shop-images/shops/{shop_id}/{filename}
```

---

## Common Use Cases

### Use Case 1: Upload Images When Creating a Shop

```typescript
// 1. Create shop first
const { data: shop } = await fetch('/admin-create-shop', {
  method: 'POST',
  body: JSON.stringify({ name: 'New Shop', ... })
})

// 2. Upload images
const formData = new FormData()
formData.append('shop_id', shop.id)
formData.append('images', file1)
formData.append('images', file2)
formData.append('display_orders', JSON.stringify([1, 2]))

await fetch('/upload-shop-images', {
  method: 'POST',
  body: formData
})
```

### Use Case 2: Change Featured Image

```typescript
// Move current image at position 2 to position 1 (featured)
await fetch('/update-shop-image-order', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    shop_id: 'shop-uuid',
    images: [
      { id: 'current-featured-img-id', display_order: 2 },
      { id: 'new-featured-img-id', display_order: 1 }
    ]
  })
})
```

### Use Case 3: Delete and Re-upload Image

```typescript
// 1. Delete old image
await fetch('/delete-shop-image?id=old-img-id', {
  method: 'DELETE'
})

// 2. Upload new image
const formData = new FormData()
formData.append('shop_id', 'shop-uuid')
formData.append('images', newFile)
formData.append('display_orders', JSON.stringify([1])) // Set as featured

await fetch('/upload-shop-images', {
  method: 'POST',
  body: formData
})
```

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing or invalid token) |
| 404 | Not Found (shop or image not found) |
| 405 | Method Not Allowed |
| 500 | Internal Server Error |

---

## Notes

1. **Image Optimization**: Currently stores original images. Thumbnail/resize processing is TODO.

2. **Featured Image**: Always the image with `display_order = 1`

3. **Display Order**: Must be unique per shop and >= 1

4. **Cascade Delete**: When a shop is deleted, all related images are automatically deleted from DB (but Storage files need manual cleanup - TODO)

5. **Public URLs**: Since the bucket is public, anyone with the URL can access images

6. **File Naming**: Uses timestamp + index to ensure unique filenames

7. **Validation**: Server-side validation for file size, type, and image constraints

---

## Related Documentation

- [Shop Images Table Schema](../database/tables/shop_images.md)
- [Shops Table Schema](../database/tables/shops.md)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
