use super::DataRequestSource;
use super::FingerprintedDataRequest;
use super::WriteableVw;
use crate::FpResult;
use api_errors::BadRequestInto;
use api_errors::ServerErrInto;
use db::models::contact_info::ContactInfo;
use db::models::data_lifetime::DataLifetime;
use db::models::data_lifetime::DataLifetimeSeqnoTxn;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault::ScopedVaultUpdate;
use db::models::vault::Vault;
use db::TxnPgConn;

impl<Type> WriteableVw<Type> {
    #[tracing::instrument("WriteableVw::save_ci_after_otp", skip_all)]
    /// Save phone/email after a successful OTP.
    ///
    /// Returns the DataLifetime transaction used for the patch operation.
    pub fn save_ci_after_otp(
        self, // consume self, since we don't want stale data getting used
        conn: &mut TxnPgConn,
        request: FingerprintedDataRequest,
    ) -> FpResult<DataLifetimeSeqnoTxn<'static>> {
        let vault_id = self.vault.id.clone();
        let sv_id = self.sv.id.clone();

        // Validate only phone/email
        if request
            .data
            .keys()
            .any(|di| !di.is_verified_ci() && !di.is_unverified_ci())
        {
            return BadRequestInto("Can only replace_ci with phone or email");
        }

        let request = self.validate_request(conn, request, &DataRequestSource::OtpVerified)?;
        let result = self.internal_save_data(conn, request, None)?;

        let Some(updates) = result.updates else {
            return ServerErrInto("No vault updates in save_ci_after_otp");
        };

        // Since the data saved here is always OTP verified, immediately portablize the new DLs and mark the
        // CIs as OTP verified
        for vd in &updates.vd {
            DataLifetime::portablize(conn, &updates.sv_txn, &vd.lifetime_id)?;
        }
        for (_, ci) in &updates.ci {
            ContactInfo::mark_otp_verified(conn, &ci.id)?;
        }

        // Mark the vault as verified now that we have an OTPed contact info
        Vault::mark_verified(conn, &vault_id)?;
        let update = ScopedVaultUpdate {
            is_active: Some(true),
            ..ScopedVaultUpdate::default()
        };
        ScopedVault::update(conn, &sv_id, update)?;

        Ok(updates.sv_txn)
    }
}
