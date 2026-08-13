package com.travelmemory.travelmap.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trips")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // User bilgisini donururken sadece id ve username donsun, triplerini donturme (dongu onleme)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"trips", "password", "authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled"})
    private User user;

    @NotBlank(message = "Sehir alani bos birakilamaz")
    @Column(nullable = false, length = 100)
    private String city;

    @Column(name = "place_name", length = 150)
    private String placeName;

    @NotBlank(message = "Ulke alani bos birakilamaz")
    @Column(nullable = false, length = 100)
    private String country;

    @NotNull(message = "Enlem (Latitude) gerekli")
    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @NotNull(message = "Boylam (Longitude) gerekli")
    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @NotNull(message = "Ziyaret tarihi gerekli")
    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Min(1)
    @Max(5)
    private Integer rating;

    @Column(name = "is_public")
    private Boolean isPublic;

    // Comment ve Photo'larda trip alani JsonIgnore ile isaretlendi, dongu olusmuyor
    @Builder.Default
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Comment> comments = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Photo> photos = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.isPublic == null) {
            this.isPublic = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}