use std::collections::HashMap;

use super::tenant::Tenant;
use crate::actor;
use crate::actor::SaturatedActor;
use crate::NextPage;
use crate::OffsetPagination;
use crate::PgConn;
use crate::TxnPgConn;
use crate::{DbError, DbResult};
use chrono::{DateTime, Utc};
use db_schema::schema::ob_configuration::BoxedQuery;
use db_schema::schema::{ob_configuration, tenant};
use diesel::pg::Pg;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use itertools::Itertools;
use newtypes::AppearanceId;
use newtypes::DocumentCdoInfo;
use newtypes::EnhancedAmlOption;
use newtypes::IdDocKind;
use newtypes::Iso3166TwoDigitCountryCode;
use newtypes::WorkflowId;
use newtypes::{ApiKeyStatus, CipKind, DataIdentifierDiscriminant, DbActor};
use newtypes::{CollectedDataOption as CDO, ObConfigurationId, ObConfigurationKey, TenantId};
use strum::IntoEnumIterator;

pub type IsLive = bool;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = ob_configuration)]
pub struct ObConfiguration {
    pub id: ObConfigurationId,
    pub key: ObConfigurationKey,
    pub name: String,
    pub tenant_id: TenantId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub is_live: IsLive,
    pub status: ApiKeyStatus,
    pub created_at: DateTime<Utc>,
    pub must_collect_data: Vec<CDO>,
    pub can_access_data: Vec<CDO>,
    pub appearance_id: Option<AppearanceId>,
    pub cip_kind: Option<CipKind>,
    pub optional_data: Vec<CDO>,
    // DO NOT REORDER THESE FIELDS
    pub is_no_phone_flow: bool,
    pub is_doc_first: bool,
    pub allow_international_residents: bool,
    pub international_country_restrictions: Option<Vec<Iso3166TwoDigitCountryCode>>,
    pub author: Option<DbActor>,
    pub skip_kyc: bool,
    pub doc_scan_for_optional_ssn: Option<CDO>,
    pub enhanced_aml: EnhancedAmlOption,
    pub allow_us_residents: bool,
    pub allow_us_territory_residents: bool,
}

#[derive(derive_more::Deref)]
pub struct SupportedDocumentAndCountryMapping(pub HashMap<Iso3166TwoDigitCountryCode, Vec<IdDocKind>>);
impl SupportedDocumentAndCountryMapping {
    pub fn supported_countries_for_doc_type(&self, doc_type: IdDocKind) -> Vec<Iso3166TwoDigitCountryCode> {
        self.0
            .iter()
            .filter_map(|(country, doc_types)| doc_types.contains(&doc_type).then_some(country))
            .cloned()
            .collect()
    }
}

impl ObConfiguration {
    // returns a map of country -> supported document types
    pub fn supported_country_mapping_for_document(
        &self,
        residential_country: Option<Iso3166TwoDigitCountryCode>,
    ) -> SupportedDocumentAndCountryMapping {
        let id_doc_kinds = if let Some(kinds) = self
            .restricted_id_doc_kinds()
            .or(self.optional_ssn_restricted_id_doc_kinds())
        // we'll only ever have 1 of these, we prevent OBCs from being created with doc AND optional SSN doc stepup
        {
            kinds
        } else {
            IdDocKind::iter().collect()
        };

        // For each id doc kind configured, compute which countries we support
        let countries_and_doc_types: Vec<(Iso3166TwoDigitCountryCode, IdDocKind)> = id_doc_kinds
            .into_iter()
            .flat_map(|doc_type| {
                let out: Vec<(Iso3166TwoDigitCountryCode, IdDocKind)> = self
                    .supported_countries_for_doc_type(doc_type)
                    .into_iter()
                    .map(|c| (c, doc_type))
                    .collect();

                out
            })
            .collect();

        let map: HashMap<Iso3166TwoDigitCountryCode, Vec<IdDocKind>> = countries_and_doc_types
            .into_iter()
            .fold(HashMap::new(), |mut acc: HashMap<_, _>, (country, doc_type)| {
                let is_passport = doc_type == IdDocKind::Passport;
                // Don't allow non-passport if we are displaying possible document types for an international residential address
                //   - This is the case _even if the person has a US document type that would have been supported had they been living in the US_
                //
                // For example:
                //  * OBC has DL, passport, id card configured
                //      * DL + id card are only possible for US (currently)
                //  * OBC has residential country restrictions: US, MX
                //  * I am living in Mexico, and submitted my MX address
                //    ==> i have to provide a passport from any country (which includes US, where i'm from). even though i have an acceptable form of ID were I to be living in the US
                //
                //
                // That is to say, international country restrictions do not affect the countries you can submit a passport for, this just controls
                // residential address - there are integration tests testing this part
                if !is_passport
                    && residential_country
                        .map(|c| !c.is_us_including_territories())
                        .unwrap_or(false)
                {
                    acc
                } else {
                    acc.entry(country).or_default().push(doc_type);
                    acc
                }
            });

        SupportedDocumentAndCountryMapping(map)
    }

    /// Construct the set of countries that we'll collect in bifrost.
    pub fn supported_countries_for_residential_address(&self) -> Vec<Iso3166TwoDigitCountryCode> {
        let mut countries = Vec::new();

        // Note: these are all checked in post org/onboarding_configs, so we'll respect what's on the OBC

        if self.allow_us_residents {
            countries.push(Iso3166TwoDigitCountryCode::US)
        }

        if self.allow_us_territory_residents {
            Iso3166TwoDigitCountryCode::codes_for_us_territories()
                .into_iter()
                .for_each(|c| countries.push(c))
        }

        if let Some(supported) = self.international_country_restrictions.as_ref() {
            supported.iter().for_each(|c| countries.push(*c))
        } else {
            // if we don't, we could allow or disallow international, so check that here
            if self.allow_international_residents {
                Iso3166TwoDigitCountryCode::all_international()
                    .into_iter()
                    .for_each(|c| {
                        // US is handled above
                        countries.push(c);
                    })
            }
        }

        countries.into_iter().unique().collect()
    }

    // Assumes you've checked if the document type is supported already
    fn supported_countries_for_doc_type(&self, doc_type: IdDocKind) -> Vec<Iso3166TwoDigitCountryCode> {
        if self.tenant_id.is_findigs() {
            match doc_type {
                IdDocKind::IdCard => Iso3166TwoDigitCountryCode::iter().collect(),
                IdDocKind::DriversLicense => Iso3166TwoDigitCountryCode::iter().collect(),
                IdDocKind::Passport => Iso3166TwoDigitCountryCode::iter().collect(),
                IdDocKind::Permit => vec![Iso3166TwoDigitCountryCode::US],
                IdDocKind::Visa => vec![Iso3166TwoDigitCountryCode::US],
                IdDocKind::ResidenceDocument => vec![Iso3166TwoDigitCountryCode::US],
            }
        } else {
            let all_us_and_territories = Iso3166TwoDigitCountryCode::all_codes_for_us_including_territories();
            match doc_type {
                IdDocKind::IdCard => all_us_and_territories,
                IdDocKind::DriversLicense => all_us_and_territories,
                IdDocKind::Passport => Iso3166TwoDigitCountryCode::iter().collect(),
                IdDocKind::Permit => all_us_and_territories,
                IdDocKind::Visa => all_us_and_territories,
                IdDocKind::ResidenceDocument => all_us_and_territories,
            }
        }
    }

    pub fn restricted_id_doc_kinds(&self) -> Option<Vec<IdDocKind>> {
        self.document_cdo().and_then(|cdo| cdo.restricted_id_doc_kinds())
    }

    pub fn optional_ssn_restricted_id_doc_kinds(&self) -> Option<Vec<IdDocKind>> {
        self.document_cdo_for_optional_ssn()
            .and_then(|cdo| cdo.restricted_id_doc_kinds())
    }

    pub fn should_stepup_to_do_for_optional_ssn(&self) -> bool {
        self.document_cdo_for_optional_ssn().is_some()
    }
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = ob_configuration)]
struct NewObConfiguration {
    key: ObConfigurationKey,
    name: String,
    tenant_id: TenantId,
    is_live: bool,
    status: ApiKeyStatus,
    created_at: DateTime<Utc>,

    must_collect_data: Vec<CDO>,
    can_access_data: Vec<CDO>,
    cip_kind: Option<CipKind>,
    optional_data: Vec<CDO>,
    is_no_phone_flow: bool,
    is_doc_first: bool,
    allow_international_residents: bool,
    international_country_restrictions: Option<Vec<Iso3166TwoDigitCountryCode>>,
    author: DbActor,
    skip_kyc: bool,
    doc_scan_for_optional_ssn: Option<CDO>,
    enhanced_aml: EnhancedAmlOption,
    pub allow_us_residents: bool,
    pub allow_us_territory_residents: bool,
}

#[derive(Debug)]
pub enum ObConfigIdentifier<'a> {
    Id(&'a ObConfigurationId),
    Key(&'a ObConfigurationKey),
    Tenant {
        id: &'a ObConfigurationId,
        tenant_id: &'a TenantId,
        is_live: bool,
    },
    Workflow(&'a WorkflowId),
}

impl<'a> From<&'a ObConfigurationId> for ObConfigIdentifier<'a> {
    fn from(id: &'a ObConfigurationId) -> Self {
        Self::Id(id)
    }
}

impl<'a> From<&'a ObConfigurationKey> for ObConfigIdentifier<'a> {
    fn from(key: &'a ObConfigurationKey) -> Self {
        Self::Key(key)
    }
}

impl<'a> From<(&'a ObConfigurationId, &'a TenantId, bool)> for ObConfigIdentifier<'a> {
    fn from((id, tenant_id, is_live): (&'a ObConfigurationId, &'a TenantId, bool)) -> Self {
        Self::Tenant {
            id,
            tenant_id,
            is_live,
        }
    }
}

impl<'a> From<&'a WorkflowId> for ObConfigIdentifier<'a> {
    fn from(id: &'a WorkflowId) -> Self {
        Self::Workflow(id)
    }
}

#[derive(AsChangeset)]
#[diesel(table_name = ob_configuration)]
struct ObConfigurationUpdate {
    name: Option<String>,
    status: Option<ApiKeyStatus>,
}

#[derive(Debug, Clone)]
pub struct ObConfigurationQuery {
    pub tenant_id: TenantId,
    pub is_live: bool,
    pub status: Option<ApiKeyStatus>,
    pub search: Option<String>,
}

pub type ObConfigInfo = (ObConfiguration, Option<SaturatedActor>);

impl ObConfiguration {
    fn list_query(filters: &ObConfigurationQuery) -> BoxedQuery<Pg> {
        let mut query = ob_configuration::table
            .filter(ob_configuration::tenant_id.eq(&filters.tenant_id))
            .filter(ob_configuration::is_live.eq(filters.is_live))
            .into_boxed();
        if let Some(status) = filters.status.as_ref() {
            query = query.filter(ob_configuration::status.eq(status))
        }
        if let Some(search) = filters.search.as_ref() {
            query = query.filter(ob_configuration::name.ilike(format!("%{}%", search)));
        }
        query
    }

    #[tracing::instrument("ObConfiguration::list", skip_all)]
    pub fn list(
        conn: &mut PgConn,
        query: &ObConfigurationQuery,
        pagination: OffsetPagination,
    ) -> DbResult<(Vec<ObConfigInfo>, NextPage)> {
        let mut query = Self::list_query(query)
            .order_by(ob_configuration::created_at.desc())
            .limit(pagination.limit());

        if let Some(offset) = pagination.offset() {
            query = query.offset(offset)
        }
        let results = query.load::<Self>(conn)?;
        let results = actor::saturate_actors_nullable(conn, results)?;
        Ok(pagination.results(results))
    }

    #[tracing::instrument("ObConfiguration::count", skip_all)]
    pub fn count(conn: &mut PgConn, query: &ObConfigurationQuery) -> DbResult<i64> {
        let count = Self::list_query(query).count().get_result(conn)?;
        Ok(count)
    }

    #[tracing::instrument("ObConfiguration::get", skip_all)]
    pub fn get<'a, T>(conn: &mut PgConn, id: T) -> DbResult<(Self, Tenant)>
    where
        T: Into<ObConfigIdentifier<'a>>,
    {
        let mut query = ob_configuration::table.inner_join(tenant::table).into_boxed();

        match id.into() {
            ObConfigIdentifier::Id(id) => query = query.filter(ob_configuration::id.eq(id)),
            ObConfigIdentifier::Key(key) => query = query.filter(ob_configuration::key.eq(key)),
            ObConfigIdentifier::Tenant {
                id,
                tenant_id,
                is_live,
            } => {
                query = query
                    .filter(ob_configuration::id.eq(id))
                    .filter(ob_configuration::tenant_id.eq(tenant_id))
                    .filter(ob_configuration::is_live.eq(is_live))
            }
            ObConfigIdentifier::Workflow(id) => {
                use db_schema::schema::workflow;
                let obc_ids = workflow::table
                    .filter(workflow::id.eq(id))
                    .select(workflow::ob_configuration_id);
                query = query.filter(ob_configuration::id.nullable().eq_any(obc_ids))
            }
        }

        let result: (ObConfiguration, Tenant) = query.first(conn)?;
        Ok(result)
    }

    #[tracing::instrument("ObConfiguration::get_enabled", skip_all)]
    pub fn get_enabled<'a, T>(conn: &mut PgConn, id: T) -> DbResult<(Self, Tenant)>
    where
        T: Into<ObConfigIdentifier<'a>>,
    {
        let result = Self::get(conn, id)?;
        if result.0.status != ApiKeyStatus::Enabled {
            return Err(DbError::ApiKeyDisabled);
        }
        Ok(result)
    }

    #[allow(clippy::too_many_arguments)]
    #[tracing::instrument("ObConfiguration::create", skip_all)]
    pub fn create(
        conn: &mut PgConn,
        name: String,
        tenant_id: TenantId,
        must_collect_data: Vec<CDO>,
        optional_data: Vec<CDO>,
        can_access_data: Vec<CDO>,
        is_live: bool,
        cip_kind: Option<CipKind>,
        is_no_phone_flow: bool,
        is_doc_first: bool,
        allow_international_residents: bool,
        international_country_restrictions: Option<Vec<Iso3166TwoDigitCountryCode>>,
        author: DbActor,
        skip_kyc: bool,
        doc_scan_for_optional_ssn: Option<CDO>,
        enhanced_aml: EnhancedAmlOption,
        allow_us_residents: bool,
        allow_us_territory_residents: bool,
    ) -> DbResult<Self> {
        let config = NewObConfiguration {
            key: ObConfigurationKey::generate(is_live),
            name,
            tenant_id,
            must_collect_data,
            can_access_data,
            is_live,
            status: ApiKeyStatus::Enabled,
            created_at: Utc::now(),
            cip_kind,
            optional_data,
            is_no_phone_flow,
            is_doc_first,
            allow_international_residents,
            international_country_restrictions,
            author,
            skip_kyc,
            doc_scan_for_optional_ssn,
            enhanced_aml,
            allow_us_residents,
            allow_us_territory_residents,
        };
        let obc = diesel::insert_into(ob_configuration::table)
            .values(config)
            .get_result::<ObConfiguration>(conn)?;
        Ok(obc)
    }

    #[tracing::instrument("ObConfiguration::update", skip_all)]
    pub fn update(
        conn: &mut TxnPgConn,
        id: &ObConfigurationId,
        tenant_id: &TenantId,
        is_live: bool,
        name: Option<String>,
        status: Option<ApiKeyStatus>,
    ) -> DbResult<Self> {
        let update = ObConfigurationUpdate { name, status };
        let results: Vec<Self> = diesel::update(ob_configuration::table)
            .filter(ob_configuration::id.eq(id))
            .filter(ob_configuration::tenant_id.eq(tenant_id))
            .filter(ob_configuration::is_live.eq(is_live))
            .set(update)
            .load(conn.conn())?;

        if results.len() > 1 {
            return Err(DbError::IncorrectNumberOfRowsUpdated);
        }
        let result = results.into_iter().next().ok_or(DbError::UpdateTargetNotFound)?;
        Ok(result)
    }
}

impl ObConfiguration {
    pub fn document_cdo(&self) -> Option<&DocumentCdoInfo> {
        self.must_collect_data
            .iter()
            .filter_map(|cdo| match cdo {
                CDO::Document(doc_info) => Some(doc_info),
                _ => None,
            })
            .next()
    }

    pub fn document_cdo_for_optional_ssn(&self) -> Option<DocumentCdoInfo> {
        self.doc_scan_for_optional_ssn.as_ref().and_then(|cdo| match cdo {
            CDO::Document(doc_info) => Some(doc_info.clone()),
            _ => None,
        })
    }

    pub fn can_access_document(&self) -> bool {
        self.can_access_data
            .iter()
            .any(|cdo| matches!(cdo, CDO::Document(_)))
    }

    /// Returns true if this ob config requires collecting any CDO with the provided DataIdentifier kind
    pub fn must_collect(&self, di_kind: DataIdentifierDiscriminant) -> bool {
        self.must_collect_data
            .iter()
            .any(|cdo| cdo.parent().data_identifier_kind() == di_kind)
    }
}

#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use super::ObConfiguration;
    use crate::test_helpers::assert_have_same_elements;
    use chrono::Utc;
    use newtypes::{
        ApiKeyStatus, CollectedDataOption, DocumentCdoInfo, EnhancedAmlOption, IdDocKind,
        Iso3166TwoDigitCountryCode, ObConfigurationId, ObConfigurationKey, TenantId,
    };
    use strum::IntoEnumIterator;
    use test_case::test_case;

    #[test_case(true, true, false, None, Iso3166TwoDigitCountryCode::iter().collect(); "allow international, any country acceptable")]
    #[test_case(false, false, false, Some(vec![Iso3166TwoDigitCountryCode::MX]), vec![Iso3166TwoDigitCountryCode::MX]; "obc has restrictions")]
    #[test_case(true, true, false, Some(vec![Iso3166TwoDigitCountryCode::MX]), vec![Iso3166TwoDigitCountryCode::MX, Iso3166TwoDigitCountryCode::US]; "obc has restrictions and allow us")]
    #[test_case(false, true, false,  None, vec![Iso3166TwoDigitCountryCode::US]; "obc doesn't allow international, only US")]
    #[test_case(false, true, true,  None, Iso3166TwoDigitCountryCode::all_codes_for_us_including_territories(); "obc is for territories + US")]
    #[test_case(true, false, false,  None, Iso3166TwoDigitCountryCode::all_international(); "obc is international without US")]
    fn test_ob_config_international_countries(
        allow_international: bool,
        allow_us_residents: bool,
        allow_us_territory_residents: bool,
        international_country_restrictions: Option<Vec<Iso3166TwoDigitCountryCode>>,
        expected_countries: Vec<Iso3166TwoDigitCountryCode>,
    ) {
        let obc = ObConfiguration {
            id: ObConfigurationId::from_str("1234").unwrap(),
            key: ObConfigurationKey::from_str("obk1").unwrap(),
            name: "obc".into(),
            tenant_id: TenantId::from_str("t_1234").unwrap(),
            _created_at: Utc::now(),
            _updated_at: Utc::now(),
            is_live: true,
            status: ApiKeyStatus::Enabled,
            created_at: Utc::now(),
            must_collect_data: vec![],
            can_access_data: vec![],
            appearance_id: None,
            cip_kind: None,
            optional_data: vec![],
            is_no_phone_flow: false,
            is_doc_first: false,
            allow_international_residents: allow_international,
            international_country_restrictions,
            author: None,
            skip_kyc: false,
            doc_scan_for_optional_ssn: None,
            enhanced_aml: EnhancedAmlOption::No,
            allow_us_residents,
            allow_us_territory_residents,
        };

        assert_have_same_elements(
            obc.supported_countries_for_residential_address(),
            expected_countries,
        )
    }

    fn obc_with_doc_cdo(
        allow_international: bool,
        international_country_restrictions: Option<Vec<Iso3166TwoDigitCountryCode>>,
        doc_cdo: &str,
    ) -> ObConfiguration {
        ObConfiguration {
            id: ObConfigurationId::from_str("1234").unwrap(),
            key: ObConfigurationKey::from_str("obk1").unwrap(),
            name: "obc".into(),
            tenant_id: TenantId::from_str("t_1234").unwrap(),
            _created_at: Utc::now(),
            _updated_at: Utc::now(),
            is_live: true,
            status: ApiKeyStatus::Enabled,
            created_at: Utc::now(),
            must_collect_data: vec![CollectedDataOption::Document(
                DocumentCdoInfo::from_str(doc_cdo).unwrap(),
            )],
            can_access_data: vec![],
            appearance_id: None,
            cip_kind: None,
            optional_data: vec![],
            is_no_phone_flow: false,
            is_doc_first: false,
            allow_international_residents: allow_international,
            international_country_restrictions,
            author: None,
            skip_kyc: false,
            doc_scan_for_optional_ssn: None,
            enhanced_aml: EnhancedAmlOption::No,
            allow_us_residents: true,
            allow_us_territory_residents: false,
        }
    }

    #[test_case(None)]
    #[test_case(Some(Iso3166TwoDigitCountryCode::US))]
    fn test_supported_country_mapping_us_only(residential_country: Option<Iso3166TwoDigitCountryCode>) {
        // We don't allow international
        //
        // We expect by default to return US with the indicated doc types
        //  every other country with just passport
        let obc = obc_with_doc_cdo(
            false,
            None,
            "document.drivers_license,passport,id_card.none.require_selfie",
        );

        let mapping = obc.supported_country_mapping_for_document(residential_country);

        // US has the 3 documents indicated
        assert_eq!(
            mapping.get(&Iso3166TwoDigitCountryCode::US).cloned().unwrap(),
            vec![IdDocKind::DriversLicense, IdDocKind::Passport, IdDocKind::IdCard]
        );
        // we also allow a passport from any country
        Iso3166TwoDigitCountryCode::iter()
            .filter(|c| !c.is_us_including_territories())
            .for_each(|c| assert_eq!(mapping.get(&c).cloned().unwrap(), vec![IdDocKind::Passport]))
    }

    #[test_case(None, None)]
    #[test_case(Some(Iso3166TwoDigitCountryCode::US), None)]
    #[test_case(Some(Iso3166TwoDigitCountryCode::MX), None)]
    #[test_case(Some(Iso3166TwoDigitCountryCode::NO), None)]
    #[test_case(None, Some(vec![
        Iso3166TwoDigitCountryCode::US,
        Iso3166TwoDigitCountryCode::MX,
        Iso3166TwoDigitCountryCode::NO,
    ]))]
    #[test_case(Some(Iso3166TwoDigitCountryCode::US), Some(vec![
        Iso3166TwoDigitCountryCode::US,
        Iso3166TwoDigitCountryCode::MX,
        Iso3166TwoDigitCountryCode::NO,
    ]))]
    #[test_case(Some(Iso3166TwoDigitCountryCode::MX), Some(vec![
        Iso3166TwoDigitCountryCode::US,
        Iso3166TwoDigitCountryCode::MX,
        Iso3166TwoDigitCountryCode::NO,
    ]))]
    #[test_case(Some(Iso3166TwoDigitCountryCode::NO), Some(vec![
        Iso3166TwoDigitCountryCode::US,
        Iso3166TwoDigitCountryCode::MX,
        Iso3166TwoDigitCountryCode::NO,
    ]))]
    fn test_supported_country_mapping_allow_international(
        residential_country: Option<Iso3166TwoDigitCountryCode>,
        international_country_restrictions: Option<Vec<Iso3166TwoDigitCountryCode>>,
    ) {
        // In this test we allow international, and therefore need to handle residential addresses that are non-US.
        // - in the case we get an international residential address, we only accept passport.
        // - in the case we get a US residential address, we allow DL + passport
        //
        // Note: international country restrictions do not affect the countries you can submit a passport for, this just controls
        // residential address - there are integration tests testing this part
        let obc = obc_with_doc_cdo(
            true,
            international_country_restrictions,
            "document.drivers_license,passport.none.require_selfie",
        );

        let mapping = obc.supported_country_mapping_for_document(residential_country);

        match residential_country.map(|c| c.is_us_including_territories()) {
            // country provided
            Some(is_us) => {
                // residential country is the us, we get DL + ppt
                if is_us {
                    assert_eq!(
                        mapping.get(&Iso3166TwoDigitCountryCode::US).cloned().unwrap(),
                        vec![IdDocKind::DriversLicense, IdDocKind::Passport]
                    );
                } else {
                    // country is !US, we only can submit US passports
                    assert_eq!(
                        mapping.get(&Iso3166TwoDigitCountryCode::US).cloned().unwrap(),
                        vec![IdDocKind::Passport]
                    );
                }
            }
            // default case where no country yet, US supports all doc types it can
            None => {
                assert_eq!(
                    mapping.get(&Iso3166TwoDigitCountryCode::US).cloned().unwrap(),
                    vec![IdDocKind::DriversLicense, IdDocKind::Passport]
                );
            }
        }

        // in all cases, non-US can just upload passport
        Iso3166TwoDigitCountryCode::iter()
            .filter(|c| !c.is_us_including_territories())
            .for_each(|c| assert_eq!(mapping.get(&c).cloned().unwrap(), vec![IdDocKind::Passport]))
    }

    #[test_case(Some("document.passport.none.none") => Some(vec![IdDocKind::Passport]))]
    #[test_case(Some("document.passport,drivers_license.none.none") => Some(vec![IdDocKind::Passport, IdDocKind::DriversLicense]))]
    #[test_case(None => None)]
    #[test_case(Some("full_address") => None)] // obc will fail when getting created anyways
    fn test_doc_scan_for_optional_ssn(cdo: Option<&str>) -> Option<Vec<IdDocKind>> {
        let obc = ObConfiguration {
            id: ObConfigurationId::from_str("1234").unwrap(),
            key: ObConfigurationKey::from_str("obk1").unwrap(),
            name: "obc".into(),
            tenant_id: TenantId::from_str("t_1234").unwrap(),
            _created_at: Utc::now(),
            _updated_at: Utc::now(),
            is_live: true,
            status: ApiKeyStatus::Enabled,
            created_at: Utc::now(),
            must_collect_data: vec![],
            can_access_data: vec![],
            appearance_id: None,
            cip_kind: None,
            optional_data: vec![],
            is_no_phone_flow: false,
            is_doc_first: false,
            allow_international_residents: false,
            international_country_restrictions: None,
            author: None,
            skip_kyc: false,
            doc_scan_for_optional_ssn: cdo.map(|c| (CollectedDataOption::from_str(c).unwrap())),
            enhanced_aml: EnhancedAmlOption::No,
            allow_us_residents: true,
            allow_us_territory_residents: false,
        };

        obc.optional_ssn_restricted_id_doc_kinds()
    }
}
