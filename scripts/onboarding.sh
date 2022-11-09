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
brew install watchman
brew install node@16

# For iOS / React Native
curl -sSL https://get.rvm.io | bash -s stable --ruby
source ~/.zshrc
source ~/.bash_profile
rvm install 2.7.5
rvm use 2.7.5 --default

if [[ $(command -v code) == "" ]]; then
 brew install visual-studio-code
fi

# Yarn
npm install -g yarn
npm install -g vercel
corepack enable

# Developer tools
if [[ $(command -v xcode-select) == "" ]]; then
 xcode-select --install
fi

# Install frontend deps
cd frontend
yarn install

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
