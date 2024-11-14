use api_core::FpResult;
use api_core::State;
use chrono::DateTime;
use chrono::Utc;
use db::helpers::vault_dr::get_approximate_latest_backup_record_timestamp;
use db::helpers::vault_dr::get_approximate_next_backup_record_timestamp;
use db::models::vault_dr::VaultDrConfig;
use newtypes::VaultDrConfigId;

pub struct BackupStatus {
    pub latest_backup_record_timestamp: Option<DateTime<Utc>>,
    pub lag_seconds: i64,
}

#[tracing::instrument(skip_all)]
pub async fn get_backup_status(state: &State, config_id: &VaultDrConfigId) -> FpResult<BackupStatus> {
    let config_id = config_id.clone();
    state
        .db_query(move |conn| {
            let config = VaultDrConfig::get(conn, &config_id)?;

            let latest_record_ts = get_approximate_latest_backup_record_timestamp(conn, &config)?;

            let next_record_ts = get_approximate_next_backup_record_timestamp(conn, &config)?;

            let lag_seconds = if let Some(next_record_ts) = next_record_ts {
                // The lag is calculated as the difference between the current time and the time of
                // the next data lifetime that would be processed by the worker. This has the
                // following properties:
                // - The lag will remain zero if the worker has no new work.
                // - The lag will increase linearly starting from zero if the worker stops advancing
                //   (regardless of what newer DLs are written to the DB)
                // - The lag will be at most the batch poll period of the worker if every new DL is processed
                //   in the next batch, regardless of how often new DLs are created.
                //
                // Some alternatives that do not have all these properties:
                // - If we were to calculate the lag as the time between the current time and the last DL
                //   processed by the worker, the lag would increase even though the worker has no new work to
                //   do.
                // - If we were to calculate the lag as the time between the latest DL in the database and the
                //   latest DL processed by the worker, the the lag would stay constant even if the worker did
                //   no work for a long period of time. Additionally, if DLs are e.g. created once per hour
                //   but the poll period is once per 10 seconds, the lag would jump up to ~1h before the next
                //   poll period, and then quickly jump back to 0s. This makes point-in-time measurements of
                //   lag hard to interpret. Furthermore, if the worker erroneously processes data out of
                //   order, the lag may appear to be zero even if the worker has more work to do.

                let current_time = Utc::now();
                let lag = current_time.signed_duration_since(next_record_ts);

                // Clamp the lag to positive values to limit visible effects of clock drift.
                lag.num_seconds().max(0)
            } else {
                // Worker is up to date.
                0
            };


            let backup_status = BackupStatus {
                latest_backup_record_timestamp: latest_record_ts,
                lag_seconds,
            };
            Ok(backup_status)
        })
        .await
}
