#!/usr/bin/env python3
"""Emergency restore of corrupted Magento CMS blocks from Wayback Machine."""

import json
import re
import ssl
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WAYBACK_URL = "http://web.archive.org/web/2024id_/https://www.shopbestmed.com/"

TITLES = {
    1: "Footer Bar",
    2: "Footer Links",
    3: "Footer Contact",
    4: "Footer Logos",
    5: "Footer Copyright and Cards",
    6: "Home Categories",
    7: "Home Callouts",
    8: "Home Bulk Orders",
    9: "Footer Contact Form",
    10: "Telephone Header Link",
    11: "Stainless Steel Casework Featured Products",
    12: "Med Equip Product Slider",
    13: "Content Blanket Fluid Warming",
    14: "Cart Disclaimers",
    15: "Tax Exempt",
    16: "Bone Forceps",
    32: "Home Featured New",
    33: "Home Categories New",
    34: "New Footer Links",
    60: "Home CSS Slider",
    61: "Home CSS Slider V2",
}

NEW_FOOTER = (ROOT / "scripts" / "setup_shop_emails.php").read_text(encoding="utf-8")
footer_match = re.search(r"\$newFooterContent = <<<'HTML'\n(.*)\nHTML;", NEW_FOOTER, re.DOTALL)
NEW_FOOTER_HTML = footer_match.group(1) if footer_match else ""

FOOTER_CONTACT = '{{block class="Magento\\Contact\\Block\\ContactForm" name="contactForm" template="Magento_Contact::form.phtml"}}'


def fetch_wayback() -> str:
    req = urllib.request.Request(WAYBACK_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=90) as resp:
        return resp.read().decode("utf-8", errors="replace")


def extract_blocks(html: str) -> dict:
    chunks = re.split(r'<div class="widget block block-static-block">\s*', html)
    slider = chunks[2]
    slider_end = slider.find("<div class=home-callouts>")
    slider_html = slider[:slider_end].rstrip() if slider_end > 0 else slider

    def chunk(i: int) -> str:
        return chunks[i].strip()

    return {
        "telephone-header-link": re.sub(r"</div>.*$", "", chunk(1), flags=re.DOTALL),
        "home-cssslider-v2": slider_html,
        "home-css-slider": slider_html,
        "home-callouts": chunk(3).split("<div class=home-featured-columns>")[0].strip(),
        "home-featured-new": re.search(
            r"<div class=home-featured-columns>.*?</div>\s*</div>\s*</div>",
            html,
            re.DOTALL,
        ).group(0),
        "home-categories-new": re.search(
            r"<div class=categories-home>.*?</div>\s*</div>",
            html,
            re.DOTALL,
        ).group(0),
        "footer-copyright": (
            '<div class="copyright-cards"><p class="cright">&copy; 2026 ShopBestMed. All rights reserved.</p>'
            '<p class="creditcards"><img src="/pub/media/credit-cards.png" alt=""></p></div>'
        ),
        "new-footer-links": NEW_FOOTER_HTML,
        "footer-contact": FOOTER_CONTACT,
    }


def build_restore_payload(blocks: dict) -> dict:
    payload = {"blocks": [], "clear_remaining": True}
    for identifier, content in blocks.items():
        payload["blocks"].append({"identifier": identifier, "content": content})
    return payload


def upload_and_run(payload: dict):
    sys.path.insert(0, str(ROOT))
    from scripts.deploy_stripe_module import save_file

    php = """<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
use Magento\\Framework\\App\\Bootstrap;
require __DIR__ . '/app/bootstrap.php';
$params = $_SERVER;
$params[\\Magento\\Store\\Model\\StoreManager::PARAM_RUN_CODE] = 'admin';
$params[\\Magento\\Store\\Model\\StoreManager::PARAM_RUN_TYPE] = 'store';
$bootstrap = Bootstrap::create(BP, $params);
$om = $bootstrap->getObjectManager();
$state = $om->get(\\Magento\\Framework\\App\\State::class);
try { $state->setAreaCode('adminhtml'); } catch (\\Exception $e) {}
$conn = $om->get(\\Magento\\Framework\\App\\ResourceConnection::class)->getConnection();
$data = json_decode(file_get_contents(__DIR__ . '/restore_cms_payload.json'), true);
$titles = json_decode('""" + json.dumps(TITLES).replace("'", "\\'") + """', true);
$restored = 0;
foreach ($data['blocks'] as $block) {
    $identifier = $block['identifier'];
    $row = $conn->fetchRow('SELECT block_id, identifier FROM cms_block WHERE identifier = ?', [$identifier]);
    if (!$row) { echo "missing: $identifier\\n"; continue; }
    $blockId = (int)$row['block_id'];
    $title = $titles[$blockId] ?? ucwords(str_replace(['-', '_'], ' ', $identifier));
    $conn->query('UPDATE cms_block SET content = ?, title = ? WHERE block_id = ?', [$block['content'], $title, $blockId]);
    $restored++;
    echo "restored: $identifier (id $blockId)\\n";
}
if (!empty($data['clear_remaining'])) {
    $ids = array_column($data['blocks'], 'identifier');
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $sql = "UPDATE cms_block SET content = '' WHERE identifier NOT IN ($placeholders) AND (content LIKE '%The Professional Source for Medical Supplies%' OR content LIKE '%quotes@shopbestmed.com%')";
    $cleared = $conn->query($sql, $ids)->rowCount();
    echo "cleared corrupted blocks: $cleared\\n";
}
$cache = $om->get(\\Magento\\Framework\\App\\Cache\\TypeListInterface::class);
foreach (['config', 'full_page', 'block_html'] as $type) { $cache->cleanType($type); }
passthru('php ' . escapeshellarg(BP . '/bin/magento') . ' cache:flush 2>&1');
echo "done\\n";
"""

    save_file("/public_html", "restore_cms_payload.json", json.dumps(payload))
    save_file("/public_html", "restore_cms.php", php)
    print("Uploaded restore scripts")


def main():
    print("Fetching Wayback homepage...")
    html = fetch_wayback()
    blocks = extract_blocks(html)
    payload = build_restore_payload(blocks)
    print("Blocks to restore:", ", ".join(blocks))
    upload_and_run(payload)
    print("Run: curl -k -H 'Host: www.shopbestmed.com' https://ORIGIN/restore_cms.php")


if __name__ == "__main__":
    main()
