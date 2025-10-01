import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { SeminarsPage } from '@/pages/SeminarsPage';
import { ReportingPage } from '@/pages/ReportingPage';
import { AttendeesPage } from '@/pages/AttendeesPage';
import { App } from './App';
const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/",
            element: <DashboardPage />,
          },
          {
            path: "/seminars",
            element: <SeminarsPage />,
          },
          {
            path: "/seminars/:seminarId/attendees",
            element: <AttendeesPage />,
          },
          {
            path: "/reporting",
            element: <ReportingPage />,
          },
        ]
      }
    ]
  }
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)