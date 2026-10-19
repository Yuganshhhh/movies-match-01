package com.yugansh.moviematch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Entry point of the Movie Match Spring Boot application
@SpringBootApplication
public class MovieMatchApplication {

	public static void main(String[] args) {
		// Boots the entire application context
		SpringApplication.run(MovieMatchApplication.class, args);
	}

}
