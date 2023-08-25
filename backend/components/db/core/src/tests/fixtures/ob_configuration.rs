use crate::PgConn;
use newtypes::{CipKind, CollectedDataOption, DbActor, TenantId};

use crate::models::ob_configuration::ObConfiguration;

pub fn create(conn: &mut PgConn, tenant_id: &TenantId, is_live: bool) -> ObConfiguration {
    ObConfiguration::create(
        conn,
        "Flerp config".to_owned(),
        tenant_id.clone(),
        vec![CollectedDataOption::PhoneNumber],
        vec![],
        vec![CollectedDataOption::PhoneNumber],
        is_live,
        None,
        false,
        false,
        false,
        None,
        DbActor::Footprint,
    )
    .expect("Could not create ob config")
}

pub fn create_with_opts(
    conn: &mut PgConn,
    tenant_id: &TenantId,
    is_live: bool,
    must_collect_options: Option<Vec<CollectedDataOption>>,
    cip_kind: Option<CipKind>,
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
        must_collect.clone(),
        Vec::new(),
        must_collect,
        is_live,
        cip_kind,
        false,
        false,
        false,
        None,
        DbActor::Footprint,
    )
    .expect("Could not create ob config")
}
