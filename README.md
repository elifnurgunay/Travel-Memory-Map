# 🌍 Travel Memory Map

<img width="1418" height="832" alt="Ekran görüntüsü 2026-08-13 212828" src="https://github.com/user-attachments/assets/ddc08727-1439-4ed2-b9a8-00f3c150006c" />
<img width="1458" height="401" alt="Ekran görüntüsü 2026-08-13 212835" src="https://github.com/user-attachments/assets/e12f6468-96f5-4cec-b85c-627ffd608741" />

**Travel Memory Map**, kullanıcıların seyahat deneyimlerini belgelemelerine, görselleştirmelerine ve hatırlamalarına yardımcı olmak için tasarlanmış tam yığın (full-stack) bir web uygulamasıdır. Etkileşimli bir dünya haritası ile kullanıcılar seyahatlerini işaretleyebilir, fotoğraflar yükleyebilir ve son derece güvenli, güzel tasarlanmış bir arayüzde maceralarının dijital bir günlüğünü tutabilirler.

---

## ✨ Özellikler

* 🗺️ **Etkileşimli Seyahat Haritası**: Dinamik ve etkileşimli bir harita üzerinde seyahat konumlarınızı işaretleyin.
* 📸 **Fotoğraf Galerisi**: Her bir seyahatiniz için yüksek kaliteli fotoğraflar yükleyin ve yönetin.
* 🔐 **Güvenli Kimlik Doğrulama**: BCrypt şifre hashleme ile güçlü JWT tabanlı kimlik doğrulama sistemi.
* 🔑 **Şifre Kurtarma**: Tek kullanımlık, süre sınırlı tokenlar (SHA-256) kullanan güvenli şifre sıfırlama akışı.
* 🛡️ **Veri Gizliliği**: Kesin IDOR (Güvensiz Doğrudan Nesne Başvurusu) koruması, yalnızca kendi seyahat anılarınızı görüntüleyebilmenizi ve yönetebilmenizi sağlar.
* 📱 **Duyarlı (Responsive) Tasarım**: Hem masaüstü hem de mobil cihazlarda kusursuz çalışan şık, karanlık temalı bir kullanıcı arayüzü.
* 📝 **Seyahat Günlükleri**: Ziyaret ettiğiniz her konuma detaylı notlar, tarihler ve yorumlar ekleyin.

---

## 🛠️ Kullanılan Teknolojiler

### Frontend (Önyüz)
* **React 18** (Vite ile)
* **Context API** (Durum Yönetimi)
* **Axios** (API İstekleri)
* **Lucide React** (İkonlar)
* **Özel CSS / Flexbox & Grid** (Modern, karanlık temalı arayüz)

### Backend (Arkayüz)
* **Java 17+**
* **Spring Boot 3**
* **Spring Security** (JWT Kimlik Doğrulama ve Yetkilendirme)
* **Spring Data JPA** (Hibernate)
* **Çoklu Parça (Multipart) Dosya İşleme** (Yerel görsel depolama)

---

## 📂 Klasör Yapısı

```text
Travel-Memory-Map/
├── backend/                  # Spring Boot arkayüz uygulaması
│   ├── src/main/java/        # Java kodları (Controller, Service, Security vb.)
│   ├── src/main/resources/   # Konfigürasyon dosyaları
│   ├── uploads/              # Kullanıcıların yüklediği fotoğraflar
│   └── pom.xml               # Maven bağımlılıkları
├── frontend/                 # React önyüz uygulaması
│   ├── public/               # Statik dosyalar
│   ├── src/
│   │   ├── api/              # Axios API yapılandırması
│   │   ├── components/       # React bileşenleri
│   │   ├── context/          # React Context API (Auth Context)
│   │   ├── pages/            # Ana sayfalar (Login, Profile vb.)
│   │   └── App.jsx           # Ana uygulama ve rotalar
│   ├── package.json          # Node bağımlılıkları
│   └── vite.config.js        # Vite yapılandırması
└── API_DOCUMENTATION.md      # Detaylı API dokümantasyonu
```

---

## 🚀 Başlangıç

Geliştirme ve test amacıyla projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin.

### Gereksinimler
* [Node.js](https://nodejs.org/) (v18 veya üzeri)
* [Java Development Kit (JDK)](https://adoptium.net/) (v17 veya üzeri)
* [Maven](https://maven.apache.org/)

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/elifnurgunay/Travel-Memory-Map.git
cd Travel-Memory-Map
```

### 2. Backend Kurulumu
```bash
cd backend
# Spring Boot uygulamasını başlatın
./mvnw spring-boot:run
```
*Backend sunucusu `http://localhost:8080` adresinde başlayacaktır.*

### 3. Frontend Kurulumu
Yeni bir terminal penceresi açın:
```bash
cd frontend
# Bağımlılıkları yükleyin
npm install
# Geliştirme sunucusunu başlatın
npm run dev
```
*Frontend uygulaması `http://localhost:5173` adresinde başlayacaktır.*

---

## 📚 API Dokümantasyonu

Kimlik doğrulama, kullanıcı yönetimi, seyahatler ve fotoğraf yüklemeleri dahil olmak üzere tüm uç noktalar (endpoints) için kapsamlı ve detaylı bir API dokümantasyonu mevcuttur.

👉 **[Tüm API Dokümantasyonunu Görüntüle](API_DOCUMENTATION.md)**

---

## 🔒 Güvenlik Uygulamaları

* **Durumsuz (Stateless) JWT Kimlik Doğrulama**: Güvenli, ölçeklenebilir oturum yönetimi.
* **BCrypt Hashleme**: Şifreler hiçbir zaman düz metin olarak saklanmaz.
* **SHA-256 Token Hashleme**: Veritabanı sızıntısı açıklarını önlemek için şifre sıfırlama tokenları veritabanında güvenli bir şekilde hashlenir.
* **Sahiplik Doğrulaması**: Her hassas API uç noktası, erişilmek istenen kaynağın kimliği doğrulanmış kullanıcıya ait olup olmadığını kontrol eder.

---

## 👤 Geliştirici

**Elif Nur Günay**
* GitHub: [@elifnurgunay](https://github.com/elifnurgunay)

---

> Bu proje; tam yığın (full-stack) geliştirme yeteneklerini, güvenli API tasarımını ve modern UI/UX prensiplerini sergilemek amacıyla bir portfolyo çalışması olarak geliştirilmiştir.
