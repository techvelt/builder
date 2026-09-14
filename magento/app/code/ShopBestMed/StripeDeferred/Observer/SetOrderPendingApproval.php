<?php
namespace ShopBestMed\StripeDeferred\Observer;

use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Magento\Sales\Model\Order;
use ShopBestMed\StripeDeferred\Model\Payment\StripeDeferred;

class SetOrderPendingApproval implements ObserverInterface
{
    public function execute(Observer $observer)
    {
        /** @var Order $order */
        $order = $observer->getEvent()->getOrder();
        $payment = $order->getPayment();

        if (!$payment || $payment->getMethod() !== StripeDeferred::CODE) {
            return;
        }

        // Keep order pending until admin captures payment.
        $order->setState(Order::STATE_NEW);
        $order->setStatus('pending');
        $order->addStatusHistoryComment(
            __('Order awaiting admin approval. Card authorized — charge will be captured when approved.')
        )->setIsCustomerNotified(false);
    }
}
