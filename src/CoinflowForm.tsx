import React, { useState, useRef, useCallback } from "react";
import { CoinflowCardNumberInput, CoinflowCvvInput, CoinflowCvvOnlyInput, CardType, CoinflowPurchase } from "@coinflowlabs/react";
import { NftSuccessModal } from "./modals/NftSuccessModal";
import { useWallet } from "./wallet/Wallet.tsx";
import { LoadingSpinner } from "./App.tsx";

export function CoinflowForm() {
  const [nftSuccessOpen, setNftSuccessOpen] = useState<boolean>(false);

  return (
    <div className={"w-full flex-1 "}>
      <CoinflowPurchaseWrapper
        onSuccess={() => setNftSuccessOpen(true)}
        subtotal={{cents: 20_00}}
      />
      <NftSuccessModal isOpen={nftSuccessOpen} setIsOpen={setNftSuccessOpen} />
    </div>
  );
}

function CoinflowPurchaseWrapper({
  onSuccess,
  subtotal,
}: {
  onSuccess: () => void;
  subtotal: {cents: number;};
}) {
  return (
    <div className={"h-full flex-1 w-full relative pb-20"}>
      <PciCompliantCheckout
        onSuccess={onSuccess}
        subtotal={subtotal}
      />
    </div>
  );
}

type PaymentMethod = {
  id: string;
  token: string;
  last4: string;
  cardType: CardType;
};

type CheckoutState = 'idle' | 'loading' | 'processing' | 'success' | 'error';

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Complete Purchase</h2>
        <p className="text-sm text-gray-600 mt-1">Secure payment powered by Coinflow</p>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setUseNewCard(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              useNewCard
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            New Card
          </button>
          <button
            onClick={() => setUseNewCard(false)}
            disabled={savedCards.length === 0}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              !useNewCard
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : savedCards.length === 0
                ? 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            Saved Cards {savedCards.length > 0 && `(${savedCards.length})`}
          </button>
        </div>
      </div>

      {/* New Card Form */}
      {useNewCard && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Number
            </label>
            <CoinflowCardNumberInput
              ref={cardNumberRef}
              merchantId="swe-challenge"
              env="sandbox"
              css={cardInputStyles}
              origins={allowedOrigins}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={expiryDate}
                onChange={(e) => {
                  // Handle expiry date formatting
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                  }
                  setExpiryDate(value);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <div className="w-full h-12 border border-gray-300 rounded-md">
                <CoinflowCvvInput
                  merchantId="swe-challenge"
                  env="sandbox"
                  css={cardInputStyles}
                  origins={allowedOrigins}
                />
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Billing Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={billingInfo.name}
                  onChange={(e) => setBillingInfo({...billingInfo, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={billingInfo.email}
                  onChange={(e) => setBillingInfo({...billingInfo, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={billingInfo.address}
                onChange={(e) => setBillingInfo({...billingInfo, address: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={billingInfo.city}
                  onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={billingInfo.state}
                  onChange={(e) => setBillingInfo({...billingInfo, state: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={billingInfo.zip}
                  onChange={(e) => setBillingInfo({...billingInfo, zip: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Card Selection */}
      {!useNewCard && savedCards.length > 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Saved Card
            </label>
            <div className="space-y-2">
              {savedCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className={`p-4 border rounded-md cursor-pointer transition-colors ${
                    selectedCard?.id === card.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">💳</div>
                    <div>
                      <div className="font-medium">
                        **** **** **** {card.last4}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {card.cardType.toLowerCase()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedCard && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV for **** {selectedCard.last4}
              </label>
              <div className="w-32">
                <CoinflowCvvOnlyInput
                  ref={cvvOnlyRef}
                  merchantId="swe-challenge"
                  env="sandbox"
                  cardType={selectedCard.cardType}
                  token={selectedCard.token}
                  css={cardInputStyles}
                  origins={allowedOrigins}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Saved Cards Message */}
      {!useNewCard && savedCards.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">💳</div>
          <p className="text-gray-600">No saved cards found</p>
          <button
            onClick={() => setUseNewCard(true)}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Use a new card instead
          </button>
        </div>
      )}

      {/* Order Summary */}
      {totals && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${(subtotal.cents / 100).toFixed(2)}</span>
          </div>
          {totals.fees && (
            <div className="flex justify-between text-sm">
              <span>Processing Fee</span>
              <span>${(totals.fees / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>${((subtotal.cents + (totals.fees || 0)) / 100).toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Button */}
      <div>
        <button
          onClick={useNewCard ? handleNewCardPayment : handleSavedCardPayment}
          disabled={state === 'processing' || state === 'loading' ||
            (useNewCard && (!billingInfo.name || !billingInfo.email)) ||
            (!useNewCard && !selectedCard)
          }
          className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
            state === 'processing' || state === 'loading'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {state === 'processing' ? (
            <div className="flex items-center justify-center space-x-2">
              <LoadingSpinner className="!h-4 !w-4" />
              <span>Processing Payment...</span>
            </div>
          ) : state === 'loading' ? (
            <div className="flex items-center justify-center space-x-2">
              <LoadingSpinner className="!h-4 !w-4" />
              <span>Loading...</span>
            </div>
          ) : (
            `Pay $${((subtotal.cents + (totals?.fees || 0)) / 100).toFixed(2)}`
          )}
        </button>
      </div>

      {/* Test Cards Info */}
      <div className="text-xs text-gray-500 border-t pt-4">
        <p className="font-medium mb-1">Test Cards:</p>
        <p>Visa: 4111 1111 1111 1111</p>
        <p>Mastercard: 5431 1111 1111 1111</p>
        <p>Use any future expiry date and any CVV</p>
      </div>
    </div>
  );
}
