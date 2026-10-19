package com.yugansh.moviematch.service;

import com.yugansh.moviematch.model.MovieCosines;
import com.yugansh.moviematch.model.MovieData;
import com.yugansh.moviematch.model.MovieEmbedding;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final JsonMapper jsonMapper;
    private final EmbeddingModel embeddingModel;
    // In-memory list of all movies with their pre-computed embeddings
    private final List<MovieEmbedding> movieEmbeddingList = new ArrayList<>();

    // Performs semantic search: embed the query and rank movies by cosine similarity
    public List<MovieCosines> search(String description) {

        List<MovieCosines> movieCosinesList = new ArrayList<>();

        float[] embedding = embeddingModel.embed(description);

        for(MovieEmbedding movieEmbedding : movieEmbeddingList) {
            double cosinesValue = cosineSimilarity(embedding, movieEmbedding.getEmbedding());

            MovieCosines movie = new MovieCosines(
                    movieEmbedding.getName(),
                    movieEmbedding.getDescription(),
                    cosinesValue
            );

            movieCosinesList.add(movie);
        }

        sortBySimilarity(movieCosinesList);
        return topKMatches(movieCosinesList);

    }

    // Finds the top similar movies to a given title (excluding the title itself)
    public List<MovieCosines> similarMovies(String title){

        List<MovieCosines> movieCosinesList = new ArrayList<>();

        MovieEmbedding movie = findByTitle(title);

        for(MovieEmbedding movieEmbedding : movieEmbeddingList) {
            if(movieEmbedding.getName().equalsIgnoreCase(movie.getName())) {
                continue;
            }

            double cosine = cosineSimilarity(movieEmbedding.getEmbedding(), movie.getEmbedding());
            MovieCosines movieCosines = new MovieCosines(
                    movieEmbedding.getName(),
                    movieEmbedding.getDescription(),
                    cosine
            );

            movieCosinesList.add(movieCosines);
        }

        sortBySimilarity(movieCosinesList);
        return topKMatches(movieCosinesList);
    }

    private MovieEmbedding findByTitle(String title) throws IllegalArgumentException{
        for(MovieEmbedding movieEmbedding : movieEmbeddingList) {
            if(movieEmbedding.getName().equalsIgnoreCase(title)) {
                return movieEmbedding;
            }
        }
        throw new IllegalArgumentException("There is no movie wih the title: " + title);
    }

    private double cosineSimilarity(float[] a, float[] b) {
        double dotProduct = 0.0;
        double sqrA = 0.0;
        double sqrB = 0.0;

        for(int i = 0; i < a.length; i++) {
            dotProduct = dotProduct + a[i] * b[i];
            sqrA = sqrA + (a[i] * a[i]);
            sqrB = sqrB + (b[i] * b[i]);
        }
        if(sqrA == 0.0 || sqrB == 0.0) return 0.0;

        return dotProduct / (Math.sqrt(sqrA) * Math.sqrt(sqrB));

    }

    private void sortBySimilarity(List<MovieCosines> list) {
        list.sort((m1, m2) -> Double.compare(m2.getCosines(), m1.getCosines()));
    }

    private List<MovieCosines> topKMatches(List<MovieCosines> list) {
        List<MovieCosines> listNew = new ArrayList<>();

        int k2 = Math.min(3, list.size());

        for(int i = 0; i < k2; i++) {
            listNew.add(list.get(i));
        }

        return listNew;
    }

    @PostConstruct
    private void initMoviesInMovieEmbeddings() throws IOException {

        ClassPathResource classPathResource = new ClassPathResource("movies.json");
        InputStream inputStream = classPathResource.getInputStream();
        List<MovieData> movieDataList = jsonMapper.readValue(inputStream, new TypeReference<>() {
        });

        for(MovieData movieData : movieDataList) {
            float[] embedding = embeddingModel.embed(movieData.getDescription());

            MovieEmbedding movie = new MovieEmbedding(
                    movieData.getName(),
                    movieData.getDescription(),
                    embedding
            );

            movieEmbeddingList.add(movie);
        }
        inputStream.close();
        System.out.print(movieEmbeddingList.size() + " movies loaded with embeddings successfully");
    }
}
