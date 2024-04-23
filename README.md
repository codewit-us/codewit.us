# codewit.us

Website for learning how to code from unique perspectives

## Getting Started

This project uses _Nx_ to manage the monorepo and npm as the package manager. To use nx commands, install nx CLI globally:
`npm i -g nx`

### Environment Variables

Navigate to `codewit.us/codewit/` and create a .env file with the following content:

  ```sh
  # Frontend
  YT_KEY='YOUR YOUTUBE API KEY'
  YT_CHANNEL_ID='YOUR CHANNEL ID'

  # Backend
  GOOGLE_REDIRECT_URL="GOOGLE AUTH REDIRECT URL"
  GOOGLE_CLIENT_ID="YOUR CLIENT ID"
  GOOGLE_CLIENT_SECRET="YOUR SECRET"
  COOKIE_KEY="ANY ALPHANUMERICAL STRING"
  ```

### Running The Application

From the [`codewit` directory, you can run nx commands](codewit/)

- Running front end: `nx serve client`

- Running back end: `nx serve api`

- Running both frontend and backend using **docker-compose** with watching for file changes enabled: `docker-compose up -d && docker compose watch`.

  - This will start the frontend, backend and the db in separate containers and watch for file changes in the `codewit` directory.

  - To stop the containers, run `docker-compose down`, as doing `Ctrl+C` will not stop the containers. it will stop the watcher but the containers will still be running.

  - To view logs from each container use `docker logs -f <container-name>`.

## Contributing

See the [contributing guide](CONTRIBUTING.md).

## Software Overview

An overview of the features of the software is available in our [roadmap](ROADMAP.md)
