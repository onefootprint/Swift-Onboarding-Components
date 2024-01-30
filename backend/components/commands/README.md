# Commands

This package provides auxiliary commands that can be run in a similar environment as the API server monolith. To register your command, set up a new subcommand in `backend/components/api/server/src/main.rs` that runs your job.

Cron job commands defined here can be run on a schedule. To do so, set up a `cronTask` definition in `infra/Pulumi.prod.yaml` and `infra/Pulumi.dev.yaml` for the subcommand.
