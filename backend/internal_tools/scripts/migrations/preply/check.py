import json
import click
import requests


@click.command()
@click.option("--api-key", envvar="FP_API_KEY", required=True)
def main(api_key):
    with open("classified.json", "r") as f:
        data = list(json.load(f))

    id_cards = []
    sessions = []
    for o in data:
        id = o["session_id"]
        ext_id = f"id-session-{id}"
        res = requests.get(
            f"https://api.onefootprint.com/users?external_id={ext_id}",
            headers={
                "X-Footprint-Secret-Key": api_key,
            },
        )
        res.raise_for_status()
        j = res.json()["data"]
        # print(f"\n\nsession={id}")
        # print(j)
        # print(j[0]["id"])
        sessions.append({"id": j[0]["id"], "session": id})

        if o["document_kind"] == "id_card":
            id_cards.append(id)
    # print(json.dumps(sessions, indent=2))
    print(id_cards)


if __name__ == "__main__":
    main()
