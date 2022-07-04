use diesel;
use diesel::AsExpression;
use diesel::FromSqlRow;
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use serde_json;

#[derive(AsJsonb, Eq, PartialEq, Serialize, Deserialize, Debug, Clone, Apiv2Schema)]
pub enum ObConfigurationSettings {
    Empty,
}
