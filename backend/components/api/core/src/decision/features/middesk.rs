#![allow(clippy::enum_variant_names)]
use idv::middesk::response::business::BusinessResponse;
use idv::middesk::response::business::Task;
use itertools::Itertools;
use newtypes::FootprintReasonCode;
use std::str::FromStr;
use strum::Display;
use strum_macros::EnumDiscriminants;
use strum_macros::EnumString;

macro_rules! task_enum {
    (
        $(#[$macros:meta])*
        pub enum $name:ident {
            $(
                #[footprint_reason_code = $footprint_reason_code:expr]
                $(#[$vmacros:meta])*
                $item:ident
            ),*
            $(,)?
        }
    ) => {
        $(#[$macros])*
        pub enum $name {
            $($(#[$vmacros])* $item,)*
        }

        impl From<&$name> for Option<FootprintReasonCode> {
            fn from(vendor_reason_code: &$name) -> Self {
                match vendor_reason_code {
                    $($name::$item => $footprint_reason_code),*
                }
            }
        }

    }
}

#[derive(EnumDiscriminants, Display, Debug, Eq, PartialEq, Clone)]
#[strum_discriminants(
    name(TaskKindDiscriminant),
    vis(pub),
    derive(EnumString),
    strum(serialize_all = "snake_case")
)]
#[strum(serialize_all = "snake_case")]
pub enum TaskKind {
    Name(NameTask),
    DbaName(DbaNameTask),
    Phone(PhoneTask),
    WebsiteStatus(WebsiteStatusTask),
    WebsiteVerification(WebsiteVerificationTask),
    AddressVerification(AddressVerificationTask),
    AddressPropertyType(AddressPropertyTypeTask),
    AddressDeliverability(AddressDeliverabilityTask),
    Tin(TinTask),
    PersonVerification(PersonVerificationTask),
    Watchlist(WatchlistTask),
    SosActive(SosActiveTask),
    SosUnknown(SosUnknownTask),
    SosInactive(SosInactiveTask),
    SosNotFound(SosNotFoundTask),
    SosDomestic(SosDomesticTask),
    SosMatch(SosMatchTask),
    SosDomesticSubStatus(SosDomesticSubStatusTask),
    Industry(IndustryTask), /* premium feature we don't have turned on but still get response for some
                             * reason */
    Bankruptcies(BankruptciesTask), /* premium feature we don't have turned on but still get response for
                                     * some reason */
    AddressCMRA(AddressCMRATask),
}

task_enum! {
    #[derive(Display, Debug, EnumString, Eq, PartialEq, Clone)]
    pub enum NameTask {
        #[footprint_reason_code = Some(FootprintReasonCode::BusinessNameMatch)]
        #[strum(serialize = "Verified")]
        Verified,

        #[footprint_reason_code = Some(FootprintReasonCode::BusinessNameSimilarMatch)]
        #[strum(serialize = "Similar Match")]
        SimilarMatch,

        #[footprint_reason_code = Some(FootprintReasonCode::BusinessNameAlternateMatch)]
        #[strum(serialize = "Alternate Name")]
        AlternateName,

        #[footprint_reason_code = Some(FootprintReasonCode::BusinessNameDoesNotMatch)]
        #[strum(serialize = "Unverified")]
        Unverified,
    }
}

task_enum! {
    #[derive(Display, Debug, EnumString, Eq, PartialEq, Clone)]
    pub enum DbaNameTask {
        #[footprint_reason_code = Some(FootprintReasonCode::BusinessDbaMatch)]
        #[strum(serialize = "Verified")]
        Verified,

        #[footprint_reason_code = Some(FootprintReasonCode::BusinessDbaSimilarMatch)]
        #[strum(serialize = "Similar Match")]
        SimilarMatch,

        #[footprint_reason_code = Some(FootprintReasonCode::BusinessDbaAlternateMatch)]
        #[strum(serialize = "Alternate Name")]
        AlternateName,

        #[footprint_reason_code = Some(FootprintReasonCode::BusinessDbaDoesNotMatch)]
        #[strum(serialize = "Unverified")]
        Unverified,
    }
}

task_enum! {
    #[derive(Display, Debug, EnumString, Eq, PartialEq, Clone)]
    pub enum PhoneTask {
        #[footprint_reason_code = Some(FootprintReasonCode::BusinessPhoneNumberMatch)]
        #[strum(serialize = "Verified")]
        Verified,

        #[footprint_reason_code = Some(FootprintReasonCode::BusinessPhoneNumberDoesNotMatch)]
        #[strum(serialize = "Unverified")]
        Unverified,
    }
}

task_enum! {
    #[derive(Display, Debug, EnumString, Eq, PartialEq, Clone)]
    pub enum WebsiteStatusTask {
        #[footprint_reason_code = Some(FootprintReasonCode::BusinessWebsiteOnline)]
        #[strum(serialize = "Online")]
        Online,

        #[footprint_reason_code = Some(FootprintReasonCode::BusinessWebsiteOffline)]
        #[strum(serialize = "Offline")]
        Offline,
    }
}

task_enum! {
    #[derive(Display, Debug, EnumString, Eq, PartialEq, Clone)]
    pub enum WebsiteVerificationTask {
        #[footprint_reason_code = Some(FootprintReasonCode::BusinessWebsiteVerified)]
        #[strum(serialize = "Verified")]
        Verified,

        #[footprint_reason_code = Some(FootprintReasonCode::BusinessWebsiteUnverified)]
        #[strum(serialize = "Unverified")]
        Unverified,

        #[footprint_reason_code = Some(FootprintReasonCode::BusinessWebsiteParkingPage)]
        #[strum(serialize = "Parking Page")]
        ParkingPage,
    }
}

task_enum! {
    #[derive(Display, Debug, EnumString, Eq, PartialEq, Clone)]
    pub enum AddressVerificationTask {
        #[footprint_reason_code = Some(FootprintReasonCode::BusinessAddressMatch)]
        #[strum(serialize = "Verified")]
        Verified,

        #[footprint_reason_code = Some(FootprintReasonCode::BusinessAddressCloseMatch)]
        #[strum(serialize = "Approximate Match")]
        ApproximateMatch,

        #[footprint_reason_code = Some(FootprintReasonCode::BusinessAddressSimilarMatch)]
        #[strum(serialize = "Similar Match")]
        SimilarMatch,

        #[footprint_reason_code = Some(FootprintReasonCode::BusinessAddressIncompleteMatch)]
        #[strum(serialize = "Incomplete Match")]
        IncompleteMatch,

        #[footprint_reason_code = Some(FootprintReasonCode::BusinessAddressDoesNotMatch)]
        #[strum(serialize = "Unverified")]
        Unverified,
    }
}

task_enum! {
    #[derive(Display, Debug, EnumString, Eq, PartialEq, Clone)]
    pub enum AddressPropertyTypeTask {
        #[footprint_reason_code = Some(FootprintReasonCode::BusinessAddressCommercial)]
        #[strum(serialize = "Commercial")]
        Commercial,

        #[footprint_reason_code = Some(FootprintReasonCode::BusinessAddressResidential)]
        #[strum(serialize = "Residential")]
        Residential,
    }
}

task_enum! {
    #[derive(Display, Debug, EnumString, Eq, PartialEq, Clone)]
    pub enum AddressDeliverabilityTask {
        #[footprint_reason_code = Some(FootprintReasonCode::BusinessAddressDeliverable)]
        #[strum(serialize = "Deliverable")]
        Deliverable,

        #[footprint_reason_code = Some(FootprintReasonCode::BusinessAddressNotDeliverable)]
        #[strum(serialize = "Undeliverable")]
        Undeliverable,
    }
}

task_enum! {
    #[derive(Display, Debug, EnumString, Eq, PartialEq, Clone)]
    pub enum TinTask {
        #[footprint_reason_code = Some(FootprintReasonCode::TinMatch)]
        #[strum(serialize = "Found")]
        Found,

        #[footprint_reason_code = Some(FootprintReasonCode::TinNotFound)]
        #[strum(serialize = "Not Found")]
        NotFound,

        #[footprint_reason_code = Some(FootprintReasonCode::TinInvalid)]
        #[strum(serialize = "Error")]
        Error,

        #[footprint_reason_code = Some(FootprintReasonCode::TinDoesNotMatch)]
        #[strum(serialize = "Mismatch")]
        Mismatch,
    }
}

task_enum! {
    #[derive(Display, Debug, EnumString, Eq, PartialEq, Clone)]
    pub enum PersonVerificationTask {
        #[footprint_reason_code = Some(FootprintReasonCode::BeneficialOwnersMatch)]
        #[strum(serialize = "Verified")]
        Verified,

        #[footprint_reason_code = Some(FootprintReasonCode::BeneficialOwnersPartialMatch)]
        #[strum(serialize = "Partial Match")]
        PartialMatch,

        #[footprint_reason_code = Some(FootprintReasonCode::BeneficialOwnersDoNotMatch)]
        #[strum(serialize = "Unverified")]
        Unverified
    }
}

task_enum! {
    #[derive(Display, Debug, EnumString, Eq, PartialEq, Clone)]
    pub enum WatchlistTask {
        #[footprint_reason_code = Some(FootprintReasonCode::BusinessNameNoWatchlistHits)]
        #[strum(serialize = "No Hits")]
        NoHits,

        #[footprint_reason_code = Some(FootprintReasonCode::BusinessNameWatchlistHit)]
        #[strum(serialize = "Hits")]
        Hits,
    }
}

task_enum! {
    #[derive(Display, Debug, EnumString, Eq, PartialEq, Clone)]
    pub enum SosActiveTask {
        #[footprint_reason_code = Some(FootprintReasonCode::SosActiveFilingFound)]
        #[strum(serialize = "Active")]
        Active,
    }
}

task_enum! {
    #[derive(Display, Debug, EnumString, Eq, PartialEq, Clone)]
    pub enum SosUnknownTask {
        #[footprint_reason_code = Some(FootprintReasonCode::SosFilingNoStatus)]
        #[strum(serialize = "Partially Unknown")]
        PartiallyUnknown,
    }
}

task_enum! {
    #[derive(Display, Debug, EnumString, Eq, PartialEq, Clone)]
    pub enum SosInactiveTask {
        #[footprint_reason_code = Some(FootprintReasonCode::SosFilingPartiallyActive)]
        #[strum(serialize = "Partially Active")]
        PartiallyActive,

        #[footprint_reason_code = Some(FootprintReasonCode::SosFilingPartiallyActive)]
        #[strum(serialize = "Partially Inactive")]
        PartiallyInactive,

        #[footprint_reason_code = Some(FootprintReasonCode::SosFilingNoActiveFound)]
        #[strum(serialize = "Inactive")]
        Inactive,
    }
}

task_enum! {
    #[derive(Display, Debug, EnumString, Eq, PartialEq, Clone)]
    pub enum SosNotFoundTask {
        #[footprint_reason_code = Some(FootprintReasonCode::SosFilingNotFound)]
        #[strum(serialize = "Not Registered")]
        NotRegistered,
    }
}

task_enum! {
    #[derive(Display, Debug, EnumString, Eq, PartialEq, Clone)]
    pub enum SosDomesticTask {
        #[footprint_reason_code = Some(FootprintReasonCode::SosDomesticActiveFilingFound)]
        #[strum(serialize = "Domestic Active")]
        DomesticActive,

        #[footprint_reason_code = Some(FootprintReasonCode::SosDomesticFilingNoStatus)]
        #[strum(serialize = "Domestic Unknown")]
        DomesticUnknown,

        #[footprint_reason_code = Some(FootprintReasonCode::SosDomesticFilingPartiallyActive)]
        #[strum(serialize = "Domestic Inactive")]
        DomesticInactive,

        #[footprint_reason_code = Some(FootprintReasonCode::SosDomesticFilingNotFound)]
        #[strum(serialize = "Domestic Missing")]
        DomesticMissing,
    }
}

task_enum! {
    #[derive(Display, Debug, EnumString, Eq, PartialEq, Clone)]
    pub enum SosMatchTask {
        #[footprint_reason_code = Some(FootprintReasonCode::SosBusinessAddressActiveFilingFound)]
        #[strum(serialize = "Submitted Active")]
        SubmittedActive,

        #[footprint_reason_code = Some(FootprintReasonCode::SosBusinessAddressFilingStatusNotAvailable)]
        #[strum(serialize = "Submitted Unknown")]
        SubmittedUnknown,

        #[footprint_reason_code = Some(FootprintReasonCode::SosBusinessAddressInactiveFilingFound)]
        #[strum(serialize = "Submitted Inactive")]
        SubmittedInactive,

        #[footprint_reason_code = Some(FootprintReasonCode::SosBusinessAddressFilingNotFound)]
        #[strum(serialize = "Submitted Not Registered")]
        SubmittedNotRegistered,
    }
}

task_enum! {
    #[derive(Display, Debug, EnumString, Eq, PartialEq, Clone)]
    pub enum SosDomesticSubStatusTask {
        #[footprint_reason_code = Some(FootprintReasonCode::SosDomesticFilingStatusGoodStanding)]
        #[strum(serialize = "Good Standing")]
        GoodStanding,

        #[footprint_reason_code = Some(FootprintReasonCode::SosDomesticFilingStatusPendingActive)]
        #[strum(serialize = "Pending Active")]
        PendingActive,

        #[footprint_reason_code = Some(FootprintReasonCode::SosDomesticFilingStatusPendingInactive)]
        #[strum(serialize = "Pending Inactive")]
        PendingInactive,

        #[footprint_reason_code = Some(FootprintReasonCode::SosDomesticFilingStatusNotProvidedByState)]
        #[strum(serialize = "Not Provided by State")]
        NotProvidedByState,

        #[footprint_reason_code = Some(FootprintReasonCode::SosDomesticFilingStatusNotInGoodStanding)]
        #[strum(serialize = "Not in Good Standing")]
        NotInGoodStanding,

        #[footprint_reason_code = Some(FootprintReasonCode::SosDomesticFilingStatusDissolved)]
        #[strum(serialize = "Dissolved")]
        Dissolved,
    }
}

task_enum! {
    #[derive(Display, Debug, EnumString, Eq, PartialEq, Clone)]
    pub enum IndustryTask {
        #[footprint_reason_code = None]
        #[strum(serialize = "No Hits")]
        NoHits,

        #[footprint_reason_code = None]
        #[strum(serialize = "Hits")]
        Hits,
    }
}

task_enum! {
    #[derive(Display, Debug, EnumString, Eq, PartialEq, Clone)]
    pub enum BankruptciesTask {
        //Cant find this in docs and "None Found" is the only response i've seen
        #[footprint_reason_code = None]
        #[strum(serialize = "None Found")]
        NoneFound,
    }
}

task_enum! {
    #[derive(Display, Debug, EnumString, Eq, PartialEq, Clone)]
    pub enum AddressCMRATask {
        #[footprint_reason_code = Some(FootprintReasonCode::BusinessAddressCommercialMailReceivingAgency)]
        #[strum(serialize = "CMRA")]
        CMRA,
    }
}

impl TryFrom<Task> for TaskKind {
    type Error = Error;

    fn try_from(value: Task) -> Result<Self, Self::Error> {
        let key = value.key.ok_or(Error::MissingField("key".to_owned()))?;
        let sub_label = value
            .sub_label
            .ok_or(Error::MissingField("sub_label".to_owned()))?;

        let e = Error::UnrecognizedTask(key.clone(), sub_label.clone());

        let task_kind = match TaskKindDiscriminant::from_str(&key).map_err(|_| e.clone())? {
            TaskKindDiscriminant::Name => TaskKind::Name(NameTask::from_str(&sub_label).map_err(|_| e)?),
            TaskKindDiscriminant::DbaName => {
                TaskKind::DbaName(DbaNameTask::from_str(&sub_label).map_err(|_| e)?)
            }
            TaskKindDiscriminant::Phone => TaskKind::Phone(PhoneTask::from_str(&sub_label).map_err(|_| e)?),
            TaskKindDiscriminant::WebsiteStatus => {
                TaskKind::WebsiteStatus(WebsiteStatusTask::from_str(&sub_label).map_err(|_| e)?)
            }
            TaskKindDiscriminant::WebsiteVerification => {
                TaskKind::WebsiteVerification(WebsiteVerificationTask::from_str(&sub_label).map_err(|_| e)?)
            }
            TaskKindDiscriminant::AddressVerification => {
                TaskKind::AddressVerification(AddressVerificationTask::from_str(&sub_label).map_err(|_| e)?)
            }
            TaskKindDiscriminant::AddressPropertyType => {
                TaskKind::AddressPropertyType(AddressPropertyTypeTask::from_str(&sub_label).map_err(|_| e)?)
            }
            TaskKindDiscriminant::AddressDeliverability => TaskKind::AddressDeliverability(
                AddressDeliverabilityTask::from_str(&sub_label).map_err(|_| e)?,
            ),
            TaskKindDiscriminant::Tin => TaskKind::Tin(TinTask::from_str(&sub_label).map_err(|_| e)?),
            TaskKindDiscriminant::PersonVerification => {
                TaskKind::PersonVerification(PersonVerificationTask::from_str(&sub_label).map_err(|_| e)?)
            }
            TaskKindDiscriminant::Watchlist => {
                TaskKind::Watchlist(WatchlistTask::from_str(&sub_label).map_err(|_| e)?)
            }
            TaskKindDiscriminant::SosActive => {
                TaskKind::SosActive(SosActiveTask::from_str(&sub_label).map_err(|_| e)?)
            }
            TaskKindDiscriminant::SosUnknown => {
                TaskKind::SosUnknown(SosUnknownTask::from_str(&sub_label).map_err(|_| e)?)
            }
            TaskKindDiscriminant::SosInactive => {
                TaskKind::SosInactive(SosInactiveTask::from_str(&sub_label).map_err(|_| e)?)
            }
            TaskKindDiscriminant::SosNotFound => {
                TaskKind::SosNotFound(SosNotFoundTask::from_str(&sub_label).map_err(|_| e)?)
            }
            TaskKindDiscriminant::SosDomestic => {
                TaskKind::SosDomestic(SosDomesticTask::from_str(&sub_label).map_err(|_| e)?)
            }
            TaskKindDiscriminant::SosMatch => {
                TaskKind::SosMatch(SosMatchTask::from_str(&sub_label).map_err(|_| e)?)
            }
            TaskKindDiscriminant::SosDomesticSubStatus => {
                TaskKind::SosDomesticSubStatus(SosDomesticSubStatusTask::from_str(&sub_label).map_err(|_| e)?)
            }
            TaskKindDiscriminant::Industry => {
                TaskKind::Industry(IndustryTask::from_str(&sub_label).map_err(|_| e)?)
            }
            TaskKindDiscriminant::Bankruptcies => {
                TaskKind::Bankruptcies(BankruptciesTask::from_str(&sub_label).map_err(|_| e)?)
            }
            TaskKindDiscriminant::AddressCMRA => {
                TaskKind::AddressCMRA(AddressCMRATask::from_str(&sub_label).map_err(|_| e)?)
            }
        };

        Ok(task_kind)
    }
}

impl From<TaskKind> for Option<FootprintReasonCode> {
    fn from(value: TaskKind) -> Self {
        match value {
            TaskKind::Name(v) => Into::<Option<FootprintReasonCode>>::into(&v),
            TaskKind::DbaName(v) => Into::<Option<FootprintReasonCode>>::into(&v),
            TaskKind::Phone(v) => Into::<Option<FootprintReasonCode>>::into(&v),
            TaskKind::WebsiteStatus(v) => Into::<Option<FootprintReasonCode>>::into(&v),
            TaskKind::WebsiteVerification(v) => Into::<Option<FootprintReasonCode>>::into(&v),
            TaskKind::AddressVerification(v) => Into::<Option<FootprintReasonCode>>::into(&v),
            TaskKind::AddressPropertyType(v) => Into::<Option<FootprintReasonCode>>::into(&v),
            TaskKind::AddressDeliverability(v) => Into::<Option<FootprintReasonCode>>::into(&v),
            TaskKind::Tin(v) => Into::<Option<FootprintReasonCode>>::into(&v),
            TaskKind::PersonVerification(v) => Into::<Option<FootprintReasonCode>>::into(&v),
            TaskKind::Watchlist(v) => Into::<Option<FootprintReasonCode>>::into(&v),
            TaskKind::SosActive(v) => Into::<Option<FootprintReasonCode>>::into(&v),
            TaskKind::SosUnknown(v) => Into::<Option<FootprintReasonCode>>::into(&v),
            TaskKind::SosInactive(v) => Into::<Option<FootprintReasonCode>>::into(&v),
            TaskKind::SosNotFound(v) => Into::<Option<FootprintReasonCode>>::into(&v),
            TaskKind::SosDomestic(v) => Into::<Option<FootprintReasonCode>>::into(&v),
            TaskKind::SosMatch(v) => Into::<Option<FootprintReasonCode>>::into(&v),
            TaskKind::SosDomesticSubStatus(v) => Into::<Option<FootprintReasonCode>>::into(&v),
            TaskKind::Industry(v) => Into::<Option<FootprintReasonCode>>::into(&v),
            TaskKind::Bankruptcies(v) => Into::<Option<FootprintReasonCode>>::into(&v),
            TaskKind::AddressCMRA(v) => Into::<Option<FootprintReasonCode>>::into(&v),
        }
    }
}

#[derive(Debug, thiserror::Error, PartialEq, Eq, Clone)]
pub enum Error {
    #[error("Unrecognized Task: key={0}, sub_label={1}")]
    UnrecognizedTask(String, String),
    #[error("Expected Task field missing: {0}")]
    MissingField(String),
}

pub fn reason_codes(business_response: &BusinessResponse) -> Vec<FootprintReasonCode> {
    business_response
        .review
        .as_ref()
        .and_then(|r| r.tasks.as_ref())
        .map(|ts| {
            ts.iter()
                .filter_map(|t| {
                    let task_kind = TaskKind::try_from(t.clone());
                    match task_kind {
                        Ok(tk) => Into::<Option<FootprintReasonCode>>::into(tk),
                        Err(err) => {
                            tracing::error!(?err, "Error parsing Middesk TaskKind");
                            None
                        }
                    }
                })
                .collect::<Vec<FootprintReasonCode>>()
        })
        .unwrap_or_default()
}

// TODO: test
pub fn get_task(
    business_response: &BusinessResponse,
    kind: TaskKindDiscriminant,
) -> Option<(Task, TaskKind)> {
    business_response
        .review
        .as_ref()
        .and_then(|r| r.tasks.as_ref())
        .and_then(|ts| {
            ts.iter()
                .filter_map(|t| {
                    let task_kind = TaskKind::try_from(t.clone()).ok();
                    let discr: Option<TaskKindDiscriminant> = task_kind.clone().map(|t| t.into());
                    let (d, tk) = discr.zip(task_kind)?;
                    (kind == d).then_some((t.clone(), tk))
                })
                .collect_vec()
                .first()
                .cloned()
        })
}

#[cfg(test)]
mod tests {
    use super::*;
    use idv::middesk::response::business::BusinessResponse;
    use serde_json::json;
    use test_case::test_case;

    #[test_case(json!({"key": "address_verification", "sub_label": "Verified"}) => Ok(TaskKind::AddressVerification(AddressVerificationTask::Verified)))]
    #[test_case(json!({"key": "address_cmra", "sub_label": "CMRA"}) => Ok(TaskKind::AddressCMRA(AddressCMRATask::CMRA)))]
    #[test_case(json!({"key": "name","sub_label": "Alternate Name",}) => Ok(TaskKind::Name(NameTask::AlternateName)))]
    #[test_case(json!({"key": "flerp","sub_label": "derp",}) => Err(Error::UnrecognizedTask("flerp".to_owned(), "derp".to_owned())))]
    fn test_from_task(v: serde_json::Value) -> Result<TaskKind, Error> {
        let t: Task = serde_json::from_value(v).unwrap();
        TaskKind::try_from(t)
    }

    #[test]
    fn test_from_example_tasks() {
        let br: BusinessResponse =
            serde_json::from_value(idv::test_fixtures::middesk_business_response()).unwrap();
        let tasks = br.review.unwrap().tasks.unwrap();
        let _task_kinds: Vec<TaskKind> = tasks
            .into_iter()
            .map(|t| TaskKind::try_from(t).unwrap())
            .collect();
    }

    #[test_case(TaskKind::AddressVerification(AddressVerificationTask::Verified) => Some(FootprintReasonCode::BusinessAddressMatch))]
    #[test_case(TaskKind::AddressVerification(AddressVerificationTask::Unverified) => Some(FootprintReasonCode::BusinessAddressDoesNotMatch))]
    fn test_into_footprint_reason_code(tk: TaskKind) -> Option<FootprintReasonCode> {
        tk.into()
    }
}
