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
  base: 'font-family: Arial, sans-serif;padding: 0 8px;border: 1px solid rgba(0, 0, 0, 0.2);margin: 0;width: 100%;font-size: 13px;line-height: 30px;height: 32px;box-sizing: border-box;-moz-box-sizing: border-box;',
  focus: 'box-shadow: 0 0 6px 0 rgba(0, 132, 255, 0.5);border: 1px solid rgba(0, 132, 255, 0.5);outline: 0;',
  error: 'box-shadow: 0 0 6px 0 rgba(224, 57, 57, 0.5);border: 1px solid rgba(224, 57, 57, 0.5);',
  cvv: {
    base: 'font-family: Arial, sans-serif;padding: 0 8px;border: 1px solid rgba(0, 0, 0, 0.2);margin: 0;width: 100%;font-size: 13px;line-height: 30px;height: 32px;box-sizing: border-box;-moz-box-sizing: border-box;',
    focus: 'box-shadow: 0 0 6px 0 rgba(0, 132, 255, 0.5);border: 1px solid rgba(0, 132, 255, 0.5);outline: 0;',
    error: 'box-shadow: 0 0 6px 0 rgba(224, 57, 57, 0.5);border: 1px solid rgba(224, 57, 57, 0.5);',
  },
};