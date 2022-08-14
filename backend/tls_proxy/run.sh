#!/bin/sh

# config
myname=$(tailscale status --json | jq -r .'["Self"]["HostName"]' )
dns="${myname}.tuxedo-bull.ts.net"

echo "I am ${dns}"

# get certs
tailscale cert --cert-file local.crt --key-file local.key "${dns}" 

# run the proxy
local-ssl-proxy --hostname ${dns} --key local.key --cert local.crt --config local_proxy.json