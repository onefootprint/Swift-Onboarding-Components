use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantApiKey;
use api_core::auth::tenant::TenantGuard;
use api_core::types::ApiResponse;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::State;
use api_wire_types::ApexCheckedKycData;
use api_wire_types::ApexCipReportRequest;
use api_wire_types::ApexCipSummaryResults;
use api_wire_types::ApexSelfReportedData;
use api_wire_types::ApexWatchlist;
use api_wire_types::OldApexCipReportRequest;
use newtypes::PiiString;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};
use std::collections::HashMap;
use strum::IntoEnumIterator;

#[api_v2_operation(
    description = "Export CIP information for APEX as a JSON object",
    tags(Integrations, Apex, Preview)
)]
#[actix::post("/users/{fp_id}/integrations/apex/cip_report")]
pub async fn post(
    state: web::Data<State>,
    auth: TenantApiKey,
    request: Json<ApexCipReportRequest>,
    fp_id: FpIdPath,
) -> ApiResponse<ApexCipSummaryResults> {
    let ApexCipReportRequest { default_approver } = request.into_inner();
    let fp_id = fp_id.into_inner();
    let request = OldApexCipReportRequest {
        default_approver,
        fp_user_id: fp_id,
    };
    let result = post_inner(state, auth, request).await?;
    Ok(result)
}

// TODO remove once nobody is using this
#[api_v2_operation(
    description = "Export CIP information for APEX as a JSON object",
    tags(Integrations, Apex, Deprecated)
)]
#[actix::post("/integrations/apex/cip_report")]
pub async fn post_old(
    state: web::Data<State>,
    auth: TenantApiKey,
    request: Json<OldApexCipReportRequest>,
) -> ApiResponse<ApexCipSummaryResults> {
    let result = post_inner(state, auth, request.into_inner()).await?;
    Ok(result)
}

pub async fn post_inner(
    state: web::Data<State>,
    auth: TenantApiKey,
    request: OldApexCipReportRequest,
) -> ApiResponse<ApexCipSummaryResults> {
    let auth = auth.check_guard(TenantGuard::CipIntegration)?;
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();

    // build the cip request based on the alpaca format
    let (cip, uvw) = crate::alpaca::cip::create_cip_request(
        &state,
        request.default_approver,
        request.fp_user_id.clone(),
        tenant_id.clone(),
        is_live,
    )
    .await?;

    use newtypes::DataIdentifier::Id;
    use newtypes::DataIdentifier::InvestorProfile as Ip;
    use newtypes::IdentityDataKind::*;
    use newtypes::InvestorProfileKind as IPK;
    use IPK::*;

    // decrypt a few additional attributes for our apex cip report
    let attrs = [Id(Ssn9), Id(UsLegalStatus), Id(VisaKind), Id(Citizenships)]
        .into_iter()
        .chain(IPK::iter().map(Ip))
        .collect::<Vec<_>>();

    let mut vd: HashMap<_, _> = uvw
        .decrypt_unchecked(&state.enclave_client, &attrs)
        .await?
        .results
        .into_iter()
        // Ignore the transforms since we didn't use any here
        .map(|(k, v)| (k.identifier, v))
        .collect();

    let self_reported = ApexSelfReportedData {
        citizenships: vd.remove(&Id(Citizenships)),
        visa_kind: vd.remove(&Id(VisaKind)),
        us_legal_status: vd.remove(&Id(UsLegalStatus)),
        annual_income: vd.remove(&Ip(AnnualIncome)),
        occupation: vd.remove(&Ip(Employer)),
        employment_status: vd.remove(&Ip(EmploymentStatus)),
        investment_objectives: vd.remove(&Ip(InvestmentGoals)),
        net_worth: vd.remove(&Ip(NetWorth)),
        is_employed_at_brokerage_firm: vd.remove(&Ip(BrokerageFirmEmployer)),
        declarations: vd.remove(&Ip(Declarations)),
    };

    let summary = ApexCipSummaryResults {
        user_id: cip.kyc.id,
        checked_data: ApexCheckedKycData {
            tax_id: vd.remove(&Id(Ssn9)),
            customer_name: to_ascii(cip.kyc.applicant_name.into_inner()),
            address: to_ascii(cip.kyc.address.into_inner()),
            date_of_birth: cip.kyc.date_of_birth.clone().into_inner(),
        },
        self_reported,
        kyc_completed_at: cip.kyc.kyc_completed_at,
        check_initiated_at: cip.kyc.check_initiated_at,
        check_completed_at: cip.kyc.check_completed_at,
        approved_reason: cip.kyc.approved_reason,
        approved_at: cip.kyc.approved_at,
        approved_by: cip.kyc.approved_by,
        ip_address: cip.kyc.ip_address.into_inner(),

        result: cip.identity.result.into(),
        matched_address: cip.identity.matched_address.into(),
        matched_addresses: cip.identity.matched_addresses,
        date_of_birth: cip.identity.date_of_birth.into(),
        date_of_birth_breakdown: cip.identity.date_of_birth_breakdown,
        tax_id: cip.identity.tax_id.into(),
        tax_id_breakdown: cip.identity.tax_id_breakdown,
        watchlist: ApexWatchlist {
            result: cip.watchlist.result.into(),
            check_completed_at: cip.watchlist.created_at,
            politically_exposed_person: cip.watchlist.politically_exposed_person.into(),
            sanction: cip.watchlist.sanction.into(),
            adverse_media: cip.watchlist.adverse_media.into(),
            monitored_lists: cip.watchlist.monitored_lists.into(),
            records: cip.watchlist.records,
        },
    };

    Ok(summary)
}

fn to_ascii(p: PiiString) -> PiiString {
    deunicode::deunicode(p.leak()).into()
}
