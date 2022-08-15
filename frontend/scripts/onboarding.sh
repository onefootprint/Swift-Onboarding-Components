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
brew install jq
brew install wget
brew install visual-studio-code
brew install node@16

# Yarn
corepack enable
npm install -g yarn

brew install pnpm

# Developer tools
xcode-select --install

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
