#!/bin/bash

# Define the source and destination directories relative to the script's directory
SOURCE_DIR="./src/dockerfiles"
DEST_DIR="./dist/dockerfiles"

# Install dependencies
npm install

# Build the application
npm run build

# Check if the source directory for docker-compose.yml files exists
if [ ! -d "$SOURCE_DIR" ]; then
  echo "Source directory $SOURCE_DIR does not exist."
  exit 1
fi

# Create the destination directory if it does not exist
mkdir -p "$DEST_DIR"

# Copy the files from the source directory to the destination directory
cp -r "$SOURCE_DIR"/* "$DEST_DIR"

# Start the application
npm start
