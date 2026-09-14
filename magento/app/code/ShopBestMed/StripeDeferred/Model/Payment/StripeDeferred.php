<?php
namespace ShopBestMed\StripeDeferred\Model\Payment;

use Magento\Framework\Exception\LocalizedException;
use Magento\Payment\Model\InfoInterface;
use Magento\Payment\Model\Method\AbstractMethod;
use ShopBestMed\StripeDeferred\Model\Config;
use ShopBestMed\StripeDeferred\Model\StripeClient;

class StripeDeferred extends AbstractMethod
{
    const CODE = 'shopbestmed_stripe';

    protected $_code = self::CODE;
    protected $_isGateway = true;
    protected $_canAuthorize = true;
    protected $_canCapture = true;
    protected $_canCapturePartial = false;
    protected $_canVoid = true;
    protected $_canCancel = true;
    protected $_canRefund = false;
    protected $_canUseCheckout = true;
    protected $_canUseInternal = false;
    protected $_isInitializeNeeded = true;

    /** @var Config */
    private $config;

    /** @var StripeClient */
    private $stripeClient;

    public function __construct(
        \Magento\Framework\Model\Context $context,
        \Magento\Framework\Registry $registry,
        \Magento\Framework\Api\ExtensionAttributesFactory $extensionFactory,
        \Magento\Framework\Api\AttributeValueFactory $customAttributeFactory,
        \Magento\Payment\Helper\Data $paymentData,
        \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig,
        \Magento\Payment\Model\Method\Logger $logger,
        Config $config,
        StripeClient $stripeClient,
        array $data = []
    ) {
        parent::__construct(
            $context,
            $registry,
            $extensionFactory,
            $customAttributeFactory,
            $paymentData,
            $scopeConfig,
            $logger,
            null,
            null,
            $data
        );
        $this->config = $config;
        $this->stripeClient = $stripeClient;
    }

    public function isAvailable(\Magento\Quote\Api\Data\CartInterface $quote = null)
    {
        return parent::isAvailable($quote) && $this->config->isActive();
    }

    public function initialize($paymentAction, $stateObject)
    {
        $stateObject->setState(\Magento\Sales\Model\Order::STATE_PENDING_PAYMENT);
        $stateObject->setStatus('pending');
        $stateObject->setIsNotified(false);
        return $this;
    }

    /**
     * Authorize payment — validates card and holds funds, does not capture.
     */
    public function authorize(InfoInterface $payment, $amount)
    {
        if (!$amount || $amount <= 0) {
            throw new LocalizedException(__('Invalid payment amount.'));
        }

        $paymentMethodId = $payment->getAdditionalInformation('payment_method_id');
        if (!$paymentMethodId) {
            throw new LocalizedException(__('Payment method was not provided.'));
        }

        $order = $payment->getOrder();
        $amountCents = (int) round($amount * 100);

        $intent = $this->stripeClient->authorizePayment(
            $amountCents,
            $order->getOrderCurrencyCode(),
            $paymentMethodId,
            $this->config->getStatementDescriptor($order->getStoreId()),
            [
                'order_id' => (string) $order->getIncrementId(),
                'customer_email' => (string) $order->getCustomerEmail(),
            ]
        );

        $payment->setTransactionId($intent['id']);
        $payment->setLastTransId($intent['id']);
        $payment->setIsTransactionClosed(false);
        $payment->setIsTransactionPending(true);
        $payment->setAdditionalInformation('stripe_payment_intent_id', $intent['id']);
        $payment->setAdditionalInformation('stripe_status', $intent['status']);

        $order->addStatusHistoryComment(
            __('Card authorized via Stripe. Awaiting admin approval before charge is captured.')
        );

        return $this;
    }

    /**
     * Capture payment when admin approves the order.
     */
    public function capture(InfoInterface $payment, $amount)
    {
        $intentId = $payment->getAdditionalInformation('stripe_payment_intent_id');
        if (!$intentId) {
            throw new LocalizedException(__('Stripe payment intent not found for this order.'));
        }

        $amountCents = $amount ? (int) round($amount * 100) : null;
        $intent = $this->stripeClient->capturePaymentIntent($intentId, $amountCents);

        $payment->setTransactionId($intent['id']);
        $payment->setIsTransactionClosed(true);
        $payment->setIsTransactionPending(false);
        $payment->setAdditionalInformation('stripe_status', $intent['status']);

        $payment->getOrder()->addStatusHistoryComment(
            __('Stripe payment captured. Bank statement: SHOPEBESTMED')
        );

        return $this;
    }

    public function void(InfoInterface $payment)
    {
        $intentId = $payment->getAdditionalInformation('stripe_payment_intent_id');
        if ($intentId) {
            $this->stripeClient->cancelPaymentIntent($intentId);
            $payment->setAdditionalInformation('stripe_status', 'canceled');
        }
        $payment->setIsTransactionClosed(true);
        return $this;
    }

    public function cancel(InfoInterface $payment)
    {
        return $this->void($payment);
    }
}
