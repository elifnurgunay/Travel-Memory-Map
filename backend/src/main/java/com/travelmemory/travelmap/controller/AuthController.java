package com.travelmemory.travelmap.controller;

import com.travelmemory.travelmap.model.User;
import com.travelmemory.travelmap.repository.UserRepository;
import com.travelmemory.travelmap.security.JwtUtils;
import com.travelmemory.travelmap.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // React ile haberleşme için
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetService passwordResetService;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtils jwtUtils,
                          AuthenticationManager authenticationManager,
                          PasswordResetService passwordResetService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
        this.passwordResetService = passwordResetService;
    }

    // 1. KAYIT OLMA ENDPOINT'İ (/api/auth/register)
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        // Kullanıcı adı ve e-posta kontrolü
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Bu kullanıcı adı zaten alınmış!");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Bu e-posta adresi zaten kullanımda!");
        }

        // Kullanıcının şifresini açık metin olarak değil, BCrypt ile şifreleyerek kaydediyoruz
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);

        // Kayıt olduktan sonra hemen bir token üretip dönüyoruz ki kullanıcı direkt giriş yapmış sayısın
        String token = jwtUtils.generateToken(savedUser);

        return ResponseEntity.ok(token);
    }

    // 2. GİRİŞ YAPMA ENDPOINT'İ (/api/auth/login)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        // Kullanıcı adı ve şifreyi Spring Security yöneticisine doğrulatıyoruz
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        // Doğrulama başarılıysa kullanıcının detaylarını alıp ona özel token üretiyoruz
        User user = (User) authentication.getPrincipal();
        String token = jwtUtils.generateToken(user);

        return ResponseEntity.ok(token);
    }

    // 3. ŞİFREMİ UNUTTUM ENDPOINT'İ (/api/auth/forgot-password)
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email != null && !email.trim().isEmpty()) {
            passwordResetService.createPasswordResetToken(email.trim());
        }
        // Email Enumeration Önleme: Her durumda aynı genel kullanıcı mesajını dönüyoruz.
        return ResponseEntity.ok(Map.of("message", "E-posta adresi kayıtlıysa şifre sıfırlama bağlantısı gönderilmiştir."));
    }

    // 4. ŞİFRE SIFIRLAMA ENDPOINT'İ (/api/auth/reset-password)
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || token.trim().isEmpty() || newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token ve yeni şifre alanı zorunludur."));
        }

        boolean success = passwordResetService.resetPassword(token.trim(), newPassword);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Şifreniz başarıyla değiştirildi. Giriş yapabilirsiniz."));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Geçersiz veya süresi dolmuş sıfırlama bağlantısı."));
        }
    }
}