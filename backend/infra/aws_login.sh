#! /bin/sh

read -p "AWS profile name? (in ~/.aws/config): " profileName
export AWS_PROFILE=$profileName AWS_REGION=us-east-1

aws sso login
echo "Logged in as: $(aws sts get-caller-identity)"