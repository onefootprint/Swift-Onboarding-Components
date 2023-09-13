#!/bin/sh

read -p "AWS profile name? (in ~/.aws/config): " profileName
export AWS_PROFILE=$profileName AWS_REGION=us-east-1

aws sts get-caller-identity || aws sso login
echo "Logged in! Ensure this is the right account."

read -p "Tailscale auth key? " tsKey

read -p "Who is this devbox for? " username
hostname="$username-devbox"

cat >> /tmp/udata <<EOF
#!/bin/bash

apt-get update
apt-get install -y --no-install-recommends curl wget gnupg2 jq sudo zsh vim build-essential openssl ca-certificates

curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/jammy.noarmor.gpg | sudo tee /usr/share/keyrings/tailscale-archive-keyring.gpg >/dev/null
curl -fsSL https://pkgs.tailscale.com/stable/ubuntu/jammy.tailscale-keyring.list | sudo tee /etc/apt/sources.list.d/tailscale.list
sudo apt-get update
sudo apt-get install -y tailscale

sudo systemctl enable --now tailscaled
sudo tailscale up --authkey $tsKey --ssh --hostname ${hostname}

EOF

# 16 CPU 32g RAM
instanceType="c5a.4xlarge"
# ubuntu 22.04
ami="ami-053b0d53c279acc90"
storage="512"

aws ec2 run-instances \
    --image-id $ami \
    --instance-type $instanceType \
    --security-groups "devbox" \
    --user-data file:///tmp/udata  \
    --ebs-optimized \
    --key-name "Alex_EC2" \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$hostname}]" "ResourceType=volume,Tags=[{Key=Name,Value=$hostname}]" \
    --enclave-options "Enabled=true" \
    --block-device-mappings "DeviceName=/dev/sda1,Ebs={VolumeSize=512,Encrypted=true}"

rm /tmp/udata