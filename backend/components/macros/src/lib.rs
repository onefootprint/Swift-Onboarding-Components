use proc_macro::TokenStream;
use quote::{
    format_ident,
    quote,
    ToTokens,
};
use syn::spanned::Spanned;
use syn::{
    parse_macro_input,
    parse_quote,
    AttributeArgs,
    ItemFn,
    Meta,
    NestedMeta,
};
use test_case_core::TestCase;

extern crate proc_macro;

#[proc_macro_attribute]
/// Wraps a function that takes in a `TestPgConnection` and turns it into a rust `#[test]` function
/// that takes no arguments with the same name
pub fn db_test(args: proc_macro::TokenStream, stream: proc_macro::TokenStream) -> proc_macro::TokenStream {
    let ItemFn {
        attrs,
        vis: _,
        sig,
        block,
    } = parse_macro_input!(stream as ItemFn);

    let args = parse_macro_input!(args as AttributeArgs);

    let retain = if let Some(a) = args.first() {
        matches!(a, syn::NestedMeta::Meta(Meta::Path(nv)) if nv.is_ident("retain"))
    } else {
        false
    };

    let stmts = &block.stmts;
    let fn_name = &sig.ident;

    // Wrap the defined function inside of a module. This allows us to create a new test function
    // with the same name as the user-provided function that has the #[test] attribute and proxies
    // execution to the run_test_txn function
    let out = quote! {
        mod #fn_name {
            use super::*;
            #(#attrs)* pub(super) #sig {
                #(#stmts)*
            }
        }

        #[test]
        fn #fn_name() {
            run_test_txn(#fn_name::#fn_name, #retain);
        }
    };
    out.into()
}

#[proc_macro_attribute]
#[proc_macro_error::proc_macro_error]
/// Wraps a function that takes in a `TestPgConn` and parameterizes it with the given set of data.
///
/// In general, db_test_case consists of four elements:
///
/// 1. _(Required)_ Arguments passed to test body
/// 2. _(Optional)_ Expected result
/// 3. _(Optional)_ Test case description
/// 4. _(Required)_ Test body
///
///  When _expected result_ is provided, it is compared against the actual value generated with
/// _test body_ using `assert_eq!`. _Test cases_ that don't provide _expected result_ should contain
/// custom assertions within _test body_ or return `Result` similar to `#[test]` macro.
pub fn db_test_case(
    args: proc_macro::TokenStream,
    input: proc_macro::TokenStream,
) -> proc_macro::TokenStream {
    // Most of this is copy-paste from the test-case-macros crate. We just have our own method
    // to render the db test cases
    let test_case = parse_macro_input!(args as TestCase);
    let mut item = parse_macro_input!(input as ItemFn);

    // This is a trick to provide attribute-proc-macro-like syntax for every test case.
    // In the first invocation of db_test_case, extract all other #[db_test_case(...)] attributes
    // and parse them
    let mut test_cases = vec![test_case];
    let mut attrs_to_remove = vec![];
    let legal_test_case_names = [parse_quote!(db_test_case), parse_quote!(macros::db_test_case)];

    for (idx, attr) in item.attrs.iter().enumerate() {
        if legal_test_case_names.contains(&attr.path) {
            let test_case = match attr.parse_args::<TestCase>() {
                Ok(test_case) => test_case,
                Err(err) => {
                    return syn::Error::new(
                        attr.span(),
                        format!("cannot parse db_test_case arguments: {err}"),
                    )
                    .to_compile_error()
                    .into()
                }
            };
            test_cases.push(test_case);
            attrs_to_remove.push(idx);
        }
    }

    // Remove the other invocations of db_test_case in the attributes for the test function
    for i in attrs_to_remove.into_iter().rev() {
        item.attrs.swap_remove(i);
    }

    render_db_test_cases(&test_cases, item)
}

#[allow(unused_mut)]
fn render_db_test_cases(test_cases: &[TestCase], mut test_fn: ItemFn) -> TokenStream {
    // Extract the first input to the test function, assuming it is the &mut TestPgConnection.
    // This value doesn't need to be provided by each TestCase since we will populate it ourselves
    let span = test_fn.sig.inputs.span();
    let err = syn::Error::new(span, "First db_test_case arg must be an &mut TestPgConn")
        .to_compile_error()
        .into();
    let mut inputs_iter = test_fn.sig.inputs.into_iter();
    let Some(conn_input) = inputs_iter.next() else {
        return err;
    };
    test_fn.sig.inputs = inputs_iter.collect();

    // Render each test case to call the test_fn with the provided argument
    let mut rendered_test_cases = vec![];
    for test_case in test_cases {
        rendered_test_cases.push(test_case.render(test_fn.clone()));
    }

    let test_fn_sig = test_fn.sig.clone();
    let test_fn_stmts = test_fn.block.stmts;
    let mod_name = test_fn.sig.ident;

    let output = quote! {
        // This function will be called by each individual test case and wraps the test_fn_stmts
        // inside a closure that also accepts the conn as an argument
        #test_fn_sig {
            run_test_txn(move |#conn_input| {
                #(#test_fn_stmts)*
            }, false)
        }

        #[cfg(test)]
        mod #mod_name {
            #[allow(unused_imports)]
            use super::*;

            #(#rendered_test_cases)*
        }
    };

    output.into()
}

#[proc_macro_attribute]
/// Wraps a function that takes in a `TestDbPool` and turns it into a rust `#[test]` function
/// that takes no arguments with the same name
pub fn test_db_pool(
    args: proc_macro::TokenStream,
    stream: proc_macro::TokenStream,
) -> proc_macro::TokenStream {
    let ItemFn {
        attrs,
        vis: _,
        sig,
        block,
    } = parse_macro_input!(stream as ItemFn);
    let args = parse_macro_input!(args as AttributeArgs);

    let retain = if let Some(a) = args.first() {
        matches!(a, syn::NestedMeta::Meta(Meta::Path(nv)) if nv.is_ident("retain"))
    } else {
        false
    };

    let stmts = &block.stmts;
    let fn_name = &sig.ident;

    let out = quote! {
        mod #fn_name {
            use super::*;
            #(#attrs)* pub(super) #sig {
                #(#stmts)*
            }
        }

        #[tokio::test]
        async fn #fn_name() {
            let test_db_pool = TestDbPool::new(#retain);
            #fn_name::#fn_name(test_db_pool).await;
        }
    };
    out.into()
}

#[proc_macro_attribute]
/// Wraps a function that takes in a `TestDbPool` and turns it into a rust `#[test]` function
/// that takes no arguments with the same name
pub fn test_state(args: proc_macro::TokenStream, stream: proc_macro::TokenStream) -> proc_macro::TokenStream {
    let ItemFn {
        attrs,
        vis: _,
        sig,
        block,
    } = parse_macro_input!(stream as ItemFn);
    let args = parse_macro_input!(args as AttributeArgs);

    let retain = if let Some(a) = args.first() {
        matches!(a, syn::NestedMeta::Meta(Meta::Path(nv)) if nv.is_ident("retain"))
    } else {
        false
    };

    let stmts = &block.stmts;
    let fn_name = &sig.ident;

    let out = quote! {
        mod #fn_name {
            use super::*;
            #(#attrs)* pub(super) #sig {
                #(#stmts)*
            }
        }

        #[tokio::test(flavor = "multi_thread", worker_threads = 1)]
        async fn #fn_name() {
            let test_db_pool = TestDbPool::new(#retain);
            let state = &mut State::test_state().await;
            state.set_db_pool((*test_db_pool).clone());
            #fn_name::#fn_name(state).await;
        }
    };
    out.into()
}

#[proc_macro_attribute]
#[proc_macro_error::proc_macro_error]
/// Wraps a function that takes in a `TestPgConn` and parameterizes it with the given set of data.
///
/// In general, test_state_case consists of four elements:
///
/// 1. _(Required)_ Arguments passed to test body
/// 2. _(Optional)_ Expected result
/// 3. _(Optional)_ Test case description
/// 4. _(Required)_ Test body
///
///  When _expected result_ is provided, it is compared against the actual value generated with
/// _test body_ using `assert_eq!`. _Test cases_ that don't provide _expected result_ should contain
/// custom assertions within _test body_ or return `Result` similar to `#[test]` macro.
pub fn test_state_case(
    args: proc_macro::TokenStream,
    input: proc_macro::TokenStream,
) -> proc_macro::TokenStream {
    // Most of this is copy-paste from the test-case-macros crate. We just have our own method
    // to render the db test cases
    let test_case = parse_macro_input!(args as TestCase);
    let mut item = parse_macro_input!(input as ItemFn);

    // This is a trick to provide attribute-proc-macro-like syntax for every test case.
    // In the first invocation of test_state_case, extract all other #[test_state_case(...)] attributes
    // and parse them
    let mut test_cases = vec![test_case];
    let mut attrs_to_remove = vec![];
    let legal_test_case_names = [
        parse_quote!(test_state_case),
        parse_quote!(macros::test_state_case),
    ];

    for (idx, attr) in item.attrs.iter().enumerate() {
        if legal_test_case_names.contains(&attr.path) {
            let test_case = match attr.parse_args::<TestCase>() {
                Ok(test_case) => test_case,
                Err(err) => {
                    return syn::Error::new(
                        attr.span(),
                        format!("cannot parse test_state_case arguments: {err}"),
                    )
                    .to_compile_error()
                    .into()
                }
            };
            test_cases.push(test_case);
            attrs_to_remove.push(idx);
        }
    }

    // Remove the other invocations of test_state_case in the attributes for the test function
    for i in attrs_to_remove.into_iter().rev() {
        item.attrs.swap_remove(i);
    }

    render_test_state_cases(&test_cases, item)
}

#[allow(unused_mut)]
fn render_test_state_cases(test_cases: &[TestCase], mut test_fn: ItemFn) -> TokenStream {
    // Extract the first input to the test function, assuming it is the &mut TestPgConnection.
    // This value doesn't need to be provided by each TestCase since we will populate it ourselves
    let span = test_fn.sig.inputs.span();
    let err = syn::Error::new(span, "First test_state_case arg must be an &mut TestPgConn")
        .to_compile_error()
        .into();
    let mut inputs_iter = test_fn.sig.inputs.into_iter();
    let Some(_state_input) = inputs_iter.next() else {
        return err;
    };
    test_fn.sig.inputs = inputs_iter.collect();

    // Render each test case to call the test_fn with the provided argument
    let mut rendered_test_cases = vec![];
    for test_case in test_cases {
        rendered_test_cases.push(test_case.render(test_fn.clone()));
    }

    let test_fn_sig = test_fn.sig.clone();
    let test_fn_stmts = test_fn.block.stmts;
    let mod_name = test_fn.sig.ident;

    let output = quote! {
        // This function will be called by each individual test case and wraps the test_fn_stmts
        // inside a closure that also accepts the conn as an argument
        #test_fn_sig {
            let test_db_pool = db::tests::test_db_pool::TestDbPool::new(false);
            let state = &mut State::test_state().await;
            state.set_db_pool((*test_db_pool).clone());
            #(#test_fn_stmts)*
        }

        #[cfg(test)]
        mod #mod_name {
            #[allow(unused_imports)]
            use super::*;

            #(#rendered_test_cases)*
        }
    };

    output.into()
}

#[proc_macro_attribute]
/// creates an alias of paperclip route with another path
pub fn route_alias(
    args: proc_macro::TokenStream,
    stream: proc_macro::TokenStream,
) -> proc_macro::TokenStream {
    let item = parse_macro_input!(stream as ItemFn);

    // original item
    let ItemFn {
        attrs,
        vis,
        sig,
        block,
    } = item.clone();

    let alias_route_macros: Vec<proc_macro2::TokenStream> = {
        let attr = parse_macro_input!(args as syn::AttributeArgs);

        match attr
            .iter()
            .map(|meta| match meta {
                syn::NestedMeta::Meta(Meta::List(list)) => {
                    let method = list.path.to_token_stream();
                    let mut iter = list.nested.iter();
                    let path = iter
                        .next()
                        .ok_or("first argument must be the path")?
                        .to_token_stream();

                    let mut description = Ok(None);
                    let mut tags = Ok(None);

                    let mut extract = |meta: &NestedMeta| -> Result<_, _> {
                        match meta {
                            syn::NestedMeta::Meta(Meta::NameValue(nv)) => {
                                if nv.path.is_ident("description") {
                                    description = Ok(Some(nv.lit.to_token_stream()));
                                } else {
                                    description = Err("must specify description = \"literal\"");
                                }
                            }
                            syn::NestedMeta::Meta(Meta::List(list)) => {
                                if list.path.is_ident("tags") {
                                    tags = Ok(Some(list.to_token_stream()));
                                } else {
                                    tags = Err("must specify tags(Tag1, Tag2)");
                                }
                            }
                            _ => return Err("must description key-value or tags list "),
                        };
                        Ok(())
                    };
                    iter.next().map(&mut extract).transpose()?;
                    iter.next().map(&mut extract).transpose()?;

                    let api_attrs: Vec<_> = vec![
                        description?.map(|d| {
                            quote! {
                                description = #d
                            }
                        }),
                        tags?,
                    ]
                    .into_iter()
                    .flatten()
                    .collect();

                    let block = quote! {
                        #[api_v2_operation(
                            #(#api_attrs),*
                        )]
                        #[#method(#path)]
                    };

                    Ok(block)
                }
                _ => Err("invalid properties in alias"),
            })
            .collect()
        {
            Ok(results) => results,
            Err(err) => {
                return syn::Error::new(attr.first().span(), err)
                    .to_compile_error()
                    .into()
            }
        }
    };

    let filter_attrs = |meta: &Meta, disallowed: &[&str]| -> bool {
        match meta {
            Meta::Path(path) => {
                let Some(ident) = path.get_ident() else {
                    return false;
                };
                let method_str = ident.to_string().to_lowercase();
                disallowed.contains(&method_str.as_str())
            }
            Meta::List(list) => {
                let Some(last) = list.path.segments.last() else {
                    return false;
                };
                let method_str = last.ident.to_string().to_lowercase();
                disallowed.contains(&method_str.as_str())
            }
            Meta::NameValue(_) => false,
        }
    };

    let other_attrs = item
        .attrs
        .into_iter()
        .filter(|attr| {
            let Some(meta) = attr.parse_meta().ok() else {
                return true;
            };
            !filter_attrs(
                &meta,
                &["get", "post", "put", "patch", "delete", "api_v2_operation"],
            )
        })
        .collect::<Vec<_>>();

    let (alias_blocks, configures): (Vec<_>, Vec<_>) = alias_route_macros
        .into_iter()
        .enumerate()
        .map(|(index, alias)| {
            let mut sig2 = item.sig.clone();
            let index: String = if index == 0 {
                "alias".to_string()
            } else {
                format!("alias_{}", index)
            };
            let handler_name = format!("{}_{}", sig2.ident, index);
            let handler_ident = proc_macro2::Ident::new(&handler_name, sig2.ident.span());
            sig2.ident = handler_ident.clone();

            let alias = quote! {
                // render alias
                #(#other_attrs)*
                #alias
                #vis #sig2
                #block
            };
            let configure = quote! {
                config.service(#handler_ident);
            };
            (alias, configure)
        })
        .unzip();

    let configure_ident = format_ident!("configure_{}_aliases", &sig.ident);

    let output = quote! {
        // render original
        #(#attrs)*
        #vis #sig
        #block

        // render aliases
        #(#alias_blocks)*

        #[allow(unused)]
        #vis fn #configure_ident(config: &mut paperclip::actix::web::ServiceConfig) {
            #(#configures)*
        }
    };
    // keep for debugging:
    // eprintln!("block: {}", &output.to_string());
    output.into()
}

#[proc_macro_derive(HiddenDebug)]
pub fn hidden_debug(input: TokenStream) -> TokenStream {
    let ast = parse_macro_input!(input as syn::DeriveInput);
    let name = &ast.ident;
    let name_string = format!("{} {{ hidden }}", &name);

    quote! {
        impl std::fmt::Debug for #name {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                f.debug_struct(#name_string).finish()
            }
        }
    }
    .into()
}

/// Ask elliott or alex: basically paperclip sucks
/// and forces us to declare a dummy proc attr in order
/// to rename fields for ApiSchemaV2
/// TODO: now that we have our own fork of paperclip, we can add this to the macro definition for
/// Apiv2Schema as it should be
#[proc_macro_derive(SerdeAttr, attributes(serde))]
pub fn serde_dummy_attr(_: TokenStream) -> TokenStream {
    TokenStream::new()
}

#[proc_macro_derive(JsonResponder)]
pub fn json_responder(input: TokenStream) -> TokenStream {
    let ast = parse_macro_input!(input as syn::DeriveInput);
    let name = &ast.ident;

    quote! {
        impl actix_web::Responder for #name {
            type Body = actix_web::body::BoxBody;

            fn respond_to(self, _req: &actix_web::HttpRequest) -> actix_web::HttpResponse<Self::Body> {
                let json_resp = paperclip::actix::web::Json(self);
                actix_web::HttpResponse::build(actix_web::http::StatusCode::OK).json(json_resp)
            }
        }
    }
    .into()
}
