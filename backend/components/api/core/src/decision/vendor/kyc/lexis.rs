use db::models::ob_configuration::ObConfiguration;
use feature_flag::BoolFlag;
use newtypes::{DecisionIntentId, ScopedVaultId, VendorAPI};

use crate::{
    decision::vendor::{
        make_request, tenant_vendor_control::TenantVendorControl, vendor_result::VendorResult,
    },
    errors::ApiResult,
    utils::vault_wrapper::VaultWrapper,
    State,
};

pub async fn maybe_shadow_call_lexis(
    state: &State,
    tvc: &TenantVendorControl,
    sv_id: &ScopedVaultId,
    di_id: &DecisionIntentId,
    obc: &ObConfiguration,
    vw: &VaultWrapper,
) -> ApiResult<()> {
    if tvc.enabled_vendor_apis().contains(&VendorAPI::LexisFlexId)
        && state
            .feature_flag_client
            .flag(BoolFlag::MakeLexisCall(&obc.tenant_id))
    {
        let (vreq, vres, vendor_res) = make_request::make_idv_vendor_call_save_vreq_vres(
            state,
            tvc,
            sv_id,
            di_id,
            obc.key.clone(),
            VendorAPI::LexisFlexId,
        )
        .await?;

        match vendor_res {
            Ok(vr) => {
                let vr = VendorResult {
                    response: vr,
                    verification_result_id: vres.id,
                    verification_request_id: vreq.id,
                };
                super::waterfall::eval_waterfall_rules(vr, vw, obc)?;
            }
            Err(err) => {
                tracing::error!(?err, tenant_id=%obc.tenant_id, %sv_id, "Lexis vendor call error")
            }
        }
    }

    Ok(())
}
