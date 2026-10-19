package com.yugansh.moviematch.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// Response object that pairs a movie with its cosine-similarity score
@Getter
@Setter
@AllArgsConstructor
public class MovieCosines {

    private String name;
    private String description;
    private double cosines; // similarity score (higher = more similar)
}
