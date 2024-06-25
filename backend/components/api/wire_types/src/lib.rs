use chrono::DateTime;
use chrono::Utc;
use paperclip::actix::Apiv2Response;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;

mod resources;
pub use resources::*;
pub mod hosted;
mod requests;
pub use self::requests::*;

mod patch;
pub use patch::*;

#[derive(Apiv2Response, macros::JsonResponder)]
pub struct Empty;

impl serde::Serialize for Empty {
    fn serialize<S>(&self, serializer: S) -> serde::__private::Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        // Explicity serialize an empty struct, even though Empty is a unit struct
        let state = serde::Serializer::serialize_struct(serializer, "Empty", false as usize)?;
        serde::ser::SerializeStruct::end(state)
    }
}


#[cfg(test)]
mod test {
    use super::Empty;

    #[test]
    fn test_serialize_empty() {
        let e = Empty;
        let e_str = serde_json::ser::to_string(&e).unwrap();
        assert_eq!(e_str, "{}");
    }
}
