package com.yugansh.moviematch.controller;

import com.yugansh.moviematch.model.MovieCosines;
import com.yugansh.moviematch.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// REST controller exposing movie search and similarity endpoints
@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/movie")
public class MovieController {

    private final MovieService movieService;

    // Search movies by free-text description using embeddings
    @GetMapping("/search")
    public List<MovieCosines> search(@RequestParam String description) {
        return movieService.search(description);
    }

    // Find movies most similar to a given title
    @GetMapping("/{title}/similar")
    public List<MovieCosines> similarMovies(@PathVariable String title) {
        return movieService.similarMovies(title);
    }
}
