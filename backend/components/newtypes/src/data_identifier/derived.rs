use crate::ssn::SsnOrItin;
use crate::CardData;
use crate::CardDataKind;
use crate::CardExpiration;
use crate::CardInfo;
use crate::CardNumber;
use crate::DataIdentifier;
use crate::DataIdentifierValue;
use crate::IdentityData;
use crate::IdentityDataKind;
use crate::LuhnValidatedCardNumber;
use crate::ParsedDataIdentifier;
use crate::PiiString;
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
                let us_tax_id = DataIdentifierValue {
                    di: DataIdentifier::Id(IdentityDataKind::UsTaxId),
                    value: ssn9.clone(),
                    parsed: (),
                };
                vec![get_ssn4_from_ssn9(ssn9), us_tax_id]
            }
            IdentityData::Itin(itin) => {
                let us_tax_id = DataIdentifierValue {
                    di: DataIdentifier::Id(IdentityDataKind::UsTaxId),
                    value: itin.clone(),
                    parsed: (),
                };
                vec![us_tax_id]
            }
            IdentityData::UsTaxId(ssn_or_itin) => match ssn_or_itin {
                SsnOrItin::Ssn(ssn9) => {
                    let ssn4 = get_ssn4_from_ssn9(ssn9);
                    let ssn9 = DataIdentifierValue {
                        di: DataIdentifier::Id(IdentityDataKind::Ssn9),
                        value: ssn9.clone(),
                        parsed: (),
                    };
                    vec![ssn9, ssn4]
                }
                SsnOrItin::Itin(itin) => vec![DataIdentifierValue {
                    di: DataIdentifier::Id(IdentityDataKind::Itin),
                    value: itin.clone(),
                    parsed: (),
                }],
            },
        }
    }
}

fn get_ssn4_from_ssn9(ssn9: &PiiString) -> DataIdentifierValue {
    let ssn4 = PiiString::new(
        ssn9.leak()
            .chars()
            .skip(ssn9.leak().len().saturating_sub(4))
            .collect(),
    );

    DataIdentifierValue {
        di: DataIdentifier::Id(IdentityDataKind::Ssn4),
        value: ssn4,
        parsed: (),
    }
}
