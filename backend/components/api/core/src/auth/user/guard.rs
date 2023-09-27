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
        self.0.iter().all(|di| match di {
            DataIdentifier::Id(id) => match id {
                IDK::AddressLine1
                | IDK::AddressLine2
                | IDK::Dob
                | IDK::City
                | IDK::State
                | IDK::Country
                | IDK::Zip
                | IDK::FirstName
                | IDK::MiddleName
                | IDK::LastName
                | IDK::UsLegalStatus
                | IDK::Citizenships
                | IDK::VisaKind
                | IDK::VisaExpirationDate
                | IDK::Nationality => {
                    // Either BasicProfile or SignUp give permissions to decrypt basic info
                    UserAuthGuard::BasicProfile
                        .or(UserAuthGuard::SignUp)
                        .is_met(token_scopes)
                }
                IDK::PhoneNumber | IDK::Email | IDK::Ssn4 | IDK::Ssn9 => {
                    UserAuthGuard::SensitiveProfile.is_met(token_scopes)
                }
            },
            // We don't allow decrypting business data with a user auth token right now - we
            // theoretically could, but we just don't support portable businesses yet
            _ => false,
        })
    }
}
