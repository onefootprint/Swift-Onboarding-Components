use diesel::backend::Backend;
use diesel::deserialize::{
    FromSql,
    FromSqlRow,
};
use diesel::expression::AsExpression;
use diesel::serialize::ToSql;
use diesel::sql_types::BigInt;
use paperclip::actix::Apiv2Schema;

#[doc = "Sequence number used to order DataLifetimes"]
#[derive(
    Debug,
    Clone,
    Hash,
    PartialEq,
    Eq,
    Ord,
    PartialOrd,
    derive_more::Display,
    derive_more::From,
    derive_more::Into,
    derive_more::FromStr,
    serde::Serialize,
    serde::Deserialize,
    Default,
    Apiv2Schema,
    // This is implemented separately because we need to derive Copy...
    Copy,
    AsExpression,
    FromSqlRow,
)]
#[serde(transparent)]
#[diesel(sql_type = BigInt)]
pub struct DataLifetimeSeqno(i64);

impl<DB> ToSql<BigInt, DB> for DataLifetimeSeqno
where
    DB: Backend,
    i64: ToSql<BigInt, DB>,
{
    fn to_sql<'b>(&'b self, out: &mut diesel::serialize::Output<'b, '_, DB>) -> diesel::serialize::Result {
        self.0.to_sql(out)
    }
}

impl<DB> FromSql<BigInt, DB> for DataLifetimeSeqno
where
    DB: Backend,
    i64: FromSql<BigInt, DB>,
{
    fn from_sql(bytes: diesel::backend::RawValue<'_, DB>) -> diesel::deserialize::Result<Self> {
        Ok(Self::from(i64::from_sql(bytes)?))
    }
}
