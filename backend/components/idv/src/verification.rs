use crate::Error;
use newtypes::{Signal, Vendor};

pub fn get_signals(vendor: Vendor, response: serde_json::Value) -> Result<Vec<Signal>, Error> {
    let signals = match vendor {
        Vendor::Idology => crate::idology::verification::parse(response)?
            .into_iter()
            .map(|r| r.signal())
            .collect(),
        _ => return Err(Error::NotImplemented),
    };
    Ok(signals)
}
