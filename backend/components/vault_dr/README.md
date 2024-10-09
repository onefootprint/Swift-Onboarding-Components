# Vault Disaster Recovery

## Tips for running the worker locally

In one window:

```
docker compose build api && docker compose up
```

Then in another terminal, run integration tests to enroll `_private_it_org_1`:
```
docker compose --env-file /dev/null run --build integration_tests pytest ci/tests -n 6 -x -k test_footprint_dr
```

Then run the worker:
```
docker compose exec api /usr/local/bin/api_server vault-dr-worker --batch-size 100 --poll-period-ms 3000
```
