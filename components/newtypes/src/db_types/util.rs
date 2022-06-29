/// helper for implementing Text <-> Enum conversions
/// Type must impl `FromStr` and `ToString`
/// example `derive_diesel_text_enum!(DataKind)`
macro_rules! derive_diesel_text_enum {
    ($t:ty) => {
        impl diesel::deserialize::FromSql<diesel::sql_types::Text, diesel::pg::Pg> for $t {
            fn from_sql(
                bytes: Option<&<diesel::pg::Pg as diesel::backend::Backend>::RawValue>,
            ) -> diesel::deserialize::Result<Self> {
                let bytes = diesel::not_none!(bytes);
                let str = std::str::from_utf8(bytes)?;
                let result = <$t>::from_str(str)?;
                Ok(result)
            }
        }

        impl diesel::types::ToSql<diesel::sql_types::Text, diesel::pg::Pg> for $t {
            fn to_sql<W: std::io::Write>(
                &self,
                out: &mut diesel::serialize::Output<W, diesel::pg::Pg>,
            ) -> diesel::serialize::Result {
                let string = self.to_string();
                out.write_all(string.as_bytes())?;
                Ok(diesel::types::IsNull::No)
            }
        }
    };
}

pub(crate) use derive_diesel_text_enum;
