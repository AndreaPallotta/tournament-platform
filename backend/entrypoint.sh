#!/usr/bin/env sh

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

## ------------- Start of Script -------------

echo -e "\n========= Environment setup phase terminated. =========\n"

file=".env"
AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(256).toString('base64'));")
REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(256).toString('base64'));")
DATABASE_URL="mongodb+srv://teamnyc:ISTE501.2023@gametournament.c06nv1u.mongodb.net/game_database?retryWrites=true&w=majority"


echo "# Default variables" > $file

append_to_file $file "PORT" "5000"
append_to_file $file "HOST" "localhost"
append_to_file $file "AUTH_SECRET" "$AUTH_SECRET"
append_to_file $file "REFRESH_SECRET" "$REFRESH_SECRET"
append_to_file $file "DATABASE_URL" "$DATABASE_URL"

echo >> $file
echo "# Add additional variables down here" >> $file

echo "$file created with default content."

echo -e "\n========= Environment phase terminated. =========\n"

# ------------- End of Script -------------

exec "$@"