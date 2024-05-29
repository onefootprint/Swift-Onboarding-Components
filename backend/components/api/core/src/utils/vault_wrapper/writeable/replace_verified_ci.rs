use super::portablize_data::on_otp_verified;
use super::{
    DataLifetimeSources,
    DataRequestSource,
    FingerprintedDataRequest,
    PatchDataResult,
    WriteableVw,
};
use crate::errors::{
    ApiResult,
    AssertionError,
    ValidationError,
};
use db::TxnPgConn;
use newtypes::{
    DataIdentifier as DI,
    DataLifetimeSource,
    IdentityDataKind as IDK,
};

impl<Type> WriteableVw<Type> {
    #[tracing::instrument("WriteableVw::replace_verified_ci", skip_all)]
    /// Replace an authenticated user's contact info with another OTP-verified piece of contact info
    pub fn replace_verified_ci(
        self, // consume self, since we don't want stale data getting used
        conn: &mut TxnPgConn,
        request: FingerprintedDataRequest,
        source: DataLifetimeSource,
    ) -> ApiResult<()> {
        // Validate only phone/email
        if request
            .data
            .keys()
            .any(|di| !matches!(di, DI::Id(IDK::PhoneNumber) | DI::Id(IDK::Email)))
        {
            return ValidationError("Can only replace_ci with phone or email").into();
        }
        let sources = DataLifetimeSources::single(source);
        let request =
            self.validate_request(conn, request, sources, None, DataRequestSource::UpdateContactInfo)?;
        let PatchDataResult { new_ci, .. } = self.internal_save_data(conn, request, None)?;
        let (_, ci) = new_ci
            .into_iter()
            .next()
            .ok_or(AssertionError("Didn't make CI"))?;
        on_otp_verified(conn, ci, &self.scoped_vault_id, &self.vault.id)?;
        Ok(())
    }
}
