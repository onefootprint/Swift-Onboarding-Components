use crate::diesel::ExpressionMethods;
use crate::PgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::webauthn_credential;
use db_schema::schema::webauthn_credential::BoxedQuery;
use diesel::pg::Pg;
use diesel::Insertable;
use diesel::QueryDsl;
use diesel::Queryable;
use diesel::RunQueryDsl;
use itertools::Itertools;
use newtypes::AttestationType;
use newtypes::InsightEventId;
use newtypes::PasskeyId;
use newtypes::ScopedVaultId;
use newtypes::VaultId;

// TODO handle when a user tries to add a second webauthn credential
#[derive(Debug, Clone, Queryable, Identifiable)]
#[diesel(table_name = webauthn_credential)]
pub struct Passkey {
    pub id: PasskeyId,
    pub vault_id: VaultId,
    /// a webauthn "key handle" aka as "credential id": https://www.w3.org/TR/webauthn-2/#credential-id
    pub credential_id: Vec<u8>,
    pub public_key: Vec<u8>,
    /// TODO this is not used? It seems like it would be difficult to use properly now that
    /// Passkeys are scoped-vault-specific
    pub counter: i32,
    pub attestation_data: Vec<u8>,

    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub backup_eligible: bool,
    pub attestation_type: AttestationType,
    pub insight_event_id: InsightEventId,
    pub backup_state: bool,
    pub deactivated_at: Option<DateTime<Utc>>,
    /// Webauthn credentials are specific to a scoped vault. So, the same credential may exist at
    /// multiple tenants.
    pub scoped_vault_id: ScopedVaultId,
    /// When prefilled, a pointer to the original Passkey
    pub origin_id: Option<PasskeyId>,
}

#[derive(derive_more::From)]
pub enum PasskeyIdentifier<'a> {
    VaultId(&'a VaultId),
    ScopedVaultId(&'a ScopedVaultId),
}

impl Passkey {
    #[tracing::instrument("Passkey::list", skip_all)]
    /// Lists the webauthn credentials available for the user identifier.
    /// Webauthn credentials are tenant-specific, so given a ScopedVaultId, we return the list of
    /// credentials registered to that tenant.
    /// Given a VaultId (when onboarding onto a new tenant, or in my1fp), we return only the most
    /// recent credential.
    pub fn list<'a, T: Into<PasskeyIdentifier<'a>>>(conn: &mut PgConn, id: T) -> FpResult<Vec<Self>> {
        let results = Self::list_query(id).get_results(conn)?;
        Ok(results)
    }

    fn list_query<'a, T: Into<PasskeyIdentifier<'a>>>(id: T) -> BoxedQuery<'a, Pg> {
        match id.into() {
            PasskeyIdentifier::ScopedVaultId(sv_id) => webauthn_credential::table
                .filter(webauthn_credential::scoped_vault_id.eq(sv_id))
                .filter(webauthn_credential::deactivated_at.is_null())
                .into_boxed(),
            PasskeyIdentifier::VaultId(v_id) => {
                // Arbitrarily, we've decided that when loading the webauthn creds in a _user_-specific
                // context, we'll only return the latest credential.
                // Perhaps one day we'll return all active credentials.
                webauthn_credential::table
                    .filter(webauthn_credential::deactivated_at.is_null())
                    .filter(webauthn_credential::vault_id.eq(v_id))
                    .order_by(webauthn_credential::_created_at.desc())
                    .limit(1)
                    .into_boxed()
            }
        }
    }

    /// Since `Passkey`s are scoped-vault specific, when a new scoped vault is created,
    /// we need to copy the user's existing `Passkey`s into the newly created
    /// ScopedVault just like prefill vault data.
    pub fn prefill_to_new_sv(
        conn: &mut PgConn,
        source_vault_id: &VaultId,
        destination_sv_id: &ScopedVaultId,
    ) -> FpResult<()> {
        let creds = Self::list(conn, source_vault_id)?;
        let new_creds = creds
            .into_iter()
            .map(|cred| NewPasskey {
                vault_id: cred.vault_id,
                credential_id: cred.credential_id,
                public_key: cred.public_key,
                attestation_data: cred.attestation_data,
                backup_eligible: cred.backup_eligible,
                attestation_type: cred.attestation_type,
                insight_event_id: cred.insight_event_id,
                backup_state: cred.backup_state,
                // Every attribute is copied directly _except_ for the scoped_vault_id, which is different
                scoped_vault_id: destination_sv_id.clone(),
                origin_id: Some(cred.id),
            })
            .collect_vec();
        diesel::insert_into(webauthn_credential::table)
            .values(new_creds)
            .execute(conn)?;
        Ok(())
    }

    #[tracing::instrument("Passkey::update_backup_state", skip_all)]
    /// Set the backup_state to true for all Passkeys owned by the provided VaultId with
    /// the provided credential ID.
    /// There may be multiple if this credential is active at multiple tenants.
    pub fn set_backup_state(conn: &mut PgConn, vault_id: &VaultId, cred_id: &[u8]) -> FpResult<()> {
        diesel::update(webauthn_credential::table)
            .filter(webauthn_credential::vault_id.eq(vault_id))
            .filter(webauthn_credential::credential_id.eq(cred_id))
            .set(webauthn_credential::backup_state.eq(true))
            .execute(conn)?;
        Ok(())
    }

    /// Since the challenge generated for the client allows using one of multiple webauthn
    /// credentials, find the exact Passkey id that was utilized.
    /// If a `sv_id`` is provided, filters to only webauthn credentials owned by that tenant
    #[tracing::instrument("Passkey::get_by_credential_id", skip_all)]
    pub fn get_by_credential_id<'a>(
        conn: &mut PgConn,
        id: PasskeyIdentifier<'a>,
        cred_id: &[u8],
    ) -> FpResult<Self> {
        // This could return multiple credentials if they're registered at different tenants
        let result = Self::list_query(id)
            .filter(webauthn_credential::credential_id.eq(cred_id))
            .get_result::<Self>(conn)?;
        Ok(result)
    }

    #[tracing::instrument("Passkey::deactivate", skip_all)]
    /// Deactivate any webauthn credentials for the provided vault
    pub fn deactivate(conn: &mut PgConn, sv_id: &ScopedVaultId) -> FpResult<()> {
        diesel::update(webauthn_credential::table)
            .filter(webauthn_credential::scoped_vault_id.eq(sv_id))
            .set(webauthn_credential::deactivated_at.eq(Utc::now()))
            .execute(conn)?;
        Ok(())
    }
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = webauthn_credential)]
pub struct NewPasskey {
    pub vault_id: VaultId,
    pub credential_id: Vec<u8>,
    pub public_key: Vec<u8>,
    pub attestation_data: Vec<u8>,
    pub backup_eligible: bool,
    pub attestation_type: AttestationType,
    pub insight_event_id: InsightEventId,
    pub backup_state: bool,
    pub scoped_vault_id: ScopedVaultId,
    pub origin_id: Option<PasskeyId>,
}

impl NewPasskey {
    #[tracing::instrument("NewPasskey::save", skip_all)]
    pub fn save(self, conn: &mut PgConn) -> FpResult<Passkey> {
        let result = diesel::insert_into(webauthn_credential::table)
            .values(self)
            .get_result(conn)?;
        Ok(result)
    }
}
