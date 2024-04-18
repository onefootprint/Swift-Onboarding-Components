use super::{rule_set_version::RuleSetVersion, tenant::Tenant, workflow::Workflow};
use crate::{
    actor, actor::SaturatedActor, DbError, DbResult, NextPage, NonNullVec, OffsetPagination,
    OptionalNonNullVec, PgConn, TxnPgConn,
};
use chrono::{DateTime, Utc};
use db_schema::schema::{ob_configuration, ob_configuration::BoxedQuery, tenant};
use diesel::{pg::Pg, prelude::*, Insertable, Queryable};
use itertools::Itertools;
use newtypes::{
    ApiKeyStatus, AppearanceId, AuthMethodKind, CipKind, CollectedDataOption as CDO,
    DataIdentifierDiscriminant, DbActor, DocumentAndCountryConfiguration, DocumentCdoInfo,
    DocumentRequestConfig, EnhancedAmlOption, IdDocKind, Iso3166TwoDigitCountryCode, Locked,
    ObConfigurationId, ObConfigurationKey, ObConfigurationKind, ScopedVaultId,
    SupportedDocumentAndCountryMappingForBifrost, TenantId, WorkflowId,
};
use std::collections::HashMap;
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
    #[diesel(deserialize_as = NonNullVec<CDO>)]
    pub must_collect_data: Vec<CDO>,
    #[diesel(deserialize_as = NonNullVec<CDO>)]
    pub can_access_data: Vec<CDO>,
    pub appearance_id: Option<AppearanceId>,
    pub cip_kind: Option<CipKind>,
    #[diesel(deserialize_as = NonNullVec<CDO>)]
    pub optional_data: Vec<CDO>,
    // DO NOT REORDER THESE FIELDS
    pub is_no_phone_flow: bool,
    pub is_doc_first: bool,
    pub allow_international_residents: bool,
    #[diesel(deserialize_as = OptionalNonNullVec<Iso3166TwoDigitCountryCode>)]
    pub international_country_restrictions: Option<Vec<Iso3166TwoDigitCountryCode>>,
    pub author: Option<DbActor>,
    pub skip_kyc: bool,
    pub doc_scan_for_optional_ssn: Option<CDO>,
    pub enhanced_aml: EnhancedAmlOption,
    pub allow_us_residents: bool,
    pub allow_us_territory_residents: bool,
    pub kind: ObConfigurationKind,
    /// When true on a KYB playbook, just collect business info without sending to vendors
    pub skip_kyb: bool,
    /// When true on a KYC or KYB playbook, allows skipping confirm screen.
    /// Will still collect all data if it's missing, but skips confirm.
    pub skip_confirm: bool,
    pub document_types_and_countries: Option<DocumentAndCountryConfiguration>,
    pub curp_validation_enabled: bool,
    /// The list of additional non-identity documents to be collected by this playbook.
    /// Identity documents are still unfortunately specified in CDOs. We could migrate them
    /// to this field in the future.
    #[diesel(deserialize_as = OptionalNonNullVec<DocumentRequestConfig>)]
    pub documents_to_collect: Option<Vec<DocumentRequestConfig>>,
}


impl ObConfiguration {
    // returns a map of country -> supported document types
    pub fn supported_country_mapping_for_document(
        &self,
        residential_country: Option<Iso3166TwoDigitCountryCode>,
    ) -> SupportedDocumentAndCountryMappingForBifrost {
        if let Some(cip) = self.cip_kind.as_ref() {
            match cip {
                CipKind::Alpaca => {
                    // In the general case, we need to accept a document that might have address
                    let alpaca_doc_types = vec![IdDocKind::DriversLicense, IdDocKind::IdCard];
                    // Alpaca supports territories: https://www.notion.so/onefootprint/Alpaca-US-Territory-31c04ec7d2b64cc5ad9cbbde0c026af2?pvs=4
                    // Allow docs from 1) the US or 2) from the territory the person said they were living in
                    let alpaca_allowed_countries: Vec<Iso3166TwoDigitCountryCode> = vec![
                        Some(Iso3166TwoDigitCountryCode::US),
                        residential_country.and_then(|c| c.is_us_territory().then_some(c)),
                    ]
                    .into_iter()
                    .flatten()
                    .collect();

                    return SupportedDocumentAndCountryMappingForBifrost(HashMap::from_iter(
                        alpaca_allowed_countries
                            .into_iter()
                            .map(|c| (c, alpaca_doc_types.clone())),
                    ));
                }
                CipKind::Apex => todo!(),
            }
        }

        // Now check if it's on the OBC itself
        if let Some(ref mapping) = self.document_types_and_countries {
            let out = mapping.into_country_mapping_for_bifrost();
            if !out.is_empty() {
                return out;
            }
        }

        // Otherwise old logic
        let id_doc_kinds = if let Some(kinds) = self
            .restricted_id_doc_kinds()
            .or(self.optional_ssn_restricted_id_doc_kinds())
        // we'll only ever have 1 of these, we prevent OBCs from being created with doc AND optional SSN doc stepup
        {
            kinds
        } else {
            IdDocKind::identity_docs()
        };

        let doc_country_mapping_helper = self.get_supported_country_struct();

        // For each id doc kind configured, compute which countries we support
        let countries_and_doc_types: Vec<(Iso3166TwoDigitCountryCode, IdDocKind)> = id_doc_kinds
            .into_iter()
            .flat_map(|doc_type| {
                let out: Vec<(Iso3166TwoDigitCountryCode, IdDocKind)> = doc_country_mapping_helper
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
                    && !doc_country_mapping_helper.is_override()
                {
                    acc
                } else {
                    acc.entry(country).or_default().push(doc_type);
                    acc
                }
            });

        SupportedDocumentAndCountryMappingForBifrost(map)
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
    fn get_supported_country_struct(&self) -> Box<dyn SupportedCountriesForDocType> {
        if self.tenant_id.is_findigs() {
            Box::new(Findigs)
        } else if self.tenant_id.is_coba() {
            Box::new(Coba)
        } else {
            Box::new(Default)
        }
    }

    pub fn supported_countries_and_doc_types_for_proof_of_ssn(
        &self,
    ) -> SupportedDocumentAndCountryMappingForBifrost {
        SupportedDocumentAndCountryMappingForBifrost(HashMap::from_iter(vec![(
            Iso3166TwoDigitCountryCode::US,
            vec![IdDocKind::SsnCard],
        )]))
    }

    pub fn supported_countries_and_doc_types_for_proof_of_address(
        &self,
        country: Option<Iso3166TwoDigitCountryCode>,
    ) -> SupportedDocumentAndCountryMappingForBifrost {
        SupportedDocumentAndCountryMappingForBifrost(HashMap::from_iter(vec![(
            country.unwrap_or(Iso3166TwoDigitCountryCode::US),
            IdDocKind::proof_of_address_docs(),
        )]))
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

    // Dumb temporary hack since we use Alpaca Cipkind in some pytets but aren't stricly enforcing that 'if alpaca then enhanced aml'
    pub fn enhanced_aml(&self) -> EnhancedAmlOption {
        if matches!(self.cip_kind, Some(CipKind::Alpaca))
            && matches!(self.enhanced_aml, EnhancedAmlOption::No)
        {
            EnhancedAmlOption::Yes {
                ofac: true,
                pep: true,
                adverse_media: true,
                continuous_monitoring: true,
                adverse_media_lists: None,
            }
        } else {
            self.enhanced_aml.clone()
        }
    }

    pub fn is_stepup_enabled(&self) -> bool {
        matches!(self.cip_kind, Some(CipKind::Alpaca))
    }
}

trait SupportedCountriesForDocType {
    fn supported_countries_for_doc_type(&self, doc_type: IdDocKind) -> Vec<Iso3166TwoDigitCountryCode>;
    fn is_override(&self) -> bool;
}
struct Findigs;
impl SupportedCountriesForDocType for Findigs {
    fn supported_countries_for_doc_type(&self, doc_type: IdDocKind) -> Vec<Iso3166TwoDigitCountryCode> {
        match doc_type {
            IdDocKind::IdCard => Iso3166TwoDigitCountryCode::iter().collect(),
            IdDocKind::DriversLicense => Iso3166TwoDigitCountryCode::iter().collect(),
            IdDocKind::Passport => Iso3166TwoDigitCountryCode::iter().collect(),
            IdDocKind::PassportCard => Iso3166TwoDigitCountryCode::iter().collect(),
            IdDocKind::Permit => vec![Iso3166TwoDigitCountryCode::US],
            IdDocKind::Visa => Iso3166TwoDigitCountryCode::iter().collect(),
            IdDocKind::ResidenceDocument => vec![Iso3166TwoDigitCountryCode::US],
            IdDocKind::VoterIdentification => vec![],
            IdDocKind::SsnCard => vec![],
            IdDocKind::ProofOfAddress => vec![],
            IdDocKind::Custom => vec![],
        }
    }

    fn is_override(&self) -> bool {
        true
    }
}
struct Coba;
impl SupportedCountriesForDocType for Coba {
    fn supported_countries_for_doc_type(&self, doc_type: IdDocKind) -> Vec<Iso3166TwoDigitCountryCode> {
        match doc_type {
            IdDocKind::IdCard => vec![Iso3166TwoDigitCountryCode::MX],
            IdDocKind::DriversLicense => vec![Iso3166TwoDigitCountryCode::MX],
            IdDocKind::Passport => Iso3166TwoDigitCountryCode::iter().collect(),
            IdDocKind::PassportCard => Iso3166TwoDigitCountryCode::iter().collect(),
            IdDocKind::Permit => vec![Iso3166TwoDigitCountryCode::MX],
            IdDocKind::Visa => vec![Iso3166TwoDigitCountryCode::MX],
            IdDocKind::ResidenceDocument => vec![Iso3166TwoDigitCountryCode::MX],
            IdDocKind::VoterIdentification => vec![Iso3166TwoDigitCountryCode::MX],
            IdDocKind::SsnCard => vec![],
            IdDocKind::ProofOfAddress => vec![],
            IdDocKind::Custom => vec![],
        }
    }

    fn is_override(&self) -> bool {
        true
    }
}
struct Default;
impl SupportedCountriesForDocType for Default {
    fn supported_countries_for_doc_type(&self, doc_type: IdDocKind) -> Vec<Iso3166TwoDigitCountryCode> {
        let all_us_and_territories = Iso3166TwoDigitCountryCode::all_codes_for_us_including_territories();
        match doc_type {
            IdDocKind::IdCard => all_us_and_territories,
            IdDocKind::DriversLicense => all_us_and_territories,
            IdDocKind::Passport => Iso3166TwoDigitCountryCode::iter().collect(),
            IdDocKind::PassportCard => Iso3166TwoDigitCountryCode::iter().collect(),
            IdDocKind::Permit => all_us_and_territories,
            IdDocKind::Visa => all_us_and_territories,
            IdDocKind::ResidenceDocument => all_us_and_territories,
            IdDocKind::VoterIdentification => all_us_and_territories,
            IdDocKind::SsnCard => vec![],
            IdDocKind::ProofOfAddress => vec![],
            IdDocKind::Custom => vec![],
        }
    }

    fn is_override(&self) -> bool {
        false
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
    allow_us_residents: bool,
    allow_us_territory_residents: bool,
    kind: ObConfigurationKind,
    skip_kyb: bool,
    skip_confirm: bool,
    document_types_and_countries: Option<DocumentAndCountryConfiguration>,
    curp_validation_enabled: bool,
    documents_to_collect: Vec<DocumentRequestConfig>,
}

#[derive(Debug, derive_more::From)]
pub enum ObConfigIdentifier<'a> {
    Id(&'a ObConfigurationId),
    Key(&'a ObConfigurationKey),
    Tenant {
        id: &'a ObConfigurationId,
        tenant_id: &'a TenantId,
        is_live: bool,
    },
    TenantKey {
        key: &'a ObConfigurationKey,
        tenant_id: &'a TenantId,
        is_live: bool,
    },
    Workflow(&'a WorkflowId),
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
    pub kinds: Option<Vec<ObConfigurationKind>>,
}

pub type ObConfigInfo = (ObConfiguration, Option<SaturatedActor>, Option<RuleSetVersion>);

pub type TenantObConfigCounts = HashMap<TenantId, i64>;

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
        if let Some(kinds) = filters.kinds.as_ref() {
            query = query.filter(ob_configuration::kind.eq_any(kinds));
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
        let obc_ids = results.iter().map(|obc| &obc.id).collect();
        let mut rule_sets = RuleSetVersion::bulk_get_active(conn, obc_ids)?;
        let results = actor::saturate_actors_nullable(conn, results)?;
        let results = results
            .into_iter()
            .map(|(obc, actor)| {
                let rs = rule_sets.remove(&obc.id);
                (obc, actor, rs)
            })
            .collect();

        Ok(pagination.results(results))
    }

    #[tracing::instrument("ObConfiguration::count", skip_all)]
    pub fn count(conn: &mut PgConn, query: &ObConfigurationQuery) -> DbResult<i64> {
        let count = Self::list_query(query).count().get_result(conn)?;
        Ok(count)
    }

    pub fn count_bulk(
        conn: &mut PgConn,
        tenant_ids: Vec<&TenantId>,
        is_live: bool,
    ) -> DbResult<TenantObConfigCounts> {
        let counts: Vec<_> = ob_configuration::table
            .filter(ob_configuration::is_live.eq(is_live))
            .filter(ob_configuration::tenant_id.eq_any(&tenant_ids))
            .group_by(ob_configuration::tenant_id)
            .select((
                ob_configuration::tenant_id,
                diesel::dsl::count(ob_configuration::id),
            ))
            .load(conn)?;

        Ok(counts.into_iter().collect())
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
            ObConfigIdentifier::TenantKey {
                key,
                tenant_id,
                is_live,
            } => {
                query = query
                    .filter(ob_configuration::key.eq(key))
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

    #[tracing::instrument("ObConfiguration::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, obc_id: &ObConfigurationId) -> DbResult<Locked<Self>> {
        let result = ob_configuration::table
            .filter(ob_configuration::id.eq(obc_id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }

    #[tracing::instrument("ObConfiguration::get_bulk", skip_all)]
    pub fn get_bulk(
        conn: &mut PgConn,
        ids: Vec<ObConfigurationId>,
    ) -> DbResult<HashMap<ObConfigurationId, Self>> {
        let results = ob_configuration::table
            .filter(ob_configuration::id.eq_any(ids))
            .get_results::<Self>(conn)?
            .into_iter()
            .map(|obc| (obc.id.clone(), obc))
            .collect();

        Ok(results)
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
        kind: ObConfigurationKind,
        skip_kyb: bool,
        skip_confirm: bool,
        document_types_and_countries: Option<DocumentAndCountryConfiguration>,
        documents_to_collect: Vec<DocumentRequestConfig>,
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
            kind,
            skip_kyb,
            skip_confirm,
            document_types_and_countries,
            curp_validation_enabled: false,
            documents_to_collect,
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

    #[tracing::instrument("ObConfiguration::get_enhanced_aml_obc_for_sv", skip_all)]
    pub fn get_enhanced_aml_obc_for_sv(conn: &mut PgConn, sv_id: &ScopedVaultId) -> DbResult<Option<Self>> {
        // Get OBC for this scoped vault. This is a little funky now because you can theoretically onboard only multiple Workflow's and each could have a different OBC
        // For now, we take the first completed WF by completed_at where enhanced_aml = Yes. If none of the WF's have enhanced AML, then we just take the first OBC.
        let wfs = Workflow::list_by_completed_at(conn, sv_id)?;
        let obc = if let Some((_, obc)) = wfs.iter().find(|(_, obc)| {
            obc.as_ref()
                .map(|o| {
                    matches!(
                        &o.enhanced_aml,
                        EnhancedAmlOption::Yes {
                            ofac: _,
                            pep: _,
                            adverse_media: _,
                            continuous_monitoring: _,
                            adverse_media_lists: _
                        }
                    )
                })
                .unwrap_or(false)
        }) {
            obc.clone()
        } else {
            wfs.first().and_then(|(_, obc)| obc.clone())
        };
        Ok(obc)
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

    /// Returns the list of auth methods that are required to be registered by this playbook, if any
    pub fn required_auth_methods(&self) -> Option<Vec<AuthMethodKind>> {
        match self.kind {
            // Auth and Document playbooks don't (yet) have an opinion on which login method is used
            ObConfigurationKind::Auth | ObConfigurationKind::Document => None,
            ObConfigurationKind::Kyc | ObConfigurationKind::Kyb => Some(if self.is_no_phone_flow {
                vec![AuthMethodKind::Email]
            } else {
                vec![AuthMethodKind::Phone]
            }),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::ObConfiguration;
    use crate::{
        diesel::RunQueryDsl,
        test_helpers::assert_have_same_elements,
        tests::{fixtures, fixtures::ob_configuration::ObConfigurationOpts, prelude::*},
    };
    use chrono::Utc;
    use macros::db_test;
    use newtypes::{
        AdverseMediaListKind, ApiKeyStatus, CipKind, CollectedDataOption, CountrySpecificDocumentMapping,
        DocumentAndCountryConfiguration, DocumentCdoInfo, EnhancedAmlOption, IdDocKind,
        Iso3166TwoDigitCountryCode, ObConfigurationId, ObConfigurationKey, ObConfigurationKind, TenantId,
    };
    use std::{collections::HashMap, str::FromStr};
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
            kind: ObConfigurationKind::Kyc,
            skip_kyb: false,
            skip_confirm: false,
            document_types_and_countries: None,
            curp_validation_enabled: false,
            documents_to_collect: None,
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
        tenant_id: Option<&str>,
    ) -> ObConfiguration {
        ObConfiguration {
            id: ObConfigurationId::from_str("1234").unwrap(),
            key: ObConfigurationKey::from_str("obk1").unwrap(),
            name: "obc".into(),
            tenant_id: TenantId::from_str(tenant_id.unwrap_or("t_1234")).unwrap(),
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
            kind: ObConfigurationKind::Kyc,
            skip_kyb: false,
            skip_confirm: false,
            document_types_and_countries: None,
            curp_validation_enabled: false,
            documents_to_collect: None,
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
            None,
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

    #[test]
    fn test_supported_country_mapping_override_for_coba() {
        let obc = obc_with_doc_cdo(
            false,
            None,
            "document.drivers_license,passport,voter_identification.none.require_selfie",
            Some("org_5lwSs95mU5v3gOU9xdSaml"),
        );

        Iso3166TwoDigitCountryCode::iter()
            .filter(|c| *c != Iso3166TwoDigitCountryCode::MX)
            .for_each(|c| {
                let supported = obc.supported_country_mapping_for_document(Some(c));
                assert_eq!(supported.get(&c).cloned().unwrap(), vec![IdDocKind::Passport])
            });

        let supported = obc.supported_country_mapping_for_document(Some(Iso3166TwoDigitCountryCode::MX));
        assert_have_same_elements(
            supported.get(&Iso3166TwoDigitCountryCode::MX).cloned().unwrap(),
            vec![
                IdDocKind::Passport,
                IdDocKind::DriversLicense,
                IdDocKind::VoterIdentification,
            ],
        );
        // Second form of ID: Mexican Resident Card
        let obc = obc_with_doc_cdo(
            false,
            None,
            "document.residence_document.none.require_selfie",
            Some("org_5lwSs95mU5v3gOU9xdSaml"),
        );

        let all_supported = obc.supported_country_mapping_for_document(None);
        assert_eq!(all_supported.keys().len(), 1);
        assert_have_same_elements(
            all_supported
                .get(&Iso3166TwoDigitCountryCode::MX)
                .cloned()
                .unwrap(),
            vec![IdDocKind::ResidenceDocument],
        );

        let supported = obc.supported_country_mapping_for_document(Some(Iso3166TwoDigitCountryCode::MX));
        assert_have_same_elements(
            supported.get(&Iso3166TwoDigitCountryCode::MX).cloned().unwrap(),
            vec![IdDocKind::ResidenceDocument],
        );

        // Second form of ID: Any additional document (voters ID, drivers license, etc)
        let obc = obc_with_doc_cdo(
            false,
            None,
            "document.drivers_license,voter_identification,visa,id_card,residence_document.none.require_selfie",
            Some("org_5lwSs95mU5v3gOU9xdSaml"),
        );

        let all_supported = obc.supported_country_mapping_for_document(None);
        assert_eq!(all_supported.keys().len(), 1);
        assert_have_same_elements(
            all_supported
                .get(&Iso3166TwoDigitCountryCode::MX)
                .cloned()
                .unwrap(),
            vec![
                IdDocKind::ResidenceDocument,
                IdDocKind::DriversLicense,
                IdDocKind::Visa,
                IdDocKind::VoterIdentification,
                IdDocKind::IdCard,
            ],
        );

        let supported = obc.supported_country_mapping_for_document(Some(Iso3166TwoDigitCountryCode::MX));
        assert_have_same_elements(
            supported.get(&Iso3166TwoDigitCountryCode::MX).cloned().unwrap(),
            vec![
                IdDocKind::ResidenceDocument,
                IdDocKind::DriversLicense,
                IdDocKind::Visa,
                IdDocKind::VoterIdentification,
                IdDocKind::IdCard,
            ],
        );

        // Second form of ID: Driver's license
        let obc = obc_with_doc_cdo(
            false,
            None,
            "document.drivers_license.none.require_selfie",
            Some("org_5lwSs95mU5v3gOU9xdSaml"),
        );

        let all_supported = obc.supported_country_mapping_for_document(None);
        assert_eq!(all_supported.keys().len(), 1);
        assert_have_same_elements(
            all_supported
                .get(&Iso3166TwoDigitCountryCode::MX)
                .cloned()
                .unwrap(),
            vec![IdDocKind::DriversLicense],
        );

        let supported = obc.supported_country_mapping_for_document(Some(Iso3166TwoDigitCountryCode::MX));
        assert_have_same_elements(
            supported.get(&Iso3166TwoDigitCountryCode::MX).cloned().unwrap(),
            vec![IdDocKind::DriversLicense],
        )
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
            None,
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
            kind: ObConfigurationKind::Kyc,
            skip_kyb: false,
            skip_confirm: false,
            document_types_and_countries: None,
            curp_validation_enabled: false,
            documents_to_collect: None,
        };

        obc.optional_ssn_restricted_id_doc_kinds()
    }

    #[test_case(None, None)]
    #[test_case(None, Some(Iso3166TwoDigitCountryCode::US))]
    #[test_case(Some(CipKind::Alpaca), Some(Iso3166TwoDigitCountryCode::US))]
    #[test_case(Some(CipKind::Alpaca), Some(Iso3166TwoDigitCountryCode::PR))]
    #[test_case(Some(CipKind::Alpaca), Some(Iso3166TwoDigitCountryCode::GU))]
    #[test_case(Some(CipKind::Alpaca), Some(Iso3166TwoDigitCountryCode::CA))]
    fn test_cip_kind_documents(
        cip: Option<CipKind>,
        residential_country: Option<Iso3166TwoDigitCountryCode>,
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
            // Testing this!!!
            cip_kind: cip,
            optional_data: vec![],
            is_no_phone_flow: false,
            is_doc_first: false,
            allow_international_residents: false,
            international_country_restrictions: None,
            author: None,
            skip_kyc: false,
            doc_scan_for_optional_ssn: None,
            enhanced_aml: EnhancedAmlOption::No,
            allow_us_residents: true,
            allow_us_territory_residents: false,
            kind: ObConfigurationKind::Kyc,
            skip_kyb: false,
            skip_confirm: false,
            document_types_and_countries: None,
            curp_validation_enabled: false,
            documents_to_collect: None,
        };

        let mapping = obc.supported_country_mapping_for_document(residential_country).0;
        if let Some(c) = cip {
            match c {
                CipKind::Alpaca => match residential_country {
                    Some(country) if country.is_us_territory() => {
                        assert!(mapping.keys().len() == 2);
                        assert_eq!(
                            mapping.get(&Iso3166TwoDigitCountryCode::US).unwrap().clone(),
                            vec![IdDocKind::DriversLicense, IdDocKind::IdCard,]
                        );
                        assert_eq!(
                            mapping.get(&country).unwrap().clone(),
                            vec![IdDocKind::DriversLicense, IdDocKind::IdCard,]
                        );
                    }
                    Some(_) => {
                        assert!(mapping.keys().len() == 1);
                        assert_eq!(
                            mapping.get(&Iso3166TwoDigitCountryCode::US).unwrap().clone(),
                            vec![IdDocKind::DriversLicense, IdDocKind::IdCard,]
                        );
                    }
                    None => {
                        assert!(mapping.keys().len() == 1);
                        assert_eq!(
                            mapping.get(&Iso3166TwoDigitCountryCode::US).unwrap().clone(),
                            vec![IdDocKind::DriversLicense, IdDocKind::IdCard,]
                        );
                    }
                },
                CipKind::Apex => unimplemented!(),
            }
        } else {
            assert!(mapping.keys().len() > 1);
        }
    }

    #[test]
    fn test_document_types_and_countries() {
        let supported = CountrySpecificDocumentMapping(HashMap::from_iter(vec![(
            Iso3166TwoDigitCountryCode::CA,
            vec![IdDocKind::DriversLicense],
        )]));
        let doc_config = DocumentAndCountryConfiguration {
            global: vec![],
            country_specific: supported,
        };
        let obc_with_supported_countries_set = ObConfiguration {
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
            doc_scan_for_optional_ssn: None,
            enhanced_aml: EnhancedAmlOption::No,
            allow_us_residents: true,
            allow_us_territory_residents: false,
            kind: ObConfigurationKind::Kyc,
            skip_kyb: false,
            skip_confirm: false,
            // TESTING THIS
            document_types_and_countries: Some(doc_config),
            curp_validation_enabled: false,
            documents_to_collect: None,
        };

        let mapping = obc_with_supported_countries_set
            .supported_country_mapping_for_document(None)
            .0;
        assert_eq!(mapping.keys().len(), 1);
        assert_eq!(
            mapping.get(&Iso3166TwoDigitCountryCode::CA).unwrap().clone(),
            vec![IdDocKind::DriversLicense]
        );
    }

    #[test]
    fn test_document_and_countries_field_with_cip_kind() {
        let supported = CountrySpecificDocumentMapping(HashMap::from_iter(vec![(
            Iso3166TwoDigitCountryCode::PR,
            vec![IdDocKind::Visa],
        )]));
        let doc_config = DocumentAndCountryConfiguration {
            global: vec![],
            country_specific: supported,
        };
        let obc_with_supported_countries_and_cip_kind = ObConfiguration {
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
            // TESTING THIS
            cip_kind: Some(CipKind::Alpaca),
            optional_data: vec![],
            is_no_phone_flow: false,
            is_doc_first: false,
            allow_international_residents: false,
            international_country_restrictions: None,
            author: None,
            skip_kyc: false,
            doc_scan_for_optional_ssn: None,
            enhanced_aml: EnhancedAmlOption::No,
            allow_us_residents: true,
            allow_us_territory_residents: false,
            kind: ObConfigurationKind::Kyc,
            skip_kyb: false,
            skip_confirm: false,
            // TESTING THIS
            document_types_and_countries: Some(doc_config),
            curp_validation_enabled: false,
            documents_to_collect: None,
        };

        // Despite configuring document_types_and_countries on the OBC, we respect the alpaca overrides
        let mapping = obc_with_supported_countries_and_cip_kind
            .supported_country_mapping_for_document(Some(Iso3166TwoDigitCountryCode::PR))
            .0;
        assert_eq!(mapping.keys().len(), 2);
        // we respect alpaca overrides
        assert_eq!(
            mapping.get(&Iso3166TwoDigitCountryCode::PR).unwrap().clone(),
            vec![IdDocKind::DriversLicense, IdDocKind::IdCard]
        );
    }

    #[db_test]
    pub fn test_enhanced_aml_addition_of_am_lists_is_backwards_compatible(conn: &mut TestPgConn) {
        let t = fixtures::tenant::create(conn);
        let obc = fixtures::ob_configuration::create(conn, &t.id, true);
        assert_eq!(obc.enhanced_aml, EnhancedAmlOption::No);
        diesel::sql_query(format!(
            "update ob_configuration set enhanced_aml={} where id = '{}';",
            r#"'{"data": {"pep": false, "ofac": true, "adverse_media": true, "continuous_monitoring": true}, "kind": "yes"}'"#, obc.id
        ))
        .execute(conn.conn())
        .unwrap();
        let (obc, _) = ObConfiguration::get(conn, &obc.id).unwrap();
        assert_eq!(
            EnhancedAmlOption::Yes {
                ofac: true,
                pep: false,
                adverse_media: true,
                continuous_monitoring: true,
                adverse_media_lists: None
            },
            obc.enhanced_aml
        );

        let enhanced_aml = EnhancedAmlOption::Yes {
            ofac: true,
            pep: false,
            adverse_media: true,
            continuous_monitoring: true,
            adverse_media_lists: Some(vec![
                AdverseMediaListKind::FinancialCrime,
                AdverseMediaListKind::Fraud,
            ]),
        };
        let obc = fixtures::ob_configuration::create_with_opts(
            conn,
            &t.id,
            ObConfigurationOpts {
                enhanced_aml: enhanced_aml.clone(),
                ..Default::default()
            },
        );
        assert_eq!(enhanced_aml, obc.enhanced_aml);

        // since im gunna manually set this in PG for Composer, nice to explicitly test here too
        diesel::sql_query(format!(
            "update ob_configuration set enhanced_aml={} where id = '{}';",
            r#"'{"data": {"pep": false, "ofac": true, "adverse_media": true, "continuous_monitoring": true, "adverse_media_lists": ["financial_crime", "fraud"]}, "kind": "yes"}'"#, obc.id
        ))
        .execute(conn.conn())
        .unwrap();
        let (obc, _) = ObConfiguration::get(conn, &obc.id).unwrap();
        assert_eq!(
            EnhancedAmlOption::Yes {
                ofac: true,
                pep: false,
                adverse_media: true,
                continuous_monitoring: true,
                adverse_media_lists: Some(vec![
                    AdverseMediaListKind::FinancialCrime,
                    AdverseMediaListKind::Fraud,
                ]),
            },
            obc.enhanced_aml
        );
    }


    #[db_test]
    pub fn test_document_and_countries_roundtrip(conn: &mut TestPgConn) {
        let t = fixtures::tenant::create(conn);
        let supported = CountrySpecificDocumentMapping(HashMap::from_iter(vec![
            (Iso3166TwoDigitCountryCode::CA, vec![IdDocKind::DriversLicense]),
            (Iso3166TwoDigitCountryCode::MX, vec![IdDocKind::DriversLicense]),
        ]));
        let document_types_and_countries = Some(DocumentAndCountryConfiguration {
            global: vec![IdDocKind::Passport],
            country_specific: supported,
        });

        let opts = ObConfigurationOpts {
            document_types_and_countries: document_types_and_countries.clone(),
            ..Default::default()
        };
        let obc = fixtures::ob_configuration::create_with_opts(conn, &t.id, opts);

        let (obc, _) = ObConfiguration::get(conn, &obc.id).unwrap();
        assert_eq!(document_types_and_countries, obc.document_types_and_countries)
    }
}
