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