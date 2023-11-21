use crate::errors::ApiResult;
use crate::State;
use db::scoped_vault::AndFingerprintQuery;
use db::scoped_vault::SearchQuery;
use itertools::Itertools;
use newtypes::fingerprinter::FingerprintScope;
use newtypes::fingerprinter::GlobalFingerprintKind;
use newtypes::DataIdentifier;
use newtypes::FpId;
use newtypes::PhoneNumber;
use newtypes::PiiString;
use newtypes::TenantId;
use newtypes::{BusinessDataKind as BDK, Fingerprinter, IdentityDataKind as IDK};

/// Given a search string and fp_id, parse into the list of FingerprintQueries and fp_id by which to query
/// for ScopedVaults
pub async fn parse_search(
    state: &State,
    search: Option<PiiString>,
    tenant_id: &TenantId,
) -> ApiResult<(Option<SearchQuery>, Option<FpId>)> {
    use DataIdentifier::Business;
    use DataIdentifier::Id;
    let Some(search) = search else {
        return Ok((None, None));
    };

    // A bit of a hack: if the user types query that looks like an fp_id, try to look up by identifier instead
    if search.leak().starts_with("fp_id_") || search.leak().starts_with("fp_bid_") {
        let fp_id = Some(FpId::from(search.leak_to_string()));
        return Ok((None, fp_id));
    }

    let search_str = search.clean_for_fingerprint();
    // See if the search string is a phone number and format it properly for fingerprinting
    let mut data = vec![];

    // Fingerprints for phone number
    let dis = vec![Id(IDK::PhoneNumber), Business(BDK::PhoneNumber)];
    let formatted_phone_numbers = vec![
        PiiString::new(format!("+1{}", search_str.leak())),
        PiiString::new(format!("+{}", search_str.leak())),
        search_str.clone(),
    ]
    .into_iter()
    .filter_map(|p| PhoneNumber::parse(p).ok().map(|p| p.e164()))
    .collect_vec();
    for phone in formatted_phone_numbers.iter() {
        for d in all_scopes(phone, &dis, tenant_id) {
            data.push(vec![d]);
        }
    }

    // Fingerprints for name queries. Since our name fields are split across multiple DIs, do some
    // complex logic to generate all the possible search queries
    let name_permutations = name_permutations(&search);
    let fn_di = &Id(IDK::FirstName);
    let ln_di = &Id(IDK::LastName);
    for (first_name, last_name) in name_permutations.iter() {
        // If this permutation includes both a first name and last name, a matching result must
        // match on both the first name and the last name
        let name_fingerprints = vec![
            first_name
                .as_ref()
                .map(|p| (FingerprintScope::Tenant(fn_di, tenant_id), p)),
            last_name
                .as_ref()
                .map(|p| (FingerprintScope::Tenant(ln_di, tenant_id), p)),
        ]
        .into_iter()
        .flatten()
        .collect_vec();
        data.push(name_fingerprints)
    }

    // Fingerprint for website
    let dis = vec![Business(BDK::Website)];
    let websites = vec![
        PiiString::from(format!("https://{}", search_str.leak())),
        search_str.clone(),
    ];
    if !search_str.leak().contains(' ') && search_str.leak().contains('.') {
        for w in websites.iter() {
            for d in all_scopes(w, &dis, tenant_id) {
                data.push(vec![d]);
            }
        }
    }

    // Fingerprints for any other searchable field
    let dis = DataIdentifier::searchable()
        .into_iter()
        .filter(|di| {
            // Filter out the DIs that already have special handling above
            !matches!(
                di,
                Id(IDK::FirstName)
                    | Id(IDK::MiddleName)
                    | Id(IDK::LastName)
                    | Id(IDK::PhoneNumber)
                    | Business(BDK::PhoneNumber)
                    | Business(BDK::Website)
            )
        })
        .collect_vec();
    for d in all_scopes(&search_str, &dis, tenant_id) {
        data.push(vec![d]);
    }

    // The data we're going to fingerprint is grouped into vecs that represent an AND search condition.
    // Flatten this 2d array into a 1d-array, but keep track of the initial index so we can group
    // the fingerprints back into their 2d-array format.
    let data = data
        .into_iter()
        .enumerate()
        .flat_map(|(i, d)| d.into_iter().map(move |(scope, data)| (i, scope, data)))
        .collect_vec();
    let fingerprint_queries = state
        .compute_fingerprints(data)
        .await?
        .into_iter()
        .into_group_map()
        .into_values()
        .map(AndFingerprintQuery)
        .collect_vec();

    let search = SearchQuery {
        search: search_str,
        fingerprint_queries,
    };
    Ok((Some(search), None))
}

type FingerprintableData<'a> = (FingerprintScope<'a>, &'a PiiString);

/// Computes the data to be sent to the enclave to fingerprint for the provided search string and DIs.
/// Will generate data for both tenant-scoped and global-scoped fingerprints for the provided DIs.
fn all_scopes<'a>(
    search: &'a PiiString,
    dis: &'a [DataIdentifier],
    tenant_id: &'a TenantId,
) -> Vec<FingerprintableData<'a>> {
    let tenant_scopes = dis.iter().map(|di| FingerprintScope::Tenant(di, tenant_id));
    let global_scopes = dis
        .iter()
        .filter_map(|di| GlobalFingerprintKind::try_from(di).ok())
        .map(FingerprintScope::Global);
    let all_scopes = tenant_scopes.chain(global_scopes).collect_vec();
    all_scopes.into_iter().map(|s| (s, search)).collect_vec()
}

/// Given a search string that may contain multiple names separated by a string, returns all the
/// possible permutations to split the search string into (first_name, last_name) queries
/// TODO one day we should support middle name searching like this too
fn name_permutations(search: &PiiString) -> Vec<(Option<PiiString>, Option<PiiString>)> {
    let all_names = search
        .clone()
        .leak()
        .split(' ')
        .map(PiiString::from)
        .collect_vec();

    (0..(all_names.len() + 1))
        .map(|i| {
            // Split the list of all names into some that represent first name and some that
            // represent last name
            let calc_name = |n: &[PiiString]| -> Option<PiiString> {
                (!n.is_empty()).then_some(PiiString::from(n.iter().map(|i| i.leak()).join(" ")))
            };
            let first_name = calc_name(&all_names[0..i]);
            let last_name = calc_name(&all_names[i..all_names.len()]);
            (first_name, last_name)
        })
        .collect_vec()
}

#[cfg(test)]
mod test {
    use super::name_permutations;
    use newtypes::PiiString;
    use test_case::test_case;

    #[test_case("hayes", vec![(None, Some("hayes")), (Some("hayes"), None)])]
    #[test_case("hayes valley", vec![(None, Some("hayes valley")), (Some("hayes"), Some("valley")), (Some("hayes valley"), None)])]
    #[test_case("hAyes mErp vAlley", vec![(None, Some("hAyes mErp vAlley")), (Some("hAyes"), Some("mErp vAlley")), (Some("hAyes mErp"), Some("vAlley")), (Some("hAyes mErp vAlley"), None)])]
    fn test_name_permutations(name: &str, expected: Vec<(Option<&str>, Option<&str>)>) {
        let results = name_permutations(&PiiString::from(name));
        let results: Vec<_> = results
            .iter()
            .map(|(f, l)| (f.as_ref().map(|f| f.leak()), l.as_ref().map(|l| l.leak())))
            .collect();
        assert_eq!(results, expected);
    }
}
