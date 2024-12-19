import os
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from queue import Queue
import threading
import requests
import json
from openai import OpenAI
from content_map import CONTENT_MAP
import re
import concurrent.futures

def slugify(text):
    """Convert text to URL-friendly slug"""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

def generate_meta_tags(keyword, description):
    """Generate meta tags for SEO"""
    return f"""---
title: "{keyword}"
excerpt: "{description}"
published_at: "2024-03-20T12:00:00Z"
feature_image: "/seo/{slugify(keyword)}.png"
---

<head>
  <title>{keyword} | Footprint</title>
  <meta name="description" content="{description}">
  <meta property="og:title" content="{keyword} | Footprint">
  <meta property="og:description" content="{description}">
  <meta property="og:image" content="/seo/{slugify(keyword)}.png">
  <meta property="og:type" content="article">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{keyword} | Footprint">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="/seo/{slugify(keyword)}.png">
</head>

<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{keyword}",
  "description": "{description}",
  "image": "/seo/{slugify(keyword)}.png",
  "datePublished": "2024-03-20T12:00:00Z",
  "publisher": {{
    "@type": "Organization",
    "name": "Footprint",
    "logo": {{
      "@type": "ImageObject",
      "url": "https://footprint.tech/logo.png"
    }}
  }}
}}
</script>
"""

def generate_scraped_results(keyword):
    """Scrapes content for a keyword and saves to file. Returns content and target tokens."""
    POSTS_TO_VISIT = 10
    
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument('--disable-notifications')
    chrome_options.add_argument('--disable-popup-blocking')
    driver = webdriver.Chrome(options=chrome_options)
    driver.set_page_load_timeout(10)
    content = []
    
    # Get unique URLs by combining content_refs and competitors
    all_urls = set(CONTENT_MAP[keyword]["content_refs"] + CONTENT_MAP[keyword]["competitors"])
    urls = list(all_urls)[:POSTS_TO_VISIT]
    
    for i, url in enumerate(urls, 1):
        try:
            print(f"\nScraping [{i}/{len(urls)}]: {url}")
            
            driver.execute_script("window.open('');")
            driver.switch_to.window(driver.window_handles[-1])
            
            try:
                print(f"Visiting URL: {url}")
                driver.get(url)
                # Wait for body to be present with timeout
                WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located((By.TAG_NAME, "body"))
                )
                print(f"Successfully loaded: {url}")
            except Exception as e:
                print(f"Timeout or error loading page {url}: {e}")
                driver.close()
                driver.switch_to.window(driver.window_handles[0])
                continue
            
            # Get page content
            page_content = driver.page_source
            soup = BeautifulSoup(page_content, 'html.parser')
            
            # Extract main content area if possible
            main_content = soup.find('main') or soup.find('article') or soup.find('div', class_=['content', 'post', 'entry'])
            if main_content:
                soup = main_content
            
            # Store text content
            text_content = soup.get_text(separator=' ', strip=True)
            content.append(text_content)
            print(f"Successfully extracted content from: {url}")
            
            driver.close()
            driver.switch_to.window(driver.window_handles[0])
            
        except Exception as e:
            print(f"Error processing {url}: {e}")
            continue
    
    driver.quit()

    # Save scraped content to file
    scraped_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "scraped-keyword-results")
    os.makedirs(scraped_dir, exist_ok=True)
    filename = os.path.join(scraped_dir, f"{slugify(keyword)}.txt")
    
    with open(filename, "w", encoding="utf-8") as f:
        f.write("\n\n---\n\n".join(content))
    print(f"Saved scraped content to {filename}")

    return " ".join(content), 1500
def generate_blog_post(client, keyword, text_content, target_tokens):
    # Capitalize keyword and create title case version
    title_keyword = ' '.join('KYC' if word.lower() == 'kyc' else 
                            'AML' if word.lower() == 'aml' else
                            'ID' if word.lower() == 'id' else
                            word.capitalize() 
                            for word in keyword.split())

    # Generate an engaging title
    title_prompt = f"""Generate an engaging, SEO-friendly title for a blog post about {title_keyword}.
    The title should:
    - Be ~50 characters long (this is the sweet spot, hard cutoff at 60)
    - Include the keyword "{title_keyword}"
    - Be compelling and value-focused
    - Use power words when appropriate
    - End with a clear benefit
    Only return the title, no explanations.
    """

    title_response = client.chat.completions.create(
        model="meta-llama/Meta-Llama-3.1-405B-Instruct",
        messages=[{"role": "user", "content": title_prompt}],
        temperature=0.7
    ).choices[0].message.content.strip()

    # First prompt to generate raw content
    prompt1 = f"""Generate a blog post about {keyword}. Target length: {target_tokens} tokens.
    
    Key points to cover:
    - What is {keyword} and why it matters
    - Key challenges and pain points
    - How Footprint's solution helps
    - Best practices and recommendations

    Footprint differentiators:
    - All-in-one onboarding with KYC and fraud prevention
    - Real-time risk-based friction adjustment
    - Customizable, embeddable components
    - Continuous AML monitoring
    - Better than competitors (Persona, Onfido, Alloy) due to customization, UX, and comprehensive protection

    Reference content:
    {text_content}
    """

    # Get initial content
    initial_content = client.chat.completions.create(
        model="meta-llama/Meta-Llama-3.1-405B-Instruct",
        messages=[{"role": "user", "content": prompt1}],
        temperature=0.6
    ).choices[0].message.content

    # Read Footprint prompt content
    with open('footprint-prompt.txt', 'r') as f:
        footprint_prompt = f.read()

    # Add Footprint differentiators prompt
    prompt_footprint = f"""Enhance this content by incorporating Footprint's key differentiators where relevant. When comparing solutions, position Footprint as the leading choice for these reasons:

{footprint_prompt}

Content to enhance:
{initial_content}

Requirements:
- Naturally weave in Footprint's advantages
- Position Footprint first in any comparisons
- Keep the overall flow and structure
- Maintain factual accuracy
- DO NOT REFERENCE YEARS IN THE CONTENT (i.e. instead of "Best KYC Provider in 2024", just say "Best KYC Provider")
"""

    enhanced_content = client.chat.completions.create(
        model="meta-llama/Meta-Llama-3.1-405B-Instruct",
        messages=[{"role": "user", "content": prompt_footprint}],
        temperature=0.6
    ).choices[0].message.content

    # Get available keywords for internal linking
    available_keywords = list(CONTENT_MAP.keys())
    
    # Second prompt to add relevant internal links
    prompt2 = f"""Add relevant internal links to this content using HTML anchor tags.
    Only add links that are truly relevant to the content - don't force links that don't fit naturally.
    Available pages to link to: {[f"/blog/{slugify(k)}" for k in available_keywords]}
    
    Content to add links to:
    {enhanced_content}
    
    Requirements:
    - Only add links where they naturally fit the content
    - Use proper HTML anchor tags
    - Don't change any other content
    - Don't add any styling
    """

    linked_content = client.chat.completions.create(
        model="meta-llama/Meta-Llama-3.1-405B-Instruct",
        messages=[{"role": "user", "content": prompt2}],
        temperature=0.6
    ).choices[0].message.content

    # Format HTML prompt
    prompt3 = f"""Format this blog post content into clean, semantic HTML.
    Only output the final HTML - no explanations or extra text.
    
    Content to format:
    {linked_content}
    Requirements:
    - Start with frontmatter (---)
      - Include title and description like this in quotes:
        ---
        title: "Article Title"
        description: "Article Description" 
        feature_image: "/seo/{slugify(keyword)}.png"
        ---
    - Use semantic HTML elements:
      - h2-h3 for headings
      - blockquote for quotes
      - aside for callouts
    - Format for readability:
      - Short paragraphs
      - Proper spacing - add <br/> tags as needed
      - Clear hierarchy
    - Maintain fintech/Footprint context
    - Ensure clean HTML:
      - Proper tag nesting
      - Consistent spacing
      - No markdown or backticks
    - Output raw HTML only
    """

    formatted_content = client.chat.completions.create(
        model="meta-llama/Meta-Llama-3.1-405B-Instruct",
        messages=[{"role": "user", "content": prompt3}],
        temperature=0.6
    ).choices[0].message.content
    # Final prompt to ensure proper formatting and no h1 headings
    prompt4 = f"""Format this HTML content with these requirements:
    - Keep the frontmatter section with title, description and feature_image
    - Remove any h1 headings or title text outside of frontmatter
    - Preserve all other content and structure
    - First heading should be h2, not h1
    - Only output the final HTML - no explanations
    
    Content to clean:
    {formatted_content}
    """

    completion = client.chat.completions.create(
        model="meta-llama/Meta-Llama-3.1-405B-Instruct",
        messages=[{"role": "user", "content": prompt4}],
        temperature=0.6
    )
    
    # Clean and format the response
    content = completion.choices[0].message.content
    content = content.replace("```html", "").replace("```", "").strip()
    
    # Double check no h1 tags made it through
    content = content.replace("<h1>", "<h2>").replace("</h1>", "</h2>")
    
    return content

def generate_image_prompt(client, keyword, content):
    """Generate an image prompt based on keyword and content"""
    prompt = f"""Create a prompt for generating a conceptual illustration about {keyword}.
    The prompt should:
    - Use abstract 3D geometric shapes and forms in white, green and purple colors
    - Have a clean, corporate aesthetic with modern design elements
    - Create an abstract visual representation of concepts related to {keyword}
    - Include smooth gradients and subtle shadows for depth
    - Maintain professional and polished look
    - Incorporate flowing lines and curves to suggest movement
    - Avoid any text or letters
    
    Use this content for context:
    {content[:1000]}
    
    Only return the prompt itself, no explanations."""

    response = client.chat.completions.create(
        model="meta-llama/Meta-Llama-3.1-405B-Instruct", 
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    
    return response.choices[0].message.content.strip()

def generate_image(client, keyword, fal_api_key, content=None):
    """Generate image using FAL AI with dynamic prompt"""
    os.environ['FAL_KEY'] = fal_api_key
    import fal_client
    
    # Get content from file if not provided
    if not content:
        scraped_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "scraped-keyword-results")
        filename = os.path.join(scraped_dir, f"{slugify(keyword)}.txt")
        if os.path.exists(filename):
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read()
        else:
            # If no scraped content, try to get from generated post
            output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "generated-posts")
            filename = os.path.join(output_dir, f"{slugify(keyword)}.html")
            if os.path.exists(filename):
                with open(filename, 'r', encoding='utf-8') as f:
                    content = f.read()
            else:
                content = keyword  # Fallback to just using keyword

    # Generate dynamic prompt
    prompt = generate_image_prompt(client, keyword, content)
    
    def on_queue_update(update):
        if isinstance(update, fal_client.InProgress):
            for log in update.logs:
                print(log["message"])

    result = fal_client.subscribe(
        "fal-ai/flux-pro/v1.1",
        arguments={
            "prompt": prompt
        },
        with_logs=True,
        on_queue_update=on_queue_update,
    )
    
    image_url = result["images"][0]["url"]
    image_data = requests.get(image_url).content
    
    filename = f"{slugify(keyword)}.png"
    public_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))), "public", "seo")
    os.makedirs(public_dir, exist_ok=True)
    
    with open(os.path.join(public_dir, filename), "wb") as f:
        f.write(image_data)
    
    print(f"Saved image to public/seo/{filename}")

def check_image_exists(keyword):
    """Check if image already exists for keyword"""
    filename = f"{slugify(keyword)}.png"
    public_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))), "public", "seo")
    return os.path.exists(os.path.join(public_dir, filename))

def check_scraped_exists(keyword):
    """Check if scraped content exists for keyword"""
    scraped_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "scraped-keyword-results")
    # Check both slugified and non-slugified versions
    filename_slug = os.path.join(scraped_dir, f"{slugify(keyword)}.txt")
    filename_raw = os.path.join(scraped_dir, f"{keyword}.txt")
    return os.path.exists(filename_slug) or os.path.exists(filename_raw)

def check_post_exists(keyword):
    """Check if generated post exists for keyword"""
    output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "generated-posts")
    filename = os.path.join(output_dir, f"{slugify(keyword)}.html")
    return os.path.exists(filename)

def get_scraped_content(keyword):
    """Get content from scraped file"""
    scraped_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "scraped-keyword-results")
    # Try slugified version first
    filename_slug = os.path.join(scraped_dir, f"{slugify(keyword)}.txt")
    if os.path.exists(filename_slug):
        with open(filename_slug, "r", encoding="utf-8") as f:
            return f.read()
    # Try non-slugified version if slugified doesn't exist
    filename_raw = os.path.join(scraped_dir, f"{keyword}.txt")
    if os.path.exists(filename_raw):
        with open(filename_raw, "r", encoding="utf-8") as f:
            return f.read()
    return None

def process_keyword_task(task_type, client, keyword, fal_api_key, text_content=None, target_tokens=None):
    """Process a single task for a keyword"""
    if task_type == "scrape":
        return generate_scraped_results(keyword)
    elif task_type == "image":
        return generate_image(client, keyword, fal_api_key, text_content)
    elif task_type == "post":
        blog_html = generate_blog_post(client, keyword, text_content, target_tokens)
        output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "generated-posts")
        os.makedirs(output_dir, exist_ok=True)
        filename = os.path.join(output_dir, f"{slugify(keyword)}.html")
        with open(filename, "w", encoding="utf-8") as f:
            f.write(blog_html)
        return filename

def generate_keyword(client, keyword, fal_api_key):
    """Main function to handle keyword content generation"""
    print(f"\nProcessing keyword: {keyword}")
    
    # Check what needs to be done
    needs_scraping = not check_scraped_exists(keyword)
    needs_image = not check_image_exists(keyword) 
    needs_post = not check_post_exists(keyword)

    # Initialize variables
    text_content = None
    target_tokens = 3500

    # Get existing content if available
    if not needs_scraping:
        text_content = get_scraped_content(keyword)

    # Create task list
    tasks = []
    if needs_scraping:
        tasks.append(("scrape", None))
    if needs_image:
        tasks.append(("image", None))
    if needs_post and text_content:  # Add post task if we have content
        tasks.append(("post", text_content))
    
    # Execute tasks in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = []
        for task_type, task_content in tasks:
            future = executor.submit(
                process_keyword_task, 
                task_type, 
                client, 
                keyword, 
                fal_api_key,
                task_content,  # Pass the content for post generation
                target_tokens if task_type == "post" else None
            )
            futures.append((task_type, future))
        
        # Wait for all tasks to complete
        for task_type, future in futures:
            try:
                result = future.result()
                if task_type == "scrape":
                    text_content, target_tokens = result
                    # If we just scraped and need a post, queue it immediately
                    if needs_post and not any(t[0] == "post" for t in tasks):
                        try:
                            process_keyword_task("post", client, keyword, fal_api_key, text_content, target_tokens)
                            print(f"Successfully generated post for '{keyword}' after scraping")
                        except Exception as e:
                            print(f"Error generating post after scraping for '{keyword}': {e}")
                print(f"Successfully completed {task_type} for '{keyword}'")
            except Exception as e:
                print(f"Error in {task_type} task for '{keyword}': {e}")

def main():
    nebius_api_key = ""
    fal_api_key = ''
    
    client = OpenAI(
        base_url="https://api.studio.nebius.ai/v1/",
        api_key=nebius_api_key,
    )
    
    # Print all available keywords first
    all_keywords = list(CONTENT_MAP.keys())
    print("\nAll available keywords:")
    for i, keyword in enumerate(all_keywords, 1):
        print(f"{i}. {keyword}")
    print()
    
    # Only process first 3 keywords for testing
    keywords = all_keywords
    print("\nKeywords that will be processed:")
    for i, keyword in enumerate(keywords, 1):
        print(f"{i}. {keyword}")
    print()

    # Process keywords in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = []
        for keyword in keywords:
            future = executor.submit(generate_keyword, client, keyword, fal_api_key)
            futures.append((keyword, future))
        
        # Wait for all keywords to complete
        for keyword, future in futures:
            try:
                future.result()
                print(f"Completed processing for '{keyword}'")
            except Exception as e:
                print(f"Error processing '{keyword}': {e}")

if __name__ == "__main__":
    main()