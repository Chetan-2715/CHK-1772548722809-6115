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
        <div className="container animate-fade-in flex flex-col justify-center" style={{ minHeight: '85vh', padding: '2rem 1rem' }}>
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 w-full pb-12">

                {/* Compartment 1: Search by Name */}
                <div
                    className={`border-2 rounded-3xl transition-all overflow-hidden ${activeTab === 'search' ? 'border-primary shadow-xl bg-white' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:shadow-md cursor-pointer'}`}
                    onClick={() => { if (activeTab !== 'search') { setActiveTab('search'); setResult(null); setError(''); speakText("Switched to Search by Name"); } }}
                >
                    <div className="p-6 md:p-8 flex items-center justify-between">
                        <h2 className={`m-0 text-2xl md:text-3xl ${activeTab === 'search' ? 'font-black text-slate-900' : 'font-bold text-slate-500'}`}>Search by Name</h2>
                        {activeTab !== 'search' && <div className="text-slate-400 font-bold text-xl">+</div>}
                        {activeTab === 'search' && <div className="text-primary font-bold text-xl">-</div>}
                    </div>

                    {activeTab === 'search' && (
                        <div className="px-6 md:px-8 pb-8 pt-2 animate-slide-up border-t border-slate-100">
                            <form onSubmit={handleSearch} className="w-full flex flex-col items-start mt-4">
                                <div className="relative w-full mb-6 flex items-center">
                                    <Search className="absolute left-6 text-slate-800" size={32} />
                                    <input
                                        type="text"
                                        className="w-full m-0 border-2 border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary-light outline-none"
                                        placeholder="Enter name of medicine..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ fontSize: '1.5rem', padding: '1.5rem 1.5rem 1.5rem 5rem', borderRadius: '1rem', backgroundColor: 'transparent', transition: 'all 0.2s' }}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all" style={{ padding: '1rem 3rem', borderRadius: '0.75rem', fontSize: '1.25rem' }} disabled={loading || !searchTerm.trim()}>
                                    {loading ? <div className="spinner border-white mini"></div> : <span className="font-bold">Search</span>}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Compartment 2: Search by QR */}
                <div
                    className={`border-2 rounded-3xl transition-all overflow-hidden ${activeTab === 'scan' ? 'border-primary shadow-xl bg-white' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:shadow-md cursor-pointer'}`}
                    onClick={() => { if (activeTab !== 'scan') { setActiveTab('scan'); setResult(null); setError(''); speakText("Switched to Search by QR"); } }}
                >
                    <div className="p-6 md:p-8 flex items-center justify-between">
                        <h2 className={`m-0 text-2xl md:text-3xl ${activeTab === 'scan' ? 'font-black text-slate-900' : 'font-bold text-slate-500'}`}>Search by QR</h2>
                        {activeTab !== 'scan' && <div className="text-slate-400 font-bold text-xl">+</div>}
                        {activeTab === 'scan' && <div className="text-primary font-bold text-xl">-</div>}
                    </div>

                    {activeTab === 'scan' && (
                        <div className="px-6 md:px-8 pb-8 pt-2 animate-slide-up border-t border-slate-100">
                            <div className="flex flex-col items-start w-full mt-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />

                                <div className="w-full mb-10 flex flex-col items-start">
                                    <button
                                        type="button"
                                        className="btn btn-primary shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                                        style={{ padding: '1.25rem 3rem', fontSize: '1.5rem', borderRadius: '1rem' }}
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <><div className="spinner border-white mini"></div> Scanning Label...</>
                                        ) : (
                                            <><span className="font-bold">Scan QR Code</span></>
                                        )}
                                    </button>
                                </div>

                                <div className="w-full border-t border-slate-200 pt-8 flex flex-col items-start">
                                    <p className="text-secondary mb-4 font-semibold text-sm uppercase tracking-widest text-slate-400">Or type the barcode number</p>

                                    <form onSubmit={handleScanBarcode} className="w-full flex flex-col items-start">
                                        <div className="relative w-full mb-6 flex items-center">
                                            <ScanLine className="absolute left-6 text-slate-800" size={32} />
                                            <input
                                                type="text"
                                                className="w-full m-0 border-2 border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary-light outline-none"
                                                placeholder="Enter the 12-digit number..."
                                                value={barcode}
                                                onChange={(e) => setBarcode(e.target.value)}
                                                style={{ fontSize: '1.5rem', padding: '1.5rem 1.5rem 1.5rem 5rem', borderRadius: '1rem', backgroundColor: 'transparent', transition: 'all 0.2s' }}
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all" style={{ padding: '1rem 3rem', borderRadius: '0.75rem', fontSize: '1.25rem' }} disabled={loading || !barcode.trim()}>
                                            {loading ? <div className="spinner border-white mini"></div> : <span className="font-bold">Search</span>}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Compartment 3: Search by Photo */}
                <div
                    className={`border-2 rounded-3xl transition-all overflow-hidden ${activeTab === 'upload' ? 'border-primary shadow-xl bg-white' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:shadow-md cursor-pointer'}`}
                    onClick={() => { if (activeTab !== 'upload') { setActiveTab('upload'); setResult(null); setError(''); speakText("Switched to Search by Photo"); } }}
                >
                    <div className="p-6 md:p-8 flex items-center justify-between">
                        <h2 className={`m-0 text-2xl md:text-3xl ${activeTab === 'upload' ? 'font-black text-slate-900' : 'font-bold text-slate-500'}`}>Search by Photo</h2>
                        {activeTab !== 'upload' && <div className="text-slate-400 font-bold text-xl">+</div>}
                        {activeTab === 'upload' && <div className="text-primary font-bold text-xl">-</div>}
                    </div>

                    {activeTab === 'upload' && (
                        <div className="px-6 md:px-8 pb-8 pt-2 animate-slide-up border-t border-slate-100">
                            <div className="w-full flex flex-col items-start mt-4">
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
                                    className="btn btn-outline text-slate-800 border-2 border-slate-300 hover:border-primary hover:text-primary hover:bg-primary-light transition-all font-bold group"
                                    style={{ padding: '1.5rem 3rem', borderRadius: '1rem', fontSize: '1.5rem' }}
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-3"><div className="spinner border-slate-800 group-hover:border-primary mini"></div> Processing Photo...</span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-3"><Camera size={32} className="group-hover:text-primary transition-colors" /> Upload a Photo</span>
                                    )}
                                </button>
                                <p className="mt-8 text-slate-500 font-medium text-lg border-l-4 border-slate-300 pl-4 py-1">
                                    Capture the front of the medicine box or the pill itself. Make sure the text is clearly visible.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mt-4 p-5 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 flex items-start gap-4 w-full shadow-sm">
                        <AlertCircle size={32} className="flex-shrink-0 mt-1" />
                        <p className="font-bold text-xl m-0 leading-snug">{error}</p>
                    </div>
                )}
            </div>

            {result && (
                <div className="card shadow-2xl animate-slide-up bg-white rounded-2xl border-0 overflow-hidden" style={{ maxWidth: '850px', margin: '0 auto', borderTop: '6px solid var(--primary-color)' }}>
                    <div className="flex justify-between items-center mb-6 pb-4 bg-slate-50 p-6 -mx-6 -mt-6">
                        <h2 className="m-0 text-3xl font-extrabold text-slate-800">{result.medicine_name}</h2>
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
            )
            }
        </div >
    );
};

export default ScanMedicine;
