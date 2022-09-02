use crate::DataAttribute;

pub enum SignalKind {
    // Basically can ignore this information - it carries no weight
    NotImportant,
    // This piece of data could not be located for the matched identity
    NotFound,
    // Input data was invalid
    InvalidRequest,
    // Can ignore for the purpose of fraud, but is useful to know
    Info,
    TODO,
    // General indicator of some risk. Higher values are more risky
    Alert(u32),
    // General indicator of high likelihood of fraud. Higher values are more risky
    Fraud(u32),
}

pub enum SignalAttribute {
    General,
    DataAttribute(DataAttribute),
}

pub struct Signal {
    pub kind: SignalKind,
    // TODO one day use more representative SignalAttribute
    pub attributes: Vec<DataAttribute>,
}
