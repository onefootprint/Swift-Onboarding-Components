# Type synchronization
This `Rust` crate houses our API types and is capable of generated [json-schema](https://json-schema.org) which can be used by the frontend (or other consumers) to generate types in various languages.

# Generate Schemas
```shell
cargo test
```
Schemas are written to `generated/schemas/`.

# Generate TypeScript
```shell
cd ts-gen
yarn
yarn build
```
Types are written to `generated/ts/`.
