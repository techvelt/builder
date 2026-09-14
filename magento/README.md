# ShopBestMed Stripe Deferred Payment Module

Magento 2 module that replaces all payment methods with **Stripe authorize-only** checkout.

## Behavior

1. Customer enters card at checkout (Stripe Elements)
2. Stripe **authorizes** the amount (validates available balance) — **no charge**
3. Order stays **Pending** awaiting admin approval
4. Admin clicks **Approve & Capture Payment** on the order
5. Stripe captures the charge — bank statement shows **SHOPEBESTMED**

## Configuration

API keys are read from (in order):

1. `sbm_stripe_secret` / `sbm_stripe_publishable_key` environment variables
2. `app/etc/env.php` → `shopbestmed.stripe.secret_key` / `publishable_key`

## Deploy

```bash
export Cpanel_sbm_api="..."
export sbm_stripe_secret="sk_live_..."
export sbm_stripe_publishable_key="pk_live_..."
python3 scripts/deploy_stripe_module.py
```

Then on the server:

```bash
cd ~/public_html
php bin/magento setup:upgrade
php bin/magento cache:flush
php setup_stripe_payment.php
```

## Disabled payment methods

Cardknox, PayPal, Braintree, Authorize.net, check/money order, COD, bank transfer, purchase order.
