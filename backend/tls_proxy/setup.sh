#!/bin/sh

# install needed things
brew install tailscale jq
npm install -g local-ssl-proxy

# setup our proxy file
cp local_proxy.json.example local_proxy.json