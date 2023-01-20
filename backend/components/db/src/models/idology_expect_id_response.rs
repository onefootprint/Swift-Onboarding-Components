use crate::schema::idology_expect_id_response;
use crate::DbError;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::Insertable;
use newtypes::{IdologyExpectIdResponseId, VerificationResultId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[diesel(table_name = idology_expect_id_response)]
pub struct IdologyExpectIdResponse {
    pub id: IdologyExpectIdResponseId,
    pub verification_result_id: VerificationResultId,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub id_number: Option<i64>,
    pub id_scan: Option<String>,
    pub error: Option<String>,
    pub results: Option<String>,
    pub summary_result: Option<String>,
    pub qualifiers: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = idology_expect_id_response)]
pub struct NewIdologyExpectIdResponse {
    pub verification_result_id: VerificationResultId,
    pub created_at: DateTime<Utc>,
    pub id_number: Option<i64>,
    pub id_scan: Option<String>,
    pub error: Option<String>,
    pub results: Option<String>,
    pub summary_result: Option<String>,
    pub qualifiers: Vec<String>,
}

impl IdologyExpectIdResponse {
    pub fn create(
        conn: &mut PgConnection,
        new_idology_expect_id_response: NewIdologyExpectIdResponse,
    ) -> Result<IdologyExpectIdResponse, DbError> {
        let result = diesel::insert_into(idology_expect_id_response::table)
            .values(new_idology_expect_id_response)
            .get_result(conn)?;
        Ok(result)
    }
}
