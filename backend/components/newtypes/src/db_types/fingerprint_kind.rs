use crate::{
    fingerprint_salt::{FingerprintSalt, GlobalFingerprintKind, PartialFingerprintKind},
    util::impl_enum_string_diesel,
    DataIdentifier, Fingerprint, FingerprintVariant, IdentityDataKind as IDK, TenantId, ValidationError,
};
use diesel::{deserialize::FromSqlRow, expression::AsExpression, sql_types::Text};
use itertools::{chain, Itertools};
use std::{collections::HashMap, str::FromStr};
use strum::{EnumIter, EnumString, IntoEnumIterator};


#[derive(Debug, Clone, derive_more::From, AsExpression, FromSqlRow)]
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
            Self::Composite(cfpk) => cfpk.scope() == FingerprintVariant::Global,
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
            })
            .collect()
    }

    /// Returns the _ordered_ list of PartialFingerprintKinds whose fingerprints are used to compute
    /// this composite fingerprint.
    pub fn salts(&self) -> Vec<FingerprintSalt> {
        match self {
            Self::NameDob => vec![
                PartialFingerprintKind::FirstName.into(),
                PartialFingerprintKind::LastName.into(),
                PartialFingerprintKind::Dob.into(),
            ],
            Self::Name(tenant_id) => vec![
                FingerprintSalt::Tenant(IDK::FirstName.into(), tenant_id.clone()),
                FingerprintSalt::Tenant(IDK::LastName.into(), tenant_id.clone()),
            ],
        }
    }

    /// Returns true if the CompositeFingerprintKind is a function of any of the given DataIdentifiers
    pub fn contains(&self, dis: &[&DataIdentifier]) -> bool {
        self.salts().iter().any(|fpk| dis.contains(&&fpk.di()))
    }

    /// Given the partial FPs from which this composite FP is composed, compute the composite FP.
    /// Returns an Err with the PartialFingerprintKind if a partial fingerprint is missing.
    pub fn compute(
        &self,
        fps: &HashMap<FingerprintSalt, Fingerprint>,
    ) -> Result<Fingerprint, MissingFingerprint> {
        let sh_datas = self
            .salts()
            .into_iter()
            .map(|salt| fps.get(&salt).ok_or(MissingFingerprint(salt)))
            .collect::<Result<Vec<_>, _>>()?;
        // A composite fingerprint is computed by taking the sha256 of each partial fingerprint
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
    pub fn scope(&self) -> FingerprintVariant {
        match self {
            Self::Name => FingerprintVariant::Tenant,
            Self::NameDob => FingerprintVariant::Global,
        }
    }
}

#[derive(Debug, Eq, PartialEq)]
pub struct MissingFingerprint(pub FingerprintSalt);

#[cfg(test)]
mod test {
    use std::collections::HashMap;

    use crate::{
        fingerprint_salt::{FingerprintSalt, PartialFingerprintKind},
        CompositeFingerprint, Fingerprint, IdentityDataKind as IDK, MissingFingerprint, TenantId,
    };

    #[test]
    fn test_composite_fingerprint() {
        let test_tenant_id = || TenantId::test_data("org_hello_world".into());
        // Make sure each composite fingerprint's computation method doesn't change over time.
        // This protects against accidental reordering of partial fingerprints or adding/changing
        // the partial fingerprints that make up a composite fingerprint.
        let fingerprints: HashMap<_, _> = [
            (PartialFingerprintKind::FirstName.into(), Fingerprint(vec![1])),
            (PartialFingerprintKind::LastName.into(), Fingerprint(vec![2])),
            (PartialFingerprintKind::Dob.into(), Fingerprint(vec![3])),
            (
                FingerprintSalt::Tenant(IDK::FirstName.into(), test_tenant_id()),
                Fingerprint(vec![4]),
            ),
            (
                FingerprintSalt::Tenant(IDK::LastName.into(), test_tenant_id()),
                Fingerprint(vec![5]),
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
                };
                assert_eq!(expected, computed);
            });
    }

    #[test]
    fn test_composite_fingerprint_err() {
        let fingerprints: HashMap<_, _> = [
            (PartialFingerprintKind::FirstName.into(), Fingerprint(vec![1])),
            (PartialFingerprintKind::LastName.into(), Fingerprint(vec![2])),
        ]
        .into_iter()
        .collect();
        let result = CompositeFingerprint::NameDob.compute(&fingerprints);
        assert_eq!(
            result,
            Err(MissingFingerprint(PartialFingerprintKind::Dob.into()))
        )
    }
}
