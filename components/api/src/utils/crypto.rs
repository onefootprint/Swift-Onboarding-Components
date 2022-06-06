use crate::{errors::ApiError, State};
use paperclip::actix::web;

pub async fn signed_hash(state: &web::Data<State>, val: String) -> Result<Vec<u8>, ApiError> {
    state.hmac_client.signed_hash(val.as_bytes()).await
}

pub fn seal_to_vault_pkey(val: String, pub_key: &[u8]) -> Result<Vec<u8>, ApiError> {
    let val = crypto::seal::seal_ecies_p256_x963_sha256_aes_gcm(pub_key, val.as_str().as_bytes().to_vec())?
        .to_vec()?;
    Ok(val)
}
