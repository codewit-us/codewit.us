# codewit.us roadmap

This document provides a "roadmap" to help developers navigate the organization of both the code and the website's features.

## Front-end

The `codewit/client` directory contains the react app that drives the front-end.

#### Tailwind Styling Configurations

- All styling configurations for Tailwind are located under `codewit/client/src/tailwind.config.js`

#### Website Icon/Logos

- The site icon, or favicon, which appears in the browser tab, is located under the `codewit/client/public/` directory alongside the logo and hexicon.

## Back-end

The `codewit/api` directory contains the express back-end.

### main.ts

- main.ts contains the router for our backend apis that uses express's router. It is located at `codewit/api/src/main.ts`

  **Current routes**

  - /demos - for the creating, reading, updating, and deleting the demos
  - /exercises - for the creating, reading, updating, and deleting the exercises

### models

- The `codewit/api/src/models` directory contains the models for the database. These are essentially the schemas for the tables in the database.

  **Current models**

  - demo.ts - for the demo model
  - exercise.ts - for the exercise model

### controllers

- The `codewit/api/src/controllers` directory contains the controllers for the routes. These have methods for creating, reading, updating, and deleting the rows of corresponding tables in the database and are called by the routes.

  **Current controllers**

  - demo.ts - for the demo controller
  - exercise.ts - for the exercise controller

### routes

- The `codewit/api/src/routes` directory contains the routes for the controllers. These have the express routes that call the controller methods.

  **Current routes**

  - demo.ts - for the demo routes
  - exercise.ts - for the exercise routes
