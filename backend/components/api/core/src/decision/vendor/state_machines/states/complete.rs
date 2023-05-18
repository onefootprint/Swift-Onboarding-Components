use super::{IncodeState, IncodeStateTransition};
use crate::ApiError;
use async_trait::async_trait;
use db::DbPool;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::response::FetchOCRResponse;
use idv::incode::response::FetchScoresResponse;
use newtypes::{DocVData, VaultPublicKey};

pub struct Complete {
    pub fetch_scores_response: FetchScoresResponse,
    pub fetch_ocr_response: FetchOCRResponse,
}

#[async_trait]
impl IncodeStateTransition for Complete {
    async fn run(
        &self,
        _db_pool: &DbPool,
        _footprint_http_client: &FootprintVendorHttpClient,
        _uv_public_key: VaultPublicKey,
        _docv_data: &DocVData,
    ) -> Result<IncodeState, ApiError> {
        Err(ApiError::AssertionError("incode already complete".into()))
    }
}
