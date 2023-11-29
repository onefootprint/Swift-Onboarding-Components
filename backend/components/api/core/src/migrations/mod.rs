// Really obnoxious that we have to define this migration here. Sadly, the tests use utils defined
// in #[cfg(test)] blocks, which cannot be accessed if we define the migration outside of this crate...

pub mod m112223_backfill_portable_data;
#[cfg(test)]
mod test_m112223_backfill_portable_data;
