import React, { useRef, useEffect, useState } from "react";
import { CoinflowCvvOnlyInput, CardType } from "@coinflowlabs/react";
import { inlineCvvStyles, allowedOrigins } from "../utils/tokenex";
import { useWallet } from "../wallet/Wallet.tsx";

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

interface SavedCardRowProps {
  card: PaymentMethod;
  isSelected: boolean;
  onSelect: (card: PaymentMethod) => void;
  onDelete: (cardId: string) => void;
  cvvRef?: React.RefObject<{ getToken(): Promise<any> } | null>;
}

export function SavedCardRow({ card, isSelected, onSelect, onDelete, cvvRef }: SavedCardRowProps) {
  const { wallet } = useWallet();
  const internalCvvRef = useRef<{ getToken(): Promise<any> } | null>(null);
  const cvvOnlyRef = cvvRef || internalCvvRef;
  const [isTokenExReady, setIsTokenExReady] = useState(false);

  useEffect(() => {
    // Check if TokenEx is available
    const checkTokenEx = () => {
      if (typeof window !== 'undefined' && (window as any).TokenEx) {
        setIsTokenExReady(true);
      } else {
        // Retry after a short delay
        setTimeout(checkTokenEx, 500);
      }
    };
    
    if (wallet?.publicKey) {
      checkTokenEx();
    }
  }, [wallet?.publicKey]);

  // Don't render TokenEx components if wallet is not ready
  if (!wallet?.publicKey) {
    return (
      <div
        onClick={() => onSelect(card)}
        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-gray-300"
        }`}
        style={{ height: "40px" }}
      >
        <div className="text-sm font-medium text-gray-600 capitalize text-center" style={{ width: "25%" }}>
          {card.cardType}
        </div>
        <div className="text-sm font-medium text-gray-900 text-center" style={{ width: "25%" }}>
          •••• {card.last4}
        </div>
        <div className="flex items-center justify-center" style={{ width: "25%" }}>
          <div className="w-16 h-7 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
            CVV
          </div>
        </div>
        <div className="text-sm font-medium text-gray-600 cursor-pointer hover:text-red-500 text-center" style={{ width: "25%" }} onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}>
          Delete
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(card)}
      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
      style={{ height: "40px" }}
    >
      {/* Column 1: Card Type - 25% width */}
      <div 
        className="text-sm font-medium text-gray-600 capitalize text-center"
        style={{ width: "25%" }}
      >
        {card.cardType}
      </div>

      {/* Column 2: Last 4 digits - 25% width */}
      <div 
        className="text-sm font-medium text-gray-900 text-center"
        style={{ width: "25%" }}
      >
        •••• {card.last4}
      </div>

      {/* Column 3: CVV Input - 25% width */}
      <div 
        className="flex items-center justify-center"
        style={{ width: "25%" }}
      >
        <div className="w-16 h-7 overflow-hidden">
          {wallet?.publicKey && isTokenExReady ? (
            <CoinflowCvvOnlyInput
              ref={isSelected ? cvvOnlyRef : null}
              merchantId="swe-challenge"
              env="sandbox"
              cardType={card.cardType}
              token={card.token}
              css={inlineCvvStyles}
              origins={allowedOrigins}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
              CVV
            </div>
          )}
        </div>
      </div>

      {/* Column 4: Delete - 25% width */}
      <div 
        className="text-sm font-medium text-gray-600 cursor-pointer hover:text-red-500 text-center"
        style={{ width: "25%" }}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(card.id);
        }}
      >
        Delete
      </div>
    </div>
  );
}