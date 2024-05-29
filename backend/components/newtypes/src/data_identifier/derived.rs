use crate::{
    CardData,
    CardDataKind,
    CardExpiration,
    CardInfo,
    CardNumber,
    DataIdentifier,
    DataIdentifierValue,
    IdentityData,
    IdentityDataKind,
    LuhnValidatedCardNumber,
    ParsedDataIdentifier,
    PiiString,
};
use itertools::chain;

pub trait DeriveValues {
    fn derive_values(&self) -> Vec<DataIdentifierValue>;
}

impl DeriveValues for DataIdentifierValue {
    fn derive_values(&self) -> Vec<DataIdentifierValue> {
        vec![]
    }
}

impl<T: DeriveValues> DeriveValues for DataIdentifierValue<Option<T>> {
    fn derive_values(&self) -> Vec<DataIdentifierValue> {
        match self.parsed {
            Some(ref parsed) => parsed.derive_values(),
            None => vec![],
        }
    }
}

impl<T: DeriveValues> DeriveValues for DataIdentifierValue<T> {
    fn derive_values(&self) -> Vec<DataIdentifierValue> {
        self.parsed.derive_values()
    }
}

impl DeriveValues for ParsedDataIdentifier {
    fn derive_values(&self) -> Vec<DataIdentifierValue> {
        match self {
            ParsedDataIdentifier::Id(d) => d.as_ref().map_or(vec![], |d| d.derive_values()),
            ParsedDataIdentifier::Card(d) => d.as_ref().map_or(vec![], |d| d.derive_values()),
        }
    }
}

impl DeriveValues for CardNumber {
    fn derive_values(&self) -> Vec<DataIdentifierValue> {
        let last_4 = PiiString::from(
            self.number
                .leak()
                .chars()
                .skip(self.number.len().saturating_sub(4))
                .collect::<String>(),
        );

        vec![DataIdentifierValue {
            di: DataIdentifier::Card(CardInfo {
                alias: self.alias.clone(),
                kind: CardDataKind::Last4,
            }),
            value: last_4,
            parsed: (),
        }]
    }
}

impl DeriveValues for LuhnValidatedCardNumber {
    fn derive_values(&self) -> Vec<DataIdentifierValue> {
        chain(
            self.number.derive_values(),
            Some(DataIdentifierValue {
                di: DataIdentifier::Card(CardInfo {
                    alias: self.number.alias.clone(),
                    kind: CardDataKind::Issuer,
                }),
                value: PiiString::from(self.issuer.to_string()),
                parsed: (),
            }),
        )
        .collect()
    }
}

impl DeriveValues for CardExpiration {
    fn derive_values(&self) -> Vec<DataIdentifierValue> {
        let exp_month = DataIdentifierValue {
            di: DataIdentifier::Card(CardInfo {
                alias: self.alias.clone(),
                kind: CardDataKind::ExpMonth,
            }),
            value: self.expiration.month.clone(),
            parsed: (),
        };

        let exp_year = DataIdentifierValue {
            di: DataIdentifier::Card(CardInfo {
                alias: self.alias.clone(),
                kind: CardDataKind::ExpYear,
            }),
            value: self.expiration.year.clone(),
            parsed: (),
        };

        vec![exp_month, exp_year]
    }
}

impl DeriveValues for CardData {
    fn derive_values(&self) -> Vec<DataIdentifierValue> {
        match self {
            CardData::CardNumber(ref d) => d.derive_values(),
            CardData::LuhnValidatedCardNumber(ref d) => d.derive_values(),
            CardData::Expiration(ref d) => d.derive_values(),
        }
    }
}

impl DeriveValues for IdentityData {
    fn derive_values(&self) -> Vec<DataIdentifierValue> {
        match self {
            IdentityData::Sss9(ssn9) => {
                let ssn4 = PiiString::new(
                    ssn9.leak()
                        .chars()
                        .skip(ssn9.leak().len().saturating_sub(4))
                        .collect(),
                );

                vec![DataIdentifierValue {
                    di: DataIdentifier::Id(IdentityDataKind::Ssn4),
                    value: ssn4,
                    parsed: (),
                }]
            }
        }
    }
}
