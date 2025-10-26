import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { PrivyProvider, usePrivy } from '@privy-io/react-auth'
import LandingPage from './Pages/LandingPage'
import LoginPage from './Pages/LoginPage'
import ContributorDashboard from './Pages/ContributorDashboard.jsx'
import AdminDashboard from './Pages/AdminDashboard.jsx'
import InvestorDashboard from './Pages/InvestorDashboard.jsx'
import TradingPage from './Pages/TradingPage.jsx'

function App() {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID || 'REPLACE_WITH_YOUR_PRIVY_APP_ID'}
      config={{
        loginMethods: ['google', 'wallet'],
        appearance: { showWalletLoginFirst: false },
        externalWallets: {
          coinbaseWallet: { enabled: false },
          walletConnect: { enabled: true },
          // Explicitly disable Solana to silence warnings
          solana: { enabled: false },
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/investor" element={<InvestorDashboard />} />
          <Route path="/trading" element={<TradingPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/contributor" element={<ContributorDashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </PrivyProvider>
  )
}

function RequireAuth() {
  const { authenticated, ready } = usePrivy()
  const hasAppId = Boolean(import.meta.env.VITE_PRIVY_APP_ID && import.meta.env.VITE_PRIVY_APP_ID !== 'REPLACE_WITH_YOUR_PRIVY_APP_ID')
  const storedRole = typeof window !== 'undefined' ? localStorage.getItem('bv_role') : null
  // If Privy isn't configured, bypass auth checks for development
  if (!hasAppId) return <Outlet />
  if (!ready) return <div className="p-6">Loading...</div>
  if (!authenticated) return <Navigate to="/login" replace />
  // If route and role mismatch, redirect to correct dashboard
  const path = window.location.pathname
  if (storedRole === 'admin' && path !== '/admin') return <Navigate to="/admin" replace />
  if (storedRole === 'contributor' && path !== '/contributor') return <Navigate to="/contributor" replace />
  return <Outlet />
}

export default App

