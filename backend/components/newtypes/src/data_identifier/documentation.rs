use super::bank_data_kind::BankInfo;
use super::CardInfo;
use super::InvestorProfileDeclaration;
use super::InvestorProfileFundingSource;
use super::InvestorProfileInvestmentGoal;
use crate::BusinessDataKind as BDK;
use crate::DataIdentifier;
use crate::DataIdentifierDiscriminant;
use crate::DocumentDiKind;
use crate::IdentityDataKind as IDK;
use crate::InvestorProfileKind as IPK;
use crate::Iso3166TwoDigitCountryCode;
use crate::KvDataKey;
use crate::PiiString;
use crate::VaultKind;
use itertools::Itertools;
use paperclip::v2::models::DataType;
use paperclip::v2::schema::Apiv2Schema;
use strum::IntoEnumIterator;

impl DataIdentifier {
    /// List of permissible DataIdentifiers to be rendered in documentation
    pub fn api_examples_for(kinds: Vec<DataIdentifierDiscriminant>) -> impl Iterator<Item = Self> {
        kinds.into_iter().flat_map(|kind| match kind {
            DataIdentifierDiscriminant::Custom => {
                vec![DataIdentifier::Custom(KvDataKey::from("*".to_string()))]
            }
            DataIdentifierDiscriminant::Id => IDK::iter()
                .map(DataIdentifier::from)
                .filter(|di| !di.is_verified_ci())
                .collect_vec(),
            DataIdentifierDiscriminant::Business => BDK::api_examples()
                .into_iter()
                .map(DataIdentifier::from)
                .collect_vec(),
            DataIdentifierDiscriminant::InvestorProfile => {
                IPK::iter().map(DataIdentifier::from).collect_vec()
            }
            DataIdentifierDiscriminant::Document => DocumentDiKind::api_examples()
                .into_iter()
                .map(DataIdentifier::from)
                .collect_vec(),
            DataIdentifierDiscriminant::Card => CardInfo::api_examples()
                .into_iter()
                .map(DataIdentifier::from)
                .collect_vec(),
            DataIdentifierDiscriminant::Bank => BankInfo::api_examples()
                .into_iter()
                .map(DataIdentifier::from)
                .collect_vec(),
        })
    }

    pub fn api_examples() -> impl Iterator<Item = Self> {
        Self::api_examples_for(DataIdentifierDiscriminant::iter().collect())
    }
}

impl DataIdentifier {
    pub fn value_schema(&self) -> paperclip::v2::models::DefaultSchemaRaw {
        match self {
            DataIdentifier::Custom(_) => PiiString::raw_schema(),
            DataIdentifier::Id(idk) => match idk {
                IDK::Citizenships => Vec::<Iso3166TwoDigitCountryCode>::raw_schema(),
                _ => PiiString::raw_schema(),
            },
            DataIdentifier::Business(_) => PiiString::raw_schema(),
            DataIdentifier::InvestorProfile(ipk) => match ipk {
                IPK::InvestmentGoals => Vec::<InvestorProfileInvestmentGoal>::raw_schema(),
                IPK::Declarations => Vec::<InvestorProfileDeclaration>::raw_schema(),
                IPK::SeniorExecutiveSymbols => Vec::<String>::raw_schema(),
                IPK::FamilyMemberNames => Vec::<String>::raw_schema(),
                IPK::FundingSources => Vec::<InvestorProfileFundingSource>::raw_schema(),
                _ => PiiString::raw_schema(),
            },
            DataIdentifier::Document(_) => PiiString::raw_schema(),
            DataIdentifier::Card(_) => PiiString::raw_schema(),
            DataIdentifier::Bank(_) => PiiString::raw_schema(),
        }
    }
}

impl paperclip::v2::schema::Apiv2Schema for DataIdentifier {
    fn name() -> Option<String> {
        Some("DataIdentifier".to_string())
    }

    fn description() -> &'static str {
        ""
    }

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        use paperclip::v2::models::DefaultSchemaRaw;
        let api_examples = Self::api_examples()
            .map(|id| serde_json::Value::String(id.to_string()))
            .collect();
        DefaultSchemaRaw {
            name: Some("DataIdentifier".into()),
            data_type: Some(DataType::String),
            enum_: api_examples,
            ..Default::default()
        }
    }
}
impl paperclip::actix::OperationModifier for DataIdentifier {}


/// Empty struct used solely to produce documentation specifically for business data identifiers.
pub struct BusinessDataIdentifier;

impl BusinessDataIdentifier {
    pub fn api_examples() -> impl Iterator<Item = DataIdentifier> {
        let dids = DataIdentifierDiscriminant::iter()
            .filter(|did| did.is_allowed_for(VaultKind::Business))
            .collect();
        DataIdentifier::api_examples_for(dids)
    }
}

impl paperclip::v2::schema::Apiv2Schema for BusinessDataIdentifier {
    fn name() -> Option<String> {
        Some("BusinessDataIdentifier".to_string())
    }

    fn description() -> &'static str {
        DataIdentifier::description()
    }

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        let mut schema = DataIdentifier::raw_schema();
        schema.enum_ = Self::api_examples()
            .map(|id| serde_json::Value::String(id.to_string()))
            .collect();
        schema.name = Self::name();
        schema
    }
}


/// Empty struct used solely to produce documentation specifically for business data identifiers.
pub struct UserDataIdentifier;

impl UserDataIdentifier {
    pub fn api_examples() -> impl Iterator<Item = DataIdentifier> {
        let dids = DataIdentifierDiscriminant::iter()
            .filter(|did| did.is_allowed_for(VaultKind::Person))
            .collect();
        DataIdentifier::api_examples_for(dids)
    }
}

impl paperclip::v2::schema::Apiv2Schema for UserDataIdentifier {
    fn name() -> Option<String> {
        Some("UserDataIdentifier".to_string())
    }

    fn description() -> &'static str {
        DataIdentifier::description()
    }

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        let mut schema = DataIdentifier::raw_schema();
        schema.enum_ = Self::api_examples()
            .map(|id| serde_json::Value::String(id.to_string()))
            .collect();
        schema.name = Self::name();
        schema
    }
}
