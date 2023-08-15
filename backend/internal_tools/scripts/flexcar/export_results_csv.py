from util import call_endpoint
import argparse
import csv, os
import asyncio
from concurrent.futures import ProcessPoolExecutor
import aiohttp
import time


async def api(
    session,
    method,
    path,
    json,
    headers=None,
):
    url = os.path.join(api_base_url, path)
    try:
        async with session.request(
            method, url, auth=aiohttp.BasicAuth(api_key, ""), json=json, headers=headers
        ) as res:
            if res.status != 200:
                raise Exception(
                    f"\n\n==Api Error==\n\n {res.status}\n{await res.text()}"
                )
            json = await res.json()
            return json
    except Exception as e:
        raise Exception(f"exception {e} at url {url}")


async def get_users(
    session,
    page_size,
    cursor,
):
    base = f"entities?kind=person&page_size={page_size}"
    url = f"{base}&cursor={cursor}" if cursor else base
    res = await api(session, "GET", url, None)
    return res


async def get_all_risk_signal_reason_codes(
    session,
    fp_id,
):
    url = f"entities/{fp_id}/risk_signals"
    res = await api(session, "GET", url, None)

    def map_signal(sig):
        code = sig["reason_code"]
        return code

    codes = list(filter(lambda x: isinstance(x["reason_code"], str), res))

    return {
        "high": list(map(map_signal, filter(lambda s: s["severity"] == "high", codes))),
        "medium": list(
            map(map_signal, filter(lambda s: s["severity"] == "medium", codes))
        ),
        "low": list(map(map_signal, filter(lambda s: s["severity"] == "low", codes))),
    }


async def get_match_levels(
    session,
    fp_id,
):
    url = f"entities/{fp_id}/match_signals"
    res = await api(session, "GET", url, None)
    return {k: v["match_level"] if v is not None else None for (k, v) in res.items()}


async def get_flexcar_sub_id(
    session,
    fp_id,
):
    # url = f"entities/{fp_id}/vault/decrypt"
    # res = await api(
    #     session,
    #     "POST",
    #     url,
    #     json={
    #         "fields": ["custom.Subscriber_ID", "custom.Order_ID"],
    #         "reason": "Decrypt subscriber and order id for results export",
    #     },
    # )
    # return (res["custom.Subscriber_ID"], res["custom.Order_ID"])
    return (None, None)


HEADER = [
    "footprint_id",
    "flexcar_subscriber_id",
    "flexcar_order_id",
    "decision_status",
    "decision_reason",
    "requires_manual_review",
    "high_risk_signals",
    "medium_risk_signals",
    "low_risk_signals",
    "name_match",
    "dob_match",
    "address_match",
]


async def build_user_row(user):
    fp_id = user["id"]
    order_id = user["ordering_id"]
    print(f"...building {fp_id} {order_id}-")

    async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=5)) as session:
        tasks = [
            asyncio.ensure_future(get_all_risk_signal_reason_codes(session, fp_id)),
            asyncio.ensure_future(get_match_levels(session, fp_id)),
            asyncio.ensure_future(get_flexcar_sub_id(session, fp_id)),
        ]
        results = await asyncio.gather(*tasks)

    codes = results[0]
    match_level_map = results[1]
    (fc_sub_id, fc_order_id) = results[2]

    if user["status"] is not None:
        status = user["status"]
        manual_review = str(user["requires_manual_review"])
    else:
        status = "data_incomplete"
        manual_review = None

    if status == "pending" or status == "incomplete":
        reason = "data provided in seed file insufficient to run verification checks"
    elif status == "pass":
        reason = "user verified by footprint"
    elif status == "fail":
        reason = "user not verified by footprint"
    else:
        print(f"WARNING unknown status {status} for {fp_id}")
        reason = None

    name_match = (match_level_map["name"] or "") if "name" in match_level_map else ""
    dob_match = (match_level_map["dob"] or "") if "dob" in match_level_map else ""
    addr_match = (
        (match_level_map["address"] or "") if "address" in match_level_map else ""
    )

    row = [
        fp_id,
        fc_sub_id,
        fc_order_id,
        status,
        reason,
        manual_review,
        " | ".join(codes["high"]),
        " | ".join(codes["medium"]),
        " | ".join(codes["low"]),
        name_match,
        dob_match,
        addr_match,
    ]

    assert len(row) == len(HEADER)
    return row


async def run(
    page_size,
    cursor,
    num_pages,
    out_file_path,
):
    with open(out_file_path, "a") as f:
        writer = csv.writer(f)

        if os.stat(out_file_path).st_size == 0:
            writer.writerow(HEADER)

        read_pages = 0
        initial = True
        total_rows = 0
        while cursor is not None or initial:
            initial = False
            if num_pages is not None and read_pages >= int(num_pages):
                print(f"exiting after reading {read_pages} pages with cursor={cursor}")
                break

            async with aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=5)
            ) as session:
                user_results = await get_users(session, page_size, cursor)
            users = user_results["data"]
            meta = user_results["meta"]
            count = len(users)

            cursor = meta["next"] if "next" in meta else None
            read_pages += 1

            print(f"fetched {count} users, cursor is {cursor}")

            users = await asyncio.gather(
                *[asyncio.ensure_future(build_user_row(u)) for u in users]
            )
            writer.writerows(users)
            print(f"wrote {len(users)} rows")
            total_rows += len(users)

    print(f"wrote {total_rows}")


def main():
    parser = argparse.ArgumentParser(
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument(
        "--api-base-url",
        help="Footprint API base url",
        required=True,
        default="https://api.onefootprint.com",
    )
    parser.add_argument("--api-key", help="API Key", required=True)
    parser.add_argument("--page-size", help="page size", required=False, default=64)
    parser.add_argument(
        "--cursor", help="starting cursor index", required=False, default=None
    )
    parser.add_argument(
        "--num-pages",
        help="Maximum number of pages to process (omit to process all)",
        required=False,
    )
    parser.add_argument(
        "--api-log-file-path",
        help="Path to file to *append* raw log of requests and responses to",
        required=False,
        default="api_call_log.out",
    )
    parser.add_argument(
        "--out-file",
        help="Path to file to *append* exports lines to",
        required=False,
        default=f"results_{int(time.time())}.out.csv",
    )

    args = parser.parse_args()
    config = vars(args)

    global api_base_url
    global api_key
    global api_log_file_path

    api_base_url = config["api_base_url"]
    api_key = config["api_key"]
    api_log_file_path = config["api_log_file_path"]

    asyncio.run(
        run(
            int(config["page_size"]),
            config["cursor"],
            config["num_pages"],
            config["out_file"],
        )
        # status_test()
    )


# some fun perf things :)
async def status(session, i):
    url = os.path.join(api_base_url, f"status?i={i}")
    async with session.get(url) as res:
        if res.status != 200:
            print(f"got {res.status}: {await res.text()}")


async def check_test():
    async with aiohttp.ClientSession() as session:
        tasks = [asyncio.ensure_future(status(session, i)) for i in range(0, 10000)]
        await asyncio.gather(*tasks)


if __name__ == "__main__":
    main()
