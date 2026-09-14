<?php
namespace ShopBestMed\StripeDeferred\Block\Adminhtml\Order\View;

use Magento\Backend\Block\Widget\Container;
use Magento\Framework\Registry;
use ShopBestMed\StripeDeferred\Model\Payment\StripeDeferred;

class CaptureButton extends Container
{
    /** @var Registry */
    private $registry;

    public function __construct(
        \Magento\Backend\Block\Widget\Context $context,
        Registry $registry,
        array $data = []
    ) {
        $this->registry = $registry;
        parent::__construct($context, $data);
    }

    protected function _construct()
    {
        parent::_construct();

        $order = $this->registry->registry('current_order');
        if (!$order || !$order->getId()) {
            return;
        }

        $payment = $order->getPayment();
        if (!$payment || $payment->getMethod() !== StripeDeferred::CODE) {
            return;
        }

        if ($order->hasInvoices() || !$order->canInvoice()) {
            return;
        }

        $intentStatus = $payment->getAdditionalInformation('stripe_status');
        if ($intentStatus && $intentStatus !== 'requires_capture') {
            return;
        }

        $this->addButton(
            'shopbestmed_stripe_capture',
            [
                'label' => __('Approve & Capture Payment'),
                'class' => 'primary',
                'onclick' => 'setLocation(\'' . $this->getCaptureUrl() . '\')',
            ]
        );
    }

    private function getCaptureUrl(): string
    {
        $order = $this->registry->registry('current_order');
        return $this->getUrl('shopbestmed_stripe/order/capture', ['order_id' => $order->getId()]);
    }
}
