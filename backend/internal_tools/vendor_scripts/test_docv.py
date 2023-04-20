import requests as r
import json
import argparse
import base64


def load_secrets():
    from dotenv import load_dotenv
    import os

    load_dotenv()

    return {
        "incode_api": os.getenv("INCODE_API_KEY"),
        "idology_un": os.getenv("IDOLOGY_USERNAME"),
        "idology_pw": os.getenv("IDOLOGY_PASSWORD"),
    }


def encode_as_b64(path):
    with open(path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode("ascii")

    return encoded_string


def incode_url(s):
    return f"https://demo-api.incodesmile.com/{s}"


def default_headers():
    api_key = load_secrets()["incode_api"]
    return {
        "api-version": "1.0",
        "Content-Type": "application/json",
        "x-api-key": api_key,
    }


def start_session():
    headers = default_headers()
    data = {"countryCode": "ALL", "configurationId": "643450886f6f92d20b27599b"}
    resp = r.post(incode_url("omni/start"), headers=headers, json=data)
    return resp.json()["token"]


def add_side(token, b64_image, side):
    if side == "front":
        url = incode_url("omni/add/front-id/v2?onlyFront=false")
    else:
        url = incode_url("omni/add/back-id/v2?retry=false")

    headers = default_headers()
    headers["X-Incode-Hardware-Id"] = token
    data = {"base64Image": b64_image}

    resp = r.post(url, headers=headers, json=data)
    j = resp.json()
    if j["classification"] and j["readability"]:
        print(f"{side} accepted")
    return resp.json()


def process_id(token):
    url = incode_url("omni/process/id")
    headers = default_headers()
    headers["X-Incode-Hardware-Id"] = token
    resp = r.post(url, headers=headers)

    return resp.json()["success"]


def fetch_score(token):
    url = incode_url("omni/get/score")
    headers = default_headers()
    headers["X-Incode-Hardware-Id"] = token

    resp = r.get(url, headers=headers)
    j = resp.json()
    print("~~~=====INCODE====~~~\n\n")
    print(f"=====OVERALL=====\n{j['overall']}\n\n")
    print(f"=====ID VALIDATION=====\n")
    for t in list(j["idValidation"]["photoSecurityAndQuality"]):
        print(f"test: {t['key']} result: {t['status']}")
    for t in list(j["idValidation"]["idSpecific"]):
        print(f"test: {t['key']} result: {t['status']}")
    print("=====END INCODE=====\n\n\n")


def send_incode(front, back):
    print("....sending incode request")
    token = start_session()
    resp_front = add_side(token, front, "front")
    resp_back = add_side(token, back, "back")
    result = process_id(token)
    fetch_score(token)


#####
# idology


def idology_req(un, pw, front, back, country_code, doc_type):
    return {
        "username": un,
        "password": pw,
        "output": "json",
        "image": front,
        "backImage": back,
        "countryCode": country_code,
        "scanDocumentType": doc_type,
    }


def send_idology(front, back):
    secrets = load_secrets()
    print("....sending idology request")
    un = secrets["idology_un"]
    pw = secrets["idology_pw"]
    req = idology_req(un, pw, front, back, "USA", "driverLicense")
    resp = r.post("https://web.idologylive.com/api/scan-capture.svc", data=req)
    j = resp.json()
    print("~~======IDOLOGY======~~")
    print(f"result: {j['response']['capture-result']['key']}")
    print(f"qualifiers: {j['response']['qualifiers']}")


if __name__ == "__main__":
    try:
        parser = argparse.ArgumentParser()
        parser.add_argument(dest="front_path", help="front")
        parser.add_argument(dest="back_path", help="back")
        args = parser.parse_args()
        front = encode_as_b64(args.front_path)
        back = encode_as_b64(args.back_path)

        # send reqs
        send_incode(front, back)
        send_idology(front, back)

    except KeyboardInterrupt:
        import sys

        print("\nkeyboard interrupt, exiting")
        sys.exit()
