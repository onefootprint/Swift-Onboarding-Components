#[macro_use]
extern crate diesel_migrations;

use diesel_migrations::EmbeddedMigrations;

#[allow(unused_imports)]
pub mod schema;

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!();
