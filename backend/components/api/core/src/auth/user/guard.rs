use super::UserAuthGuard;
use super::UserAuthScope;
use crate::auth::CanDecrypt;
use crate::auth::IsGuardMet;
use itertools::Itertools;
use newtypes::{DataIdentifier, IdentityDataKind as IDK};

impl IsGuardMet<UserAuthScope> for UserAuthGuard {
    fn is_met(self, token_scopes: &[UserAuthScope]) -> bool {
        token_scopes.iter().map(UserAuthGuard::from).contains(&self)
    }
}

impl IsGuardMet<UserAuthScope> for CanDecrypt {
    fn is_met(self, token_scopes: &[UserAuthScope]) -> bool {
        let mut required_guards = self
            .0
            .iter()
            .map(|di| match di {
                DataIdentifier::Id(id) => match id {
                    IDK::City | IDK::State | IDK::Country | IDK::Zip | IDK::FirstName | IDK::LastName => {
                        UserAuthGuard::SignUp
                    }
                    IDK::AddressLine1
                    | IDK::AddressLine2
                    | IDK::Dob
                    | IDK::PhoneNumber
                    | IDK::Email
                    | IDK::Ssn4
                    | IDK::Ssn9 => UserAuthGuard::SensitiveProfile,
                },
                // We don't allow decrypting business data with a user auth token right now - we
                // theoretically could, but we just don't support portable businesses yet
                _ => UserAuthGuard::Never,
            })
            .unique();
        required_guards.all(|s| s.is_met(token_scopes))
    }
}
