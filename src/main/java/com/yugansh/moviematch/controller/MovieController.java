package com.yugansh.moviematch.controller;

import com.yugansh.moviematch.model.MovieCosines;
import com.yugansh.moviematch.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/movie")
public class MovieController {

    private final MovieService movieService;

    @GetMapping("/search")
    public List<MovieCosines> search(@RequestParam String description) {
        return movieService.search(description);
    }

    @GetMapping("/{title}/similar")
    public List<MovieCosines> similarMovies(@PathVariable String title) {
        return movieService.similarMovies(title);
    }
}
