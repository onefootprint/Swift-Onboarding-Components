// TODO put prelude / fixtures in a feature to not compile in the prod binary
// https://stackoverflow.com/questions/41700543/can-we-share-test-utilites-between-crates

/// Contains all test helper utils that should be auto-imported in test files
pub mod prelude;

/// Contains utils to create fixture data when running tests
pub mod fixtures;

#[cfg(test)]
mod data_lifetime;

#[cfg(test)]
mod ob_configuration;
