# Releasing `footprint-dr`

1. Bump the `version` in `Cargo.toml`, run `cargo check` to update `Cargo.lock` accordingly, and merge the change via PR.
2. Once CI passes, push a new tag for the desired commit on `master` tag like `footprint-dr-1.0.0`.
```bash
git checkout COMMIT
git tag footprint-dr-1.0.0
git push origin fooptprint-dr-1.0.0
```
3. Let CI create a private release on the `monorepo` directory.
4. [Create a new release](https://github.com/onefootprint/footprint-dr-releases/releases/new) on `footprint-dr-releases` for the new version (e.g. `1.0.0`).
5. Copy over release artifacts:
```bash
cd $(mktemp -d)
gh -R onefootprint/monorepo release download footprint-dr-1.0.0
gh -R onefootprint/footprint-dr-releases release upload 1.0.0 *.tar.gz
```
