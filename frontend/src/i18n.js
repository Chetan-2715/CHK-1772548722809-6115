import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            app: { title: "Scan4Elders", home: "Home", prescription: "Prescription", scan_medicine: "Scan Medicine", verify_tablet: "Verify Tablet", history: "History", profile: "Profile", login_register: "Login / Register", logout: "Logout", emergency: "Emergency" },
            home: { badge: "Made for Seniors", title_prefix: "Your Personal", title_highlight: "AI Medication Assistant", subtitle: "Understand your prescriptions, verify your tablets, and never miss a dose. Designed to be simple, clear, and easy to use.", get_started: "Get Started", scan_new: "Scan Prescription", verified_safe: "Verified Safe", how_it_helps: "How Scan4Elders Helps You", read: "Read Prescriptions", read_desc: "Take a photo of your doctor's handwriting. Our AI will read it and explain every medicine simply.", identify_desc: "Not sure about a medicine name? Scan its barcode or take a photo to get full clinical details instantly.", verify: "Safety Check", verify_desc: "Verify if a medicine you have is the one actually prescribed by your doctor to avoid mistakes.", reminders: "Smart Reminders", reminders_desc: "Get notified when it's time to take your pills automatically via Google Calendar." },
            dashboard: { title: "My Dashboard", welcome: "Welcome back, {{name}}! Here are your recent prescriptions.", scan_new: "+ Scan New", no_prescriptions: "No Prescriptions Found", scan_first: "Scan your first prescription to see its details here.", start_scanning: "Start Scanning", unknown_doctor: "Unknown Doctor", unknown_date: "Unknown Date", medicines_count: "{{count}} Medicines", medicines_info: "Prescribed Medicines Information", dosage: "Dosage", instructions: "Instructions", usage: "Usage", precautions: "Precautions" },
            scan: { badge: "Advanced Identification", hero_title_1: "Medicine", hero_title_2: "Intelligence.", hero_sub: "Identify any medicine instantly using AI. Choose your method below.", col_name: "Search by Name", col_barcode: "Search by Barcode", col_photo: "Search by Photo", name_placeholder: "e.g. Paracetamol", find_medicine: "Find Medicine", choose_file: "Choose File / Take Image", or_manually: "or manually", barcode_placeholder: "890123... (Barcode)", search_barcode: "Search Barcode", upload_photo: "Upload Photo", visual_ai: "Visual AI Identification", capture: "Capture Medicine", searching_name: "Searching by name...", scanning_barcode: "Scanning barcode...", identifying: "Identifying medicine...", uploaded_image: "Uploaded Image", analyzing_photo: "Analyzing Photo...", click_change: "Click to change image", click_change_photo: "Click to change photo", not_found: "Could not find that", new_search: "New Search", ai_verified: "AI Verification Successful", primary_use: "Primary Use", standard_dose: "Standard Dose", safety: "Safety & Warnings", side_effects: "Side Effects", missed_dose: "Missed Dose", read_aloud: "Read Aloud" },
            upload: { title: "Read Prescription", subtitle: "Upload a clear photo of your doctor's prescription, and we will extract and explain all the medicines simply.", upload_image: "Upload Image", click_choose: "Click to choose image", formats: "JPEG, PNG formats supported", clear: "Clear Image", analyze: "Analyze Prescription", analyzing: "Analyzing Image...", results: "Results", results_placeholder: "Your results will appear here after analysis.", doctor: "Doctor", hospital: "Hospital", found: "Found", medicines: "medicines", play_audio: "Play Audio Summary", prescribed: "Prescribed", set_reminder: "Set Reminder", cancel_reminder: "Cancel Reminder", time_to_take: "Time to Take", frequency: "Frequency", daily: "Every Day", twice_daily: "Twice a Day", weekly: "Once a Week", save_reminder: "Save Reminder", side_effects: "Side Effects" },
            history: { title: "Interaction History", subtitle: "A log of all medicines you have checked.", no_history: "No history yet", searched: "Searched manually", scanned: "Scanned Barcode/Image", verified: "Verified Check", from_prescription: "Extracted from Prescription", viewed: "Viewed" },
            profile: { title: "My Profile", medical_history: "Medical History", caretaker: "Caretaker", weekly_reports: "Weekly Reports", appointments: "Appointment Scheduler", logout: "Logout" },
            login: { welcome_back: "Welcome Back", create_account: "Create Account", subtitle_login: "Enter your credentials to continue", subtitle_register: "Sign up for intelligent medication management", full_name: "Full Name", email: "Email Address", password: "Password", age: "Age (Optional)", phone: "Phone (Optional)", agree_privacy: "I agree to the", privacy_link: "Privacy Policy and Terms of Service", btn_login: "Login", btn_register: "Create Account", no_account: "Don't have an account?", have_account: "Already have an account?", sign_up: "Sign Up", log_in: "Log In" },
            lang_popup: { title: "Choose Your Language", subtitle: "अपनी भाषा चुनें | आपली भाषा निवडा", footer: "You can change this anytime in Settings", confirm: "Continue" },
            a11y: { options: "Accessibility Options", size: "Size", theme: "Theme", voice: "Voice", language: "Language" }
        }
    },
    hi: {
        translation: {
            app: { title: "स्कैन4एल्डर्स", home: "होम", prescription: "पर्चा", scan_medicine: "दवा स्कैन करें", verify_tablet: "दवा सत्यापित करें", history: "इतिहास", profile: "प्रोफ़ाइल", login_register: "लॉगिन / रजिस्टर", logout: "लॉगआउट", emergency: "आपातकाल" },
            home: { badge: "बुजुर्गों के लिए", title_prefix: "आपका व्यक्तिगत", title_highlight: "AI दवा सहायक", subtitle: "अपने पर्चे समझें, अपनी गोलियों की जांच करें, और कभी खुराक न चूकें। सरल और उपयोग में आसान।", get_started: "शुरू करें", scan_new: "पर्चा स्कैन करें", verified_safe: "सत्यापित सुरक्षित", how_it_helps: "स्कैन4एल्डर्स आपकी कैसे मदद करता है", read: "पर्चे पढ़ें", read_desc: "अपने डॉक्टर की लिखावट की फोटो लें। AI इसे पढ़ेगा और समझाएगा।", identify_desc: "दवा का नाम नहीं पता? बारकोड स्कैन करें या फोटो लें।", verify: "सुरक्षा जांच", verify_desc: "जांचें कि दवा डॉक्टर द्वारा सुझाई गई है या नहीं।", reminders: "स्मार्ट रिमाइंडर", reminders_desc: "गोलियां लेने का समय होने पर सूचना पाएं।" },
            dashboard: { title: "मेरा डैशबोर्ड", welcome: "वापसी पर स्वागत है, {{name}}!", scan_new: "+ नया स्कैन", no_prescriptions: "कोई पर्चे नहीं मिले", scan_first: "विवरण देखने के लिए पहला पर्चा स्कैन करें।", start_scanning: "स्कैनिंग शुरू करें", unknown_doctor: "अज्ञात डॉक्टर", unknown_date: "अज्ञात तिथि", medicines_count: "{{count}} दवाएं", medicines_info: "निर्धारित दवाओं की जानकारी", dosage: "खुराक", instructions: "निर्देश", usage: "उपयोग", precautions: "सावधानियां" },
            scan: { badge: "उन्नत पहचान", hero_title_1: "दवा", hero_title_2: "पहचान।", hero_sub: "AI का उपयोग करके किसी भी दवा की तुरंत पहचान करें।", col_name: "नाम से खोजें", col_barcode: "बारकोड से खोजें", col_photo: "फोटो से खोजें", name_placeholder: "जैसे पैरासिटामोल", find_medicine: "दवा खोजें", choose_file: "फ़ाइल चुनें / फोटो लें", or_manually: "या मैन्युअल रूप से", barcode_placeholder: "890123... (बारकोड)", search_barcode: "बारकोड खोजें", upload_photo: "फोटो अपलोड करें", visual_ai: "विज़ुअल AI पहचान", capture: "दवा कैप्चर करें", searching_name: "नाम से खोज रहे हैं...", scanning_barcode: "बारकोड स्कैन हो रहा है...", identifying: "दवा की पहचान हो रही है...", uploaded_image: "अपलोड की गई छवि", analyzing_photo: "फोटो का विश्लेषण...", click_change: "बदलने के लिए क्लिक करें", click_change_photo: "फोटो बदलने के लिए क्लिक करें", not_found: "यह नहीं मिला", new_search: "नई खोज", ai_verified: "AI सत्यापन सफल", primary_use: "प्राथमिक उपयोग", standard_dose: "मानक खुराक", safety: "सुरक्षा और चेतावनी", side_effects: "दुष्प्रभाव", missed_dose: "छूटी हुई खुराक", read_aloud: "पढ़कर सुनाएं" },
            upload: { title: "पर्चा पढ़ें", subtitle: "अपने डॉक्टर के पर्चे की स्पष्ट फोटो अपलोड करें, हम सभी दवाओं को सरलता से समझाएंगे।", upload_image: "छवि अपलोड करें", click_choose: "छवि चुनने के लिए क्लिक करें", formats: "JPEG, PNG प्रारूप समर्थित", clear: "छवि हटाएं", analyze: "पर्चा विश्लेषण करें", analyzing: "छवि का विश्लेषण...", results: "परिणाम", results_placeholder: "विश्लेषण के बाद परिणाम यहाँ दिखाई देंगे।", doctor: "डॉक्टर", hospital: "अस्पताल", found: "मिली", medicines: "दवाएं", play_audio: "ऑडियो सारांश चलाएं", prescribed: "निर्धारित", set_reminder: "रिमाइंडर सेट करें", cancel_reminder: "रिमाइंडर रद्द करें", time_to_take: "लेने का समय", frequency: "आवृत्ति", daily: "हर दिन", twice_daily: "दिन में दो बार", weekly: "सप्ताह में एक बार", save_reminder: "रिमाइंडर सहेजें", side_effects: "दुष्प्रभाव" },
            history: { title: "इतिहास", subtitle: "आपने जो दवाएं जांची हैं उनका रिकॉर्ड।", no_history: "अभी तक कोई इतिहास नहीं", searched: "मैन्युअल खोज", scanned: "बारकोड/छवि स्कैन", verified: "सत्यापन जांच", from_prescription: "पर्चे से निकाला", viewed: "देखा गया" },
            profile: { title: "मेरी प्रोफ़ाइल", medical_history: "चिकित्सा इतिहास", caretaker: "देखभालकर्ता", weekly_reports: "साप्ताहिक रिपोर्ट", appointments: "अपॉइंटमेंट शेड्यूलर", logout: "लॉगआउट" },
            login: { welcome_back: "वापसी पर स्वागत है", create_account: "खाता बनाएं", subtitle_login: "जारी रखने के लिए अपनी जानकारी दर्ज करें", subtitle_register: "बुद्धिमान दवा प्रबंधन के लिए साइन अप करें", full_name: "पूरा नाम", email: "ईमेल पता", password: "पासवर्ड", age: "आयु (वैकल्पिक)", phone: "फ़ोन (वैकल्पिक)", agree_privacy: "मैं सहमत हूँ", privacy_link: "गोपनीयता नीति और सेवा की शर्तें", btn_login: "लॉगिन", btn_register: "खाता बनाएं", no_account: "खाता नहीं है?", have_account: "पहले से खाता है?", sign_up: "साइन अप", log_in: "लॉग इन" },
            lang_popup: { title: "अपनी भाषा चुनें", subtitle: "Choose your language | आपली भाषा निवडा", footer: "आप इसे कभी भी सेटिंग्स में बदल सकते हैं", confirm: "जारी रखें" },
            a11y: { options: "एक्सेसिबिलिटी विकल्प", size: "आकार", theme: "थीम", voice: "आवाज़", language: "भाषा" }
        }
    },
    mr: {
        translation: {
            app: { title: "स्कॅन4एल्डर्स", home: "होम", prescription: "प्रिस्क्रिप्शन", scan_medicine: "औषध स्कॅन करा", verify_tablet: "औषध तपासा", history: "इतिहास", profile: "प्रोफाईल", login_register: "लॉगिन / रजिस्टर", logout: "लॉगआउट", emergency: "आणीबाणी" },
            home: { badge: "ज्येष्ठांसाठी", title_prefix: "तुमचा वैयक्तिक", title_highlight: "AI औषध सहाय्यक", subtitle: "तुमची प्रिस्क्रिप्शन समजून घ्या, गोळ्या तपासा आणि डोस कधीही चुकवू नका.", get_started: "सुरू करा", scan_new: "प्रिस्क्रिप्शन स्कॅन करा", verified_safe: "सत्यापित सुरक्षित", how_it_helps: "स्कॅन4एल्डर्स तुम्हाला कशी मदत करते", read: "प्रिस्क्रिप्शन वाचा", read_desc: "डॉक्टरांच्या हस्ताक्षराचा फोटो घ्या. AI वाचन करेल आणि सोप्या भाषेत सांगेल.", identify_desc: "औषधाचे नाव माहित नाही? बारकोड स्कॅन करा किंवा फोटो घ्या.", verify: "सुरक्षा तपासणी", verify_desc: "औषध डॉक्टरांनी लिहिलेले आहे का ते तपासा.", reminders: "स्मार्ट रिमाइंडर्स", reminders_desc: "गोळ्या घेण्याची वेळ आल्यावर सूचना मिळवा." },
            dashboard: { title: "माझे डॅशबोर्ड", welcome: "पुन्हा स्वागत, {{name}}!", scan_new: "+ नवीन स्कॅन", no_prescriptions: "कोणतेही प्रिस्क्रिप्शन नाही", scan_first: "तपशील पाहण्यासाठी पहिले प्रिस्क्रिप्शन स्कॅन करा.", start_scanning: "स्कॅनिंग सुरू करा", unknown_doctor: "अज्ञात डॉक्टर", unknown_date: "अज्ञात तारीख", medicines_count: "{{count}} औषधे", medicines_info: "निर्धारित औषधांची माहिती", dosage: "डोस", instructions: "सूचना", usage: "वापर", precautions: "खबरदारी" },
            scan: { badge: "प्रगत ओळख", hero_title_1: "औषध", hero_title_2: "ओळख.", hero_sub: "AI वापरून कोणत्याही औषधाची ओळख करा.", col_name: "नावाने शोधा", col_barcode: "बारकोडने शोधा", col_photo: "फोटोने शोधा", name_placeholder: "उदा. पॅरासिटामॉल", find_medicine: "औषध शोधा", choose_file: "फाइल निवडा / फोटो घ्या", or_manually: "किंवा मॅन्युअली", barcode_placeholder: "890123... (बारकोड)", search_barcode: "बारकोड शोधा", upload_photo: "फोटो अपलोड करा", visual_ai: "व्हिज्युअल AI ओळख", capture: "औषध कॅप्चर करा", searching_name: "नावाने शोधत आहे...", scanning_barcode: "बारकोड स्कॅन होत आहे...", identifying: "औषध ओळखत आहे...", uploaded_image: "अपलोड केलेली प्रतिमा", analyzing_photo: "फोटोचे विश्लेषण...", click_change: "बदलण्यासाठी क्लिक करा", click_change_photo: "फोटो बदलण्यासाठी क्लिक करा", not_found: "सापडले नाही", new_search: "नवीन शोध", ai_verified: "AI सत्यापन यशस्वी", primary_use: "प्राथमिक वापर", standard_dose: "मानक डोस", safety: "सुरक्षा आणि इशारे", side_effects: "दुष्परिणाम", missed_dose: "चुकलेला डोस", read_aloud: "वाचून दाखवा" },
            upload: { title: "प्रिस्क्रिप्शन वाचा", subtitle: "तुमच्या डॉक्टरांच्या प्रिस्क्रिप्शनचा स्पष्ट फोटो अपलोड करा, आम्ही सर्व औषधे सोप्या भाषेत समजावून सांगू.", upload_image: "प्रतिमा अपलोड करा", click_choose: "प्रतिमा निवडण्यासाठी क्लिक करा", formats: "JPEG, PNG प्रारूप समर्थित", clear: "प्रतिमा हटवा", analyze: "प्रिस्क्रिप्शन विश्लेषण करा", analyzing: "प्रतिमेचे विश्लेषण...", results: "निकाल", results_placeholder: "विश्लेषणानंतर निकाल येथे दिसतील.", doctor: "डॉक्टर", hospital: "रुग्णालय", found: "सापडली", medicines: "औषधे", play_audio: "ऑडिओ सारांश ऐका", prescribed: "निर्धारित", set_reminder: "रिमाइंडर सेट करा", cancel_reminder: "रिमाइंडर रद्द करा", time_to_take: "घेण्याची वेळ", frequency: "वारंवारता", daily: "दररोज", twice_daily: "दिवसातून दोनदा", weekly: "आठवड्यातून एकदा", save_reminder: "रिमाइंडर जतन करा", side_effects: "दुष्परिणाम" },
            history: { title: "इतिहास", subtitle: "तुम्ही तपासलेल्या औषधांचा रेकॉर्ड.", no_history: "अद्याप कोणताही इतिहास नाही", searched: "मॅन्युअल शोध", scanned: "बारकोड/प्रतिमा स्कॅन", verified: "सत्यापन तपासणी", from_prescription: "प्रिस्क्रिप्शनमधून", viewed: "पाहिले" },
            profile: { title: "माझे प्रोफाईल", medical_history: "वैद्यकीय इतिहास", caretaker: "काळजीवाहक", weekly_reports: "साप्ताहिक अहवाल", appointments: "अपॉइंटमेंट शेड्यूलर", logout: "लॉगआउट" },
            login: { welcome_back: "पुन्हा स्वागत", create_account: "खाते तयार करा", subtitle_login: "पुढे जाण्यासाठी तुमची माहिती प्रविष्ट करा", subtitle_register: "बुद्धिमान औषध व्यवस्थापनासाठी साइन अप करा", full_name: "पूर्ण नाव", email: "ईमेल पत्ता", password: "पासवर्ड", age: "वय (पर्यायी)", phone: "फोन (पर्यायी)", agree_privacy: "मी सहमत आहे", privacy_link: "गोपनीयता धोरण आणि सेवा अटी", btn_login: "लॉगिन", btn_register: "खाते तयार करा", no_account: "खाते नाही?", have_account: "आधीच खाते आहे?", sign_up: "साइन अप", log_in: "लॉग इन" },
            lang_popup: { title: "तुमची भाषा निवडा", subtitle: "Choose your language | अपनी भाषा चुनें", footer: "तुम्ही हे कधीही सेटिंग्जमध्ये बदलू शकता", confirm: "पुढे जा" },
            a11y: { options: "अॅक्सेसिबिलिटी पर्याय", size: "आकार", theme: "थीम", voice: "आवाज", language: "भाषा" }
        }
    }
};

const extraTranslations = {
    en: {
        translation: {
            domains: {
                ayurvedic: 'Ayurvedic',
                homeopathy: 'Homeopathy',
                allopathy: 'Allopathy',
                cardiologist: 'Cardiologist',
                neurological: 'Neurological',
                orthopedic: 'Orthopedic',
                pediatric: 'Pediatric',
                other: 'Other Speciality'
            },
            dashboard: {
                active_domain: 'Active Domain:',
                could_not_load_details: 'Could not load additional details.'
            },
            home: {
                sample_pill: 'Paracetamol 500mg'
            },
            concern: {
                title: 'Select Your Concern',
                subtitle: 'To provide the most accurate medical guidance, please select the category that best matches your current needs.',
                voice: {
                    selected: 'You selected {{concern}}. Redirecting to homepage.'
                }
            },
            lang_popup: {
                selected: 'Selected'
            },
            verify: {
                title: 'Verify Your Tablets',
                subtitle: 'Type a medicine name to check if your doctor prescribed it for you.',
                medicine_name: 'Medicine Name',
                placeholder: 'e.g. Amlodipine',
                checking: 'Checking...',
                safe_to_take: 'Safe to Take',
                similar_substitute: 'Similar Substitute',
                not_prescribed: 'Not Prescribed!',
                prescribed_details: 'Prescribed Details',
                medicine: 'Medicine',
                dosage: 'Dosage',
                instructions: 'Instructions',
                error_failed: 'Verification failed',
                voice: {
                    verifying: 'Verifying if {{name}} is in your prescriptions',
                    confirmed: 'Yes. {{name}} is in your prescription.',
                    replacement: 'Warning. {{name}} is not directly in your prescription but is similar to another medicine.',
                    warning: 'Alert. {{name}} is NOT in your prescription.'
                }
            },
            privacy: {
                back: 'Back',
                title: 'Privacy Statement & Terms of Service',
                p1: 'Your privacy is important to us. When you create an account on our platform, we may collect certain personal information such as your name, email address, phone number, and login credentials. This information is collected only for the purpose of creating and managing your account, improving our services, and providing a better user experience.',
                p2: 'We ensure that your personal information is stored securely and is not shared, sold, or distributed to third parties without your consent, except when required by law or for essential service functionality. We implement appropriate security measures to protect your data from unauthorized access, misuse, or disclosure.',
                p3: 'The information you provide will be used only for account authentication, communication related to the service, and to improve platform functionality. You have the right to update, modify, or delete your personal information from your account settings at any time.',
                ack: 'By signing up and creating an account, you acknowledge that you have read and agreed to this Privacy Statement and consent to the collection and use of your information as described above.'
            },
            scan: {
                unknown: 'Unknown',
                refer_doctor: 'Refer to doctor',
                none_reported: 'None reported',
                standard_safety: 'Standard safety rules',
                take_as_remembered: 'Take as remembered',
                errors: {
                    medicine_not_found: 'Medicine not found. Please check the spelling.',
                    generic: 'An error occurred',
                    barcode_not_found: 'Barcode not found in database',
                    decode_failed: 'Could not decode barcode from image.',
                    scan_image_failed: 'Error scanning barcode image. Please try again.',
                    partial_identify: 'Could not fully identify.',
                    identify_failed: 'Could not identify medicine from image',
                    analyze_network: 'Network or processing error while analyzing the photo.'
                },
                voice: {
                    ready_again: 'Ready to search again',
                    searching_for: 'Searching for {{name}}',
                    found_info: 'Found information for {{name}}',
                    medicine_not_found: 'Medicine not found',
                    error_prefix: 'Error: {{message}}',
                    lookup_barcode: 'Looking up barcode number {{barcode}}',
                    found_medicine: 'Found medicine: {{name}}',
                    barcode_not_found: 'Barcode not found in database',
                    scanning_barcode_image: 'Scanning barcode image, please wait',
                    identified_as: 'Success. Identified as {{name}}',
                    decode_failed: 'Could not decode barcode from image',
                    scan_image_failed: 'Error scanning barcode image',
                    analyzing_photo: 'Analyzing medicine photo, please wait',
                    identified_visually: 'Identified visually: {{name}}',
                    partial_identify: 'Could not fully identify the medicine.',
                    identify_failed: 'Could not identify medicine from image',
                    analyze_error: 'Error analyzing photo',
                    read_aloud_summary: '{{name}}. Usage: {{usage}}. Dosage: {{dosage}}.'
                }
            },
            upload: {
                voice: {
                    image_selected: 'Prescription image selected',
                    select_image_first: 'Please select an image first',
                    analyzing: 'Analyzing prescription. Please wait a moment.',
                    success_found: 'Success. Found {{count}} medicines in the prescription.',
                    failed_process: 'Failed to process image',
                    upload_error: 'An error occurred during upload',
                    reminder_failed: 'Failed to set reminder'
                }
            }
        }
    },
    hi: {
        translation: {
            domains: {
                ayurvedic: 'आयुर्वेदिक',
                homeopathy: 'होम्योपैथी',
                allopathy: 'एलोपैथी',
                cardiologist: 'हृदय रोग विशेषज्ञ',
                neurological: 'न्यूरोलॉजिकल',
                orthopedic: 'ऑर्थोपेडिक',
                pediatric: 'बाल रोग',
                other: 'अन्य विशेषज्ञता'
            },
            dashboard: {
                active_domain: 'सक्रिय श्रेणी:',
                could_not_load_details: 'अतिरिक्त विवरण लोड नहीं हो सके।'
            },
            home: {
                sample_pill: 'पैरासिटामोल 500mg'
            },
            concern: {
                title: 'अपनी आवश्यकता चुनें',
                subtitle: 'सबसे सटीक चिकित्सा मार्गदर्शन देने के लिए, कृपया वह श्रेणी चुनें जो आपकी वर्तमान आवश्यकता से सबसे अधिक मेल खाती हो।',
                voice: {
                    selected: 'आपने {{concern}} चुना है। होमपेज पर भेजा जा रहा है।'
                }
            },
            lang_popup: {
                selected: 'चयनित'
            },
            verify: {
                title: 'अपनी दवा सत्यापित करें',
                subtitle: 'दवा का नाम टाइप करें और जांचें कि क्या डॉक्टर ने इसे आपके लिए लिखा है।',
                medicine_name: 'दवा का नाम',
                placeholder: 'जैसे एम्लोडिपीन',
                checking: 'जांच हो रही है...',
                safe_to_take: 'लेना सुरक्षित है',
                similar_substitute: 'समान विकल्प',
                not_prescribed: 'डॉक्टर ने नहीं लिखी!',
                prescribed_details: 'निर्धारित विवरण',
                medicine: 'दवा',
                dosage: 'खुराक',
                instructions: 'निर्देश',
                error_failed: 'सत्यापन विफल रहा',
                voice: {
                    verifying: 'जांच रहे हैं कि {{name}} आपकी पर्चियों में है या नहीं',
                    confirmed: 'हाँ। {{name}} आपकी पर्ची में है।',
                    replacement: 'चेतावनी। {{name}} सीधे पर्ची में नहीं है, लेकिन किसी अन्य दवा से मिलती-जुलती है।',
                    warning: 'अलर्ट। {{name}} आपकी पर्ची में नहीं है।'
                }
            },
            privacy: {
                back: 'वापस',
                title: 'गोपनीयता वक्तव्य और सेवा की शर्तें',
                p1: 'आपकी गोपनीयता हमारे लिए महत्वपूर्ण है। जब आप हमारे प्लेटफॉर्म पर खाता बनाते हैं, तो हम आपका नाम, ईमेल, फोन नंबर और लॉगिन जानकारी जैसी कुछ व्यक्तिगत जानकारी एकत्र कर सकते हैं। यह जानकारी केवल आपका खाता बनाने और प्रबंधित करने, सेवाओं में सुधार करने और बेहतर उपयोगकर्ता अनुभव देने के लिए ली जाती है।',
                p2: 'हम सुनिश्चित करते हैं कि आपकी व्यक्तिगत जानकारी सुरक्षित रूप से संग्रहीत हो और आपकी सहमति के बिना किसी तीसरे पक्ष के साथ साझा, बेची या वितरित न की जाए, सिवाय कानूनी आवश्यकता या आवश्यक सेवा कार्यक्षमता के। हम अनधिकृत पहुंच, दुरुपयोग या खुलासे से आपकी जानकारी की सुरक्षा के लिए उचित उपाय अपनाते हैं।',
                p3: 'आपकी जानकारी का उपयोग केवल खाता प्रमाणीकरण, सेवा से संबंधित संचार और प्लेटफॉर्म कार्यक्षमता में सुधार के लिए किया जाएगा। आप किसी भी समय अपनी खाता सेटिंग्स से जानकारी अपडेट, संशोधित या हटाने का अधिकार रखते हैं।',
                ack: 'साइन अप और खाता बनाकर आप स्वीकार करते हैं कि आपने इस गोपनीयता वक्तव्य को पढ़ लिया है और ऊपर वर्णित तरीके से जानकारी के संग्रह और उपयोग के लिए सहमति देते हैं।'
            },
            scan: {
                unknown: 'अज्ञात',
                refer_doctor: 'डॉक्टर से सलाह लें',
                none_reported: 'कोई रिपोर्ट नहीं',
                standard_safety: 'मानक सुरक्षा नियम',
                take_as_remembered: 'याद आते ही लें',
                errors: {
                    medicine_not_found: 'दवा नहीं मिली। कृपया वर्तनी जांचें।',
                    generic: 'एक त्रुटि हुई',
                    barcode_not_found: 'डेटाबेस में बारकोड नहीं मिला',
                    decode_failed: 'छवि से बारकोड पढ़ा नहीं जा सका।',
                    scan_image_failed: 'बारकोड छवि स्कैन करने में त्रुटि। कृपया पुनः प्रयास करें।',
                    partial_identify: 'पूरी पहचान नहीं हो सकी।',
                    identify_failed: 'छवि से दवा पहचान नहीं सकी',
                    analyze_network: 'फोटो का विश्लेषण करते समय नेटवर्क या प्रोसेसिंग त्रुटि हुई।'
                },
                voice: {
                    ready_again: 'फिर से खोजने के लिए तैयार',
                    searching_for: '{{name}} के लिए खोज रहे हैं',
                    found_info: '{{name}} की जानकारी मिल गई',
                    medicine_not_found: 'दवा नहीं मिली',
                    error_prefix: 'त्रुटि: {{message}}',
                    lookup_barcode: 'बारकोड नंबर {{barcode}} खोज रहे हैं',
                    found_medicine: 'दवा मिली: {{name}}',
                    barcode_not_found: 'डेटाबेस में बारकोड नहीं मिला',
                    scanning_barcode_image: 'बारकोड छवि स्कैन हो रही है, कृपया प्रतीक्षा करें',
                    identified_as: 'सफलता। {{name}} के रूप में पहचाना गया',
                    decode_failed: 'छवि से बारकोड पढ़ा नहीं जा सका',
                    scan_image_failed: 'बारकोड छवि स्कैन करने में त्रुटि',
                    analyzing_photo: 'दवा की फोटो का विश्लेषण हो रहा है, कृपया प्रतीक्षा करें',
                    identified_visually: 'दृश्य रूप से पहचाना गया: {{name}}',
                    partial_identify: 'दवा की पूरी पहचान नहीं हो सकी।',
                    identify_failed: 'छवि से दवा पहचान नहीं सकी',
                    analyze_error: 'फोटो विश्लेषण में त्रुटि',
                    read_aloud_summary: '{{name}}। उपयोग: {{usage}}। खुराक: {{dosage}}।'
                }
            },
            upload: {
                voice: {
                    image_selected: 'पर्चे की छवि चुनी गई',
                    select_image_first: 'कृपया पहले एक छवि चुनें',
                    analyzing: 'पर्चे का विश्लेषण हो रहा है। कृपया थोड़ा इंतजार करें।',
                    success_found: 'सफलता। पर्चे में {{count}} दवाएं मिलीं।',
                    failed_process: 'छवि प्रोसेस नहीं हो सकी',
                    upload_error: 'अपलोड के दौरान त्रुटि हुई',
                    reminder_failed: 'रिमाइंडर सेट नहीं हो सका'
                }
            }
        }
    },
    mr: {
        translation: {
            domains: {
                ayurvedic: 'आयुर्वेदिक',
                homeopathy: 'होमिओपॅथी',
                allopathy: 'अॅलोपॅथी',
                cardiologist: 'हृदयरोग तज्ञ',
                neurological: 'न्यूरोलॉजिकल',
                orthopedic: 'ऑर्थोपेडिक',
                pediatric: 'बालरोग',
                other: 'इतर विशेषज्ञता'
            },
            dashboard: {
                active_domain: 'सक्रिय विभाग:',
                could_not_load_details: 'अतिरिक्त तपशील लोड करता आले नाहीत.'
            },
            home: {
                sample_pill: 'पॅरासिटामॉल 500mg'
            },
            concern: {
                title: 'तुमची गरज निवडा',
                subtitle: 'सर्वात अचूक वैद्यकीय मार्गदर्शन देण्यासाठी, कृपया तुमच्या सध्याच्या गरजेला सर्वाधिक जुळणारी श्रेणी निवडा.',
                voice: {
                    selected: 'तुम्ही {{concern}} निवडले. मुख्यपृष्ठावर पुनर्निर्देशित करत आहोत.'
                }
            },
            lang_popup: {
                selected: 'निवडलेले'
            },
            verify: {
                title: 'तुमच्या गोळ्या तपासा',
                subtitle: 'औषधाचे नाव टाइप करा आणि डॉक्टरांनी ते तुम्हाला लिहून दिले आहे का ते तपासा.',
                medicine_name: 'औषधाचे नाव',
                placeholder: 'उदा. अम्लोडिपिन',
                checking: 'तपासत आहे...',
                safe_to_take: 'घेणे सुरक्षित',
                similar_substitute: 'समान पर्याय',
                not_prescribed: 'लिहून दिलेले नाही!',
                prescribed_details: 'प्रिस्क्राइब केलेले तपशील',
                medicine: 'औषध',
                dosage: 'डोस',
                instructions: 'सूचना',
                error_failed: 'तपासणी अयशस्वी',
                voice: {
                    verifying: '{{name}} तुमच्या प्रिस्क्रिप्शनमध्ये आहे का ते तपासत आहे',
                    confirmed: 'होय. {{name}} तुमच्या प्रिस्क्रिप्शनमध्ये आहे.',
                    replacement: 'इशारा. {{name}} थेट प्रिस्क्रिप्शनमध्ये नाही पण दुसऱ्या औषधासारखे आहे.',
                    warning: 'अलर्ट. {{name}} तुमच्या प्रिस्क्रिप्शनमध्ये नाही.'
                }
            },
            privacy: {
                back: 'मागे',
                title: 'गोपनीयता निवेदन आणि सेवा अटी',
                p1: 'तुमची गोपनीयता आमच्यासाठी महत्त्वाची आहे. तुम्ही आमच्या प्लॅटफॉर्मवर खाते तयार करता तेव्हा नाव, ईमेल, फोन नंबर आणि लॉगिन माहिती अशी काही वैयक्तिक माहिती आम्ही गोळा करू शकतो. ही माहिती फक्त खाते तयार आणि व्यवस्थापित करण्यासाठी, सेवा सुधारण्यासाठी आणि चांगला वापरकर्ता अनुभव देण्यासाठी वापरली जाते.',
                p2: 'तुमची वैयक्तिक माहिती सुरक्षितपणे साठवली जाईल आणि तुमच्या संमतीशिवाय ती तृतीय पक्षांना शेअर, विक्री किंवा वितरित केली जाणार नाही, कायद्याने आवश्यक असल्यास किंवा अत्यावश्यक सेवा कार्यक्षमतेसाठी अपवाद असू शकतो. अनधिकृत प्रवेश, गैरवापर किंवा उघडकीपासून संरक्षणासाठी आम्ही योग्य सुरक्षा उपाय करतो.',
                p3: 'तुम्ही दिलेली माहिती फक्त खाते प्रमाणीकरण, सेवेशी संबंधित संवाद आणि प्लॅटफॉर्म कार्यक्षमता सुधारण्यासाठी वापरली जाईल. तुम्हाला तुमच्या खात्याच्या सेटिंग्जमधून माहिती अद्ययावत, बदल किंवा हटवण्याचा अधिकार कधीही आहे.',
                ack: 'साइन अप करून खाते तयार करताना तुम्ही हे गोपनीयता निवेदन वाचले आहे आणि वर वर्णन केल्याप्रमाणे माहिती संकलन व वापरास सहमती देता हे मान्य करता.'
            },
            scan: {
                unknown: 'अज्ञात',
                refer_doctor: 'डॉक्टरांचा सल्ला घ्या',
                none_reported: 'काही नोंद नाही',
                standard_safety: 'मानक सुरक्षा नियम',
                take_as_remembered: 'आठवल्यावर घ्या',
                errors: {
                    medicine_not_found: 'औषध सापडले नाही. कृपया स्पेलिंग तपासा.',
                    generic: 'एक त्रुटी आली',
                    barcode_not_found: 'डेटाबेसमध्ये बारकोड सापडला नाही',
                    decode_failed: 'प्रतिमेतून बारकोड वाचता आला नाही.',
                    scan_image_failed: 'बारकोड प्रतिमा स्कॅन करताना त्रुटी. कृपया पुन्हा प्रयत्न करा.',
                    partial_identify: 'पूर्ण ओळख होऊ शकली नाही.',
                    identify_failed: 'प्रतिमेतून औषध ओळखता आले नाही',
                    analyze_network: 'फोटो विश्लेषण करताना नेटवर्क किंवा प्रोसेसिंग त्रुटी आली.'
                },
                voice: {
                    ready_again: 'पुन्हा शोधण्यासाठी तयार',
                    searching_for: '{{name}} साठी शोध सुरू आहे',
                    found_info: '{{name}} बद्दल माहिती मिळाली',
                    medicine_not_found: 'औषध सापडले नाही',
                    error_prefix: 'त्रुटी: {{message}}',
                    lookup_barcode: 'बारकोड क्रमांक {{barcode}} शोधत आहोत',
                    found_medicine: 'औषध सापडले: {{name}}',
                    barcode_not_found: 'डेटाबेसमध्ये बारकोड सापडला नाही',
                    scanning_barcode_image: 'बारकोड प्रतिमा स्कॅन करत आहोत, कृपया थांबा',
                    identified_as: 'यशस्वी. {{name}} म्हणून ओळखले',
                    decode_failed: 'प्रतिमेतून बारकोड वाचता आला नाही',
                    scan_image_failed: 'बारकोड प्रतिमा स्कॅन करताना त्रुटी',
                    analyzing_photo: 'औषधाच्या फोटोचे विश्लेषण सुरू आहे, कृपया थांबा',
                    identified_visually: 'दृश्य ओळख: {{name}}',
                    partial_identify: 'औषध पूर्णपणे ओळखता आले नाही.',
                    identify_failed: 'प्रतिमेतून औषध ओळखता आले नाही',
                    analyze_error: 'फोटो विश्लेषणात त्रुटी',
                    read_aloud_summary: '{{name}}. उपयोग: {{usage}}. डोस: {{dosage}}.'
                }
            },
            upload: {
                voice: {
                    image_selected: 'प्रिस्क्रिप्शनची प्रतिमा निवडली',
                    select_image_first: 'कृपया आधी प्रतिमा निवडा',
                    analyzing: 'प्रिस्क्रिप्शनचे विश्लेषण सुरू आहे. कृपया थोडा वेळ थांबा.',
                    success_found: 'यशस्वी. प्रिस्क्रिप्शनमध्ये {{count}} औषधे सापडली.',
                    failed_process: 'प्रतिमा प्रक्रिया अयशस्वी',
                    upload_error: 'अपलोड दरम्यान त्रुटी आली',
                    reminder_failed: 'रिमाइंडर सेट करता आला नाही'
                }
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
        interpolation: { escapeValue: false }
    });

Object.entries(extraTranslations).forEach(([lang, payload]) => {
    i18n.addResourceBundle(lang, 'translation', payload.translation, true, true);
});

export default i18n;
