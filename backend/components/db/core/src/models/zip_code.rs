use crate::PgConn;
use api_errors::FpResult;
use db_schema::schema::zip_code;
use diesel::prelude::*;
use newtypes::ZipCode as NTZipCode;

// PG version of https://download.geonames.org/
#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = zip_code)]
pub struct ZipCode {
    pub code: NTZipCode,
    pub city: String,
    pub state: Option<String>,
    pub state_code: Option<String>,
    pub latitude: f64,
    pub longitude: f64,
}

impl ZipCode {
    pub fn get(conn: &mut PgConn, zip_code: NTZipCode) -> FpResult<Self> {
        let res = zip_code::table
            .filter(zip_code::code.eq(zip_code))
            .get_result(conn)?;

        Ok(res)
    }
}
