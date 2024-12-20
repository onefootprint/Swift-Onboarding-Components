use crate::State;
use api_core::auth::user::IdentifyAuthContext;
use api_core::auth::Any;
use api_core::errors::user::UserError;
use api_core::types::ApiResponse;
use api_core::utils::vault_wrapper::DataRequestSource;
use api_core::utils::vault_wrapper::FingerprintedDataRequest;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_errors::BadRequestInto;
use newtypes::email::Email;
use newtypes::put_data_request::ModernRawUserDataRequest;
use newtypes::put_data_request::PatchDataRequest;
use newtypes::DataLifetimeSource;
use newtypes::IdentityDataKind as IDK;
use newtypes::PhoneNumber;
use newtypes::ValidateArgs;
use paperclip::actix;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use std::str::FromStr;


#[api_v2_operation(
    tags(Identify, Hosted),
    description = "Updates the data stored in this identify session."
)]
#[actix::patch("/hosted/identify/session/vault")]
pub async fn patch(
    request: Json<ModernRawUserDataRequest>,
    state: web::Data<State>,
    identify: IdentifyAuthContext,
) -> ApiResponse<api_wire_types::Empty> {
    let request = request.into_inner();

    let args = ValidateArgs::for_bifrost(identify.playbook.is_live);
    let PatchDataRequest {
        updates, deletions, ..
    } = PatchDataRequest::clean_and_validate(request, args)?;

    let sv_id = &identify.scoped_user.id;
    let updates = FingerprintedDataRequest::build(&state, updates, sv_id).await?;

    let phone = updates.get(&IDK::PhoneNumber.into());
    let email = updates.get(&IDK::Email.into());
    let is_fixture_phone = phone
        .and_then(|p| PhoneNumber::parse(p.clone()).ok())
        .is_some_and(|p| p.is_fixture_phone_number());
    let is_fixture_email = email
        .and_then(|e| Email::from_str(e.leak()).ok())
        .is_some_and(|p| p.is_fixture());
    if identify.playbook.is_live && (is_fixture_phone || is_fixture_email) {
        return Err(UserError::FixtureCIInLive.into());
    }

    let sv_id = identify.scoped_user.id.clone();
    state
        .db_transaction(move |conn| {
            let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &sv_id)?;
            if uvw.sv.is_active {
                return BadRequestInto("Cannot update identify data on an active vault");
            }
            let sources = DataLifetimeSource::LikelyHosted.into();
            uvw.soft_delete_vault_data(conn, deletions)?;
            uvw.patch_data(conn, updates, DataRequestSource::HostedPatchVault(sources))?;
            Ok(())
        })
        .await?;


    Ok(api_wire_types::Empty)
}
