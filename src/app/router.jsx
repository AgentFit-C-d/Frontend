import { createBrowserRouter, Navigate } from 'react-router'
import App from './App.jsx'
import AppLayout from '../components/layout/AppLayout.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import ProjectsPage from '../pages/ProjectsPage.jsx'
import ProjectCreatePage from '../pages/ProjectCreatePage.jsx'

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: '/', element: <LoginPage /> },
      {
        path: '/demo',
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/demo/projects" replace /> },
          { path: 'projects', element: <ProjectsPage /> },
          { path: 'projects/new', element: <ProjectCreatePage /> },
          { path: 'projects/:demoId', element: <Navigate to="/demo/projects" replace /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
