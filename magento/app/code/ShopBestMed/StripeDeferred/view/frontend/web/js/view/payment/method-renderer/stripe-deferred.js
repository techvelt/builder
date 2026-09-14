define([
    'Magento_Checkout/js/view/payment/default',
    'jquery',
    'Magento_Checkout/js/model/full-screen-loader',
    'Magento_Checkout/js/model/payment/additional-data',
    'mage/translate'
], function (Component, $, fullScreenLoader, additionalData, $t) {
    'use strict';

    return Component.extend({
        defaults: {
            template: 'ShopBestMed_StripeDeferred/payment/stripe-deferred',
            paymentMethodId: null
        },

        stripe: null,
        cardElement: null,
        elements: null,

        initialize: function () {
            this._super();
            this.initStripe();
            return this;
        },

        initObservable: function () {
            this._super().observe(['paymentMethodId']);
            return this;
        },

        getCode: function () {
            return 'shopbestmed_stripe';
        },

        getPublishableKey: function () {
            return window.checkoutConfig.payment.shopbestmed_stripe.publishableKey;
        },

        initStripe: function () {
            var self = this;
            var publishableKey = this.getPublishableKey();

            if (!publishableKey || typeof Stripe === 'undefined') {
                return;
            }

            this.stripe = Stripe(publishableKey);
            this.elements = this.stripe.elements();
            this.cardElement = this.elements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#1e3a5f',
                        '::placeholder': { color: '#9ca3af' }
                    }
                }
            });

            setTimeout(function () {
                var mountPoint = document.getElementById('shopbestmed-stripe-card');
                if (mountPoint && self.cardElement) {
                    self.cardElement.mount('#shopbestmed-stripe-card');
                }
            }, 500);
        },

        getData: function () {
            return {
                method: this.getCode(),
                additional_data: {
                    payment_method_id: this.paymentMethodId()
                }
            };
        },

        placeOrder: function (data, event) {
            var self = this;

            if (event) {
                event.preventDefault();
            }

            if (!this.validate()) {
                return false;
            }

            if (!this.stripe || !this.cardElement) {
                this.messageContainer.addErrorMessage({
                    message: $t('Payment form is not ready. Please refresh and try again.')
                });
                return false;
            }

            fullScreenLoader.startLoader();

            this.stripe.createPaymentMethod({
                type: 'card',
                card: this.cardElement
            }).then(function (result) {
                if (result.error) {
                    fullScreenLoader.stopLoader();
                    self.messageContainer.addErrorMessage({
                        message: result.error.message
                    });
                    return;
                }

                self.paymentMethodId(result.paymentMethod.id);
                return self._super(data, event);
            }).catch(function () {
                fullScreenLoader.stopLoader();
                self.messageContainer.addErrorMessage({
                    message: $t('Unable to validate card. Please try again.')
                });
            });

            return false;
        }
    });
});
