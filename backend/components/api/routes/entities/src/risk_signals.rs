use std::collections::HashMap;

use crate::{
    auth::{
        tenant::{CheckTenantGuard, SecretTenantAuthContext, TenantGuard, TenantSessionAuth},
        Either,
    },
    types::{response::ResponseData, JsonApiResponse},
};
use api_core::{
    auth::CanDecrypt, decision::vendor::neuro_id::tenant_can_view_neuro, utils::headers::InsightHeaders,
};
use db::models::{
    access_event::NewAccessEventRow, audit_event::NewAuditEvent, insight_event::CreateInsightEvent,
};
use newtypes::{
    AccessEventKind, AccessEventPurpose, AuditEventDetail, AuditEventId, DataIdentifier, DbActor,
    IdentityDataKind as IDK, VendorAPI,
};

use crate::{utils::db2api::DbToApi, State};

use api_core::{
    decision,
    decision::vendor::vendor_result::VendorResult,
    errors::{ApiResult, AssertionError},
    telemetry::RootSpan,
    utils::{
        fp_id_path::FpIdPath,
        vault_wrapper::{Any, VaultWrapper, VwArgs},
    },
};
use api_wire_types::{AmlHit, AmlHitMedia, RiskSignalFilters};
use db::{
    models::{
        ob_configuration::ObConfiguration,
        risk_signal::{IncludeHidden, RiskSignal},
        scoped_vault::ScopedVault,
        vault::Vault,
        verification_request::{RequestAndResult, VerificationRequest},
        verification_result::VerificationResult,
    },
    DbResult,
};
use idv::{incode::watchlist::response::UpdatedWatchlistResultResponse, ParsedResponse};
use itertools::Itertools;
use newtypes::{
    EncryptedVaultPrivateKey, EnhancedAmlOption, FootprintReasonCode, FpId, PiiJsonValue, RiskSignalId,
    TenantId,
};
use paperclip::actix::{api_v2_operation, get, post, web};

type RiskSignalsListResponse = Vec<api_wire_types::RiskSignal>;

#[api_v2_operation(
    description = "Lists the risk signals for a footprint user.",
    tags(EntityDetails, Entities, Private)
)]
#[get("/entities/{fp_id}/risk_signals")]
pub async fn get(
    state: web::Data<State>,
    request: FpIdPath,
    filters: web::Query<RiskSignalFilters>,
    // TODO remove SecretTenantAuthContext here when everyone has migrated to the new GET /users/<>/risk_signals API
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
    root_span: RootSpan,
) -> JsonApiResponse<RiskSignalsListResponse> {
    // Some tracing to track when tenants have stopped using this API
    if let Either::Right(_) = &auth {
        // Apiture and fractional are still using this
        root_span.record("meta", "tenant_api_key_auth");
    } else {
        root_span.record("meta", "dashboard_auth");
    }
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();
    let can_view_neuro = tenant_can_view_neuro(&state, &tenant_id);

    let signals = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            RiskSignal::latest_by_risk_signal_group_kinds(conn, &sv.id, IncludeHidden(false))
        })
        .await?
        .into_iter()
        .filter(|(_, rs)| !rs.reason_code.to_be_deprecated())
        .filter(|(_, rs)| {
            if matches!(rs.vendor_api, VendorAPI::NeuroIdAnalytics) {
               can_view_neuro
            } else {
                true
            }
        })
        .filter_map(|(_, rs)| {
            // FP-5097
            if !matches!(rs.reason_code, FootprintReasonCode::Other(_)) {
                Some(rs)
            } else {
                tracing::error!(reason_code=%rs.reason_code, risk_signal_id=%rs.id, "FootprintReasonCode::Other retrieved in /risk_signals");
                None
            }
        })
        .collect();

    // TODO this is fine to do in RAM when there aren't many signals. Will be harder with pagination.
    // Maybe we should store the note, severity, and scopes in the DB
    let signals = filter_and_sort(signals, filters.into_inner());
    let signals = signals
        .into_iter()
        .map(api_wire_types::RiskSignal::from_db)
        .collect();

    ResponseData::ok(signals).json()
}

fn filter_and_sort(signals: Vec<RiskSignal>, filters: RiskSignalFilters) -> Vec<RiskSignal> {
    signals
        .into_iter()
        .filter(|signal| {
            let rc = signal.reason_code.clone();
            if !filters.scope.is_empty() && !rc.scopes().iter().any(|x| filters.scope.contains(x)) {
                return false;
            }
            if !filters.severity.is_empty() && !filters.severity.contains(&rc.severity()) {
                return false;
            }
            if let Some(ref description) = filters.description {
                if !rc
                    .description()
                    .to_ascii_lowercase()
                    .contains(&description.to_ascii_lowercase())
                {
                    return false;
                }
            }
            true
        })
        .sorted_by(|s1, s2| {
            let s1 = s1.reason_code.severity();
            let s2 = s2.reason_code.severity();
            s1.cmp(&s2).reverse()
        })
        .collect()
}

#[api_v2_operation(
    description = "Lists the risk signals for a footprint user.",
    tags(EntityDetails, Entities, Private)
)]
#[get("/entities/{fp_id}/risk_signals/{signal_id}")]
pub async fn get_detail(
    state: web::Data<State>,
    request: web::Path<(FpId, RiskSignalId)>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<api_wire_types::RiskSignalDetail> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let (fp_id, risk_signal_id) = request.into_inner();

    let (rs, aml_detail) =
        get_risk_signal_and_maybe_aml_detail(&state, risk_signal_id, fp_id, tenant_id, is_live).await?;
    let has_aml_hits = aml_detail.is_some();

    ResponseData::ok(api_wire_types::RiskSignalDetail::from_db((rs, has_aml_hits))).json()
}

const DECRYPT_AML_HITS_ACCESS_EVENT_REASON: &str = "Reviewing AML information";

#[api_v2_operation(
    description = "Decrypts structured information about the AML hits for a AML risk signal.",
    tags(EntityDetails, Entities, Private)
)]
#[post("/entities/{fp_id}/decrypt_aml_hits/{signal_id}")]
pub async fn decrypt_aml_hits(
    state: web::Data<State>,
    request: web::Path<(FpId, RiskSignalId)>,
    auth: TenantSessionAuth,
    insights: InsightHeaders,
) -> JsonApiResponse<api_wire_types::AmlDetail> {
    let read_auth = auth.clone().check_guard(TenantGuard::Read)?;
    let tenant_id = read_auth.tenant().id.clone();
    let is_live = read_auth.is_live()?;
    let (fp_id, risk_signal_id) = request.into_inner();

    // TODO: assert decrypt permissions + write AccessEvent. maybe just shoehorn into existing structs as (FirstName, MiddleName, LastName, Dob) or need to rework some of this stuff to not be so DI dependent

    let (_rs, aml_detail) =
        get_risk_signal_and_maybe_aml_detail(&state, risk_signal_id, fp_id, tenant_id.clone(), is_live)
            .await?;
    let Some((aml_detail, vreq)) = aml_detail else {
        Err(AssertionError("No AML hit data for risk signal"))?
    };

    // Populate the vault with the seqno of the time of the AML call we made and figure out which of FirstName/LastName/Dob we would have sent to Incode
    let sv_id = vreq.scoped_vault_id.clone();
    let uvw = state
        .db_pool
        .db_query(move |conn| {
            VaultWrapper::<Any>::build(
                conn,
                VwArgs::Historical(&vreq.scoped_vault_id, vreq.uvw_snapshot_seqno),
            )
        })
        .await?;
    let mut dis_searched: Vec<DataIdentifier> = vec![
        IDK::FirstName.into(),
        IDK::MiddleName.into(),
        IDK::LastName.into(),
        IDK::Dob.into(),
    ];
    dis_searched.retain(|i| uvw.has_field(i));

    // check that auth has Decrypt permissions for these DIs. Note we don't check check_ob_config_access here- this seems unnecessary and we should never allow an OBC that makes AML calls but then doesn't allow the user to view the results
    let auth = auth.check_guard(CanDecrypt::new(dis_searched.clone()))?;

    // write an AccessEvent
    let principal: DbActor = auth.actor().into();
    let insight = CreateInsightEvent::from(insights);
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let insight_event_id = insight.insert_with_conn(conn)?.id;
            let reason = DECRYPT_AML_HITS_ACCESS_EVENT_REASON.to_owned();

            let aeid = AuditEventId::generate();
            NewAccessEventRow {
                id: aeid.clone().into_correlated_access_event_id(),
                scoped_vault_id: sv_id.clone(),
                tenant_id: tenant_id.clone(),
                is_live,
                reason: Some(reason.clone()),
                principal: principal.clone(),
                insight_event_id: insight_event_id.clone(),
                kind: AccessEventKind::Decrypt,
                targets: dis_searched.clone(),
                purpose: AccessEventPurpose::Api,
            }
            .create(conn)?;

            NewAuditEvent {
                id: aeid,
                tenant_id,
                principal_actor: principal,
                insight_event_id,
                detail: AuditEventDetail::DecryptUserData {
                    is_live,
                    scoped_vault_id: sv_id,
                    reason,
                    decrypted_fields: dis_searched,
                },
            }
            .create(conn)?;

            Ok(())
        })
        .await?;

    ResponseData::ok(aml_detail).json()
}

async fn get_risk_signal_and_maybe_aml_detail(
    state: &State,
    risk_signal_id: RiskSignalId,
    fp_id: FpId,
    tenant_id: TenantId,
    is_live: bool,
) -> ApiResult<(
    RiskSignal,
    Option<(api_wire_types::AmlDetail, VerificationRequest)>,
)> {
    let (rs, vreq_vres_key_obc) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let rs = RiskSignal::get_tenant_visible(conn, &risk_signal_id, &fp_id, &tenant_id, is_live)?;
            let vreq_vres_key = if rs.reason_code.is_aml() {
                // we only need to read the vres if it was an Aml risk signal and we need to populate the `aml` portion of the response
                let (vreq, vres) = VerificationResult::get(conn, &rs.verification_result_id)?;
                let obc = ObConfiguration::get_enhanced_aml_obc_for_sv(conn, &vreq.scoped_vault_id)?;
                if let Some(obc) = obc {
                    let v = Vault::get(conn, (&fp_id, &tenant_id, is_live))?;
                    Some(((vreq, vres), v.e_private_key, obc))
                } else {
                    None
                }
            } else {
                None
            };

            Ok((rs, vreq_vres_key))
        })
        .await?;

    let aml_detail = if let Some((vreq_vres, key, obc)) = vreq_vres_key_obc {
        get_aml_hits(state, &obc.enhanced_aml(), vreq_vres.clone(), key)
            .await?
            .map(|a| (a, vreq_vres.0))
    } else {
        None
    };

    Ok((rs, aml_detail))
}

async fn get_aml_hits(
    state: &State,
    enhanced_aml: &EnhancedAmlOption,
    vreq_vres: RequestAndResult,
    private_key: EncryptedVaultPrivateKey,
) -> ApiResult<Option<api_wire_types::AmlDetail>> {
    let vreq_vres =
        VendorResult::hydrate_vendor_result(vreq_vres, &state.enclave_client, &private_key).await?;

    if let Some(vres) = vreq_vres.vres {
        if let Some(res) = vres.response {
            if let ParsedResponse::IncodeWatchlistCheck(wc)
            | ParsedResponse::IncodeUpdatedWatchlistResult(UpdatedWatchlistResultResponse(wc)) =
                res.response
            {
                let share_url = wc
                    .content
                    .as_ref()
                    .and_then(|c| c.data.as_ref())
                    .and_then(|d| d.share_url.clone());

                let leaked_hits = decision::features::incode_watchlist::get_hits(&wc, enhanced_aml)
                    .into_iter()
                    .map(|h| h.leak());

                let aml_hits = leaked_hits
                    .map(|h| {
                        let fields_json = h
                            .doc
                            .as_ref()
                            .and_then(|d| d.fields.as_ref())
                            .map(|f| {
                                serde_json::to_value(
                                    f.iter()
                                        .flat_map(|e| {
                                            e.name.clone().and_then(|name| {
                                                e.value.clone().map(|value| (name, value.leak_to_string()))
                                            })
                                        })
                                        .collect::<HashMap<_, _>>(),
                                )
                            })
                            .transpose()
                            .ok()
                            .flatten()
                            .map(PiiJsonValue::from);

                        let media = h.doc.as_ref().and_then(|d| d.media.as_ref()).map(|m| {
                            m.iter()
                                .map(|e| AmlHitMedia {
                                    date: e.date,
                                    pdf_url: e.pdf_url.clone(),
                                    snippet: e.snippet.clone(),
                                    title: e.title.clone(),
                                    url: e.url.clone(),
                                })
                                .collect::<Vec<_>>()
                        });

                        AmlHit {
                            name: h.doc.as_ref().and_then(|d| d.name.clone()),
                            fields: fields_json,
                            match_types: h.match_types,
                            media,
                        }
                    })
                    .collect::<Vec<_>>();

                return Ok(Some(api_wire_types::AmlDetail {
                    share_url,
                    hits: aml_hits,
                }));
            }
        }
    }

    Ok(None)
}
