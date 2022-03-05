.PHONY: release debug
.DEFAULT_GOAL := debug

release:
	@echo "building release mode"
	@docker run -v "cargo-cache:/root/.cargo/registry" -v "${PWD}:/volume" --rm -t clux/muslrust:stable cargo build --bin footprint-core --release
	@cp ./target/x86_64-unknown-linux-musl/release/footprint-core ./out/footprint-core

debug:
	@echo "building debug mode"
	@docker run -v "cargo-cache:/root/.cargo/registry" -v "${PWD}:/volume" --rm -t clux/muslrust:stable cargo build --bin footprint-core
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