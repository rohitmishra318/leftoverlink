import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Import all contexts
import { NotificationProvider } from './context/Notificationcontext';
import UserContext from './context/UserContext';
import VolunteerContext from './context/VolunteerContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotificationProvider>
      <UserContext>
        <VolunteerContext>
          <App />
        </VolunteerContext>
      </UserContext>
    </NotificationProvider>
  </StrictMode>
);
