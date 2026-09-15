#!/usr/bin/env python3
"""Configure cPanel email catch-all, forwarders, and deploy Magento email setup."""

import json
import os
import ssl
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HOST = "node3143.myfcloud.com"
PORT = "2083"
USER = "shopbestmed"
TOKEN = os.environ.get("Cpanel_sbm_api", "")
MAIN_INBOX = "shopbestmed.com@gmail.com"
DOMAIN = "shopbestmed.com"

DEPARTMENT_ALIASES = [
    "info",
    "contact",
    "sales",
    "quotes",
    "billing",
    "support",
    "orders",
    "returns",
    "shipping",
    "accounts",
    "service",
    "help",
    "admin",
    "cs",
]


def api_post(endpoint: str, params: dict) -> dict:
    url = f"https://{HOST}:{PORT}/execute/{endpoint}"
    data = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"cpanel {USER}:{TOKEN}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    with urllib.request.urlopen(req, context=ctx, timeout=120) as resp:
        return json.loads(resp.read().decode())


def api_get(endpoint: str, params: dict = None) -> dict:
    url = f"https://{HOST}:{PORT}/execute/{endpoint}"
    if params:
        url += "?" + urllib.parse.urlencode(params, safe="/")
    req = urllib.request.Request(
        url,
        headers={"Authorization": f"cpanel {USER}:{TOKEN}"},
        method="GET",
    )
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    with urllib.request.urlopen(req, context=ctx, timeout=120) as resp:
        return json.loads(resp.read().decode())


def set_catch_all():
    result = api_post(
        "Email/set_default_address",
        {"domain": DOMAIN, "fwdopt": "fwd", "fwdemail": MAIN_INBOX},
    )
    if result.get("status") != 1:
        raise RuntimeError(f"catch-all failed: {result.get('errors')}")
    print(f"Catch-all for {DOMAIN} -> {MAIN_INBOX}")


def ensure_forwarders():
    existing = api_get("Email/list_forwarders", {"domain": DOMAIN})
    have = set()
    for row in existing.get("data") or []:
        dest = row.get("dest") or row.get("html_dest") or ""
        if dest:
            have.add(dest.split("@")[0])

    for alias in DEPARTMENT_ALIASES:
        if alias in have:
            print(f"  forwarder {alias}@ already exists")
            continue
        result = api_post(
            "Email/add_forwarder",
            {
                "domain": DOMAIN,
                "email": alias,
                "fwdopt": "fwd",
                "fwdemail": MAIN_INBOX,
            },
        )
        ok = result.get("status") == 1
        print(f"  forwarder {alias}@: {'ok' if ok else result.get('errors')}")


def deploy_magento_script():
    sys.path.insert(0, str(ROOT))
    from scripts.deploy_stripe_module import save_file

    php = (ROOT / "scripts" / "setup_shop_emails.php").read_text(encoding="utf-8")
    save_file("/public_html", "setup_shop_emails.php", php)
    print("Uploaded setup_shop_emails.php to public_html")


def main():
    if not TOKEN:
        print("ERROR: Cpanel_sbm_api not set")
        sys.exit(1)

    set_catch_all()
    print("Ensuring department forwarders...")
    ensure_forwarders()
    deploy_magento_script()
    print("\nRun on server (origin IP to bypass Cloudflare):")
    print("  curl -k -H 'Host: www.shopbestmed.com' https://ORIGIN/setup_shop_emails.php")


if __name__ == "__main__":
    main()
