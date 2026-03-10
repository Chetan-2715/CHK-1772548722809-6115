import React, { useState, useContext, useRef } from 'react';
import { Search, ScanLine, Camera, Info, CheckCircle, AlertTriangle, AlertCircle, Volume2, ArrowLeft, RefreshCw, Pill, MapPin, ExternalLink, ShoppingCart } from 'lucide-react';
import { AppContext } from '../App';
import { medicineAPI } from '../services/api';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    const barcodeFileRef = useRef(null);
    const photoFileRef = useRef(null);

    // Nearby hospitals/medical stores
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [loadingNearby, setLoadingNearby] = useState(false);
    const [nearbyError, setNearbyError] = useState('');

    const fetchNearbyPlaces = () => {
        if (!navigator.geolocation) {
            setNearbyError('Geolocation is not supported by your browser.');
            return;
        }

        setLoadingNearby(true);
        setNearbyError('');

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                const radius = 5000; // 5km

                // Overpass API query for pharmacies, hospitals, clinics nearby
                const query = `
                    [out:json][timeout:10];
                    (
                        node["amenity"="pharmacy"](around:${radius},${latitude},${longitude});
                        node["amenity"="hospital"](around:${radius},${latitude},${longitude});
                        node["amenity"="clinic"](around:${radius},${latitude},${longitude});
                        node["shop"="chemist"](around:${radius},${latitude},${longitude});
                    );
                    out body 5;
                `;

                try {
                    const res = await fetch('https://overpass-api.de/api/interpreter', {
                        method: 'POST',
                        body: `data=${encodeURIComponent(query)}`,
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    });
                    const data = await res.json();

                    if (data.elements && data.elements.length > 0) {
                        const places = data.elements
                            .filter(el => el.tags && el.tags.name)
                            .map(el => {
                                // Calculate distance
                                const R = 6371;
                                const dLat = (el.lat - latitude) * Math.PI / 180;
                                const dLon = (el.lon - longitude) * Math.PI / 180;
                                const a = Math.sin(dLat / 2) ** 2 +
                                    Math.cos(latitude * Math.PI / 180) * Math.cos(el.lat * Math.PI / 180) *
                                    Math.sin(dLon / 2) ** 2;
                                const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                                return {
                                    name: el.tags.name,
                                    type: el.tags.amenity || el.tags.shop || 'medical',
                                    address: [el.tags['addr:street'], el.tags['addr:city']].filter(Boolean).join(', ') || el.tags['addr:full'] || '',
                                    lat: el.lat,
                                    lon: el.lon,
                                    distance: dist,
                                    phone: el.tags.phone || el.tags['contact:phone'] || '',
                                };
                            })
                            .sort((a, b) => a.distance - b.distance)
                            .slice(0, 5);

                        setNearbyPlaces(places);
                        if (places.length === 0) {
                            setNearbyError('No medical stores found nearby. Try expanding your search on the map.');
                        }
                    } else {
                        setNearbyError('No medical stores found nearby.');
                    }
                } catch (err) {
                    setNearbyError('Could not fetch nearby places. Please check your internet connection.');
                } finally {
                    setLoadingNearby(false);
                }
            },
            () => {
                setLoadingNearby(false);
                setNearbyError('Location access denied. Please allow location to find nearby stores.');
            }
        );
    };

    const handleReset = () => {
        setResult(null);
        setError('');
        setSearchTerm('');
        setBarcode('');
        setBarcodePreview(null);
        setPhotoPreview(null);
        setLoadingSection(null);
        setNearbyPlaces([]);
        setNearbyError('');
        speakText(t('scan.voice.ready_again'));
    };

    // ---- Search by Name ----
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoadingSection('name');
        setError('');
        setResult(null);
        speakText(t('scan.voice.searching_for', { name: searchTerm }));

        try {
            const res = await medicineAPI.search(searchTerm);
            if (res.data.success) {
                setResult(res.data.data);
                speakText(t('scan.voice.found_info', { name: res.data.data.medicine_name }));
            } else {
                setError(res.data.error || t('scan.errors.medicine_not_found'));
                speakText(t('scan.voice.medicine_not_found'));
            }
        } catch (err) {
            const msg = err.response?.data?.detail || t('scan.errors.generic');
            setError(msg);
            speakText(t('scan.voice.error_prefix', { message: msg }));
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
        speakText(t('scan.voice.lookup_barcode', { barcode }));

        try {
            const res = await medicineAPI.scanBarcode({ barcode });
            if (res.data.success) {
                setResult(res.data.data);
                speakText(t('scan.voice.found_medicine', { name: res.data.data.medicine_name }));
            } else {
                setError(res.data.message || t('scan.errors.barcode_not_found'));
                speakText(t('scan.voice.barcode_not_found'));
            }
        } catch (err) {
            const msg = err.response?.data?.detail || t('scan.errors.generic');
            setError(msg);
            speakText(t('scan.voice.error_prefix', { message: msg }));
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
        speakText(t('scan.voice.scanning_barcode_image'));

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const res = await medicineAPI.scanBarcodeImage(formData);
            if (res.data.success !== false && res.data.lookup_result?.success) {
                setResult(res.data.lookup_result.data);
                setBarcode(res.data.barcode);
                speakText(t('scan.voice.identified_as', { name: res.data.lookup_result.data.medicine_name }));
            } else {
                setError(res.data.message || t('scan.errors.decode_failed'));
                speakText(t('scan.voice.decode_failed'));
            }
        } catch (err) {
            setError(t('scan.errors.scan_image_failed'));
            speakText(t('scan.voice.scan_image_failed'));
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
        speakText(t('scan.voice.analyzing_photo'));

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const verifyRes = await medicineAPI.verifyTabletImage(formData);
            if (verifyRes.data.success) {
                if (verifyRes.data.medicine_info) {
                    setResult(verifyRes.data.medicine_info);
                    speakText(t('scan.voice.identified_visually', { name: verifyRes.data.medicine_info.medicine_name }));
                } else {
                    setError(t('scan.errors.partial_identify') + ' ' + (verifyRes.data.message || ''));
                    speakText(t('scan.voice.partial_identify'));
                }
            } else {
                setError(verifyRes.data.error || t('scan.errors.identify_failed'));
                speakText(t('scan.voice.identify_failed'));
            }
        } catch (err) {
            setError(t('scan.errors.analyze_network'));
            speakText(t('scan.voice.analyze_error'));
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

    const buildFullMedicineSpeech = (medicine) => {
        if (!medicine) return '';

        const parts = [medicine.medicine_name];

        if (medicine.composition) {
            parts.push(`Composition: ${medicine.composition}.`);
        }

        parts.push(`Primary use: ${medicine.usage || t('scan.unknown')}.`);
        parts.push(`Standard dose: ${medicine.dosage || t('scan.refer_doctor')}.`);

        if (medicine.usage_instructions) {
            parts.push(`Instructions: ${medicine.usage_instructions}.`);
        }

        parts.push(`Side effects: ${medicine.side_effects || t('scan.none_reported')}.`);
        parts.push(`Precautions: ${medicine.precautions || t('scan.standard_safety')}.`);
        parts.push(`Missed dose guidance: ${medicine.missed_dose_guidelines || t('scan.take_as_remembered')}.`);

        return parts.join(' ');
    };

    return (
        <div className="scan-page">
            <div className="scan-page-inner">

                {/* Hero Header */}
                <div className="scan-hero">
                    <div className="scan-hero-badge">
                        <ScanLine size={14} /> {t('scan.badge')}
                    </div>
                    <h1>{t('scan.hero_title_1')} <span>{t('scan.hero_title_2')}</span></h1>
                    <p>{t('scan.hero_sub')}</p>
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
                                            <h3 className="scan-th-title">{t('scan.col_name')}</h3>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="scan-th-content">
                                            <div className="scan-th-icon green"><ScanLine size={30} /></div>
                                            <h3 className="scan-th-title">{t('scan.col_barcode')}</h3>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="scan-th-content">
                                            <div className="scan-th-icon amber"><Camera size={30} /></div>
                                            <h3 className="scan-th-title">{t('scan.col_photo')}</h3>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {/* ── Col 1: Name Search ── */}
                                    <td>
                                        {loadingSection === 'name' ? (
                                            <SectionLoader message={t('scan.searching_name')} />
                                        ) : (
                                            <form onSubmit={handleSearch} className="scan-name-form">
                                                <input
                                                    type="text"
                                                    className="scan-name-input"
                                                    placeholder={t('scan.name_placeholder')}
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!searchTerm.trim()}
                                                    className="scan-btn-primary"
                                                >
                                                    <CheckCircle size={20} />
                                                    {t('scan.find_medicine')}
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
                                                        <img src={barcodePreview} alt={t('scan.col_barcode')} />
                                                        <div className="preview-overlay">{t('scan.uploaded_image')}</div>
                                                    </div>
                                                )}
                                                <SectionLoader message={t('scan.scanning_barcode')} />
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
                                                        <img src={barcodePreview} alt={t('scan.col_barcode')} />
                                                        <div className="preview-overlay">{t('scan.click_change')}</div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => barcodeFileRef.current?.click()}
                                                        className="scan-upload-btn"
                                                        type="button"
                                                    >
                                                        <ScanLine size={40} className="upload-icon" />
                                                        <span>{t('scan.choose_file')}</span>
                                                    </button>
                                                )}

                                                <div className="scan-divider">
                                                    <div className="scan-divider-line"></div>
                                                    <span className="scan-divider-text">{t('scan.or_manually')}</span>
                                                    <div className="scan-divider-line"></div>
                                                </div>

                                                <input
                                                    type="number"
                                                    className="scan-barcode-input"
                                                    placeholder={t('scan.barcode_placeholder')}
                                                    value={barcode}
                                                    onChange={(e) => setBarcode(e.target.value)}
                                                />
                                                {barcode.trim() && (
                                                    <button onClick={handleScanBarcode} className="scan-btn-green" type="button">
                                                        {t('scan.search_barcode')}
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
                                                        <img src={photoPreview} alt={t('scan.col_photo')} />
                                                        <div className="preview-overlay">{t('scan.analyzing_photo')}</div>
                                                    </div>
                                                )}
                                                <SectionLoader message={t('scan.identifying')} />
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
                                                        <img src={photoPreview} alt={t('scan.col_photo')} />
                                                        <div className="preview-overlay">{t('scan.click_change_photo')}</div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => photoFileRef.current?.click()}
                                                        className="scan-photo-placeholder"
                                                    >
                                                        <Pill size={60} className="photo-pill-icon" />
                                                        <p className="photo-text-main">{t('scan.upload_photo')}</p>
                                                        <p className="photo-text-sub">{t('scan.visual_ai')}</p>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => photoFileRef.current?.click()}
                                                    className="scan-btn-amber"
                                                    type="button"
                                                >
                                                    <Camera size={20} />
                                                    {t('scan.capture')}
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
                            <h4>{t('scan.not_found')}</h4>
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                {/* ===== RESULTS SECTION ===== */}
                {result && (
                    <div className="scan-results">
                        <button onClick={handleReset} className="scan-back-btn" type="button">
                            <ArrowLeft size={18} /> {t('scan.new_search')}
                        </button>

                        <div className="scan-result-card">
                            <div className="scan-result-header">
                                <div className="scan-result-header-bg">
                                    <Pill size={180} style={{ transform: 'rotate(45deg)' }} />
                                </div>
                                <div className="scan-result-header-content">
                                    <div>
                                        <span className="scan-result-badge">{t('scan.ai_verified')}</span>
                                        <h2 className="scan-result-name">{result.medicine_name}</h2>
                                        {result.composition && (
                                            <div className="scan-result-composition">{result.composition}</div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => speakText(buildFullMedicineSpeech(result))}
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
                                        <h3 className="blue">{t('scan.primary_use')}</h3>
                                    </div>
                                    <p className="info-text">{result.usage || t('scan.unknown')}</p>
                                </div>

                                <div className="scan-info-card green">
                                    <div className="scan-info-card-header">
                                        <div className="scan-info-card-icon green"><CheckCircle size={24} /></div>
                                        <h3 className="green">{t('scan.standard_dose')}</h3>
                                    </div>
                                    <p className="info-text-lg">{result.dosage || t('scan.refer_doctor')}</p>
                                    {result.usage_instructions && (
                                        <div className="info-instructions">{result.usage_instructions}</div>
                                    )}
                                </div>

                                <div className="scan-info-card amber-wide">
                                    <div className="scan-info-card-header">
                                        <div className="scan-info-card-icon amber"><AlertTriangle size={24} /></div>
                                        <h3 className="amber">{t('scan.safety')}</h3>
                                    </div>
                                    <div className="scan-warnings-grid">
                                        <div className="scan-warning-item">
                                            <span className="warning-label effects">🤧 {t('scan.side_effects')}</span>
                                            <p>{result.side_effects || t('scan.none_reported')}</p>
                                        </div>
                                        <div className="scan-warning-item">
                                            <span className="warning-label precautions">⛔ {t('dashboard.precautions')}</span>
                                            <p>{result.precautions || t('scan.standard_safety')}</p>
                                        </div>
                                        <div className="scan-warning-item">
                                            <span className="warning-label missed">⏰ {t('scan.missed_dose')}</span>
                                            <p>{result.missed_dose_guidelines || t('scan.take_as_remembered')}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Buy on Jan Aushadhi + Nearby Stores */}
                                <div className="scan-info-card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, #f0fdf4, #ecfeff)', border: '1.5px solid #a7f3d0' }}>
                                    {/* Jan Aushadhi Button */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <ShoppingCart size={20} />
                                            {t('scan.buy_medicine') || 'Buy This Medicine'}
                                        </h3>
                                        <p style={{ fontSize: '0.85rem', color: '#047857', marginBottom: '0.75rem' }}>
                                            {t('scan.jan_aushadhi_desc') || 'Get affordable generic medicines from Pradhan Mantri Jan Aushadhi Kendra.'}
                                        </p>
                                        <a
                                            href={`https://janaushadhistore.online/?s=${encodeURIComponent(result.medicine_name || '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                                padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
                                                background: 'linear-gradient(135deg, #059669, #047857)',
                                                color: 'white', fontWeight: 700, fontSize: '0.95rem',
                                                textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
                                                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                                            }}
                                            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(5,150,105,0.4)'; }}
                                            onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(5,150,105,0.3)'; }}
                                        >
                                            <ExternalLink size={18} />
                                            {t('scan.buy_on_jan_aushadhi') || 'Buy on Jan Aushadhi Store'}
                                        </a>
                                    </div>

                                    {/* Nearby Hospitals / Medical Stores */}
                                    <div style={{ borderTop: '1px solid #a7f3d0', paddingTop: '1.25rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                                <MapPin size={20} />
                                                {t('scan.nearby_stores') || 'Nearby Medical Stores & Hospitals'}
                                            </h3>
                                            {nearbyPlaces.length === 0 && !loadingNearby && (
                                                <button
                                                    onClick={fetchNearbyPlaces}
                                                    type="button"
                                                    style={{
                                                        padding: '0.5rem 1rem', borderRadius: '0.5rem',
                                                        border: '1.5px solid #059669', background: 'white',
                                                        color: '#059669', fontWeight: 600, fontSize: '0.85rem',
                                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                                    }}
                                                >
                                                    <MapPin size={16} /> {t('scan.find_nearby') || 'Find Nearby'}
                                                </button>
                                            )}
                                        </div>

                                        {loadingNearby && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', color: '#047857' }}>
                                                <div className="spinner border-emerald-600 mini"></div>
                                                <span>{t('scan.finding_nearby') || 'Finding nearby places...'}</span>
                                            </div>
                                        )}

                                        {nearbyError && (
                                            <p style={{ color: '#dc2626', fontSize: '0.85rem', padding: '0.5rem 0' }}>{nearbyError}</p>
                                        )}

                                        {nearbyPlaces.length > 0 && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                                {nearbyPlaces.map((place, idx) => (
                                                    <div
                                                        key={idx}
                                                        style={{
                                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                            padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                                            background: 'white', border: '1px solid #d1fae5',
                                                            gap: '0.75rem', flexWrap: 'wrap',
                                                        }}
                                                    >
                                                        <div style={{ flex: 1, minWidth: '180px' }}>
                                                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
                                                                {idx + 1}. {place.name}
                                                            </div>
                                                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                                                                {place.address || place.type.charAt(0).toUpperCase() + place.type.slice(1)}
                                                            </div>
                                                            <div style={{ fontSize: '0.8rem', color: '#059669', marginTop: '2px' }}>
                                                                📍 {place.distance < 1 ? `${Math.round(place.distance * 1000)}m away` : `${place.distance.toFixed(1)} km away`}
                                                                {place.phone && <span style={{ marginLeft: '0.5rem' }}>📞 {place.phone}</span>}
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                padding: '0.4rem 0.75rem', borderRadius: '0.5rem',
                                                                background: '#059669', color: 'white',
                                                                fontSize: '0.8rem', fontWeight: 600,
                                                                textDecoration: 'none', display: 'flex',
                                                                alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            <MapPin size={14} /> {t('scan.get_directions') || 'Directions'}
                                                        </a>
                                                    </div>
                                                ))}
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