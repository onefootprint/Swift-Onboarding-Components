# Internal tools
These tools use [Airplane](https://airplane.dev) to provide "UIs" for common internal ops tasks.
Development and deployment are easy but needs a walkthrough for how to make changes.

## Query UI
Run any READ-only query against the DB.

## Stats
View high-level stats on tenants/users in footprint.

# How to deploy
```sh
airplane deploy --env <ENV> .
```

# FP CLI
• To run via cargo: cargo build -p fp -- PARAMS
• Or can build and run from target, `cargo build -p fp && ./target/debug/fp ...`
• Or can install `cargo install -p fp`

For example
```
/backend > cargo build -p fp && ./target/debug/fp seal -p 042ca0227fe3544ff40283de4a361637c7e18869164fb04d86eae0025067b877e89b042c3c7049b12ee5cb228db555947e36819027ffec592c0cddafa6ab1d6582 -m "hello world"

a46176016365706b98410418cc188418c3186818cd183d18f2188e18ed184118b218b718b9184003186118f4185f18b018a018ee182d18cf18d618aa18801825183618c4186518df189d18f918fa18f2188418f618cf18b4184a18bf188d18271825185618f4183f1884189d183d186118d8184a1826189d18bb0f18bd188518f4184118a6187318486269768c182d18d1181c18571896186518b8183718ab18cd187c185a6163981b18ef183118e218d61866184718c3189418dd1849182d18d718c118fd188b1418b90d188a184318ac182b18e918701847185e184b%    
```

or 
```
~/footprint/backend > cargo build -p fp && ./target/debug/fp export-footprint-reason-code

```