use crate::FpResult;
use crate::State;
use db::scoped_vault::SearchQuery;
use itertools::Itertools;
use newtypes::fingerprint_salt::FingerprintSalt;
use newtypes::BusinessDataKind as BDK;
use newtypes::CompositeFingerprint;
use newtypes::CompositeFingerprintKind;
use newtypes::DataIdentifier;
use newtypes::FingerprintKind;
use newtypes::FpId;
use newtypes::IdentityDataKind as IDK;
use newtypes::PhoneNumber;
use newtypes::PiiString;
use newtypes::TenantId;

/// Given a search string and fp_id, parse into the list of FingerprintQueries and fp_id by which to
/// query for ScopedVaults
pub async fn parse_search(
    state: &State,
    search: Option<PiiString>,
    tenant_id: &TenantId,
) -> FpResult<(Option<SearchQuery>, Option<FpId>)> {
    use DataIdentifier::Business;
    use DataIdentifier::Id;
    let Some(search) = search else {
        return Ok((None, None));
    };
    let t_id = Some(tenant_id);

    // A bit of a hack: if the user types query that looks like an fp_id, try to look up by identifier
    // instead
    if search.leak().starts_with("fp_id_") || search.leak().starts_with("fp_bid_") {
        let fp_id = Some(FpId::from(search.leak_to_string()));
        return Ok((None, fp_id));
    }

    let search_str = search.clean_for_fingerprint();
    tracing::info!(search_len=%search_str.leak().len(), "Parsing search string");
    // A list of fingerprint queries, with each element representing an AND search condition
    let mut fingerprint_queries: Vec<(FingerprintKind, _)> = vec![];

    // Fingerprints for phone number
    let dis = &[Id(IDK::PhoneNumber), Business(BDK::PhoneNumber)];
    let formatted_phone_numbers = vec![
        PiiString::new(format!("+1{}", search_str.leak())),
        PiiString::new(format!("+1-{}", search_str.leak())),
        PiiString::new(format!("+{}", search_str.leak())),
        search_str.clone(),
    ]
    .into_iter()
    .filter_map(|p| PhoneNumber::parse(p).ok().map(|p| p.e164()))
    .unique()
    .collect_vec();
    for phone in formatted_phone_numbers.iter() {
        for di in dis {
            for d in di.get_fingerprint_payload(phone, t_id) {
                fingerprint_queries.push((di.clone().into(), vec![d]));
            }
        }
    }

    // Fingerprints for name queries. Since our name fields are split across multiple DIs, do some
    // complex logic to generate all the possible search queries
    let name_permutations = name_permutations(&search);
    let fn_di = &Id(IDK::FirstName);
    let ln_di = &Id(IDK::LastName);
    for (first_name, last_name) in name_permutations.iter() {
        let fingerprints = vec![
            first_name
                .as_ref()
                .map(|p| (FingerprintSalt::Tenant(fn_di.clone(), tenant_id.clone()), p)),
            last_name
                .as_ref()
                .map(|p| (FingerprintSalt::Tenant(ln_di.clone(), tenant_id.clone()), p)),
        ]
        .into_iter()
        .flatten()
        .collect_vec();
        match (first_name, last_name) {
            (Some(_), None) => fingerprint_queries.push((fn_di.clone().into(), fingerprints)),
            (None, Some(_)) => fingerprint_queries.push((ln_di.clone().into(), fingerprints)),
            (_, _) => {
                // If this permutation includes both a first name and last name, a matching result must
                // match on both the first name and the last name.
                let fpk = CompositeFingerprintKind::Name.into();
                fingerprint_queries.push((fpk, fingerprints))
            }
        }
    }

    // Fingerprint for website
    let websites = [
        PiiString::from(format!("https://{}", search_str.leak())),
        search_str.clone(),
    ];
    if !search_str.leak().contains(' ') && search_str.leak().contains('.') {
        for w in websites.iter() {
            let di = Business(BDK::Website);
            for d in di.get_fingerprint_payload(w, t_id) {
                fingerprint_queries.push((di.clone().into(), vec![d]));
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
    for di in dis {
        for d in di.get_fingerprint_payload(&search_str, t_id) {
            fingerprint_queries.push((di.clone().into(), vec![d]));
        }
    }

    // The data we're going to fingerprint is grouped into vecs that represent a single search
    // condition. When there are multiple items in the vec, it's a composite fingerprint query.
    // Flatten this 2d array into a 1d-array, but keep track of the initial index so we can group
    // the fingerprints back into their 2d-array format.
    let data_to_fp = fingerprint_queries
        .into_iter()
        .enumerate()
        .flat_map(|(i, (fpk, fps))| {
            fps.into_iter()
                .map(move |(s, d)| ((fpk.clone(), s.clone(), i), (s, d)))
        })
        .collect_vec();
    let fingerprints = state.enclave_client.compute_fingerprints_keys(data_to_fp).await?;

    let fingerprint_queries = fingerprints
        .into_iter()
        .map(|((fpk, salt, i), fp)| ((fpk, i), (salt, fp)))
        .into_group_map()
        .into_iter()
        .flat_map(|((fpk, _), fps)| match fpk {
            FingerprintKind::DI(_) => fps.into_iter().map(|(_, fp)| fp).next(),
            // Compute the composite fingerprint from partial fingerprints if needed
            FingerprintKind::Composite(cfpk) => match cfpk {
                CompositeFingerprintKind::Name => CompositeFingerprint::Name(tenant_id.clone())
                    .compute(&fps.into_iter().collect())
                    .ok(),
                CompositeFingerprintKind::NameDob => None,
                CompositeFingerprintKind::NameSsn4 => None,
            },
        })
        .collect_vec();

    let search = SearchQuery {
        search: search_str,
        fingerprint_queries,
    };
    Ok((Some(search), None))
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
