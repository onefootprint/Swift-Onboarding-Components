use api_core::enclave_client::DecryptReq;
use api_core::FpResult;
use api_core::State;
use db::models::tenant::Tenant;
use db::models::tenant_api_key::TenantApiKey;
use newtypes::secret_api_key::SecretApiKey;
use newtypes::PiiString;
use newtypes::TenantApiKeyId;
use paperclip::actix::web;
use std::collections::HashMap;

mod deactivate;
mod index;
mod reveal;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(index::post)
        .service(index::get)
        .service(index::patch)
        .service(deactivate::post)
        .service(reveal::post);
}

async fn decrypt_scrubbed_api_keys(
    state: &State,
    tenant: &Tenant,
    api_keys: Vec<&TenantApiKey>,
) -> FpResult<HashMap<TenantApiKeyId, PiiString>> {
    let requests = api_keys
        .iter()
        .map(|k| {
            let req = DecryptReq(&tenant.e_private_key, &k.e_secret_api_key, vec![]);
            (k.id.clone(), req)
        })
        .collect();
    let decrypted_keys = state.enclave_client.batch_decrypt_to_piistring(requests).await?;
    let decrypted_keys = decrypted_keys
        .into_iter()
        .map(|(id, k)| (id, SecretApiKey::from(k).scrub()))
        .collect();
    Ok(decrypted_keys)
}
