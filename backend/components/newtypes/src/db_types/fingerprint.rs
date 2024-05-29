use derive_more::{
    From,
    Into,
};
use diesel::backend::Backend;
use diesel::deserialize::{
    FromSql,
    FromSqlRow,
};
use diesel::expression::AsExpression;
use diesel::serialize::ToSql;
use diesel::sql_types::Binary;
use serde::{
    Deserialize,
    Serialize,
};

#[derive(
    Clone, Hash, PartialEq, Eq, From, Into, Serialize, Deserialize, Default, AsExpression, FromSqlRow,
)]
#[serde(transparent)]
#[diesel(sql_type = Binary)]
pub struct Fingerprint(pub Vec<u8>);

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
    fn from_sql(bytes: diesel::backend::RawValue<'_, DB>) -> diesel::deserialize::Result<Self> {
        Ok(Self::from(Vec::<u8>::from_sql(bytes)?))
    }
}
