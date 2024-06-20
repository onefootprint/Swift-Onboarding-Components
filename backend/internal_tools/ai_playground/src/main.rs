use dotenv::dotenv;
use openai::chat::ChatCompletion;
use openai::chat::ChatCompletionMessage;
use openai::chat::ChatCompletionMessageRole;
use openai::set_key;
use std::env;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Make sure you have a file named `.env` with the `OPENAI_KEY` environment variable defined!
    dotenv().unwrap();
    set_key(env::var("OPENAI_API_KEY")?);

    let auth = env::var("FOOTPRINT_AUTH_TOKEN")?;
    let fp_id = env::var("FOOTPRINT_ID")?;
    let is_live = env::var("FOOTPRINT_IS_LIVE").is_ok();

    // query the data
    let overview = fp_api_request(format!("entities/{}", &fp_id), &auth, is_live).await?;
    let timeline = fp_api_request(format!("entities/{}/timeline", &fp_id), &auth, is_live).await?;
    let risk_signals = fp_api_request(format!("entities/{}/risk_signals", &fp_id), &auth, is_live).await?;
    let annotations = fp_api_request(format!("entities/{}/annotations", &fp_id), &auth, is_live).await?;
    let match_signals = fp_api_request(format!("entities/{}/match_signals", &fp_id), &auth, is_live).await?;

    let schema = r"
    {
        'type': 'object',
        'properties': {
            'title': {'type': 'string'},
            'subtitle': {'type': 'string'},
            'high_level_summary': {'type': 'string'},
            'detailed_summary': {'type': 'string'},
            'risk_signal_summary': {'type': 'string'},
            'conclusion': {'type': 'string'}
        },
        'required': ['title', 'subtitle', 'high_level_summary', 'detailed_summary', 'risk_signal_summary', 'conclusion']
    }
    ";
    let prompt = format!("summarize this identity verification result with user overview: {}\n\nTimeline: {}\n\nRisk Signals: {}\n\nAnnotations: {}\n\nMatch Signals: {}. Output the summary in JSON format using the schema {schema} ", overview, timeline, risk_signals, annotations, match_signals);

    println!("=== Prompt ===\n\n{}\n\n\n", &prompt);

    let message = ChatCompletionMessage {
        role: ChatCompletionMessageRole::Assistant,
        content: Some(prompt),
        name: None,
        function_call: Some(openai::chat::ChatCompletionFunctionCall {
            name: "to_json".into(),
            arguments: "schema, content".into(),
        }),
    };
    let completion = ChatCompletion::builder("gpt-4-0125-preview", vec![message])
        .create()
        .await?;

    let response = completion
        .choices
        .first()
        .unwrap()
        .message
        .clone()
        .content
        .unwrap();
    println!("=== Response from GPT-4 ===\n\n{response}\n");
    Ok(())
}

async fn fp_api_request<S: ToString>(path: S, auth_tok: &str, is_live: bool) -> anyhow::Result<String> {
    let client = reqwest::Client::new();
    let res = client
        .get(format!("https://api.onefootprint.com/{}", path.to_string()))
        .header("x-is-live", if is_live { "true" } else { "false" })
        .header("x-fp-dashboard-authorization", auth_tok)
        .send()
        .await?
        .text()
        .await?;
    Ok(res)
}
