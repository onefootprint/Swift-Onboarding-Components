use paperclip::actix::Apiv2Schema;
use strum_macros::EnumDiscriminants;

#[derive(
    serde::Serialize, serde::Deserialize, PartialEq, Eq, Hash, Debug, Clone, Apiv2Schema, EnumDiscriminants,
)]
#[strum_discriminants(name(UserAuthGuard))]
#[strum_discriminants(derive(
    Apiv2Schema,
    serde_with::SerializeDisplay,
    strum_macros::Display,
    Hash,
    macros::SerdeAttr
))]
#[strum_discriminants(vis(pub))]
#[strum_discriminants(strum(serialize_all = "snake_case"))]
#[strum_discriminants(serde(rename_all = "snake_case"))]
// TODO This serde(rename) attr isn't working at all. Very nefarious. These values are actually
// being serialized as CamelCase.
// UserAuthGuard, randomly, does have snake_case serialization if you need.
// We should migrate UserAuthScope to use snake_case, but that's a whole process
#[serde(rename = "snake_case")]
// WARNING: changing this could break existing user auth sessions
pub enum UserAuthScope {
    /// For adding new data in bifrost
    SignUp,
    /// For adding auth data
    Auth,
    // We don't currently issue a token with this - was for my1fp
    BasicProfile,
    SensitiveProfile,
    Handoff,
    /// Only for vaulting data
    VaultData,

    /// Granted when the auth token was generated using explicit (not implicit) auth
    ExplicitAuth,

    /// This scope should never be issued to a token - it is used to gate certain actions that
    /// should never be done by a user
    Never,
}
