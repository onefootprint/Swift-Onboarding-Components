This Terraform module manages the resources in the Footprint external testing account (account ID `992382496642`) used for testing Vault Disaster Recovery (VDR) cross-account AWS features.

The bucket & IAM config roughly matches the example Terraform in the [VDR documentation](https://onefootprint.notion.site/Preview-Vault-Disaster-Recovery-Docs-984ca46774a943acbaad622fb9148799).

The `Justfile` contains Terraform helper like `just plan` and `just apply`. Install `just` with `brew install just`.
