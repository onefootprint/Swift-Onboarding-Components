.PHONY: api-release api-debug

account := $(shell aws sts get-caller-identity --query "Account" --output text)
branch := $(shell git rev-parse --abbrev-ref HEAD | sed -r 's/\//-/g' | sed -r 's/_/-/g')
commit := "$(branch)-$(shell git rev-parse --short HEAD)"
commit_full := "$(shell git rev-parse HEAD)"

RUST_VERSION := "1.77.0"

# Builds the API crate into a musl binary
api-release:
	@echo "building release mode"
	@docker run --env GIT_HASH="$(commit_full)" -v "cargo-cache:/root/.cargo/registry" -v "${PWD}:/volume" --rm -t "clux/muslrust:${RUST_VERSION}-stable" cargo build -p api_server --release
	@cp ./target/x86_64-unknown-linux-musl/release/api_server ./out/api_server

api-debug:
	@echo "building debug mode"
	@docker run --env GIT_HASH="$(commit_full)" -v "cargo-cache:/root/.cargo/registry" -v "${PWD}:/volume" --rm -t "clux/muslrust:${RUST_VERSION}-stable" cargo build -p api_server
	@cp ./target/x86_64-unknown-linux-musl/debug/api_server ./out/api_server

# Builds the actual enclave image
build-enclave-docker:
	rm -f ./out/enclave

	@echo "building enclave"
	@docker run -v "cargo-cache:/home/ec2-user/.cargo/registry" -v "${PWD}:/build" --rm -t "ne_builder2:${RUST_VERSION}" cargo build --target=x86_64-unknown-linux-musl -p enclave --no-default-features --features nitro --release

	@cp ./target/x86_64-unknown-linux-musl/release/enclave ./out/enclave

	@docker build -f enclave.dockerfile -t enclave .

# Packages the enclave image into an EIF
build-signed-eif: build-enclave-docker
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

# Builds our enclave_proxy_binary
build-enclave-proxy-release:
	@echo "[release] building enclave-proxy"
	@docker run --env GIT_HASH="$(commit_full)" -v "cargo-cache:/home/ec2-user/.cargo/registry" -v "${PWD}:/volume" --rm -t "clux/muslrust:${RUST_VERSION}-stable" cargo build -p enclave_proxy --features vsock --release
	@cp ./target/x86_64-unknown-linux-musl/release/enclave_proxy ./out/enclave_proxy

get-named-commit:
	@echo "$(commit)"

get-friendly-branch-name:
	@echo "$(branch)"

set-enclave-version:
	@pulumi --cwd infra config set --path constants.containers.enclaveVersion $(commit)


set-api-version:
	@pulumi --cwd infra config set --path constants.containers.apiVersion $(commit)


run-enclave-local:
	(trap 'kill 0' SIGINT EXIT; \
		echo "starting enclave..." && cargo run -p enclave --features simulate & \
		echo "starting enclave proxy..." && cargo run -p enclave_proxy \
	)

run-local:
	(trap 'kill 0' SIGINT EXIT; \
		make run-enclave-local & \
		echo "starting api server..." && cargo run -p api_server \
	)

watch-local:
	(trap 'kill 0' SIGINT EXIT; \
		make run-enclave-local & \
		echo "starting api server and watching for changes..." && cargo watch -x 'run -p api_server' -i ci -i vscode-target -i target \
	)

watch: watch-local

configure-aws:
	@aws configure set aws_access_key_id ${AWS_ACCESS_KEY_ID}
	@aws configure set aws_secret_access_key ${AWS_SECRET_ACCESS_KEY}
	@aws configure set default.region ${AWS_REGION}

update-dot-env:
	@command -v rage || (echo "missing rage: installing" && cargo install rage)
	@cat .env | rage -e -r age1u4858547zdlc7ncghc3wypqxamt7v5xh0kasysqjfk0dt6ahcdnqtprun4 -a -o .env.age
	@echo "updated .env.age"

set-dot-env:
	@command -v rage || (echo "missing rage: installing" && cargo install rage)

	@cat encrypted_env_key.base64 | base64 --decode > /tmp/e_key.age
	@AWS_REGION=us-east-1 aws kms decrypt --key-id 4e61ea01-1193-475e-82ee-e9639743efd6 \
		--ciphertext-blob fileb:///tmp/e_key.age \
		--output text \
		--query Plaintext | base64 --decode > /tmp/key.age
	@rage -d -i /tmp/key.age -o .env .env.age

	@rm /tmp/e_key.age
	@rm /tmp/key.age

	@echo "created .env"

open-api:
	@MONOREPO_DIR=../ python3 ci/scripts/update_open_api.py

setup-integration-tests:
	@python3 -m venv ~/.virtualenvs/fpc
	@source ~/.virtualenvs/fpc/bin/activate
	@pip3 install -r ci/requirements.txt

run-integration-tests:
	TEST_URL="http://localhost:8000" pytest ci/tests

generate-api-types:
	@cd components/api/wire_types && cargo test
	@cd components/api/wire_types/ts-gen && yarn && yarn build

run-jaeger:
	docker run -d --rm --name jaeger -e COLLECTOR_OTLP_ENABLED=true -p 16686:16686 -p 4317:4317 -p 4318:4318 jaegertracing/all-in-one

stop-jaeger:
	docker stop jaeger

# Lists all first-party crates, handy for figuring out the crate that includes a given file.
.PHONY: ls-crates
ls-crates:
	@./internal_tools/ls-crates.sh

# Occasionally, we'll get compiler panics that can be solved by `cargo clean`.
# `make clean-crates` will clean only first-party crates, which solves the
# compiler panics without having to rebuild third-party crates.
.PHONY: clean-crates
clean-crates:
	@./internal_tools/clean-crates.sh
