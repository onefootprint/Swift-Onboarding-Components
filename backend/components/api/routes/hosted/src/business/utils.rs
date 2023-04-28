use crate::business::index::{decrypt_basic_business_info, BasicBusinessInfo};
use crate::errors::user::UserError;
use crate::errors::ApiResult;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::errors::business::BusinessError;
use api_core::utils::session::AuthSession;
use api_core::{auth::ob_config::BoSession, utils::twilio::BoSessionSmsInfo};
use db::models::business_owner::BusinessOwner;
use futures::FutureExt;
use newtypes::{BusinessOwnerKind, PiiString, ScopedVaultId};
use rand::Rng;

/// Given a list of new secondary_bos, send each of them a link to fill out their own KYC form
pub(super) async fn send_secondary_bo_links(
    state: &State,
    sb_id: ScopedVaultId,
    secondary_bos: Vec<BusinessOwner>,
) -> ApiResult<()> {
    if secondary_bos.is_empty() {
        return Ok(());
    }

    let bvw = state
        .db_pool
        .db_query(move |conn| VaultWrapper::build_for_tenant(conn, &sb_id))
        .await??;

    let BasicBusinessInfo {
        business_name,
        primary_bo,
        secondary_bos: secondary_bos_from_vault,
    } = decrypt_basic_business_info(state, &bvw).await?;

    // If we created any BOs in the DB, create an auth session for each of the BOs - we will send
    // this token in a link to each BO
    use chrono::Duration;
    let ob_config_id = bvw
        .onboarding
        .map(|ob| ob.1.id)
        .ok_or(UserError::NotAllowedWithoutTenant)?;

    // TODO what happens when the session expires? similar to email link
    let duration = Duration::days(30);
    let auth_token_futs = secondary_bos
        .into_iter()
        .filter(|bo| bo.kind == BusinessOwnerKind::Secondary)
        .map(|bo| {
            let session_data = BoSession {
                bo_id: bo.id,
                ob_config_id: ob_config_id.clone(),
            };
            (bo.link_id, session_data)
        })
        .map(|(l_id, d)| AuthSession::create(state, d.into(), duration).map(|t| t.map(|t| (l_id, t))));

    // TODO batch this
    let tokens = futures::future::try_join_all(auth_token_futs).await?;

    // Generate a link for each business
    let inviter = PiiString::new(format!(
        "{} {}",
        primary_bo.first_name.leak(),
        primary_bo.last_name.leak()
    ));
    // TODO we do this in a few places - we might want to support a more general header that the
    // client sends to the backend specifying the environment of the frontend app
    let base_url = if state.config.service_config.is_production() {
        "https://verify.onefootprint.com"
    } else if state.config.service_config.is_local() {
        "http://localhost:3004"
    } else {
        "https://verify.preview.onefootprint.com"
    };
    let r = rand::thread_rng().gen_range(0..1000);
    let bo_sms_info = tokens
        .into_iter()
        .map(|(l_id, token)| -> ApiResult<_> {
            let bo_data = secondary_bos_from_vault
                .get(&l_id)
                .ok_or(BusinessError::BoNotFound)?;
            let info = BoSessionSmsInfo {
                destination: &bo_data.phone_number,
                inviter: &inviter,
                business_name: &business_name,
                url: PiiString::new(format!("{}?r={}#{}", base_url, r, token)),
            };
            Ok(info)
        })
        .collect::<ApiResult<Vec<_>>>()?;

    let send_sms_futs = bo_sms_info
        .into_iter()
        .map(|info| state.twilio_client.send_bo_session(state, info));
    futures::future::join_all(send_sms_futs)
        .await
        .into_iter()
        .collect::<ApiResult<_>>()?;

    Ok(())
}
