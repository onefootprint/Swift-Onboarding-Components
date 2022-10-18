use diesel::PgConnection;

/// Wrapper around a PgConnection that allows us to have type-safety for functions that should only
/// ever run inside of a transaction.
pub struct TxnPgConnection<'a>(&'a mut PgConnection);

impl<'a> std::ops::Deref for TxnPgConnection<'a> {
    type Target = PgConnection;
    fn deref(&self) -> &Self::Target {
        self.0
    }
}

impl<'a> std::ops::DerefMut for TxnPgConnection<'a> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        self.0
    }
}

impl<'a> TxnPgConnection<'a> {
    pub fn new(conn: &'a mut PgConnection) -> Self {
        Self(conn)
    }

    pub fn conn(&mut self) -> &mut PgConnection {
        self.0
    }
}
