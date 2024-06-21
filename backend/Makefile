tmp_enclave_tag := "$(shell date +%s)"


.PHONY: build-nitro-enclave
build-nitro-enclave:
	docker buildx build -t enclave:$(tmp_enclave_tag) -f ./images/enclave/Dockerfile .
	nitro-cli build-enclave \
		--docker-uri enclave:$(tmp_enclave_tag) \
		--output-file ./out/enclave.eif \
		--private-key ../../enclavekey.pem \
		--signing-certificate ../../cert.pem
	docker rmi enclave:$(tmp_enclave_tag)

.PHONY: run-nitro-enclave-debug
run-nitro-enclave-debug:
	nitro-cli terminate-enclave --all
	echo "running enclave [debug mode]"
	nitro-cli run-enclave \
		--eif-path ./out/enclave.eif \
		--cpu-count 2 \
		--memory 256 \
		--enclave-cid 16 \
		--debug-mode

.PHONY: run-enclave
run-enclave:
	nitro-cli run-enclave \
		--eif-path ./out/enclave.eif \
		--cpu-count 2 \
		--memory 256 \
		--enclave-cid 16

.PHONY: run-enclave-local
run-enclave-local:
	(trap 'kill 0' SIGINT EXIT; \
		echo "starting enclave..." && cargo run -p enclave --features simulate & \
		echo "starting enclave proxy..." && cargo run -p enclave_proxy \
	)

.PHONY: run-local
run-local:
	(trap 'kill 0' SIGINT EXIT; \
		make run-enclave-local & \
		echo "starting api server..." && cargo run -p api_server \
	)

.PHONY: watch-local
watch-local:
	(trap 'kill 0' SIGINT EXIT; \
		make run-enclave-local & \
		echo "starting api server and watching for changes..." && cargo watch -x 'run -p api_server' -i ci -i vscode-target -i target \
	)

.PHONY: watch
watch: watch-local

.PHONY: configure-aws
configure-aws:
	@aws configure set aws_access_key_id ${AWS_ACCESS_KEY_ID}
	@aws configure set aws_secret_access_key ${AWS_SECRET_ACCESS_KEY}
	@aws configure set default.region ${AWS_REGION}

.PHONY: update-dot-env
update-dot-env:
	@command -v rage || (echo "missing rage: installing" && cargo install rage)
	@cat .env | rage -e -r age1u4858547zdlc7ncghc3wypqxamt7v5xh0kasysqjfk0dt6ahcdnqtprun4 -a -o .env.age
	@echo "updated .env.age"

.PHONY: set-dot-env
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

.PHONY: open-api
open-api:
	@MONOREPO_DIR=../ python3 ci/scripts/update_open_api.py

.PHONY: setup-integration-tests
setup-integration-tests:
	@python3 -m venv ~/.virtualenvs/fpc
	@source ~/.virtualenvs/fpc/bin/activate
	@pip3 install -r ci/requirements.txt

.PHONY: run-integration-tests
run-integration-tests:
	TEST_URL="http://localhost:8000" pytest ci/tests

.PHONY: generate-api-types
generate-api-types:
	@cd components/api/wire_types && cargo test
	@cd components/api/wire_types/ts-gen && yarn && yarn build

.PHONY: run-jaeger
run-jaeger:
	docker run -d --rm --name jaeger -e COLLECTOR_OTLP_ENABLED=true -p 16686:16686 -p 4317:4317 -p 4318:4318 jaegertracing/all-in-one

.PHONY: stop-jaeger
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
