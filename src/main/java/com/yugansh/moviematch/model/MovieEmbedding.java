package com.yugansh.moviematch.model;

import lombok.*;

// Holds a movie together with its vector embedding for similarity calculations
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MovieEmbedding {

    private String name;
    private String description;
    private float[] embedding;
}
