# Development

## Dependencies

You'll need `openssl` and `postgres` to run the code locally.

```sh
brew install openssl
brew install postgresql@14
```

Install Rust:

- Instructions here: https://rustup.rs

## Get AWS credentials

AWS creds are used along with Pulumi (see below) and also for encrypting/decrypting the local development .env file

1. You'll need the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html). With homebrew `$ brew install awscli`
2. Setup your AWS Profile

```bash
aws configure sso
```

Use the following configuration values:

```
SSO start URL [None]: https://onefootprint.awsapps.com/start
SSO Region [None]: us-east-1
```

You will then be asked to assume a role: you will want to select the dev role.
(if you have access, a role to modify production secrets in the `Pulumi.prod.yaml` file will also be present).

You will then see some more options, set a profile name like `dev`:

```
The only role available to you is: XYZ
Using the role name "XYZ"
CLI default client Region [us-east-1]:
CLI default output format [None]:
CLI profile name [XYZ-800859428444]: dev
```

This will configure an aws profile for you: `cat ~/.aws/config`.

Finally make sure you tell aws about the profile:

```
export AWS_PROFILE=dev
```

Note: this session will expire after some time. To refresh your credentials, do:

```bash
aws sso login
```

## Local development

First, get your .env file setup. This is stored encrypted in git. To decrypt it, make sure you have AWS creds above, and run the following from `backend/`:

```sh
make set-dot-env
```

Next, ensure your postgres is running

- run `createdb footprint_db` (e.g. the last part of the `DATABASE_URL` from your `.env`. Ensure this works by running `psql -d footprint_db`.

To run the server:

```sh
make run-local
```

Under the hood this runs a local enclave and the `api_server` api server:

```sh
# starts up the local simulated enclave for encryption/decryption
cargo run -p enclave

# runs the api crate
cargo run -p api_server
```

### Faster local development

If you'd like to not have to manually restart the server process when you make changes, you can use this fancy [cargo-watch](https://crates.io/crates/cargo-watch) crate.

Install it with

```bash
cargo install cargo-watch
```

Then, you can start a watcher that will continuously compile and restart your server process as you make code changes.

```bash
make watch-local
```

## Nitro testing

Note: the enclave in production is a Nitro Enclave and is only reachable via `VSOCK` -- secure linux tunnels. If testing on an EC2 machine with the enclave loaded into the Nitro Enclave, test locally by adding the `vsock` feature for `api_server` and the `nitro` feature for `enclave`:

```
# build the enclave for use within the Nitro Enclave
cargo build -p enclave --features nitro

# build the enclave-proxy to communicate to the Nitro Enclave
cargo run -p enclave_proxy --features vsock

# runs the api crate in vsock mode, assuming the binary in the previous step is loaded into the Nitro Enclave
cargo run -p api_server
```

## Pulumi setup (for infra managment only)

Pulumi is our infra-as-code framework. All of the pulumi code is in /infra. For development, you'll interact with pulumi directly if you're adding/modifying config variables or secrets, if you're modifying infrastructure, or if you're building an ephemeral environment/stack.

1. Install [pulumi](https://www.pulumi.com/docs/get-started/install/). With homebrew, run `$ brew install pulumi`
2. Install [docker](https://docs.docker.com/desktop/mac/install/) With homebrew, `$ brew install docker`
3. Ensure you have completed the AWS credentials setup above
4. Log in to [pulumi](pulumi.com) with github (make sure to use the account linked to the footprint organization). Generate an access token under your profile picture -> settings -> access tokens. Then run `$ pulumi login` and paste in the access token you generated to authenticate
5. Make sure you've upgraded node, then:

```
    $ cd infra
    $ npm install -g yarn
```

6. `cd infra && yarn install`
   You now should be able to deploy ephemeral environments of the entire stack!

### Local ephemeral infrastructure build

If you want to develop and test a new feature, and need to build the infrastructure to do so, you have two options.

1. Open up a pull request against the api_server repo from your feature branch. When you PR the api_server repo, you can add the `ephemeral` label to the PR in order to spin up a [pulumi stack](https://www.pulumi.com/docs/intro/concepts/stack/) - infrastructure will be deployed there.
2. Run pulumi locally to build the test stack. After logging in to pulumi (see step 5 of prerequisites) you can manually build a new stack

```
# make sure you're on a feature branch
$ git checkout -b my-feature

# spin up an ephemeral stack
$ cd infra/ && ./ephemeral-dev.sh

# Deploy infrastructure to stack
$ pulumi up

# Tear down infrastructure after use
$ pulumi down
```

### Adding pulumi secrets

We use pulumi secrets to help us manage sensitive information we need to run our application. For instance, we have various AWS credentials stored in pulumi secrets, that are then added to our application environment for use.

To add a secret to pulumi, do the following:

```sh
$ cd infra/
$ pulumi --stack footprint/dev config set --secret --path <SECRET_NAME> <SECRET_VALUE?
$ pulumi --stack footprint/prod config set --secret --path <SECRET_NAME> <SECRET_VALUE?
```

For example

```sh
$ AWS_PROFILE=dev pulumi --stack footprint/dev config set --secret --path constants.grafana.apiKey 'mySecretValue'
```

You can similarly read existing secret values with

```
$ AWS_PROFILE=dev pulumi --stack footprint/dev config get --path constants.grafana.apiKey
```

- To add the secret to the container environment, first edit secrets.ts to add your new secret to StaticSecrets. Then, go to container.ts in the /infra/service directory and add your new secret following the existing structure to the containerDef.

- When pulumi runs, it will now add your secrets to the container environment! To read them in to the application, you get edit config.rs and main.rs in the api crate.

## Database Schema + Migrations

First, install diesel CLI:

- Note that we specifically need version 1.4.1. Newer versions will make strange changes to some of the postgres types.
  `$ cargo install diesel_cli --no-default-features --features postgres --version 1.4.1`

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

The aurora DB cluster is not accessible to the public internet, but you may need to access it for some read-only querying or to migrate/wipe the DB. So, we've set up a [jumpbox to access the DB](./backend/infra/db.ts).

Here's how to get talking to the DB:

1. We'ved installed [Tailscale](https://tailscale.com) on the jumpbox to make it accessible to your laptop. You'll need to install the macOS Tailscale app from the app store. Sign into Tailscale with Google and use your footprint email. Ping @Alex to give you access to the network.

2. Once Tailscale is installed and you're added to the Tailscale team, you'll see the logo in your macOS menu bar. Navigate to Network devices > Tagged devices > select jump-db-dev. This will copy the jump box's IP to your clipboard. You'll also see a jump box here for any ephemeral environments that you've spun up in GitHub PRs.

3. We use Tailscale SSH so you need no credentials aside from your tailscale login!
4. Now, you have the credentials and the IP. Open a shell **warning -- tailscale ssh does not work with the Warp terminal, there is currently a bug. Use a different shell** on the jumpbox with and pop a psql shell:

```bash
$ ssh ec2-user@jumpbox-dev
$ /connect_db.sh
```

Note: replace `jumpbox-dev` with `jumpbox-<ENV_NAME_HERE>`

## Using Diesel CLI on dev/dev-ephemeral DB

If you need to run local diesel commands against a deployed db environment, get the database url from the jumpbox and just use that with `psql`. It will work because of Tailscale magic route advertising.

## Wiping a db

```
psql -h <DBHOST> -d postgres -U footprint
# enter the DB password

select pg_terminate_backend(pid) from pg_stat_activity where query not like '%pg_stat_activity%' and usename='footprint';

ALTER DATABASE footprint RENAME TO footprint_old;

CREATE DATABASE footprint;
```

## Running integration tests

We have [integration tests](./ci/integration_tests.py) for the most common API flows. They are written in python using pytest. They run consecutively and store some state variables in the `request.config`, which is passed from test to test - therefore, they are required to all be executed in series.

These integration tests will run on every PR that builds an ephemeral environment. But, you can also run them locally!

Let's get a python virtual environment with the correct version of python set up on your Mac.

1. Install pyenv to help us easily control the python version. We'll use python 3.9.11. Inside of the api_server folder, pyenv will magically redirect the `python3` alias to run this version of python.

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
TEST_URL="http://localhost:8000" pytest -x ci/tests
```

## Accessing Logs & Metrics

We run a side car that exports logs, telemtry, and tracing to elastic cloud.
Link: https://onefootprint.kb.us-east-2.aws.elastic-cloud.com:9243/app/discover
(Ask @agrinman for access if you need it, login via google SSO @onefootprint.com)
