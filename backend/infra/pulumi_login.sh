#! /bin/sh

read -p "AWS profile name? (in ~/.aws/config): " profileName
export AWS_PROFILE=$profileName AWS_REGION=us-east-1

# Set the right pulumi stack
read -p "Environment? (dev/prod): " enviro
case $enviro in 
	dev ) ;;
	prod ) ;;
	* ) echo "invalid environment selected";
		exit 1;;
esac

aws sts get-caller-identity || aws sso login
echo "Logged in! Ensure this is the right account."

echo "Selected $enviro"

# do the pulumi config
export PULUMI_SKIP_UPDATE_CHECK=1

pulumi login "s3://footprint-pulumi-state-$enviro"
pulumi stack select $enviro
