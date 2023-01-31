use std::collections::HashSet;

pub(crate) fn split_sandbox_parts(s: &str) -> Result<(&str, &str), crate::Error> {
    let res = if s.contains('#') {
        let split = s.split('#').collect::<Vec<&str>>();
        let allowed_characters = HashSet::<char>::from_iter(['_']);

        if split.len() != 2
            || split[1].is_empty()
            // "sandbox suffix" must match [a-zA-Z0-9_]+
            || !split[1].chars().all(|x| x.is_alphanumeric() || allowed_characters.contains(&x))
        {
            return Err(crate::Error::InvalidSandboxSuffix);
        }
        (split[0], split[1])
    } else {
        (s, "")
    };
    Ok(res)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]

    fn test_split_sandbox_parts() {
        let test_cases: Vec<(&str, (&str, &str), bool)> = vec![
            // no # -> OK
            ("12455", ("12455", ""), true),
            // empty after # -> Err
            ("abcde#", ("", ""), false),
            // 2 portions with # -> Err
            ("abcde#1#2", ("", ""), false),
            // contains non-alphanumeric and no  -> Err
            ("abcde#1!", ("", ""), false),
            // contains a alphanumeric + a non-alpha character in the allowed characters list
            ("abcde#1_", ("abcde", "1_"), true),
            // contains only alphanumeric
            ("abcde#Aa9", ("abcde", "Aa9"), true),
        ];

        for (test_case, expected, should_pass) in test_cases {
            let res = split_sandbox_parts(test_case);

            if should_pass {
                assert_eq!(res.unwrap(), expected)
            } else {
                assert!(res.is_err());
            }
        }
    }
}
