#!/bin/bash
echo "We'll fetch all the env variables for you"

if [[ $(command -v vercel) == "" ]]; then
    echo "Installing Vercel..."
    npm install -g vercel
fi

# Log in to Vercel
vercel whoami

yarn set:dot-env

echo "You're ready to go 🕺💃"
