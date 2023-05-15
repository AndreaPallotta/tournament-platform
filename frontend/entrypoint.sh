#!/bin/sh

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

# ------------- Create .env File -------------

file=".env"

echo "# All env variables MUST start with 'VITE_'" > $file

append_to_file $file "VITE_APP_NAME" "Aardvark Tournaments"
append_to_file $file "VITE_APP_HOST" "localhost"
append_to_file $file "VITE_APP_PORT" "8000"
append_to_file $file "VITE_API_HOST" "localhost:5000/api"

echo
echo ".env created successfully."

npm rebuild esbuild

exec "$@"