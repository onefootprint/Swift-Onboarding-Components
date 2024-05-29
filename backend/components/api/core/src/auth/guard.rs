use newtypes::output::Csv;
use newtypes::DataIdentifier;
use std::fmt::Display;

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

    fn and<T: IsGuardMet<ScopeT>>(self, other: T) -> And<Self, T>
    where
        Self: Sized,
    {
        And(self, other)
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

/// Represents a permission that is met if both its Left and Right permission are met
pub struct And<Left, Right>(pub(crate) Left, pub(crate) Right);

impl<Left, Right> Display for And<Left, Right>
where
    Left: Display,
    Right: Display,
{
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "And<{},{}>", self.0, self.1)
    }
}

impl<ScopeT, Left, Right> IsGuardMet<ScopeT> for And<Left, Right>
where
    Left: IsGuardMet<ScopeT>,
    Right: IsGuardMet<ScopeT>,
{
    fn is_met(self, token_scopes: &[ScopeT]) -> bool {
        self.0.is_met(token_scopes) && self.1.is_met(token_scopes)
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

    pub fn single<T: Into<DataIdentifier>>(k: T) -> Self {
        Self(vec![k.into()])
    }
}

impl Display for CanDecrypt {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "CanDecrypt<{}>", Csv::from(self.0.clone()))
    }
}

/// Represents a permission that is only met when the auth token contains a scope that allows
/// encrypting the provided attributes.
/// Only used by client tenant auth
pub struct CanVault(pub(super) Vec<DataIdentifier>);
impl CanVault {
    pub fn new<T>(l: Vec<T>) -> Self
    where
        DataIdentifier: From<T>,
    {
        Self(l.into_iter().map(DataIdentifier::from).collect())
    }
}

impl Display for CanVault {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "CanVault<{}>", Csv::from(self.0.clone()))
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use newtypes::IdentityDataKind as IDK;
    use std::fmt::Display;
    use test_case::test_case;

    #[test_case(CanDecrypt::new(vec![IDK::FirstName, IDK::LastName]) => "CanDecrypt<id.first_name, id.last_name>".to_owned())]
    #[test_case(CanVault::new(vec![IDK::FirstName, IDK::LastName]) => "CanVault<id.first_name, id.last_name>".to_owned())]
    fn test_display<T: Display>(guard: T) -> String {
        format!("{}", guard)
    }
}
