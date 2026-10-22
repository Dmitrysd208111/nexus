import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './shared/Layout'
import { ErrorBoundary, LoadingState } from './shared/States'
import { ToastProvider } from './shared/Toast'
import { usePreferences } from './features/preferences/store'
const Overview = lazy(() => import('./pages/OverviewPage'))
const Analytics = lazy(() => import('./pages/AnalyticsPage'))
const Records = lazy(() => import('./pages/RecordsPage'))
const Reports = lazy(() => import('./pages/ReportsPage'))
const Settings = lazy(() => import('./pages/SettingsPage'))
const Login = lazy(() => import('./pages/LoginPage'))
const NotFound = lazy(() => import('./pages/NotFoundPage'))
export default function App() {
  const session = usePreferences((s) => s.session)
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ToastProvider>
        <ErrorBoundary>
          <Suspense fallback={<LoadingState />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={session ? <Layout /> : <Navigate to="/login" replace />}>
                <Route index element={<Navigate to="/overview" replace />} />
                <Route path="overview" element={<Overview />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="orders" element={<Records type="orders" />} />
                <Route path="customers" element={<Records type="customers" />} />
                <Route path="products" element={<Records type="products" />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </ToastProvider>
    </BrowserRouter>
  )
}
