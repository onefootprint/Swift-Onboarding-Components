/// Doc tests have more functionality, like compile_fail, than normal unit tests.
/// This struct is not used, its documentation is only used to run doctests. See
/// https://doc.rust-lang.org/rustdoc/write-documentation/documentation-tests.html#include-items-only-when-collecting-doctests
///
/// Should compile. We can unwrap a Locked<T> into T and return T.
/// ```
/// use db::{DbPool, DbResult};
/// use newtypes::Locked;
/// pub fn test_run_query(pool: &DbPool) {
///     pool.db_query(move |conn| -> DbResult<_> {
///         Ok(Locked::new(1).into_inner())
///     });
/// }
/// ```
///
/// Should not compile because we are trying to return a Locked<T> from the db query closure.
/// ```compile_fail
/// use db::DbPool;
/// use newtypes::Locked;
/// pub fn test_run_query(pool: &DbPool) {
///     pool.db_query(move |conn| -> DbResult<_> {
///         Ok(Locked::new(1))
///     });
/// }
/// ```
pub struct TestCannotReturnLockedTFromDbQuery;
