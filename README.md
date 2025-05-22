# codewit.us

Website for learning how to code from unique perspectives

## Getting Started

This project uses _Nx_ to manage the monorepo and npm as the package manager. To use nx commands, install nx CLI globally:
`npm i -g nx`

### Environment Variables

Navigate to `codewit.us/codewit/` and create a .env file with the following content (replace with your real values):

```env
# Frontend
YT_KEY='YOUR YOUTUBE API KEY'
YT_CHANNEL_ID='YOUR CHANNEL ID'

# Backend
GOOGLE_REDIRECT_URL="GOOGLE AUTH REDIRECT URL"
GOOGLE_CLIENT_ID="YOUR CLIENT ID"
GOOGLE_CLIENT_SECRET="YOUR SECRET"
COOKIE_KEY="ANY ALPHANUMERICAL STRING"

# Database
DB_HOST=DB_HOST
DB_USER=DB_USER
DB_PASSWORD=DB_PASS
DB_NAME=DB_NAME
DB_PORT=PORT_NUM
```

### Running The Application

From the [`codewit` directory, you can run nx commands](codewit/)

- Running front end: `nx serve client`

- Running back end: `nx serve api`

- Running both frontend and backend using **docker-compose** with watching for file changes enabled: `docker-compose up -d && docker compose watch`.

  - This will start the frontend, backend and the db in separate containers and watch for file changes in the `codewit` directory.

  - To stop the containers, run `docker-compose down`, as doing `Ctrl+C` will not stop the containers. it will stop the watcher but the containers will still be running.

  - To view logs from each container use `docker logs -f <container-name>`.

## Admin Seeding

The `codewit.us/codewit/api/src/scripts/seed-admins.ts` file is used to seed the database with admin users. This can be done in two ways: manually using the `npm` command or with the provided `seed.sh` script, which not only handles environment variables but also provides options for both admin and data seeding.

### Method 1: Manual Seeding with `npm` Command

To manually seed admin users, ensure the required environment variables are set in a `.env` file or exported in your terminal. Here are the necessary variables:

```env
DB_HOST=localhost
DB_USER=codewitus_user
DB_PASSWORD=12345
DB_NAME=codewitus_db
DB_PORT=5432
```

Once the environment variables are set, you can run the `npm` command directly. For example, to seed admin users with the emails `abc@example.com` and `def@example.com`, run:

```sh
npm run seed-admins -- --admin abc@example.com def@example.com
```

### Method 2: Using `seed.sh` Script with Automatic Environment Setup

The `seed.sh` script automates environment variable setup, as well as admin and data seeding, making it easier to initialize the database. The script checks for required environment variables, setting any missing ones to default values, and provides options for various seeding needs.

To seed emails as admins using `seed.sh` execute the following:

```sh
./seed.sh -e abc@example.com def@example.com
```
To seed the database with general data, using a single emial for roster setup, run:

```sh
./seed.sh -d abc@example.com
```

To seed the database with both admin emails and general data (using the first email for data seeding), run:

```sh
./seed.sh -b abc@example.com def@example.com
```

#### Optional: Use a Custom Postgres Port

If your machine already has a local Postgres instance running on the default port (`5432`), you can specify a different port when running the seed script using the `-p` flag:

```sh
./seed.sh -p 5440 -e abc@example.com

For more details on all available options, you can use the -h flag to display the help information, which lists each command and provides usage examples.

## Contributing

See the [contributing guide](CONTRIBUTING.md).

## Software Overview

An overview of the features of the software is available in our [roadmap](ROADMAP.md)
