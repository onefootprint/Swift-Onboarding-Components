# Vault Disaster Recovery (VDR) Validation

This script compares vault data as reported by VDR and the `footprint-dr` CLI to the live vault APIs, as the source of truth.

The script also serves as internal documentation of how to use `footprint-dr` for bulk operations (e.g. pagination, parallelized decryptions, etc).

To run on a test tenant:

1. Fetch an API key for the desired tenant. Login with `footprint-dr login` or set the `FOOTPRINT_API_KEY` env var.
2. Set the `FOOTPRINT_API_ROOT` env var to the desired endpoint, if it's not prod.
3. For the desired test tenant, fetch the wrapped recovery key from the DB:

```sql
SELECT
	wrapped_recovery_key
FROM
	vault_dr_config
WHERE
	tenant_id = '_private_it_org_2'
	AND is_live = FALSE
	AND deactivated_at IS NULL;
```

Note that the VDR org identities for all internal test tenants are the keys in the local `.env` secrets files.

4. Run the validation script

```bash
export AWS_PROFILE=cross-account # Account ID 992382496642
aws sso login
source ~/.virtualenvs/fpc/bin/activate                                                                                                                                                                                                                                                        130 ↵
cd backend/internal_tools/scripts/vault_dr_validation
./validate.py
```

Data will be checkpointed into the `data` directory. Delete that directory if you change tenants.
