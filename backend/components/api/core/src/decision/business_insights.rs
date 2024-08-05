use super::features::middesk::AddressVerificationTask;
use super::features::middesk::DbaNameTask;
use super::features::middesk::NameTask;
use super::features::middesk::PersonVerificationTask;
use super::features::middesk::PhoneTask;
use super::features::middesk::TaskKind;
use super::features::middesk::TinTask;
use super::features::middesk::WatchlistTask;
use super::features::middesk::WebsiteVerificationTask;
use crate::decision::features::middesk::get_task;
use crate::decision::features::middesk::TaskKindDiscriminant;
use idv::middesk::response::business::Address;
use idv::middesk::response::business::BusinessResponse;
use idv::middesk::response::business::Formation;
use idv::middesk::response::business::MiddeskSourceIdKey;
use idv::middesk::response::business::Name;
use idv::middesk::response::business::Person;
use idv::middesk::response::business::PhoneNumber;
use idv::middesk::response::business::Registration;
use idv::middesk::response::business::Result as WLResult;
use idv::middesk::response::business::SourceType;
use idv::middesk::response::business::Task;
use idv::middesk::response::business::Watchlist;
use idv::middesk::response::business::Website;
use itertools::Itertools;
use newtypes::PiiString;
use paperclip::actix::Apiv2Response;


// TODO: sources for biz details
//   agency info for watchlist
#[derive(serde::Serialize, macros::JsonResponder, Apiv2Response, Clone)]
pub struct BusinessInsights {
    /// Information about names (DBA/Legal) that were submitted and found associated with the
    /// business
    pub names: Vec<InsightBusinessName>,
    /// Details about the business
    pub details: Option<BusinessDetail>,
    /// People associated with the business (submitted or found)
    pub people: Vec<InsightPerson>,
    /// Information about governmental registrations
    pub registrations: Vec<InsightRegistration>,
    /// Watchlist results from screening the submitted + found people + biz names
    pub watchlist: Option<InsightWatchlist>,
    /// Addresses (found + submitted)
    pub addresses: Vec<InsightAddress>,
}

#[derive(serde::Serialize, Apiv2Response, Clone)]
pub struct InsightBusinessName {
    pub name: Option<PiiString>,
    pub submitted: bool,
    /// It's possible we get a name submitted / found but did not try to verify, hence Option
    pub verified: Option<bool>,
    /// More granular status (from enum NameTask)
    pub sub_status: Option<String>,
    /// dba, legal, etc. not an enum bc we don't need to have it be, and we also don't have full
    /// info from middesk docs
    pub kind: Option<String>,
    /// what places a vendor found information about this name.
    /// Does not include watchlist information
    pub sources: Option<String>,
}

/// Details about the business
#[derive(serde::Serialize, Apiv2Response, Clone)]
pub struct BusinessDetail {
    /// Formation date (from vendor)
    pub formation_date: Option<String>,
    /// Formation state (from vendor)
    pub formation_state: Option<String>,
    /// Information about the provided TIN
    pub tin: Option<InsightTin>,
    /// Entity type (from vendor)
    pub entity_type: Option<String>,
    /// Info on the phone numbers provided
    pub phone_numbers: Vec<InsightPhone>,
    /// Info on the website provided
    pub website: Option<InsightWebsite>,
}

#[derive(serde::Serialize, Apiv2Response, Clone)]
pub struct InsightTin {
    pub tin: Option<PiiString>,
    /// Whether or not the TIN was verified in the IRS TIN database
    pub verified: bool,
}

#[derive(serde::Serialize, Apiv2Response, Clone)]
pub struct InsightPhone {
    pub phone: PiiString,
    /// Was phone submitted
    pub submitted: Option<bool>,
    /// Verified association with the business
    pub verified: Option<bool>,
}

#[derive(serde::Serialize, Apiv2Response, Clone)]
pub struct InsightWebsite {
    pub url: PiiString,
    pub verified: Option<bool>,
}

#[derive(serde::Serialize, Apiv2Response, Clone)]
pub struct InsightPerson {
    /// Name
    pub name: Option<PiiString>,
    /// Role at the business
    pub role: Option<String>,
    /// People can be submitted (BOs) or found via filing records, or other sources
    pub submitted: bool,
    /// Verified association with the business
    pub association_verified: Option<bool>, /* None means it wasn't submitted, but was found. Or it could mean we didn't run person verification for whatever reason */
    pub sources: Option<String>,
}

#[derive(serde::Serialize, Apiv2Response, Clone)]
pub struct InsightRegistration {
    pub state: Option<String>,
    /// File date
    pub registration_date: Option<String>,
    pub registered_agent: Option<PiiString>,
    pub officers: Vec<Officer>,
    pub addresses: Vec<PiiString>,
    pub entity_type: Option<String>,
    pub status: Option<String>,
    pub sub_status: Option<String>,
    pub source: Option<String>,
    pub name: Option<String>,
    pub jurisdiction: Option<String>,
    pub file_number: Option<PiiString>,
}

#[derive(serde::Serialize, Apiv2Response, Clone)]
pub struct Officer {
    pub name: Option<PiiString>,
    pub roles: Option<String>,
}

#[derive(serde::Serialize, Apiv2Response, Clone)]
pub struct InsightWatchlist {
    pub hit_count: Option<i32>,
    /// Watchlist entries for the submitted + found people
    pub people: Vec<WatchlistEntry>,
    /// Watchlist entries for the submitted + found biz names
    pub business: Vec<WatchlistEntry>,
}

#[derive(serde::Serialize, Apiv2Response, Clone)]

pub struct WatchlistEntry {
    /// the name we screened
    pub screened_entity_name: Option<PiiString>,
    /// List of hits, if any
    pub hits: Vec<WatchlistHit>,
}

#[derive(serde::Serialize, Clone, Apiv2Response)]
pub struct WatchlistHit {
    pub entity_name: Option<PiiString>,
    pub entity_aliases: Vec<PiiString>,
    pub agency_list_url: Option<String>,
    pub agency_information_url: Option<String>,
    pub url: Option<String>,
    pub agency: Option<String>,
    pub agency_abbr: Option<String>,
    pub list_name: Option<String>,
    pub list_country: Option<String>,
}

#[derive(serde::Serialize, Apiv2Response, Clone)]
pub struct InsightAddress {
    pub address_line1: Option<PiiString>,
    pub address_line2: Option<PiiString>,
    pub city: Option<PiiString>,
    pub state: Option<PiiString>,
    pub postal_code: Option<PiiString>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub property_type: Option<String>,
    pub sources: Option<String>,
    pub submitted: Option<bool>,
    pub deliverable: Option<bool>,
    pub verified: Option<bool>,
    /// Commercial Mail Receiving Agency
    pub cmra: Option<bool>,
}

impl From<BusinessResponse> for BusinessInsights {
    fn from(business_response: BusinessResponse) -> Self {
        let watchlist = create_watchlists(&business_response);
        let names = create_names(&business_response);
        let people = create_people(&business_response);
        let details = create_business_details(&business_response);
        let registrations = create_registrations(&business_response);
        let addresses = create_addresses(&business_response);

        BusinessInsights {
            names,
            details,
            people,
            registrations,
            watchlist,
            addresses,
        }
    }
}


fn create_people(business_response: &BusinessResponse) -> Vec<InsightPerson> {
    let person_task = get_task(business_response, TaskKindDiscriminant::PersonVerification);

    let is_verified = person_task.and_then(|ptask| {
        if let (_, TaskKind::PersonVerification(person_verification_task)) = ptask {
            Some(matches!(
                person_verification_task,
                PersonVerificationTask::Verified
            ))
        } else {
            None
        }
    });

    // TODO: Not sure how 1 BO matching and 1 BO not matching is represented
    let submitted_people_are_verified = is_verified.unwrap_or(false);

    business_response
        .people
        .clone()
        .unwrap_or_default()
        .into_iter()
        .map(|person| {
            let role = person.titles_for_display();
            let sources = person.sources_for_display(false);
            let Person { name, submitted, .. } = person;
            let submitted = submitted.unwrap_or(false);
            // only submitted people can be verified
            let association_verified = submitted.then_some(submitted_people_are_verified);

            InsightPerson {
                name: name.map(|n| n.into()),
                role,
                submitted,
                association_verified,
                sources,
            }
        })
        .collect()
}

fn create_business_details(business_response: &BusinessResponse) -> Option<BusinessDetail> {
    // no ? so we always get biz details even if TIN is missing for some reason
    let tin = business_response.tin.clone();
    let formation = business_response.formation.clone();

    let tin_is_verified = get_task(business_response, TaskKindDiscriminant::Tin).and_then(|ttask| {
        if let (_, TaskKind::Tin(tin_task)) = ttask {
            Some(matches!(tin_task, TinTask::Found))
        } else {
            None
        }
    });

    // create info about the website
    let website = business_response.website.clone();
    let website_verification_task = get_task(business_response, TaskKindDiscriminant::WebsiteVerification);
    let website = create_website(website, website_verification_task);

    // create info about the phone
    let phone_number = business_response.phone_numbers.clone();
    let phone_number_verification_task = get_task(business_response, TaskKindDiscriminant::Phone);
    let phone_numbers = create_phone_numbers(phone_number, phone_number_verification_task);

    // TIN
    let insight_tin = tin.map(|t| InsightTin {
        tin: t.tin.map(|ti| ti.into()),
        // unwrap_or here because both middesk integrations we use always check for Tin verification
        verified: tin_is_verified.unwrap_or(false),
    });

    // Formation
    let (entity_type, formation_date, formation_state) = if let Some(formation) = formation {
        let Formation {
            entity_type,
            formation_date,
            formation_state,
            ..
        } = formation;
        (entity_type, formation_date, formation_state)
    } else {
        (None, None, None)
    };

    let biz_detail = BusinessDetail {
        formation_date,
        formation_state,
        tin: insight_tin,
        entity_type,
        phone_numbers,
        website,
    };

    Some(biz_detail)
}

fn create_website(
    website: Option<Website>,
    website_verification_task: Option<(Task, TaskKind)>,
) -> Option<InsightWebsite> {
    let website = website?;
    let url = website.url?;
    let is_verified = website_verification_task.and_then(|wtask| {
        if let (_, TaskKind::WebsiteVerification(website_verification_task)) = wtask {
            Some(matches!(
                website_verification_task,
                WebsiteVerificationTask::Verified
            ))
        } else {
            None
        }
    });

    let res = InsightWebsite {
        url: url.into(),
        verified: is_verified,
    };

    Some(res)
}

fn create_phone_numbers(
    phone_numbers: Option<Vec<PhoneNumber>>,
    phone_task: Option<(Task, TaskKind)>,
) -> Vec<InsightPhone> {
    let is_verified = phone_task.and_then(|ptask| {
        if let (_, TaskKind::Phone(phone_verification_task)) = ptask {
            Some(matches!(phone_verification_task, PhoneTask::Verified))
        } else {
            None
        }
    });

    phone_numbers
        .unwrap_or_default()
        .into_iter()
        .filter_map(|pn| {
            pn.phone_number.map(|p| InsightPhone {
                phone: p.into(),
                // TODO: need to check `resp.submitted` to see which phone numbers were actually submitted
                // `phone_numbers`` field doesn't include this
                submitted: Some(true),
                verified: is_verified,
            })
        })
        .collect()
}

fn create_registrations(business_response: &BusinessResponse) -> Vec<InsightRegistration> {
    business_response
        .registrations
        .clone()
        .unwrap_or_default()
        .into_iter()
        .map(|r| {
            let Registration {
                name,
                status,
                entity_type,
                addresses,
                officers,
                registration_date,
                state,
                source,
                registered_agent,
                jurisdiction,
                sub_status,
                file_number,
                ..
            } = r;

            let officers = officers
                .unwrap_or_default()
                .into_iter()
                .map(|o| {
                    let roles = o.roles_for_display();
                    Officer {
                        name: o.name.map(PiiString::from),
                        roles,
                    }
                })
                .collect();

            let addresses = addresses
                .unwrap_or_default()
                .into_iter()
                .map(PiiString::from)
                .collect();

            // unsure the shape of this in the response for all values
            let registered_agent = registered_agent
                .and_then(|ra| ra.leak().get("name").cloned())
                .and_then(|i| serde_json::to_string(&i).ok())
                .map(PiiString::from);

            InsightRegistration {
                state,
                registration_date,
                registered_agent,
                officers,
                addresses,
                entity_type,
                status,
                source,
                name,
                jurisdiction,
                sub_status,
                file_number: file_number.map(PiiString::from),
            }
        })
        .collect()
}

fn create_addresses(business_response: &BusinessResponse) -> Vec<InsightAddress> {
    let address_task = get_task(business_response, TaskKindDiscriminant::AddressVerification);
    let is_verified = address_task.and_then(|atask| {
        if let (_, TaskKind::AddressVerification(address_task)) = atask {
            Some(matches!(address_task, AddressVerificationTask::Verified))
        } else {
            None
        }
    });

    business_response
        .addresses
        .clone()
        .unwrap_or_default()
        .into_iter()
        .map(|a| {
            let Address {
                address_line1,
                address_line2,
                city,
                state,
                postal_code,
                latitude,
                longitude,
                property_type,
                sources,
                submitted,
                deliverable,
                cmra,
                ..
            } = a;
            let verified = submitted.and_then(|s| s.then_some(is_verified.unwrap_or(false)));

            InsightAddress {
                address_line1: address_line1.map(|a| a.into()),
                address_line2: address_line2.map(|a| a.into()),
                city: city.map(|a| a.into()),
                state: state.map(|a| a.into()),
                postal_code: postal_code.map(|a| a.into()),
                latitude,
                longitude,
                property_type,
                sources: sources.map(|s| s.into_iter().filter_map(|src| src.source_for_display()).collect()),
                submitted,
                deliverable,
                verified,
                cmra,
            }
        })
        .collect()
}


fn create_names(business_response: &BusinessResponse) -> Vec<InsightBusinessName> {
    let name_task = get_task(business_response, TaskKindDiscriminant::Name);
    let dba_task = get_task(business_response, TaskKindDiscriminant::DbaName);
    let name_verification = name_task.and_then(|ntask| {
        if let (_, TaskKind::Name(name_task)) = ntask {
            // TODO: has similar name/alternate name. might need a diff label here
            Some((matches!(name_task, NameTask::Verified), name_task.to_string()))
        } else {
            None
        }
    });
    let dba_verification = dba_task.and_then(|ntask| {
        if let (_, TaskKind::DbaName(dba_name_task)) = ntask {
            // TODO: has similar name/alternate name. might need a diff label here
            Some((
                matches!(dba_name_task, DbaNameTask::Verified),
                dba_name_task.to_string(),
            ))
        } else {
            None
        }
    });

    business_response
        .names
        .clone()
        .unwrap_or_default()
        .into_iter()
        .map(|n| {
            let sources = n.sources_for_display(false);
            let Name {
                name,
                submitted,
                type_,
                ..
            } = n;
            let verification = if let Some(name_type) = type_.as_ref() {
                match name_type.as_str() {
                    "dba" => dba_verification.clone(),
                    "legal" => name_verification.clone(),
                    _ => None,
                }
            } else {
                None
            };

            InsightBusinessName {
                name: name.map(|n| n.into()),
                submitted: submitted.unwrap_or(false),
                verified: verification.as_ref().map(|v| v.0),
                sub_status: verification.map(|v| v.1),
                kind: type_,
                sources,
            }
        })
        .collect()
}


// names has watchlist result info, with an ID we can use to find the appropraite WL entry
//
// prob can do names + watchlist in this one as well
fn create_watchlists(business_response: &BusinessResponse) -> Option<InsightWatchlist> {
    let watchlist_task = get_task(business_response, TaskKindDiscriminant::Watchlist);
    let watchlists = business_response.watchlist.clone();
    let wl = watchlists?;
    let (task, TaskKind::Watchlist(wl_task)) = watchlist_task? else {
        // we didn't screen for watchlist
        return None;
    };

    // These IDs are for any hits we've found. They map to ids found in the sources in the
    // names/addresses/people
    let wl_hit_ids: Vec<MiddeskSourceIdKey> = task
        .sources
        .map(|s| {
            s.into_iter()
                .filter_map(|src| src.id.map(MiddeskSourceIdKey::SourceId))
                .collect()
        })
        .unwrap_or_default();

    if wl_hit_ids.is_empty() && !matches!(wl_task, WatchlistTask::NoHits) {
        tracing::warn!("mismatch in watchlist task source list and watch list task label");
    }

    // Create a mapping from watchlist source ID to person and name
    // Middesk screens all names (submitted and otherwise) AND all people (submitted and otherwise)
    // NOTE: not all people or names will have sources, but these mappings include an entry for people
    // with no sources for the optionally specified source
    let people_by_id_map = business_response.people_by_source_id(Some(SourceType::WatchlistResult));
    let names_by_id_map = business_response.names_by_source_id(Some(SourceType::WatchlistResult));

    let Watchlist {
        lists,
        hit_count,
        people: _,
        ..
    } = wl;

    let lists = lists?;

    // lists is all the lists that were screened, which have a results field if there was a hit
    let hits_by_id = lists
        .into_iter()
        .flat_map(|l| {
            let agency = l.agency.clone();
            let agency_abbr = l.agency_abbr.clone();
            let list_name = l.title.clone();
            let r: Vec<(MiddeskSourceIdKey, WatchlistHit)> = l
                .results
                .unwrap_or_default()
                .into_iter()
                .map(|res| {
                    let WLResult {
                        entity_name,
                        entity_aliases,
                        agency_list_url,
                        agency_information_url,
                        url,
                        id,
                        list_country,
                        ..
                    } = res;

                    let hit = WatchlistHit {
                        entity_name: entity_name.map(PiiString::from),
                        entity_aliases: entity_aliases
                            .unwrap_or_default()
                            .into_iter()
                            .map(PiiString::from)
                            .collect(),
                        agency_list_url,
                        agency_information_url,
                        url,
                        agency: agency.clone(),
                        agency_abbr: agency_abbr.clone(),
                        list_name: list_name.clone(),
                        list_country,
                    };

                    (id.into(), hit)
                })
                .collect();

            r
        })
        .collect_vec()
        .into_iter()
        .into_group_map();

    //
    // People hits
    //
    let people_with_hits = people_by_id_map
        .iter()
        .flat_map(|(src_id, ppl)| {
            let maybe_hit = hits_by_id.get(src_id);

            if let Some(hits) = maybe_hit {
                ppl.iter()
                    .map(|p| {
                        let screened_name = p.name.as_ref().map(|n| n.clone().into());
                        (screened_name.clone(), hits.clone())
                    })
                    .collect()
            } else {
                vec![]
            }
        })
        .into_group_map()
        .into_iter()
        .map(|(name, hits)| WatchlistEntry {
            screened_entity_name: name,
            hits: hits.into_iter().flatten().collect(),
        });

    let people_with_no_hits: Vec<WatchlistEntry> = people_by_id_map
        .get(&MiddeskSourceIdKey::NoSources)
        .map(|ppl| {
            ppl.iter()
                .map(|p| WatchlistEntry {
                    screened_entity_name: p.name.as_ref().map(|n| n.clone().into()),
                    hits: vec![],
                })
                .collect()
        })
        .unwrap_or_default();
    let people = people_with_hits.into_iter().chain(people_with_no_hits).collect();

    //
    // Name hits
    //
    let names_with_hits = names_by_id_map
        .iter()
        .flat_map(|(src_id, names)| {
            let maybe_hit = hits_by_id.get(src_id);

            if let Some(hits) = maybe_hit {
                names
                    .iter()
                    .map(|p| {
                        let screened_name = p.name.as_ref().map(|n| n.clone().into());
                        (screened_name.clone(), hits.clone())
                    })
                    .collect()
            } else {
                vec![]
            }
        })
        .into_group_map()
        .into_iter()
        .map(|(name, hits)| WatchlistEntry {
            screened_entity_name: name,
            hits: hits.into_iter().flatten().collect(),
        });

    let names_with_no_hits: Vec<WatchlistEntry> = names_by_id_map
        .get(&MiddeskSourceIdKey::NoSources)
        .map(|names| {
            names
                .iter()
                .map(|nm| WatchlistEntry {
                    screened_entity_name: nm.name.as_ref().map(|n| n.clone().into()),
                    hits: vec![],
                })
                .collect()
        })
        .unwrap_or_default();

    let business = names_with_hits.into_iter().chain(names_with_no_hits).collect();

    let res = InsightWatchlist {
        hit_count,
        people,
        business,
    };

    Some(res)
}


#[cfg(test)]
mod tests {
    use super::*;
    use idv::middesk::response::webhook::MiddeskBusinessUpdateWebhookResponse;
    use idv::test_fixtures;

    #[test]
    fn test_business_insights() {
        let parsed: MiddeskBusinessUpdateWebhookResponse =
            serde_json::from_value(test_fixtures::middesk_business_update_webhook_response()).unwrap();

        let insight = BusinessInsights::from(parsed.business_response().unwrap().clone());

        // assertions
        let details = insight.details.clone().unwrap();
        assert_eq!(details.entity_type, Some("CORPORATION".to_string()));
        assert_eq!(
            details.phone_numbers.first().unwrap().phone,
            "+12222222222".into()
        );
        assert_eq!(
            details.website.as_ref().map(|w| w.url.clone()),
            Some("https://www.wafflehouse.com".into())
        );

        assert_eq!(insight.names.len(), 2);
        assert_eq!(insight.registrations.len(), 1);
        assert_eq!(insight.addresses.len(), 2);

        let maybe_person = insight.people.first();
        let person = maybe_person.as_ref().unwrap();
        assert_eq!(person.sources, Some("FL - SOS".to_string()));
        assert!(person.submitted);
        assert!(person.association_verified.unwrap());


        let watchlist = insight.watchlist.unwrap();
        assert_eq!(watchlist.hit_count, Some(1));
        assert_eq!(
            watchlist
                .people
                .first()
                .as_ref()
                .unwrap()
                .screened_entity_name
                .clone()
                .unwrap(),
            "Jane watchlist hit".into()
        );
        assert_eq!(watchlist.business.len(), 2);
        assert!(watchlist.business.iter().all(|b| b.hits.is_empty()));
    }
}
