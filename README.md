Coinflow Software Engineer Take Home

  Implementation Summary

  Successfully replaced CoinflowPurchase with a PCI-compliant
  implementation using direct API calls to Coinflow's endpoints.

  Features Implemented

  1. New Card Checkout

  - TokenEx iframe integration for secure card tokenization
  - Complete billing information capture and validation
  - Direct API calls to /api/checkout/card/swe-challenge
  - Proper 3DS authentication handling

  2. Saved Card Checkout

  - In-memory card storage using sessionStorage
  - 4-column saved card layout (card type, name/digits, CVV input,
  delete)
  - CVV-only tokenization for saved card payments
  - Complete billing information persistence with each saved card

  Technical Architecture

  PCI Compliance

  - All sensitive card data handled through TokenEx iframes
  - No card numbers or CVV stored in application memory
  - Secure token-based payment processing

  Error Handling

  - Comprehensive form validation with user-friendly messages
  - Network error handling with proper fallbacks
  - React Error Boundaries for component-level error recovery
  - Production-grade error logging and state management

  State Management

  - UX contract compliance with exact boolean logic (hasSavedCards,
  showNewCardForm)
  - Optimized React hooks with proper dependency management
  - Clean separation of concerns between UI and business logic

  Key Technical Decisions

  TokenEx Integration: Used individual card components
  (CoinflowCardNumberInput, CoinflowCvvInput, CoinflowCvvOnlyInput)
  instead of the monolithic CoinflowPurchase to maintain full UI
  control while ensuring PCI compliance.

  Saved Card Architecture: Stored complete billing information with
  each saved card rather than just card details, enabling seamless
  reuse of payment data without requiring users to re-enter billing
  information.

  Error Boundary Strategy: Implemented comprehensive error boundaries
   to gracefully handle TokenEx initialization failures and network
  issues, ensuring the payment flow never completely breaks.

  State Management Pattern: Used exact UX contract boolean
  expressions (!hasSavedCards || addPaymentClicked) to eliminate
  complex state logic and ensure predictable UI behavior.

  Building & Running

  1. Install node v20
  2. Rename .env.example to .env
  3. Run commands:
  npm install
  npm run build
  npm run dev

