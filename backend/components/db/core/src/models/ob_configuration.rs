use super::rule_set_version::RuleSetVersion;
use super::tenant::Tenant;
use super::workflow::Workflow;
use crate::actor;
use crate::actor::SaturatedActor;
use crate::DbError;
use crate::DbResult;
use crate::NextPage;
use crate::NonNullVec;
use crate::OffsetPagination;
use crate::OptionalNonNullVec;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::ob_configuration;
use db_schema::schema::ob_configuration::BoxedQuery;
use db_schema::schema::tenant;
use diesel::pg::Pg;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use itertools::Itertools;
use newtypes::AdverseMediaListKind;
use newtypes::ApiKeyStatus;
use newtypes::AppearanceId;
use newtypes::AuthMethodKind;
use newtypes::CipKind;
use newtypes::CollectedDataOption as CDO;
use newtypes::DataIdentifierDiscriminant;
use newtypes::DbActor;
use newtypes::DocumentAndCountryConfiguration;
use newtypes::DocumentCdoInfo;
use newtypes::DocumentRequestConfig;
use newtypes::EnhancedAmlOption;
use newtypes::IdDocKind;
use newtypes::Iso3166TwoDigitCountryCode;
use newtypes::Locked;
use newtypes::ObConfigurationId;
use newtypes::ObConfigurationKey;
use newtypes::ObConfigurationKind;
use newtypes::ScopedVaultId;
use newtypes::SupportedDocumentAndCountryMappingForBifrost;
use newtypes::TenantId;
use newtypes::VerificationCheck;
use newtypes::VerificationCheckKind;
use newtypes::WorkflowId;
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
    pub doc_scan_for_optional_ssn: Option<CDO>,
    enhanced_aml: EnhancedAmlOption,
    pub allow_us_residents: bool,
    pub allow_us_territory_residents: bool,
    pub kind: ObConfigurationKind,
    // DEPRECATED: use verification checks
    /// When true on a KYB playbook, just collect business info without sending to vendors
    #[allow(unused)]
    skip_kyb: Option<bool>,
    /// When true on a KYC or KYB playbook, allows skipping confirm screen.
    /// Will still collect all data if it's missing, but skips confirm.
    pub skip_confirm: bool,
    pub document_types_and_countries: Option<DocumentAndCountryConfiguration>,
    pub curp_validation_enabled: bool,
    /// The list of additional non-identity documents to be collected by this playbook.
    /// Identity documents are still unfortunately specified in CDOs. We could migrate them
    /// to this field in the future.
    #[diesel(deserialize_as = OptionalNonNullVec<DocumentRequestConfig>)]
    // TODO make these non null?
    pub documents_to_collect: Option<Vec<DocumentRequestConfig>>,
    #[diesel(deserialize_as = OptionalNonNullVec<VerificationCheck>)]
    pub verification_checks: Option<Vec<VerificationCheck>>,
    #[diesel(deserialize_as = NonNullVec<DocumentRequestConfig>)]
    pub business_documents_to_collect: Vec<DocumentRequestConfig>,
    /// The list of auth methods that are required to satisfy this playbook, if any.
    /// NOTE: we have limited client support for this field, so it is not entirely operational.
    /// When null, no specific auth methods are required and any auth method is acceptable.
    #[diesel(deserialize_as = OptionalNonNullVec<AuthMethodKind>)]
    pub required_auth_methods: Option<Vec<AuthMethodKind>>,
    /// When true, will prompt for passkey registration during onboarding requirements.
    /// Passkey registration will always be skippable.
    pub prompt_for_passkey: bool,
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
        // we'll only ever have 1 of these, we prevent OBCs from being created with doc
        // AND optional SSN doc stepup
        {
            kinds
        } else {
            IdDocKind::iter().collect()
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
                // Don't allow non-passport if we are displaying possible document types for an international
                // residential address
                //   - This is the case _even if the person has a US document type that would have been
                //     supported had they been living in the US_
                //
                // For example:
                //  * OBC has DL, passport, id card configured
                //      * DL + id card are only possible for US (currently)
                //  * OBC has residential country restrictions: US, MX
                //  * I am living in Mexico, and submitted my MX address ==> i have to provide a passport from
                //    any country (which includes US, where i'm from). even though i have an acceptable form
                //    of ID were I to be living in the US
                //
                //
                // That is to say, international country restrictions do not affect the countries you can
                // submit a passport for, this just controls residential address - there are
                // integration tests testing this part
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

    pub fn is_stepup_enabled(&self) -> bool {
        // TODO this is kind of incorrect now - should check for rules with a stepup outcome
        matches!(self.cip_kind, Some(CipKind::Alpaca))
    }

    pub fn enhanced_aml_for_test(&self) -> EnhancedAmlOption {
        self.enhanced_aml.clone()
    }

    // More useful public interface for working with VerificationChecks
    pub fn verification_checks(&self) -> VerificationChecks {
        VerificationChecks::from_existing(self)
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
    created_at: DateTime<Utc>,
    status: ApiKeyStatus,

    name: String,
    tenant_id: TenantId,
    is_live: bool,
    must_collect_data: Vec<CDO>,
    can_access_data: Vec<CDO>,
    cip_kind: Option<CipKind>,
    optional_data: Vec<CDO>,
    is_no_phone_flow: bool,
    is_doc_first: bool,
    allow_international_residents: bool,
    international_country_restrictions: Option<Vec<Iso3166TwoDigitCountryCode>>,
    author: DbActor,
    doc_scan_for_optional_ssn: Option<CDO>,
    enhanced_aml: EnhancedAmlOption,
    allow_us_residents: bool,
    allow_us_territory_residents: bool,
    kind: ObConfigurationKind,
    skip_kyb: Option<bool>,
    skip_confirm: bool,
    document_types_and_countries: Option<DocumentAndCountryConfiguration>,
    curp_validation_enabled: bool,
    documents_to_collect: Vec<DocumentRequestConfig>,
    business_documents_to_collect: Vec<DocumentRequestConfig>,
    verification_checks: Vec<VerificationCheck>,
    required_auth_methods: Option<Vec<AuthMethodKind>>,
    prompt_for_passkey: bool,
}

pub struct NewObConfigurationArgs {
    pub name: String,
    pub tenant_id: TenantId,
    pub is_live: bool,
    pub must_collect_data: Vec<CDO>,
    pub can_access_data: Vec<CDO>,
    pub cip_kind: Option<CipKind>,
    pub optional_data: Vec<CDO>,
    pub is_no_phone_flow: bool,
    pub is_doc_first: bool,
    pub allow_international_residents: bool,
    pub international_country_restrictions: Option<Vec<Iso3166TwoDigitCountryCode>>,
    pub author: DbActor,
    pub doc_scan_for_optional_ssn: Option<CDO>,
    pub allow_us_residents: bool,
    pub allow_us_territory_residents: bool,
    pub kind: ObConfigurationKind,
    pub skip_confirm: bool,
    pub document_types_and_countries: Option<DocumentAndCountryConfiguration>,
    pub curp_validation_enabled: bool,
    pub documents_to_collect: Vec<DocumentRequestConfig>,
    pub business_documents_to_collect: Vec<DocumentRequestConfig>,
    pub verification_checks: VerificationChecks,
    pub required_auth_methods: Option<Vec<AuthMethodKind>>,
    pub prompt_for_passkey: bool,
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

#[derive(Default, AsChangeset)]
#[diesel(table_name = ob_configuration)]
pub struct ObConfigurationUpdate {
    pub name: Option<String>,
    pub status: Option<ApiKeyStatus>,
    pub verification_checks: Option<Vec<VerificationCheck>>,
    pub prompt_for_passkey: Option<bool>,
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
                query = query.filter(ob_configuration::id.eq_any(obc_ids))
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
    pub fn create(conn: &mut PgConn, args: NewObConfigurationArgs) -> DbResult<Self> {
        let enhanced_aml = args.verification_checks.enhanced_aml();
        let skip_kyb = args.verification_checks.skip_kyb();
        let NewObConfigurationArgs {
            name,
            tenant_id,
            must_collect_data,
            optional_data,
            can_access_data,
            is_live,
            cip_kind,
            is_no_phone_flow,
            is_doc_first,
            allow_international_residents,
            international_country_restrictions,
            author,
            doc_scan_for_optional_ssn,
            allow_us_residents,
            allow_us_territory_residents,
            kind,
            skip_confirm,
            document_types_and_countries,
            documents_to_collect,
            business_documents_to_collect,
            curp_validation_enabled,
            verification_checks,
            required_auth_methods,
            prompt_for_passkey,
        } = args;
        let config = NewObConfiguration {
            key: ObConfigurationKey::generate(is_live),
            status: ApiKeyStatus::Enabled,
            created_at: Utc::now(),
            name,
            tenant_id,
            must_collect_data,
            can_access_data,
            is_live,
            cip_kind,
            optional_data,
            is_no_phone_flow,
            is_doc_first,
            allow_international_residents,
            international_country_restrictions,
            author,
            doc_scan_for_optional_ssn,
            enhanced_aml,
            allow_us_residents,
            allow_us_territory_residents,
            kind,
            skip_kyb: Some(skip_kyb),
            skip_confirm,
            document_types_and_countries,
            curp_validation_enabled,
            documents_to_collect,
            business_documents_to_collect,
            verification_checks: verification_checks.into_inner(),
            required_auth_methods,
            prompt_for_passkey,
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
        update: ObConfigurationUpdate,
    ) -> DbResult<Self> {
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
        // Get OBC for this scoped vault. This is a little funky now because you can theoretically onboard
        // only multiple Workflow's and each could have a different OBC For now, we take the first
        // completed WF by completed_at where enhanced_aml = Yes. If none of the WF's have enhanced AML,
        // then we just take the first OBC.
        let (wfs, _) = Workflow::list(conn, sv_id, OffsetPagination::page(20))?;
        let obc = if let Some(obc) = wfs
            .iter()
            .filter(|(wf, _)| wf.completed_at.is_some())
            .sorted_by_key(|(wf, _)| wf.completed_at)
            .flat_map(|(_, obc)| obc)
            .find(|obc| {
                matches!(
                    &obc.verification_checks().enhanced_aml(),
                    EnhancedAmlOption::Yes { .. }
                )
            }) {
            Some(obc.clone())
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

    /// Returns true if this ob config requires collecting any CDO with the provided DataIdentifier
    /// kind
    pub fn must_collect(&self, di_kind: DataIdentifierDiscriminant) -> bool {
        self.must_collect_data
            .iter()
            .any(|cdo| cdo.parent().data_identifier_kind() == di_kind)
    }
}


/// Helper to more easily interact with verification checks
#[derive(Default, Clone)]
pub struct VerificationChecks(Vec<VerificationCheck>);
impl VerificationChecks {
    pub fn new(
        tenant_id: &TenantId,
        checks_from_request: Option<Vec<VerificationCheck>>,
        skip_kyc: Option<bool>,
        enhanced_aml: Option<EnhancedAmlOption>,
        collects_identity_document: bool,
    ) -> Self {
        let vc = checks_from_request.unwrap_or_default();

        VerificationChecks(Self::create_verification_checks_from_obc_request(
            tenant_id,
            vc,
            skip_kyc,
            enhanced_aml,
            collects_identity_document,
        ))
    }

    // 2024-07-16 temporary while we're migrating to verification checks
    // Eventually this will just be a passthrough
    fn create_verification_checks_from_obc_request(
        tenant_id: &TenantId,
        mut checks: Vec<VerificationCheck>,
        skip_kyc: Option<bool>,
        enhanced_aml: Option<EnhancedAmlOption>,
        collects_identity_document: bool,
    ) -> Vec<VerificationCheck> {
        let skip_kyc_migrated = if let Some(skip) = skip_kyc {
            if !skip {
                checks.push(VerificationCheck::Kyc {});
            }

            false
        } else {
            true
        };

        let enhanced_aml_migrated = if let Some(enhanced) = enhanced_aml {
            match enhanced {
                EnhancedAmlOption::No => (),
                EnhancedAmlOption::Yes {
                    ofac,
                    pep,
                    adverse_media,
                    continuous_monitoring,
                    adverse_media_lists,
                } => {
                    let am_lists = if tenant_id.is_composer() {
                        Some(vec![
                            AdverseMediaListKind::FinancialCrime,
                            AdverseMediaListKind::Fraud,
                        ])
                    } else {
                        adverse_media_lists
                    };
                    let aml_check = VerificationCheck::Aml {
                        ofac,
                        pep,
                        adverse_media,
                        continuous_monitoring,
                        adverse_media_lists: am_lists,
                    };
                    checks.push(aml_check);
                }
            }

            false
        } else {
            true
        };

        let identity_doc_migrated = if collects_identity_document {
            let doc_migrated = VerificationChecks::new_for_test(checks.clone())
                .get(VerificationCheckKind::IdentityDocument)
                .is_some();

            if !doc_migrated {
                checks.push(VerificationCheck::IdentityDocument {});
            };

            Some(doc_migrated)
        } else {
            None
        };

        tracing::info!(?identity_doc_migrated, %enhanced_aml_migrated, %skip_kyc_migrated, "VerificationCheck migration");

        checks
    }

    pub fn new_for_test(checks: Vec<VerificationCheck>) -> Self {
        Self(checks)
    }

    pub fn into_inner(self) -> Vec<VerificationCheck> {
        self.0
    }

    pub fn inner(&self) -> &Vec<VerificationCheck> {
        &self.0
    }

    pub fn from_existing(existing: &ObConfiguration) -> Self {
        Self(existing.verification_checks.clone().unwrap_or_default())
    }
}

impl VerificationChecks {
    pub fn get(&self, kind: VerificationCheckKind) -> Option<VerificationCheck> {
        self.0
            .clone()
            .into_iter()
            .find(|c| VerificationCheckKind::from(c) == kind)
    }

    pub fn skip_kyc(&self) -> bool {
        self.get(VerificationCheckKind::Kyc).is_none()
    }

    pub fn skip_kyb(&self) -> bool {
        self.get(VerificationCheckKind::Kyb).is_none()
    }

    pub fn enhanced_aml(&self) -> EnhancedAmlOption {
        match self.get(VerificationCheckKind::Aml) {
            Some(VerificationCheck::Aml {
                ofac,
                pep,
                adverse_media,
                continuous_monitoring,
                adverse_media_lists,
            }) => EnhancedAmlOption::Yes {
                ofac,
                pep,
                adverse_media,
                continuous_monitoring,
                adverse_media_lists,
            },
            _ => EnhancedAmlOption::No,
        }
    }
}
