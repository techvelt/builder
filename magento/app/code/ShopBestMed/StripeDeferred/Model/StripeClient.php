<?php
namespace ShopBestMed\StripeDeferred\Model;

use Magento\Framework\Exception\LocalizedException;

class StripeClient
{
    private const API_BASE = 'https://api.stripe.com/v1/';

    /** @var Config */
    private $config;

    public function __construct(Config $config)
    {
        $this->config = $config;
    }

    /**
     * Authorize funds without capturing (manual capture PaymentIntent).
     *
     * @throws LocalizedException
     */
    public function authorizePayment(
        int $amountCents,
        string $currency,
        string $paymentMethodId,
        string $statementDescriptor,
        array $metadata = []
    ): array {
        $params = [
            'amount' => $amountCents,
            'currency' => strtolower($currency),
            'payment_method' => $paymentMethodId,
            'capture_method' => 'manual',
            'confirm' => 'true',
            'statement_descriptor' => substr($statementDescriptor, 0, 22),
            'metadata' => $metadata,
        ];

        $intent = $this->request('POST', 'payment_intents', $params);

        if (!in_array($intent['status'], ['requires_capture', 'succeeded'], true)) {
            $message = isset($intent['last_payment_error']['message'])
                ? $intent['last_payment_error']['message']
                : 'Payment authorization failed.';
            throw new LocalizedException(__($message));
        }

        return $intent;
    }

    /**
     * Capture a previously authorized PaymentIntent.
     *
     * @throws LocalizedException
     */
    public function capturePaymentIntent(string $paymentIntentId, ?int $amountCents = null): array
    {
        $params = [];
        if ($amountCents !== null) {
            $params['amount_to_capture'] = $amountCents;
        }

        $intent = $this->request('POST', 'payment_intents/' . $paymentIntentId . '/capture', $params);

        if ($intent['status'] !== 'succeeded') {
            throw new LocalizedException(__('Unable to capture payment. Status: %1', $intent['status']));
        }

        return $intent;
    }

    /**
     * Cancel an uncaptured authorization.
     *
     * @throws LocalizedException
     */
    public function cancelPaymentIntent(string $paymentIntentId): array
    {
        return $this->request('POST', 'payment_intents/' . $paymentIntentId . '/cancel');
    }

    /**
     * @throws LocalizedException
     */
    private function request(string $method, string $path, array $params = []): array
    {
        $secretKey = $this->config->getSecretKey();
        if (!$secretKey) {
            throw new LocalizedException(__('Stripe secret key is not configured.'));
        }

        $url = self::API_BASE . ltrim($path, '/');
        $body = $this->buildQuery($params);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_USERPWD => $secretKey . ':',
            CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
            CURLOPT_TIMEOUT => 30,
        ]);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        }

        $response = curl_exec($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($response === false) {
            throw new LocalizedException(__('Stripe request failed: %1', $error));
        }

        $decoded = json_decode($response, true);
        if (!is_array($decoded)) {
            throw new LocalizedException(__('Invalid Stripe response.'));
        }

        if ($httpCode >= 400) {
            $message = $decoded['error']['message'] ?? 'Stripe API error';
            throw new LocalizedException(__($message));
        }

        return $decoded;
    }

    private function buildQuery(array $params, string $prefix = ''): string
    {
        $parts = [];
        foreach ($params as $key => $value) {
            $name = $prefix === '' ? $key : $prefix . '[' . $key . ']';
            if (is_array($value)) {
                $parts[] = $this->buildQuery($value, $name);
            } else {
                $parts[] = rawurlencode($name) . '=' . rawurlencode((string) $value);
            }
        }
        return implode('&', array_filter($parts));
    }
}
