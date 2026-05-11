# MXSoft Distr API Hujjatlari

Ushbu hujjat MXSoft Distr Dashboard loyihasining barcha API endpointlarini o'z ichiga oladi.

**Base URL:** `/api/v1`

---

## Mundarija

1. [Autentifikatsiya (Authentication)](#1-autentifikatsiya-authentication)
2. [Foydalanuvchi Boshqaruvi (User Manager)](#2-foydalanuvchi-boshqaruvi-user-manager)
3. [Joylashuv (Locations)](#3-joylashuv-locations)
4. [Ilova Versiyalari (App Version)](#4-ilova-versiyalari-app-version)
5. [Ish Sessiyalari (Working Sessions)](#5-ish-sessiyalari-working-sessions)
6. [Bildirishnomalar (Notifications)](#6-bildirishnomalar-notifications)
7. [Kompaniyalar (Companies)](#7-kompaniyalar-companies)
8. [Qurilmalar (Devices)](#8-qurilmalar-devices)

---

## 1. Autentifikatsiya (Authentication)

**Prefix:** `/api/v1/authentication`

### 1.1. Ro'yxatdan o'tish

Yangi foydalanuvchini ro'yxatdan o'tkazadi.

- **URL:** `POST /api/v1/authentication/register`
- **Tavsif:** Yangi foydalanuvchi yaratadi va qaytaradi.
- **BODY:**
```json
{
  "username": "string",
  "password": "string",
  "email": "string (optional)",
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "phone_number": "string (optional)",
  "photo": "string (optional)"
}
```
- **RESPONSE (201 Created):**
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "user_type": "USER",
  "created_at": "2024-01-01T00:00:00"
}
```

---

### 1.2. Tizimga kirish (Login)

Foydalanuvchini tizimga kiradi va token qaytaradi.

- **URL:** `POST /api/v1/authentication/login`
- **Tavsif:** Foydalanuvchini autentifikatsiya qiladi va access token beradi.
- **BODY:**
```json
{
  "email": "string",
  "password": "string",
  "device_id": "string (optional)",
  "firebase_token": "string (optional)"
}
```
- **RESPONSE (200 OK):**
```json
{
  "id": 1,
  "access_token": "string",
  "expires_in": "2024-01-01T01:00:00",
  "user_id": 1,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00 (optional)"
}
```

---

### 1.3. Token yaratish

OAuth2 formatida token yaratadi.

- **URL:** `POST /api/v1/authentication/create-token`
- **Tavsif:** OAuth2PasswordRequestForm yordamida token yaratadi.
- **BODY (form-data):**
```
username: string
password: string
```
- **RESPONSE (200 OK):**
```json
{
  "access_token": "string"
}
```

---

### 1.4. Profilni olish

Joriy foydalanuvchi profilini olish.

- **URL:** `GET /api/v1/authentication/profile`
- **Tavsif:** Autentifikatsiya qilingan foydalanuvchi ma'lumotlarini qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (200 OK):**
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "phone_number": "string",
  "photo": "string",
  "user_type": "USER",
  "company_id": 1,
  "company_rel": {
    "id": 1,
    "name": "string",
    "inn": "string",
    "base_url": "string",
    "asl_belgi_token": "string"
  },
  "manager": {
    "id": 1,
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "phone_number": "string",
    "photo": "string",
    "user_type": "MANAGER",
    "company_rel": null,
    "created_at": "2024-01-01T00:00:00"
  },
  "manager_id": 1,
  "user_1c_id": 1,
  "user_1c_login": "string",
  "user_1c_password": "string",
  "created_at": "2024-01-01T00:00:00",
  "user_status": "ACTIVE"
}
```

---

### 1.5. Chiqish (Logout)

- **URL:** `GET /api/v1/authentication/logout`
- **Tavsif:** Foydalanuvchini tizimdan chiqaradi.
- **RESPONSE (200 OK):** Bo'sh javob

---

## 2. Foydalanuvchi Boshqaruvi (User Manager)

**Prefix:** `/api/v1/user-manager`

**Eslatma:** Ushbu endpointlardan foydalanish uchun ADMIN, MANAGER, SUPERADMIN yoki CEO huquqlari kerak.

### 2.1. Barcha foydalanuvchilarni olish

- **URL:** `GET /api/v1/user-manager`
- **Tavsif:** Barcha foydalanuvchilarni ro'yxatini qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `user_type` (optional): Foydalanuvchi turi bo'yicha filtrlash
- **RESPONSE (200 OK):**
```json
[
  {
    "id": 1,
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "phone_number": "string",
    "photo": "string",
    "user_type": "USER",
    "company_id": 1,
    "company_rel": null,
    "manager": null,
    "manager_id": null,
    "user_1c_id": null,
    "user_1c_login": null,
    "user_1c_password": null,
    "created_at": "2024-01-01T00:00:00",
    "user_status": "ACTIVE"
  }
]
```

---

### 2.2. Foydalanuvchini olish

- **URL:** `GET /api/v1/user-manager/{user_id}`
- **Tavsif:** Ma'lum bir foydalanuvchini ma'lumotlarini qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (200 OK):**
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "phone_number": "string",
  "photo": "string",
  "user_type": "USER",
  "company_id": 1,
  "company_rel": null,
  "manager": null,
  "manager_id": null,
  "user_1c_id": null,
  "user_1c_login": null,
  "user_1c_password": null,
  "created_at": "2024-01-01T00:00:00",
  "user_status": "ACTIVE"
}
```

---

### 2.3. Foydalanuvchi yaratish

- **URL:** `POST /api/v1/user-manager/create`
- **Tavsif:** Yangi foydalanuvchi yaratadi.
- **Headers:** `Authorization: Bearer <token>`
- **BODY:**
```json
{
  "username": "string",
  "password": "string",
  "email": "string (optional)",
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "phone_number": "string (optional)",
  "photo": "string (optional)"
}
```
- **RESPONSE (201 Created):** Foydalanuvchi ma'lumotlari (UserResponse formatida)

---

### 2.4. Foydalanuvchini yangilash

- **URL:** `PATCH /api/v1/user-manager/{user_id}`
- **Tavsif:** Foydalanuvchi ma'lumotlarini yangilaydi.
- **Headers:** `Authorization: Bearer <token>`
- **BODY:**
```json
{
  "username": "string (optional)",
  "password": "string (optional)",
  "email": "string (optional)",
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "phone_number": "string (optional)",
  "photo": "string (optional)",
  "user_type": "USER (optional)",
  "user_status": "ACTIVE (optional)",
  "company_id": 1,
  "manager_id": 1
}
```
- **RESPONSE (200 OK):** Yangilangan foydalanuvchi ma'lumotlari

---

### 2.5. Foydalanuvchini o'chirish

- **URL:** `DELETE /api/v1/user-manager/{user_id}`
- **Tavsif:** Foydalanuvchini o'chiradi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (204 No Content):** Bo'sh javob

---

## 3. Joylashuv (Locations)

**Prefix:** `/api/v1/locations`

### 3.1. Joylashuv yaratish

- **URL:** `POST /api/v1/locations/`
- **Tavsif:** Yangi joylashuv ma'lumotini yaratadi.
- **Headers:** `Authorization: Bearer <token>`
- **BODY:**
```json
{
  "latitude": 41.31151,
  "longitude": 69.24958,
  "device_name": "string (optional)",
  "is_active": true,
  "user_id": 1
}
```
- **RESPONSE (201 Created):**
```json
{
  "id": 1,
  "latitude": 41.31151,
  "longitude": 69.24958,
  "device_name": "string",
  "is_active": true,
  "user_id": 1,
  "created_at": "2024-01-01T00:00:00"
}
```

---

### 3.2. Barcha joylashuvlarni olish

- **URL:** `GET /api/v1/locations/`
- **Tavsif:** Barcha joylashuvlarni ro'yxatini qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `is_active` (optional): Faol/No faol joylashuvlar
  - `user_id` (optional): Foydalanuvchi bo'yicha filtrlash
- **RESPONSE (200 OK):** Joylashuvlar ro'yxati

---

### 3.3. Joylashuvni olish

- **URL:** `GET /api/v1/locations/{location_id}`
- **Tavsif:** Ma'lum bir joylashuvni qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (200 OK):** Joylashuv ma'lumotlari

---

### 3.4. Joylashuvni yangilash

- **URL:** `PUT /api/v1/locations/{location_id}`
- **Tavsif:** Joylashuv ma'lumotlarini yangilaydi.
- **Headers:** `Authorization: Bearer <token>`
- **BODY:**
```json
{
  "latitude": 41.31151,
  "longitude": 69.24958,
  "device_name": "string",
  "is_active": true,
  "user_id": 1
}
```
- **RESPONSE (200 OK):** Yangilangan joylashuv

---

### 3.5. Joylashuvni o'chirish

- **URL:** `DELETE /api/v1/locations/{location_id}`
- **Tavsif:** Joylashuvni o'chiradi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (204 No Content):** Bo'sh javob

---

### 3.6. Foydalanuvchi joylashuv tarixi

- **URL:** `GET /api/v1/locations/user-history/{user_id}`
- **Tavsif:** Foydalanuvchining bugungi kunlik joylashuv tarixini qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (200 OK):** Joylashuvlar ro'yxati (bugungi kun uchun)

---

### 3.7. WebSocket joylashuv

- **URL:** `WS /api/v1/locations/ws/admvs`
- **Tavsif:** Real vaqt rejimida joylashuvni yangilash uchun WebSocket ulanish.
- **Query Parameters:**
  - `token`: Autentifikatsiya tokeni
- **Client → Server:**
```json
{
  "action": "update_location",
  "latitude": 41.31151,
  "longitude": 69.24958,
  "device_name": "string"
}
```
- **Server → Client (ping):**
```json
{
  "action": "ping"
}
```

---

## 4. Ilova Versiyalari (App Version)

**Prefix:** `/api/v1/apps`

### 4.1. Ilova yaratish

- **URL:** `POST /api/v1/apps/`
- **Tavsif:** Yangi ilova yaratadi (faqat SUPERADMIN yoki ADMIN).
- **Headers:** `Authorization: Bearer <token>`
- **BODY:**
```json
{
  "name": "string",
  "tag": "string"
}
```
- **RESPONSE (201 Created):**
```json
{
  "id": 1,
  "name": "string",
  "tag": "string",
  "created_at": "2024-01-01T00:00:00"
}
```

---

### 4.2. Barcha ilovalarni olish

- **URL:** `GET /api/v1/apps/`
- **Tavsif:** Barcha ilovalarni ro'yxatini qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (200 OK):**
```json
[
  {
    "id": 1,
    "name": "string",
    "tag": "string",
    "created_at": "2024-01-01T00:00:00"
  }
]
```

---

### 4.3. Ilovani olish

- **URL:** `GET /api/v1/apps/{app_id}`
- **Tavsif:** Ma'lum bir ilovani qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (200 OK):** Ilova ma'lumotlari

---

### 4.4. Ilovani yangilash

- **URL:** `PUT /api/v1/apps/{app_id}`
- **Tavsif:** Ilova ma'lumotlarini yangilaydi (faqat SUPERADMIN yoki ADMIN).
- **Headers:** `Authorization: Bearer <token>`
- **BODY:**
```json
{
  "name": "string (optional)"
}
```
- **RESPONSE (200 OK):** Yangilangan ilova

---

### 4.5. Ilovani o'chirish

- **URL:** `DELETE /api/v1/apps/{app_id}`
- **Tavsif:** Ilovani o'chiradi (faqat SUPERADMIN).
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (204 No Content):** Bo'sh javob

---

### 4.6. Versiya yaratish

- **URL:** `POST /api/v1/apps/{app_id}/versions`
- **Tavsif:** Ilova uchun yangi versiya yaratadi (faqat SUPERADMIN yoki ADMIN).
- **Headers:** `Authorization: Bearer <token>`
- **BODY:**
```json
{
  "version": "1.0.0",
  "build_number": 1,
  "force_update": false,
  "update_url": "string (optional)",
  "message": "string (optional)",
  "title": "string (optional)",
  "app_id": 1
}
```
- **RESPONSE (201 Created):**
```json
{
  "id": 1,
  "version": "1.0.0",
  "build_number": 1,
  "force_update": false,
  "update_url": "string",
  "message": "string",
  "title": "string",
  "app_id": 1,
  "created_at": "2024-01-01T00:00:00"
}
```

---

### 4.7. Barcha versiyalarni olish

- **URL:** `GET /api/v1/apps/{app_id}/versions`
- **Tavsif:** Ilova uchun barcha versiyalarni qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (200 OK):** Versiyalar ro'yxati

---

### 4.8. Versiyani olish

- **URL:** `GET /api/v1/apps/versions/{version_id}`
- **Tavsif:** Ma'lum bir versiyani qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (200 OK):** Versiya ma'lumotlari

---

### 4.9. Versiyani yangilash

- **URL:** `PUT /api/v1/apps/versions/{version_id}`
- **Tavsif:** Versiya ma'lumotlarini yangilaydi (faqat SUPERADMIN yoki ADMIN).
- **Headers:** `Authorization: Bearer <token>`
- **BODY:**
```json
{
  "version": "string (optional)",
  "build_number": 1,
  "force_update": false,
  "update_url": "string (optional)",
  "message": "string (optional)",
  "title": "string (optional)"
}
```
- **RESPONSE (200 OK):** Yangilangan versiya

---

### 4.10. Versiyani o'chirish

- **URL:** `DELETE /api/v1/apps/versions/{version_id}`
- **Tavsif:** Versiyani o'chiradi (faqat SUPERADMIN).
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (204 No Content):** Bo'sh javob

---

### 4.11. Oxirgi versiyani olish

- **URL:** `GET /api/v1/apps/latest-version?app_type=string`
- **Tavsif:** Ilova turi bo'yicha eng so'nggi versiyani qaytaradi.
- **Query Parameters:**
  - `app_type`: Ilova turi (masalan: "agent", "deliverer")
- **RESPONSE (200 OK):** Versiya ma'lumotlari

---

### 4.12. APK faylini yuklash

- **URL:** `POST /api/v1/apps/upload-apk`
- **Tavsif:** APK, IPA yoki EXE faylini yuklaydi.
- **BODY (multipart/form-data):**
  - `file`: Yuklanadigan fayl (.apk, .ipa, .exe)
- **RESPONSE (200 OK):**
```json
{
  "filename": "app.apk",
  "url": "/static/uploads/apps/app.apk",
  "size": 1024000
}
```

---

## 5. Ish Sessiyalari (Working Sessions)

**Prefix:** `/api/v1/working-sessions`

### 5.1. Ish sessiyasini yaratish

- **URL:** `POST /api/v1/working-sessions/create`
- **Tavsif:** Yangi ish sessiyasini yaratadi.
- **Headers:** `Authorization: Bearer <token>`
- **BODY:**
```json
{
  "session": "2024-01-01T09:00:00",
  "device_name": "string",
  "app": "string",
  "is_testing": false
}
```
- **RESPONSE (201 Created):**
```json
{
  "id": 1,
  "session": "2024-01-01T09:00:00",
  "device_name": "string",
  "app": "string",
  "is_testing": false,
  "created_at": "2024-01-01T00:00:00"
}
```

---

### 5.2. Barcha ish sessiyalarini olish

- **URL:** `GET /api/v1/working-sessions`
- **Tavsif:** Barcha ish sessiyalarini qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (200 OK):** Ish sessiyalari ro'yxati

---

### 5.3. Ish sessiyasini olish

- **URL:** `GET /api/v1/working-sessions/{session_id}`
- **Tavsif:** Ma'lum bir ish sessiyasini qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (200 OK):** Ish sessiyasi ma'lumotlari

---

### 5.4. Foydalanuvchi ish sessiyalari

- **URL:** `GET /api/v1/working-sessions/user/{user_id}`
- **Tavsif:** Foydalanuvchining barcha ish sessiyalarini qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `app` (optional): Ilova bo'yicha filtrlash
  - `is_testing` (optional): Test sessiyalari bo'yicha filtrlash
- **RESPONSE (200 OK):** Ish sessiyalari ro'yxati

---

### 5.5. Ish sessiyasini o'chirish

- **URL:** `DELETE /api/v1/working-sessions/{session_id}`
- **Tavsif:** Ish sessiyasini o'chiradi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (204 No Content):** Bo'sh javob

---

## 6. Bildirishnomalar (Notifications)

**Prefix:** `/api/v1/notifications`

### 6.1. Bildirishnoma yaratish

- **URL:** `POST /api/v1/notifications/create`
- **Tavsif:** Yangi bildirishnoma yaratadi va Firebase orqali yuboradi.
- **BODY:**
```json
{
  "title": "string",
  "message": "string (optional)",
  "date": "DD.MM.YYYY (optional)",
  "author": "string (optional)",
  "user_type": "string (optional)",
  "user_1c_id": 1,
  "company_id": 1,
  "security_key": "string (optional)"
}
```
- **RESPONSE (201 Created):**
```json
{
  "id": 1,
  "company_id": 1,
  "user_1c_id": 1,
  "created_at": "2024-01-01T00:00:00",
  "title": "string",
  "message": "string",
  "status": null,
  "author": "string"
}
```

---

### 6.2. Barcha bildirishnomalarni olish

- **URL:** `GET /api/v1/notifications`
- **Tavsif:** Barcha bildirishnomalarni qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `company_id` (optional): Kompaniya bo'yicha filtrlash
  - `user_1c_id` (optional): 1C foydalanuvchi ID bo'yicha filtrlash
- **RESPONSE (200 OK):**
```json
[
  {
    "id": 1,
    "company_id": 1,
    "user_1c_id": 1,
    "created_at": "2024-01-01T00:00:00",
    "title": "string",
    "message": "string",
    "status": {
      "id": 1,
      "is_read": false,
      "read_at": null
    },
    "author": "string"
  }
]
```

---

### 6.3. Foydalanuvchi bildirishnomalari

- **URL:** `GET /api/v1/notifications/user`
- **Tavsif:** Joriy foydalanuvchining bildirishnomalarini qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (200 OK):** Bildirishnomalar ro'yxati

---

### 6.4. Bildirishnomani olish

- **URL:** `GET /api/v1/notifications/{notification_id}`
- **Tavsif:** Ma'lum bir bildirishnomani qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (200 OK):** Bildirishnoma ma'lumotlari

---

### 6.5. Bildirishnomani o'chirish

- **URL:** `DELETE /api/v1/notifications/{notification_id}`
- **Tavsif:** Bildirishnomani o'chiradi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (204 No Content):** Bo'sh javob

---

### 6.6. Kompaniya bildirishnomalari

- **URL:** `GET /api/v1/notifications/company/{company_id}`
- **Tavsif:** Kompaniyaning barcha bildirishnomalarini qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (200 OK):** Bildirishnomalar ro'yxati

---

### 6.7. Bildirishnomani o'qilgan deb belgilash

- **URL:** `POST /api/v1/notifications/{notification_id}/read`
- **Tavsif:** Bildirishnomani o'qilgan deb belgilaydi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (200 OK):**
```json
{
  "id": 1,
  "is_read": true,
  "read_at": "2024-01-01T00:00:00",
  "notification_id": 1,
  "user_id": 1,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

---

### 6.8. O'qilmagan bildirishnomalar soni

- **URL:** `GET /api/v1/notifications/unread-count`
- **Tavsif:** Joriy foydalanuvchining o'qilmagan bildirishnomalari sonini qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (200 OK):**
```json
{
  "unread_count": 5
}
```

---

### 6.9. Ko'plab bildirishnomalarni o'qilgan deb belgilash

- **URL:** `POST /api/v1/notifications/read-multiple`
- **Tavsif:** Bir nechta bildirishnomalarni o'qilgan deb belgilaydi.
- **Headers:** `Authorization: Bearer <token>`
- **BODY:**
```json
[1, 2, 3, 4, 5]
```
- **RESPONSE (200 OK):**
```json
{
  "message": "Marked 5 as read"
}
```

---

## 7. Kompaniyalar (Companies)

**Prefix:** `/api/v1/companies`

### 7.1. Kompaniya yaratish

- **URL:** `POST /api/v1/companies/`
- **Tavsif:** Yangi kompaniya yaratadi (faqat SUPERADMIN yoki ADMIN).
- **Headers:** `Authorization: Bearer <token>`
- **BODY:**
```json
{
  "name": "string",
  "inn": "string (optional)",
  "base_url": "string (optional)",
  "asl_belgi_token": "string (optional)"
}
```
- **RESPONSE (201 Created):**
```json
{
  "id": 1,
  "name": "string",
  "inn": "string",
  "base_url": "string",
  "asl_belgi_token": "string"
}
```

---

### 7.2. Barcha kompaniyalarni olish

- **URL:** `GET /api/v1/companies/`
- **Tavsif:** Barcha kompaniyalarni qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `skip` (optional): 0 (default)
  - `limit` (optional): 100 (default)
- **RESPONSE (200 OK):** Kompaniyalar ro'yxati

---

### 7.3. Kompaniyani olish

- **URL:** `GET /api/v1/companies/{company_id}`
- **Tavsif:** Ma'lum bir kompaniyani qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (200 OK):** Kompaniya ma'lumotlari

---

### 7.4. Kompaniyani yangilash

- **URL:** `PUT /api/v1/companies/{company_id}`
- **Tavsif:** Kompaniya ma'lumotlarini yangilaydi (faqat SUPERADMIN yoki ADMIN).
- **Headers:** `Authorization: Bearer <token>`
- **BODY:**
```json
{
  "name": "string (optional)",
  "inn": "string (optional)",
  "base_url": "string (optional)",
  "asl_belgi_token": "string (optional)"
}
```
- **RESPONSE (200 OK):** Yangilangan kompaniya

---

### 7.5. Kompaniyani o'chirish

- **URL:** `DELETE /api/v1/companies/{company_id}`
- **Tavsif:** Kompaniyani o'chiradi (faqat SUPERADMIN).
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (204 No Content):** Bo'sh javob

---

### 7.6. Xavfsizlik kalitini yaratish

- **URL:** `POST /api/v1/companies/{company_id}/security-keys`
- **Tavsif:** Kompaniya uchun yangi xavfsizlik kalitini yaratadi (faqat SUPERADMIN yoki ADMIN).
- **Headers:** `Authorization: Bearer <token>`
- **BODY:**
```json
{
  "key": "string",
  "company_id": 1
}
```
- **RESPONSE (201 Created):**
```json
{
  "id": 1,
  "key": "string",
  "company_id": 1
}
```

---

### 7.7. Kompaniya xavfsizlik kalitlarini olish

- **URL:** `GET /api/v1/companies/{company_id}/security-keys`
- **Tavsif:** Kompaniyaning barcha xavfsizlik kalitlarini qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (200 OK):** Xavfsizlik kalitlari ro'yxati

---

### 7.8. Xavfsizlik kalitini olish

- **URL:** `GET /api/v1/companies/security-keys/{key_id}`
- **Tavsif:** Ma'lum bir xavfsizlik kalitini qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (200 OK):** Xavfsizlik kaliti ma'lumotlari

---

### 7.9. Xavfsizlik kalitini yangilash

- **URL:** `PUT /api/v1/companies/security-keys/{key_id}`
- **Tavsif:** Xavfsizlik kalitini yangilaydi (faqat SUPERADMIN yoki ADMIN).
- **Headers:** `Authorization: Bearer <token>`
- **BODY:**
```json
{
  "key": "string (optional)"
}
```
- **RESPONSE (200 OK):** Yangilangan xavfsizlik kaliti

---

### 7.10. Xavfsizlik kalitini o'chirish

- **URL:** `DELETE /api/v1/companies/security-keys/{key_id}`
- **Tavsif:** Xavfsizlik kalitini o'chiradi (faqat SUPERADMIN).
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (204 No Content):** Bo'sh javob

---

## 8. Qurilmalar (Devices)

**Prefix:** `/api/v1/devices`

### 8.1. Qurilma yaratish

- **URL:** `POST /api/v1/devices/`
- **Tavsif:** Yangi qurilma yaratadi (faqat SUPERADMIN, ADMIN yoki MANAGER).
- **Headers:** `Authorization: Bearer <token>`
- **BODY:**
```json
{
  "name": "string",
  "device_uuid": "string",
  "platform": "string (optional)",
  "model": "string (optional)",
  "os_version": "string (optional)",
  "app_version": "string (optional)",
  "is_active": true,
  "last_seen": "2024-01-01T00:00:00 (optional)",
  "user_id": 1
}
```
- **RESPONSE (201 Created):**
```json
{
  "id": 1,
  "name": "string",
  "device_uuid": "string",
  "platform": "string",
  "model": "string",
  "os_version": "string",
  "app_version": "string",
  "is_active": true,
  "last_seen": "2024-01-01T00:00:00",
  "user_id": 1,
  "created_at": "2024-01-01T00:00:00"
}
```

---

### 8.2. Barcha qurilmalarni olish

- **URL:** `GET /api/v1/devices/`
- **Tavsif:** Barcha qurilmalarni qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `is_active` (optional): Faol/No faol qurilmalar
  - `user_id` (optional): Foydalanuvchi bo'yicha filtrlash
  - `skip` (optional): 0 (default)
  - `limit` (optional): 100 (default)
- **RESPONSE (200 OK):** Qurilmalar ro'yxati

---

### 8.3. Qurilmani olish

- **URL:** `GET /api/v1/devices/{device_id}`
- **Tavsif:** Ma'lum bir qurilmani qaytaradi.
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (200 OK):** Qurilma ma'lumotlari

---

### 8.4. Qurilmani yangilash

- **URL:** `PUT /api/v1/devices/{device_id}`
- **Tavsif:** Qurilma ma'lumotlarini yangilaydi (faqat SUPERADMIN, ADMIN yoki MANAGER).
- **Headers:** `Authorization: Bearer <token>`
- **BODY:**
```json
{
  "name": "string (optional)",
  "device_uuid": "string (optional)",
  "platform": "string (optional)",
  "model": "string (optional)",
  "os_version": "string (optional)",
  "app_version": "string (optional)",
  "is_active": true,
  "last_seen": "2024-01-01T00:00:00 (optional)",
  "user_id": 1
}
```
- **RESPONSE (200 OK):** Yangilangan qurilma

---

### 8.5. Qurilmani o'chirish

- **URL:** `DELETE /api/v1/devices/{device_id}`
- **Tavsif:** Qurilmani o'chiradi (faqat SUPERADMIN).
- **Headers:** `Authorization: Bearer <token>`
- **RESPONSE (204 No Content):** Bo'sh javob

---

## Foydalanuvchi Turlari (UserType)

- `SUPERADMIN` - Tizim administratori
- `ADMIN` - Kompaniya administratori
- `CEO` - Bosh direktor
- `MANAGER` - Menejer
- `USER` - Oddiy foydalanuvchi
- `AGENT` - Agent
- `DELIVERER` - Yetkazib beruvchi

## Foydalanuvchi Holatlari (UserStatus)

- `ACTIVE` - Faol
- `BLOCKED` - Bloklangan

---

*Hujjat oxiri*