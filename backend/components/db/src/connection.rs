use crate::PgConn;

/// Wrapper around a PgConnection that allows us to have type-safety for functions that should only
/// ever run inside of a transaction.
pub struct TxnPgConn<'a>(&'a mut PgConn);

impl<'a> std::ops::Deref for TxnPgConn<'a> {
    type Target = PgConn;
    fn deref(&self) -> &Self::Target {
        self.0
    }
}

impl<'a> std::ops::DerefMut for TxnPgConn<'a> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        self.0
    }
}

impl<'a> TxnPgConn<'a> {
    pub fn new(conn: &'a mut PgConn) -> Self {
        Self(conn)
    }

    pub fn conn(&mut self) -> &mut PgConn {
        self.0
    }
}
