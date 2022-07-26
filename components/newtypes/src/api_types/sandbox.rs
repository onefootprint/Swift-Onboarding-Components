pub(crate) fn split_sandbox_parts(s: &str) -> Result<(&str, &str), crate::Error> {
    let res = if s.contains('#') {
        let split = s.split('#').collect::<Vec<&str>>();
        if split.len() != 2 || split[1].is_empty() || !split[1].chars().all(|x| x.is_alphanumeric()) {
            return Err(crate::PhoneError::InvalidSandboxSuffix.into());
        }
        (split[0], split[1])
    } else {
        (s, "")
    };
    Ok(res)
}
