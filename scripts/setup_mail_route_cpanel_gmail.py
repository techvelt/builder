#!/usr/bin/env python3
"""Verify cPanel mail routing to Gmail and print required Cloudflare DNS changes."""

import json
import os
import ssl
import sys
import urllib.parse
import urllib.request

HOST = "node3143.myfcloud.com"
PORT = "2083"
USER = "shopbestmed"
TOKEN = os.environ.get("Cpanel_sbm_api", "")
DOMAIN = "shopbestmed.com"
GMAIL = "shopbestmed.com@gmail.com"
MAIL_HOST = "mail.shopbestmed.com"
SERVER_IP = "172.104.212.52"

DEPARTMENT_ALIASES = [
    "info", "contact", "sales", "quotes", "billing", "support",
    "orders", "order", "returns", "shipping", "accounts",
    "service", "help", "admin", "cs",
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


def configure_cpanel():
    api_post(
        "Email/set_default_address",
        {"domain": DOMAIN, "fwdopt": "fwd", "fwdemail": GMAIL},
    )
    existing = api_get("Email/list_forwarders", {"domain": DOMAIN})
    have = {
        (row.get("dest") or row.get("html_dest") or "").split("@")[0]
        for row in existing.get("data") or []
    }
    for alias in DEPARTMENT_ALIASES:
        if alias in have:
            continue
        api_post(
            "Email/add_forwarder",
            {
                "domain": DOMAIN,
                "email": alias,
                "fwdopt": "fwd",
                "fwdemail": GMAIL,
            },
        )


def print_cloudflare_instructions():
    print(
        """
================================================================================
CLOUDFLARE DNS CHANGES REQUIRED (DNS is on Cloudflare, not cPanel)
================================================================================

Log in: https://dash.cloudflare.com → shopbestmed.com → DNS → Records

1) ADD A record (mail server)
   Type: A
   Name: mail
   IPv4: 172.104.212.52
   Proxy: DNS only (grey cloud)  ← IMPORTANT, not orange

2) REPLACE MX record
   DELETE:
     shopbestmed.com  MX  0  shopbestmed-com.mail.protection.outlook.com

   ADD:
     shopbestmed.com  MX  0  mail.shopbestmed.com
     shopbestmed.com  MX  10 mail.shopbestmed.com   (optional backup)

3) UPDATE SPF TXT record (keep Google verifications, update SPF only)
   Name: @
   Type: TXT
   Value:
     v=spf1 mx a ip4:172.104.212.52 include:spf.protection.outlook.com ~all

   (Keeps Magento/Office365 outbound sending working + allows cPanel mail.)

4) Wait 5-30 minutes for DNS propagation, then test:
   Send to order@shopbestmed.com or orders@shopbestmed.com
   Should arrive in shopbestmed.com@gmail.com

================================================================================
CPANEL SIDE (already configured)
================================================================================
"""
    )


def main():
    if not TOKEN:
        print("ERROR: Cpanel_sbm_api not set")
        sys.exit(1)

    configure_cpanel()

    catch = api_get("Email/list_default_address", {"domain": DOMAIN})
    fw = api_get("Email/list_forwarders", {"domain": DOMAIN})
    settings = api_get("Email/get_client_settings", {"domain": DOMAIN})

    print("cPanel mail routing configured:")
    print(f"  catch-all -> {catch['data'][0]['defaultaddress']}")
    print(f"  forwarders: {len(fw.get('data', []))}")
    print(f"  mail host: {settings['data'].get('mail_domain')}")
    print(f"  server IP: {SERVER_IP}")

    print_cloudflare_instructions()


if __name__ == "__main__":
    main()
