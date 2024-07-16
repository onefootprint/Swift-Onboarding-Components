use actix_web::patch;
use actix_web::web;
use api_core::auth::protected_auth::ProtectedAuth;
use api_core::errors::ValidationError;
use api_core::types::ApiResponse;
use api_core::web::Json;
use api_core::FpResult;
use api_core::State;
use db::models::ob_configuration::ObConfiguration;
use newtypes::ObConfigurationId;
use newtypes::VerificationCheck;
use newtypes::VerificationCheckKind;

// This does not perform a lot of the checks that writing these via the supported org/ob_configs
// does, so be careful!
#[patch("/private/protected/ob_configs/{ob_config_id}/update_verification_checks")]
async fn update_verification_checks(
    state: web::Data<State>,
    _: ProtectedAuth,
    request: Json<UpdateVerificationChecksRequest>,
    path: web::Path<ObConfigurationId>,
) -> ApiResponse<UpdateVerificationChecksResponse> {
    let UpdateVerificationChecksRequest { add, delete } = request.into_inner();

    let updated_obc = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let (obc, _) = ObConfiguration::get(conn, &path.into_inner())?;
            let obc = ObConfiguration::lock(conn, &obc.id)?;

            // remove delete
            let mut new_checks: Vec<_> = obc
                .verification_checks
                .clone()
                .unwrap_or_default()
                .into_iter()
                .filter(|vc| {
                    let kind = VerificationCheckKind::from(vc);

                    !delete.contains(&kind)
                })
                .collect();

            let new_checks_kinds: Vec<VerificationCheckKind> =
                new_checks.iter().map(VerificationCheckKind::from).collect();

            // add new ones
            for vc in add {
                let kind = vc.clone().into();
                if new_checks_kinds.contains(&kind) {
                    return Err(ValidationError(
                        "verification checks already contains kind, you must remove it first",
                    )
                    .into());
                }

                new_checks.push(vc)
            }

            let obc = ObConfiguration::update(
                conn,
                &obc.id,
                &obc.tenant_id,
                obc.is_live,
                None,
                None,
                Some(new_checks),
            )?;

            Ok(obc)
        })
        .await?;

    let res = UpdateVerificationChecksResponse {
        obc_id: updated_obc.id,
        verification_checks: updated_obc.verification_checks,
    };

    Ok(res)
}
#[derive(Debug, Clone, serde::Deserialize)]
pub struct UpdateVerificationChecksRequest {
    pub add: Vec<VerificationCheck>,
    pub delete: Vec<VerificationCheckKind>,
}

#[derive(Debug, serde::Serialize, macros::JsonResponder)]
pub struct UpdateVerificationChecksResponse {
    pub obc_id: ObConfigurationId,
    pub verification_checks: Option<Vec<VerificationCheck>>,
}
