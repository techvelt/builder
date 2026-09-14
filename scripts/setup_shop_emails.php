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

$conn->update('cms_block', ['content' => $footerContent], ['identifier' => 'footer-links']);
echo "cms_block: footer-links updated\n";

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
