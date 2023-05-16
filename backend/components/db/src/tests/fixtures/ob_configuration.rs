use crate::PgConn;
use newtypes::{CollectedDataOption, TenantId};

use crate::models::ob_configuration::ObConfiguration;

pub fn create(conn: &mut PgConn, tenant_id: &TenantId, is_live: bool) -> ObConfiguration {
    ObConfiguration::create(
        conn,
        "Flerp config".to_owned(),
        tenant_id.clone(),
        vec![CollectedDataOption::PhoneNumber],
        vec![CollectedDataOption::PhoneNumber],
        is_live,
    )
    .expect("Could not create ob config")
}

pub fn create_with_opts(
    conn: &mut PgConn,
    tenant_id: &TenantId,
    is_live: bool,
    must_collect_options: Option<Vec<CollectedDataOption>>,
) -> ObConfiguration {
    let must_collect = if let Some(mc) = must_collect_options {
        mc
    } else {
        vec![CollectedDataOption::PhoneNumber]
    };

    ObConfiguration::create(
        conn,
        "Flerp config".to_owned(),
        tenant_id.clone(),
        must_collect,
        vec![CollectedDataOption::PhoneNumber],
        is_live,
    )
    .expect("Could not create ob config")
}
