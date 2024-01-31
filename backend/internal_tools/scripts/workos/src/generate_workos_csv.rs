use std::{env, fs::File, io::prelude::*};
use workos::{
    organizations::{ListOrganizations, ListOrganizationsParams},
    ApiKey, PaginationOrder, PaginationParams, WorkOs,
};

pub async fn generate() -> anyhow::Result<()> {
    let mut after: Option<String> = Some("".to_string());
    let workos_api_key: String = env::var("WORKOS_API_KEY").unwrap();
    let workos_client = WorkOs::new(&ApiKey::from(workos_api_key));

    let mut file = File::create("./workos-migrations.txt").expect("Fail to create file");
    file.set_len(0)?;

    while after.is_some() {
        let response = workos_client
            .organizations()
            .list_organizations(&ListOrganizationsParams {
                pagination: PaginationParams {
                    order: &PaginationOrder::Desc,
                    after: Some(after.unwrap().as_ref()),
                    before: None,
                },
                domains: None,
            })
            .await
            .expect("Error requesting organizations from workos API");
        for org in response.data {
            let domain = org.domains.first();
            if let Some(check_domain) = domain {
                let data = format!("('{}','{}'),", org.id, check_domain.domain);
                file.write_all(data.as_bytes())
                    .expect("Failed to write line to file");
            }
        }
        if let Some(response_after) = response.metadata.after {
            after = Some(response_after.clone());
        } else {
            after = None;
        }
    }
    Ok(())
}
