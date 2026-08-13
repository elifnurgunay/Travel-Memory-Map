package com.travelmemory.travelmap.controller;

import com.travelmemory.travelmap.model.Comment;
import com.travelmemory.travelmap.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/trips/{tripId}/comments")
    public ResponseEntity<Comment> addComment(@PathVariable Long tripId, @RequestBody Map<String, String> request, Principal principal) {
        // Frontend'den gelen JSON içerisinden "content" bilgisini alıyoruz
        String content = request.get("content");
        return ResponseEntity.ok(commentService.addComment(tripId, principal.getName(), content));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<String> deleteComment(@PathVariable Long id, Principal principal) {
        commentService.deleteComment(id, principal.getName());
        return ResponseEntity.ok("Yorum başarıyla silindi.");
    }
}