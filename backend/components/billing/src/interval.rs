use crate::BResult;
use crate::Error;
use chrono::DateTime;
use chrono::Datelike;
use chrono::Months;
use chrono::NaiveDate;
use chrono::Utc;
use std::ops::Add;

#[derive(Debug, Clone, Copy)]
pub struct BillingInterval {
    pub start: DateTime<Utc>,
    pub end: DateTime<Utc>,
}

/// Calculate the beginning and end of the current billing interval.
/// Our billing intervals span midnight UTC on the first day of each month.
pub fn get_billing_interval(date: NaiveDate) -> BResult<BillingInterval> {
    let utc_timestamp_first_day_of_month = |date: NaiveDate| {
        date.with_day(1)
            .ok_or(Error::CannotComputeBillingInterval)?
            .and_hms_opt(0, 0, 0)
            .ok_or(Error::CannotComputeBillingInterval)?
            .and_local_timezone(Utc)
            .single()
            .ok_or(Error::CannotComputeBillingInterval)
    };
    let first_day_of_month = utc_timestamp_first_day_of_month(date)?;
    let first_day_of_next_month = utc_timestamp_first_day_of_month(date.add(Months::new(1)))?;
    let interval = BillingInterval {
        start: first_day_of_month,
        end: first_day_of_next_month,
    };

    Ok(interval)
}

impl BillingInterval {
    pub fn label(&self) -> String {
        self.start.format("%Y-%m").to_string()
    }
}

#[cfg(test)]
mod test {
    use super::get_billing_interval;
    use chrono::NaiveDate;
    use chrono::Utc;
    use test_case::test_case;

    #[test_case("2023-02-01" => "2023-02".to_owned())]
    #[test_case("2023-02-28" => "2023-02".to_owned())]
    #[test_case("1999-12-31" => "1999-12".to_owned())]
    fn test_get_billing_interval_label(date: &str) -> String {
        let date = NaiveDate::parse_from_str(date, "%Y-%m-%d").unwrap();
        get_billing_interval(date).unwrap().label()
    }

    #[test_case("2023-02-01", "2023-02-01")]
    #[test_case("2023-02-28", "2023-02-01")]
    #[test_case("2023-02-14", "2023-02-01")]
    #[test_case("2020-12-25", "2020-12-01")]
    fn test_get_billing_interval_start(date: &str, expected_start: &str) {
        let date = NaiveDate::parse_from_str(date, "%Y-%m-%d").unwrap();
        let start = get_billing_interval(date).unwrap().start;
        let expected_start = NaiveDate::parse_from_str(expected_start, "%Y-%m-%d")
            .unwrap()
            .and_hms_opt(0, 0, 0)
            .unwrap()
            .and_local_timezone(Utc)
            .single()
            .unwrap();
        assert_eq!(start, expected_start);
    }

    #[test_case("2023-02-01", "2023-03-01")]
    #[test_case("2023-02-28", "2023-03-01")]
    #[test_case("2023-02-14", "2023-03-01")]
    #[test_case("2023-03-31", "2023-04-01")]
    #[test_case("2020-12-25", "2021-01-01")]
    fn test_get_billing_interval_end(date: &str, expected_end: &str) {
        let date = NaiveDate::parse_from_str(date, "%Y-%m-%d").unwrap();
        let end = get_billing_interval(date).unwrap().end;
        let expected_end = NaiveDate::parse_from_str(expected_end, "%Y-%m-%d")
            .unwrap()
            .and_hms_opt(0, 0, 0)
            .unwrap()
            .and_local_timezone(Utc)
            .single()
            .unwrap();
        assert_eq!(end, expected_end);
    }
}
