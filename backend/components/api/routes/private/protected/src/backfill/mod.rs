use actix_web::web;
use std::hash::DefaultHasher;
use std::hash::Hasher;

/*
#[derive(serde::Deserialize)]
#[allow(unused)]
struct CursorBackfillRequest<TCursor> {
    dry_run: bool,
    concurrency: usize,
    limit: i64,
    cursor: TCursor,
    shard_config: Option<ShardConfig>,
}
*/

#[derive(serde::Deserialize)]
#[allow(unused)]
struct BatchBackfillRequest<TEntity> {
    concurrency: usize,
    entity_ids: Vec<TEntity>,
    shard_config: Option<ShardConfig>,
}

#[derive(serde::Deserialize)]
#[allow(unused)]
struct ShardConfig {
    num_shards: u64,
    shard_idx: u64,
}

impl ShardConfig {
    /// Returns true if the shard is responsible for the provided key
    #[allow(unused)]
    fn select<T: std::hash::Hash>(&self, key: &T) -> bool {
        let mut hasher = DefaultHasher::new();
        key.hash(&mut hasher);
        let hash = hasher.finish();
        hash % self.num_shards == self.shard_idx
    }
}

/*
#[derive(serde::Serialize, macros::JsonResponder)]
#[allow(unused)]
struct CursorBackfillResponse<T, TCursor> {
    data: T,
    cursor: Option<TCursor>,
}
*/

#[derive(serde::Serialize, macros::JsonResponder)]
#[allow(unused)]
struct BatchBackfillResponse {}

#[allow(unused)]
pub fn configure(config: &mut web::ServiceConfig) {}
