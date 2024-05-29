use crate::{
    lexis_name_address_phone_enum,
    Address,
    FirstName,
    LastName,
    LexisNAP,
};
use strum_macros::{
    EnumIter,
    EnumString,
};

#[derive(derive_more::Deref)]
struct Phone(bool);

lexis_name_address_phone_enum! {
    #[derive(Debug, strum::Display, Clone, Eq, PartialEq, serde::Deserialize, EnumString, EnumIter, Hash)]
    pub enum NameAddressPhoneSummary {
        /*
        We’ll effectively be mapping 4,6,7,9,10,11,12 to Exact and everything else to NoMatch
         */


        // Nothing found for input criteria
        #[ser = "0"]
        #[nap = LexisNAP::new(*Phone(false), *FirstName(false), *LastName(false), *Address(false))]
        NothingFound,

        // Input Phone is associated with a different name and address
        #[ser = "1"]
        #[nap = LexisNAP::new(*Phone(false), *FirstName(false), *LastName(false), *Address(false))]
        DifferentNameAddress,

        // First name and Last name matched
        #[ser = "2"]
        #[nap = LexisNAP::new(*Phone(false), *FirstName(true), *LastName(true), *Address(false))]
        FirstNameLastName,

        // First name and Address matched
        #[ser = "3"]
        #[nap = LexisNAP::new(*Phone(false), *FirstName(true), *LastName(false), *Address(true))]
        FirstNameAddress,

        // First name and Phone matched
        #[ser = "4"]
        #[nap = LexisNAP::new(*Phone(true), *FirstName(true), *LastName(false), *Address(false))]
        FirstNamePhone,

        // Last name and Address matched
        #[ser = "5"]
        #[nap = LexisNAP::new(*Phone(false), *FirstName(false), *LastName(true), *Address(true))]
        LastNameAddress,

        // Address and Phone matched
        #[ser = "6"]
        #[nap = LexisNAP::new(*Phone(true), *FirstName(false), *LastName(false), *Address(true))]
        AddressPhone,

        // Last name and Phone matched
        #[ser = "7"]
        #[nap = LexisNAP::new(*Phone(true), *FirstName(false), *LastName(true), *Address(false))]
        LastNamePhone,

        // First name, Last name, and Address matched
        #[ser = "8"]
        #[nap = LexisNAP::new(*Phone(false), *FirstName(true), *LastName(true), *Address(true))]
        FirstNameLastNameAddress,

        // First name, Last name, and Phone matched
        #[ser = "9"]
        #[nap = LexisNAP::new(*Phone(true), *FirstName(true), *LastName(true), *Address(false))]
        FirstNameLastNamePhone,

        // First name, Address, and Phone matched
        #[ser = "10"]
        #[nap = LexisNAP::new(*Phone(true), *FirstName(true), *LastName(false), *Address(true))]
        FirstNameAddressPhone,

        // Last name, Address, and Phone matched
        #[ser = "11"]
        #[nap = LexisNAP::new(*Phone(true), *FirstName(false), *LastName(true), *Address(true))]
        LastNameAddressPhone,

        // First name, Last name, Address, and Phone matched
        #[ser = "12"]
        #[nap = LexisNAP::new(*Phone(true), *FirstName(true), *LastName(true), *Address(true))]
        FirstNameLastNameAddressPhone

    }
}
