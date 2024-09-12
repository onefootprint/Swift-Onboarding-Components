use super::DataLifetimeSources;
use super::DataRequestSource;
use super::FingerprintedDataRequest;
use super::WriteableVw;
use crate::errors::AssertionError;
use crate::errors::ValidationError;
use crate::FpResult;
use db::models::contact_info::ContactInfo;
use db::models::contact_info::VerificationLevel;
use db::models::data_lifetime::DataLifetime;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault::ScopedVaultUpdate;
use db::models::vault::Vault;
use db::TxnPgConn;
use newtypes::ContactInfoKind;
use newtypes::DataLifetimeSource;
use newtypes::ScopedVaultId;
use newtypes::VaultId;

impl<Type> WriteableVw<Type> {
    #[tracing::instrument("WriteableVw::replace_verified_ci", skip_all)]
    /// Replace an authenticated user's contact info with another OTP-verified piece of contact info
    pub fn replace_verified_ci(
        self, // consume self, since we don't want stale data getting used
        conn: &mut TxnPgConn,
        request: FingerprintedDataRequest,
        source: DataLifetimeSource,
    ) -> FpResult<()> {
        // Validate only phone/email
        if request
            .data
            .keys()
            .any(|di| !di.is_verified_ci() && !di.is_unverified_ci())
        {
            return ValidationError("Can only replace_ci with phone or email").into();
        }
        let sources = DataLifetimeSources::single(source);
        let request =
            self.validate_request(conn, request, sources, None, DataRequestSource::UpdateContactInfo)?;
        let result = self.internal_save_data(conn, request, None)?;
        for vd in result.new_vd {
            // Immediately portablize the verified contact info
            DataLifetime::portablize(conn, &vd.lifetime_id, result.seqno)?;
        }
        // TODO need to do on_otp_verified for old ci if any
        let (_, ci) = result
            .new_ci
            .into_iter()
            .next()
            .ok_or(AssertionError("Didn't make CI"))?;
        on_otp_verified(conn, ci, &self.sv.id, &self.vault.id)?;
        Ok(())
    }

    pub fn mark_ci_as_verified(
        self, // consume self, since we don't want stale data getting used
        conn: &mut TxnPgConn,
        request: FingerprintedDataRequest,
        source: DataLifetimeSource,
        cik: ContactInfoKind,
    ) -> FpResult<IsFirstTimeVerifying> {
        // Validate only phone/email
        if request.data.keys().any(|di| !di.is_verified_ci()) {
            return ValidationError("Can only mark_ci_as_verified with verified phone or email").into();
        }
        // TODO the phone number used in this challenge could have drifted from id.phone_number.
        // Clean up after we deprecate contact info
        let dl = self
            .get_lifetime(&cik.di())
            .ok_or(AssertionError("No existing CI"))?;
        let ci = ContactInfo::get(conn, &dl.id)?;
        let is_first_time_verifying = on_otp_verified(conn, ci, &self.sv.id, &self.vault.id)?;
        if is_first_time_verifying {
            let sources = DataLifetimeSources::single(source);
            let request =
                self.validate_request(conn, request, sources, None, DataRequestSource::UpdateContactInfo)?;
            let result = self.internal_save_data(conn, request, None)?;
            for vd in result.new_vd {
                // Immediately portablize the verified contact info
                DataLifetime::portablize(conn, &vd.lifetime_id, result.seqno)?;
            }
        }
        Ok(is_first_time_verifying)
    }
}

type IsFirstTimeVerifying = bool;

pub fn on_otp_verified(
    conn: &mut TxnPgConn,
    ci: ContactInfo,
    sv_id: &ScopedVaultId,
    v_id: &VaultId,
) -> FpResult<IsFirstTimeVerifying> {
    let is_first_time_verifying_ci = !ci.is_otp_verified;
    if is_first_time_verifying_ci {
        ContactInfo::mark_verified(conn, &ci.id, VerificationLevel::OtpVerified)?;
        let seqno = DataLifetime::get_next_seqno(conn)?;
        DataLifetime::portablize(conn, &ci.lifetime_id, seqno)?;
    }
    Vault::mark_verified(conn, v_id)?;
    let update = ScopedVaultUpdate {
        is_active: Some(true),
        ..ScopedVaultUpdate::default()
    };
    ScopedVault::update(conn, sv_id, update)?;
    Ok(is_first_time_verifying_ci)
}
