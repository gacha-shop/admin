export interface User {
  id: string;
  approval_status: "pending" | "approved" | "rejected";
  email: string;
  full_name: string;
  role: "super_admin" | "admin" | "owner";
  approved_at: string | null;
  // UUID of the admin who approved this user
  approved_by: string | null;
  rejection_reason: string | null;
}

// {
//     "id": "aa7d14a9-b474-4b32-a2c9-dc8f86629bb1",
//     "email": "kks@adenasoft.com",
//     "full_name": "rhrtlr",
//     "avatar_url": null,
//     "role": "admin",
//     "business_license": null,
//     "business_name": null,
//     "login_attempt_count": 0,
//     "last_login_ip": null,
//     "last_login_at": "2025-11-12T09:18:45.432+00:00",
//     "status": "active",
//     "created_at": "2025-11-12T07:42:16.130764+00:00",
//     "updated_at": "2025-11-12T07:42:16.130764+00:00",
//     "created_by": null,
//     "notes": null,
//     "approval_status": "approved",
//     "approved_at": "2025-11-12T07:42:40.966849+00:00",
//     "approved_by": "17e7412b-2b83-4a0f-b947-95682afe359c",
//     "rejection_reason": null
// }
