use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiResult,
    onboarding_configs::validation::ObConfigurationArgsToValidate,
    types::response::ResponseData,
    utils::db2api::DbToApi,
    State,
};
use api_core::{decision::rule_engine, types::JsonApiResponse};
use api_wire_types::CopyPlaybookRequest;
use db::models::{
    ob_configuration::{NewObConfigurationArgs, ObConfiguration},
    rule_set_version::RuleSetVersion,
};
use newtypes::ObConfigurationId;
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[api_v2_operation(
    tags(Playbooks, Organization, Private),
    description = "Copies the provided onboarding configuration into the provided tenant and provided sandbox mode."
)]
#[post("/org/onboarding_configs/{id}/copy")]
async fn post(
    state: web::Data<State>,
    ob_config_id: web::Path<ObConfigurationId>,
    request: Json<CopyPlaybookRequest>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<api_wire_types::OnboardingConfiguration> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let ob_config_id = ob_config_id.into_inner();
    let (obc, _rs) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let (obc, _) = ObConfiguration::get(conn, (&ob_config_id, &tenant_id, is_live))?;
            let rs = RuleSetVersion::get_active(conn, &obc.id)?;
            Ok((obc, rs))
        })
        .await?;

    let ObConfiguration {
        must_collect_data,
        can_access_data,
        cip_kind,
        optional_data,
        is_no_phone_flow,
        is_doc_first,
        allow_international_residents,
        international_country_restrictions,
        skip_kyc,
        doc_scan_for_optional_ssn,
        enhanced_aml,
        allow_us_residents,
        allow_us_territory_residents,
        kind,
        skip_kyb,
        skip_confirm,
        document_types_and_countries,
        curp_validation_enabled,
        documents_to_collect,

        // Don't copy these fields. Explicitly enumerate them so the compiler complains when a new
        // field is added
        id: _,
        key: _,
        tenant_id: _,
        _created_at: _,
        _updated_at: _,
        is_live: _,
        status: _,
        created_at: _,
        author: _,
        name: _,

        // TODO maybe we should copy appearance one day. But it's not really used today.
        appearance_id: _,
    } = obc;

    let CopyPlaybookRequest {
        is_live: target_is_live,
        name,
    } = request.into_inner();
    let target_tenant = auth.tenant().clone();

    let args = NewObConfigurationArgs {
        author: auth.actor().into(),
        tenant_id: target_tenant.id.clone(),
        is_live: target_is_live,
        // Copied fields
        name,
        must_collect_data,
        can_access_data,
        cip_kind,
        optional_data,
        is_no_phone_flow,
        is_doc_first,
        allow_international_residents,
        international_country_restrictions,
        skip_kyc,
        doc_scan_for_optional_ssn,
        enhanced_aml,
        allow_us_residents,
        allow_us_territory_residents,
        kind,
        skip_kyb,
        skip_confirm,
        document_types_and_countries,
        curp_validation_enabled,
        documents_to_collect: documents_to_collect.unwrap_or_default(),
    };
    let args = ObConfigurationArgsToValidate::validate(&state, args, &target_tenant)?;

    let ff_client = state.feature_flag_client.clone();
    let (obc, actor, rs) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let obc: ObConfiguration = ObConfiguration::create(conn, args)?;
            let obc = ObConfiguration::lock(conn, &obc.id)?;
            // TODO don't save default rules
            rule_engine::default_rules::save_default_rules_for_obc(conn, &obc, Some(ff_client))?;
            let (obc, actor) = db::actor::saturate_actor_nullable(conn, obc.into_inner())?;
            let rs = RuleSetVersion::get_active(conn, &obc.id)?;
            Ok((obc, actor, rs))
        })
        .await?;
    let result =
        api_wire_types::OnboardingConfiguration::from_db((obc, actor, rs, state.feature_flag_client.clone()));
    ResponseData::ok(result).json()
}
