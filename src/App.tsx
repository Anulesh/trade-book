import React from 'react';
import './App.css';
import TradingIndex from './pages/TradingIndex';
import { productSymbol } from './constants/constants';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity
    }
  }
});
function App() {
  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to={productSymbol[0]} replace />} />
            {productSymbol.map((route, index) => (
              <Route path={route} element={<TradingIndex />} key={index} />
            ))}
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </div>
  );
}

export default App;
