import json
import os
import requests
import random
import hashlib

API_BASE = os.getenv("FP_API_BASE")
TENANT_DB_TOKEN = os.getenv("FP_TENANT_DB_TOKEN")
PARTNER_TENANT_NAME = os.getenv("PARTNER_TENANT_NAME")

ORG_SPEC = {
        "partner_tenant_name": PARTNER_TENANT_NAME,
        "partner_tenant_user_names": [
            ("Isabella", "Hayes"),
            ("Aisha", "Abdul"),
            ("Mason", "Ingram"),
            ("Ava", "Jensen"),
            ("Noah", "Kennedy"),
        ],
        "tenants": [
            {
                "name": "WealthWise",
                "user_names": [
                    ("Lucas", "Abbott"),
                    ("Maya", "Blake"),
                    ("Elijah", "Vaughn"),
                    ("Hannah", "Fletcher"),
                ],
            },
            {
                "name": "FinovaTech",
                "user_names": [
                    ("Sophia", "Diaz"),
                    ("Alexander", "Everett"),
                    ("Olivia", "Foster"),
                    ("Natalie", "Harrison"),
                ],
            },
            {
                "name": "Prosperify",
                "user_names": [
                    ("Ethan", "Gallagher"),
                    ("Rohan", "Patil"),
                    ("Logan", "Bennett"),
                    ("Christopher", "Reynolds"),
                ],
            },
            {
                "name": "CapitalEdge",
                "user_names": [
                    ("Harper", "Sullivan"),
                    ("Zara", "Ahmed"),
                    ("William", "Thompson"),
                    ("Victoria", "Walsh"),
                ],
            },
            {
                "name": "Investo",
                "user_names": [
                    ("Nora", "Dunn"),
                    ("Eli", "Gibson"),
                    ("Liam", "Henderson"),
                    ("Aria", "Kumar"),
                ],
            }
        ],
    }

# ChatGPT wrote these, don't use them elsewhere without reading.
TEMPLATES = [
    ("Business Continuity or Disaster Recovery Plan", "This document outlines procedures and instructions an organization must follow in the face of disaster, whether fire, flood, or cyberattack. The goal is to enable ongoing operations before and during execution of disaster recovery."),
    ("Information Security Policy", "An Information Security Policy is a set of rules that guide individuals who work with IT assets. It outlines how to protect the organization’s information assets from threats, whether internal or external."),
    ("Privacy Policy", "A privacy policy is a statement or legal document that discloses the ways a party gathers, uses, discloses, and manages a customer or client's data, ensuring compliance with privacy laws."),
    ("Articles of Incorporation", "Also known as a certificate of incorporation, it is a set of formal documents filed with a government body to legally document the creation of a corporation."),
    ("SLA", "A Service Level Agreement (SLA) is a contract between a service provider and the end user that defines the level of service expected from the service provider."),
    ("Certificate of Insurance", "A certificate of insurance is a document used to provide information on specific insurance coverage. It verifies the existence of an insurance policy and summarizes the key aspects and conditions of the policy."),
    ("SOC II Report", "A Service Organization Control (SOC) 2 report is designed to provide assurances about the effectiveness of controls at a service organization relevant to security, availability, processing integrity, confidentiality, and privacy."),
    ("Audited Financials", "Audited financial statements are financial reports that have been prepared by a company's management and have been reviewed by an independent auditor."),
    ('Vulnerability Scans', 'Vulnerability scans are automated processes used by IT services to identify security weaknesses in software and networks. They aim to detect vulnerabilities that could be exploited by attackers to gain unauthorized access to systems and data.'),
    ('Pen Test Report', "A Pen Test Report is a summary or report that outlines the methodologies, scope, findings, and recommendations resulting from a penetration test. This test simulates cyber attacks on a computer system to evaluate the security of the system."),
]

PDF_DIR = os.path.join(os.path.dirname(__file__), "pdf")

def str_hash(s):
    return int(hashlib.md5(s.encode()).hexdigest(), 16)

def get_doc(doc_id):
    docs = requests.get(
        url=f"{API_BASE}/partner/partnerships/{partnership_id}/documents",
        headers={
            "X-Fp-Dashboard-Authorization": random.choice(partner_tenant_users)["token"],
        },
    )
    docs.raise_for_status()
    return next(doc for doc in docs.json() if doc["id"] == doc_id)

with open("google_drive.json", "r") as f:
    google_drive_urls = {e["name"]: "https://drive.google.com/file/d/{}/view".format(e["id"]) for e in json.load(f)["files"]}

resp = requests.post(
    url=f"{API_BASE}/private/partner_demo",
    json=ORG_SPEC,
    headers={
        "X-Fp-Dashboard-Authorization": TENANT_DB_TOKEN,
    },
)
resp.raise_for_status()
body = resp.json()
partner_tenant_id = body["partner_tenant_id"]
partner_tenant_users = body["partner_tenant_users"]
tenants = body["tenants"]

# Create playbooks for each tenant
for tenant in tenants:
    for i in range(random.randint(3, 5)):
        requests.post(
            f"{API_BASE}/org/onboarding_configs",
            json={
                "name": f"Playbook {i}",
                "must_collect_data": [
                    "name",
                    "full_address",
                    "email",
                    "phone_number",
                ],
                "can_access_data": [],
            },
            headers={
                "X-Fp-Dashboard-Authorization": random.choice(tenant["users"])["token"],
                "X-Is-Live": "true",
            },
        ).raise_for_status()

for (doc_name, doc_description) in TEMPLATES:
    resp = requests.post(
        f"{API_BASE}/partner/doc_templates",
        json={
            "name": doc_name,
            "description": doc_description,
        },
        headers={
            "X-Fp-Dashboard-Authorization": random.choice(partner_tenant_users)["token"],
        },
    )
    resp.raise_for_status()
    template = resp.json()
    template_version_id = template["latest_version"]["id"]

    for tenant in tenants:
        partnership_id = tenant["partnership_id"]
        resp = requests.post(
            f"{API_BASE}/partner/partnerships/{partnership_id}/documents",
            json={
                "name": doc_name,
                "description": doc_description,
                "template_version_id": template_version_id,
            },
            headers={
                "X-Fp-Dashboard-Authorization": random.choice(partner_tenant_users)["token"],
            },
        )
        resp.raise_for_status()
        summary = resp.json()
        doc_id = summary["id"]
        request_id = summary["active_request_id"]

        should_assign_partner_user = str_hash("should assign partner" + doc_name + tenant["name"]) % 2 == 0
        if should_assign_partner_user:
            requests.post(
                f"{API_BASE}/partner/partnerships/{partnership_id}/documents/{doc_id}/assignments",
                json={
                    "user_id": random.choice(partner_tenant_users)["id"],
                },
                headers={
                    "X-Fp-Dashboard-Authorization": random.choice(partner_tenant_users)["token"],
                },
            ).raise_for_status()

        should_assign_tenant_user = str_hash("should assign tenant" + doc_name + tenant["name"]) % 2 == 0
        if should_assign_tenant_user:
            requests.post(
                f"{API_BASE}/org/partners/{partnership_id}/documents/{doc_id}/assignments",
                json={
                    "user_id": random.choice(tenant["users"])["id"],
                },
                headers={
                    "X-Fp-Dashboard-Authorization": random.choice(tenant["users"])["token"],
                },
            ).raise_for_status()


        should_submit = str_hash("should submit" + doc_name + tenant["name"]) % 20 > 5
        if not should_submit:
            continue

        filename = "{}{}.pdf".format(tenant["name"], doc_name).replace(" ", "")

        use_external_url = str_hash("use external url" + doc_name + tenant["name"]) % 2 == 0
        if use_external_url:
            requests.post(
                f"{API_BASE}/org/partners/{partnership_id}/requests/{request_id}/submissions",
                json={
                    "url": google_drive_urls[filename],
                },
                headers={
                    "X-Fp-Dashboard-Authorization": random.choice(tenant["users"])["token"],
                },
            ).raise_for_status()
        else:
            with open(os.path.join(PDF_DIR, filename), "rb") as f:
                file_content = f.read()

            requests.post(
                url=f"{API_BASE}/org/partners/{partnership_id}/requests/{request_id}/submissions/upload",
                headers={
                    "X-Fp-Dashboard-Authorization": random.choice(tenant["users"])["token"],
                },
                files={
                    "file": (filename, file_content, "application/octet-stream"),
                },
            ).raise_for_status()

        doc = get_doc(doc_id)

        should_review = str_hash("use external url" + doc_name + tenant["name"]) % 3 > 0
        if not should_review:
            continue

        decision = random.choice(["accepted"] * 7 + ["rejected"])
        if decision == "accepted":
            note = random.choice(["Looks good", "Thanks for submitting. Looks good to me.", "Approved for 2024."])
        else:
            note = random.choice(["We are passing on this partnership", "This is not the proper format", "Please resubmit with up-to-date information"])

        requests.post(
            f"{API_BASE}/partner/partnerships/{partnership_id}/documents/{doc_id}/reviews",
            json={
                "decision": decision,
                "note": note,
                "submission_id": doc["active_submission_id"],
            },
            headers={
                "X-Fp-Dashboard-Authorization": random.choice(partner_tenant_users)["token"],
            },
        ).raise_for_status()


