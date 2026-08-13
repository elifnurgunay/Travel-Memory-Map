package com.travelmemory.travelmap.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;

    // Bağımlılıkları (Dependency Injection) alıyoruz
    public JwtAuthenticationFilter(JwtUtils jwtUtils, UserDetailsService userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Gelen isteğin başlığından (Header) Token'ı al
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // 2. Token yoksa veya "Bearer " ile başlamıyorsa diğer filtrelere geç (Kapıdan çevir)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. "Bearer " kelimesini (ilk 7 karakteri) kesip asıl Token'ı al
        jwt = authHeader.substring(7);
        // Token'ın içinden kullanıcı adını çıkar
        username = jwtUtils.extractUsername(jwt);

        // 4. Kullanıcı adı varsa ve şu an sistemde kimse giriş yapmamışsa işlemlere başla
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Veritabanından kullanıcıyı bul
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // 5. Token geçerli mi diye kontrol et
            if (jwtUtils.validateToken(jwt, userDetails)) {
                // Her şey yolundaysa sisteme "Bu adam güvenilir, girişini onayla" diyoruz
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Güvenlik bağlamına (SecurityContext) kullanıcıyı yerleştir
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // İşlem bittikten sonra filtre zincirine devam et
        filterChain.doFilter(request, response);
    }
}