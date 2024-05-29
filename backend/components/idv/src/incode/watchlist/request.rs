use newtypes::PiiString;

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WatchlistResultRequest {
    pub first_name: Option<PiiString>,
    pub sur_name: Option<PiiString>,
    // Float Year of birth, if known
    pub birth_year: Option<f32>,
    // Float Determines how closely the returned results must match the supplied name.
    pub fuzziness: Option<f32>,
    //Configuration fields we likely won't be using:
    //pub country_codes: Option<Vec<String>>, // List Results are filtered by the entity nationality or
    // country of residence. pub watchlist_types: Option<Vec<String>>, // List
    //pub subscribe: Option<bool>, // Boolean Subsribes to updates on the watchlists to receive notification
    // for updates on the search. pub search_profile: Option<String>, // String Search profile set for
    // the client to use specify what sources they will be searching against.
}
