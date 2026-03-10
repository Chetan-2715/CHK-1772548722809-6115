import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
    const navigate = useNavigate();

    return (
        <div className="container py-8 animate-fade-in max-w-3xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="btn btn-ghost flex items-center gap-2 mb-6"
            >
                <ArrowLeft size={20} /> Back
            </button>
            <div className="card card-glass p-8">
                <h1 className="mb-6 text-primary">Privacy Statement & Terms of Service</h1>
                <div className="text-secondary space-y-4 leading-relaxed">
                    <p>
                        Your privacy is important to us. When you create an account on our platform, we may collect certain personal information such as your name, email address, phone number, and login credentials. This information is collected only for the purpose of creating and managing your account, improving our services, and providing a better user experience.
                    </p>
                    <p>
                        We ensure that your personal information is stored securely and is not shared, sold, or distributed to third parties without your consent, except when required by law or for essential service functionality. We implement appropriate security measures to protect your data from unauthorized access, misuse, or disclosure.
                    </p>
                    <p>
                        The information you provide will be used only for account authentication, communication related to the service, and to improve platform functionality. You have the right to update, modify, or delete your personal information from your account settings at any time.
                    </p>
                    <p className="font-medium text-slate-800 pt-4 border-t border-slate-200">
                        By signing up and creating an account, you acknowledge that you have read and agreed to this Privacy Statement and consent to the collection and use of your information as described above.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
