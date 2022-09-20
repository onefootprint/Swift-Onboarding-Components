#!/bin/bash

echo "----------------------------------------------"
echo "----------- Welcome to Footprint 👣 ----------"
echo "----------------------------------------------"
echo "We'll install all the dependencies required 📦"
echo "----------------------------------------------"


# Install Homebrew
if [[ $(command -v brew) == "" ]]; then
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Useful packages
brew update
brew install openssl
brew install postgresql@14
brew install awscli
brew install jq
brew install wget

if [[ $(command -v code) == "" ]]; then
 brew install visual-studio-code
fi

brew install node@16

# Yarn
corepack enable
npm install -g yarn
npm install -g vercel

# Developer tools
if [[ $(command -v xcode-select) == "" ]]; then
 xcode-select --install
fi

## Set github user name and email
echo 'Setting up github config:'
read -p "Enter your full name: " gitname
read -p "Enter your Footprint email address: " gitemail
cat <<EOF >> ~/.bash_profile

# Git config
git config --global --add color.ui true
git config --global --add color.diff true
git config --global user.name "$gitname"
git config --global user.email "$gitemail"
git config --global core.editor "code --wait"
EOF

echo "You're ready to go 🕺💃"
