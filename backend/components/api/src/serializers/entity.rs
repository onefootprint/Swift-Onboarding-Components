use super::UserDetail;
use crate::utils::db2api::DbToApi;
use db::models::scoped_vault::ScopedVault;

impl DbToApi<UserDetail> for api_wire_types::Entity {
    fn from_db(
        (_, _, attributes, onboarding_info, scoped_vault, is_portable, vault_kind): UserDetail,
    ) -> Self {
        let ScopedVault {
            fp_user_id,
            start_timestamp,
            ordering_id,
            ..
        } = scoped_vault;

        api_wire_types::Entity {
            id: fp_user_id,
            is_portable,
            kind: vault_kind,
            attributes,
            start_timestamp,
            onboarding: onboarding_info.map(api_wire_types::Onboarding::from_db),
            ordering_id,
        }
    }
}
