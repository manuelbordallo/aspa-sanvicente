import './styles/main.css';
import './components/school-app';
import { exposeDiagnosticsToWindow } from './utils/component-diagnostics';

// Initialize the application
const app = document.createElement('school-app');
document.body.appendChild(app);

// Set initial theme class on document
document.documentElement.classList.add('light');

// Expose component diagnostics for debugging (development only)
if (import.meta.env.DEV) {
  exposeDiagnosticsToWindow();
}
