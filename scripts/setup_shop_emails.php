<?php
/**
 * One-time Magento email + CMS update for Shop Best Med.
 * Run from public_html: php setup_shop_emails.php
 */
use Magento\Framework\App\Bootstrap;

require __DIR__ . '/app/bootstrap.php';

$params = $_SERVER;
$params[\Magento\Store\Model\StoreManager::PARAM_RUN_CODE] = 'admin';
$params[\Magento\Store\Model\StoreManager::PARAM_RUN_TYPE] = 'store';

$bootstrap = Bootstrap::create(BP, $params);
$om = $bootstrap->getObjectManager();
$state = $om->get(\Magento\Framework\App\State::class);
try {
    $state->setAreaCode('adminhtml');
} catch (\Exception $e) {
}

$configWriter = $om->get(\Magento\Framework\App\Config\Storage\WriterInterface::class);
$conn = $om->get(\Magento\Framework\App\ResourceConnection::class)->getConnection();

$identities = [
    'trans_email/ident_general/name' => 'Shop Best Medical',
    'trans_email/ident_general/email' => 'info@shopbestmed.com',
    'trans_email/ident_sales/name' => 'Shop Best Medical Sales',
    'trans_email/ident_sales/email' => 'sales@shopbestmed.com',
    'trans_email/ident_support/name' => 'Shop Best Medical Support',
    'trans_email/ident_support/email' => 'support@shopbestmed.com',
    'trans_email/ident_custom1/name' => 'Shop Best Medical Quotes',
    'trans_email/ident_custom1/email' => 'quotes@shopbestmed.com',
    'trans_email/ident_custom2/name' => 'Shop Best Medical Billing',
    'trans_email/ident_custom2/email' => 'billing@shopbestmed.com',
    'contact/email/recipient_email' => 'info@shopbestmed.com',
    'sales_email/order/copy_to' => 'orders@shopbestmed.com,info@shopbestmed.com',
    'sales_email/order_comment/copy_to' => 'support@shopbestmed.com',
    'sales_email/invoice/copy_to' => 'billing@shopbestmed.com',
    'sales_email/invoice_comment/copy_to' => 'billing@shopbestmed.com',
    'sales_email/shipment/copy_to' => 'shipping@shopbestmed.com',
    'sales_email/shipment_comment/copy_to' => 'shipping@shopbestmed.com',
    'sales_email/creditmemo/copy_to' => 'billing@shopbestmed.com',
    'sales_email/creditmemo_comment/copy_to' => 'billing@shopbestmed.com',
];

foreach ($identities as $path => $value) {
    $configWriter->save($path, $value, 'default', 0);
    echo "config: $path = $value\n";
}

$footerContent = <<<'HTML'
<div class="footer-links">
<div class="link -footera">
<h4>Corporate Info</h4>
<p>Phone:</p>
<p><a href="tel:1-855-819-2200">855-819-2200</a></p>
<p>Email:</p>
<p><a href="mailto:info@shopbestmed.com">info@shopbestmed.com</a></p>
</div>
<div class="link -footerb">
<h4>Customer Service</h4>
<p><a href="{{config path="web/secure/base_url"}}about-shop-best-medical">About us</a></p>
<p><a href="{{config path="web/secure/base_url"}}privacy-policy-cookie-restriction-mode">Privacy Policy</a></p>
<p><a href="{{config path="web/secure/base_url"}}frequently-asked-questions#shipping">Shipping Policy</a></p>
<p><a href="{{config path="web/secure/base_url"}}frequently-asked-questions">FAQ</a></p>
</div>
<div class="link -footerc">
<h4>Account Links</h4>
<p><a href="{{config path="web/secure/base_url"}}customer/account/">My Account</a></p>
<p><a href="{{config path="web/secure/base_url"}}sales/order/history/">Order History</a></p>
<p><a href="{{config path="web/secure/base_url"}}sales/guest/form/">Track your Order</a></p>
<p><a href="{{config path="web/secure/base_url"}}wishlist/">My Wishlist</a></p>
</div>
<div class="link -footerd">
<h4>Department Emails</h4>
<p><a href="mailto:sales@shopbestmed.com">sales@shopbestmed.com</a> — Sales</p>
<p><a href="mailto:quotes@shopbestmed.com">quotes@shopbestmed.com</a> — Quotes</p>
<p><a href="mailto:support@shopbestmed.com">support@shopbestmed.com</a> — Support</p>
<p><a href="mailto:billing@shopbestmed.com">billing@shopbestmed.com</a> — Billing</p>
<p><a href="mailto:orders@shopbestmed.com">orders@shopbestmed.com</a> — Orders</p>
<p><a href="mailto:returns@shopbestmed.com">returns@shopbestmed.com</a> — Returns</p>
<p><a href="mailto:shipping@shopbestmed.com">shipping@shopbestmed.com</a> — Shipping</p>
<p><a href="mailto:accounts@shopbestmed.com">accounts@shopbestmed.com</a> — Accounts</p>
</div>
</div>
<div class="footer-contact">{{block class="Magento\Contact\Block\ContactForm" name="contactForm" template="Magento_Contact::form.phtml"}}</div>
<script type="text/javascript" src="https://cdn.ywxi.net/js/1.js" async></script>
HTML;

$newFooterContent = <<<'HTML'
<div class="footer-links">
<h3>The Professional Source for Medical Supplies</h3>
<div class="link -footera">
<h4>Contact</h4>
<p>Phone: <a href="tel:1-855-819-2200">855-819-2200</a></p>
<p><a href="mailto:info@shopbestmed.com">info@shopbestmed.com</a> — General</p>
<p><a href="mailto:sales@shopbestmed.com">sales@shopbestmed.com</a> — Sales</p>
<p><a href="mailto:quotes@shopbestmed.com">quotes@shopbestmed.com</a> — Quotes</p>
<p><a href="mailto:support@shopbestmed.com">support@shopbestmed.com</a> — Support</p>
<p><a href="mailto:billing@shopbestmed.com">billing@shopbestmed.com</a> — Billing</p>
<p><a href="mailto:orders@shopbestmed.com">orders@shopbestmed.com</a> — Orders</p>
<p><a href="mailto:returns@shopbestmed.com">returns@shopbestmed.com</a> — Returns</p>
<p><a href="mailto:shipping@shopbestmed.com">shipping@shopbestmed.com</a> — Shipping</p>
<p><a href="mailto:accounts@shopbestmed.com">accounts@shopbestmed.com</a> — Accounts</p>
</div>
<div class="link -footerb">
<h4>Customer Service</h4>
<p><a href="{{config path="web/secure/base_url"}}contact">Contact us</a></p>
<p><a href="{{config path="web/secure/base_url"}}about-shop-best-medical">About us</a></p>
<p><a href="{{config path="web/secure/base_url"}}privacy-policy-cookie-restriction-mode">Privacy Policy</a></p>
<p><a href="{{config path="web/secure/base_url"}}frequently-asked-questions#shipping">Shipping Policy</a></p>
<p><a href="{{config path="web/secure/base_url"}}frequently-asked-questions">FAQ</a></p>
<p><a href="{{config path="web/secure/base_url"}}html-sitemap">HTML Sitemap</a></p>
</div>
<div class="link -footerc">
<h4>Account Links</h4>
<p><a href="{{config path="web/secure/base_url"}}customer/account/">My Account</a></p>
<p><a href="{{config path="web/secure/base_url"}}sales/order/history/">Order History</a></p>
<p><a href="{{config path="web/secure/base_url"}}sales/guest/form/">Track your Order</a></p>
<p><a href="{{config path="web/secure/base_url"}}wishlist/">My Wishlist</a></p>
</div>
<div class="link -footerc">
<h4>B2B</h4>
<p><a href="{{config path="web/secure/base_url"}}bulk-quote-requests">Request a Quote</a></p>
<p><a href="{{config path="web/secure/base_url"}}contract-pricing">Contract Pricing</a></p>
<p><a href="{{config path="web/secure/base_url"}}project-planning">Project Planning</a></p>
<p><a href="{{config path="web/secure/base_url"}}payment-terms">Payment Terms</a></p>
</div>
</div>
<div class="reasons">
<h3>Why Buy From BestMed?</h3>
<ul>
<li><span>1</span><a href="{{config path="web/secure/base_url"}}price-match">Price Match Guarantee</a></li>
<li><span>2</span><a href="{{config path="web/secure/base_url"}}contact">Outstanding Customer Service</a></li>
<li><span>3</span><a href="{{config path="web/secure/base_url"}}bulk-quote-requests">Bulk Order Discounts</a></li>
</ul>
{{block class="Magento\Newsletter\Block\Subscribe" name="newsletter" template="Magento_Newsletter::subscribe.phtml"}}
</div>
<div class="footer-logos">
<img src="{{media url=&quot;defense-logistics-agency.png&quot;}}" alt="" />
<img src="{{media url=&quot;national-institute-of-health.png&quot;}}" alt="" />
<img src="{{media url=&quot;women-business-enterprise.png&quot;}}" alt="" />
<img src="{{media url=&quot;dept-health-and-human-services.png&quot;}}" alt="" />
<img src="{{media url=&quot;download_3_1_.png&quot;}}" alt="" />
<img src="{{media url=&quot;department-of-defense.png&quot;}}" alt="" />
<img src="{{media url=&quot;unnamed_2_.png&quot;}}" alt="" />
<img src="{{media url=&quot;download_2_1_.png&quot;}}" alt="" />
<img src="{{media url=&quot;hubzone.jpg&quot;}}" alt="" />
<img src="{{media url=&quot;mwbe.jpg&quot;}}" alt="" />
<img src="{{media url=&quot;portauthority.jpg&quot;}}" alt="" />
</div>
<script type="text/javascript" src="https://cdn.ywxi.net/js/1.js" async></script>
HTML;

$footerBlocks = [
    2 => ['identifier' => 'footer-links', 'content' => $footerContent],
    34 => ['identifier' => 'new-footer-links', 'content' => $newFooterContent],
];
foreach ($footerBlocks as $blockId => $block) {
    $conn->query(
        'UPDATE cms_block SET content = ? WHERE block_id = ?',
        [$block['content'], $blockId]
    );
    echo "cms_block: {$block['identifier']} (id $blockId) updated\n";
}

$cmsReplacements = [
    'mailto:cs@shopbestmed.com' => 'mailto:support@shopbestmed.com',
    'mailto: cs@shopbestmed.com' => 'mailto:support@shopbestmed.com',
    'cs@shopbestmed.com' => 'support@shopbestmed.com',
    'mailto:cs@shopbestmed.com">Email' => 'mailto:sales@shopbestmed.com">Email',
];

$tables = [
    ['cms_page', ['frequently-asked-questions', 'payment-terms', 'privacy-policy-cookie-restriction-mode']],
];

foreach ($tables[0][1] as $identifier) {
    $row = $conn->fetchRow('SELECT content FROM cms_page WHERE identifier = ?', [$identifier]);
    if (!$row) {
        echo "cms_page: $identifier not found\n";
        continue;
    }
    $content = $row['content'];
    foreach ($cmsReplacements as $from => $to) {
        $content = str_replace($from, $to, $content);
    }
    if ($identifier === 'payment-terms') {
        $content = preg_replace(
            '/<li>Email:\s*<a href\s*=\s*"mailto:support@shopbestmed\.com">support@shopbestmed\.com<\/a><\/li>/',
            '<li>Email: <a href="mailto:billing@shopbestmed.com">billing@shopbestmed.com</a></li>',
            $content,
            1
        );
        $content = preg_replace(
            '/<li>Email:\s*<a href\s*=\s*"mailto:support@shopbestmed\.com">support@shopbestmed\.com<\/a><\/li>/',
            '<li>Email: <a href="mailto:accounts@shopbestmed.com">accounts@shopbestmed.com</a></li>',
            $content,
            1
        );
    }
    $conn->update('cms_page', ['content' => $content], ['identifier' => $identifier]);
    echo "cms_page: $identifier updated\n";
}

$cache = $om->get(\Magento\Framework\App\Cache\TypeListInterface::class);
foreach (['config', 'full_page', 'block_html'] as $type) {
    $cache->cleanType($type);
}
echo "cache cleared\n";
echo "Done.\n";
