use crate::errors::DbError;
use crate::models::access_events::AccessEvent;
use crate::models::onboardings::*;
use crate::models::types::DataKind;
use crate::schema;
use crate::DbPool;
use diesel::prelude::*;

pub async fn list(
    pool: &DbPool,
    fp_user_id: String,
    tenant_id: String,
    kind: Option<DataKind>,
) -> Result<Vec<(AccessEvent, Onboarding)>, DbError> {
    let conn = pool.get().await?;
    let result = conn
        .interact(move |conn| {
            let mut results = schema::access_events::table
                .inner_join(schema::onboardings::table)
                .order_by(schema::access_events::timestamp.desc())
                .filter(schema::onboardings::user_ob_id.eq(fp_user_id))
                .filter(schema::onboardings::tenant_id.eq(tenant_id))
                .into_boxed();

            if let Some(kind) = kind {
                results = results.filter(schema::access_events::data_kind.eq(kind));
            }

            results.load(conn)
        })
        .await??;
    Ok(result)
}
