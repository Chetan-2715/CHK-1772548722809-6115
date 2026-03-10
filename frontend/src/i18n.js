import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "app": {
                "title": "Scan4Elders",
                "home": "Home",
                "prescription": "Prescription",
                "scan_medicine": "Scan Medicine",
                "history": "History",
                "profile": "Profile",
                "login_register": "Login / Register",
                "logout": "Logout"
            },
            "home": {
                "badge": "Made for Seniors",
                "title_prefix": "Your Personal",
                "title_highlight": "AI Medication Assistant",
                "subtitle": "Understand your prescriptions, verify your tablets, and never miss a dose. Designed to be simple, clear, and easy to use.",
                "get_started": "Get Started",
                "scan_new": "Scan Prescription",
                "verified_safe": "Verified Safe",
                "how_it_helps": "How Scan4Elders Helps You",
                "read": "Read Prescriptions",
                "read_desc": "Take a photo of your doctor's handwriting. Our AI will read it and explain every medicine simply.",
                "verify": "Verify Medicine",
                "verify_desc": "Not sure about a tablet? Scan its barcode or upload a picture to check if it's the right one.",
                "reminders": "Smart Reminders",
                "reminders_desc": "Get notified when it's time to take your pills automatically via Google Calendar."
            },
            "dashboard": {
                "title": "My Dashboard",
                "welcome": "Welcome back, {{name}}! Here are your recent prescriptions.",
                "scan_new": "+ Scan New",
                "no_prescriptions": "No Prescriptions Found",
                "scan_first": "Scan your first prescription to see its details here.",
                "start_scanning": "Start Scanning",
                "unknown_doctor": "Unknown Doctor",
                "unknown_date": "Unknown Date",
                "medicines_count": "{{count}} Medicines",
                "medicines_info": "Prescribed Medicines Information",
                "dosage": "Dosage",
                "instructions": "Instructions",
                "usage": "Usage",
                "precautions": "Precautions"
            },
            "a11y": {
                "options": "Accessibility Options",
                "size": "Size",
                "theme": "Theme",
                "voice": "Voice",
                "language": "Language"
            }
        }
    },
    hi: {
        translation: {
            "app": {
                "title": "स्कैन4एल्डर्स",
                "home": "होम",
                "prescription": "पर्चे",
                "scan_medicine": "दवा स्कैन करें",
                "history": "इतिहास",
                "profile": "प्रोफ़ाइल",
                "login_register": "लॉगिन / रजिस्टर",
                "logout": "लॉगआउट"
            },
            "home": {
                "badge": "बुजुर्गों के लिए निर्मित",
                "title_prefix": "आपका व्यक्तिगत",
                "title_highlight": "AI दवा सहायक",
                "subtitle": "अपने नुस्खे समझें, अपनी गोलियों की जांच करें, और कभी भी खुराक न चूकें। सरल, स्पष्ट और उपयोग में आसान होने के लिए डिज़ाइन किया गया।",
                "get_started": "शुरू करें",
                "scan_new": "पर्चा स्कैन करें",
                "verified_safe": "सत्यापित सुरक्षित",
                "how_it_helps": "स्कैन4एल्डर्स आपकी कैसे मदद करता है",
                "read": "पर्चे पढ़ें",
                "read_desc": "अपने डॉक्टर की लिखावट की फोटो लें। हमारा AI इसे पढ़ेगा और समझायेगा।",
                "verify": "दवा सत्यापित करें",
                "verify_desc": "गोली के बारे में पक्का नहीं? इसका बारकोड स्कैन करें या जांचने के लिए चित्र अपलोड करें।",
                "reminders": "स्मार्ट रिमाइंडर",
                "reminders_desc": "ऑटोमैटिक अनुस्मारक प्राप्त करें कि आपकी गोलियां लेने का समय कब है।"
            },
            "dashboard": {
                "title": "मेरा डैशबोर्ड",
                "welcome": "वापसी पर स्वागत है, {{name}}! यहाँ आपके हालिया पर्चे हैं।",
                "scan_new": "+ नया स्कैन करें",
                "no_prescriptions": "कोई पर्चे नहीं मिले",
                "scan_first": "इसका विवरण देखने के लिए अपना पहला पर्चा स्कैन करें।",
                "start_scanning": "स्कैनिंग शुरू करें",
                "unknown_doctor": "अज्ञात डॉक्टर",
                "unknown_date": "अज्ञात तिथि",
                "medicines_count": "{{count}} दवाएं",
                "medicines_info": "निर्धारित दवाओं की जानकारी",
                "dosage": "खुराक",
                "instructions": "निर्देश",
                "usage": "उपयोग",
                "precautions": "सावधानियां"
            },
            "a11y": {
                "options": "एक्सेसिबिलिटी विकल्प",
                "size": "आकार",
                "theme": "थीम",
                "voice": "आवाज़",
                "language": "भाषा"
            }
        }
    },
    mr: {
        translation: {
            "app": {
                "title": "स्कॅन४एल्डर्स",
                "home": "होम",
                "prescription": "प्रिस्क्रिप्शन",
                "scan_medicine": "औषध स्कॅन करा",
                "history": "इतिहास",
                "profile": "प्रोफाईल",
                "login_register": "लॉगिन / रजिस्टर",
                "logout": "लॉगआउट"
            },
            "home": {
                "badge": "ज्येष्ठांसाठी बनवलेले",
                "title_prefix": "तुमचा वैयक्तिक",
                "title_highlight": "AI औषध सहाय्यक",
                "subtitle": "तुमची प्रिस्क्रिप्शन समजून घ्या, तुमच्या गोळ्या तपासा आणि डोस कधीही चुकवू नका. सोपे, स्पष्ट आणि वापरण्यास सुलभ राहण्यासाठी डिझाइन केलेले आहे.",
                "get_started": "सुरू करा",
                "scan_new": "प्रिस्क्रिप्शन स्कॅन करा",
                "verified_safe": "सत्यापित आणि सुरक्षित",
                "how_it_helps": "स्कॅन4एल्डर्स तुम्हाला कशी मदत करते",
                "read": "प्रिस्क्रिप्शन वाचा",
                "read_desc": "तुमच्या डॉक्टरांच्या हस्ताक्षराचा फोटो घ्या. आमचा AI वाचन करेल आणि सर्वकाही सोप्या भाषेत सांगेल.",
                "verify": "औषध तपासा",
                "verify_desc": "एखाद्या गोळीबद्दल शंका आहे? बारकोड स्कॅन करा किंवा तपासण्यासाठी फोटो अपलोड करा.",
                "reminders": "स्मार्ट रिमाइंडर्स",
                "reminders_desc": "गुगल कॅलेंडरद्वारे ऑटोमॅटिक रिमाइंडर्स मिळवा."
            },
            "dashboard": {
                "title": "माझे डॅशबोर्ड",
                "welcome": "पुन्हा स्वागत आहे, {{name}}! येथे तुमची अलीकडील प्रिस्क्रिप्शन आहेत.",
                "scan_new": "+ नवीन स्कॅन करा",
                "no_prescriptions": "कोणतेही प्रिस्क्रिप्शन आढळले नाही",
                "scan_first": "तपशील पाहण्यासाठी तुमचे पहिले प्रिस्क्रिप्शन स्कॅन करा.",
                "start_scanning": "स्कॅनिंग सुरू करा",
                "unknown_doctor": "अज्ञात डॉक्टर",
                "unknown_date": "अज्ञात तारीख",
                "medicines_count": "{{count}} औषधे",
                "medicines_info": "निर्धारित औषधांची माहिती",
                "dosage": "डोस",
                "instructions": "सूचना",
                "usage": "वापर",
                "precautions": "खबरदारी"
            },
            "a11y": {
                "options": "अॅक्सेसिबिलिटी पर्याय",
                "size": "आकार",
                "theme": "थीम",
                "voice": "आवाज",
                "language": "भाषा"
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
