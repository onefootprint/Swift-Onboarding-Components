use paperclip::actix::Apiv2Schema;
use serde::{
    Deserialize,
    Deserializer,
};

#[derive(Debug, Apiv2Schema, Clone, Copy, Default)]
/// NOTE: if you use this, the field must be annotated with `#[serde(default)]`.
/// To support PATCH requests with fields that can be cleared out, we make the distinction between
/// a missing (undefined) value vs an explicit null value.
pub enum Patch<T> {
    /// Undefined value, not provided. Leave the field unchanged.
    #[default]
    Missing,
    /// Explicit null value. Set the field's value to null.
    Null,
    /// Explicit non-null value. Set the field's value.
    Value(T),
}

impl<T> From<Option<T>> for Patch<T> {
    fn from(opt: Option<T>) -> Patch<T> {
        match opt {
            Some(v) => Patch::Value(v),
            None => Patch::Null,
        }
    }
}

impl<T> Patch<T> {
    pub fn to_changeset(self) -> Option<Option<T>> {
        match self {
            Self::Missing => None,
            Self::Null => Some(None),
            Self::Value(t) => Some(Some(t)),
        }
    }

    pub fn map<F, U>(self, f: F) -> Patch<U>
    where
        F: FnOnce(T) -> U,
    {
        match self {
            Self::Missing => Patch::Missing,
            Self::Null => Patch::Null,
            Self::Value(t) => Patch::Value(f(t)),
        }
    }
}

impl<T, E> Patch<Result<T, E>> {
    pub fn transpose(self) -> Result<Patch<T>, E> {
        match self {
            Self::Missing => Ok(Patch::Missing),
            Self::Null => Ok(Patch::Null),
            Self::Value(t) => t.map(Patch::Value),
        }
    }
}

impl<'de, T> Deserialize<'de> for Patch<T>
where
    T: Deserialize<'de>,
{
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        Option::deserialize(deserializer).map(Into::into)
    }
}

#[cfg(test)]
mod test {
    use crate::Patch;

    #[derive(serde::Deserialize)]
    struct TestStruct {
        #[serde(default)]
        field: Patch<usize>,
    }

    #[test]
    fn test_deserialize() {
        let result: TestStruct = serde_json::de::from_str("{}").unwrap();
        assert!(matches!(result.field, Patch::Missing));
        let result: TestStruct = serde_json::de::from_str(r#"{"field": null}"#).unwrap();
        assert!(matches!(result.field, Patch::Null));
        let result: TestStruct = serde_json::de::from_str(r#"{"field": 10}"#).unwrap();
        assert!(matches!(result.field, Patch::Value(10)));
    }
}
