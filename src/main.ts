import './styles/main.css';
import './components/school-app';

// Initialize the application
const app = document.createElement('school-app');
document.body.appendChild(app);

// Set initial theme class on document
document.documentElement.classList.add('light');
