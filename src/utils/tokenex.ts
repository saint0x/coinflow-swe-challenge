/**
 * TokenEx iframe styling configuration
 * Centralized styling for all Coinflow TokenEx components
 */

export const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001", 
  "http://localhost:3002"
];

export const cardInputStyles = {
  base: "font-family: ui-sans-serif, system-ui; -webkit-text-fill-color: #000; font-size: 14px; line-height: 20px; height: 48px; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; color: #000;",
  focus: "border: 1px solid #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); outline: 0;",
  error: "border: 1px solid #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,.15);",
  cvv: {
    base: "font-family: ui-sans-serif, system-ui; -webkit-text-fill-color: #000; font-size: 14px; line-height: 20px; height: 48px; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; color: #000;",
    focus: "border: 1px solid #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); outline: 0;",
    error: "border: 1px solid #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,.15);",
  },
};

export const inlineCvvStyles = {
  base: "font-family: ui-sans-serif, system-ui; -webkit-text-fill-color: #000; font-size: 12px; height: 28px; padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 6px; background: #fff; color: #000;",
  focus: "border: 1px solid #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); outline: 0;",
  error: "border: 1px solid #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,.15);",
  cvv: {
    base: "font-family: ui-sans-serif, system-ui; -webkit-text-fill-color: #000; font-size: 12px; height: 28px; padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 6px; background: #fff; color: #000;",
    focus: "border: 1px solid #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); outline: 0;",
    error: "border: 1px solid #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,.15);"
  }
};