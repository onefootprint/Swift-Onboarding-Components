use crate::schema::requirement_verification_request_junction;

#[allow(unused)]
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{RequirementId, Uuid, VerificationRequestId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = requirement_verification_request_junction)]
pub struct RequirementVerificationRequestJunction {
    pub id: Uuid,
    pub verification_request_id: VerificationRequestId,
    pub requirement_id: RequirementId,
}
