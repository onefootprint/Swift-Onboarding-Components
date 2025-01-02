/// How to run:
///
/// Install deps:
///   brew install age age-plugin-yubikey
///
/// Generate a test key if you haven't already.
/// Use --touch-policy never to simplify testing.
///   age-plugin-yubikey --generate --name "Testing" --slot 20 --touch-policy never
///
/// Run the test and enter your YubiKey PIN at each prompt:
///   cargo test -p vault_dr test_yubikey_age_round_trip -- --include-ignored

#[cfg(test)]
mod tests {
    use crate::PublicKey;
    use rand::distributions::Alphanumeric;
    use rand::thread_rng;
    use rand::Rng;
    use std::env;
    use std::fs::File;
    use std::io::Write;
    use std::process::Command;
    use tempfile::tempdir;

    fn generate_random_bytes(length: usize) -> Vec<u8> {
        thread_rng().sample_iter(&Alphanumeric).take(length).collect()
    }

    #[test]
    #[ignore]
    fn test_yubikey_age_round_trip() {
        let slot = env::var("TEST_YUBIKEY_SLOT").unwrap_or("20".to_string());

        let list_output = Command::new("age-plugin-yubikey")
            .arg("--list")
            .arg("--slot")
            .arg(&slot)
            .output()
            .unwrap();
        println!("List output: {:?}", list_output);
        assert_eq!(list_output.status.code(), Some(0));

        let list_stdout = String::from_utf8(list_output.stdout).unwrap();
        let pubkey_str = list_stdout
            .split_whitespace()
            .find(|word| word.starts_with("age1yubikey"))
            .unwrap();

        let pubkey: PublicKey = pubkey_str.parse().unwrap();
        assert!(matches!(pubkey, PublicKey::YubiKeyRecipient { .. }));

        let recipient = pubkey.recipient();
        let plaintext = generate_random_bytes(1234);
        println!("Plaintext: {}", String::from_utf8(plaintext.clone()).unwrap());

        let other_recipient = age::x25519::Identity::generate().to_public();

        let encryptor =
            age::Encryptor::with_recipients(vec![recipient, &other_recipient].into_iter()).unwrap();
        let mut encrypted = vec![];
        let mut writer = encryptor.wrap_output(&mut encrypted).unwrap();
        writer.write_all(&plaintext).unwrap();
        writer.finish().unwrap();

        let identity_file_output = Command::new("age-plugin-yubikey")
            .arg("--identity")
            .arg("--slot")
            .arg(&slot)
            .output()
            .unwrap();
        println!("Identity file output: {:?}", identity_file_output);
        assert_eq!(identity_file_output.status.code(), Some(0));

        let dir = tempdir().unwrap();

        let identity_file_path = dir.path().join("identity");
        {
            let mut identity_file = File::create(&identity_file_path).unwrap();
            identity_file.write_all(&identity_file_output.stdout).unwrap();
        }

        let encrypted_file_path = dir.path().join("encrypted");
        {
            let mut encrypted_file = File::create(&encrypted_file_path).unwrap();
            encrypted_file.write_all(&encrypted).unwrap();
        }

        let decrypt_output = Command::new("age")
            .arg("--decrypt")
            .arg("--identity")
            .arg(&identity_file_path)
            .arg(&encrypted_file_path)
            .output()
            .unwrap();
        println!("Decrypt output: {:?}", decrypt_output);
        assert_eq!(decrypt_output.status.code(), Some(0));

        assert_eq!(decrypt_output.stdout, plaintext);

        // Corrupt the encrypted file and ensure that decryption fails.
        {
            let mut encrypted_file = File::create(&encrypted_file_path).unwrap();
            encrypted_file.write_all(&encrypted).unwrap();
            encrypted_file.write_all(&[0, 1, 2, 3, 4, 5]).unwrap();
        }
        let decrypt_output = Command::new("age")
            .arg("--decrypt")
            .arg("--identity")
            .arg(&identity_file_path)
            .arg(&encrypted_file_path)
            .output()
            .unwrap();
        println!("Decrypt output: {:?}", decrypt_output);
        assert_eq!(decrypt_output.status.code(), Some(1));

        // Corrupt the identity file and ensure that decryption fails.
        {
            let mut encrypted_file = File::create(&encrypted_file_path).unwrap();
            encrypted_file.write_all(&encrypted).unwrap();

            let mut identity_file = File::create(&identity_file_path).unwrap();
            write!(identity_file, "AGE-PLUGIN-YUBIKEY-1Y6RM6QY4PWHFH0G3NU4UJ").unwrap();
        }
        let decrypt_output = Command::new("age")
            .arg("--decrypt")
            .arg("--identity")
            .arg(&identity_file_path)
            .arg(&encrypted_file_path)
            .output()
            .unwrap();
        println!("Decrypt output: {:?}", decrypt_output);
        assert_eq!(decrypt_output.status.code(), Some(1));
    }
}
