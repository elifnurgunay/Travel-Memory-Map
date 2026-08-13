# 🗺️ Travel Memory Map — API Dokümantasyonu

> **Base URL:** `http://localhost:8080`  
> **Kimlik Doğrulama:** JWT (Bearer Token)  
> **İçerik Tipi:** `application/json` (aksi belirtilmedikçe)

---

## 📑 İçindekiler

1. [Kimlik Doğrulama (Auth)](#1-kimlik-doğrulama-auth)
2. [Seyahatler (Trips)](#2-seyahatler-trips)
3. [Fotoğraflar (Photos)](#3-fotoğraflar-photos)
4. [Yorumlar (Comments)](#4-yorumlar-comments)
5. [Kullanıcılar (Users)](#5-kullanıcılar-users)
6. [Veri Modelleri](#6-veri-modelleri)
7. [Güvenlik & Yetkilendirme](#7-güvenlik--yetkilendirme)
8. [Hata Kodları](#8-hata-kodları)

---

## 1. Kimlik Doğrulama (Auth)

> Prefix: `/api/auth` — Bu gruptaki tüm endpoint'ler **herkese açıktır** (token gerektirmez).

### 1.1 Kayıt Ol

Yeni kullanıcı hesabı oluşturur ve otomatik olarak JWT token döner.

| | |
|---|---|
| **URL** | `POST /api/auth/register` |
| **Auth** | Gerekli değil |

**Request Body:**

```json
{
  "username": "ahmet",
  "email": "ahmet@example.com",
  "password": "Sifre123"
}
```

**Başarılı Yanıt — `200 OK`**

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhaG1ldCIs...
```

> Yanıt gövdesi doğrudan JWT token string'idir (JSON objesi değil).

**Hata Yanıtları:**

| Durum | Mesaj |
|---|---|
| `400` | `Bu kullanıcı adı zaten alınmış!` |
| `400` | `Bu e-posta adresi zaten kullanımda!` |
| `400` | Validation hataları (boş alan, geçersiz e-posta) |

---

### 1.2 Giriş Yap

Mevcut kullanıcı kimlik bilgileriyle oturum açar.

| | |
|---|---|
| **URL** | `POST /api/auth/login` |
| **Auth** | Gerekli değil |

**Request Body:**

```json
{
  "username": "ahmet",
  "password": "Sifre123"
}
```

**Başarılı Yanıt — `200 OK`**

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhaG1ldCIs...
```

**Hata Yanıtları:**

| Durum | Açıklama |
|---|---|
| `401` | Geçersiz kullanıcı adı veya şifre |

---

### 1.3 Şifremi Unuttum

Şifre sıfırlama token'ı oluşturur. Güvenlik amacıyla e-posta bulunsa da bulunmasa da aynı yanıtı döner (Email Enumeration koruması).

| | |
|---|---|
| **URL** | `POST /api/auth/forgot-password` |
| **Auth** | Gerekli değil |

**Request Body:**

```json
{
  "email": "ahmet@example.com"
}
```

**Yanıt — `200 OK` (her durumda)**

```json
{
  "message": "E-posta adresi kayıtlıysa şifre sıfırlama bağlantısı gönderilmiştir."
}
```

> ⚠️ Dev ortamda sıfırlama bağlantısı sunucu konsoluna yazdırılır. Prodüksiyon ortamında SMTP yapılandırması gereklidir.

---

### 1.4 Şifre Sıfırla

Sıfırlama token'ı ile yeni şifre belirler.

| | |
|---|---|
| **URL** | `POST /api/auth/reset-password` |
| **Auth** | Gerekli değil |

**Request Body:**

```json
{
  "token": "a1b2c3d4e5f6...",
  "newPassword": "YeniSifre456"
}
```

**Başarılı Yanıt — `200 OK`**

```json
{
  "message": "Şifreniz başarıyla değiştirildi. Giriş yapabilirsiniz."
}
```

**Hata Yanıtları:**

| Durum | Mesaj |
|---|---|
| `400` | `Token ve yeni şifre alanı zorunludur.` |
| `400` | `Geçersiz veya süresi dolmuş sıfırlama bağlantısı.` |

> Token tek kullanımlıktır ve 15 dakika geçerlidir. SHA-256 ile hash'lenerek saklanır.

---

## 2. Seyahatler (Trips)

> Prefix: `/api/trips`

### 2.1 Tüm Herkese Açık Seyahatleri Listele

| | |
|---|---|
| **URL** | `GET /api/trips` |
| **Auth** | 🔒 Token gerekli |

**Başarılı Yanıt — `200 OK`**

```json
[
  {
    "id": 1,
    "user": { "id": 1, "username": "ahmet", "email": "ahmet@example.com" },
    "city": "Paris",
    "placeName": "Eyfel Kulesi",
    "country": "Fransa",
    "latitude": 48.85840000,
    "longitude": 2.29450000,
    "visitDate": "2025-06-15",
    "note": "Harika bir deneyimdi!",
    "rating": 5,
    "isPublic": true,
    "comments": [],
    "photos": [
      { "id": 1, "photoUrl": "/uploads/abc-123.jpg", "uploadedAt": "2025-06-16T10:30:00" }
    ],
    "createdAt": "2025-06-16T10:00:00",
    "updatedAt": "2025-06-16T10:00:00"
  }
]
```

---

### 2.2 Kendi Seyahatlerimi Listele

| | |
|---|---|
| **URL** | `GET /api/trips/my` |
| **Auth** | 🔒 Token gerekli |

**Başarılı Yanıt** — `200 OK` — Giriş yapan kullanıcının tüm seyahatleri (public + private)

**Hata:** `401 Unauthorized` — Token yoksa veya geçersizse

---

### 2.3 Tek Seyahat Detayı

| | |
|---|---|
| **URL** | `GET /api/trips/{id}` |
| **Auth** | 🔒 Token gerekli |

**Path Parametreleri:**

| Parametre | Tip | Açıklama |
|---|---|---|
| `id` | Long | Seyahat ID'si |

**Başarılı Yanıt** — `200 OK` — Trip nesnesi (yukarıdaki formatta)

**Hata:** `500` — Seyahat bulunamazsa

---

### 2.4 Yeni Seyahat Oluştur

| | |
|---|---|
| **URL** | `POST /api/trips` |
| **Auth** | 🔒 Token gerekli |

**Request Body:**

```json
{
  "city": "Tokyo",
  "placeName": "Shibuya Kavşağı",
  "country": "Japonya",
  "latitude": 35.65950000,
  "longitude": 139.70040000,
  "visitDate": "2025-03-20",
  "note": "Dünyanın en kalabalık kavşağı!",
  "rating": 4,
  "isPublic": true
}
```

**Zorunlu Alanlar:** `city`, `country`, `latitude`, `longitude`, `visitDate`

**Başarılı Yanıt** — `201 Created` — Oluşturulan Trip nesnesi

**Validation Kuralları:**

| Alan | Kural |
|---|---|
| `city` | Boş olamaz, maks 100 karakter |
| `country` | Boş olamaz, maks 100 karakter |
| `latitude` | Zorunlu |
| `longitude` | Zorunlu |
| `visitDate` | Zorunlu |
| `placeName` | Opsiyonel, maks 150 karakter |
| `rating` | 1–5 arası (opsiyonel) |
| `isPublic` | Opsiyonel, varsayılan `true` |

---

### 2.5 Seyahat Güncelle

| | |
|---|---|
| **URL** | `PUT /api/trips/{id}` |
| **Auth** | 🔒 Token gerekli (sadece seyahat sahibi) |

**Request Body:** Seyahat oluşturma ile aynı format

**Başarılı Yanıt** — `200 OK` — Güncellenmiş Trip nesnesi

**Hata Yanıtları:**

| Durum | Açıklama |
|---|---|
| `401` | Token yok |
| `403` | Seyahat sahibi değilsiniz |
| `404` | Seyahat bulunamadı |

---

### 2.6 Seyahat Sil

| | |
|---|---|
| **URL** | `DELETE /api/trips/{id}` |
| **Auth** | 🔒 Token gerekli (sadece seyahat sahibi) |

**Başarılı Yanıt** — `204 No Content`

**Hata Yanıtları:**

| Durum | Açıklama |
|---|---|
| `401` | Token yok |
| `403` | Seyahat sahibi değilsiniz |
| `404` | Seyahat bulunamadı |

> ⚠️ Seyahat silindiğinde ilişkili tüm fotoğraflar ve yorumlar da silinir (`CascadeType.ALL` + `orphanRemoval`).

---

## 3. Fotoğraflar (Photos)

### 3.1 Fotoğraf Yükle

| | |
|---|---|
| **URL** | `POST /api/trips/{tripId}/photos` |
| **Auth** | 🔒 Token gerekli (sadece seyahat sahibi) |
| **Content-Type** | `multipart/form-data` |

**Path Parametreleri:**

| Parametre | Tip | Açıklama |
|---|---|---|
| `tripId` | Long | Seyahat ID'si |

**Form Data:**

| Alan | Tip | Açıklama |
|---|---|---|
| `file` | File | Yüklenecek fotoğraf dosyası |

**cURL Örneği:**

```bash
curl -X POST http://localhost:8080/api/trips/1/photos \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@/path/to/photo.jpg"
```

**Başarılı Yanıt — `200 OK`**

```json
{
  "id": 5,
  "photoUrl": "/uploads/550e8400-e29b-41d4-a716-446655440000.jpg",
  "uploadedAt": "2025-06-16T12:00:00"
}
```

**Hata Yanıtları:**

| Durum | Açıklama |
|---|---|
| `500` | Seyahat bulunamadı / Yetki yok / Dosya boş |

---

### 3.2 Fotoğraf Sil

| | |
|---|---|
| **URL** | `DELETE /api/photos/{id}` |
| **Auth** | 🔒 Token gerekli (sadece seyahat sahibi) |

**Başarılı Yanıt — `200 OK`**

```
Fotoğraf başarıyla silindi.
```

> Fotoğraf silindiğinde hem veritabanı kaydı hem de fiziksel dosya (`uploads/` klasöründen) kaldırılır.

---

## 4. Yorumlar (Comments)

### 4.1 Yorum Ekle

| | |
|---|---|
| **URL** | `POST /api/trips/{tripId}/comments` |
| **Auth** | 🔒 Token gerekli |

**Request Body:**

```json
{
  "content": "Harika bir yer, ben de gitmek istiyorum!"
}
```

**Başarılı Yanıt — `200 OK`**

```json
{
  "id": 3,
  "content": "Harika bir yer, ben de gitmek istiyorum!",
  "createdAt": "2025-06-17T14:30:00",
  "user": { "id": 2, "username": "mehmet", "email": "mehmet@example.com" }
}
```

---

### 4.2 Yorum Sil

| | |
|---|---|
| **URL** | `DELETE /api/comments/{id}` |
| **Auth** | 🔒 Token gerekli (sadece yorum sahibi) |

**Başarılı Yanıt — `200 OK`**

```
Yorum başarıyla silindi.
```

---

## 5. Kullanıcılar (Users)

### 5.1 Mevcut Kullanıcı Bilgisi

| | |
|---|---|
| **URL** | `GET /api/users/me` |
| **Auth** | 🔒 Token gerekli |

**Başarılı Yanıt — `200 OK`**

```json
{
  "username": "ahmet",
  "email": "ahmet@example.com"
}
```

---

### 5.2 Kullanıcı Oluştur

| | |
|---|---|
| **URL** | `POST /api/users` |
| **Auth** | 🔒 Token gerekli |

**Request Body:**

```json
{
  "username": "yeni_kullanici",
  "email": "yeni@example.com",
  "password": "Sifre123"
}
```

**Başarılı Yanıt** — `201 Created` — User nesnesi (password hariç)

---

### 5.3 Tüm Kullanıcıları Listele

| | |
|---|---|
| **URL** | `GET /api/users` |
| **Auth** | 🔒 Token gerekli |

**Başarılı Yanıt** — `200 OK` — User listesi (password alanları gizli)

---

## 6. Veri Modelleri

### User

| Alan | Tip | Açıklama |
|---|---|---|
| `id` | Long | Otomatik üretilir |
| `username` | String | Benzersiz, zorunlu |
| `email` | String | Benzersiz, zorunlu, @Email formatında |
| `password` | String | Zorunlu, WRITE_ONLY (yanıtta görünmez) |
| `profilePhoto` | String | Opsiyonel |
| `createdAt` | LocalDateTime | Otomatik oluşturulur |

> `password` alanı BCrypt ile hash'lenir ve JSON yanıtlarında **asla** görünmez.

### Trip

| Alan | Tip | Açıklama |
|---|---|---|
| `id` | Long | Otomatik üretilir |
| `user` | User (nested) | Seyahat sahibi |
| `city` | String (maks 100) | Zorunlu |
| `placeName` | String (maks 150) | Opsiyonel |
| `country` | String (maks 100) | Zorunlu |
| `latitude` | BigDecimal (10,8) | Zorunlu |
| `longitude` | BigDecimal (11,8) | Zorunlu |
| `visitDate` | LocalDate | Zorunlu |
| `note` | String (TEXT) | Opsiyonel |
| `rating` | Integer (1-5) | Opsiyonel |
| `isPublic` | Boolean | Varsayılan: `true` |
| `comments` | List\<Comment\> | İlişkili yorumlar |
| `photos` | List\<Photo\> | İlişkili fotoğraflar |
| `createdAt` | LocalDateTime | Otomatik oluşturulur |
| `updatedAt` | LocalDateTime | Her güncellemede otomatik değişir |

### Photo

| Alan | Tip | Açıklama |
|---|---|---|
| `id` | Long | Otomatik üretilir |
| `photoUrl` | String | Dosya yolu (`/uploads/...`) |
| `uploadedAt` | LocalDateTime | Otomatik oluşturulur |
| `trip` | Trip | JSON'da gizli (`@JsonIgnore`) |

### Comment

| Alan | Tip | Açıklama |
|---|---|---|
| `id` | Long | Otomatik üretilir |
| `content` | String (maks 500) | Zorunlu |
| `createdAt` | LocalDateTime | Otomatik oluşturulur |
| `trip` | Trip | JSON'da gizli (`@JsonIgnore`) |
| `user` | User (nested) | Yorum sahibi (id, username, email) |

### PasswordResetToken (Dahili)

| Alan | Tip | Açıklama |
|---|---|---|
| `id` | Long | Otomatik üretilir |
| `tokenHash` | String | SHA-256 hash'lenmiş token |
| `user` | User | İlgili kullanıcı |
| `expiryDate` | LocalDateTime | Son geçerlilik tarihi (15 dk) |
| `used` | boolean | Token kullanılmış mı? |

---

## 7. Güvenlik & Yetkilendirme

### JWT Token Kullanımı

Korumalı endpoint'lere erişmek için `Authorization` header'ı gereklidir:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Token özellikleri:**
- **Algoritma:** HMAC-SHA256
- **Geçerlilik süresi:** 24 saat
- **Payload:** Kullanıcı adı (`sub` claim)
- **Session:** Stateless (sunucu tarafında session tutulmaz)

### Herkese Açık (Public) Endpoint'ler

Aşağıdaki endpoint'ler token **gerektirmez:**

| Endpoint | Açıklama |
|---|---|
| `POST /api/auth/register` | Kayıt |
| `POST /api/auth/login` | Giriş |
| `POST /api/auth/forgot-password` | Şifre sıfırlama talebi |
| `POST /api/auth/reset-password` | Şifre sıfırlama |
| `GET /uploads/**` | Statik dosyalar (fotoğraflar) |
| `GET /error` | Hata sayfası |

Diğer tüm endpoint'ler geçerli JWT token gerektirir.

### Sahiplik Kontrolleri (IDOR Koruması)

| İşlem | Yetki |
|---|---|
| Seyahat güncelleme / silme | Sadece seyahat sahibi |
| Fotoğraf ekleme / silme | Sadece seyahat sahibi |
| Yorum silme | Sadece yorum sahibi |

### Şifre Güvenliği

- Şifreler **BCrypt** ile hash'lenerek saklanır
- Şifre sıfırlama token'ları **SHA-256** ile hash'lenir
- Sıfırlama token'ları **tek kullanımlık** ve **15 dakika** geçerlidir
- Email enumeration saldırılarına karşı koruma uygulanır

### CORS Yapılandırması

| Ayar | Değer |
|---|---|
| İzin verilen origin | `http://localhost:5173` |
| İzin verilen metotlar | `GET, POST, PUT, DELETE, OPTIONS` |
| İzin verilen header'lar | `*` (tümü) |
| Credentials | Etkin |

---

## 8. Hata Kodları

| HTTP Kodu | Anlamı | Açıklama |
|---|---|---|
| `200` | OK | İşlem başarılı |
| `201` | Created | Yeni kaynak oluşturuldu |
| `204` | No Content | Silme işlemi başarılı |
| `400` | Bad Request | Geçersiz girdi / validation hatası |
| `401` | Unauthorized | Token yok veya geçersiz |
| `403` | Forbidden | Yetkisiz erişim (sahiplik ihlali) |
| `404` | Not Found | Kaynak bulunamadı |
| `500` | Internal Server Error | Sunucu hatası |

---

## Endpoint Özet Tablosu

| Metot | Endpoint | Auth | Açıklama |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Kayıt ol |
| `POST` | `/api/auth/login` | ❌ | Giriş yap |
| `POST` | `/api/auth/forgot-password` | ❌ | Şifre sıfırlama talebi |
| `POST` | `/api/auth/reset-password` | ❌ | Şifre sıfırla |
| `GET` | `/api/trips` | ✅ | Herkese açık seyahatleri listele |
| `GET` | `/api/trips/my` | ✅ | Kendi seyahatlerimi listele |
| `GET` | `/api/trips/{id}` | ✅ | Seyahat detayı |
| `POST` | `/api/trips` | ✅ | Yeni seyahat oluştur |
| `PUT` | `/api/trips/{id}` | ✅👤 | Seyahat güncelle |
| `DELETE` | `/api/trips/{id}` | ✅👤 | Seyahat sil |
| `POST` | `/api/trips/{tripId}/photos` | ✅👤 | Fotoğraf yükle |
| `DELETE` | `/api/photos/{id}` | ✅👤 | Fotoğraf sil |
| `POST` | `/api/trips/{tripId}/comments` | ✅ | Yorum ekle |
| `DELETE` | `/api/comments/{id}` | ✅👤 | Yorum sil |
| `GET` | `/api/users/me` | ✅ | Kullanıcı bilgisi |
| `POST` | `/api/users` | ✅ | Kullanıcı oluştur |
| `GET` | `/api/users` | ✅ | Tüm kullanıcılar |

> ✅ = Token gerekli · 👤 = Sahiplik kontrolü uygulanır · ❌ = Herkese açık

---

## 9. API Test Sonuçları

Aşağıdaki 17 test, Postman kullanılarak manuel olarak gerçekleştirilmiş ve tamamı başarıyla geçmiştir.

| # | Endpoint | Method | Test Açıklaması | Beklenen Sonuç | Gerçek Sonuç |
|---|---|---|---|---|---|
| 1 | `/api/auth/register` | POST | Geçerli username, email, password ile kayıt | Kullanıcı oluşturulmalı ve JWT dönmeli | ✅ 200 OK + JWT döndü — **PASSED** |
| 2 | `/api/auth/login` | POST | Doğru kullanıcı adı + doğru şifre ile giriş | 200 OK ve JWT dönmeli | ✅ 200 OK + JWT döndü — **PASSED** |
| 3 | `/api/auth/login` | POST | Doğru kullanıcı + yanlış şifre ile giriş | Hatalı giriş reddedilmeli, JWT dönmemeli | ✅ 403 Forbidden, JWT dönmedi — **PASSED** |
| 4 | `/api/auth/forgot-password` | POST | Kayıtlı e-posta ile sıfırlama talebi | 200 OK ve jenerik mesaj dönmeli | ✅ 200 OK + Jenerik mesaj döndü — **PASSED** |
| 5 | `/api/auth/reset-password` | POST | Geçerli token ile şifre sıfırlama | 200 OK ve başarı mesajı dönmeli | ✅ 200 OK + Başarı mesajı döndü — **PASSED** |
| 6 | `/api/trips` | POST | Geçerli JWT ile yeni seyahat ekleme | 200 OK / 201 Created ve seyahat nesnesi dönmeli | ✅ Başarılı yanıt kodu + Seyahat eklendi — **PASSED** |
| 7 | `/api/trips/my` | GET | Geçerli JWT ile kullanıcının kendi seyahatlerini listelemesi | 200 OK ve kullanıcının seyahat listesi dönmeli | ✅ 200 OK + Liste döndü — **PASSED** |
| 8 | `/api/trips/{id}` | PUT | Geçerli JWT ile kendi seyahatini güncelleme | 200 OK ve güncellenmiş veri dönmeli | ✅ 200 OK + Güncellenmiş veri döndü — **PASSED** |
| 9 | `/api/trips/{tripId}/comments` | POST | Geçerli JWT ile seyahate yorum ekleme | 200 OK / 201 Created ve yorum nesnesi dönmeli | ✅ 200 OK + Yorum eklendi — **PASSED** |
| 10 | `/api/trips` | GET | Geçerli JWT ile tüm seyahatleri listeleme | 200 OK ve seyahat listesi dönmeli | ✅ 200 OK + Liste döndü — **PASSED** |
| 11 | `/api/trips/{id}` | GET | Geçerli JWT ile belirli bir seyahatin detaylarını getirme | 200 OK ve seyahat detayları dönmeli | ✅ 200 OK + Detaylar döndü — **PASSED** |
| 12 | `/api/users/me` | GET | Geçerli JWT ile giriş yapan kullanıcının bilgilerini getirme | 200 OK ve kullanıcı bilgileri dönmeli | ✅ 200 OK + Kullanıcı bilgileri döndü — **PASSED** |
| 13 | `/api/users` | GET | Geçerli JWT ile tüm kullanıcıları listeleme | 200 OK ve kullanıcı listesi dönmeli | ✅ 200 OK + Liste döndü — **PASSED** |
| 14 | `/api/comments/{id}` | DELETE | Geçerli JWT ile kendi yorumunu silme | 200 OK ve başarı mesajı dönmeli | ✅ 200 OK + Başarı mesajı döndü — **PASSED** |
| 15 | `/api/trips/{id}` | DELETE | Geçerli JWT ile kendi seyahatini silme | 200 OK veya 204 No Content dönmeli | ✅ 204 No Content döndü — **PASSED** |
| 16 | `/api/trips/{tripId}/photos` | POST | Geçerli JWT ile seyahate fotoğraf ekleme | 200 OK ve fotoğraf nesnesi dönmeli | ✅ 200 OK + Fotoğraf eklendi — **PASSED** |
| 17 | `/api/photos/{id}` | DELETE | Geçerli JWT ile kendi fotoğrafını silme | 200 OK ve başarı mesajı dönmeli | ✅ 200 OK + Başarı mesajı döndü — **PASSED** |

> **Sonuç: 17/17 test başarıyla geçti.** Tüm endpoint'ler beklenen davranışı sergilemiştir.
