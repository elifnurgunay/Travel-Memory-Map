package com.travelmemory.travelmap.service;

import com.travelmemory.travelmap.model.PasswordResetToken;
import com.travelmemory.travelmap.model.User;
import com.travelmemory.travelmap.repository.PasswordResetTokenRepository;
import com.travelmemory.travelmap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;

    private static final SecureRandom secureRandom = new SecureRandom();

    /**
     * Şifre sıfırlama talebi oluşturur.
     * Güvenlik (Email Enumeration Önleme): E-posta adresi sistemde bulunsa da bulunmasa da
     * dışarıya aynı mesaj dönülür.
     */
    @Transactional
    public void createPasswordResetToken(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // Kullanıcının varsa önceki sıfırlama token'larını temizle
            passwordResetTokenRepository.deleteByUser(user);

            // 32 byte rastgele token üret
            byte[] randomBytes = new byte[32];
            secureRandom.nextBytes(randomBytes);
            String rawToken = HexFormat.of().formatHex(randomBytes);

            // Token'ın SHA-256 hash'ini hesapla
            String tokenHash = hashToken(rawToken);

            // 15 dakika geçerli token kaydet
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .tokenHash(tokenHash)
                    .user(user)
                    .expiryDate(LocalDateTime.now().plusMinutes(15))
                    .used(false)
                    .build();

            passwordResetTokenRepository.save(resetToken);

            // Geliştirme/Dev Ortamı: Gerçek SMTP yapılandırması olmadığında bağlantıyı konsola yazdırıyoruz
            String resetUrl = "http://localhost:5173/reset-password?token=" + rawToken;
            System.out.println("==========================================================================");
            System.out.println("🔑 [DEV MODE] ŞİFRE SIFIRLAMA BAĞLANTISI OLUŞTURULDU (" + user.getEmail() + "):");
            System.out.println(resetUrl);
            System.out.println("==========================================================================");
        } else {
            // E-posta veritabanında olmasa dahi güvenlik gereği sessizce başarılıymış gibi davranılır.
            System.out.println("ℹ️ [DEV MODE] Şifre sıfırlama isteği geldi ancak e-posta bulunamadı: " + email);
        }
    }

    /**
     * Token'ı doğrular ve şifreyi yeniler.
     */
    @Transactional
    public boolean resetPassword(String rawToken, String newPassword) {
        if (rawToken == null || rawToken.trim().isEmpty() || newPassword == null || newPassword.trim().isEmpty()) {
            return false;
        }

        String tokenHash = hashToken(rawToken);
        Optional<PasswordResetToken> tokenOptional = passwordResetTokenRepository.findByTokenHash(tokenHash);

        if (tokenOptional.isEmpty()) {
            return false; // Token bulunamadı
        }

        PasswordResetToken resetToken = tokenOptional.get();

        // Token kullanılmış mı veya süresi dolmuş mu?
        if (resetToken.isUsed() || resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return false;
        }

        // Şifreyi BCrypt ile şifrele ve kullanıcıyı güncelle
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Token'ı kullanıldı olarak işaretle
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        return true;
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algoritması bulunamadı", e);
        }
    }
}
