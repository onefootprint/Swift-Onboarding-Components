1. Get list of fp_ids to fix:
```
psql -d footprint_db --csv -f get_candidate_dls.sql > candidate_dls.csv
```

2. Run migration in dry run mode:
```
python3 migrate.py --input-file candidate_dls.csv --dry-run
```

Inspect the output.

3. Run migration for real:
```
python3 migrate.py --input-file candidate_dls.csv --no-dry-run
```

4. Check that the migration would now skip all `fp_id`s due to old seqnos:
```
python3 migrate.py --input-file candidate_dls.csv --dry-run
```


