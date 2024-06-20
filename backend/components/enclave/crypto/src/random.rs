use rand::distributions::Alphanumeric;
use rand::distributions::Uniform;
use rand::prelude::*;

const NUMBERS: [char; 10] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/// Generate a numeric code
pub fn gen_rand_n_digit_code(length: usize) -> String {
    let mut rng = rand::thread_rng();
    let iter = std::iter::repeat(());

    let dist = Uniform::from(0..NUMBERS.len());
    iter.map(|()| rng.sample(dist))
        .map(|v| NUMBERS[v])
        .take(length)
        .collect()
}

pub fn gen_random_alphanumeric_code(length: usize) -> String {
    thread_rng()
        .sample_iter(&Alphanumeric)
        .take(length)
        .map(char::from)
        .collect()
}

pub fn gen_bytes<const N: usize>() -> [u8; N] {
    let mut rng = rand::thread_rng();
    let mut bytes = [0u8; N];
    rng.fill_bytes(&mut bytes);
    bytes
}

pub fn gen_rand_bytes(length: usize) -> Vec<u8> {
    let mut rng = rand::thread_rng();
    let mut bytes = vec![0; length];
    rng.fill_bytes(&mut bytes);
    bytes
}

/// Generate a random symmetric key
pub fn random_cookie_session_key_bytes() -> Vec<u8> {
    let mut rng = rand::thread_rng();
    let mut bytes = vec![0u8; 64];
    rng.fill_bytes(&mut bytes);
    bytes
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_phone_code() {
        let code = super::gen_rand_n_digit_code(6);
        dbg!(&code);
        assert_eq!(code.len(), 6);
    }
}
