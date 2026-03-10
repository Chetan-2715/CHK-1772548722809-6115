import React, { useState, useContext, useRef } from 'react';
import { Search, ScanLine, Camera, Info, CheckCircle, AlertTriangle, AlertCircle, Volume2, ArrowLeft, RefreshCw, Pill } from 'lucide-react';
import { AppContext } from '../App';
import { medicineAPI } from '../services/api';
import './ScanMedicine.css';

const ScanMedicine = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [barcode, setBarcode] = useState('');
    const [file, setFile] = useState(null);

    // Per-section loading states
    const [loadingSection, setLoadingSection] = useState(null); // 'name' | 'barcode' | 'photo' | null
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    // Image previews
    const [barcodePreview, setBarcodePreview] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const { speakText } = useContext(AppContext);
    const barcodeFileRef = useRef(null);
    const photoFileRef = useRef(null);

    const handleReset = () => {
        setResult(null);
        setError('');
        setSearchTerm('');
        setBarcode('');
        setBarcodePreview(null);
        setPhotoPreview(null);
        setLoadingSection(null);
        speakText("Ready to search again");
    };

    // ---- Search by Name ----
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoadingSection('name');
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
            setLoadingSection(null);
        }
    };

    // ---- Scan Barcode (manual number) ----
    const handleScanBarcode = async (e) => {
        e.preventDefault();
        if (!barcode.trim()) return;

        setLoadingSection('barcode');
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
            setLoadingSection(null);
        }
    };

    // ---- Barcode Image Upload ----
    const handleBarcodeImageUpload = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        // Show preview
        const reader = new FileReader();
        reader.onload = (ev) => setBarcodePreview(ev.target.result);
        reader.readAsDataURL(selectedFile);

        setFile(selectedFile);
        setLoadingSection('barcode');
        setError('');
        setResult(null);
        speakText("Scanning barcode image, please wait");

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const res = await medicineAPI.scanBarcodeImage(formData);
            if (res.data.success !== false && res.data.lookup_result?.success) {
                setResult(res.data.lookup_result.data);
                setBarcode(res.data.barcode);
                speakText(`Success. Identified as ${res.data.lookup_result.data.medicine_name}`);
            } else {
                setError(res.data.message || 'Could not decode barcode from image.');
                speakText("Could not decode barcode from image");
            }
        } catch (err) {
            setError("Error scanning barcode image. Please try again.");
            speakText("Error scanning barcode image");
        } finally {
            setLoadingSection(null);
        }
    };

    // ---- Photo Upload (Visual Identification) ----
    const handlePhotoUpload = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        // Show preview
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target.result);
        reader.readAsDataURL(selectedFile);

        setFile(selectedFile);
        setLoadingSection('photo');
        setError('');
        setResult(null);
        speakText("Analyzing medicine photo, please wait");

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const verifyRes = await medicineAPI.verifyTabletImage(formData);
            if (verifyRes.data.success) {
                if (verifyRes.data.medicine_info) {
                    setResult(verifyRes.data.medicine_info);
                    speakText("Identified visually: " + verifyRes.data.medicine_info.medicine_name);
                } else {
                    setError('Could not fully identify. ' + (verifyRes.data.message || ''));
                    speakText("Could not fully identify the medicine.");
                }
            } else {
                setError(verifyRes.data.error || "Could not identify medicine from image");
                speakText("Could not identify medicine from image");
            }
        } catch (err) {
            setError("Network or processing error while analyzing the photo.");
            speakText("Error analyzing photo");
        } finally {
            setLoadingSection(null);
        }
    };

    // ---- Per-Section Loading Component ----
    const SectionLoader = ({ message }) => (
        <div className="scan-loading-overlay">
            <div className="loading-spinner"></div>
            <span className="loading-text">{message}</span>
            <div className="loading-bar-track">
                <div className="loading-bar-fill"></div>
            </div>
        </div>
    );

    return (
        <div className="scan-page">
            <div className="scan-page-inner">

                {/* Hero Header */}
                <div className="scan-hero">
                    <div className="scan-hero-badge">
                        <ScanLine size={14} /> Advanced Identification
                    </div>
                    <h1>Medicine <span>Intelligence.</span></h1>
                    <p>Identify any medicine instantly using AI. Choose your method below.</p>
                </div>

                {/* ===== TABLE LAYOUT ===== */}
                {!result && (
                    <div className="scan-table-card">
                        <table className="scan-table">
                            <thead>
                                <tr>
                                    <th>
                                        <div className="scan-th-content">
                                            <div className="scan-th-icon blue"><Search size={30} /></div>
                                            <h3 className="scan-th-title">Search by Name</h3>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="scan-th-content">
                                            <div className="scan-th-icon green"><ScanLine size={30} /></div>
                                            <h3 className="scan-th-title">Search by Barcode</h3>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="scan-th-content">
                                            <div className="scan-th-icon amber"><Camera size={30} /></div>
                                            <h3 className="scan-th-title">Search by Photo</h3>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {/* ── Col 1: Name Search ── */}
                                    <td>
                                        {loadingSection === 'name' ? (
                                            <SectionLoader message="Searching by name..." />
                                        ) : (
                                            <form onSubmit={handleSearch} className="scan-name-form">
                                                <input
                                                    type="text"
                                                    className="scan-name-input"
                                                    placeholder="e.g. Paracetamol"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!searchTerm.trim()}
                                                    className="scan-btn-primary"
                                                >
                                                    <CheckCircle size={20} />
                                                    Find Medicine
                                                </button>
                                            </form>
                                        )}
                                    </td>

                                    {/* ── Col 2: Barcode ── */}
                                    <td>
                                        {loadingSection === 'barcode' ? (
                                            <div>
                                                {barcodePreview && (
                                                    <div className="scan-barcode-preview" style={{ marginBottom: '1rem' }}>
                                                        <img src={barcodePreview} alt="Barcode scan" />
                                                        <div className="preview-overlay">Uploaded Image</div>
                                                    </div>
                                                )}
                                                <SectionLoader message="Scanning barcode..." />
                                            </div>
                                        ) : (
                                            <div className="scan-barcode-col">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    capture="environment"
                                                    ref={barcodeFileRef}
                                                    onChange={handleBarcodeImageUpload}
                                                    style={{ display: 'none' }}
                                                />

                                                {barcodePreview ? (
                                                    <div className="scan-barcode-preview" onClick={() => barcodeFileRef.current?.click()} style={{ cursor: 'pointer' }}>
                                                        <img src={barcodePreview} alt="Barcode" />
                                                        <div className="preview-overlay">Click to change image</div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => barcodeFileRef.current?.click()}
                                                        className="scan-upload-btn"
                                                        type="button"
                                                    >
                                                        <ScanLine size={40} className="upload-icon" />
                                                        <span>Choose File / Take Image</span>
                                                    </button>
                                                )}

                                                <div className="scan-divider">
                                                    <div className="scan-divider-line"></div>
                                                    <span className="scan-divider-text">or manually</span>
                                                    <div className="scan-divider-line"></div>
                                                </div>

                                                <input
                                                    type="number"
                                                    className="scan-barcode-input"
                                                    placeholder="890123... (Barcode)"
                                                    value={barcode}
                                                    onChange={(e) => setBarcode(e.target.value)}
                                                />
                                                {barcode.trim() && (
                                                    <button onClick={handleScanBarcode} className="scan-btn-green" type="button">
                                                        Search Barcode
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>

                                    {/* ── Col 3: Photo Upload ── */}
                                    <td>
                                        {loadingSection === 'photo' ? (
                                            <div>
                                                {photoPreview && (
                                                    <div className="scan-photo-preview" style={{ marginBottom: '1rem' }}>
                                                        <img src={photoPreview} alt="Medicine photo" />
                                                        <div className="preview-overlay">Analyzing Photo...</div>
                                                    </div>
                                                )}
                                                <SectionLoader message="Identifying medicine..." />
                                            </div>
                                        ) : (
                                            <div className="scan-photo-col">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    capture="environment"
                                                    ref={photoFileRef}
                                                    onChange={handlePhotoUpload}
                                                    style={{ display: 'none' }}
                                                />

                                                {photoPreview ? (
                                                    <div className="scan-photo-preview" onClick={() => photoFileRef.current?.click()} style={{ cursor: 'pointer' }}>
                                                        <img src={photoPreview} alt="Medicine" />
                                                        <div className="preview-overlay">Click to change photo</div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => photoFileRef.current?.click()}
                                                        className="scan-photo-placeholder"
                                                    >
                                                        <Pill size={60} className="photo-pill-icon" />
                                                        <p className="photo-text-main">Upload Photo</p>
                                                        <p className="photo-text-sub">Visual AI Identification</p>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => photoFileRef.current?.click()}
                                                    className="scan-btn-amber"
                                                    type="button"
                                                >
                                                    <Camera size={20} />
                                                    Capture Medicine
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Error Banner */}
                {error && !result && (
                    <div className="scan-error">
                        <AlertCircle size={36} className="scan-error-icon" />
                        <div>
                            <h4>Could not find that</h4>
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                {/* ===== RESULTS SECTION ===== */}
                {result && (
                    <div className="scan-results">
                        <button onClick={handleReset} className="scan-back-btn" type="button">
                            <ArrowLeft size={18} /> New Search
                        </button>

                        <div className="scan-result-card">
                            <div className="scan-result-header">
                                <div className="scan-result-header-bg">
                                    <Pill size={180} style={{ transform: 'rotate(45deg)' }} />
                                </div>
                                <div className="scan-result-header-content">
                                    <div>
                                        <span className="scan-result-badge">AI Verification Successful</span>
                                        <h2 className="scan-result-name">{result.medicine_name}</h2>
                                        {result.composition && (
                                            <div className="scan-result-composition">{result.composition}</div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => speakText(`${result.medicine_name}. Usage: ${result.usage}. Dosage: ${result.dosage}.`)}
                                        className="scan-speak-btn"
                                        type="button"
                                    >
                                        <Volume2 size={28} />
                                    </button>
                                </div>
                            </div>

                            <div className="scan-result-grid">
                                <div className="scan-info-card blue">
                                    <div className="scan-info-card-header">
                                        <div className="scan-info-card-icon blue"><Info size={24} /></div>
                                        <h3 className="blue">Primary Use</h3>
                                    </div>
                                    <p className="info-text">{result.usage || "Unknown"}</p>
                                </div>

                                <div className="scan-info-card green">
                                    <div className="scan-info-card-header">
                                        <div className="scan-info-card-icon green"><CheckCircle size={24} /></div>
                                        <h3 className="green">Standard Dose</h3>
                                    </div>
                                    <p className="info-text-lg">{result.dosage || "Refer to doctor"}</p>
                                    {result.usage_instructions && (
                                        <div className="info-instructions">{result.usage_instructions}</div>
                                    )}
                                </div>

                                <div className="scan-info-card amber-wide">
                                    <div className="scan-info-card-header">
                                        <div className="scan-info-card-icon amber"><AlertTriangle size={24} /></div>
                                        <h3 className="amber">Safety & Warnings</h3>
                                    </div>
                                    <div className="scan-warnings-grid">
                                        <div className="scan-warning-item">
                                            <span className="warning-label effects">🤧 Side Effects</span>
                                            <p>{result.side_effects || "None reported"}</p>
                                        </div>
                                        <div className="scan-warning-item">
                                            <span className="warning-label precautions">⛔ Precautions</span>
                                            <p>{result.precautions || "Standard safety rules"}</p>
                                        </div>
                                        <div className="scan-warning-item">
                                            <span className="warning-label missed">⏰ Missed Dose</span>
                                            <p>{result.missed_dose_guidelines || "Take as remembered"}</p>
                                        </div>
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