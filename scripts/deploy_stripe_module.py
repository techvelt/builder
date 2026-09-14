#!/usr/bin/env python3
"""Deploy ShopBestMed StripeDeferred module to cPanel Magento via API."""

import json
import os
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULE_SRC = ROOT / "magento" / "app" / "code" / "ShopBestMed" / "StripeDeferred"
REMOTE_BASE = "/public_html/app/code/ShopBestMed/StripeDeferred"

HOST = "node3143.myfcloud.com"
PORT = "2083"
USER = "shopbestmed"
TOKEN = os.environ.get("Cpanel_sbm_api", "")


def api_call(endpoint: str, params: dict = None):
    import ssl

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
        result = json.loads(resp.read().decode())
    if not result.get("data") and result.get("errors"):
        raise RuntimeError(f"API {endpoint} failed: {result['errors']}")
    return result


def _api_post(endpoint: str, data: bytes, content_type: str) -> dict:
    import ssl
    from urllib.request import Request, urlopen

    url = f"https://{HOST}:{PORT}/execute/{endpoint}"
    req = Request(
        url,
        data=data,
        headers={
            "Authorization": f"cpanel {USER}:{TOKEN}",
            "Content-Type": content_type,
        },
        method="POST",
    )
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    with urlopen(req, context=ctx, timeout=120) as resp:
        return json.loads(resp.read().decode())


def save_file_content(remote_dir: str, filename: str, content: str) -> dict:
    data = urllib.parse.urlencode({
        "dir": remote_dir,
        "file": filename,
        "content": content,
    }).encode()
    result = _api_post("Fileman/save_file_content", data, "application/x-www-form-urlencoded")
    if result.get("errors"):
        raise RuntimeError(f"Failed to save {remote_dir}/{filename}: {result['errors']}")
    return result


def upload_file(remote_dir: str, filename: str, content: str) -> dict:
    import io

    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body = io.BytesIO()
    body.write(f"--{boundary}\r\n".encode())
    body.write(f'Content-Disposition: form-data; name="dir"\r\n\r\n'.encode())
    body.write(f"{remote_dir}\r\n".encode())
    body.write(f"--{boundary}\r\n".encode())
    body.write(
        f'Content-Disposition: form-data; name="file-1"; filename="{filename}"\r\n'.encode()
    )
    body.write(b"Content-Type: application/octet-stream\r\n\r\n")
    body.write(content.encode("utf-8"))
    body.write(f"\r\n--{boundary}--\r\n".encode())
    return _api_post(
        "Fileman/upload_files",
        body.getvalue(),
        f"multipart/form-data; boundary={boundary}",
    )


def save_file(remote_dir: str, filename: str, content: str):
    """Upload new files or overwrite existing ones."""
    result = upload_file(remote_dir, filename, content)
    if result.get("status") == 1 and result.get("data", {}).get("succeeded", 0) > 0:
        return result
    # File may already exist — overwrite via save_file_content
    return save_file_content(remote_dir, filename, content)


def ensure_dir(remote_dir: str):
    try:
        api_call("Fileman/list_files", {"dir": urllib.parse.quote(remote_dir, safe="")})
    except Exception:
        pass


def deploy_module():
    if not TOKEN:
        print("ERROR: Cpanel_sbm_api not set")
        sys.exit(1)

    files = list(MODULE_SRC.rglob("*"))
    files = [f for f in files if f.is_file()]
    print(f"Deploying {len(files)} files to {REMOTE_BASE}")

    for local_path in sorted(files):
        rel = local_path.relative_to(MODULE_SRC)
        remote_dir = REMOTE_BASE + "/" + str(rel.parent).replace("\\", "/")
        if str(rel.parent) == ".":
            remote_dir = REMOTE_BASE

        content = local_path.read_text(encoding="utf-8")
        print(f"  -> {rel}")
        save_file(remote_dir, rel.name, content)

    print("Module files deployed.")


def patch_env_php():
    """Add Stripe keys to env.php from environment."""
    secret = os.environ.get("sbm_stripe_secret") or os.environ.get("hytale_stripe_secret", "")
    publishable = os.environ.get("sbm_stripe_publishable_key") or os.environ.get("hytle_stripe_publishable_key", "")

    if not secret:
        print("WARNING: No Stripe secret key found in environment")
        return

    result = api_call(
        "Fileman/get_file_content",
        {"dir": "/public_html/app/etc", "file": "env.php"},
    )
    data = result.get("data") or {}
    content = data.get("content")
    if not content:
        print("WARNING: Could not read env.php content")
        return

    stripe_block = f"""
    'shopbestmed' => [
        'stripe' => [
            'secret_key' => '{secret}',
            'publishable_key' => '{publishable}',
        ],
    ],"""

    if "'shopbestmed'" in content:
        print("env.php already has shopbestmed config")
        return

    # Insert before closing bracket of return array
    content = content.rstrip()
    if content.endswith("];"):
        content = content[:-2] + "," + stripe_block + "\n];\n"
    else:
        print("WARNING: Could not patch env.php automatically")
        return

    save_file("/public_html/app/etc", "env.php", content)
    print("env.php updated with Stripe keys (keys not printed)")


def patch_config_php():
    """Enable ShopBestMed_StripeDeferred module in config.php."""
    result = api_call(
        "Fileman/get_file_content",
        {"dir": "/public_html/app/etc", "file": "config.php"},
    )
    data = result.get("data") or {}
    content = data.get("content")
    if not content:
        print("WARNING: Could not read config.php content")
        return

    if "ShopBestMed_StripeDeferred" in content:
        print("Module already enabled in config.php")
        return

    # Insert before final closing of modules array
    marker = "'CardknoxDevelopment_Cardknox' => 1,"
    if marker in content:
        content = content.replace(
            marker,
            marker + "\n  'ShopBestMed_StripeDeferred' => 1,",
            1,
        )
    else:
        content = re.sub(
            r"\n\);\s*$",
            "\n  'ShopBestMed_StripeDeferred' => 1,\n);",
            content,
            count=1,
        )

    # Overwrite existing config.php via upload (file exists)
    save_file("/public_html/app/etc", "config.php", content)
    print("config.php updated")


def write_setup_scripts():
    """Write one-time setup scripts to run on the server."""
    payment_php = """<?php
use Magento\\Framework\\App\\Bootstrap;
require __DIR__ . '/app/bootstrap.php';
$params = $_SERVER;
$params[\\Magento\\Store\\Model\\StoreManager::PARAM_RUN_CODE] = 'admin';
$params[\\Magento\\Store\\Model\\StoreManager::PARAM_RUN_TYPE] = 'store';
$bootstrap = Bootstrap::create(BP, $params);
$om = $bootstrap->getObjectManager();
$state = $om->get(\\Magento\\Framework\\App\\State::class);
try { $state->setAreaCode('adminhtml'); } catch (\\Exception $e) {}

$configWriter = $om->get(\\Magento\\Framework\\App\\Config\\Storage\\WriterInterface::class);
$disable = ['cardknox','cardknox_cc_vault','paypal_express','braintree','authorizenet_acceptjs','checkmo','cashondelivery','banktransfer','purchaseorder','free'];
foreach ($disable as $m) {
    $configWriter->save('payment/' . $m . '/active', '0', 'default', 0);
}
$configWriter->save('payment/shopbestmed_stripe/active', '1', 'default', 0);
echo "Payment methods updated.\\n";
"""

    upgrade_php = """<?php
use Magento\\Framework\\App\\Bootstrap;
require __DIR__ . '/app/bootstrap.php';
$bootstrap = Bootstrap::create(BP, $_SERVER);
$om = $bootstrap->getObjectManager();
$installer = $om->get(\\Magento\\Framework\\Setup\\UpgradeInterface::class);
$setup = $om->create(\\Magento\\Setup\\Model\\Installer::class);
passthru('php ' . escapeshellarg(BP . '/bin/magento') . ' setup:upgrade 2>&1', $code);
passthru('php ' . escapeshellarg(BP . '/bin/magento') . ' cache:flush 2>&1', $code2);
echo "setup:upgrade and cache:flush complete.\\n";
"""

    save_file("/public_html", "setup_stripe_payment.php", payment_php)
    save_file("/public_html", "setup_stripe_upgrade.php", upgrade_php)
    print("Wrote setup_stripe_payment.php and setup_stripe_upgrade.php")


if __name__ == "__main__":
    deploy_module()
    patch_env_php()
    patch_config_php()
    write_setup_scripts()
    print("\nNext steps on server:")
    print("  php bin/magento setup:upgrade")
    print("  php bin/magento cache:flush")
    print("  php setup_stripe_payment.php  (or visit /setup_stripe_payment.php once)")
