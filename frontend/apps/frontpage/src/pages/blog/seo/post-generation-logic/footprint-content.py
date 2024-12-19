import os
from bs4 import BeautifulSoup
import requests
from openai import OpenAI

# Initialize Nebius client
client = OpenAI(
    base_url="https://api.studio.nebius.ai/v1/",
    api_key=""
)

# URLs to scrape
urls = [
    'https://www.onefootprint.com/blog/launching-footprint-fraud',
    'https://www.onefootprint.com/blog/vaulting-and-onboarding-together', 
    'https://www.onefootprint.com/blog/authenticate-and-know-your-customer',
    'https://www.onefootprint.com/blog/passkeys-prevent-fraud-and-phishing',
    'https://www.onefootprint.com/blog/app-clips-verify-real-people-behind-devices'
]

# Scrape content from URLs
content = []
for url in urls:
    print(f"Scraping {url}")
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find main content area
    article = soup.find('article') or soup.find('main')
    if article:
        # Get text content
        text = article.get_text(separator=' ', strip=True)
        content.append(text)
    
# Save scraped content
with open('footprint-content.txt', 'w', encoding='utf-8') as f:
    f.write('\n\n---\n\n'.join(content))
print("Saved scraped content to footprint-content.txt")

# Generate summary with Nebius
prompt = f"""Based on these blog posts about Footprint, create a detailed ~1000 word summary that distills all the key positives and differentiators about Footprint that would be valuable for writing future blog posts. Focus on their unique value propositions, technical capabilities, and competitive advantages.

Content:
{' '.join(content)}

The summary should cover:
- Core product offerings and capabilities
- Key differentiators from competitors
- Technical innovations and unique approaches
- Benefits and value propositions
- Industry problems they solve

Make it detailed and specific while maintaining a positive, authoritative tone."""

response = client.chat.completions.create(
    model="meta-llama/Meta-Llama-3.1-405B-Instruct",
    messages=[{"role": "user", "content": prompt}],
    temperature=0.7
)

# Save summary prompt
with open('footprint-prompt.txt', 'w', encoding='utf-8') as f:
    f.write(response.choices[0].message.content)
print("Saved summary to footprint-prompt.txt")
# End of Selection






