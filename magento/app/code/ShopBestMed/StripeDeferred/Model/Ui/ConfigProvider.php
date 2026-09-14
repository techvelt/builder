<?php
namespace ShopBestMed\StripeDeferred\Model\Ui;

use Magento\Checkout\Model\ConfigProviderInterface;
use ShopBestMed\StripeDeferred\Model\Config;
use ShopBestMed\StripeDeferred\Model\Payment\StripeDeferred;

class ConfigProvider implements ConfigProviderInterface
{
    /** @var Config */
    private $config;

    public function __construct(Config $config)
    {
        $this->config = $config;
    }

    public function getConfig()
    {
        return [
            'payment' => [
                StripeDeferred::CODE => [
                    'isActive' => $this->config->isActive(),
                    'publishableKey' => $this->config->getPublishableKey(),
                    'title' => $this->config->getTitle(),
                ],
            ],
        ];
    }
}
