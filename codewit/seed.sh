#!/bin/bash

# get emails from params
DB_CONTAINER_NAME="postgres:16-bookworm"
FE_CONTAINER_NAME="codewit-frontend"
BE_CONTAINER_NAME="codewit-app"

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
    echo " ❌: One or more required environment variables are missing."
    read -p " ❓: Would you like to use the default values for all missing variables? (y/n): " choice
    if [ "$choice" = "y" ]; then
      for i in "${!REQUIRED_VARS[@]}"; do
        VAR_NAME=${REQUIRED_VARS[$i]}
        DEFAULT_VALUE=${DEFAULT_VALUES[$i]}
        if ! grep -q "^$VAR_NAME=" .env; then
          echo -e "\n$VAR_NAME=$DEFAULT_VALUE" >> .env
          echo " ✅: $VAR_NAME set to $DEFAULT_VALUE in .env"
        fi
      done
    else
      echo " ❌: Please set the missing environment variables manually."
      exit 1
    fi
  else
    echo " ✅: All required environment variables are already set in .env."
  fi
}

# check if all required Docker containers are running
function check_application {
  echo -e "\nChecking if required containers are running..."

  # Array of required container names
  CONTAINERS=("$DB_CONTAINER_NAME" "$FE_CONTAINER_NAME" "$BE_CONTAINER_NAME")

  # Variable to track whether all containers are running
  ALL_RUNNING=true

  for container in "${CONTAINERS[@]}"; do
    if ! docker ps | grep "$container" > /dev/null 2>&1; then
      echo " ❌: Container $container is NOT running."
      ALL_RUNNING=false
    else
      echo " ✅: Container $container is running."
    fi
  done

  # If any container is not running, prompt the user
  if [ "$ALL_RUNNING" = false ]; then
    echo -e "\nERROR: One or more containers are not running. Have you tried running 'docker-compose up'?"
    exit 1
  fi
}

# validate email format
function validate_emails {
  echo -e "\nValidating email(s)..."
  for email in "${EMAILS[@]}"; do
    if [[ ! $email =~ $EMAIL_REGEX ]]; then
      echo " ❌: Invalid email format: $email"
      exit 1
    fi
  done
  echo -e " ✅: All emails are valid.\n"
}

# seed database with emails
function seed_emails {
  if [ ${#EMAILS[@]} -eq 0 ]; then
    echo -e "\nERROR: No email(s) provided to seed the database."
    exit 1
  fi

  validate_emails
  
  echo -e "Seeding admin with email(s):"
  for email in "${EMAILS[@]}"; do
    echo -e " 🌱: $email"
  done  

  # run the npm command with .env for the seed-admins script
  npm run seed-admins -- --admin "${EMAILS[*]}"
}

# seed database with data
function seed_data {
  # if -b flag is used, we only need the first email
  if [ ${#EMAILS[@]} -lt 1 ]; then
    echo -e "\nERROR: Data seeding requires at least one email for roster setup."
    exit 1
  fi

  validate_emails

  echo -e "Seeding database with general data and email: \n 🌱: ${EMAILS[0]}"
  # TODO: seed general data into db using the provided single email
  npm run seed-data -- --email "${EMAILS[0]}"
}

# display help information
function display_help {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -e \"email(s)\"   Seed the database with the provided emails."
  echo "  -d \"email\"      Seed the database with general data. Requires exactly one email."
  echo "  -b \"email(s)\"   Seed the database with both emails and general data, using the first email for data."
  echo "  -h              Display this help message."
  echo ""
  echo "Examples:"
  echo "  $0 -e email1@example.com email2@example.com"
  echo "      Seed only the database with emails."
  echo "  $0 -d email@example.com"
  echo "      Seed only the database with general data, using the provided email."
  echo "  $0 -b email1@example.com email2@example.com"
  echo "      Seed the database with both emails and general data, using the first email for data."
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
        echo "WARNING: Invalid usage of -$OPTARG. Use -h for help."
        exit 1
        ;;
    esac
  done

  # shift the parsed options to get the remaining positional arguments
  shift $((OPTIND - 1))

  # capture remaining arguments as additional emails if -e or -b is specified
  if [ "$SEED_EMAILS" = true ] || [ "$SEED_DATA" = true ]; then
    EMAILS+=("$@")
  fi

  # check environment variables
  check_env_vars

  # check if we need to seed emails, data, or both
  if [ "$SEED_EMAILS" = true ] || [ "$SEED_DATA" = true ]; then
    # check if the application containers are running
    check_application
    
    # run the appropriate seeding functions
    if [ "$SEED_EMAILS" = true ]; then
      seed_emails
    fi
    
    if [ "$SEED_DATA" = true ]; then
      EMAILS=("${EMAILS[0]}")
      seed_data
    fi
  fi
}

main "$@"
