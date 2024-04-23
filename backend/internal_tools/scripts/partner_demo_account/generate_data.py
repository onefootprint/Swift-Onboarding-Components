import os
import random
import requests
import tempfile

# ollama serve
# ollama pull llama2-uncensored

COMPANIES = [
    "WealthWise",
    "FinovaTech",
    "Prosperify",
    "CapitalEdge",
    "Investo",
]

TEMPLATES = {
  "Business Continuity or Disaster Recovery Plan": "This document outlines procedures and instructions an organization must follow in the face of disaster, whether fire, flood, or cyberattack. The goal is to enable ongoing operations before and during execution of disaster recovery.",
  "Information Security Policy": "An Information Security Policy is a set of rules that guide individuals who work with IT assets. It outlines how to protect the organization's information assets from threats, whether internal or external.",
  "Privacy Policy": "A privacy policy is a statement or legal document that discloses the ways a party gathers, uses, discloses, and manages a customer or client's data, ensuring compliance with privacy laws.",
  "Articles of Incorporation": "Also known as a certificate of incorporation, it is a set of formal documents filed with a government body to legally document the creation of a corporation.",
  "SLA": "A Service Level Agreement (SLA) is a contract between a service provider and the end user that defines the level of service expected from the service provider.",
  "Certificate of Insurance": "A certificate of insurance is a document used to provide information on specific insurance coverage. It verifies the existence of an insurance policy and summarizes the key aspects and conditions of the policy.",
  "SOC II Report": "A Service Organization Control (SOC) 2 report is designed to provide assurances about the effectiveness of controls at a service organization relevant to security, availability, processing integrity, confidentiality, and privacy.",
  "Audited Financials": "Audited financial statements are financial reports that have been prepared by a company's management and have been reviewed by an independent auditor.",
  "Vulnerability Scans": "Vulnerability scans are automated processes used by IT services to identify security weaknesses in software and networks. They aim to detect vulnerabilities that could be exploited by attackers to gain unauthorized access to systems and data.",
  "Pen Test Report": "A Pen Test Report is a summary or report that outlines the methodologies, scope, findings, and recommendations resulting from a penetration test. This test simulates cyber attacks on a computer system to evaluate the security of the system."
}

SYSTEM_PROMPT ="""
You are an assistant who generates documents for demoing a product.

For each prompt, you are to generate HTML documents that can be printed to PDF. The documents should be styled professionally with a header and body.

Vary the content and document structure to make it look original. Do not adjust document margins.

Choose between the following fonts: serif, sans-serif.

Only output syntactically-valid HTML content. Do not include any other content in the output. Do not output markdown.

There should be one HTML block for every paragraph. All headers should be marked up with <h1>, <h2>, <h3>, etc. tags.

Generate at least 10 sections for every document, with at least one paragraph per section.
""".strip()

HTML_DIR = os.path.join(os.path.dirname(__file__), "html")
CSS_DIR = os.path.join(os.path.dirname(__file__), "css")
PDF_DIR = os.path.join(os.path.dirname(__file__), "pdf")

def random_stylesheet():
    return os.path.join(CSS_DIR, random.choice([f for f in os.listdir(CSS_DIR) if f.endswith(".css")]))

with open(os.path.join(os.path.dirname(__file__), "example_privacy_policy.html")) as f:
    privacy_policy = f.read()

with open(os.path.join(os.path.dirname(__file__), "example_pen_test_results.html")) as f:
    pen_test_results = f.read()


def user_prompt(name, company):
    description = TEMPLATES[name]
    return f"""Generate a "{name}" document for a company called "{company}". {description}"""


def generate_document(name, company):
    html_path = os.path.join(HTML_DIR, f"{company}{name}".replace(" ", "") + ".html")
    pdf_path = os.path.join(PDF_DIR, f"{company}{name}".replace(" ", "") + ".pdf")

    if os.path.exists(pdf_path):
        print(f"Skipping generation of {pdf_path}")
    else:
        resp = requests.post(
            "http://localhost:11434/api/chat",
            json={
                # censored models don't seem to like to generate financial documents...
                "model": "llama2-uncensored",
                "stream": False,
                "messages": [
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPT,
                    },
                    {
                        "role": "user",
                        "content": user_prompt("Privacy Policy", "ABC"),
                    },
                    {
                        "role": "assistant",
                        "content": privacy_policy,
                    },
                    {
                        "role": "user",
                        "content": user_prompt("Pen Test Report", "DEF"),
                    },
                    {
                        "role": "assistant",
                        "content": pen_test_results,
                    },
                    {
                        "role": "user",
                        "content": user_prompt(name, company)
                    },
                ],
            }
        )
        resp.raise_for_status()

        output = resp.json()["message"]["content"]

        with open(html_path, "w") as f:
            f.write(output)

    stylesheet = random_stylesheet()
    os.system(f"weasyprint {html_path} {pdf_path} -s {stylesheet}")


total = len(TEMPLATES) * len(COMPANIES)
i = 0
for company in COMPANIES:
    for doc in TEMPLATES.keys():
        generate_document(doc, company)
        i += 1
        print(f"Generated {i}/{total} documents")
