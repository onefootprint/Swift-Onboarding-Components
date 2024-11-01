import arrow
import argparse
import stripe
from PyInquirer import prompt
from termcolor import colored
from tabulate import tabulate
from dotenv import load_dotenv
import os

load_dotenv()

stripe.api_key = os.environ["STRIPE_API_KEY"]


SMALL_INVOICE_NOTIONAL_CENTS = 500_00


def dollar_fmt(amount_cents: int):
    return f"${(amount_cents / 100):,.2f}"


def price_fmt(amount_cents: str):
    amount = f"${(float(amount_cents) / 100):,}".rstrip("0").rstrip(".")
    # Always have at least 2 decimal points
    if "." not in amount:
        return f"{amount}.00"
    missing_0s = 2 - len(amount.split(".")[1])
    return f"{amount}{'0' * missing_0s}"


def get_invoices(billing_interval: str):
    invoices = stripe.Invoice.list(limit=100, status="draft", expand=["data.customer"])
    invoices = [
        i
        for i in invoices
        if i.metadata.get("auto-managed", False)
        and i.metadata.get("billing-interval", None) == billing_interval
    ]
    print("\n\nInvoices found:")
    for i in invoices:
        print(f"{dollar_fmt(i.amount_due)} for {i.customer.name}")
    return invoices


def print_invoice_comparison(invoice: stripe.Invoice):
    """Given an invoice, prints the line items compared to the last month's invoice."""
    print("\n\n===================================================")
    print(
        f"{colored(invoice.customer.name, 'green')} {invoice.customer.email}: {dollar_fmt(invoice.amount_due)}"
    )
    print("===================================================")
    print(f"Customer: https://dashboard.stripe.com/customers/{invoice.customer.id}")
    pricing_doc = invoice.customer.metadata.get("pricing-doc", None)
    print(colored(f"Pricing doc: {pricing_doc}", "red" if not pricing_doc else None))

    # Fetch the last month's invoice for this customer, if any
    billing_interval = invoice.metadata.get("billing-interval")
    last_billing_interval = (
        arrow.get(billing_interval).shift(months=-1).format("YYYY-MM")
    )
    search_invoices = stripe.Invoice.search(
        query=f'customer:"{invoice.customer.id}" AND -status:"draft" AND metadata["billing-interval"]:"{last_billing_interval}"',
        expand=["data.customer"],
    )
    last_month_invoice = next(iter(search_invoices.data), None)

    print(f"Invoice: https://dashboard.stripe.com/invoices/{invoice.id}")
    print(
        f"Last invoice: https://dashboard.stripe.com/invoices/{last_month_invoice.id}"
        if last_month_invoice
        else "Last invoice: None"
    )

    # Fetch the line items for each invoice
    get_lis = lambda id: list(
        reversed(stripe.Invoice.list_lines(id, expand=["data.price.product"]).data)
    )
    this_month = get_lis(invoice.id)
    last_month = get_lis(last_month_invoice.id) if last_month_invoice else []

    get_li = lambda lines, product_name: next(
        (li for li in lines if li.price.product.name == product_name), None
    )
    lines = []

    def add_line(product_name: str):
        this_month_li = get_li(this_month, product_name)
        last_month_li = get_li(last_month, product_name)
        line = [
            colored(product_name, "red" if "Uncontracted" in product_name else None),
            # Current month LI
            f"{this_month_li.quantity:,}" if this_month_li else "-",
            (
                price_fmt(this_month_li.price.unit_amount_decimal)
                if this_month_li
                else "-"
            ),
            dollar_fmt(this_month_li.amount) if this_month_li else "-",
            # Last month LI
            f"{last_month_li.quantity:,}" if last_month_li else "-",
            (
                price_fmt(last_month_li.price.unit_amount_decimal)
                if last_month_li
                else "-"
            ),
            dollar_fmt(last_month_li.amount) if last_month_li else "-",
        ]
        if line[1] == "-" and line[4] != "-":
            # The quantity for this line item is 0, but it was non-zero last month
            line[1] = colored(line[1], "red")
        if line[2] != "-" and line[2] != line[5]:
            # The price for this line item has changed since last month, highlight it
            line[2] = colored(line[2], "yellow")
        lines.append(line)

    # Add all lines for the current month's invoice
    for li in this_month:
        add_line(li.price.product.name)

    # And any other products that were only included in last month's invoice
    for li in last_month:
        if li.price.product.name in (li.price.product.name for li in this_month):
            continue
        add_line(li.price.product.name)

    HEADERS = [
        "Product",
        "Qty",
        "Unit price",
        "Amount",
        "Last qty",
        "Last unit price",
        "Last amount",
    ]
    total_line = (
        "Total",
        "",
        "",
        dollar_fmt(invoice.total),
        "",
        "",
        dollar_fmt(getattr(last_month_invoice, "total", 0)),
    )
    lines.append(["-" * len(c) for c in HEADERS])
    lines.append(total_line)

    print("")
    print(
        tabulate(lines, headers=HEADERS, tablefmt="orgtbl", intfmt=",", floatfmt=",.2f")
    )
    print("")

    # Print various warnings
    if not invoice.metadata.get("send-automatically", False):
        print(colored("Note: not marked as send-automatically", "yellow"))
    if not last_month_invoice:
        print(colored("Note: no previous invoice", "red"))
    if any("minimum" in li.price.product.name.lower() for li in this_month):
        print(colored("Note: includes monthly minimum", "red"))
    if not invoice.customer_email:
        print(colored("Note: No customer email on file", "red"))

    print("")


def send_invoice(invoice: stripe.Invoice):
    print_invoice_comparison(invoice)

    # Ask for confirmation
    question = {
        "type": "confirm",
        "message": f"Do you want to finalize {invoice.customer.name}'s invoice and send to {invoice.customer_email}?",
        "name": "confirm",
        "default": False,
    }
    response = prompt([question])
    if not response:
        exit(0)
    if not response.get("confirm"):
        return

    print("")

    for item in invoice.lines.data:
        if item.amount == 0:
            print(f"Deleting 0c item {item.id}. Invoice ID: {invoice.id}")
            stripe.InvoiceItem.delete(item.id)

    payment_methods = ["ach_credit_transfer", "us_bank_account"]
    if invoice.total < SMALL_INVOICE_NOTIONAL_CENTS:
        # For small invoices, let tenants pay via card
        payment_methods.append("card")
        payment_methods.append("cashapp")

    # TODO next month: some of these might fail for customers that don't have a billing email
    invoice_update = dict(
        # These settings are also set by the backend when the customer has an email associated with their
        # profile. But if the user's email is added after the invoice is generated, these settings need
        # to all be set manually...
        collection_method="send_invoice",
        days_until_due=30,
        payment_settings=dict(payment_method_types=payment_methods),
    )
    if invoice.customer_email:
        invoice_update["auto_advance"] = True
    print("Setting invoice settings...")
    stripe.Invoice.modify(invoice.id, **invoice_update)

    print("Finalizing invoice...")
    stripe.Invoice.finalize_invoice(invoice.id)

    print(
        colored(
            f"Invoice finalized! https://dashboard.stripe.com/invoices/{invoice.id}",
            "light_green",
        )
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        prog="Send invoices",
    )
    parser.add_argument("-d", "--date", required=True)
    args = parser.parse_args()
    date = args.date

    invoices = get_invoices(args.date)
    for invoice in invoices:
        send_invoice(invoice)
