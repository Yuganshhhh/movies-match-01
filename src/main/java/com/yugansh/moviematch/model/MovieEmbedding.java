package com.yugansh.moviematch.model;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MovieEmbedding {

    private String name;
    private String description;
    private float[] embedding;
}
