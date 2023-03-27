use itertools::Itertools;
use levenshtein::levenshtein;

#[allow(dead_code)] // temp
pub(super) fn smart_name_distance(name1: &str, name2: &str) -> Option<usize> {
    let clean_and_split = |s: &str| -> Vec<String> {
        let s = s.trim().to_uppercase();
        s.split(' ')
            .map(|x| x.chars().filter(|c| c.is_alphanumeric()).collect::<String>())
            .collect()
    };
    let name1_parts = clean_and_split(name1);
    let name2_parts = clean_and_split(name2);

    if name1_parts.len() < 2 || name2_parts.len() < 2 {
        return None;
    }

    // Where N is the number of words in name1, select all length-N permutations of name2_parts.
    // Choose the permutation that yields the smallest levenshtein difference.
    // This has a few benefits:
    // - We ignore differences in the ordering of names
    // - We remove extra names from name2, like a middle name
    name2_parts
        .into_iter()
        .permutations(name1_parts.len())
        .map(|name2_parts| {
            // Calculate the sum of levenshtein difference between parts of name1 and name2 zipped
            name2_parts
                .iter()
                .zip(name1_parts.iter())
                .map(|(x, y)| levenshtein(x, y))
                .sum()
        })
        .min()
}

#[allow(clippy::expect_used)]
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests {
    use test_case::test_case;
    // Helpers tests
    #[test_case("elliott forde", "ElLioTt ForDe" => Some(0))]
    #[test_case("elliott forde", "FORDE, ELLIOTT" => Some(0))]
    #[test_case("elliott forde", "FORDE ELLIOT" => Some(1))]
    #[test_case("elliott forde", "FORDE ELLIOTT VETLE" => Some(0))]
    #[test_case("forde elliott", "ELLIOTT FORDE VETLE" => Some(0))]
    #[test_case("elliott forde", "CONRAD FORDE" => Some(7))]
    #[test_case("elliott", "elliott forde" => None)]
    #[test_case("elliott forde", "elliott" => None)]
    #[test_case("elliott forde", "" => None)]
    fn test_good_emails(name1: &str, name2: &str) -> Option<usize> {
        super::smart_name_distance(name1, name2)
    }
}
