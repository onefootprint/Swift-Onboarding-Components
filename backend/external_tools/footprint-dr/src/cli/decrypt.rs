use super::api_client::get_cli_client;
use super::api_client::IsLive;
use super::s3_client::EncDataKey;
use super::s3_client::FpId;
use super::s3_client::FpIdFields;
use super::s3_client::S3Client;
use super::BucketNamespace;
use crate::cli::age::decrypt;
use crate::cli::age::read_identities;
use crate::cli::age::unwrap_key;
use crate::cli::age::IdentityForKey;
use crate::cli::list_records::ListRecordsLine;
use crate::cli::s3_client::EncryptedRecord;
use anyhow::anyhow;
use anyhow::bail;
use anyhow::Context;
use anyhow::Ok;
use anyhow::Result;
use futures::FutureExt;
use futures::Stream;
use futures::StreamExt;
use futures::TryStreamExt;
use indicatif::ProgressBar;
use indicatif::ProgressStyle;
use itertools::Itertools;
use reqwest::Url;
use std::collections::HashMap;
use std::path::PathBuf;
use std::pin::Pin;
use std::time::Duration;
use tokio::fs::File;
use tokio::io::AsyncBufReadExt;
use tokio::io::AsyncReadExt;
use tokio::io::BufReader;
use tokio_stream::wrappers::LinesStream;
use tokio_util::compat::FuturesAsyncReadCompatExt;

const MAX_FP_IDS: usize = 100;
const REVEAL_WRAPPED_RECORD_KEYS_BATCH_SIZE: usize = 50;

#[allow(clippy::too_many_arguments)]
pub async fn decrypt_cmd(
    api_root: Url,
    is_live: IsLive,
    bucket_namespace: BucketNamespace,
    all: bool,
    records_path: Option<PathBuf>,
    org_identity_path: PathBuf,
    wrapped_recovery_key_path: Option<PathBuf>,
    output_dir: PathBuf,
    concurrency_limit: Option<usize>,
) -> Result<()> {
    let s3_client = S3Client::new(&api_root, is_live, bucket_namespace).await?;

    let concurrency_limit = concurrency_limit.unwrap_or(2 * num_cpus::get());
    log::debug!("Concurrency limit: {}", concurrency_limit);

    let org_identities = read_identities(org_identity_path)
        .await
        .context("failed to load org identity")?;

    let records = if all {
        if wrapped_recovery_key_path.is_none() {
            bail!("Can not decrypt all records without the wrapped recovery key.");
        }
        let fp_ids = s3_client.list_fp_ids(None, None).boxed();
        s3_client.list_records(fp_ids).await.boxed()
    } else if let Some(records_path) = records_path {
        log::debug!("Reading records from file: {:?}", records_path);
        let bucket_prefix = s3_client.bucket_prefix();
        read_records_file(records_path, bucket_prefix)
            .await
            .context("failed to read records from file")?
            .boxed()
    } else {
        bail!("Either --all or --records must be specified");
    };

    let manifest_stream = s3_client.manifest_stream(records).boxed();

    // Create empty directories for each vault version, regardless of whether it
    // ends up having fields to decrypt.
    let output_dir_copy = output_dir.clone();
    let manifest_stream = manifest_stream
        .and_then(move |(record, manifest)| {
            let version_dir = output_dir_copy
                .clone()
                .join(&record.fp_id.fp_id)
                .join(record.version.to_string());

            Box::pin(async move {
                tokio::fs::create_dir_all(&version_dir).await.context(format!(
                    "failed to create output directory: {}",
                    version_dir.display()
                ))?;

                Ok((record, manifest))
            })
        })
        .boxed();

    // Flatten the manifest stream into a stream of encrypted data keys.
    let mut enc_data_key_stream = s3_client
        .enc_data_keys_unordered(concurrency_limit, manifest_stream)
        .boxed();

    // Unwrap all necessary keys upfront so we can take advantage of the YubiKey's "cache" tap
    // policy. For test recovery of several hundred records, we usually need only two taps. We
    // explain this to the user in the printed output. For full recovery, we only need to unwrap a
    // single key, so we only need one tap.
    let identities: Box<dyn IdentityForKey> =
        if let Some(wrapped_recovery_key_path) = wrapped_recovery_key_path {
            get_full_recovery_key(org_identities, wrapped_recovery_key_path).await?
        } else {
            let (identities, enc_data_keys) =
                get_test_recovery_keys(&api_root, is_live, org_identities, enc_data_key_stream).await?;

            // Reset the stream for decryption.
            enc_data_key_stream = futures::stream::iter(enc_data_keys.into_iter().map(Ok)).boxed();

            identities
        };

    let records_progress = ProgressBar::new_spinner()
        .with_message("Downloading and decrypting records...")
        .with_style(ProgressStyle::with_template(
            "{spinner} {msg} {binary_bytes_per_sec} ({elapsed})",
        )?);
    records_progress.enable_steady_tick(Duration::from_millis(250));

    enc_data_key_stream
        .try_for_each_concurrent(concurrency_limit, |enc_data_key| {
            let EncDataKey {
                fp_id,
                version,
                field,
                key,
            } = enc_data_key;

            let identity = identities.identity(&key).cloned();
            let output_dir = output_dir.clone();
            let records_progress = records_progress.clone();

            // Get the fut without moving the s3_client into the async closure.
            let enc_record_fut = s3_client.get_encrypted_record(key.clone());

            tokio::spawn(async move {
                log::debug!("Downloading and decrypting record: {}", &key);

                let Some(identity) = identity else {
                    bail!("No identity found for record: {}", key);
                };

                let record_dir = output_dir
                    .as_path()
                    .join(&fp_id.fp_id)
                    .join(version.to_string())
                    .join(field.as_str());

                let EncryptedRecord {
                    e_data,
                    e_data_len,
                    mime_type,
                } = enc_record_fut.await?;
                let pii_reader = decrypt(e_data, &identity)
                    .await
                    .context(format!("failed to decrypt record {}", &key))?;

                let filename_base = match mime_type {
                    Some(_) => "document",
                    None => "value",
                };
                let extension = guess_file_extension(mime_type.as_deref());
                let filename = format!(
                    "{}{}",
                    filename_base,
                    extension.map(|ext| format!(".{}", ext)).unwrap_or_default()
                );
                let pii_path = record_dir.join(filename);

                tokio::fs::create_dir_all(&record_dir).await.context(format!(
                    "failed to create output directory: {}",
                    record_dir.display()
                ))?;

                let mut pii_file = tokio::fs::File::create(&pii_path)
                    .await
                    .context(format!("failed to create output file {}", pii_path.display()))?;

                tokio::io::copy(&mut pii_reader.compat(), &mut pii_file)
                    .await
                    .context("failed to copy decrypted data into output file")?;

                log::debug!("Finished writing PII file: {}", pii_path.display());

                records_progress.inc(e_data_len);

                Ok(())
            })
            .map(|result| Ok(result??))
        })
        .await?;

    records_progress.finish();

    Ok(())
}

async fn read_records_file(
    records_path: PathBuf,
    bucket_prefix: String,
) -> Result<impl Stream<Item = Result<FpIdFields>> + Send> {
    let records_file = File::open(records_path).await?;
    let reader = BufReader::new(records_file);
    let lines = reader.lines();

    let stream = LinesStream::new(lines)
        .filter_map(|line| async {
            // Remove empty lines.
            match line {
                Result::Ok(line) => {
                    if line.trim().is_empty() {
                        None
                    } else {
                        Some(Result::Ok(line.trim().to_owned()))
                    }
                }
                Result::Err(e) => Some(Err(e)),
            }
        })
        .map(move |line| -> Result<FpIdFields> {
            let line =
                serde_json::from_str::<ListRecordsLine>(&line?).with_context(|| "malformed record line")?;
            let ListRecordsLine {
                fp_id,
                version,
                fields,
            } = line;
            let fp_id = FpId::new(&bucket_prefix, &fp_id)?;
            Ok(FpIdFields {
                fp_id,
                version,
                fields,
            })
        });

    Ok(stream)
}

async fn get_full_recovery_key(
    org_identities: Vec<Box<dyn age::Identity>>,
    wrapped_recovery_key_path: PathBuf,
) -> Result<Box<dyn IdentityForKey>> {
    log::debug!("Decrypting in Full Recovery Mode");

    let wrapped_recovery_key_path = wrapped_recovery_key_path
        .into_os_string()
        .into_string()
        .map_err(|_| anyhow!("invalid wrapped recovery key path"))?;
    let mut file = File::open(wrapped_recovery_key_path)
        .await
        .context("failed to open wrapped recovery key file")?;

    let mut wrapped_recovery_key = vec![];
    file.read_to_end(&mut wrapped_recovery_key).await?;

    println!("Unwrapping recovery key...");
    println!("Enter YubiKey pin if prompted and tap the key when the light blinks slowly.");

    let recovery_key = unwrap_key(&wrapped_recovery_key, org_identities.iter().map(|i| i.as_ref()))
        .await
        .context("failed to unwrap recovery key")?;
    println!();

    Ok(Box::new(recovery_key))
}

async fn get_test_recovery_keys(
    api_root: &Url,
    is_live: IsLive,
    org_identities: Vec<Box<dyn age::Identity>>,
    enc_data_key_stream: Pin<Box<dyn Stream<Item = Result<EncDataKey>> + Send>>,
) -> Result<(Box<dyn IdentityForKey>, Vec<EncDataKey>)> {
    log::debug!("Decrypting in Test Recovery Mode");

    let progress_bar_style = ProgressStyle::with_template("{msg} {bar} {pos}/{len} ({elapsed})")?;

    let enc_data_keys = enc_data_key_stream
        .collect::<Vec<Result<_>>>()
        .await
        .into_iter()
        .collect::<Result<Vec<_>>>()?;

    // Advise the user to decrypt only a small number of records for testing purposes. This is
    // not really a hard requirement since the user can always batch through the records, but
    // helps avoid accidental misuse.
    let num_fp_ids = enc_data_keys.iter().map(|edk| &edk.fp_id).unique().count();
    if num_fp_ids > MAX_FP_IDS {
        bail!(
                    "Too many records for testing decryption ({} FP IDs, {} fields). For full recovery, provide the --wrapped-recovery-key flag. To test recovery, request decryption for at most {} FP IDs.",
                    num_fp_ids,
                    enc_data_keys.len(),
                    MAX_FP_IDS
                );
    }

    let client = get_cli_client(api_root, is_live).await?;

    let record_paths = enc_data_keys.iter().map(|edk| edk.key.clone()).collect_vec();
    let mut wrapped_record_keys = HashMap::new();

    let progress = ProgressBar::new(record_paths.len().try_into()?)
        .with_style(progress_bar_style.clone())
        .with_message("Retrieving record keys from Footprint Vault Disaster Recovery testing API...");

    for chunk in record_paths.chunks(REVEAL_WRAPPED_RECORD_KEYS_BATCH_SIZE) {
        let resp = client
            .reveal_wrapped_record_keys(super::wire_types::VaultDrRevealWrappedRecordKeysRequest {
                record_paths: chunk.to_owned(),
            })
            .await?;

        wrapped_record_keys.extend(resp.wrapped_record_keys.into_iter());
        progress.inc(chunk.len().try_into()?);
    }
    progress.finish();

    println!();
    println!();
    println!("Enter YubiKey pin if prompted and tap the key when the light blinks slowly.");

    let progress = ProgressBar::new(wrapped_record_keys.len().try_into()?)
        .with_style(progress_bar_style.clone())
        .with_message("Unwrapping record keys...");
    progress.println("If unwrapping record keys stalls, you may need to tap your YubiKey again.\n\n");

    let mut identities_by_record_path = HashMap::new();
    for (record_path, wrapped_record_key) in wrapped_record_keys {
        let record_key = unwrap_key(
            wrapped_record_key.as_bytes(),
            org_identities.iter().map(|i| i.as_ref()),
        )
        .await
        .context(format!("failed to unwrap record key for path {}", record_path))?;
        identities_by_record_path.insert(record_path, record_key);
        progress.inc(1);
    }
    progress.finish();
    println!();

    Ok((Box::new(identities_by_record_path), enc_data_keys))
}

fn guess_file_extension(mime_type: Option<&str>) -> Option<&str> {
    match mime_type {
        Some("application/octet-stream") => None,
        Some(mime_type) => mime_guess::get_mime_extensions_str(mime_type)
            .unwrap_or_default()
            .first()
            .cloned(),
        None => Some("txt"),
    }
}
