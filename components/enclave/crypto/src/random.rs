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

#[cfg(test)]
mod tests {
    #[test]
    fn test_phone_code() {
        let code = super::gen_rand_n_digit_code(6);
        dbg!(&code);
        assert_eq!(code.len(), 6);
    }
}
