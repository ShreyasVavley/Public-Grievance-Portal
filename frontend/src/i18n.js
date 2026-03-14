import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app_title": "Bengaluru Sahaya Portal",
      "home": "Home",
      "file_complaint": "File a Complaint",
      "track_status": "Track Status",
      "login": "Login",
      "logout": "Logout",
      "maya_greeting": "Hi, I'm Maya. How can I help you today?",
      "submit": "Submit",
      "category": "Category",
      "description": "Description",
      "location": "Location",
      "garbage": "Garbage",
      "pothole": "Pothole",
      "water_leak": "Water Leak",
      "electricity": "Electricity",
      "language": "ಕನ್ನಡ",
      "blru_ack_id": "Acknowledgement ID",
      "status": "Status",
      "submitted": "Submitted",
      "verified": "AI Verified",
      "assigned": "Ward Assigned",
      "resolution": "Resolution in Progress",
      "resolved": "Resolved"
    }
  },
  kn: {
    translation: {
      "app_title": "ಬೆಂಗಳೂರು ಸಹಾಯ ಪೋರ್ಟಲ್",
      "home": "ಮುಖಪುಟ",
      "file_complaint": "ದೂರು ಸಲ್ಲಿಸಿ",
      "track_status": "ಸ್ಥಿತಿ ತಿಳಿಯಿರಿ",
      "login": "ಲಾಗಿನ್",
      "logout": "ಲಾಗ್ ಔಟ್",
      "maya_greeting": "ನಮಸ್ಕಾರ, ನಾನು ಮಾಯಾ. ನಾನು ನಿಮಗೆ ಇಂದು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
      "submit": "ಸಲ್ಲಿಸಿ",
      "category": "ವರ್ಗ",
      "description": "ವಿವರಣೆ",
      "location": "ಸ್ಥಳ",
      "garbage": "ಕಸ",
      "pothole": "ಗುಂಡಿ",
      "water_leak": "ನೀರು ಸೋರಿಕೆ",
      "electricity": "ವಿದ್ಯುತ್",
      "language": "English",
      "blru_ack_id": "ಸ್ವೀಕೃತಿ ಸಂಖ್ಯೆ",
      "status": "ಸ್ಥಿತಿ",
      "submitted": "ಸಲ್ಲಿಸಲಾಗಿದೆ",
      "verified": "AI ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
      "assigned": "ವಾರ್ಡ್ ನಿಯೋಜಿಸಲಾಗಿದೆ",
      "resolution": "ಪರಿಹಾರ ಪ್ರಗತಿಯಲ್ಲಿದೆ",
      "resolved": "ಪರಿಹರಿಸಲಾಗಿದೆ"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
