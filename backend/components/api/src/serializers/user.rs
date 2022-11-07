use db::models::{onboarding::OnboardingInfo, scoped_user::ScopedUser};
use newtypes::DataAttribute;

use crate::utils::db2api::DbToApi;

pub type UserDetail<'a> = (Vec<DataAttribute>, &'a [OnboardingInfo], ScopedUser, bool);

impl<'a> DbToApi<UserDetail<'a>> for api_wire_types::User {
    fn from_db((identity_data_attributes, onboarding_info, scoped_user, is_portable): UserDetail) -> Self {
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
            start_timestamp,
            onboardings: onboarding_info
                .iter()
                .map(|x| api_wire_types::Onboarding::from_db(x.clone()))
                .collect(),
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
            is_live: _,
        } = target;

        Self {
            id: fp_user_id,
            is_portable: false,
            identity_data_attributes: vec![],
            start_timestamp,
            onboardings: vec![],
            ordering_id,
        }
    }
}
