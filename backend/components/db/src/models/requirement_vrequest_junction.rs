use crate::schema::requirement_verification_request_junction;

use crate::DbResult;
#[allow(unused)]
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, Queryable};
use newtypes::{RequirementId, Uuid, VerificationRequestId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = requirement_verification_request_junction)]
pub struct RequirementVerificationRequestJunction {
    pub id: Uuid,
    pub verification_request_id: VerificationRequestId,
    pub requirement_id: RequirementId,
}

impl RequirementVerificationRequestJunction {
    fn bulk_create(
        conn: &mut PgConnection,
        new_records: Vec<RequirementVerificationRequestJunction>,
    ) -> DbResult<Self> {
        let result = diesel::insert_into(requirement_verification_request_junction::table)
            .values(new_records)
            .get_result::<RequirementVerificationRequestJunction>(conn)?;
        Ok(result)
    }
}
