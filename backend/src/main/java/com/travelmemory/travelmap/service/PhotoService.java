package com.travelmemory.travelmap.service;

import com.travelmemory.travelmap.model.Photo;
import com.travelmemory.travelmap.model.Trip;
import com.travelmemory.travelmap.repository.PhotoRepository;
import com.travelmemory.travelmap.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PhotoService {

    private final PhotoRepository photoRepository;
    private final TripRepository tripRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public Photo addPhoto(
            Long tripId,
            MultipartFile file,
            String username
    ) throws IOException {

        // 1. Seyahati bul
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Seyahat bulunamadı"));

        // 2. Güvenlik kontrolü
        // Sadece seyahatin sahibi fotoğraf ekleyebilir
        if (!trip.getUser().getUsername().equals(username)) {
            throw new RuntimeException(
                    "Bu seyahate fotoğraf ekleme yetkiniz yok!"
            );
        }

        // 3. Dosya gerçekten gönderilmiş mi?
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Fotoğraf dosyası seçilmedi!");
        }

        // 4. uploads klasörünü oluştur
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath();

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 5. Dosyanın uzantısını al
        String originalFileName = file.getOriginalFilename();

        String extension = "";

        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(
                    originalFileName.lastIndexOf(".")
            );
        }

        // 6. Benzersiz dosya adı oluştur
        String fileName = UUID.randomUUID() + extension;

        // 7. Fotoğrafı uploads klasörüne kaydet
        Path filePath = uploadPath.resolve(fileName);

        Files.copy(
                file.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING
        );

        // 8. Veritabanına dosyanın URL'sini kaydet
        String photoUrl = "/uploads/" + fileName;

        Photo photo = Photo.builder()
                .trip(trip)
                .photoUrl(photoUrl)
                .build();

        return photoRepository.save(photo);
    }

    public void deletePhoto(Long photoId, String username) {

        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new RuntimeException("Fotoğraf bulunamadı"));

        // Sadece seyahatin sahibi silebilir
        if (!photo.getTrip().getUser().getUsername().equals(username)) {
            throw new RuntimeException(
                    "Bu fotoğrafı silme yetkiniz yok!"
            );
        }

        // Önce fiziksel dosyayı sil
        try {
            String photoUrl = photo.getPhotoUrl();

            if (photoUrl != null && photoUrl.startsWith("/uploads/")) {

                String fileName = photoUrl.substring("/uploads/".length());

                Path filePath = Paths.get(uploadDir)
                        .toAbsolutePath()
                        .resolve(fileName);

                Files.deleteIfExists(filePath);
            }

        } catch (IOException e) {
            throw new RuntimeException(
                    "Fotoğraf dosyası silinemedi!",
                    e
            );
        }

        // ÖNEMLİ: orphanRemoval = true olduğu için,
        // fotoğrafı Trip'in koleksiyonundan çıkarmalıyız.
        // Direkt photoRepository.delete() Hibernate tarafından göz ardı edilir
        // çünkü Trip hâlâ bu Photo'ya referans tutuyor.
        Trip trip = photo.getTrip();
        trip.getPhotos().remove(photo);
        tripRepository.save(trip);
    }

}