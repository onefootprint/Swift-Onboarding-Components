use itertools::Itertools;
use std::str::FromStr;
use strum_macros::EnumDiscriminants;
use strum_macros::EnumString;

/// Represents a data transform to apply to underlying plaintext behind a data identifier
/// i.e. `{{ id.first_name | to_lower_case }}
#[derive(Debug, Clone, EnumDiscriminants, PartialEq, Eq, Hash)]
#[strum_discriminants(name(FilterFunctionName))]
#[strum_discriminants(derive(serde_with::SerializeDisplay, strum_macros::Display, EnumString, Hash))]
#[strum_discriminants(vis(pub))]
#[strum_discriminants(strum(serialize_all = "snake_case"))]
pub enum FilterFunction {
    ToLowercase,
    ToUppercase,
    ToAscii,
    Prefix { count: usize },
    Suffix { count: usize },
}

#[derive(thiserror::Error, Debug, PartialEq)]
pub enum FilterFunctionParsingError {
    #[error("invalid parens")]
    InvalidParens,

    #[error("unexpected number of arguments: {found} but expected: {expected}")]
    UnexpectedArguments { expected: usize, found: usize },

    #[error("missing argument: {0}")]
    MissingArgument(&'static str),

    #[error("argument could not parse as Integer")]
    InvalidIntegerArgumentType(#[from] std::num::ParseIntError),

    #[error("unknown function")]
    UnknownFunctionName,
}

impl FilterFunction {
    /// gets the name of the filter function
    pub fn name(&self) -> FilterFunctionName {
        self.into()
    }

    fn num_args(&self) -> usize {
        match self {
            FilterFunction::ToLowercase | FilterFunction::ToUppercase | FilterFunction::ToAscii => 0,
            FilterFunction::Prefix { .. } | FilterFunction::Suffix { .. } => 1,
        }
    }

    /// Parse a single filter functions, i.e. `to_ascii`
    pub fn parse(raw: &str) -> Result<Self, FilterFunctionParsingError> {
        let raw = raw.trim();

        // functions can either have arguments or none
        let (name, args) = match (raw.find('('), raw.find(')')) {
            (Some(open), Some(close)) if open < close => {
                // check nothing after close paren
                if close + 1 != raw.len() {
                    return Err(FilterFunctionParsingError::InvalidParens)?;
                }

                let name = &raw[0..open];
                let args = raw[open + 1..close]
                    .split(',')
                    .map(|s| s.trim())
                    .filter(|s| !s.is_empty())
                    .collect_vec();
                (name, args)
            }
            (None, None) => (raw, vec![]),
            _ => return Err(FilterFunctionParsingError::InvalidParens)?,
        };

        let ff_name = FilterFunctionName::from_str(name)
            .map_err(|_| FilterFunctionParsingError::UnknownFunctionName)?;

        let num_args_found = args.len();

        let func = match ff_name {
            FilterFunctionName::ToLowercase => FilterFunction::ToLowercase,
            FilterFunctionName::ToUppercase => FilterFunction::ToUppercase,
            FilterFunctionName::ToAscii => FilterFunction::ToAscii,
            FilterFunctionName::Prefix => FilterFunction::Prefix {
                count: args
                    .into_iter()
                    .next()
                    .ok_or(FilterFunctionParsingError::MissingArgument("count"))?
                    .parse()
                    .map_err(FilterFunctionParsingError::from)?,
            },
            FilterFunctionName::Suffix => FilterFunction::Suffix {
                count: args
                    .into_iter()
                    .next()
                    .ok_or(FilterFunctionParsingError::MissingArgument("count"))?
                    .parse()
                    .map_err(FilterFunctionParsingError::from)?,
            },
        };

        if num_args_found != func.num_args() {
            return Err(FilterFunctionParsingError::UnexpectedArguments {
                expected: func.num_args(),
                found: num_args_found,
            })?;
        }

        Ok(func)
    }
}

#[cfg(test)]
mod tests {
    use super::FilterFunction as FF;
    use super::FilterFunctionParsingError::*;
    use super::*;
    use test_case::test_case;

    #[test_case("to_ascii" => Ok(FF::ToAscii))]
    #[test_case("prefix(4)" => Ok(FF::Prefix { count: 4}))]
    #[test_case("suffix(412)" => Ok(FF::Suffix { count: 412}))]
    #[test_case("suffix(412, 42)" => Err(UnexpectedArguments { expected: 1, found: 2 }))]
    #[test_case("to_lowercase()" => Ok(FF::ToLowercase))]
    #[test_case("to_ascii(1)" => Err(UnexpectedArguments { expected: 0, found: 1 }))]
    #[test_case(" to_uppercase " => Ok(FF::ToUppercase))]
    fn test_filter_function_parsing(input: &str) -> Result<FilterFunction, FilterFunctionParsingError> {
        FilterFunction::parse(input)
    }
}
