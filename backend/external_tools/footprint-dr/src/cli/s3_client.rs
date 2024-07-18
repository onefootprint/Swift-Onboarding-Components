use anyhow::anyhow;
use anyhow::Result;
use futures::Stream;
use futures::StreamExt;
use futures::TryStreamExt;
use rand::distributions::Alphanumeric;
use rand::seq::SliceRandom;
use rand::thread_rng;
use rand::Rng;
use std::collections::HashSet;
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;


const S3_ACCESS_PROBE_KEY: &str = "footprint/.vdr-access-probe";
const CHANNEL_BUFFER_SIZE: usize = 64;

pub struct S3Client {
    client: aws_sdk_s3::Client,
    bucket_name: String,
    bucket_path_namespace: String,
}

#[derive(Debug, Clone, Eq, PartialEq, Hash)]
pub struct CommonPrefix {
    pub path: String,
    pub partition: String,
}

#[derive(Debug, Clone, Eq, PartialEq, Hash)]
pub struct FpId {
    pub path: String,
    pub fp_id: String,
}

#[derive(Debug, Clone, Eq, PartialEq, Hash)]
pub struct FpIdPartition {
    pub path: String,
    pub fp_id_prefix: String,
}

impl S3Client {
    pub async fn new(bucket_name: &str, bucket_path_namespace: &str) -> Result<Self> {
        let config = aws_config::from_env().load().await;

        let s3_config = aws_sdk_s3::Config::from(&config)
        .to_builder()
        // This enables compatibility with LocalStack.
        .force_path_style(true)
        .build();
        let s3_client = aws_sdk_s3::Client::from_conf(s3_config);

        // Test the client.
        s3_client
            .list_objects_v2()
            .bucket(bucket_name)
            .max_keys(1)
            .send()
            .await
            .map_err(|e| {
                let svc_error = e.into_service_error();
                anyhow!(
                    "Testing s3:ListBucket permissions failed for bucket {}: {:?}",
                    bucket_name,
                    svc_error
                )
            })?;

        s3_client
            .get_object()
            .bucket(bucket_name)
            .key(S3_ACCESS_PROBE_KEY)
            .send()
            .await
            .map_err(|e| {
                let svc_error = e.into_service_error();
                anyhow!(
                    "Testing s3:GetObject permissions failed for bucket {}: {:?}",
                    bucket_name,
                    svc_error,
                )
            })?;

        Ok(Self {
            client: s3_client,
            bucket_name: bucket_name.to_owned(),
            bucket_path_namespace: bucket_path_namespace.to_owned(),
        })
    }

    async fn list_common_prefixes(
        client: &aws_sdk_s3::Client,
        bucket_name: &str,
        prefix: &str,
        start_after: Option<String>,
        limit: Option<u16>,
    ) -> impl Stream<Item = Result<CommonPrefix>> {
        let mut prefixes_stream = client
            .list_objects_v2()
            .bucket(bucket_name)
            .prefix(prefix)
            .delimiter("/")
            .set_max_keys(limit.map(Into::into))
            .set_start_after(start_after)
            .into_paginator()
            .send();

        let (tx, rx) = mpsc::channel::<Result<CommonPrefix>>(CHANNEL_BUFFER_SIZE);

        let bucket_name = bucket_name.to_owned();
        tokio::task::spawn(async move {
            while let Some(resp) = prefixes_stream.next().await {
                if tx.is_closed() {
                    return;
                }

                match resp {
                    Ok(resp) => {
                        for common_prefix in resp.common_prefixes.unwrap_or_default() {
                            let result = if let Some(prefix) = common_prefix.prefix {
                                let partition = prefix
                                    .trim_end_matches('/')
                                    .split('/')
                                    .last()
                                    .map(|s| s.to_owned());

                                match partition {
                                    Some(partition) => Ok(CommonPrefix {
                                        path: prefix,
                                        partition,
                                    }),
                                    None => Err(anyhow!("no partition found")),
                                }
                            } else {
                                Err(anyhow!(
                                    "missing prefix for CommonPrefix in ListObjectsV2 response"
                                ))
                            };

                            let stop_tx = result.is_err();
                            let _ = tx.send(result).await;
                            if stop_tx {
                                return;
                            }
                        }
                    }
                    Err(e) => {
                        let svc_error = e.into_service_error();
                        let err = anyhow!(
                            "Failed to list partitions in bucket {}: {:?}",
                            bucket_name,
                            svc_error
                        );
                        let _ = tx.send(Err(err)).await;
                        return;
                    }
                }
            }
        });

        ReceiverStream::new(rx)
    }

    fn bucket_prefix(&self) -> String {
        format!("footprint/vdr/{}/", self.bucket_path_namespace)
    }

    pub async fn list_fp_id_partitions(&self) -> impl Stream<Item = Result<FpIdPartition>> {
        Self::list_common_prefixes(&self.client, &self.bucket_name, &self.bucket_prefix(), None, None)
            .await
            .map_ok(|cp| FpIdPartition {
                path: cp.path,
                fp_id_prefix: cp.partition,
            })
    }

    pub async fn list_fp_ids(
        &self,
        fp_id_gt: Option<String>,
        limit: Option<u16>,
    ) -> impl Stream<Item = Result<FpId>> {
        let mut partitions = self.list_fp_id_partitions().await;

        let (tx, rx) = mpsc::channel::<Result<FpId>>(CHANNEL_BUFFER_SIZE);

        let client = self.client.clone();
        let bucket_name = self.bucket_name.clone();

        tokio::task::spawn(async move {
            let mut num_sent: u16 = 0;

            while let Some(partition) = partitions.next().await {
                if tx.is_closed() {
                    return;
                }

                let partition = match partition {
                    Ok(partition) => partition,
                    Err(e) => {
                        let _ = tx.send(Err(e)).await;
                        return;
                    }
                };
                // Skip partitions before fp_id_gt.
                if let Some(fp_id_gt) = &fp_id_gt {
                    if partition.fp_id_prefix <= *fp_id_gt && !fp_id_gt.starts_with(&partition.fp_id_prefix) {
                        continue;
                    }
                }

                let start_after_key = fp_id_gt.as_ref().and_then(|fp_id_gt| {
                    // If we're in the same partition as fp_id_gt would be, filter out keys
                    // less than fp_id_gt's "directory". Note that this may still include
                    // fp_id_gt in the result, since our start_after_key is a prefix, not
                    // the greatest key for the fp_id.
                    //
                    // Example start_after_key:
                    //   footprint/vdr/vylwwfeb9stt96n0ssz18soclzx6scqu/fp_id_CW/
                    //     fp_id_CW0PlWT8m696cn6JyMQ83X
                    //
                    // Note that this sorts before:
                    //   footprint/vdr/vylwwfeb9stt96n0ssz18soclzx6scqu/fp_id_CW/
                    //     fp_id_CW0PlWT8m696cn6JyMQ83X/data/card.primary.issuer/
                    //     1690915708-UUchn4HgUT4AJc3l9mW0kQ_KqazHSmLwqI0JB7s-tpw
                    //
                    // So we need to filter the results as well.
                    if fp_id_gt.starts_with(&partition.fp_id_prefix) {
                        let fp_id_gt_key = format!("{}/{}", partition.path, fp_id_gt);
                        Some(fp_id_gt_key)
                    } else {
                        None
                    }
                });

                let mut fp_id_prefixes = Self::list_common_prefixes(
                    &client,
                    &bucket_name,
                    &partition.path,
                    start_after_key,
                    limit.map(|limit| limit - num_sent),
                )
                .await;

                while let Some(bucket_prefix) = fp_id_prefixes.next().await {
                    if tx.is_closed() {
                        return;
                    }

                    let fp_id = match bucket_prefix {
                        Ok(bucket_prefix) => Ok(FpId {
                            path: bucket_prefix.path,
                            fp_id: bucket_prefix.partition,
                        }),
                        Err(e) => Err(e),
                    };

                    if let Ok(fp_id) = fp_id.as_ref() {
                        // Skip fp_ids that are <= fp_id_gt.
                        if let Some(fp_id_gt) = &fp_id_gt {
                            if fp_id.fp_id <= *fp_id_gt {
                                continue;
                            }
                        }
                    }

                    let stop_tx = fp_id.is_err();
                    let _ = tx.send(fp_id).await;
                    if stop_tx {
                        return;
                    }

                    num_sent += 1;
                    if let Some(limit) = limit {
                        if num_sent >= limit {
                            return;
                        }
                    }
                }
            }
        });

        ReceiverStream::new(rx)
    }

    pub async fn sample_fp_ids(&self, limit: u16) -> Result<Vec<FpId>> {
        // First handle the case where we have less than `limit` fp_ids.
        let full_batch_size = limit + 1;
        let fp_id_batch = self
            .list_fp_ids(None, Some(full_batch_size))
            .await
            .collect::<Vec<Result<_>>>()
            .await
            .into_iter()
            .collect::<Result<Vec<_>>>()?;
        if fp_id_batch.len() < limit.into() {
            return Ok(fp_id_batch);
        }

        // Otherwise, our approach for each sample is to
        // 1. sample a partition
        // 2. generate a random fp_id that would fall into that partition
        // 3. take the first fp_id that is greater than that probe fp_id
        // If we find a duplicate, we retry the sample.
        //
        // Sampling partitions helps ensure we get a mix of fp_id kinds, like fp_id, fp_bid, etc.
        let partitions = self
            .list_fp_id_partitions()
            .await
            .collect::<Vec<Result<_>>>()
            .await
            .into_iter()
            .collect::<Result<Vec<_>>>()?;

        let mut sample = HashSet::new();

        while sample.len() < limit.into() {
            let partitions = partitions.clone();

            let mut rng = thread_rng();
            let partition = partitions.choose(&mut rng);
            let Some(partition) = partition else {
                return Err(anyhow!("no partitions found"));
            };

            // The length of the probe fp_id doesn't matter as long as it's at least as long as
            // real fp_ids.
            let suffix: String = thread_rng()
                .sample_iter(&Alphanumeric)
                .take(100)
                .map(char::from)
                .collect();

            let probe_fp_id = format!("{}{}", partition.fp_id_prefix, suffix);
            let probe_fp_id_path = format!("{}/{}", partition.path, probe_fp_id);

            let list_after_probe = self
                .client
                .list_objects_v2()
                .bucket(&self.bucket_name)
                .prefix(self.bucket_prefix())
                .start_after(probe_fp_id_path)
                .max_keys(1)
                .send()
                .await?;


            let next_key = list_after_probe.contents.into_iter().flatten().next();
            if let Some(next_key) = next_key.and_then(|k| k.key) {
                if !next_key.starts_with(&partition.path) {
                    // If the next key not a blob in this partition, re-sample.
                    continue;
                }

                let parts = next_key.split('/').collect::<Vec<_>>();
                // Example key parts:
                // 0. footprint/
                // 1. vdr/
                // 2. vylwwfeb9stt96n0ssz18soclzx6scqu/
                // 3. fp_bid_test_dY/
                // 4. fp_bid_test_dY4DUZ4WJhJKio47NHrB7S/
                // etc.

                let next_fp_id = parts
                    .get(4)
                    .ok_or(anyhow!("missing fp_id component in path"))?
                    .to_string();

                // Include a trailing slash to match other constructions of FpId.path from
                // S3Client::list_common_prefixes().
                let path = format!("{}/", parts.into_iter().take(5).collect::<Vec<_>>().join("/"));

                sample.insert(FpId {
                    path,
                    fp_id: next_fp_id,
                });
            }
        }

        Ok(sample.into_iter().collect())
    }
}
