# footprint-core

## Pre-requisites
If running Mac OSX, I recommend using [homebrew](https://brew.sh/) for package installation and management.

1. Install [pulumi](https://www.pulumi.com/docs/get-started/install/). With homebrew, run `$ brew install pulumi`
2. Install [docker](https://docs.docker.com/desktop/mac/install/) With homebrew, `$ brew install docker`
3. Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html). With homebrew `$ brew install awscli`
4. Generate your pulumi credentials in the AWS Console
    a. Log in to the AWS Management console via (Rippling)[https://www.rippling.com/] using Single Sign On for Amazon
    b. Navigate to Services -> Security, Identity, & Compliance -> IAM 
    c. Click "users" on the left hand sidebar
    d. Generate a new pulumi user (yourname_pulumi). No need to add tags or anything, just copy the permissions from an existing user
    e. Use $ aws configure and enter your access key and secret access key. I had trouble reading credentials I configured using $ aws configure, so I would also recommend setting your AWS_ACCESS_KEY_ID annd AWS_SECRET_KEY environment variables
5. Log in to [pulumi](pulumi.com) with github (make sure to use the account linked to the footprint organization). Generate an access token under your profile picture -> settings -> access tokens. Then run `$ pulumi login` and paste in the access token you generated to authenticate 
6. Make sure you've upgraded node, then:
``` $ cd infra
    $  npm install -g npm@latest
```

## Building the project

Pulumi has a concept of "stacks." A stack can be dev, prod, staging, etc. When you create a branch, it copies the dev stack and creates a new stack with dev-<branchname>. 

Working on a new feature, you could:
1. Open up a pull request -> the test stack will automatically generated. 
2. Create

