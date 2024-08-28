use crate::fingerprint_salt::FingerprintSalt;
use crate::fingerprint_salt::GlobalFingerprintKind;
use crate::fingerprint_salt::TransientGlobalFingerprintKind;
use crate::fingerprint_salt::TransientTenantFingerprintKind;
use crate::util::impl_enum_string_diesel;
use crate::DataIdentifier;
use crate::Fingerprint;
use crate::FingerprintScope;
use crate::IdentityDataKind as IDK;
use crate::TenantId;
use crate::ValidationError;
use diesel::deserialize::FromSqlRow;
use diesel::expression::AsExpression;
use diesel::sql_types::Text;
use itertools::chain;
use itertools::Itertools;
use std::collections::HashMap;
use std::str::FromStr;
use strum::EnumIter;
use strum::EnumString;
use strum::IntoEnumIterator;

#[derive(Debug, Clone, derive_more::From, AsExpression, FromSqlRow, Eq, PartialEq, Hash)]
#[diesel(sql_type = Text)]
pub enum FingerprintKind {
    Composite(CompositeFingerprintKind),
    DI(DataIdentifier),
}

impl_enum_string_diesel!(FingerprintKind);

impl FingerprintKind {
    pub fn is_fingerprintable(&self) -> bool {
        match self {
            Self::Composite(_) => true,
            Self::DI(di) => di.is_fingerprintable(),
        }
    }

    /// Returns true if the FingerprintKind can be globally fingerprinted (vs tenant-scoped)
    pub fn is_globally_fingerprintable(&self) -> bool {
        match self {
            Self::Composite(cfpk) => cfpk.scope() == FingerprintScope::Global,
            Self::DI(di) => GlobalFingerprintKind::try_from(di).is_ok(),
        }
    }

    pub fn store_plaintext(&self) -> bool {
        match self {
            Self::Composite(_) => false,
            Self::DI(di) => di.store_plaintext(),
        }
    }
}

impl DataIdentifier {
    /// Returns true if the DI can be fingerprinted. Will automatically fingerprint non-document
    /// data with these types when added to the vault
    pub fn is_fingerprintable(&self) -> bool {
        Self::searchable().contains(self)
    }
}

impl FromStr for FingerprintKind {
    type Err = crate::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        if let Ok(kind) = CompositeFingerprintKind::from_str(s) {
            return Ok(Self::Composite(kind));
        }
        if let Ok(kind) = DataIdentifier::from_str(s) {
            return Ok(Self::DI(kind));
        }
        Err(ValidationError(&format!("Cannot parse FingerprintKind: {}", s)).into())
    }
}

impl std::fmt::Display for FingerprintKind {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            FingerprintKind::Composite(cfk) => write!(f, "{}", cfk),
            FingerprintKind::DI(di) => write!(f, "{}", di),
        }
    }
}

#[derive(strum_macros::EnumDiscriminants)]
#[strum_discriminants(
    name(CompositeFingerprintKind),
    vis(pub),
    derive(strum_macros::Display, EnumIter, EnumString, Hash,),
    strum(serialize_all = "snake_case")
)]
pub enum CompositeFingerprint {
    #[strum_discriminants(strum(serialize = "composite.name_dob"))]
    NameDob,
    #[strum_discriminants(strum(serialize = "composite.name"))]
    Name(TenantId),
    #[strum_discriminants(strum(serialize = "composite.name_ssn4"))]
    NameSsn4(TenantId),
    #[strum_discriminants(strum(serialize = "composite.dob_ssn4"))]
    DobSsn4(TenantId),
}

impl CompositeFingerprint {
    /// We add a fixed suffix salt to each composite fingerprint before hashing. This protects
    /// against any length extension vulnerabilities.
    const COMPOSITE_FP_SUFFIX: &'static [u8] = &[
        70, 111, 111, 116, 112, 114, 105, 110, 116, 32, 114, 111, 99, 107, 115, 33,
    ];

    pub fn list(t_id: &TenantId) -> Vec<Self> {
        CompositeFingerprintKind::iter()
            .map(|cfpk| match cfpk {
                CompositeFingerprintKind::NameDob => Self::NameDob,
                CompositeFingerprintKind::Name => Self::Name(t_id.clone()),
                CompositeFingerprintKind::NameSsn4 => Self::NameSsn4(t_id.clone()),
                CompositeFingerprintKind::DobSsn4 => Self::DobSsn4(t_id.clone()),
            })
            .collect()
    }

    /// Returns the _ordered_ list of FingerprintSalts whose fingerprints are used to compute
    /// this composite fingerprint.
    pub fn salts(&self) -> Vec<FingerprintSalt> {
        match self {
            Self::NameDob => vec![
                TransientGlobalFingerprintKind::FirstName.into(),
                TransientGlobalFingerprintKind::LastName.into(),
                TransientGlobalFingerprintKind::Dob.into(),
            ],
            Self::Name(tenant_id) => vec![
                FingerprintSalt::Tenant(IDK::FirstName.into(), tenant_id.clone()),
                FingerprintSalt::Tenant(IDK::LastName.into(), tenant_id.clone()),
            ],
            Self::NameSsn4(tenant_id) => vec![
                FingerprintSalt::Tenant(IDK::FirstName.into(), tenant_id.clone()),
                FingerprintSalt::Tenant(IDK::LastName.into(), tenant_id.clone()),
                FingerprintSalt::TransientTenant(TransientTenantFingerprintKind::Ssn4, tenant_id.clone()),
            ],
            Self::DobSsn4(tenant_id) => vec![
                FingerprintSalt::TransientTenant(TransientTenantFingerprintKind::Dob, tenant_id.clone()),
                FingerprintSalt::TransientTenant(TransientTenantFingerprintKind::Ssn4, tenant_id.clone()),
            ],
        }
    }

    /// Returns true if we can generate this composite fingerprint. We'll only generate a composite
    /// fingerprint if (1) a constituent piece of data is updated in this request and
    /// (2) all constituent pieces of data are either present in the vault or the request.
    pub fn should_generate(&self, existing_dis: &[DataIdentifier], new_dis: &[&DataIdentifier]) -> bool {
        let new_data_intersects = self.salts().iter().any(|fpk| new_dis.contains(&&fpk.di()));
        let all_data_contains = self
            .salts()
            .iter()
            .all(|fpk| new_dis.contains(&&fpk.di()) || existing_dis.contains(&fpk.di()));
        new_data_intersects && all_data_contains
    }

    /// Given the partial FPs from which this composite FP is composed, compute the composite FP.
    /// Returns an Err with the FingerprintSalt if a constituent fingerprint is missing.
    pub fn compute(
        &self,
        fps: &HashMap<FingerprintSalt, Fingerprint>,
    ) -> Result<Fingerprint, MissingFingerprint> {
        let sh_datas = self
            .salts()
            .into_iter()
            .map(|salt| fps.get(&salt).ok_or(MissingFingerprint(salt)))
            .collect::<Result<Vec<_>, _>>()?;
        // A composite fingerprint is computed by taking the sha256 of each constituent fingerprint
        // concatenated, in order
        let sh_data = chain(
            sh_datas.into_iter().flat_map(|sh| &sh.0),
            Self::COMPOSITE_FP_SUFFIX,
        )
        .copied()
        .collect_vec();
        let composite_fp = Fingerprint(crypto::sha256(&sh_data).to_vec());
        Ok(composite_fp)
    }
}

impl CompositeFingerprintKind {
    pub fn scope(&self) -> FingerprintScope {
        match self {
            Self::Name => FingerprintScope::Tenant,
            Self::NameDob => FingerprintScope::Global,
            Self::NameSsn4 => FingerprintScope::Tenant,
            Self::DobSsn4 => FingerprintScope::Tenant,
        }
    }
}

#[derive(Debug, Eq, PartialEq, thiserror::Error)]
#[error("Missing fingerprint: {0}")]
pub struct MissingFingerprint(pub FingerprintSalt);

#[cfg(test)]
mod test {
    use crate::fingerprint_salt::FingerprintSalt;
    use crate::fingerprint_salt::TransientGlobalFingerprintKind;
    use crate::fingerprint_salt::TransientTenantFingerprintKind;
    use crate::CompositeFingerprint;
    use crate::DataIdentifier;
    use crate::Fingerprint;
    use crate::IdentityDataKind as IDK;
    use crate::MissingFingerprint;
    use crate::TenantId;
    use itertools::Itertools;
    use std::collections::HashMap;
    use test_case::test_case;

    #[test]
    fn test_composite_fingerprint() {
        let test_tenant_id = || TenantId::test_data("org_hello_world".into());
        // Make sure each composite fingerprint's computation method doesn't change over time.
        // This protects against accidental reordering of constituent fingerprints or adding/changing
        // the constituent fingerprints that make up a composite fingerprint.
        let fingerprints: HashMap<_, _> = [
            (
                TransientGlobalFingerprintKind::FirstName.into(),
                Fingerprint(vec![1]),
            ),
            (
                TransientGlobalFingerprintKind::LastName.into(),
                Fingerprint(vec![2]),
            ),
            (TransientGlobalFingerprintKind::Dob.into(), Fingerprint(vec![3])),
            (
                FingerprintSalt::Tenant(IDK::FirstName.into(), test_tenant_id()),
                Fingerprint(vec![4]),
            ),
            (
                FingerprintSalt::Tenant(IDK::LastName.into(), test_tenant_id()),
                Fingerprint(vec![5]),
            ),
            (
                FingerprintSalt::TransientTenant(TransientTenantFingerprintKind::Ssn4, test_tenant_id()),
                Fingerprint(vec![6]),
            ),
            (
                FingerprintSalt::TransientTenant(TransientTenantFingerprintKind::Dob, test_tenant_id()),
                Fingerprint(vec![7]),
            ),
        ]
        .into_iter()
        .collect();

        // NOTE: if this test failed, either
        // - You've added a new composite fingerprint and need to add a test for it here OR
        // - You've modified the scheme for an existing composite fingerprint. Don't do this
        CompositeFingerprint::list(&test_tenant_id())
            .into_iter()
            .for_each(|cfp| {
                let computed = cfp.compute(&fingerprints).unwrap();
                let computed = crypto::hex::encode(computed);
                let expected = match cfp {
                    CompositeFingerprint::NameDob => {
                        "1f70b71ed31cd17da9594786cc557dea51f382507eae92a8e02880ed5089147e"
                    }
                    CompositeFingerprint::Name(_) => {
                        "e650e2487086bac8d363ee1cb5a799ba7004ac92df2ee217a6a8df7c3af72f98"
                    }
                    CompositeFingerprint::NameSsn4(_) => {
                        "db657b5e5a961a3a2f14dc50b9962e9b2a6a7152d0ce76a5b37d05e152e1d677"
                    }
                    CompositeFingerprint::DobSsn4(_) => {
                        "7dc712d8d0ef8b72dc4fbafb92d7de33cc14dbc80b266a702224d4397494e2e9"
                    }
                };
                assert_eq!(expected, computed);
            });
    }

    #[test]
    fn test_composite_fingerprint_err() {
        let fingerprints: HashMap<_, _> = [
            (
                TransientGlobalFingerprintKind::FirstName.into(),
                Fingerprint(vec![1]),
            ),
            (
                TransientGlobalFingerprintKind::LastName.into(),
                Fingerprint(vec![2]),
            ),
        ]
        .into_iter()
        .collect();
        let result = CompositeFingerprint::NameDob.compute(&fingerprints);
        assert_eq!(
            result,
            Err(MissingFingerprint(TransientGlobalFingerprintKind::Dob.into()))
        );
    }

    #[test_case(CompositeFingerprint::NameDob, vec ! [], vec ! [] => false)]
    #[test_case(
        CompositeFingerprint::NameDob, vec ! [IDK::FirstName, IDK::LastName, IDK::Dob], vec ! [] => false
    )]
    #[test_case(
        CompositeFingerprint::NameDob, vec ! [IDK::FirstName, IDK::LastName], vec ! [IDK::Dob] => true
    )]
    #[test_case(
        CompositeFingerprint::NameDob, vec ! [IDK::FirstName], vec ! [IDK::LastName, IDK::Dob] => true
    )]
    #[test_case(
        CompositeFingerprint::NameDob, vec ! [], vec ! [IDK::FirstName, IDK::LastName, IDK::Dob] => true
    )]
    #[test_case(CompositeFingerprint::NameDob, vec ! [], vec ! [IDK::LastName, IDK::Dob] => false)]
    #[test_case(
        CompositeFingerprint::NameDob, vec ! [IDK::LastName], vec ! [IDK::LastName, IDK::Dob] => false
    )]
    #[test_case(
        CompositeFingerprint::NameSsn4(TenantId::test_data("foo_bar".into())), vec ! [IDK::LastName, IDK::FirstName], vec ! [IDK::Ssn4] => true
    )]
    #[test_case(
        CompositeFingerprint::NameSsn4(TenantId::test_data("foo_bar".into())), vec ! [], vec ! [IDK::Ssn4] => false
    )]
    #[test_case(
        CompositeFingerprint::DobSsn4(TenantId::test_data("foo_bar".into())), vec ! [IDK::Dob], vec ! [IDK::Ssn4] => true
    )]
    #[test_case(
        CompositeFingerprint::DobSsn4(TenantId::test_data("foo_bar".into())), vec ! [], vec ! [IDK::Ssn4] => false
    )]
    #[test_case(
        CompositeFingerprint::DobSsn4(TenantId::test_data("foo_bar".into())), vec ! [IDK::Dob], vec ! [] => false
    )]
    fn test_should_generate(cfp: CompositeFingerprint, existing: Vec<IDK>, new: Vec<IDK>) -> bool {
        let existing = existing.into_iter().map(DataIdentifier::from).collect_vec();
        let new = new.into_iter().map(DataIdentifier::from).collect_vec();
        let new = new.iter().collect_vec();
        cfp.should_generate(&existing, &new)
    }
}
