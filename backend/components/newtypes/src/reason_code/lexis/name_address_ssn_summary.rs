use crate::lexis_name_address_ssn_enum;
use crate::reason_code::reason_code_helpers::*;
use strum_macros::{
    EnumIter,
    EnumString,
};

#[derive(derive_more::Deref)]
struct Ssn(bool);
#[derive(derive_more::Deref)]
pub(crate) struct FirstName(pub bool);
#[derive(derive_more::Deref)]
pub(crate) struct LastName(pub bool);
#[derive(derive_more::Deref)]
pub(crate) struct Address(pub bool);

lexis_name_address_ssn_enum! {
    #[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, EnumIter, Hash)]
    pub enum NameAddressSsnSummary {

        // Nothing found for input criteria
        #[ser = "0"]
        #[nas = LexisNAS::new(*Ssn(false), *FirstName(false), *LastName(false), *Address(false))]
        NothingFound,

        // Input SSN is associated with a different name and address
        #[ser = "1"]
        #[nas = LexisNAS::new(*Ssn(false), *FirstName(false), *LastName(false), *Address(false))]
        DifferentNameAddress,

        // Input First name and Last Name matched
        #[ser = "2"]
        #[nas = LexisNAS::new(*Ssn(false), *FirstName(true), *LastName(true), *Address(false))]
        FirstNameLastName,

        // Input First name and Address matched
        #[ser = "3"]
        #[nas = LexisNAS::new(*Ssn(false), *FirstName(true), *LastName(false), *Address(true))]
        FirstNameAddress,

        // Input First name and SSN matched
        #[ser = "4"]
        #[nas = LexisNAS::new(*Ssn(true), *FirstName(true), *LastName(false), *Address(false))]
        FirstNameSsn,

        // Input Last name and Address matched
        #[ser = "5"]
        #[nas = LexisNAS::new(*Ssn(false), *FirstName(false), *LastName(true), *Address(true))]
        LastNameAddress,

        // Input Address and SSN matched
        #[ser = "6"]
        #[nas = LexisNAS::new(*Ssn(true), *FirstName(false), *LastName(false), *Address(true))]
        AddressSsn,

        // Input Last name and SSN matched
        #[ser = "7"]
        #[nas = LexisNAS::new(*Ssn(true), *FirstName(false), *LastName(true), *Address(false))]
        LastNameSsn,

        // Input First name, Last name and Address matched
        #[ser = "8"]
        #[nas = LexisNAS::new(*Ssn(false), *FirstName(true), *LastName(true), *Address(true))]
        FirstNameLastNameAddress,

        // Input First name, Last name and SSN matched
        #[ser = "9"]
        #[nas = LexisNAS::new(*Ssn(true), *FirstName(true), *LastName(true), *Address(false))]
        FirstNameLastNameSsn,

        // Input First name, Address, and SSN matched
        #[ser = "10"]
        #[nas = LexisNAS::new(*Ssn(true), *FirstName(true), *LastName(false), *Address(true))]
        FirstNameAddressSsn,

        // Input Last name, Address, and SSN matched
        #[ser = "11"]
        #[nas = LexisNAS::new(*Ssn(true), *FirstName(false), *LastName(true), *Address(true))]
        LastNameAddressSsn,

        // Input First name, Last name, Address and SSN matched
        #[ser = "12"]
        #[nas = LexisNAS::new(*Ssn(true), *FirstName(true), *LastName(true), *Address(true))]
        FirstNameLastNameAddressSsn

    }
}
