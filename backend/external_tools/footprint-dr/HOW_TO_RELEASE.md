# Releasing `footprint-dr`

1. Bump the `version` in `Cargo.toml`, run `cargo check` to update `Cargo.lock` accordingly
2. Update `RELEASE_NOTES.md` using output from the following script, create a PR, and merge.
```bash
# cd monorepo/backend
git --no-pager log --oneline --pretty=format:"%(decorate:tag=## ,prefix=,suffix=%n)- %h - %s" -- external_tools/footprint-dr | grep --color=never '\(^- \)\|\(^## footprint-dr\)'
```
3. Once CI passes, push a new tag for the desired commit on `master` tag like `footprint-dr-1.0.0`.
```bash
git checkout COMMIT
git tag footprint-dr-1.0.0
git push origin fooptprint-dr-1.0.0
```
4. Let CI create a private release on the `monorepo` directory.
5. [Create a new draft release](https://github.com/onefootprint/footprint-dr-releases/releases/new) on `footprint-dr-releases` for the new version (e.g. `1.0.0`).
6. Copy over release artifacts:
```bash
cd $(mktemp -d)
gh -R onefootprint/monorepo release download footprint-dr-1.0.0
gh -R onefootprint/footprint-dr-releases release upload 1.0.0 *.tar.gz
```
7. Publish the `footprint-dr-releases` release.
8. Update the [the Homebrew tap](https://github.com/onefootprint/homebrew-tap/blob/master/Formula/footprint-dr.rb) for the new release:
```
# Set up tap if you haven't already:
brew tap onefootprint/homebrew-tap
cd $(brew --prefix)/Library/Taps/onefootprint/homebrew-tap

# Get new digest:
wget https://github.com/onefootprint/footprint-dr-releases/releases/download/1.0.0/footprint-dr-1.0.0-aarch64-apple-darwin.tar.gz -O /tmp/footprint-dr.tar.gz
sha256sum /tmp/footprint-dr.tar.gz

# Update version and sha256 digest in Formula/footprint-dr.rb

# Test the change:
brew install onefootprint/tap/footprint-dr
```
8. Make a PR for the Homebrew change, get it reviewed, and merge.
