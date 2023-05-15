#!/usr/bin/env sh

# ------------- Start of Script -------------

## ------------- Global Variables -------------

file_changed_count=0
files=$(git diff --name-only HEAD)
for arg in "$@"; do
    case $arg in
        -a|--all)
            files=$(find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" ! -path "*/.prettierignore")
            ;;
    esac
done

## ------------- Install Prettier -------------

if ! command -v prettier > /dev/null; then
    echo "Installing prettier..."
    npm i -g prettier
    echo -e "Successfully installed prettier!\n"
else
    echo -e "Prettier is already installed.\n"
fi

## ------------- Prettify files -------------

if [ "${#files[@]}" -eq 0 ]; then
    echo "No files to prettify"
    exit 1
else
    echo -e "Prettifiying all .ts, .tsx, .js, .jsx files...\n"
fi

for file in $files; do
    if [[ "$file" == *.js ]] || [[ "$file" == *.jsx ]] || [[ "$file" == *.ts ]] || [[ "$file" == *.tsx ]]; then
        prettier --write --ignore-path .prettierignore "$file"
        file_changed_count=$((file_changed_count+1))
    fi
done

echo -e "\nPrettified ${file_changed_count} files"


# ------------- End of Script -------------



