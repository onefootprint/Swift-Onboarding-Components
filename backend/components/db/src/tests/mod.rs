// TODO put prelude / fixtures in a feature to not compile in the prod binary
// https://stackoverflow.com/questions/41700543/can-we-share-test-utilites-between-crates

/// Contains all test helper utils that should be auto-imported in test files
pub mod prelude;

/// Contains utils to create fixture data when running tests
pub mod fixtures;

#[allow(clippy::expect_used)]
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod data_lifetime;

#[allow(clippy::expect_used)]
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod ob_configuration;

/// Only compiles when running doctests. Contains some tests that can't be performed in normal
/// unit tests.
#[cfg(doctest)]
mod test_db_query;

#[allow(clippy::expect_used)]
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod vault;

#[allow(clippy::expect_used)]
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod verification_request;

#[allow(clippy::expect_used)]
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tenant;

#[allow(clippy::expect_used)]
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod watchlist_check;

pub mod test_db_pool;
