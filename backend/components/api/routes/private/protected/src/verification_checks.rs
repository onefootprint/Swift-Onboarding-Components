use actix_web::patch;
use actix_web::web;
use api_core::auth::protected_auth::ProtectedAuth;
use api_core::types::ApiResponse;
use api_core::web::Json;
use api_core::State;
use api_errors::BadRequestInto;
use db::models::ob_configuration::IsLive;
use db::models::ob_configuration::ObConfiguration;
use db::models::ob_configuration::ObConfigurationUpdate;
use db::models::playbook::Playbook;
use newtypes::ObConfigurationId;
use newtypes::TenantId;
use newtypes::VerificationCheck;
use newtypes::VerificationCheckKind;

// This does not perform a lot of the checks that writing these via the supported org/ob_configs
// does, so be careful!
#[patch("/private/protected/ob_configs/{playbook_id}/update_verification_checks")]
async fn update_verification_checks(
    state: web::Data<State>,
    _: ProtectedAuth,
    request: Json<UpdateVerificationChecksRequest>,
    path: web::Path<ObConfigurationId>,
) -> ApiResponse<UpdateVerificationChecksResponse> {
    let playbook_id = path.into_inner();

    let UpdateVerificationChecksRequest {
        tenant_id,
        is_live,
        add,
        delete,
    } = request.into_inner();

    let updated_obc = state
        .db_transaction(move |conn| {
            let playbook = Playbook::lock(conn, (&playbook_id, &tenant_id, is_live))?;
            let (_, obc, _) = Playbook::get_latest_version(conn, (&playbook.id, &tenant_id, is_live))?;

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
                    return BadRequestInto(
                        "verification checks already contains kind, you must remove it first",
                    );
                }

                new_checks.push(vc)
            }

            let update = ObConfigurationUpdate {
                verification_checks: Some(new_checks),
                ..Default::default()
            };
            let obc = ObConfiguration::update(conn, &playbook, &obc.id, update)?;

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
    pub tenant_id: TenantId,
    pub is_live: IsLive,
    pub add: Vec<VerificationCheck>,
    pub delete: Vec<VerificationCheckKind>,
}

#[derive(Debug, serde::Serialize, macros::JsonResponder)]
pub struct UpdateVerificationChecksResponse {
    pub obc_id: ObConfigurationId,
    pub verification_checks: Option<Vec<VerificationCheck>>,
}
