use chrono::NaiveDate;
pub use derive_more::{Add, Display, From, FromStr, Into};
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::{self, Serialize};
use std::fmt::Debug;

use crate::api_schema_helper::api_data_type_alias;
use crate::DobError;
use crate::PiiString;

#[derive(Clone, Debug, Hash, PartialEq, Eq, Serialize, Deserialize, Default)]
/// Date of birth. Day, month, and year are integers (not strings).
/// Example of a valid dob struct:
/// "{\"month\": 1, \"day\": 9, \"year\": 1998 }",
pub struct Dob {
    day: Day,
    month: Month,
    year: Year,
}

#[derive(Display, Clone, Hash, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(try_from = "u32")]
pub struct Day(u32);
api_data_type_alias!(Day, Number);

#[derive(Display, Clone, Hash, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(try_from = "u32")]
pub struct Month(u32);
api_data_type_alias!(Month, Number);

#[derive(Display, Clone, Hash, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(try_from = "i32")]
pub struct Year(i32);
api_data_type_alias!(Year, Number);

#[derive(Clone, Debug, Hash, PartialEq, Eq, Serialize, Deserialize, Apiv2Schema)]
#[serde(try_from = "Dob")]
/// Date of birth. Day, month, and year are integers (not strings).
/// Example of a valid dob struct:
/// "{\"month\": 1, \"day\": 9, \"year\": 1998 }",
pub struct DateOfBirth {
    pub day: Day,
    pub month: Month,
    pub year: Year,
}

impl TryFrom<PiiString> for Dob {
    type Error = crate::Error;
    fn try_from(s: PiiString) -> Result<Self, Self::Error> {
        let parts: Vec<&str> = s.leak().split('-').collect();
        if parts.len() != 3 {
            return Err(DobError::InvalidDob.into());
        }
        let year: i32 = parts[0].parse().map_err(|_| DobError::InvalidYear)?;
        let month: u32 = parts[1].parse().map_err(|_| DobError::InvalidMonth)?;
        let day: u32 = parts[2].parse().map_err(|_| DobError::InvalidDay)?;
        let result = Self {
            day: Day::try_from(day)?,
            month: Month::try_from(month)?,
            year: Year::try_from(year)?,
        };
        Ok(result)
    }
}

impl TryFrom<Dob> for DateOfBirth {
    type Error = crate::Error;

    fn try_from(value: Dob) -> Result<Self, Self::Error> {
        // check if it's a valid date using NaiveDate
        let (year, month, day) = (value.year.0, value.month.0, value.day.0);
        let _date = NaiveDate::parse_from_str(&format!("{year}-{month}-{day}"), "%Y-%m-%d")
            .map_err(|_| crate::DobError::NonexistantDate(format!("{year}-{month}-{day}")))?;

        Ok(DateOfBirth {
            day: value.day,
            month: value.month,
            year: value.year,
        })
    }
}

impl From<DateOfBirth> for PiiString {
    fn from(data: DateOfBirth) -> Self {
        data.default_string_format()
    }
}

impl DateOfBirth {
    pub fn yyyy_mm_dd(&self) -> PiiString {
        self.default_string_format()
    }

    fn default_string_format(&self) -> PiiString {
        let (year, month, day) = (self.year.0, self.month.0, self.day.0);
        PiiString::new(format!("{year:04}-{month:02}-{day:02}"))
    }
}

impl TryFrom<PiiString> for DateOfBirth {
    type Error = crate::Error;
    fn try_from(s: PiiString) -> Result<Self, Self::Error> {
        let parts: Vec<&str> = s.leak().split('-').collect();
        if parts.len() != 3 {
            return Err(DobError::InvalidDob.into());
        }
        let year: i32 = parts[0].parse().map_err(|_| DobError::InvalidYear)?;
        let month: u32 = parts[1].parse().map_err(|_| DobError::InvalidMonth)?;
        let day: u32 = parts[2].parse().map_err(|_| DobError::InvalidDay)?;
        let result = Self {
            day: Day::try_from(day)?,
            month: Month::try_from(month)?,
            year: Year::try_from(year)?,
        };
        Ok(result)
    }
}

impl TryFrom<u32> for Day {
    type Error = crate::Error;

    fn try_from(value: u32) -> Result<Self, Self::Error> {
        if !(1..=31).contains(&value) {
            return Err(crate::DobError::InvalidDay.into());
        }
        Ok(Day(value))
    }
}

impl std::fmt::Debug for Day {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "**")
    }
}

impl TryFrom<u32> for Month {
    type Error = crate::Error;

    fn try_from(value: u32) -> Result<Self, Self::Error> {
        if !(1..=12).contains(&value) {
            return Err(crate::DobError::InvalidMonth.into());
        }
        Ok(Month(value))
    }
}

impl std::fmt::Debug for Month {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "**")
    }
}

impl TryFrom<i32> for Year {
    type Error = crate::Error;

    fn try_from(value: i32) -> Result<Self, Self::Error> {
        Ok(Year(value))
    }
}

impl std::fmt::Debug for Year {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "****")
    }
}

#[cfg(test)]
mod tests {

    use super::*;

    #[test]
    fn test_dob() {
        let good_examples = vec![
            "{\"month\": 1, \"day\": 9, \"year\": 1998 }",
            "{\"month\": 12, \"day\": 1, \"year\": 2000 }",
            "{\"month\": 12, \"day\": 31, \"year\": 1950}",
        ];

        let bad_examples = vec![
            "{\"month\": 0, \"day\": 31, \"year\": 1998 }",
            "{\"month\": 120, \"day\": 1, \"year\": 2000 }",
            "{\"month\": 12, \"day\": 32, \"year\": 1950}",
        ];

        // this is an impossible day, there is no 31st of november
        let sample_validation = "{\"month\": 11, \"day\": 31, \"year\": 2000}";
        let sample_validation: Dob = serde_json::from_str(sample_validation).unwrap();
        let validated = DateOfBirth::try_from(sample_validation);
        assert!(validated.is_err());

        // the year 2000 was a leap year
        let leap_year = "{\"month\": 2, \"day\": 29, \"year\": 2000}";
        let leap_year: Dob = serde_json::from_str(leap_year).unwrap();
        let validated_leap_year = DateOfBirth::try_from(leap_year);
        assert!(validated_leap_year.is_ok());

        // the year 20001 was not a leap year
        let leap_year_bad = "{\"month\": 2, \"day\": 29, \"year\": 2001}";
        let leap_year_bad: Dob = serde_json::from_str(leap_year_bad).unwrap();
        let validated_leap_year_bad = DateOfBirth::try_from(leap_year_bad);
        assert!(validated_leap_year_bad.is_err());

        let good_deserialized: Vec<Result<Dob, serde_json::Error>> =
            good_examples.into_iter().map(serde_json::from_str).collect();

        let bad_deserialized: Vec<Result<Dob, serde_json::Error>> =
            bad_examples.into_iter().map(serde_json::from_str).collect();

        for v in good_deserialized {
            assert!(v.is_ok());
            assert_eq!(format!("{:?}", v), "Ok(Dob { day: **, month: **, year: **** })")
        }
        for v in bad_deserialized {
            assert!(v.is_err());
        }
    }
}
