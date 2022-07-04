pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumString};

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Deserialize,
    Serialize,
    Apiv2Schema,
    PartialEq,
    Eq,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "PascalCase")]
#[diesel(sql_type = Text)]
pub enum Vendor {
    Footprint,
    Idology,
    Socure,
    LexisNexis,
    Experian,
}

impl<DB> diesel::serialize::ToSql<Text, DB> for Vendor
where
    DB: diesel::backend::Backend,
    str: diesel::serialize::ToSql<Text, DB>,
{
    fn to_sql<'b>(&'b self, out: &mut diesel::serialize::Output<'b, '_, DB>) -> diesel::serialize::Result {
        let s = self.as_ref();
        s.to_sql(out)
    }
}
