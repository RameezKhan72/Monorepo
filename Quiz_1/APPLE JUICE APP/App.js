import React, { useState } from "react";

// NOTE: The previous code used React Native components and imports, which is not supported in this web environment.
// This version is converted to standard React and Tailwind CSS.

// API_URL for web testing, assuming the Express server runs locally on port 3000.
// If testing on a mobile emulator connected to a local server, you would need to use "http://10.0.2.2:3000/juice"
const API_URL = "http://localhost:3000/juice"; 

const Spinner = () => (
  // Simple loading spinner SVG styled with Tailwind
  <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function App() {
  const [drink, setDrink] = useState("No juice yet...");
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch the juice, including exponential backoff for robust networking
  const getJuice = async () => {
    setIsLoading(true);
    // Clear previous error messages when trying again
    if (drink.startsWith('🚫')) {
        setDrink("No juice yet...");
    }
    
    try {
      console.log(`Attempting to fetch from: ${API_URL}`);
      
      const maxRetries = 3;
      let res;
      
      // Implement exponential backoff for network resilience
      for (let i = 0; i < maxRetries; i++) {
        try {
          res = await fetch(API_URL); 
          if (res.ok) break; // Success
        } catch (e) {
          // If network error, wait and retry
          if (i === maxRetries - 1) throw e; // Throw if last retry failed
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }

      if (!res || !res.ok) {
        const errorText = res ? await res.text() : "Network connection failed or server not running.";
        throw new Error(`Server returned status ${res?.status || 'N/A'}: ${errorText}`);
      }
      
      const data = await res.json();
      setDrink(data.drink);

    } catch (err) {
      console.error("Fetch Error:", err.message || err);
      // Inform the user about the connection failure and what to check
      setDrink(`🚫 Connection failed! Please ensure your Express server is running on port 3000.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Use div elements and Tailwind classes for styling (fully responsive)
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-inter">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm text-center">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Juice Shop 🍹</h1>
        
        {/* Display area for the drink/status */}
        <p className="text-xl text-gray-700 min-h-[4rem] flex items-center justify-center mb-8">
          {isLoading ? (
            <span className="flex items-center text-blue-600">
              <Spinner />
              Preparing...
            </span>
          ) : (
            <span className="font-semibold text-2xl text-slate-800">{drink}</span>
          )}
        </p>

        {/* Order button */}
        <button 
          onClick={getJuice} 
          disabled={isLoading}
          className={`
            w-full py-3 px-4 text-white font-bold rounded-lg transition duration-200 shadow-lg
            ${isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300'}
          `}
        >
          {isLoading ? "Ordering..." : "Order Juice 🥤"}
        </button>
      </div>
    </div>
  );
}
