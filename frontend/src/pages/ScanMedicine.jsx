import React, { useState, useContext, useRef, useCallback } from 'react';
import { Search, ScanLine, Camera, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { AppContext } from '../App';
import { medicineAPI } from '../services/api';
// Normally we'd use react-qr-barcode-scanner here, but integrating it perfectly requires 
// specific DOM setup, so we provide an interface that uses file uploads or manual entry 
// as robust fallbacks, which aligns with senior-friendly inclusive design.

const ScanMedicine = () => {
    const [activeTab, setActiveTab] = useState('search'); // search, scan, upload
    const [searchTerm, setSearchTerm] = useState('');
    const [barcode, setBarcode] = useState('');
    const [file, setFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const { speakText } = useContext(AppContext);
    const fileInputRef = useRef(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);
        speakText(`Searching for ${searchTerm}`);

        try {
            const res = await medicineAPI.search(searchTerm);
            if (res.data.success) {
                setResult(res.data.data);
                speakText(`Found information for ${res.data.data.medicine_name}`);
            } else {
                setError(res.data.error || 'Medicine not found');
                speakText("Medicine not found");
            }
        } catch (err) {
            const msg = err.response?.data?.detail || "An error occurred";
            setError(msg);
            speakText(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleScanBarcode = async (e) => {
        e.preventDefault();
        if (!barcode.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);
        speakText(`Looking up QR code ${barcode}`);

        try {
            const res = await medicineAPI.scanBarcode({ barcode });
            if (res.data.success) {
                setResult(res.data.data);
                speakText(`Found medicine for this QR code: ${res.data.data.medicine_name}`);
            } else {
                setError(res.data.message || 'QR code not found in database');
                speakText("QR code not found in database");
            }
        } catch (err) {
            const msg = err.response?.data?.detail || "An error occurred";
            setError(msg);
            speakText(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setLoading(true);
        setError('');
        setResult(null);
        speakText("Analyzing image");

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            // First try to extract barcode from image
            const res = await medicineAPI.scanBarcodeImage(formData);

            if (res.data.success !== false && res.data.lookup_result?.success) {
                setResult(res.data.lookup_result.data);
                setBarcode(res.data.barcode);
                speakText(`Found QR code. Identified as ${res.data.lookup_result.data.medicine_name}`);
            } else {
                // Fallback: Verify tablet visually
                speakText("Could not find QR code, trying visual identification");
                const verifyRes = await medicineAPI.verifyTabletImage(formData);

                if (verifyRes.data.success) {
                    setError('Visual Identify: ' + verifyRes.data.message);
                    if (verifyRes.data.medicine_info) {
                        setResult(verifyRes.data.medicine_info);
                        speakText("Identified visually: " + verifyRes.data.medicine_info.medicine_name);
                    } else {
                        speakText("Image processed, check results.");
                    }
                } else {
                    setError(verifyRes.data.error || "Could not identify medicine from image");
                    speakText("Could not identify medicine from image");
                }
            }
        } catch (err) {
            const msg = err.response?.data?.detail || err.response?.data?.message || err.message || "An error occurred";
            setError(msg);
            speakText(`Error computing image`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-8 animate-fade-in">
            <div className="text-center mb-8">
                <h1>Medicine Lookup</h1>
                <p className="text-secondary" style={{ fontSize: '1.125rem' }}>
                    Search by name, enter a QR code, or upload a photo to learn about any medicine.
                </p>
            </div>

            <div className="card card-glass mb-8 p-0 overflow-hidden" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="flex" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <button
                        className={`flex-1 py-4 text-center font-bold text-lg transition-colors border-none cursor-pointer ${activeTab === 'search' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}
                        onClick={() => { setActiveTab('search'); setResult(null); setError(''); speakText("Switched to Search by Name"); }}
                    >
                        <Search className="inline-block mr-2 align-text-bottom" size={20} /> Name
                    </button>
                    <button
                        className={`flex-1 py-4 text-center font-bold text-lg transition-colors border-none cursor-pointer ${activeTab === 'scan' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}
                        onClick={() => { setActiveTab('scan'); setResult(null); setError(''); speakText("Switched to Manual QR Code"); }}
                    >
                        <ScanLine className="inline-block mr-2 align-text-bottom" size={20} /> QR Code
                    </button>
                    <button
                        className={`flex-1 py-4 text-center font-bold text-lg transition-colors border-none cursor-pointer ${activeTab === 'upload' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}
                        onClick={() => { setActiveTab('upload'); setResult(null); setError(''); speakText("Switched to Photo Upload"); }}
                    >
                        <Camera className="inline-block mr-2 align-text-bottom" size={20} /> Photo
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'search' && (
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <input
                                type="text"
                                className="input flex-1"
                                placeholder="e.g. Paracetamol, Aspirin..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ fontSize: '1.25rem', padding: '1rem' }}
                            />
                            <button type="submit" className="btn btn-primary px-8" disabled={loading || !searchTerm.trim()}>
                                {loading ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : <Search size={24} />}
                            </button>
                        </form>
                    )}

                    {activeTab === 'scan' && (
                        <form onSubmit={handleScanBarcode} className="flex gap-4">
                            <input
                                type="text"
                                className="input flex-1"
                                placeholder="Enter numbers under QR code..."
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                style={{ fontSize: '1.25rem', padding: '1rem' }}
                            />
                            <button type="submit" className="btn btn-secondary px-8" disabled={loading || !barcode.trim()}>
                                {loading ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : <ScanLine size={24} />}
                            </button>
                        </form>
                    )}

                    {activeTab === 'upload' && (
                        <div className="text-center py-4">
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                            <button
                                type="button"
                                className="btn btn-primary btn-lg pulse-animation"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2"><div className="spinner" style={{ width: '20px', height: '20px' }}></div> Processing Image...</span>
                                ) : (
                                    <span className="flex items-center gap-2"><Camera size={24} /> Open Camera or Gallery</span>
                                )}
                            </button>
                            <p className="mt-4 text-secondary">
                                Take a picture of the medicine box, QR code, or the tablet itself.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
                            <AlertCircle size={24} className="flex-shrink-0 mt-1" />
                            <p className="font-medium text-lg m-0">{error}</p>
                        </div>
                    )}
                </div>
            </div>

            {result && (
                <div className="card shadow-lg animate-slide-up" style={{ maxWidth: '800px', margin: '0 auto', borderTop: '4px solid var(--primary-color)' }}>
                    <div className="flex justify-between items-center mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <h2 className="m-0 text-3xl text-primary">{result.medicine_name}</h2>
                        <button className="btn btn-ghost p-2 rounded-full hover:bg-slate-100" onClick={() => speakText(`Information for ${result.medicine_name}. Usage: ${result.usage}.`)}>
                            🔊 Listen
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="info-block bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <h4 className="flex items-center gap-2 text-blue-800 font-bold uppercase mb-2">
                                <Info size={18} /> What is it for?
                            </h4>
                            <p className="text-slate-800 text-lg">{result.usage || "Information not available."}</p>
                        </div>

                        <div className="info-block bg-green-50 p-4 rounded-xl border border-green-100">
                            <h4 className="flex items-center gap-2 text-green-800 font-bold uppercase mb-2">
                                <CheckCircle size={18} /> How to take
                            </h4>
                            <p className="text-slate-800 text-lg">{result.dosage || "Consult your prescription."}</p>
                            {result.usage_instructions && (
                                <p className="text-slate-700 mt-2 font-medium">👉 {result.usage_instructions}</p>
                            )}
                        </div>

                        <div className="info-block bg-amber-50 p-4 rounded-xl border border-amber-100 md:col-span-2">
                            <h4 className="flex items-center gap-2 text-amber-800 font-bold uppercase mb-2">
                                <AlertTriangle size={18} /> Important Notes
                            </h4>
                            {result.precautions && <p className="mb-2"><strong>Precautions:</strong> {result.precautions}</p>}
                            {result.side_effects && <p className="mb-2"><strong>Side Effects:</strong> {result.side_effects}</p>}
                            {result.missed_dose_guidelines && <p><strong>If you miss a dose:</strong> {result.missed_dose_guidelines}</p>}
                        </div>

                        {result.composition && (
                            <div className="info-block p-4 rounded-xl border border-slate-200 md:col-span-2">
                                <h4 className="font-bold uppercase text-slate-500 mb-1">Composition (Ingredients)</h4>
                                <p>{result.composition}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScanMedicine;
