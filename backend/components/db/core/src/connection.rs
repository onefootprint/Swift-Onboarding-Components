use crate::PgConn;

/// Wrapper around a PgConnection that allows us to have type-safety for functions that should only
/// ever run inside of a transaction.
#[derive(derive_more::Deref, derive_more::DerefMut)]
pub struct TxnPgConn<'a>(&'a mut PgConn);

impl<'a> TxnPgConn<'a> {
    pub fn new(conn: &'a mut PgConn) -> Self {
        Self(conn)
    }

    pub fn conn(&mut self) -> &mut PgConn {
        self.0
    }
}
