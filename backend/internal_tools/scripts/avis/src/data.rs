//! this was converted from python to rust using chatgpt
use anyhow::bail;
use chrono::NaiveDate;
use regex::Regex;
use serde::Deserialize;
use std::collections::HashMap;

#[derive(Debug, Deserialize, Clone)]
pub struct BacktestUser {
    pub external_id: String,
    pub email: Option<String>,
    pub first_name: String,
    pub last_name: String,
    pub dob: String,
    pub address_line1: String,
    pub city: String,
    pub state: String,
    pub zip: String,
    pub country: String,
    pub drivers_license_number: String,
    pub drivers_license_state: String,

    pub damage: bool,
    pub chargeback: bool,
    pub stolen: bool,
    pub payment_failed: bool,
    pub any_fail: bool,
}
pub struct BacktestData {
    pub users: HashMap<String, BacktestUser>,
    pub ids: Vec<String>,
}

fn convert_date_format(date_str: &str) -> anyhow::Result<String> {
    let parts: Vec<&str> = date_str.split('/').collect();
    if parts.len() == 3 {
        let year = if parts[2].starts_with('0') {
            format!("20{}", parts[2])
        } else {
            format!("19{}", parts[2])
        };
        let new_date_str = format!("{}/{}/{}", parts[0], parts[1], year);
        if let Ok(date) = NaiveDate::parse_from_str(&new_date_str, "%m/%d/%Y") {
            return Ok(date.format("%Y-%m-%d").to_string());
        }
    }

    bail!("Failed to parse date: {}", date_str);
}

lazy_static::lazy_static! {
    static ref EMAIL_RE: Regex = Regex::new(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$").unwrap();
}

fn parse_email(email: &str) -> Option<String> {
    if EMAIL_RE.is_match(email) {
        Some(email.to_string())
    } else {
        None
    }
}

fn parse_zip(zip: &str) -> String {
    if zip.starts_with('\'') {
        zip.strip_prefix('\'').unwrap().to_string()
    } else {
        zip.to_string()
    }
}

pub fn parse_backtest_data(seed_file_path: &str) -> anyhow::Result<BacktestData> {
    let mut rdr = csv::ReaderBuilder::new().from_path(seed_file_path)?;

    let mut users = HashMap::new();
    let mut ids = Vec::new();

    for result in rdr.deserialize() {
        let row: HashMap<String, String> = result?;

        let user = BacktestUser {
            external_id: row["RA_NO"].clone(),
            email: row
                .get("RENTAL_EMAIL_ADDRESS")
                .and_then(|email| parse_email(email)),
            first_name: row["FIRST_NAME"].clone(),
            last_name: row["LAST_NAME"].clone(),
            dob: convert_date_format(&row["DOB_TRIMMED"])?,
            address_line1: row["STREET_ADDRESS"].clone(),
            city: row["CITY"].clone(),
            state: row["STATE"].clone(),
            zip: parse_zip(&row["ZIP_CODE"]),
            country: row["COUNTRY"].clone(),
            drivers_license_number: row["DRIVER_LICENSE_NO"].clone(),
            drivers_license_state: row["DRIVER_LICENSE_STATE_CODE"].clone(),
            damage: row["DMG_IND"] == "1",
            chargeback: row["CHB_IND"] == "1",
            stolen: row["Stolen_Ind"] == "1",
            payment_failed: row["Pmt_Fail_Ind"] == "1",
            any_fail: row["Any_Fail_Ind"] == "1",
        };

        ids.push(user.external_id.clone());
        users.insert(user.external_id.clone(), user);
    }

    Ok(BacktestData { users, ids })
}
