use crate::IdDocKind;
use itertools::Itertools;
use std::str::FromStr;
use strum::ParseError;
use strum_macros::Display;
use strum_macros::EnumString;

#[derive(Debug, Eq, PartialEq, Hash, Clone)]
pub enum DocTypeRestriction {
    Restrict(Vec<IdDocKind>),
    None,
}

impl std::fmt::Display for DocTypeRestriction {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Restrict(ref types) => write!(f, "{}", types.iter().join(",")),
            Self::None => write!(f, "none"),
        }
    }
}

impl FromStr for DocTypeRestriction {
    type Err = ParseError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "none" => Ok(Self::None),
            s => {
                let doc_types = s
                    .split(',')
                    .map(IdDocKind::from_str)
                    .collect::<Result<_, Self::Err>>()?;
                Ok(Self::Restrict(doc_types))
            }
        }
    }
}

#[derive(Debug, Eq, PartialEq, Hash, Display, EnumString, Clone)]
#[strum(serialize_all = "snake_case")]
pub enum CountryRestriction {
    UsOnly,
    None,
}

#[derive(Debug, Eq, PartialEq, Hash, Display, EnumString, Clone, Copy)]
#[strum(serialize_all = "snake_case")]
pub enum Selfie {
    RequireSelfie,
    None,
}

#[derive(Debug, Eq, PartialEq, Hash, Clone)]
pub struct DocumentCdoInfo(pub DocTypeRestriction, pub CountryRestriction, pub Selfie);

impl DocumentCdoInfo {
    pub fn restricted_id_doc_kinds(&self) -> Option<Vec<IdDocKind>> {
        match self.doc_type_restriction() {
            DocTypeRestriction::Restrict(types) => Some(types),
            DocTypeRestriction::None => None,
        }
    }

    pub fn doc_type_restriction(&self) -> DocTypeRestriction {
        self.0.clone()
    }

    pub fn country_restriction(&self) -> CountryRestriction {
        self.1.clone()
    }

    pub fn selfie(&self) -> Selfie {
        self.2
    }

    pub fn requires_selfie(&self) -> bool {
        self.selfie() == Selfie::RequireSelfie
    }

    pub fn only_us(&self) -> bool {
        self.1 == CountryRestriction::UsOnly
    }
}

impl std::fmt::Display for DocumentCdoInfo {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match (
            &self.doc_type_restriction(),
            &self.country_restriction(),
            &self.selfie(),
        ) {
            // Support legacy serializations
            (DocTypeRestriction::None, CountryRestriction::None, Selfie::None) => write!(f, "document"),
            (DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie) => {
                write!(f, "document_and_selfie")
            }
            (doc_restriction, c_restriction, selfie) => {
                // For future, more complex serializations
                write!(f, "document.{}.{}.{}", doc_restriction, c_restriction, selfie)
            }
        }
    }
}

impl FromStr for DocumentCdoInfo {
    type Err = ParseError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let res = match s {
            "document" => Self(DocTypeRestriction::None, CountryRestriction::None, Selfie::None),
            "document_and_selfie" => Self(
                DocTypeRestriction::None,
                CountryRestriction::None,
                Selfie::RequireSelfie,
            ),

            s => {
                // Complex parse
                let parts = s.split('.').collect_vec();
                let doc_type_restriction =
                    DocTypeRestriction::from_str(parts.get(1).ok_or(ParseError::VariantNotFound)?)?;
                let country_restriction =
                    CountryRestriction::from_str(parts.get(2).ok_or(ParseError::VariantNotFound)?)?;
                let selfie = Selfie::from_str(parts.get(3).ok_or(ParseError::VariantNotFound)?)?;
                Self(doc_type_restriction, country_restriction, selfie)
            }
        };
        Ok(res)
    }
}

#[cfg(test)]
mod test {
    use super::CountryRestriction;
    use super::DocTypeRestriction;
    use super::DocumentCdoInfo;
    use super::Selfie;
    use crate::IdDocKind;
    use std::str::FromStr;
    use test_case::test_case;

    #[test_case(
        DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None),
        "document"
    )]
    #[test_case(
        DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::RequireSelfie),
        "document_and_selfie"
    )]
    #[test_case(
        DocumentCdoInfo(DocTypeRestriction::Restrict(vec![IdDocKind::DriversLicense]), CountryRestriction::None, Selfie::RequireSelfie),
        "document.drivers_license.none.require_selfie"
    )]
    #[test_case(
        DocumentCdoInfo(DocTypeRestriction::Restrict(vec![IdDocKind::DriversLicense, IdDocKind::IdCard]), CountryRestriction::UsOnly, Selfie::None),
        "document.drivers_license,id_card.us_only.none"
    )]
    #[test_case(
        DocumentCdoInfo(DocTypeRestriction::Restrict(vec![IdDocKind::DriversLicense, IdDocKind::IdCard]), CountryRestriction::UsOnly, Selfie::RequireSelfie),
        "document.drivers_license,id_card.us_only.require_selfie"
    )]
    fn test_repr(info: DocumentCdoInfo, expected_repr: &str) {
        let repr = info.to_string();
        assert_eq!(repr, expected_repr);
        let parsed = DocumentCdoInfo::from_str(&repr).unwrap();
        assert_eq!(parsed, info);
    }
}
