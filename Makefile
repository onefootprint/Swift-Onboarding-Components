.PHONY: release debug
.DEFAULT_GOAL := debug

account := $(shell aws sts get-caller-identity --query "Account" --output text)
branch := $(shell git rev-parse --abbrev-ref HEAD | sed -r 's/\//-/g' | sed -r 's/_/-/g')
commit := "$(branch)-$(shell git rev-list HEAD --count)-$(shell git rev-list HEAD -1 | head -c 6)"


api-release:
	@echo "building release mode"
	@docker run -v "cargo-cache:/root/.cargo/registry" -v "${PWD}:/volume" --rm -t clux/muslrust:stable cargo build -p footprint-core --release
	@cp ./target/x86_64-unknown-linux-musl/release/footprint-core ./out/footprint-core

api-debug:
	@echo "building debug mode"
	@docker run -v "cargo-cache:/root/.cargo/registry" -v "${PWD}:/volume" --rm -t clux/muslrust:stable cargo build -p footprint-core
	@cp ./target/x86_64-unknown-linux-musl/debug/footprint-core ./out/footprint-core

build-enclave-docker:
	rm -f ./out/enclave

	@echo "building enclave"

	@docker run -v "cargo-cache:/root/.cargo/registry" -v "${PWD}:/build" --rm -t enclave_builder:latest cargo build --target=x86_64-unknown-linux-musl -p enclave --no-default-features --features nitro --release

	@cp ./target/x86_64-unknown-linux-musl/release/enclave ./out/enclave

	@docker build -f enclave.dockerfile -t enclave .

build-eif: build-enclave-docker
	rm -f ./out/enclave.eif

	@echo "building EIF"

	@nitro-cli build-enclave --docker-dir ./ --docker-uri enclave:latest --output-file ./out/enclave.eif --private-key ../enclavekey.pem --signing-certificate ../cert.pem

run-enclave-debug:
	@echo "running enclave [debug mode]"
	@nitro-cli run-enclave --eif-path ./out/enclave.eif --cpu-count 2 --memory 256 --enclave-cid 16 --debug-mode

run-enclave:
	@echo "running enclave"
	@nitro-cli run-enclave --eif-path ./out/enclave.eif --cpu-count 2 --memory 256 --enclave-cid 16

get-named-commit:
	@echo "$(commit)"

get-friendly-branch-name:
	@echo "$(branch)"

	
set-enclave-version:
	@pulumi --cwd infra config set --path constants.containers.enclaveVersion enclave_pkg:$(commit)	

package-enclave:	
	@echo "using account $(account)"
	@echo "create image tagged as $(commit)"
	@docker build -t enclave_pkg:$(commit) -f enclave_package.dockerfile .
	@aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $(account).dkr.ecr.us-east-1.amazonaws.com
	@docker tag enclave_pkg:$(commit) $(account).dkr.ecr.us-east-1.amazonaws.com/enclave_pkg:$(commit)
	@docker push $(account).dkr.ecr.us-east-1.amazonaws.com/enclave_pkg:$(commit) 

set-api-version:
	@pulumi --cwd infra config set --path constants.containers.apiVersion api:$(commit)

package-api: api-release
	@echo "using account $(account)"
	@echo "create image tagged as $(commit)"
	@docker build -t api:$(commit) -f api.dockerfile .
	@aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $(account).dkr.ecr.us-east-1.amazonaws.com
	@docker tag api:$(commit) $(account).dkr.ecr.us-east-1.amazonaws.com/api:$(commit)
	@docker push $(account).dkr.ecr.us-east-1.amazonaws.com/api:$(commit) 	