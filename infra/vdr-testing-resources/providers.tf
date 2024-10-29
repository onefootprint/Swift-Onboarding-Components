terraform {
  backend "s3" {
    bucket         = "footprint-cross-account-testing-tf"
    key            = "vdr-testing-resources/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "footprint-cross-account-testing-tf"
  }
}

provider "aws" {
  region              = "us-east-1"
  allowed_account_ids = ["992382496642"]
}

data "aws_caller_identity" "current" {}

data "aws_partition" "current" {}

data "aws_region" "current" {}
