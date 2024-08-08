IMG_CACHE_ACCOUNT_ID := 953430990672
CURRENT_ACCOUNT_ID := $$(aws sts get-caller-identity --query Account --output text)

.PHONY: enclave_ami_dev
enclave_ami_dev: RELEASE_ENV=dev
enclave_ami_dev: enclave_ami

.PHONY: enclave_ami_prod
enclave_ami_prod: RELEASE_ENV=prod
enclave_ami_prod: enclave_ami

.PHONY: enclave_ami
enclave_ami:
	@echo "Current Account ID: $(CURRENT_ACCOUNT_ID)"
	@if [ "$(IMG_CACHE_ACCOUNT_ID)" != "$(CURRENT_ACCOUNT_ID)" ]; then \
		echo "Please only build AMIs using the Image Cache account ($(IMG_CACHE_ACCOUNT_ID))"; \
		exit 1; \
	fi

	packer init enclave.pkr.hcl
	packer build \
		-var commit_sha=$(shell git describe --match="" --always --abbrev=40 --dirty) \
		-var release_env=$(RELEASE_ENV) \
		enclave.pkr.hcl

