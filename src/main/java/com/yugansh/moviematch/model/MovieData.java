package com.yugansh.moviematch.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Simple DTO representing raw movie data loaded from movies.json
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MovieData {

    private String name;
    private String description;
}
