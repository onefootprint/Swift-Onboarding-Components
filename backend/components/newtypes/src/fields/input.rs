use crate::api_schema_helper::string_api_data_type_alias;
use crate::AuditEventName;
use crate::DataIdentifier;
use crate::ObConfigurationKind;
use crate::TenantRoleId;
use crate::TenantScope;
use derive_more::Deref;
use serde::de::value::StrDeserializer;
use serde::de::DeserializeOwned;
use serde::de::IntoDeserializer;
use serde::de::{
    self,
};
use serde::Deserialize;

/// Represents a comma-separated list of type `T` with a Deserialize implementation.
#[derive(Debug, Clone, Hash, PartialEq, Eq, Deserialize, Default, Deref)]
pub struct Csv<T>(#[serde(deserialize_with = "deserialize_stringified_list")] pub Vec<T>)
where
    T: DeserializeOwned;

impl<T: DeserializeOwned> IntoIterator for Csv<T> {
    type IntoIter = std::vec::IntoIter<T>;
    type Item = T;

    fn into_iter(self) -> Self::IntoIter {
        self.0.into_iter()
    }
}

impl<T> From<Csv<T>> for Vec<T>
where
    T: DeserializeOwned,
{
    fn from(value: Csv<T>) -> Self {
        value.0
    }
}

string_api_data_type_alias!(Csv<DataIdentifier>);
string_api_data_type_alias!(Csv<TenantRoleId>);
string_api_data_type_alias!(Csv<TenantScope>);
string_api_data_type_alias!(Csv<AuditEventName>);
string_api_data_type_alias!(Csv<ObConfigurationKind>);

pub fn parse_csv<'de, I, E>(
    s: &str,
) -> Result<Vec<I>, <StrDeserializer<'de, E> as serde::Deserializer<'de>>::Error>
where
    I: de::DeserializeOwned,
    E: de::Error,
{
    let ids = s
        .split(',')
        .map(|x| I::deserialize(x.trim().into_deserializer()))
        .collect::<Result<Vec<I>, _>>()?;
    Ok(ids)
}

/// serde_urlencoded, used by actix's web::Query, isn't very good at deserializing Vecs:
/// https://github.com/nox/serde_urlencoded/issues/6
pub fn deserialize_stringified_list<'de, D, I>(deserializer: D) -> Result<Vec<I>, D::Error>
where
    D: serde::Deserializer<'de>,
    I: de::DeserializeOwned,
{
    let s: Option<String> = serde::Deserialize::deserialize(deserializer)?;
    let Some(s) = s else {
        return Ok(vec![]);
    };
    parse_csv(&s)
}

#[cfg(test)]
mod tests {
    use super::Csv;
    use crate::DataIdentifier;
    use crate::IdentityDataKind as IDK;
    #[test]
    fn test_data_kinds() {
        #[derive(serde::Deserialize)]
        struct Test {
            fields: Csv<DataIdentifier>,
        }
        let test = r#"{ "fields": "id.last_name, id.first_name, id.address_line1,id.city" }"#;
        let test: Test = serde_json::from_str(test).unwrap();

        assert_eq!(
            test.fields.0,
            vec![
                IDK::LastName.into(),
                IDK::FirstName.into(),
                IDK::AddressLine1.into(),
                IDK::City.into()
            ]
        );
    }
}
