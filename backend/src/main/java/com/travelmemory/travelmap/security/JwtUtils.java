package com.travelmemory.travelmap.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtils {

    // Bu bizim projeye özel gizli anahtarımız. (Bunu kimseyle paylaşmaman gerekir)
    // Güvenli bir şifreleme için en az 256-bit (yaklaşık 40 karakter) olmalıdır.
    private final String SECRET_KEY = "TravelMemoryMapSuperSecretKeyForJwtTokenGeneration";

    // Token'ın geçerlilik süresi (Şu an 1 Gün = 24 * 60 * 60 * 1000 milisaniye)
    private final long JWT_EXPIRATION = 86400000;

    // 1. Anahtarı kriptolama algoritmasına uygun hale getiriyoruz
    private Key getSigningKey() {
        byte[] keyBytes = SECRET_KEY.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // 2. Giriş Yapan Kullanıcı İçin Yeni Token Üretme (Kimlik Basımı)
    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .setSubject(userDetails.getUsername()) // Kimliğin sahibinin adı
                .setIssuedAt(new Date(System.currentTimeMillis())) // Veriliş tarihi
                .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION)) // Bitiş tarihi
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Mühür
                .compact();
    }

    // 3. Gelen Token'ın İçinden Kullanıcı Adını Çıkarma (Kimlik Okuma)
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 4. Token'ın Süresinin Dolup Dolmadığını Kontrol Etme
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // 5. Gelen Token'ın Gerçekten O Kullanıcıya Ait Olup Olmadığını Doğrulama (Sahtecilik Kontrolü)
    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    // --- JWT Kütüphanesinin Arka Planda Kullandığı Yardımcı Ayrıştırıcı Metotlar ---
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}