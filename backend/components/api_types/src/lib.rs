use chrono::{DateTime, Utc};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
mod newtype_exports;

pub mod resources;

#[macro_use]
pub mod util {
    #[cfg(test)]
    const SCHEMAS_DIR: &str = "generated/schemas";

    macro_rules! export_schema {
        (
            $typ:ident
        ) => {
            paste::paste! {
                #[cfg(test)]
                #[test]
                #[allow(non_snake_case)]
                fn [<export_schema_$typ>]() {
                    let gen = crate::util::generator();
                    let schema = gen.into_root_schema_for::<$typ>();
                    let name = stringify!($typ);
                    crate::util::export_type_schema(schema, &name);
                }
            }
        };
    }

    #[cfg(test)]
    pub(crate) fn generator() -> schemars::gen::SchemaGenerator {
        use schemars::gen::SchemaSettings;

        let mut settings = SchemaSettings::draft07().with_visitor(JsonExtAppendVisitor {});
        settings.definitions_path = "".into();
        schemars::gen::SchemaGenerator::new(settings)
    }

    #[cfg(test)]
    pub(crate) fn export_type_schema(mut schema: schemars::schema::RootSchema, name: &str) {
        if let Some(enum_values) = schema.schema.enum_values.clone() {
            schema
                .schema
                .extensions
                .insert("tsEnumNames".to_string(), serde_json::Value::Array(enum_values));
        }

        let output = serde_json::to_string_pretty(&schema).expect("json serialize error");

        std::fs::create_dir_all(SCHEMAS_DIR).expect("failed to create dir");

        let file = format!("{SCHEMAS_DIR}/{name}.json");
        std::fs::write(file, output).expect("write schema file error");
    }

    #[derive(Debug, Clone)]
    pub(crate) struct JsonExtAppendVisitor {}

    impl schemars::visit::Visitor for JsonExtAppendVisitor {
        fn visit_root_schema(&mut self, root: &mut schemars::schema::RootSchema) {
            // root.definitions = Default::default();
            schemars::visit::visit_root_schema(self, root)
        }

        fn visit_schema_object(&mut self, schema: &mut schemars::schema::SchemaObject) {
            if let Some(reference) = schema.reference.take() {
                // let path = format!("./{}.json", &reference);
                // schema.reference = Some(path);
                schema
                    .extensions
                    .insert("tsType".into(), serde_json::Value::String(reference));
            }

            schemars::visit::visit_schema_object(self, schema);
        }
    }

    pub(crate) use export_schema;
}
pub(crate) use self::util::export_schema;

pub use resources::*;

pub(crate) use newtypes::*;
