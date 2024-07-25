use crate::SealedVaultDataKey;
use crypto::aead::AeadSealedBytes;
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

/// Symmetric key sealed bytes (for session data)
#[derive(
    Debug, Clone, Hash, PartialEq, Eq, From, Into, Serialize, Deserialize, Default, AsExpression, FromSqlRow,
)]
#[serde(transparent)]
#[diesel(sql_type = Binary)]
pub struct SealedSessionBytes(pub Vec<u8>);

impl From<AeadSealedBytes> for SealedSessionBytes {
    fn from(v: AeadSealedBytes) -> Self {
        Self(v.0)
    }
}

impl From<SealedSessionBytes> for AeadSealedBytes {
    fn from(v: SealedSessionBytes) -> Self {
        AeadSealedBytes(v.0)
    }
}

impl AsRef<[u8]> for SealedSessionBytes {
    fn as_ref(&self) -> &[u8] {
        &self.0
    }
}

impl<DB> ToSql<Binary, DB> for SealedSessionBytes
where
    DB: Backend,
    Vec<u8>: ToSql<Binary, DB>,
{
    fn to_sql<'b>(&'b self, out: &mut diesel::serialize::Output<'b, '_, DB>) -> diesel::serialize::Result {
        self.0.to_sql(out)
    }
}

impl<DB> FromSql<Binary, DB> for SealedSessionBytes
where
    DB: Backend,
    Vec<u8>: FromSql<Binary, DB>,
{
    fn from_sql(bytes: DB::RawValue<'_>) -> diesel::deserialize::Result<Self> {
        Ok(Self::from(Vec::<u8>::from_sql(bytes)?))
    }
}

/// Asymmetric (vault public key, sealed bytes)
#[derive(
    Clone, Hash, PartialEq, Eq, From, Into, Serialize, Deserialize, Default, AsExpression, FromSqlRow,
)]
#[serde(transparent)]
#[diesel(sql_type = Binary)]
pub struct SealedVaultBytes(pub Vec<u8>);

impl std::fmt::Debug for SealedVaultBytes {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        crypto::hex::encode(&self.0).fmt(f)
    }
}

impl AsRef<[u8]> for SealedVaultBytes {
    fn as_ref(&self) -> &[u8] {
        &self.0
    }
}

impl From<SealedVaultDataKey> for SealedVaultBytes {
    fn from(key: SealedVaultDataKey) -> Self {
        Self(key.0)
    }
}

impl From<AeadSealedBytes> for SealedVaultBytes {
    fn from(v: AeadSealedBytes) -> Self {
        Self(v.0)
    }
}

impl<DB> ToSql<Binary, DB> for SealedVaultBytes
where
    DB: Backend,
    Vec<u8>: ToSql<Binary, DB>,
{
    fn to_sql<'b>(&'b self, out: &mut diesel::serialize::Output<'b, '_, DB>) -> diesel::serialize::Result {
        self.0.to_sql(out)
    }
}

impl<DB> FromSql<Binary, DB> for SealedVaultBytes
where
    DB: Backend,
    Vec<u8>: FromSql<Binary, DB>,
{
    fn from_sql(bytes: DB::RawValue<'_>) -> diesel::deserialize::Result<Self> {
        Ok(Self::from(Vec::<u8>::from_sql(bytes)?))
    }
}
