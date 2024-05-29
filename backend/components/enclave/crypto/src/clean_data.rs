/// Clean data before it is fingerprinted: lowercase, trim, and sha256
/// IMPORTANT NOTE!: this must stay in sync with our algorithm for signing plaintext data and sealed
/// data inside the enclave
pub fn clean_and_hash_data_for_fingerprinting(data: &[u8]) -> [u8; 32] {
    // 1.clean the data if possible
    let data = if let Ok(str_data) = std::str::from_utf8(data) {
        str_data.trim().to_lowercase().as_bytes().to_vec()
    } else {
        data.to_vec()
    };

    // 2. hash the data:
    // this is done as an optimization when intending to send plaintext data to sign
    crate::sha256(&data)
}

#[cfg(test)]
mod tests {
    use test_case::test_case;

    #[test_case("Flerp derp ", "4a3f849990240db0d9eb3079ba8e8d3c7dba99afefedbf2b5c88f4e8c47e733f"; "C0")]
    #[test_case(" flerp derp",  "4a3f849990240db0d9eb3079ba8e8d3c7dba99afefedbf2b5c88f4e8c47e733f"; "C1")]
    #[test_case(" FLERP dErp ","4a3f849990240db0d9eb3079ba8e8d3c7dba99afefedbf2b5c88f4e8c47e733f"; "C2")]
    #[test_case("FLErP derP", "4a3f849990240db0d9eb3079ba8e8d3c7dba99afefedbf2b5c88f4e8c47e733f"; "C3")]
    #[test_case("asdfsdf sdf23 sdf h", "48a72c4d3b93d038341cf85bad2a8cb3a1fda65c7954ad9ae01cb87a37fc3260"; "C4")]
    fn test_consistency(input: &str, output: &str) {
        let got = hex::encode(super::clean_and_hash_data_for_fingerprinting(input.as_bytes()));
        assert_eq!(got.as_str(), output)
    }
}
