import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { Leaf, Droplets, Pill, HeartPulse, Brain, Bone, Baby, Activity } from 'lucide-react';

const SelectConcern = () => {
    const navigate = useNavigate();
    const { speakText } = useContext(AppContext);

    const concerns = [
        { id: 'ayurvedic', label: 'Ayurvedic', icon: <Leaf size={48} color="var(--success-color)" /> },
        { id: 'homeopathy', label: 'Homeopathy', icon: <Droplets size={48} color="var(--primary-color)" /> },
        { id: 'allopathy', label: 'Allopathy', icon: <Pill size={48} color="var(--accent-color)" /> },
        { id: 'cardiologist', label: 'Cardiologist', icon: <HeartPulse size={48} color="var(--error-color)" /> },
        { id: 'neurological', label: 'Neurological', icon: <Brain size={48} color="var(--primary-hover)" /> },
        { id: 'orthopedic', label: 'Orthopedic', icon: <Bone size={48} color="var(--text-secondary)" /> },
        { id: 'pediatric', label: 'Pediatric', icon: <Baby size={48} color="var(--secondary-color)" /> },
        { id: 'other', label: 'Other Speciality', icon: <Activity size={48} color="var(--text-main)" /> },
    ];

    const handleSelect = (concern) => {
        speakText(`You selected ${concern.label}. Redirecting to homepage.`);
        localStorage.setItem('selectedConcern', concern.id);
        navigate('/');
    };

    return (
        <div className="select-concern-container flex justify-center items-center py-10" style={{ minHeight: '80vh' }}>
            <div className="w-full animate-slide-up" style={{ maxWidth: '900px' }}>
                <div className="text-center mb-10">
                    <h1 className="text-primary" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Select Your Concern</h1>
                    <p className="text-secondary" style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Please choose the specific branch of medicine or healthcare speciality you are seeking treatment from. This helps us customize your experience.
                    </p>
                </div>

                <div className="grid grid-cols-4 gap-4 md:gap-6">
                    {/* Row 1: Col 1 and 3 */}
                    <ConcernCard concern={concerns[0]} handleSelect={handleSelect} speakText={speakText} />
                    <div></div>
                    <ConcernCard concern={concerns[1]} handleSelect={handleSelect} speakText={speakText} />
                    <div></div>

                    {/* Row 2: Col 2 and 4 */}
                    <div></div>
                    <ConcernCard concern={concerns[2]} handleSelect={handleSelect} speakText={speakText} />
                    <div></div>
                    <ConcernCard concern={concerns[3]} handleSelect={handleSelect} speakText={speakText} />

                    {/* Row 3: Col 1 and 3 */}
                    <ConcernCard concern={concerns[4]} handleSelect={handleSelect} speakText={speakText} />
                    <div></div>
                    <ConcernCard concern={concerns[5]} handleSelect={handleSelect} speakText={speakText} />
                    <div></div>

                    {/* Row 4: Col 2 and 4 */}
                    <div></div>
                    <ConcernCard concern={concerns[6]} handleSelect={handleSelect} speakText={speakText} />
                    <div></div>
                    <ConcernCard concern={concerns[7]} handleSelect={handleSelect} speakText={speakText} />
                </div>
            </div>
        </div>
    );
};

// Extracted component to ensure exactly the same styling for every tile
const ConcernCard = ({ concern, handleSelect, speakText }) => (
    <button
        className="card card-glass shadow-md transition-all border border-slate-200"
        style={{
            minHeight: '140px',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1.5rem 2rem',
            gap: '1.5rem'
        }}
        onClick={() => handleSelect(concern)}
        onMouseEnter={() => speakText(`Select ${concern.label}`)}
    >
        <div className="icon-wrapper p-4 rounded-full bg-white shadow-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {concern.icon}
        </div>
        <span className="font-bold text-left text-primary" style={{ fontSize: '1.6rem', lineHeight: '1.2' }}>{concern.label}</span>
    </button>
);

export default SelectConcern;

