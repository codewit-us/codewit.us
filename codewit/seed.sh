#!/bin/bash

# Get Emails from Params
EMAILS=$@
DB_CONTAINER_NAME="codewitus_db"

# Check if Docker database container is running
function check_db {
  if ! docker ps | grep -q "$DB_CONTAINER_NAME"; then
    echo "Database container ($DB_CONTAINER_NAME) is not running."
    exit 1
  else
    echo "Database container ($DB_CONTAINER_NAME) is running."
  fi
}

# Seed database with emails
function seed_emails {
  if [ -z "$EMAILS" ]; then
    echo "No emails provided to seed the database."
    exit 1
  fi
  echo "Seeding database with emails: $EMAILS"
  # TODO: SEED EMAILS INTO DATBASE (LIKELY JUST RUN THE NPM COMMAND)
}

# Seed database with data
function seed_data {
  echo "Seeding database with general data."
  # TODO: SEED GENERAL DATA INTO DB (IDK YET)
}

# Display help information
function display_help {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -e \"emails\"   Seed the database with the provided emails."
  echo "  -d            Seed the database with general data."
  echo "  -b \"emails\"   Seed the database with both emails and general data."
  echo "  -h            Display this help message."
  echo ""
  echo "Examples:"
  echo "  $0 -e \"email1@example.com email2@example.com\""
  echo "      Seed only the database with emails."
  echo "  $0 -d"
  echo "      Seed only the database with general data."
  echo "  $0 -b \"email1@example.com email2@example.com\""
  echo "      Seed the database with both emails and general data."
  exit 0
}

# Parse options
SEED_EMAILS=false
SEED_DATA=false

if [ $# -eq 0 ]; then
  echo "Invalid usage: No flags provided. Use -h for help."
  exit 1
fi

while getopts "e:d:bh" option; do
  case $option in
    e)
      SEED_EMAILS=true
      EMAILS="$OPTARG"
      ;;
    d)
      SEED_DATA=true
      ;;
    b)
      SEED_EMAILS=true
      SEED_DATA=true
      EMAILS="$OPTARG"
      ;;
    h)
      display_help
      ;;
    *)
      echo "Invalid option. Use -h for help."
      exit 1
      ;;
  esac
done

# Chekc if DB container is running & run the appropriate seeding functions
if [ "$SEED_EMAILS" = true ]; then
  check_db
  seed_emails
fi

if [ "$SEED_DATA" = true ]; then
  check_db
  seed_data
fi
