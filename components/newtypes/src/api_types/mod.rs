pub mod address;
pub mod dob;
pub mod email;
pub mod name;
pub mod phone_number;
pub mod ssn;

trait ToVaultString {
    fn to_vault_string(self) -> String;
}

