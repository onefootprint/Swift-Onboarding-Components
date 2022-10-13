.PHONY: api-release api-debug
.DEFAULT_GOAL := debug

account := $(shell aws sts get-caller-identity --query "Account" --output text)
branch := $(shell git rev-parse --abbrev-ref HEAD | sed -r 's/\//-/g' | sed -r 's/_/-/g')
commit := "$(branch)-$(shell git rev-parse --short HEAD)"
commit_full := "$(shell git rev-parse HEAD)"


api-release:
	@echo "building release mode"
	@docker run --env GIT_HASH="$(commit_full)" -v "cargo-cache:/root/.cargo/registry" -v "${PWD}:/volume" --rm -t clux/muslrust:stable cargo build -p footprint-core --features vsock --release
	@cp ./target/x86_64-unknown-linux-musl/release/footprint-core ./out/footprint-core

api-debug:
	@echo "building debug mode"
	@docker run --env GIT_HASH="$(commit_full)" -v "cargo-cache:/root/.cargo/registry" -v "${PWD}:/volume" --rm -t clux/muslrust:stable cargo build -p footprint-core --features vsock
	@cp ./target/x86_64-unknown-linux-musl/debug/footprint-core ./out/footprint-core

build-enclave-docker:
	rm -f ./out/enclave

	@echo "building enclave"

	@docker run -v "cargo-cache:/home/ec2-user/.cargo/registry" -v "${PWD}:/build" --rm -t enclave_builder:latest cargo build --target=x86_64-unknown-linux-musl -p enclave --no-default-features --features nitro --release

	@cp ./target/x86_64-unknown-linux-musl/release/enclave ./out/enclave

	@docker build -f enclave.dockerfile -t enclave .

build-eif: build-enclave-docker
	rm -f ./out/enclave.eif

	@echo "building EIF"

	@nitro-cli build-enclave --docker-uri enclave:latest --output-file ./out/enclave.eif --private-key ../enclavekey.pem --signing-certificate ../cert.pem

run-enclave-debug: build-eif
	@nitro-cli terminate-enclave --all
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
	@pulumi --cwd infra config set --path constants.containers.enclaveVersion $(commit)	

package-enclave:	
	@echo "using account $(account)"
	@echo "create image tagged as $(commit)"
	@docker build -t enclave_pkg:$(commit) -f enclave_package.dockerfile .
	@aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $(account).dkr.ecr.us-east-1.amazonaws.com
	@docker tag enclave_pkg:$(commit) $(account).dkr.ecr.us-east-1.amazonaws.com/enclave_pkg:$(commit)
	@docker tag enclave_pkg:$(commit) $(account).dkr.ecr.us-east-1.amazonaws.com/enclave_pkg:latest
	@docker push $(account).dkr.ecr.us-east-1.amazonaws.com/enclave_pkg:$(commit) 
	@docker push $(account).dkr.ecr.us-east-1.amazonaws.com/enclave_pkg:latest

set-api-version:
	@pulumi --cwd infra config set --path constants.containers.apiVersion $(commit)

package-api: api-release
	@echo "using account $(account)"
	@echo "create image tagged as $(commit)"
	@docker build -t api:$(commit) -f api.dockerfile .
	@aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $(account).dkr.ecr.us-east-1.amazonaws.com
	@docker tag api:$(commit) $(account).dkr.ecr.us-east-1.amazonaws.com/api:$(commit)
	@docker tag api:$(commit) $(account).dkr.ecr.us-east-1.amazonaws.com/api:latest
	@docker push $(account).dkr.ecr.us-east-1.amazonaws.com/api:$(commit) 	
	@docker push $(account).dkr.ecr.us-east-1.amazonaws.com/api:latest


stop-local:
	@killall enclave || echo "no enclave running"
	@killall footprint-core || echo "no fpc running"

run-local: stop-local
	@cargo run -p enclave --features simulate & echo "starting enclave..."
	@cargo run -p footprint-core

watch-local: stop-local
	@cargo run -p enclave --features simulate & echo "starting enclave..."
	@cargo watch -x 'run -p footprint-core' -i ci

watch: watch-local

update-dot-env:
	@AWS_REGION=us-east-1 aws kms encrypt --key-id 4e61ea01-1193-475e-82ee-e9639743efd6 \
		--plaintext fileb://.env \
		--output text \
		--query CiphertextBlob > encrypted.env

set-dot-env:
	@cat encrypted.env | base64 --decode > /tmp/encrypted.env.bin
	@AWS_REGION=us-east-1 aws kms decrypt --key-id 4e61ea01-1193-475e-82ee-e9639743efd6 \
		--ciphertext-blob fileb:///tmp/encrypted.env.bin \
		--output text \
		--query Plaintext | base64 --decode > .env
	@rm /tmp/encrypted.env.bin
	@echo "created .env:\n"

setup-integration-tests:
	@python3 -m venv ~/.virtualenvs/fpc
	@source ~/.virtualenvs/fpc/bin/activate
	@pip3 install -r ci/requirements.txt

run-integration-tests:
	TEST_URL="http://localhost:8000" pytest ci/tests

generate-api-types:
	@cd components/api_wire_types && cargo test
	@cd components/api_wire_types/ts-gen && yarn && yarn build