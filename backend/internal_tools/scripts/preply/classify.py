import os, json


def main():
    sessions = 100
    classified = []

    for i in range(sessions):
        session_dir = f"./data/session_{i+1}"
        files = os.listdir(session_dir)

        files = list(filter(lambda x: x != ".DS_Store", files))
        get_filename = lambda name: f"data/session_{i+1}/session_{i+1}_{name}.jpg"

        object = None
        # assume identity card
        if len(files) == 3:
            object = {
                "document_kind": "id_card",
                "front": get_filename("front"),
                "back": get_filename("back"),
                "selfie": get_filename("face"),
            }

        elif len(files) == 2:
            object = {
                "document_kind": "passport",
                "front": get_filename("front"),
                "selfie": get_filename("face"),
            }
        else:
            raise Exception(f"Unexpected number of files in {session_dir} {files}")

        object["session_id"] = i + 1
        classified.append(object)

    classified_json = json.dumps(classified, indent=2)
    print(classified_json)


if __name__ == "__main__":
    main()
