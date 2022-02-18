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