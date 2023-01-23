use db::models::{onboarding::SerializableOnboardingInfo, scoped_user::ScopedUser};
use newtypes::{IdDocKind, IdentityDataKind};

use crate::utils::db2api::DbToApi;

pub type UserDetail = (
    Vec<IdentityDataKind>,
    Vec<IdDocKind>,
    Vec<IdDocKind>,
    Option<SerializableOnboardingInfo>,
    ScopedUser,
    bool,
);

impl DbToApi<UserDetail> for api_wire_types::User {
    fn from_db(
        (
            identity_data_attributes,
            identity_document_types,
            selfie_document_types,
            onboarding_info,
            scoped_user,
            is_portable,
        ): UserDetail,
    ) -> Self {
        let ScopedUser {
            fp_user_id,
            start_timestamp,
            ordering_id,
            ..
        } = scoped_user;

        api_wire_types::User {
            id: fp_user_id,
            is_portable,
            identity_data_attributes,
            identity_document_types,
            selfie_document_types,
            start_timestamp,
            onboarding: onboarding_info.map(api_wire_types::Onboarding::from_db),
            ordering_id,
        }
    }
}

impl DbToApi<ScopedUser> for api_wire_types::User {
    fn from_db(target: ScopedUser) -> Self {
        let ScopedUser {
            id: _,
            fp_user_id,
            user_vault_id: _,
            tenant_id: _,
            _created_at,
            _updated_at,
            ordering_id,
            start_timestamp,
            ..
        } = target;

        Self {
            id: fp_user_id,
            is_portable: false,
            identity_data_attributes: vec![],
            identity_document_types: vec![],
            selfie_document_types: vec![],
            start_timestamp,
            onboarding: None,
            ordering_id,
        }
    }
}
