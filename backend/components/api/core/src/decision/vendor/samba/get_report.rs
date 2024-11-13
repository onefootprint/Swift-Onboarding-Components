use crate::decision::vendor::into_fp_error;
use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::decision::vendor::verification_result::SaveVerificationResultArgs;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::DataRequestSource;
use crate::utils::vault_wrapper::FingerprintedDataRequest;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::VwArgs;
use crate::utils::vault_wrapper::WriteableVw;
use crate::FpResult;
use crate::State;
use api_errors::ServerErrInto;
use db::models::data_lifetime::DataLifetime;
use db::models::decision_intent::DecisionIntent;
use db::models::samba_order::SambaOrder;
use db::models::samba_order::UpdateSambaOrder;
use db::models::samba_report::SambaReport;
use db::models::scoped_vault::ScopedVault;
use db::TxnPgConn;
use idv::samba::common::SambaGetReportRequest;
use idv::samba::response::webhook::SambaWebhook;
use idv::samba::response::SambaLinkType;
use newtypes::samba::SambaOrderKind;
use newtypes::DataLifetimeSeqno;
use newtypes::DataRequest;
use newtypes::DocumentDiKind;
use newtypes::IdDocKind;
use newtypes::OcrDataKind;
use newtypes::PiiJsonValue;
use newtypes::SambaReportId;
use newtypes::ScopedVaultId;
use newtypes::ValidateArgs;
use newtypes::VendorAPI;
use std::collections::HashMap;


#[tracing::instrument(skip_all)]
pub async fn get_samba_report(state: &State, webhook: SambaWebhook, kind: SambaOrderKind) -> FpResult<()> {
    let link_type = match kind {
        SambaOrderKind::LicenseValidation => SambaLinkType::LicenseReports,
        SambaOrderKind::ActivityHistory => SambaLinkType::ActivityHistory,
    };
    let Some(report_id) = webhook
        .get_link(link_type)
        .map(|l| SambaReportId::from(l.report_id))
    else {
        return ServerErrInto("missing report id");
    };

    let order_id = webhook.data.order_id.clone();
    let (order, di, tenant_id, vw) = state
        .db_query(move |conn| -> FpResult<_> {
            // TODO: handle error from not finding Order?
            let order = SambaOrder::get(conn, &order_id)?;
            let di = DecisionIntent::get(conn, &order.decision_intent_id)?;
            let sv = ScopedVault::get(conn, &di.scoped_vault_id)?;
            let tenant_id = sv.tenant_id.clone();
            let vw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sv.id))?;

            Ok((order, di, tenant_id, vw))
        })
        .await?;

    if order.completed_at.is_some() {
        tracing::info!(order_id=%order.id, "samba order already completed");
        return Ok(());
    }

    let tvc =
        TenantVendorControl::new(tenant_id, &state.db_pool, &state.config, &state.enclave_client).await?;


    // make request

    let (vres_id, vault_data) = match kind {
        SambaOrderKind::LicenseValidation => {
            let request = SambaGetReportRequest::new(tvc.samba_credentials(), report_id.clone());
            let res = state
                .vendor_clients
                .samba
                .samba_get_license_validation_report
                .make_request(request)
                .await;
            // save
            let args = SaveVerificationResultArgs::new_for_samba(
                &res,
                di.id.clone(),
                di.scoped_vault_id.clone(),
                vw.vault.public_key.clone(),
                VendorAPI::SambaLicenseValidationGetReport,
                order.document_id.clone(),
            );
            let (vres_id, _) = args.save(&state.db_pool).await?;

            let resp = res.map_err(into_fp_error)?;
            let _ = resp.result.into_success().map_err(into_fp_error)?;
            (vres_id, None)
        }
        SambaOrderKind::ActivityHistory => {
            let request = SambaGetReportRequest::new(tvc.samba_credentials(), report_id.clone());
            let res = state
                .vendor_clients
                .samba
                .samba_get_activity_history_report
                .make_request(request)
                .await;
            let args = SaveVerificationResultArgs::new_for_samba(
                &res,
                di.id.clone(),
                di.scoped_vault_id.clone(),
                vw.vault.public_key.clone(),
                VendorAPI::SambaActivityHistoryGetReport,
                order.document_id.clone(),
            );
            let (vres_id, _) = args.save(&state.db_pool).await?;
            let resp = res.map_err(into_fp_error)?;
            let raw = resp.raw_response.clone();
            let _ = resp.result.into_success().map_err(into_fp_error)?;
            let data =
                compute_vault_data_for_activity_history(state, raw, false, &di.scoped_vault_id).await?;

            (vres_id, Some(data))
        }
    };

    state
        .db_transaction(move |conn| -> FpResult<_> {
            let locked = SambaOrder::lock(conn, &order.id)?;
            // check again we should be creating the report
            if locked.completed_at.is_none() {
                // Vault the data if applicable
                let seqno = if let Some(data) = vault_data {
                    vault_samba_response(conn, &di.scoped_vault_id, data)?
                } else {
                    DataLifetime::get_current_seqno(conn)?
                };

                let _ = SambaReport::create(conn, order.id, report_id, vres_id, seqno)?;
                let update = UpdateSambaOrder::set_completed_at();
                let _ = SambaOrder::update(conn, locked, update)?;
            }

            Ok(())
        })
        .await?;

    Ok(())
}


pub async fn compute_vault_data_for_activity_history(
    state: &State,
    response: PiiJsonValue,
    is_live: bool,
    sv_id: &ScopedVaultId,
) -> FpResult<FingerprintedDataRequest> {
    let data = vec![(
        DocumentDiKind::OcrData(
            IdDocKind::DriversLicense,
            OcrDataKind::SambaActivityHistoryResponse,
        )
        .into(),
        response,
    )];
    let validate_args = ValidateArgs::for_bifrost(is_live);

    let data = HashMap::from_iter(data.into_iter());
    let data = DataRequest::clean_and_validate(data, validate_args)?;
    let data = FingerprintedDataRequest::build(state, data, sv_id).await?;
    Ok(data)
}

pub fn vault_samba_response(
    conn: &mut TxnPgConn,
    sv_id: &ScopedVaultId,
    data: FingerprintedDataRequest,
) -> FpResult<DataLifetimeSeqno> {
    let vw: WriteableVw<Any> = VaultWrapper::lock_for_onboarding(conn, sv_id)?;
    let result = vw.patch_data(conn, data, DataRequestSource::Ocr)?;

    Ok(result.seqno)
}
