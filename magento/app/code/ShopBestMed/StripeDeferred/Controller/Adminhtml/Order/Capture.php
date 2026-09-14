<?php
namespace ShopBestMed\StripeDeferred\Controller\Adminhtml\Order;

use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\Exception\LocalizedException;
use Magento\Sales\Api\OrderRepositoryInterface;
use Magento\Sales\Model\Service\InvoiceService;
use Magento\Framework\DB\Transaction;
use ShopBestMed\StripeDeferred\Model\Payment\StripeDeferred;

class Capture extends Action
{
    const ADMIN_RESOURCE = 'Magento_Sales::actions_edit';

    /** @var OrderRepositoryInterface */
    private $orderRepository;

    /** @var InvoiceService */
    private $invoiceService;

    /** @var Transaction */
    private $transaction;

    public function __construct(
        Context $context,
        OrderRepositoryInterface $orderRepository,
        InvoiceService $invoiceService,
        Transaction $transaction
    ) {
        parent::__construct($context);
        $this->orderRepository = $orderRepository;
        $this->invoiceService = $invoiceService;
        $this->transaction = $transaction;
    }

    public function execute()
    {
        $orderId = (int) $this->getRequest()->getParam('order_id');
        $resultRedirect = $this->resultRedirectFactory->create();

        try {
            $order = $this->orderRepository->get($orderId);
            $payment = $order->getPayment();

            if (!$payment || $payment->getMethod() !== StripeDeferred::CODE) {
                throw new LocalizedException(__('This order does not use Stripe deferred payment.'));
            }

            if ($order->hasInvoices()) {
                throw new LocalizedException(__('This order has already been charged.'));
            }

            if (!$order->canInvoice()) {
                throw new LocalizedException(__('Cannot create invoice for this order.'));
            }

            $invoice = $this->invoiceService->prepareInvoice($order);
            $invoice->setRequestedCaptureCase(\Magento\Sales\Model\Order\Invoice::CAPTURE_ONLINE);
            $invoice->register();
            $invoice->getOrder()->setIsInProcess(true);

            $order->addStatusHistoryComment(__('Admin approved order. Stripe payment captured.'));
            $order->setState(\Magento\Sales\Model\Order::STATE_PROCESSING);
            $order->setStatus(\Magento\Sales\Model\Order::STATE_PROCESSING);

            $this->transaction
                ->addObject($invoice)
                ->addObject($invoice->getOrder())
                ->save();

            $this->messageManager->addSuccessMessage(__('Payment captured successfully. Customer will see SHOPEBESTMED on their bank statement.'));
        } catch (\Exception $e) {
            $this->messageManager->addErrorMessage($e->getMessage());
        }

        return $resultRedirect->setPath('sales/order/view', ['order_id' => $orderId]);
    }
}
