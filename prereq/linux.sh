#!/bin/bash

# Defined versions
git_version="2.39.1"
nodejs_version="18.13.0"
npm_version="9.3.1"
conc_version="7.8.0"
nx_version="15.5.2"

# CHeck git version
git_installed_version=$(git --version | awk '{ print $3 }')
if [[ "$git_installed_version" != "$git_version" ]]; then
  echo "Updating git to version $git_version..."
  sudo apt update
  sudo apt install git
  echo "Git version $git_version installed."
else
  echo "Git version $git_version is installed."
fi

echo

# Check node version
nodejs_installed_version=$(node -v | awk '{ print $1 }')
if [[ "$nodejs_installed_version" != "v$nodejs_version" ]]; then
  echo "Updating Nodejs to version $nodejs_version..."
  curl -sL https://deb.nodesource.com/setup_$nodejs_version | sudo -E bash -
  sudo apt-get install -y nodejs
  echo "Nodejs version $nodejs_version installed."
else
  echo "Nodejs version $nodejs_version is installed."
fi

echo

# Check npm version
npm_installed_version=$(npm -v)
if [[ "$npm_installed_version" != "$npm_version" ]]; then
  echo "Updating npm to version $npm_version..."
  npm install -g npm@$npm_version
  echo "npm version $npm_version installed."
else
  echo "npm version $npm_version is installed."
fi

echo

# Check concurrently version
conc_installed_version=$(concurrently -v)
if [[ "$conc_installed_version" != "$conc_version" ]]; then
  echo "Updating concurrently to version $conc_version..."
  npm install -g concurrently@$conc_version
  echo "concurrently version $conc_version installed."
else
  echo "concurrently version $conc_version is installed."
fi

echo

# Update nx version
echo "Updating nx to version $nx_version..."
npm install -g nx@$nx_version
echo "nx version $nx_version installed."

echo
echo "All prerequisites are up to date"