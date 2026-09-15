<?php
/**
 * One-time Magento setup for ShopBestMed Stripe module.
 * Upload to public_html/ and visit once, then delete.
 */
use Magento\Framework\Console\Cli;
use Magento\Framework\App\State;
use Symfony\Component\Console\Input\ArgvInput;
use Symfony\Component\Console\Output\ConsoleOutput;

$root = __DIR__;
require $root . '/app/bootstrap.php';

$commands = [
    'setup:upgrade',
    'cache:flush',
    'setup:static-content:deploy -f en_US',
];

foreach ($commands as $cmd) {
    echo "Running: bin/magento $cmd\n";
    passthru('cd ' . escapeshellarg($root) . ' && php bin/magento ' . $cmd . ' 2>&1', $code);
    echo "Exit code: $code\n\n";
}

echo "Done.\n";
