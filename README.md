# footprint-core

## Pre-requisites
If running Mac OSX, I recommend using [homebrew](https://brew.sh/) for package installation and management. Also make sure your Mac is up to date by checking for software updates under "System Preferences." 

1. Install [pulumi](https://www.pulumi.com/docs/get-started/install/). With homebrew, run `$ brew install pulumi`
2. Install [docker](https://docs.docker.com/desktop/mac/install/) With homebrew, `$ brew install docker`
3. Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html). With homebrew `$ brew install awscli`
4. Generate your pulumi credentials in the AWS Console
    a. Log in to the AWS Management console via (Rippling)[https://www.rippling.com/] using Single Sign On for Amazon
    b. Navigate to Services -> Security, Identity, & Compliance -> IAM 
    c. Click "users" on the left hand sidebar
    d. Generate a new pulumi user (yourname_pulumi). No need to add tags or anything, just copy the permissions from an existing user
    e. Run `$ aws configure` and enter your access key and secret access key to configure your aws profile. Pulumi had trouble reading credentials I configured using the aws CLI, so I would also recommend setting your AWS_ACCESS_KEY_ID annd AWS_SECRET_KEY environment variables
5. Log in to [pulumi](pulumi.com) with github (make sure to use the account linked to the footprint organization). Generate an access token under your profile picture -> settings -> access tokens. Then run `$ pulumi login` and paste in the access token you generated to authenticate 
6. Make sure you've upgraded node, then:
``` $ cd infra
    $  npm install -g npm@latest
```
7. You should be ready to start building this project!

## Testing new features

If you want to develop and test a new feature, and need to build the infrastructure to do so, you have two options. 

1. Open up a pull request against the footprint-core repo from your feature branch. When you PR the footprint-core repo, a [pulumi stack](https://www.pulumi.com/docs/intro/concepts/stack/) will be automatically spun up and infrastructure will be deployed there.
2. Run pulumi locally to build the test stack. After logging in to pulumi (see step 5 of prerequisites) you can manually build a new stack

```
# Copy infra config to properly named file
$ cp Pulumi.dev.yaml Pulumi.${{ stackName }}.yaml

# Create new dev stack
$ pulumi stack init --secrets-provider awskms://4e61ea01-1193-475e-82ee-e9639743efd6?region=us-east-1 \ --copy-config-from "footprint/dev" "footprint/${{ stackName }}"

# Select your new dev stack for infra deployment
$ pulumi stack select footprint/${{ stackName }}

# Deploy infrastructure to stack
$ pulumi up

# Tear down infrastructure after use
$ pulumi down

```

## Building the enclave

## Accessing Logs & Metrics