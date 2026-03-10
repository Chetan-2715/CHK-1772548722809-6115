import React, { useState, useContext, useRef } from 'react';
import { Search, ScanLine, Camera, Info, CheckCircle, AlertTriangle, AlertCircle, Volume2, ArrowLeft, RefreshCw } from 'lucide-react';
import { AppContext } from '../App';
import { medicineAPI } from '../services/api';

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

    const handleReset = () => {
        setResult(null);
        setError('');
        setSearchTerm('');
        setBarcode('');
        speakText("Ready to search again");
    };

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
                setError(res.data.error || 'Medicine not found. Please check the spelling.');
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
        speakText(`Looking up barcode number ${barcode}`);

        try {
            const res = await medicineAPI.scanBarcode({ barcode });
            if (res.data.success) {
                setResult(res.data.data);
                speakText(`Found medicine: ${res.data.data.medicine_name}`);
            } else {
                setError(res.data.message || 'Barcode not found in database');
                speakText("Barcode not found in database");
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
        speakText("Analyzing image, please wait");

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const res = await medicineAPI.scanBarcodeImage(formData);

            if (res.data.success !== false && res.data.lookup_result?.success) {
                setResult(res.data.lookup_result.data);
                setBarcode(res.data.barcode);
                speakText(`Success. Identified as ${res.data.lookup_result.data.medicine_name}`);
            } else {
                speakText("Could not find barcode, trying visual identification");
                const verifyRes = await medicineAPI.verifyTabletImage(formData);

                if (verifyRes.data.success) {
                    if (verifyRes.data.medicine_info) {
                        setResult(verifyRes.data.medicine_info);
                        speakText("Identified visually: " + verifyRes.data.medicine_info.medicine_name);
                    } else {
                        setError('Could not fully identify. ' + verifyRes.data.message);
                        speakText("Could not fully identify the medicine.");
                    }
                } else {
                    setError(verifyRes.data.error || "Could not identify medicine from image");
                    speakText("Could not identify medicine from image");
                }
            }
        } catch (err) {
            setError("Network or processing error occurred while analyzing the image.");
            speakText(`Error computing image`);
        } finally {
            setLoading(false);
        }
    };

    // UI Components for Tabs
    const TabButton = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => { setActiveTab(id); speakText(`Selected ${label}`); }}
            className={`flex-1 flex flex-col items-center justify-center py-6 px-4 rounded-3xl transition-all duration-300 border-2 
                ${activeTab === id
                    ? 'bg-primary text-white border-primary shadow-primary scale-[1.02]'
                    : 'bg-white text-slate-500 border-slate-100 hover:border-primary-light hover:bg-slate-50 shadow-sm hover:shadow-md'}`}
        >
            <div className={`p-4 rounded-2xl mb-3 ${activeTab === id ? 'bg-white/20' : 'bg-primary-light'}`}>
                <Icon size={32} className={`${activeTab === id ? 'text-white' : 'text-primary'}`} />
            </div>
            <span className="font-bold text-lg tracking-tight transition-colors">{label}</span>
        </button>
    );

    return (
        <div className="min-h-[85vh] bg-slate-50 p-4 md:p-8 animate-fade-in">
            <div className="max-w-3xl mx-auto flex flex-col gap-8">

                {/* Header Section */}
                <div className="text-center space-y-4 mb-4">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">Identify Your Medicine</h1>
                    <p className="text-xl text-slate-500 font-medium max-w-xl mx-auto opacity-80">Choose your preferred search method to get detailed information instantly.</p>
                </div>

                {/* Hide Search Inputs if Result is Found to reduce clutter for seniors */}
                {!result && (
                    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                        {/* Tab Navigation */}
                        <div className="flex gap-4 mb-8">
                            <TabButton id="search" icon={Search} label="Type Name" />
                            <TabButton id="scan" icon={ScanLine} label="Barcode" />
                            <TabButton id="upload" icon={Camera} label="Take Photo" />
                        </div>

                        {/* Search Input Area */}
                        <div className="animate-slide-up">
                            {/* TEXT SEARCH TAB */}
                            {activeTab === 'search' && (
                                <form onSubmit={handleSearch} className="flex flex-col gap-6">
                                    <div className="relative flex items-center">
                                        <Search className="absolute left-6 text-primary" size={32} />
                                        <input
                                            type="text"
                                            className="w-full pl-20 pr-6 py-6 text-2xl font-bold bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/20 outline-none transition-all placeholder:font-normal placeholder:text-slate-400"
                                            placeholder="e.g. Paracetamol"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <button type="submit" disabled={loading || !searchTerm.trim()} className="w-full bg-primary hover:bg-primary-dark text-white text-2xl font-bold py-6 rounded-2xl shadow-lg transition-all disabled:opacity-50 flex justify-center items-center">
                                        {loading ? <RefreshCw className="animate-spin mr-3" size={32} /> : null}
                                        {loading ? 'Searching...' : 'Search Medicine'}
                                    </button>
                                </form>
                            )}

                            {/* BARCODE SEARCH TAB */}
                            {activeTab === 'scan' && (
                                <div className="flex flex-col gap-8">
                                    <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />

                                    <button onClick={() => fileInputRef.current?.click()} disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white text-2xl font-bold py-8 rounded-2xl shadow-lg transition-all disabled:opacity-50 flex flex-col justify-center items-center gap-4">
                                        {loading ? <RefreshCw className="animate-spin" size={48} /> : <ScanLine size={48} className="text-primary" />}
                                        {loading ? 'Scanning...' : 'Open Camera to Scan'}
                                    </button>

                                    <div className="relative flex items-center justify-center">
                                        <div className="border-t border-slate-200 w-full absolute"></div>
                                        <span className="bg-white px-4 text-slate-400 font-bold uppercase tracking-wider relative">OR ENTER NUMBER</span>
                                    </div>

                                    <form onSubmit={handleSearch} className="flex flex-col gap-4">
                                        <input
                                            type="number"
                                            className="w-full px-6 py-5 text-2xl text-center font-bold tracking-widest bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="123456789012"
                                            value={barcode}
                                            onChange={(e) => setBarcode(e.target.value)}
                                        />
                                        <button type="submit" disabled={loading || !barcode.trim()} onClick={handleScanBarcode} className="w-full bg-primary hover:bg-primary-dark text-white text-xl font-bold py-4 rounded-2xl shadow-md transition-all disabled:opacity-50">
                                            Search by Number
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* PHOTO SEARCH TAB */}
                            {activeTab === 'upload' && (
                                <div className="flex flex-col gap-6 text-center">
                                    <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />

                                    <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-3xl p-10 flex flex-col items-center justify-center gap-4">
                                        <Camera size={64} className="text-blue-400" />
                                        <p className="text-xl text-blue-900 font-medium">Take a clear photo of the medicine box or the pill itself.</p>
                                    </div>

                                    <button onClick={() => fileInputRef.current?.click()} disabled={loading} className="w-full bg-primary hover:bg-primary-dark text-white text-2xl font-bold py-6 rounded-2xl shadow-lg transition-all disabled:opacity-50 flex justify-center items-center gap-3">
                                        {loading ? <RefreshCw className="animate-spin" size={32} /> : <Camera size={32} />}
                                        {loading ? 'Analyzing Photo...' : 'Take Photo Now'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Error Banner */}
                {error && !result && (
                    <div className="animate-fade-in bg-red-100 border-l-8 border-red-500 rounded-r-2xl p-6 flex items-center gap-4 shadow-sm">
                        <AlertCircle size={40} className="text-red-600 flex-shrink-0" />
                        <p className="text-2xl font-bold text-red-900 m-0">{error}</p>
                    </div>
                )}

                {/* Results Section */}
                {result && (
                    <div className="animate-slide-up flex flex-col gap-6">
                        <button onClick={handleReset} className="self-start flex items-center gap-2 text-primary font-bold text-lg hover:bg-primary/10 px-4 py-2 rounded-xl transition-colors">
                            <ArrowLeft size={24} /> Back to Search
                        </button>

                        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
                            {/* Result Header */}
                            <div className="bg-slate-50/50 p-8 md:p-12 border-b border-slate-100">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="badge badge-primary px-3 py-1 font-bold">Identified Medicine</span>
                                        </div>
                                        <h2 className="text-5xl md:text-6xl font-black text-slate-900 m-0 tracking-tight leading-none">{result.medicine_name}</h2>
                                        {result.composition && <p className="text-2xl text-slate-500 mt-4 font-semibold opacity-70 italic">{result.composition}</p>}
                                    </div>
                                    <button
                                        onClick={() => speakText(`${result.medicine_name}. Usage: ${result.usage}. Dosage: ${result.dosage}.`)}
                                        className="btn btn-primary btn-lg rounded-full px-8 py-5 flex items-center gap-3 shadow-primary group transition-all"
                                        style={{ fontSize: '1.25rem' }}
                                    >
                                        <Volume2 size={28} className="group-hover:scale-110 transition-transform" />
                                        <span>Read Aloud</span>
                                    </button>
                                </div>
                            </div>

                            {/* Result Content */}
                            <div className="p-6 md:p-8 flex flex-col gap-6">
                                {/* Info Block */}
                                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                                    <div className="flex items-center gap-3 text-blue-700 mb-3">
                                        <Info size={32} />
                                        <h3 className="text-2xl font-bold uppercase tracking-wide m-0">What is it for?</h3>
                                    </div>
                                    <p className="text-2xl text-slate-800 font-medium leading-snug">{result.usage || "Information not available."}</p>
                                </div>

                                {/* Usage Block */}
                                <div className="bg-green-50 rounded-2xl p-6 border border-green-100 shadow-sm">
                                    <div className="flex items-center gap-3 text-green-700 mb-3">
                                        <CheckCircle size={32} />
                                        <h3 className="text-2xl font-bold uppercase tracking-wide m-0">How to take</h3>
                                    </div>
                                    <p className="text-2xl text-slate-800 font-bold mb-2">{result.dosage || "Consult your doctor."}</p>
                                    {result.usage_instructions && (
                                        <p className="text-xl text-green-900 bg-green-200/50 p-4 rounded-xl font-medium mt-4 border border-green-200">
                                            {result.usage_instructions}
                                        </p>
                                    )}
                                </div>

                                {/* Warnings Block */}
                                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 shadow-sm">
                                    <div className="flex items-center gap-3 text-amber-700 mb-4">
                                        <AlertTriangle size={32} />
                                        <h3 className="text-2xl font-bold uppercase tracking-wide m-0">Important Warnings</h3>
                                    </div>
                                    <div className="space-y-4 text-xl">
                                        {result.precautions && (
                                            <div className="bg-white p-4 rounded-xl border border-amber-100">
                                                <strong className="text-amber-900 block mb-1">⚠️ Precautions:</strong>
                                                <span className="text-slate-700">{result.precautions}</span>
                                            </div>
                                        )}
                                        {result.side_effects && (
                                            <div className="bg-white p-4 rounded-xl border border-amber-100">
                                                <strong className="text-amber-900 block mb-1">🤒 Side Effects:</strong>
                                                <span className="text-slate-700">{result.side_effects}</span>
                                            </div>
                                        )}
                                        {result.missed_dose_guidelines && (
                                            <div className="bg-white p-4 rounded-xl border border-amber-100">
                                                <strong className="text-amber-900 block mb-1">⏰ If you miss a dose:</strong>
                                                <span className="text-slate-700">{result.missed_dose_guidelines}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScanMedicine;