import csv


class BacktestUser:

    def __init__(
        self,
        external_id,
        email,
        phone,
        first_name,
        last_name,
        dob,
        address_line1,
        city,
        state,
        zip,
        country,
        drivers_license_number,
    ):
        self.external_id = external_id
        self.email = email
        self.phone = phone
        self.first_name = first_name
        self.last_name = last_name
        self.dob = dob
        self.address_line1 = address_line1
        self.city = city
        self.state = state
        self.zip = zip
        self.country = country
        self.drivers_license_number = drivers_license_number


class BacktestData:
    def __init__(self, users, ids):
        self.users = users
        self.ids = ids

    def ordered_users(self):
        return [self.users[id] for id in self.ids]


def parse_backtest_data(seed_file_path):
    with open(seed_file_path, "r") as f:
        data = list(csv.DictReader(f))

    users = {}
    ids = []
    for row in data:
        user = BacktestUser(
            external_id=row["external_id"],
            email=row["email"],
            phone=row["phone"],
            first_name=row["first_name"],
            last_name=row["last_name"],
            dob=row["dob"],
            address_line1=row["address_line1"],
            city=row["city"],
            state=row["state"],
            zip=row["zip"],
            country=row["country"],
            drivers_license_number=row["drivers_license_number"],
        )
        users[user.external_id] = user
        ids.append(user.external_id)

    return BacktestData(users, ids)
