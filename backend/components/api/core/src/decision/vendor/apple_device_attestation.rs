//! logic for integrating into risk signal/decision engine
use crate::decision;
use crate::decision::vendor;
use crate::errors::ApiResult;
use db::models::risk_signal::RiskSignal;
use db::models::verification_request::VerificationRequest;
use db::models::verification_result::VerificationResult;
use db::{
    models::{apple_device_attest::AppleDeviceAttestation, decision_intent::DecisionIntent},
    TxnPgConn,
};
use idv::footprint::FootprintDeviceAttestationData;
use idv::{ParsedResponse, VendorResponse};
use newtypes::PiiJsonValue;
use newtypes::RiskSignalGroupKind;
use newtypes::{DecisionIntentKind, ScopedVaultId, VaultPublicKey, VendorAPI, WorkflowId};

pub fn save_vendor_result_and_risk_signals(
    conn: &mut TxnPgConn,
    res: &AppleDeviceAttestation,
    public_key: &VaultPublicKey,
    sv_id: &ScopedVaultId,
    wf_id: Option<&WorkflowId>,
    is_live: bool,
) -> ApiResult<(VerificationRequest, VerificationResult, Vec<RiskSignal>)> {
    // count the associated vaults derived by this attestation
    let associated_vault_count = res.count_associated_vaults(conn, is_live)?;

    let di = DecisionIntent::create(conn, DecisionIntentKind::DeviceAttestation, sv_id, wf_id)?;

    // Our synthetic "vendor" response payload
    let vres_data = FootprintDeviceAttestationData {
        associated_vault_count: Some(associated_vault_count),
        apple_device_attestation: Some(serde_json::to_value(res)?),
    };
    let (vreq, vres) = vendor::verification_result::save_vreq_and_vres(
        conn,
        public_key,
        sv_id,
        &di.id,
        Ok(VendorResponse {
            raw_response: PiiJsonValue::new(serde_json::to_value(&vres_data)?),
            response: ParsedResponse::FootprintDeviceAttestation(vres_data),
        }),
    )?;

    let reason_codes =
        decision::features::fp_ios_attestation::generate_reason_codes(res, associated_vault_count);
    let rs = RiskSignal::bulk_create(
        conn,
        sv_id,
        reason_codes
            .into_iter()
            .map(|rc| (rc, VendorAPI::FootprintDeviceAttestation, vres.id.clone()))
            .collect::<Vec<_>>(),
        RiskSignalGroupKind::NativeDevice,
        false,
    )?;

    Ok((vreq, vres, rs))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::decision::vendor::vendor_result::VendorResult;
    use crate::errors::ApiResult;
    use crate::State;
    use db::tests::fixtures;
    use db::tests::test_db_pool::TestDbPool;
    use macros::test_state;

    #[test_state]
    async fn test_deser(state: &mut State) {
        let (vreq, vres, private_key) = state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let uv = fixtures::vault::create_person(conn, true);
                let t = fixtures::tenant::create(conn);
                let obc = fixtures::ob_configuration::create(conn, &t.id, true);
                let sv = fixtures::scoped_vault::create(conn, &uv.id, &obc.id);

                let attest = fixtures::apple_device_attestation::create(conn, &uv.id);

                let (vreq, vres, _rs) =
                    save_vendor_result_and_risk_signals(conn, &attest, &uv.public_key, &sv.id, None, false)
                        .unwrap();

                Ok((vreq, vres, uv.e_private_key.clone()))
            })
            .await
            .unwrap();

        // We can properly deserialize the saved vendor response
        let vr = VendorResult::from_verification_results_for_onboarding(
            vec![(vreq, Some(vres))],
            &state.enclave_client,
            &private_key,
        )
        .await
        .unwrap();
        assert_eq!(1, vr.len());
    }
}
