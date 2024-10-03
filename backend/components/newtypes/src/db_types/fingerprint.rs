use crate::PiiString;
use base_62::base62;
use derive_more::From;
use derive_more::Into;
use diesel::backend::Backend;
use diesel::deserialize::FromSql;
use diesel::deserialize::FromSqlRow;
use diesel::expression::AsExpression;
use diesel::serialize::ToSql;
use diesel::sql_types::Binary;
use serde::Deserialize;
use serde::Serialize;

#[derive(
    Clone, Hash, PartialEq, Eq, From, Into, Serialize, Deserialize, Default, AsExpression, FromSqlRow,
)]
#[serde(transparent)]
#[diesel(sql_type = Binary)]
pub struct Fingerprint(pub Vec<u8>);

impl Fingerprint {
    /// Converts Fingerprint content to a token, so that it can be saved as a searchable DI.
    pub fn to_token(&self) -> PiiString {
        let hash = crypto::sha256(&self.0);
        let token = base62::encode(&hash);
        let top16 = token.chars().take(16).collect();
        PiiString::new(top16)
    }
}

impl std::fmt::Debug for Fingerprint {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        format!("Fingerprint({})", crypto::hex::encode(&self.0)).fmt(f)
    }
}

impl std::fmt::Display for Fingerprint {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        crypto::hex::encode(&self.0).fmt(f)
    }
}

impl AsRef<[u8]> for Fingerprint {
    fn as_ref(&self) -> &[u8] {
        &self.0
    }
}

impl<DB> ToSql<Binary, DB> for Fingerprint
where
    DB: Backend,
    Vec<u8>: ToSql<Binary, DB>,
{
    fn to_sql<'b>(&'b self, out: &mut diesel::serialize::Output<'b, '_, DB>) -> diesel::serialize::Result {
        self.0.to_sql(out)
    }
}

impl<DB> FromSql<Binary, DB> for Fingerprint
where
    DB: Backend,
    Vec<u8>: FromSql<Binary, DB>,
{
    fn from_sql(bytes: DB::RawValue<'_>) -> diesel::deserialize::Result<Self> {
        Ok(Self::from(Vec::<u8>::from_sql(bytes)?))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_to_token() {
        // Ensure that the output of to_token remains constant to avoid breaking searchability.
        let fp = Fingerprint("foo bar".as_bytes().to_vec());
        let token = fp.to_token();
        assert_eq!(token.leak(), "rCcQbqZ0gP9LPnm5")
    }
}
