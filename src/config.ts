/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Configuration for Google Sheets Dashboard
export const CONFIG = {
  // Extract SHEET_ID from the sharing URL
  SHEET_ID: "1takYmw3bp2Xxe9fPBIyYV98Mxs9HAPOmv3RFlXZOdBo",
  
  // Default sheet name (Gviz queries will use the first sheet by default if null)
  SHEET_NAME: "Hoja 1", 
  
  // Auto refresh interval in milliseconds (5 minutes = 300,000 ms)
  REFRESH_INTERVAL: 5 * 60 * 1000,
  
  // Public URL for testing or sharing
  SPREADSHEET_URL: "https://docs.google.com/spreadsheets/d/1takYmw3bp2Xxe9fPBIyYV98Mxs9HAPOmv3RFlXZOdBo/edit?usp=sharing"
};

/**
 * Helper to get the CSV export URL based on the config.
 */
export function getCSVUrl(): string {
  return `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/export?format=csv&gid=0`;
}
