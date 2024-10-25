# Vault Disaster Recovery (VDR) Validation

This script compares vault data as reported by VDR and the `footprint-dr` CLI to the live vault APIs, as the source of truth.

The script also serves as internal documentation of how to use `footprint-dr` for bulk operations (e.g. pagination, parallelized decryptions, etc).

Set up Modal with the `onefootprint` GitHub org: https://modal.com/docs/guide

Run the validation script:
```
modal run validate.py
```

Results will accumulate in `validation_results.json` so the validation is resumable. Delete this file if you want to restart. Transient errors are not retried, and you may need to re-run the validation to pick up skipped partitions that had transient errors.
