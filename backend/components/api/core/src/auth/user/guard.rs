use super::UserAuthGuard;
use super::UserAuthScope;
use crate::auth::IsGuardMet;
use itertools::Itertools;

impl IsGuardMet<UserAuthScope> for UserAuthGuard {
    fn is_met(self, token_scopes: &[UserAuthScope]) -> bool {
        token_scopes.iter().map(UserAuthGuard::from).contains(&self)
    }
}
