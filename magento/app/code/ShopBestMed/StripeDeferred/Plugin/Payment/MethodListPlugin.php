<?php
namespace ShopBestMed\StripeDeferred\Plugin\Payment;

use Magento\Payment\Model\MethodList;
use ShopBestMed\StripeDeferred\Model\Payment\StripeDeferred;

class MethodListPlugin
{
    /**
     * Only expose Stripe deferred capture at checkout.
     */
    public function afterGetAvailableMethods(MethodList $subject, array $result)
    {
        $filtered = [];
        foreach ($result as $method) {
            if ($method->getCode() === StripeDeferred::CODE) {
                $filtered[] = $method;
            }
        }
        return $filtered;
    }
}
