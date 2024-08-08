packer {
  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = ">= 1.3.2"
    }

    ansible = {
      version = "~> 1"
      source  = "github.com/hashicorp/ansible"
    }
  }
}

variable "commit_sha" {
  type = string
}

variable "release_env" {
  type    = string
  default = "dev"
}

locals {
  instance_type = "c5a.xlarge"

  # Resource requests tuned to instance type.
  enclave_cpu_count            = 2
  enclave_allocator_memory_mib = 4096
  # nitro-cli doesn't let you take all the RAM you ask for from the allocator.
  # Perhaps it counts the size of the binary and other things that the
  # enclave needs against you. So, we subtract off some overhead in our
  # memory request.
  enclave_overhead_mib       = 256
  enclave_request_memory_mib = local.enclave_allocator_memory_mib - local.enclave_overhead_mib
}

source "amazon-ebs" "amazon-linux" {
  ami_name      = format("enclave_%s_%s_%s_{{timestamp}}", local.instance_type, var.release_env, var.commit_sha)
  instance_type = local.instance_type
  region        = "us-east-1"

  source_ami_filter {
    filters = {
      name                = "al2023-ami-*-kernel-*-x86_64"
      architecture        = "x86_64"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    owners      = ["amazon"]
    most_recent = true
  }

  ssh_username = "ec2-user"
  imds_support = "v2.0"

  tags = {
    CommitSha  = var.commit_sha
    Timestamp  = "{{timestamp}}"
    ReleaseEnv = var.release_env
  }

  ami_users = var.release_env == "prod" ? [
    # Share the released AMI with dev & prod.
    "800859428444", # dev
    "725896863556", # prod
    ] : [
    # Share the pre-release AMI with only dev.
    "800859428444", # dev
  ]
}

build {
  name = "enclave"
  sources = [
    "source.amazon-ebs.amazon-linux"
  ]

  provisioner "ansible" {
    playbook_file = "enclave.yml"
    extra_arguments = [
      "--extra-vars", jsonencode({
        enclave_cpu_count            = local.enclave_cpu_count
        enclave_allocator_memory_mib = local.enclave_allocator_memory_mib
        enclave_request_memory_mib   = local.enclave_request_memory_mib
      })
    ]
  }

  post-processor "manifest" {
    output = "manifest.json"
  }
}

