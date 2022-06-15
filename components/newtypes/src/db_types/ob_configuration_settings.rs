
use diesel::serialize::Output;
use diesel::{
    pg::Pg,
    sql_types::Jsonb,
    types::{FromSql, ToSql},
};
use diesel::{AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use serde_json;
use std::io::Write;


#[derive(FromSqlRow, AsExpression, Eq, PartialEq, Serialize, Deserialize, Debug, Clone, Apiv2Schema)]
#[sql_type = "Jsonb"]
pub enum ObConfigurationSettings {
    Empty,
}

impl diesel::deserialize::FromSql<diesel::sql_types::Jsonb, Pg> for ObConfigurationSettings {
    fn from_sql(
        bytes: Option<&<Pg as diesel::backend::Backend>::RawValue>,
    ) -> diesel::deserialize::Result<Self> {
        let value = <serde_json::Value as FromSql<Jsonb, Pg>>::from_sql(bytes)?;
        Ok(serde_json::from_value(value)?)
    }
}

impl ToSql<Jsonb, Pg> for ObConfigurationSettings {
    fn to_sql<W: Write>(&self, out: &mut Output<W, Pg>) -> diesel::serialize::Result {
        let value = serde_json::to_value(self)?;
        <serde_json::Value as ToSql<Jsonb, Pg>>::to_sql(&value, out)
    }
}