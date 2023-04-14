use std::fmt::Display;

use newtypes::DataIdentifier;

pub trait IsGuardMet<ScopeT>: Display {
    /// Given the `token_scopes` that exist on the auth token, checks if the required permission
    /// represented by self is met.
    #[allow(clippy::wrong_self_convention)]
    fn is_met(self, token_scopes: &[ScopeT]) -> bool;

    fn or<T: IsGuardMet<ScopeT>>(self, other: T) -> Or<Self, T>
    where
        Self: Sized,
    {
        Or(self, other)
    }
}

/// Represents a guard that is always met, no matter the scopes of the auth token
pub struct Any;

impl Display for Any {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Any")
    }
}

impl<ScopeT> IsGuardMet<ScopeT> for Any {
    fn is_met(self, _token_scopes: &[ScopeT]) -> bool {
        true
    }
}

/// Represents a permission that is met if either its Left or Right permission is met
pub struct Or<Left, Right>(pub(crate) Left, pub(crate) Right);

impl<Left, Right> Display for Or<Left, Right>
where
    Left: Display,
    Right: Display,
{
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Or<{},{}>", self.0, self.1)
    }
}

impl<ScopeT, Left, Right> IsGuardMet<ScopeT> for Or<Left, Right>
where
    Left: IsGuardMet<ScopeT>,
    Right: IsGuardMet<ScopeT>,
{
    fn is_met(self, token_scopes: &[ScopeT]) -> bool {
        self.0.is_met(token_scopes) || self.1.is_met(token_scopes)
    }
}

/// Represents a permission that is only met when the auth token contains a scope that allows
/// decrypting the provided attributes
pub struct CanDecrypt(pub(super) Vec<DataIdentifier>);

impl CanDecrypt {
    pub fn new<T>(l: Vec<T>) -> Self
    where
        DataIdentifier: From<T>,
    {
        Self(l.into_iter().map(DataIdentifier::from).collect())
    }

    #[allow(unused)]
    pub fn single<T: Into<DataIdentifier>>(k: T) -> Self {
        Self(vec![k.into()])
    }
}

impl Display for CanDecrypt {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "CanDecrypt<{:?}>", self.0)
    }
}
