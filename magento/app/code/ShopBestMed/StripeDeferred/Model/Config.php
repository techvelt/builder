<?php
namespace ShopBestMed\StripeDeferred\Model;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Store\Model\ScopeInterface;

class Config
{
    const XML_PATH_ACTIVE = 'payment/shopbestmed_stripe/active';
    const XML_PATH_TITLE = 'payment/shopbestmed_stripe/title';
    const XML_PATH_STATEMENT_DESCRIPTOR = 'payment/shopbestmed_stripe/statement_descriptor';

    /** @var ScopeConfigInterface */
    private $scopeConfig;

    public function __construct(ScopeConfigInterface $scopeConfig)
    {
        $this->scopeConfig = $scopeConfig;
    }

    public function isActive($storeId = null): bool
    {
        return (bool) $this->scopeConfig->getValue(self::XML_PATH_ACTIVE, ScopeInterface::SCOPE_STORE, $storeId);
    }

    public function getTitle($storeId = null): string
    {
        return (string) $this->scopeConfig->getValue(self::XML_PATH_TITLE, ScopeInterface::SCOPE_STORE, $storeId);
    }

    public function getStatementDescriptor($storeId = null): string
    {
        $value = (string) $this->scopeConfig->getValue(
            self::XML_PATH_STATEMENT_DESCRIPTOR,
            ScopeInterface::SCOPE_STORE,
            $storeId
        );
        return $value ?: 'SHOPEBESTMED';
    }

    public function getSecretKey(): string
    {
        $env = getenv('sbm_stripe_secret');
        if ($env) {
            return $env;
        }

        $bootstrap = BP . '/app/etc/env.php';
        if (is_readable($bootstrap)) {
            $config = include $bootstrap;
            if (!empty($config['shopbestmed']['stripe']['secret_key'])) {
                return $config['shopbestmed']['stripe']['secret_key'];
            }
        }

        $fallback = getenv('hytale_stripe_secret');
        return $fallback ?: '';
    }

    public function getPublishableKey(): string
    {
        $env = getenv('sbm_stripe_publishable_key');
        if ($env) {
            return $env;
        }

        $bootstrap = BP . '/app/etc/env.php';
        if (is_readable($bootstrap)) {
            $config = include $bootstrap;
            if (!empty($config['shopbestmed']['stripe']['publishable_key'])) {
                return $config['shopbestmed']['stripe']['publishable_key'];
            }
        }

        $fallback = getenv('hytle_stripe_publishable_key');
        return $fallback ?: '';
    }
}
