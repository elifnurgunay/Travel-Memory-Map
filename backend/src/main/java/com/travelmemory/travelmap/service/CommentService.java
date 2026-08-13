package com.travelmemory.travelmap.service;

import com.travelmemory.travelmap.model.Comment;
import com.travelmemory.travelmap.model.Trip;
import com.travelmemory.travelmap.model.User;
import com.travelmemory.travelmap.repository.CommentRepository;
import com.travelmemory.travelmap.repository.TripRepository;
import com.travelmemory.travelmap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    public Comment addComment(Long tripId, String username, String content) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Seyahat bulunamadı"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        Comment comment = Comment.builder()
                .trip(trip)
                .user(user)
                .content(content)
                .build();

        return commentRepository.save(comment);
    }

    public void deleteComment(Long commentId, String username) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Yorum bulunamadı"));

        // Güvenlik Kontrolü: Yorumu sadece yazan kişi silebilir
        if (!comment.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Bu yorumu silme yetkiniz yok!");
        }

        commentRepository.delete(comment);
    }
}