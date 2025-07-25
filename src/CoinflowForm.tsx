import React, { useState, useRef, useCallback } from "react";
import {
  CoinflowCardNumberInput,
  CoinflowCvvInput,
  CardType,
} from "@coinflowlabs/react";
import { NftSuccessModal } from "./modals/NftSuccessModal";
import { useWallet } from "./wallet/Wallet.tsx";
import { LoadingSpinner } from "./App.tsx";
import { SavedCardRow } from "./components/SavedCardRow";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { cardInputStyles, allowedOrigins } from "./utils/tokenex";

export function CoinflowForm() {
  const [nftSuccessOpen, setNftSuccessOpen] = useState<boolean>(false);

  return (
    <ErrorBoundary>
      <div className={"w-full flex-1 "}>
        <CoinflowPurchaseWrapper
          onSuccess={() => setNftSuccessOpen(true)}
          subtotal={{ cents: 20_00 }}
        />
        <NftSuccessModal isOpen={nftSuccessOpen} setIsOpen={setNftSuccessOpen} />
      </div>
    </ErrorBoundary>
  );
}

function CoinflowPurchaseWrapper({
  onSuccess,
  subtotal,
}: {
  onSuccess: () => void;
  subtotal: { cents: number };
}) {
  const { wallet } = useWallet();
  
  if (!wallet?.publicKey) {
    return (
      <div className="h-full flex-1 w-full relative pb-20 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="!h-8 !w-8 mx-auto mb-4" />
          <p className="text-gray-600">Connecting wallet...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={"h-full flex-1 w-full relative pb-20"}>
      <ErrorBoundary>
        <PciCompliantCheckout onSuccess={onSuccess} subtotal={subtotal} />
      </ErrorBoundary>
    </div>
  );
}

type PaymentMethod = {
  id: string;
  token: string;
  last4: string;
  cardType: CardType;
  cardholderName: string;
  // Billing information stored with the card
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  // Expiry information
  expMonth: string;
  expYear: string;
};

type CheckoutState = "idle" | "loading" | "processing" | "success" | "error";

/**
 * PCI-compliant checkout implementation using Coinflow's individual card components.
 *
 * NOTE: These components require TokenEx iframe initialization which is blocked on localhost.
 * The merchant "swe-challenge" only allows requests from whitelisted domains.

 */
function PciCompliantCheckout({
  onSuccess,
  subtotal,
}: {
  onSuccess: () => void;
  subtotal: { cents: number };
}) {
  const { wallet } = useWallet();
  const [state, setState] = useState<CheckoutState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState<PaymentMethod[]>([]);
  const [selectedCard, setSelectedCard] = useState<PaymentMethod | null>(null);
  const [addPaymentClicked, setAddPaymentClicked] = useState(false);
  const [totals, setTotals] = useState<{ fees?: number } | null>(null);


  // Refs for tokenization
  interface TokenResponse {
    token: string;
    tokenHMAC?: string;
    referenceNumber?: string;
  }
  const cardNumberRef = useRef<{ getToken(): Promise<TokenResponse> } | null>(
    null
  );
  const cvvOnlyRef = useRef<{ getToken(): Promise<TokenResponse> } | null>(
    null
  );

  // Form state for billing information
  const [billingInfo, setBillingInfo] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  // Expiry date state
  const [expiryDate, setExpiryDate] = useState("");

  // Initialize on mount
  React.useEffect(() => {
    if (wallet?.publicKey) {
      loadSavedCards();
      loadTotals();
    }
  }, [wallet?.publicKey]);

  // UX Contract - exact boolean expressions
  const hasSavedCards = savedCards.length > 0;
  const showNewCardForm = !hasSavedCards || addPaymentClicked;

  // Auto-select first saved card when available
  React.useEffect(() => {
    if (savedCards.length > 0 && !selectedCard) {
      setSelectedCard(savedCards[0]);
    }
  }, [savedCards, selectedCard]);





  const loadTotals = async () => {
    if (!wallet?.publicKey) return;

    try {
      const response = await fetch(
        `https://api-sandbox.coinflow.cash/api/checkout/totals/swe-challenge`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-coinflow-auth-wallet": wallet.publicKey.toString(),
            "x-coinflow-auth-blockchain": "solana",
          },
          body: JSON.stringify({
            subtotal: subtotal,
            blockchain: "solana",
            wallet: wallet.publicKey.toString(),
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && typeof data.fees === 'number') {
          setTotals(data);
        } else {
          setTotals({ fees: 50 }); // Default fallback
        }
      } else {
        setTotals({ fees: 50 }); // Default fee for API errors
      }
    } catch (error) {
      // Network or parsing error - use default
      setTotals({ fees: 50 });
    }
  };

  const loadSavedCards = async () => {
    const walletKey = wallet?.publicKey?.toString();
    if (!walletKey) return;

    const stored = sessionStorage.getItem(`coinflow-saved-cards-${walletKey}`);
    if (stored) {
      try {
        const cards = JSON.parse(stored);
        // Check if cards have the new format with billing info
        const hasNewFormat = cards.length === 0 || (cards[0]?.email && cards[0]?.address);
        
        if (hasNewFormat) {
          setSavedCards(cards);
        } else {
          // Old format - clear and start fresh
          sessionStorage.removeItem(`coinflow-saved-cards-${walletKey}`);
          setSavedCards([]);
        }
      } catch (error) {
        setSavedCards([]);
        sessionStorage.removeItem(`coinflow-saved-cards-${walletKey}`);
      }
    } else {
      setSavedCards([]);
    }
  };

  const deleteCard = useCallback(async (cardId: string) => {
    const updatedCards = savedCards.filter(c => c.id !== cardId);
    setSavedCards(updatedCards);
    const walletKey = wallet?.publicKey?.toString();
    if (walletKey) {
      sessionStorage.setItem(`coinflow-saved-cards-${walletKey}`, JSON.stringify(updatedCards));
    }
    if (selectedCard?.id === cardId) {
      setSelectedCard(null);
    }
    // If this was the last card, trigger form to show
    if (updatedCards.length === 0) {
      setAddPaymentClicked(true);
    }
  }, [savedCards, selectedCard, wallet?.publicKey]);

  const selectCard = useCallback((card: PaymentMethod) => {
    setSelectedCard(card);
    setAddPaymentClicked(false);
  }, []);

  const saveCardAfterSuccess = async (cardToken: string, _paymentResult: any) => {
    const walletKey = wallet?.publicKey?.toString();
    if (!walletKey) return;

    const cardLast4 = cardToken.slice(-4);
    const [expMonth, expYear] = expiryDate.split("/");
    const formattedExpYear = expYear.length === 4 ? expYear.slice(-2) : expYear.padStart(2, '0');
    
    // Detect card type from token's first digit
    const detectCardType = (token: string): CardType => {
      // This is a simplified detection - in production you'd want more sophisticated logic
      const firstDigit = token.charAt(0);
      if (firstDigit === '4') return CardType.VISA;
      if (firstDigit === '5') return CardType.MASTERCARD;
      if (firstDigit === '3') return CardType.AMEX;
      return CardType.VISA; // Default fallback
    };

    const newCard: PaymentMethod = {
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      token: cardToken,
      last4: cardLast4,
      cardType: detectCardType(cardToken),
      cardholderName: billingInfo.name,
      // Store all billing information
      email: billingInfo.email,
      address: billingInfo.address,
      city: billingInfo.city,
      state: billingInfo.state,
      zip: billingInfo.zip,
      country: billingInfo.country,
      // Store expiry information
      expMonth: expMonth,
      expYear: formattedExpYear,
    };

    const existingCards = sessionStorage.getItem(`coinflow-saved-cards-${walletKey}`);
    const cards = existingCards ? JSON.parse(existingCards) : [];
    
    const cardExists = cards.some((card: PaymentMethod) => card.last4 === cardLast4);
    if (!cardExists) {
      cards.push(newCard);
      sessionStorage.setItem(`coinflow-saved-cards-${walletKey}`, JSON.stringify(cards));
      setSavedCards(cards);
    }
  };

  const handleNewCardPayment = async () => {
    if (!cardNumberRef.current) {
      setError("Card form not ready - components not initialized");
      return;
    }

    if (!expiryDate || expiryDate.length < 5) {
      setError("Please enter a valid expiry date");
      return;
    }

    if (
      !billingInfo.name ||
      !billingInfo.email ||
      !billingInfo.address ||
      !billingInfo.city ||
      !billingInfo.state ||
      !billingInfo.zip
    ) {
      setError("Please fill in all billing information");
      return;
    }

    try {
      setState("processing");
      setError(null);

      // Get the tokenized card data from the Coinflow components
      const cardTokenResponse = await cardNumberRef.current.getToken();

      if (!cardTokenResponse || !cardTokenResponse.token) {
        throw new Error("Failed to tokenize card data. Please check your card number.");
      }

      // Parse and validate expiry date
      const [expMonth, expYear] = expiryDate.split("/");
      if (!expMonth || !expYear || expMonth.length !== 2 || expYear.length !== 2) {
        throw new Error("Please enter a valid expiry date in MM/YY format.");
      }
      const monthNum = parseInt(expMonth, 10);
      if (monthNum < 1 || monthNum > 12) {
        throw new Error("Please enter a valid month (01-12).");
      }
      const formattedExpYear = expYear;

      // Prepare the payment payload according to Coinflow API docs
      const paymentPayload = {
        subtotal: subtotal,
        authentication3DS: {
          concludeChallenge: true,
          colorDepth: 24,
          screenHeight: 1080,
          screenWidth: 1920,
          timeZone: -240
        },
        card: {
          expYear: formattedExpYear,
          expMonth: expMonth,
          email: billingInfo.email,
          firstName: billingInfo.name.split(" ")[0] || billingInfo.name,
          lastName: billingInfo.name.split(" ").slice(1).join(" ") || "User",
          address1: billingInfo.address,
          city: billingInfo.city,
          zip: billingInfo.zip,
          state: billingInfo.state.length > 2 ? billingInfo.state.substring(0, 2).toUpperCase() : billingInfo.state,
          country: billingInfo.country,
          cardToken: cardTokenResponse.token,
        },
      };


      const response = await fetch(
        `https://api-sandbox.coinflow.cash/api/checkout/card/swe-challenge`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-coinflow-auth-wallet": wallet?.publicKey?.toString() || "",
            "x-coinflow-auth-blockchain": "solana",
          },
          body: JSON.stringify(paymentPayload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || `Payment failed: ${response.status}`);
      }

      setState("success");
      
      // Save the card for future use
      await saveCardAfterSuccess(cardTokenResponse.token, result);
      
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during payment processing.";
      setError(errorMessage);
      setState("error");
    }
  };

  const handleSavedCardPayment = async () => {
    if (!selectedCard || !cvvOnlyRef.current) {
      setError("Please select a card and enter CVV");
      return;
    }

    try {
      setState("processing");
      setError(null);

      // Get the refreshed token with CVV
      const cvvTokenResponse = await cvvOnlyRef.current.getToken();

      // Prepare the payment payload for saved card - same as new card but with CVV token
      const paymentPayload = {
        subtotal: subtotal,
        authentication3DS: {
          concludeChallenge: true,
          colorDepth: 24,
          screenHeight: 1080,
          screenWidth: 1920,
          timeZone: -240
        },
        card: {
          expYear: selectedCard.expYear,
          expMonth: selectedCard.expMonth,
          email: selectedCard.email,
          firstName: selectedCard.cardholderName.split(" ")[0] || selectedCard.cardholderName,
          lastName: selectedCard.cardholderName.split(" ").slice(1).join(" ") || "User",
          address1: selectedCard.address,
          city: selectedCard.city,
          zip: selectedCard.zip,
          state: selectedCard.state.length > 2 ? "NY" : selectedCard.state,
          country: selectedCard.country,
          cardToken: cvvTokenResponse.token,
        },
      };

      const response = await fetch(
        `https://api-sandbox.coinflow.cash/api/checkout/card/swe-challenge`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-coinflow-auth-wallet": wallet?.publicKey?.toString() || "",
            "x-coinflow-auth-blockchain": "solana",
          },
          body: JSON.stringify(paymentPayload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || `Payment failed: ${response.status}`);
      }

      setState("success");
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during payment processing.";
      setError(errorMessage);
      setState("error");
    }
  };


  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Complete Purchase
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Secure payment powered by Coinflow
        </p>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">Pay with:</div>
          
          {/* Saved Cards Section */}
          {hasSavedCards && (
            <div className="space-y-2">
              {savedCards.map((card) => (
                <SavedCardRow
                  key={card.id}
                  card={card}
                  isSelected={selectedCard?.id === card.id && !addPaymentClicked}
                  onSelect={selectCard}
                  onDelete={deleteCard}
                  cvvRef={selectedCard?.id === card.id ? cvvOnlyRef : undefined}
                />
              ))}
            </div>
          )}
          
          {/* Add Payment Method Button - Only show if there are saved cards */}
          {hasSavedCards && (
            <button
              onClick={() => {
                setAddPaymentClicked(true);
                setSelectedCard(null);
              }}
              className={`w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed rounded-lg transition-colors ${
                addPaymentClicked
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              <span className="text-lg">+</span>
              <span className="font-medium">Add a payment method</span>
            </button>
          )}
        </div>
      </div>

      {/* New Card Form - Only show when showNewCardForm is true */}
      {showNewCardForm && wallet?.publicKey && (
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
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.length >= 2) {
                    value = value.substring(0, 2) + "/" + value.substring(2, 4);
                  }
                  setExpiryDate(value);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <div className="w-full h-12">
                <CoinflowCvvInput />
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Billing Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={billingInfo.name}
                  onChange={(e) =>
                    setBillingInfo({ ...billingInfo, name: e.target.value })
                  }
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
                  onChange={(e) =>
                    setBillingInfo({ ...billingInfo, email: e.target.value })
                  }
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
                onChange={(e) =>
                  setBillingInfo({ ...billingInfo, address: e.target.value })
                }
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
                  onChange={(e) =>
                    setBillingInfo({ ...billingInfo, city: e.target.value })
                  }
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
                  onChange={(e) =>
                    setBillingInfo({ ...billingInfo, state: e.target.value })
                  }
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
                  onChange={(e) =>
                    setBillingInfo({ ...billingInfo, zip: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>
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
            <span>
              ${((subtotal.cents + (totals.fees || 0)) / 100).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Payment Error
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Button */}
      <div>
        <button
          onClick={showNewCardForm ? handleNewCardPayment : handleSavedCardPayment}
          disabled={
            state === "processing" ||
            state === "loading" ||
            (showNewCardForm && (!billingInfo.name || !billingInfo.email)) ||
            (hasSavedCards && !showNewCardForm && !selectedCard)
          }
          className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
            state === "processing" || state === "loading"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          }`}
        >
          {state === "processing" ? (
            <div className="flex items-center justify-center space-x-2">
              <LoadingSpinner className="!h-4 !w-4" />
              <span>Processing Payment...</span>
            </div>
          ) : state === "loading" ? (
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
