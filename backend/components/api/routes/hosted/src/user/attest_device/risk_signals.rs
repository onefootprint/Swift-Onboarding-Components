//! logic for integrating into risk signal/decision engine
use api_core::decision;
use api_core::decision::vendor;
use db::models::risk_signal::RiskSignal;
use db::{
    models::{apple_device_attest::AppleDeviceAttestation, decision_intent::DecisionIntent},
    TxnPgConn,
};
use idv::{ParsedResponse, VendorResponse};
use newtypes::PiiJsonValue;
use newtypes::RiskSignalGroupKind;
use newtypes::{DecisionIntentKind, ScopedVaultId, VaultPublicKey, VendorAPI, WorkflowId};

pub mod ios {
    use api_core::errors::ApiResult;

    use super::*;

    pub fn create(
        conn: &mut TxnPgConn,
        res: &AppleDeviceAttestation,
        public_key: &VaultPublicKey,
        sv_id: &ScopedVaultId,
        wf_id: Option<&WorkflowId>,
        is_live: bool,
    ) -> ApiResult<()> {
        // count the associated vaults derived by this attestation
        let associated_vault_count = res.count_associated_vaults(conn, is_live)?;

        let di = DecisionIntent::create(conn, DecisionIntentKind::DeviceAttestation, sv_id, wf_id)?;

        let (_, vres) = vendor::verification_result::save_vreq_and_vres(
            conn,
            public_key,
            sv_id,
            &di.id,
            Ok(VendorResponse {
                response: ParsedResponse::FootprintAppleDevicePayload {
                    associated_vault_count,
                },
                raw_response: PiiJsonValue::new(serde_json::to_value(res)?),
            }),
        )?;

        let reason_codes =
            decision::features::fp_ios_attestation::generate_reason_codes(res, associated_vault_count);
        let _rs = RiskSignal::bulk_create(
            conn,
            sv_id,
            reason_codes
                .into_iter()
                .map(|rc| (rc, VendorAPI::FootprintDeviceAttestation, vres.id.clone()))
                .collect::<Vec<_>>(),
            RiskSignalGroupKind::NativeDevice,
            false,
        )?;

        Ok(())
    }
}
