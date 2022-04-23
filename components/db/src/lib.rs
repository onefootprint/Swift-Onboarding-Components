extern crate openssl; // this is needed because https://github.com/clux/muslrust#diesel-and-pq-builds

#[macro_use]
extern crate diesel;

#[macro_use]
extern crate diesel_migrations;

pub mod models;
use std::any;

use deadpool_diesel::postgres::{Manager, Pool, Runtime};
use diesel::prelude::*;
use models::tenant::{NewTenant, Tenant};

pub mod schema;
pub mod types;

embed_migrations!();

pub type DbPool = Pool;

/// Initialize our DB
pub fn init(url: &str) -> anyhow::Result<DbPool> {
    let manager = Manager::new(url, Runtime::Tokio1);
    let pool = Pool::builder(manager).max_size(8).build()?;

    Ok(pool)
}

pub fn run_migrations(url: &str) -> anyhow::Result<()> {
    let conn = PgConnection::establish(url)?;
    embedded_migrations::run(&conn)?;
    Ok(())
}

pub async fn test(pool: &Pool) -> anyhow::Result<Tenant> {
    let new_tenant = NewTenant {
        name: "Apple".to_string(),
    };

    let conn = pool.get().await?;

    let tenant = conn
        .interact(move |conn| {
            diesel::insert_into(schema::tenants::table)
                .values(&new_tenant)
                .get_result::<Tenant>(conn)
        })
        .await
        .unwrap()?;

    Ok(tenant)
}
