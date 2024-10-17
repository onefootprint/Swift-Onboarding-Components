use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantApiKeyAuth;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::auth::Either;
use crate::types::ApiResponse;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::auth::CanDecrypt;
use api_core::decision;
use api_core::decision::features::sentilink;
use api_core::decision::vendor::vendor_api::loaders::load_response_for_vendor_api;
use api_core::errors::AssertionError;
use api_core::errors::ValidationError;
use api_core::telemetry::RootSpan;
use api_core::types::ApiListResponse;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::headers::InsightHeaders;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::utils::vault_wrapper::VwArgs;
use api_core::FpResult;
use api_wire_types::AmlHit;
use api_wire_types::AmlHitMedia;
use api_wire_types::RiskSignalFilters;
use api_wire_types::ScoreBand;
use api_wire_types::SentilinkDetail;
use api_wire_types::SentilinkScoreDetail;
use db::models::audit_event::AuditEvent;
use db::models::audit_event::NewAuditEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::risk_signal::AtSeqno;
use db::models::risk_signal::RiskSignal;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use db::models::verification_request::RequestAndResult;
use db::models::verification_request::VReqIdentifier;
use db::models::verification_request::VerificationRequest;
use db::models::verification_result::VerificationResult;
use db::DbResult;
use itertools::Itertools;
use newtypes::vendor_api_struct::IncodeUpdatedWatchlistResult;
use newtypes::vendor_api_struct::IncodeWatchlistCheck;
use newtypes::AuditEventDetail;
use newtypes::DataIdentifier;
use newtypes::DbActor;
use newtypes::DecryptionContext;
use newtypes::EncryptedVaultPrivateKey;
use newtypes::FootprintReasonCode;
use newtypes::FpId;
use newtypes::IdentityDataKind as IDK;
use newtypes::PiiJsonValue;
use newtypes::RiskSignalId;
use newtypes::SentilinkApplicationRisk;
use newtypes::TenantId;
use newtypes::Vendor;
use newtypes::VendorAPI;
use newtypes::VerificationRequestId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::post;
use paperclip::actix::web;
use std::collections::HashMap;

#[api_v2_operation(
    description = "Lists the risk signals for a footprint user.",
    tags(EntityDetails, Entities, Private)
)]
#[get("/entities/{fp_id}/risk_signals")]
pub async fn get(
    state: web::Data<State>,
    request: FpIdPath,
    filters: web::Query<RiskSignalFilters>,
    version: web::Query<api_wire_types::GetHistoricalDataRequest>,
    // TODO remove SecretTenantAuthContext here when everyone has migrated to the new GET
    // /users/<>/risk_signals API
    auth: Either<TenantSessionAuth, TenantApiKeyAuth>,
    root_span: RootSpan,
) -> ApiListResponse<api_wire_types::RiskSignal> {
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
    let api_wire_types::GetHistoricalDataRequest { seqno } = version.into_inner();

    let signals = state
        .db_query(move |conn| -> DbResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            RiskSignal::latest_by_risk_signal_group_kinds(conn, &sv.id, AtSeqno(seqno))
        })
        .await?
        .into_iter()
        .filter(|(_, rs)| !rs.reason_code.to_be_deprecated())
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

    Ok(signals)
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
) -> ApiResponse<api_wire_types::RiskSignalDetail> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let (fp_id, risk_signal_id) = request.into_inner();

    let (rs, aml_detail, sentilink_detail) =
        get_risk_signal_and_maybe_detail(&state, risk_signal_id, fp_id, tenant_id, is_live).await?;
    let has_aml_hits = aml_detail.is_some();

    Ok(api_wire_types::RiskSignalDetail::from_db((
        rs,
        has_aml_hits,
        sentilink_detail,
    )))
}

const DECRYPT_AML_HITS_AUDIT_EVENT_REASON: &str = "Reviewing AML information";

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
) -> ApiResponse<api_wire_types::AmlDetail> {
    let read_auth = auth.clone().check_guard(TenantGuard::Read)?;
    let tenant_id = read_auth.tenant().id.clone();
    let is_live = read_auth.is_live()?;
    let (fp_id, risk_signal_id) = request.into_inner();

    // TODO: assert decrypt permissions + write AuditEvent. maybe just shoehorn into existing structs
    // as (FirstName, MiddleName, LastName, Dob) or need to rework some of this stuff to not be so DI
    // dependent

    let (_rs, aml_detail, _) =
        get_risk_signal_and_maybe_detail(&state, risk_signal_id, fp_id, tenant_id.clone(), is_live).await?;
    let Some((aml_detail, vreq)) = aml_detail else {
        Err(AssertionError("No AML hit data for risk signal"))?
    };

    // Populate the vault with the seqno of the time of the AML call we made and figure out which of
    // FirstName/LastName/Dob we would have sent to Incode
    let sv_id = vreq.scoped_vault_id.clone();
    let uvw = state
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

    // check that auth has Decrypt permissions for these DIs. Note we don't check check_ob_config_access
    // here- this seems unnecessary and we should never allow an OBC that makes AML calls but then
    // doesn't allow the user to view the results
    let auth = auth.check_guard(CanDecrypt::new(dis_searched.clone()))?;

    // write an AuditEvent
    let principal: DbActor = auth.actor().into();
    let insight = CreateInsightEvent::from(insights);
    state
        .db_transaction(move |conn| -> FpResult<_> {
            let insight_event_id = insight.insert_with_conn(conn)?.id;
            let reason = DECRYPT_AML_HITS_AUDIT_EVENT_REASON.to_owned();

            let event = NewAuditEvent {
                tenant_id,
                principal_actor: principal,
                insight_event_id,
                detail: AuditEventDetail::DecryptUserData {
                    is_live,
                    scoped_vault_id: sv_id,
                    reason,
                    context: DecryptionContext::Api,
                    decrypted_fields: dis_searched,
                },
            };
            AuditEvent::create(conn, event)?;

            Ok(())
        })
        .await?;

    Ok(aml_detail)
}


#[api_v2_operation(
    description = "Decrypts structured information about the sentilink risk levels",
    tags(EntityDetails, Entities, Private)
)]
#[post("/entities/{fp_id}/sentilink/{signal_id}")]
pub async fn get_sentilink_detail(
    state: web::Data<State>,
    request: web::Path<(FpId, RiskSignalId)>,
    auth: TenantSessionAuth,
) -> ApiResponse<api_wire_types::SentilinkDetail> {
    // TODO: check for some sort of tenant_user permission for senti dash access?
    let read_auth = auth.clone().check_guard(TenantGuard::Read)?;
    let tenant_id = read_auth.tenant().id.clone();
    let is_live = read_auth.is_live()?;
    let (fp_id, risk_signal_id) = request.into_inner();

    let (vreq_id, vw, rs) = state
        .db_query(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let rs = RiskSignal::get(conn, &risk_signal_id, &sv.id)?;
            let (vreq, _) = VerificationResult::get(conn, &rs.verification_result_id)?;
            let vw = VaultWrapper::<Any>::build(
                conn,
                VwArgs::Historical(&vreq.scoped_vault_id, vreq.uvw_snapshot_seqno),
            )?;

            Ok((vreq.id, vw, rs))
        })
        .await?;

    if !matches!(rs.vendor_api.into(), Vendor::Sentilink) {
        return Err(ValidationError("Risk signal is not from sentilink").into());
    }


    let detail = get_synthetic_reason_codes_for_risk_signal(&state, vreq_id, &vw).await?;


    Ok(detail)
}

async fn get_synthetic_reason_codes_for_risk_signal(
    state: &State,
    vreq_id: VerificationRequestId,
    vw: &VaultWrapper,
) -> FpResult<api_wire_types::SentilinkDetail> {
    let res = load_response_for_vendor_api(
        state,
        VReqIdentifier::Id(vreq_id.clone()),
        &vw.vault.e_private_key,
        SentilinkApplicationRisk,
    )
    .await?
    .ok();

    let Some((response, _)) = res else {
        Err(AssertionError("No sentilink result found"))?
    };

    let synthetic = response
        .sentilink_synthetic_score
        .clone()
        .and_then(|s| s.score().ok())
        .map(|sc| {
            let band = sentilink_score_band_from_score(sc.score);
            (sc, band)
        })
        .map(SentilinkScoreDetail::from_db);
    let id_theft = response
        .sentilink_id_theft_score
        .clone()
        .and_then(|s| s.score().ok())
        .map(|sc| {
            let band = sentilink_score_band_from_score(sc.score);
            (sc, band)
        })
        .map(SentilinkScoreDetail::from_db);

    Ok(SentilinkDetail { synthetic, id_theft })
}

fn sentilink_score_band_from_score(score: i32) -> ScoreBand {
    if score > sentilink::SCORE_THRESHOLD_HIGH {
        ScoreBand::High
    } else if score > sentilink::SCORE_THRESHOLD_MEDIUM {
        ScoreBand::Medium
    } else {
        ScoreBand::Low
    }
}


pub type HasSentilinkDetail = bool;
async fn get_risk_signal_and_maybe_detail(
    state: &State,
    risk_signal_id: RiskSignalId,
    fp_id: FpId,
    tenant_id: TenantId,
    is_live: bool,
) -> FpResult<(
    RiskSignal,
    Option<(api_wire_types::AmlDetail, VerificationRequest)>,
    HasSentilinkDetail,
)> {
    let (rs, vreq_vres_key_obc) = state
        .db_query(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let rs = RiskSignal::get(conn, &risk_signal_id, &sv.id)?;
            let vreq_vres_key = if rs.reason_code.is_aml() {
                // we only need to read the vres if it was an Aml risk signal and we need to populate the
                // `aml` portion of the response
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
        get_aml_hits(state, &obc, vreq_vres.clone(), key)
            .await?
            .map(|a| (a, vreq_vres.0))
    } else {
        None
    };

    let has_sentilink_detail = matches!(rs.vendor_api.into(), Vendor::Sentilink);


    Ok((rs, aml_detail, has_sentilink_detail))
}

async fn get_aml_hits(
    state: &State,
    obc: &ObConfiguration,
    vreq_vres: RequestAndResult,
    private_key: EncryptedVaultPrivateKey,
) -> FpResult<Option<api_wire_types::AmlDetail>> {
    let decrypted_response = match vreq_vres.0.vendor_api {
        VendorAPI::IncodeWatchlistCheck => load_response_for_vendor_api(
            state,
            VReqIdentifier::Id(vreq_vres.0.id),
            &private_key,
            IncodeWatchlistCheck,
        )
        .await?
        .ok()
        .map(|(res, _)| res),
        VendorAPI::IncodeUpdatedWatchlistResult => load_response_for_vendor_api(
            state,
            VReqIdentifier::Id(vreq_vres.0.id),
            &private_key,
            IncodeUpdatedWatchlistResult,
        )
        .await?
        .ok()
        .map(|(res, _)| res.0),
        _ => None,
    };

    if let Some(wc) = decrypted_response {
        let share_url = wc
            .content
            .as_ref()
            .and_then(|c| c.data.as_ref())
            .and_then(|d| d.share_url.clone());

        let enhanced_aml = &obc.verification_checks().enhanced_aml();
        let leaked_hits = decision::features::incode_watchlist::get_hits(&wc, enhanced_aml, &obc.tenant_id)
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

        Ok(Some(api_wire_types::AmlDetail {
            share_url,
            hits: aml_hits,
        }))
    } else {
        Ok(None)
    }
}
