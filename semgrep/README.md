# Semgrep Static Analysis

This directory contains static analysis rules that are run in CI. For information on how to write Semgrep rules, see [this guide](https://semgrep.dev/docs/writing-rules/overview).

To run rules locally:

```
docker run --rm -v "${PWD}:/src" semgrep/semgrep semgrep scan --metrics=off --config semgrep .
```
