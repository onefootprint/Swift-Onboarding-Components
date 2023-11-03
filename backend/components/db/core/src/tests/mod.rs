// TODO put prelude / fixtures in a feature to not compile in the prod binary
// https://stackoverflow.com/questions/41700543/can-we-share-test-utilites-between-crates

use std::sync::Arc;

use feature_flag::MockFeatureFlagClient;

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

pub fn mock_ff_client() -> Arc<MockFeatureFlagClient> {
    let mut mock_ff_client = MockFeatureFlagClient::new();
    mock_ff_client.expect_flag().returning(|f| f.default());
    Arc::new(mock_ff_client)
}
