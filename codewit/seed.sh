#!/bin/bash

# get emails from params
DB_CONTAINER_NAME="codewitus_db"
EMAILS=()
EMAIL_REGEX='^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

# check and set environment variables in .env if they are missing
function check_env_vars {
  echo -e "\nChecking and setting environment variables in .env..."

  # define required variables and defaults
  REQUIRED_VARS=("DB_HOST" "DB_USER" "DB_PASSWORD" "DB_NAME" "DB_PORT")
  DEFAULT_VALUES=("localhost" "codewitus_user" "12345" "codewitus_db" "5432")

  # create .env file if it doesn't exist
  [ ! -f .env ] && touch .env

  # check if any required variables are missing
  MISSING_VARS=false
  for i in "${!REQUIRED_VARS[@]}"; do
    VAR_NAME=${REQUIRED_VARS[$i]}
    if ! grep -q "^$VAR_NAME=" .env; then
      MISSING_VARS=true
      break
    fi
  done

  # prompt the user if any variables are missing
  if $MISSING_VARS; then
    echo "One or more required environment variables are missing."
    read -p "Would you like to use the default values for all missing variables? (y/n): " choice
    if [ "$choice" = "y" ]; then
      for i in "${!REQUIRED_VARS[@]}"; do
        VAR_NAME=${REQUIRED_VARS[$i]}
        DEFAULT_VALUE=${DEFAULT_VALUES[$i]}
        if ! grep -q "^$VAR_NAME=" .env; then
          echo -e "\n$VAR_NAME=$DEFAULT_VALUE" >> .env
          echo "$VAR_NAME set to $DEFAULT_VALUE in .env"
        fi
      done
    else
      echo "Please set the missing environment variables manually."
      exit 1
    fi
  else
    echo "All required environment variables are already set in .env."
  fi
}

# check if docker database container is running
function check_db {
  echo -e "\nChecking if database container ($DB_CONTAINER_NAME) is running..."
  if ! docker ps | grep "$DB_CONTAINER_NAME" > /dev/null 2>&1; then
    echo "Database container ($DB_CONTAINER_NAME) is not running."
    exit 1
  else
    echo "Database container ($DB_CONTAINER_NAME) is running."
  fi
}

# validate email format
function validate_emails {
  echo -e "\nValidating email(s)..."
  for email in "${EMAILS[@]}"; do
    if [[ ! $email =~ $EMAIL_REGEX ]]; then
      echo "Invalid email format: $email"
      exit 1
    fi
  done
  echo -e "All emails are valid.\n"
}

# seed database with emails
function seed_emails {
  if [ ${#EMAILS[@]} -eq 0 ]; then
    echo "No email(s) provided to seed the database."
    exit 1
  fi

  validate_emails
  
  echo "Seeding database with email(s): ${EMAILS[*]}"
  
  # run the npm command with .env for the seed-admins script
  npm run seed-admins -- --admin "${EMAILS[*]}"
}

# seed database with data
function seed_data {
  echo "Seeding database with general data."
  # TODO: seed general data into db
}

# display help information
function display_help {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -e \"emails\"   Seed the database with the provided emails."
  echo "  -d             Seed the database with general data."
  echo "  -b \"emails\"   Seed the database with both emails and general data."
  echo "  -h             Display this help message."
  echo ""
  echo "Examples:"
  echo "  $0 -e email1@example.com email2@example.com"
  echo "      Seed only the database with emails."
  echo "  $0 -d"
  echo "      Seed only the database with general data."
  echo "  $0 -b email1@example.com email2@example.com"
  echo "      Seed the database with both emails and general data."
  exit 0
}

function main {
  # parse options
  SEED_EMAILS=false
  SEED_DATA=false

  if [ $# -eq 0 ]; then
    echo "Invalid usage: No flags provided. Use -h for help."
    exit 1
  fi

  while getopts ":e:dbh" option; do
    case $option in
      e)
        SEED_EMAILS=true
        EMAILS+=("$OPTARG")
        ;;
      d)
        SEED_DATA=true
        ;;
      b)
        SEED_EMAILS=true
        SEED_DATA=true
        ;;
      h)
        display_help
        ;;
      \?)
        echo "Invalid option. Use -h for help."
        exit 1
        ;;
      :)
        echo "WARNING: Invalid used of -$OPTARG. Use -h for help."
        exit 1
        ;;
    esac
  done

  # shift the parsed options to get the remaining positional arguments
  shift $((OPTIND - 1))

  # capture remaining arguments as additional emails if -e or -b is specified
  if [ "$SEED_EMAILS" = true ]; then
    EMAILS+=("$@")
  fi

  # check environment variables
  check_env_vars

  # check if we need to seed emails, data, or both
  if [ "$SEED_EMAILS" = true ] || [ "$SEED_DATA" = true ]; then
    # check if the database container is running only once
    check_db
    
    # run the appropriate seeding functions
    if [ "$SEED_EMAILS" = true ]; then
      seed_emails
    fi
    
    if [ "$SEED_DATA" = true ]; then
      seed_data
    fi
  fi
}

main "$@"