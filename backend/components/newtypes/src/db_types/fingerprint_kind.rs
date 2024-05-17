use crate::{
    fingerprint_salt::{GlobalFingerprintKind, PartialFingerprintKind},
    util::impl_enum_string_diesel,
    DataIdentifier, Fingerprint, ValidationError,
};
use diesel::{deserialize::FromSqlRow, expression::AsExpression, sql_types::Text};
use itertools::{chain, Itertools};
use std::{collections::HashMap, str::FromStr};
use strum::{EnumIter, EnumString};


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
            Self::Composite(_) => true,
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

#[derive(Debug, Clone, Copy, strum_macros::Display, EnumIter, EnumString, Eq, PartialEq, Hash)]
#[strum(serialize_all = "snake_case")]
pub enum CompositeFingerprintKind {
    #[strum(serialize = "composite.name_dob")]
    NameDob,
}

impl CompositeFingerprintKind {
    /// We add a fixed suffix salt to each composite fingerprint before hashing. This protects
    /// against any length extension vulnerabilities.
    const COMPOSITE_FP_SUFFIX: &'static [u8] = &[
        70, 111, 111, 116, 112, 114, 105, 110, 116, 32, 114, 111, 99, 107, 115, 33,
    ];

    /// Returns the _ordered_ list of PartialFingerprintKinds whose fingerprints are used to compute
    /// this composite fingerprint.
    pub fn partial_fp_kinds(&self) -> Vec<PartialFingerprintKind> {
        match self {
            Self::NameDob => vec![
                PartialFingerprintKind::FirstName,
                PartialFingerprintKind::LastName,
                PartialFingerprintKind::Dob,
            ],
        }
    }

    /// Returns true if the CompositeFingerprintKind is a function of any of the given DataIdentifiers
    pub fn contains(&self, dis: &[&DataIdentifier]) -> bool {
        self.partial_fp_kinds().iter().any(|fpk| dis.contains(&&fpk.di()))
    }

    /// Given the partial FPs from which this composite FP is composed, compute the composite FP.
    /// Returns an Err with the PartialFingerprintKind if a partial fingerprint is missing.
    pub fn compute(
        &self,
        partial_fps: &HashMap<PartialFingerprintKind, Fingerprint>,
    ) -> Result<Fingerprint, MissingPartialFingerprint> {
        let sh_datas = self
            .partial_fp_kinds()
            .iter()
            .map(|fpk| partial_fps.get(fpk).ok_or(MissingPartialFingerprint(*fpk)))
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

#[derive(Debug, Eq, PartialEq)]
pub struct MissingPartialFingerprint(pub PartialFingerprintKind);

#[cfg(test)]
mod test {
    use std::collections::HashMap;

    use strum::IntoEnumIterator;

    use crate::{
        fingerprint_salt::PartialFingerprintKind, CompositeFingerprintKind, Fingerprint,
        MissingPartialFingerprint,
    };

    #[test]
    fn test_composite_fingerprint() {
        // Make sure each composite fingerprint's computation method doesn't change over time.
        // This protects against accidental reordering of partial fingerprints or adding/changing
        // the partial fingerprints that make up a composite fingerprint.
        let fingerprints: HashMap<_, _> = [
            (PartialFingerprintKind::FirstName, Fingerprint(vec![1])),
            (PartialFingerprintKind::LastName, Fingerprint(vec![2])),
            (PartialFingerprintKind::Dob, Fingerprint(vec![3])),
        ]
        .into_iter()
        .collect();

        // NOTE: if this test failed, either
        // - You've added a new composite fingerprint and need to add a test for it here OR
        // - You've modified the scheme for an existing composite fingerprint. Don't do this
        CompositeFingerprintKind::iter().for_each(|cfpk| {
            let computed = cfpk.compute(&fingerprints).unwrap();
            let computed = crypto::hex::encode(computed);
            let expected = match cfpk {
                CompositeFingerprintKind::NameDob => {
                    "1f70b71ed31cd17da9594786cc557dea51f382507eae92a8e02880ed5089147e"
                }
            };
            assert_eq!(expected, computed);
        });
    }

    #[test]
    fn test_composite_fingerprint_err() {
        let fingerprints: HashMap<_, _> = [
            (PartialFingerprintKind::FirstName, Fingerprint(vec![1])),
            (PartialFingerprintKind::LastName, Fingerprint(vec![2])),
        ]
        .into_iter()
        .collect();
        let result = CompositeFingerprintKind::NameDob.compute(&fingerprints);
        assert_eq!(
            result,
            Err(MissingPartialFingerprint(PartialFingerprintKind::Dob))
        )
    }
}
