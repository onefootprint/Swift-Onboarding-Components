## About

This folder defines the infra needed to setup the infra.

Currently it does the following:

- pulumi role/user used for CI/CD.
- provisioning the github env action secrets for deploying to the env

## State

- dev: `pulumi login "s3://footprint-infra-setup-pulumi-dev"`
- prod: `pulumi login "s3://footprint-infra-setup-pulumi-prod"`

## How to use

Admins run via `pulumi up` _manually_ after logging into AWS with `aws sso login` with admin permissions (see `/infra/aws_login.sh`).

## Config secrets

Uses an AWS KMS key on the associated account: awskms://alias/pulumi_infra_global_config?region=us-east-1
(alias same across both dev/prod).
