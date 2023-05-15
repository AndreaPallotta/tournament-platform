#!/usr/bin/env bash

# ------------- Variables -------------

PARENT_DIR=$(dirname "$(dirname "$0")")
FRONTEND_DIR=$(find $PARENT_DIR -name "frontend" -type d | awk 'NR==1')
BACKEND_DIR=$(find $PARENT_DIR -name "backend" -type d | awk 'NR==1')

# ------------- Functions -------------

append_to_file() {
    local file="$1"
    local key="$2"
    local value="$3"
    local comment="$4"

    if [ -z "$file" ] || [ -z "$key" ] || [ -z "$value" ]; then
        echo "Error. Missing arguments" >&2
        return 1
    fi

    if [ -n "$comment" ]; then
        echo "$key=$value # $comment" >> $file
    else
        echo "$key=$value" >> $file
    fi
}

npm_run() {
    local command="$1"
    local DIR="$2"

    if [ -z "$command" ]; then
        echo "Error. Missing argument: command" >&2
        return 1
    fi

    if [ -z "$DIR" ]; then
        echo "No directory specified. Running $command..."
        $command > /dev/null
    elif [ ! -d "$DIR" ]; then
        echo "Directory specified but $DIR does not exist"
        return 1
    else
        echo "Directory specified. Running $command in ${DIR#.}..."
        cd $DIR && $command > /dev/null
    fi

    echo "Finished running $command"
    echo
}

get_aws_keys() {
    local file="$PARENT_DIR/scripts/api-to-s3_accessKeys.csv"
    local keys=()
    IFS=',' read -ra keys <<< "$(awk 'NR==2 {print $1,$2}' $file)"

    if test -f "$file"; then
        echo "${keys[@]}"
    else
        return 1
    fi
}

create_frontend_env_file() {
    local file="$1/.env"

    echo "# All env variables MUST start with 'VITE_'" > "$file"

    append_to_file $file "VITE_APP_NAME" "Aardvark Tournaments"
    append_to_file $file "VITE_APP_HOST" "localhost"
    append_to_file $file "VITE_APP_PORT" "8000"
    append_to_file $file "VITE_API_HOST" "localhost:5000"
}

create_backend_env_file() {
    local file="$1/.env"
    local keys=($(get_aws_keys))

    local AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(256).toString('base64'));")
    local REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(256).toString('base64'));")
    local AWS_DEFAULT_REGION="us-east-1"
    local AWS_ACCESS_KEY_ID=${keys[0]}
    local AWS_SECRET_ACCESS_KEY=${keys[1]}

    if [[ -z "$DATABASE_URL" ]]; then
        DATABASE_URL="mongodb+srv://teamnyc:ISTE501.2023@gametournament.c06nv1u.mongodb.net/game_database?retryWrites=true&w=majority"
    fi

    echo "# Default variables" > $file

    append_to_file $file "NODE_ENV"                 "$NODE_ENV"
    append_to_file $file "PORT"                     "5000"
    append_to_file $file "HOST"                     "localhost"
    append_to_file $file "AUTH_SECRET"              "$AUTH_SECRET"
    append_to_file $file "REFRESH_SECRET"           "$REFRESH_SECRET"
    append_to_file $file "DATABASE_URL"             "$DATABASE_URL"
    append_to_file $file "INCLUDE_DOTENV"           "true"
    append_to_file $file "AWS_DEFAULT_REGION"       "$AWS_DEFAULT_REGION"
    append_to_file $file "AWS_ACCESS_KEY_ID"        "$AWS_ACCESS_KEY_ID"
    append_to_file $file "AWS_SECRET_ACCESS_KEY"    "$AWS_SECRET_ACCESS_KEY"
}

# ------------- Start of Script -------------

export SKIP_INSTALL=false
export NODE_ENV=development

for arg in "$@"; do
    case $arg in
        -s|--skip)
            export SKIP_INSTALL=true
            ;;
    esac
done

if [ "$SKIP_INSTALL" = true ]; then
    echo "Creating frontend .env..."

    create_frontend_env_file "$FRONTEND_DIR"

    echo "Frontend .env created successfully!"
    echo
    echo "Creating backend .env..."

    create_backend_env_file "$BACKEND_DIR"

    echo "Backend .env created successfully!"

    exit 0
fi

export NODE_ENV=development

echo -e "\n========= Global npm installation phase started. =========\n"

nx=$(npm list -g | grep -o "nx@")
if [ -n "$nx" ]; then
    echo "nx already installed. Skipping."
else
    echo "Installing nx..."
    npm i -g nx > /dev/null
    npm i -g @nrwl/workspace > /dev/null
    echo "nx installed successfully."
fi

concurrently=$(npm list -g | grep -o "concurrently@")
if [ -n "$concurrently" ]; then
    echo "concurrently already installed. Skipping."
else
    echo "Installing concurrently..."
    npm install -g concurrently concurrently > /dev/null
    echo "concurrently installed successfully."
fi

echo -e "\n========= Global npm installation phase terminated. =========\n"

echo -e "\n========= Local npm installation phase started. =========\n"

(npm_run "npm i" "$FRONTEND_DIR" )
(npm_run "npm i" "$BACKEND_DIR" )

echo "Successfully installed npm packages."
echo -e "\n========= Local npm installation phase terminated. =========\n"

# ------------- End of File -------------

exit 0