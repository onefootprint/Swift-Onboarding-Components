# Footprint Core
This is footprint's core backend monorepo. This houses our main backend API crate, user vaults, tokenization service, enclave service, and the verification engine and their APIs. This repo also includes `/infra` which manages the full infra-as-code deployment using Pulumi on AWS.

![Infra Architecture-2](https://user-images.githubusercontent.com/356333/165533366-db6ad5f5-5d2f-4cb5-9869-06c3b816696f.png)

# Development
## Dependencies
You'll need `openssl` and `postgres` to run the code locally.

## Getting Pulumi + AWS credentials setup for deploying ephemeral stacks
1. Install [pulumi](https://www.pulumi.com/docs/get-started/install/). With homebrew, run `$ brew install pulumi`
2. Install [docker](https://docs.docker.com/desktop/mac/install/) With homebrew, `$ brew install docker`
3. Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html). With homebrew `$ brew install awscli`
4. Generate your pulumi credentials in the AWS Console
    - Log in to the AWS Management console via [Rippling](https://www.rippling.com/) using Single Sign On for Amazon
    b. Navigate to Services => Security, Identity, & Compliance => IAM 
    - Click "users" on the left hand sidebar
    - Generate a new pulumi user (yourname_pulumi). No need to add tags or anything, just copy the permissions from an existing user
    - Run `$ aws configure` and enter your access key and secret access key to configure your aws profile. Pulumi had trouble reading credentials I configured using the aws CLI, so I would also recommend setting your AWS_ACCESS_KEY_ID annd AWS_SECRET_KEY environment variables
5. Log in to [pulumi](pulumi.com) with github (make sure to use the account linked to the footprint organization). Generate an access token under your profile picture -> settings -> access tokens. Then run `$ pulumi login` and paste in the access token you generated to authenticate 
6. Make sure you've upgraded node, then:
``` 
    $ cd infra
    $ npm install -g yarn
```
7. `cd infra && yarn install`
You now should be able to deploy ephemeral environments of the entire stack!

## Local infrastructure build
If you want to develop and test a new feature, and need to build the infrastructure to do so, you have two options. 

1. Open up a pull request against the footprint-core repo from your feature branch. When you PR the footprint-core repo, you can add the `ephemeral` label to the PR in order to spin up a [pulumi stack](https://www.pulumi.com/docs/intro/concepts/stack/) - infrastructure will be deployed there.
2. Run pulumi locally to build the test stack. After logging in to pulumi (see step 5 of prerequisites) you can manually build a new stack

```
# Copy infra config to properly named file
$ cp Pulumi.dev.yaml Pulumi.${{ stackName }}.yaml

# Create new dev stack
$ pulumi stack init --secrets-provider awskms://4e61ea01-1193-475e-82ee-e9639743efd6?region=us-east-1 --copy-config-from "footprint/dev" "footprint/${{ stackName }}"

# Select your new dev stack for infra deployment
$ pulumi stack select footprint/${{ stackName }}

# Deploy infrastructure to stack
$ pulumi up

# Tear down infrastructure after use
$ pulumi down
```

## Codespaces development
On the repo, open `code -> new codespace`. You can develop in the browser or open in vscode locally. **This environment has all that you need to do development locally (including secrets)**. If you want to do pulumi/infra work make sure you set your personal pulumi creds in settings -> codespaces -> secrets so they are installed on the machine.

## Local development
First, ask another engineer for their `.env` file. It contains AWS secrets to simulate certain parts of the stack deployed app.
Next, ensure your postgres is running at you set your `DATABASE_URL` env. 

To run the core api crate:
```
# starts up the local simulated enclave for encryption/decryption
$ cargo run -p enclave --no-default-features --features simulate

# runs the api crate
$ cargo run -p footprint-core --no-default-features
```

## Database Schema + Migrations
First, install diesel CLI:
`$ cargo install diesel_cli --no-default-features --features postgres`

Next, to generate a new migration:
```
$ cd components/db/
$ diesel migration <generate my_new_migration_name>
```

Finally, run `up` and `down` and `up` again to make sure your migration works!
`$ diesel migration up`
`$ diesel migration down`
`$ diesel migration up`

## Accessing dev/dev-ephemeral DB
The aurora DB cluster is not accessible to the public internet, but you may need to access it for some read-only querying or to migrate/wipe the DB. So, we've set up a [jumpbox to access the DB](./infra/db.ts).

Here's how to get talking to the DB:
1. We'ved installed [Tailscale](https://tailscale.com) on the jumpbox to make it accessible to your laptop. You'll need to install the macOS Tailscale app from the app store. Sign into Tailscale with Google and use your footprint email. Ping @Alex to give you access to the network.

2. Once Tailscale is installed and you're added to the Tailscale team, you'll see the logo in your macOS menu bar. Navigate to Network devices > Tagged devices > select jump-db-dev. This will copy the jump box's IP to your clipboard. You'll also see a jump box here for any ephemeral environments that you've spun up in GitHub PRs.

3. Now, you need the credentials to ssh into jump box. The private key is [managed by pulumi](infra/Pulumi.dev.yaml). Make sure you've followed the steps above to log into pulumi locally, cd into the `infra` folder, and then run 
```bash
pulumi stack select footprint/dev
pulumi config get infra:jumpBoxSSHPrivateKey > .ssh/id_jumpbox
```

4. Now, you have the credentials and the IP. Open a shell on the jumpbox with and pop a psql shell:
```bash
ssh -i ~/.ssh/id_jumpbox -t ec2-user@100.123.36.143 "/connect_db.sh" 
```

## Running integration tests
We have [integration tests](./ci/integration_tests.py) for the most common API flows. They are written in python using pytest. They run consecutively and store some state variables in the `request.config`, which is passed from test to test - therefore, they are required to all be executed in series.

These integration tests will run on every PR that builds an ephemeral environment. But, you can also run them locally!

Let's get a python virtual environment with the correct version of python set up on your Mac.

1. Install pyenv to help us easily control the python version. We'll use python 3.9.11. Inside of the footprint-core folder, pyenv will magically redirect the `python3` alias to run this version of python.
```bash
brew install pyenv
pyenv install 3.9.11
pyenv local 3.9.11
```

2. Now, let's make a virtual environment for the python requirements needed to run tests
```bash
pip3 install venv
python3 -m venv ~/.virtualenvs/fpc
source ~/.virtualenvs/fpc/bin/activate
pip3 install -r ci/requirements.txt
```

3. Now, you're ready to run your integration tests locally! You can point them at either an ephemeral environment OR a server running locally. 
```
TEST_URL="http://localhost:8000" pytest -x ci/integration_tests.py
```

## Accessing Logs & Metrics
We run a side car that exports logs to elastic cloud. Ask @agrinman for access! Loging via google SSO @onefootprint.com

