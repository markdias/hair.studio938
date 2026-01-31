import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, LogOut, Check, Info, Loader2,
    Settings, Scissors, Tag, Image, Plus, Trash2,
    MapPin, Phone, Mail, Clock, User, Calendar, Edit, X,
    List, ChevronLeft, ChevronRight, Instagram, Facebook, Music2, Maximize2, Search, Palette
} from 'lucide-react';
import AntdDatePicker from '../components/AntdDatePicker';
import { useTheme } from '../lib/ThemeContext';

const TABS = [
    { id: 'general', label: 'General Settings', icon: <Settings size={18} /> },
    { id: 'theme', label: 'Theme', icon: <Palette size={18} /> },
    { id: 'services', label: 'Services', icon: <Scissors size={18} /> },
    { id: 'pricing', label: 'Pricing', icon: <Tag size={18} /> },
    { id: 'team', label: 'Team', icon: <User size={18} /> },
    { id: 'gallery', label: 'Gallery', icon: <Image size={18} /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar size={18} /> },
    { id: 'clients', label: 'Clients', icon: <User size={18} /> }, // Added Clients tab
    { id: 'messages', label: 'Messages', icon: <Mail size={18} /> },
];

const STYLIST_COLORS = {
    'Jo': 'bg-blue-100 text-blue-800 border-blue-200',
    'Nisha': 'bg-purple-100 text-purple-800 border-purple-200',
    'default': 'bg-stone-100 text-stone-800 border-stone-200'
};

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

const GENERAL_FIELDS = [
    { key: 'hero_title', label: 'Hero Title', icon: <Info size={16} /> },
    { key: 'hero_subtitle', label: 'Hero Subtitle', icon: <Info size={16} /> },
    { key: 'phone', label: 'Phone Number', icon: <Phone size={16} /> },
    { key: 'whatsapp', label: 'WhatsApp Number', icon: <Phone size={16} /> },
    { key: 'email', label: 'Email Address', icon: <Mail size={16} /> },
    { key: 'address', label: 'Salon Address', icon: <MapPin size={16} /> },
    { key: 'instagram_url', label: 'Instagram URL', icon: <Instagram size={16} /> },
    { key: 'facebook_url', label: 'Facebook URL', icon: <Facebook size={16} /> },
    { key: 'tiktok_url', label: 'TikTok URL', icon: <Music2 size={16} /> },
    { key: 'hero_bg_url', label: 'Hero Background Image URL', icon: <Image size={16} /> },
];

const EMAIL_VARIABLES = [
    { tag: '{{name}}', desc: 'Customer Name' },
    { tag: '{{service}}', desc: 'Service Name' },
    { tag: '{{stylist}}', desc: 'Stylist Name' },
    { tag: '{{date}}', desc: 'Date of Appointment' },
    { tag: '{{time}}', desc: 'Time of Appointment' },
    { tag: '{{salon_phone}}', desc: 'Salon Phone Number' },
    { tag: '{{salon_location}}', desc: 'Salon Address' },
];

const DEFAULT_EMAIL_TEMPLATE = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #EAE0D5; border-radius: 12px;">
    <h2 style="color: #3D2B1F; border-bottom: 2px solid #EAE0D5; padding-bottom: 10px;">Booking Confirmed!</h2>
    <p>Hi {{name}},</p>
    <p>Thank you for choosing Studio 938. Your appointment is officially confirmed.</p>
    
    <div style="background-color: #FDFBF9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Service:</strong> {{service}}</p>
        <p style="margin: 5px 0;"><strong>Stylist:</strong> {{stylist}}</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> {{date}}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> {{time}}</p>
    </div>
    
    <p style="font-size: 0.9rem; color: #666;">
        📍 <strong>Location:</strong> {{salon_location}}<br>
        📞 <strong>Phone:</strong> {{salon_phone}}
    </p>
    
    <p style="margin-top: 30px; font-size: 0.8rem; color: #999;">
        Please give us at least 24 hours notice for any cancellations or changes.
    </p>
</div>`;

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [sidebarOpen, setSidebarOpen] = useState(false); // Added sidebarOpen state
    const navigate = useNavigate();

    // Data States
    const [siteSettings, setSiteSettings] = useState({});
    const [services, setServices] = useState([]);
    const [pricing, setPricing] = useState([]);
    const [stylists, setStylists] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [clients, setClients] = useState([]); // Added clients state

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [
                { data: settings },
                { data: srvs },
                { data: prices },
                { data: stls },
                { data: gly },
                { data: clts } // Added clts to fetch
            ] = await Promise.all([
                supabase.from('site_settings').select('*'),
                supabase.from('services_overview').select('*'),
                supabase.from('price_list').select('*').order('sort_order'),
                supabase.from('stylist_calendars').select('*'),
                supabase.from('gallery_images').select('*').order('sort_order'),
                supabase.from('clients').select('*').order('created_at', { ascending: false }) // Fetch clients
            ]);

            if (settings) {
                const settingsObj = {};
                settings.forEach(s => settingsObj[s.key] = s.value);
                setSiteSettings(settingsObj);
            }

            if (srvs) setServices(srvs);
            if (prices) setPricing(prices);
            if (stls) setStylists(stls);
            if (gly) setGallery(gly);
            if (clts) setClients(clts); // Set clients state

        } catch (err) {
            console.error('Error fetching data:', err.message);
            setMessage({ type: 'error', text: 'Error loading data. Make sure tables exist.' });
        } finally {
            setLoading(false);
        }
    };

    // Refresh clients manually if needed
    const fetchClients = async () => {
        const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
        if (data) setClients(data);
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-stone-800" />
            </div>
        );
    }


    return (
        <div className="flex h-screen bg-stone-50 font-sans text-stone-900">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10  rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--primary-brown)" }}>
                            <Scissors size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">Studio 938</h1>
                            <p className="text-xs text-gray-500">Admin Panel</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-grow p-4 space-y-1">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${activeTab === tab.id
                                ? 'bg-stone-100 text-stone-800 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-all text-sm"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow overflow-y-auto">
                <div className="max-w-6xl mx-auto p-8">
                    <AnimatePresence mode="wait">
                        {message.text && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${message.type === 'success'
                                    ? 'bg-green-50 border-green-200 text-green-800'
                                    : 'bg-red-50 border-red-200 text-red-800'
                                    }`}
                            >
                                {message.type === 'success' ? <Check size={18} /> : <Info size={18} />}
                                {message.text}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <TabContent
                        activeTab={activeTab}
                        data={{ siteSettings, services, pricing, stylists, gallery, appointments, clients }} // Pass clients data
                        setData={{ setSiteSettings, setServices, setPricing, setStylists, setGallery, setAppointments, setClients }} // Pass setClients
                        refresh={fetchAllData}
                        showMessage={showMessage}
                        fetchClients={fetchClients} // Pass fetchClients
                    />
                </div>
            </main>
        </div>
    );
};

const TabContent = ({ activeTab, data, setData, refresh, showMessage, fetchClients }) => {
    switch (activeTab) {
        case 'general': return <GeneralTab settings={data.siteSettings} setSettings={setData.setSiteSettings} showMessage={showMessage} />;
        case 'theme': return <ThemeTab showMessage={showMessage} />;
        case 'services': return <ServicesTab services={data.services} refresh={refresh} showMessage={showMessage} />;
        case 'pricing': return <PricingTab pricing={data.pricing} setPricing={setData.setPricing} showMessage={showMessage} />;
        case 'team': return <TeamTab stylists={data.stylists} refresh={refresh} showMessage={showMessage} />;
        case 'gallery': return <GalleryTab gallery={data.gallery} setGallery={setData.setGallery} showMessage={showMessage} />;
        case 'appointments': return <AppointmentsTab appointments={data.appointments} setAppointments={setData.setAppointments} setClients={setData.setClients} showMessage={showMessage} clients={data.clients} services={data.services} stylists={data.stylists} pricing={data.pricing} openingHours={data.siteSettings?.opening_hours} />;
        case 'clients': return <ClientsTab clients={data.clients} setClients={setData.setClients} showMessage={showMessage} refreshClients={fetchClients} />;
        case 'messages': return <MessagesTab settings={data.siteSettings} setSettings={setData.setSiteSettings} showMessage={showMessage} refresh={refresh} />;
        default: return null;
    }
};

const ImageUploader = ({ onUpload, folder = 'general', showMessage }) => {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e) => {
        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) return;
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${folder}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('salon-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('salon-assets')
                .getPublicUrl(filePath);

            onUpload(data.publicUrl);
            showMessage('success', 'Image uploaded successfully!');
        } catch (error) {
            showMessage('error', 'Error uploading image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative inline-block">
            <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <button
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg text-sm font-medium hover:bg-opacity-90 disabled:opacity-50 transition-all" style={{ backgroundColor: "#3D2B1F" }}
            >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Image size={16} />}
                {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
        </div>
    );
};

// Helper functions for opening hours
const getTimeLabel = (hour) => {
    if (hour === 12) return '12 PM';
    if (hour === 0) return '12 AM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
};

const formatOpeningHours = (selectedSlots) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

    // Convert grid to time ranges per day
    const dayRanges = {};
    days.forEach(day => {
        const ranges = [];
        let start = null;

        selectedSlots[day]?.forEach((selected, idx) => {
            if (selected && start === null) {
                start = hours[idx];
            } else if (!selected && start !== null) {
                ranges.push({ start, end: hours[idx] });
                start = null;
            }
        });

        // Handle case where selection goes to end
        if (start !== null) {
            ranges.push({ start, end: hours[hours.length - 1] + 1 });
        }

        if (ranges.length > 0) {
            dayRanges[day] = ranges;
        }
    });

    // Group consecutive days with identical hours
    const grouped = [];
    let currentGroup = null;

    days.forEach(day => {
        const ranges = dayRanges[day];
        const rangesStr = ranges ? JSON.stringify(ranges) : null;

        if (currentGroup && currentGroup.rangesStr === rangesStr) {
            currentGroup.days.push(day);
        } else {
            if (currentGroup) {
                grouped.push(currentGroup);
            }
            currentGroup = ranges ? { days: [day], ranges, rangesStr } : null;
        }
    });

    if (currentGroup) {
        grouped.push(currentGroup);
    }

    // Format to text
    return grouped.map(group => {
        const dayStr = group.days.length === 1
            ? group.days[0]
            : `${group.days[0]}-${group.days[group.days.length - 1]}`;

        const timeStr = group.ranges.map(r =>
            `${getTimeLabel(r.start)} - ${getTimeLabel(r.end)}`
        ).join(', ');

        return `${dayStr}: ${timeStr}`;
    }).join(', ') || 'Closed';
};

const parseOpeningHours = (text) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 13 }, (_, i) => i + 8);
    const selectedSlots = {};

    // Initialize all days as closed
    days.forEach(day => {
        selectedSlots[day] = new Array(13).fill(false);
    });

    if (!text || text.toLowerCase() === 'closed') return selectedSlots;

    // Parse text (basic implementation - can be enhanced)
    // Expected format: "Mon-Fri: 9 AM - 6 PM, Sat: 10 AM - 4 PM"
    const parts = text.split(',').map(p => p.trim());

    parts.forEach(part => {
        const match = part.match(/([A-Za-z\-]+):\s*(.+)/);
        if (!match) return;

        const [, dayPart, timePart] = match;
        const timeRanges = timePart.split(',').map(t => t.trim());

        // Parse day range
        let targetDays = [];
        if (dayPart.includes('-')) {
            const [start, end] = dayPart.split('-').map(d => d.trim());
            const startIdx = days.indexOf(start);
            const endIdx = days.indexOf(end);
            if (startIdx !== -1 && endIdx !== -1) {
                for (let i = startIdx; i <= endIdx; i++) {
                    targetDays.push(days[i]);
                }
            }
        } else {
            const day = days.find(d => dayPart.includes(d));
            if (day) targetDays.push(day);
        }

        // Parse time ranges
        timeRanges.forEach(timeRange => {
            const timeMatch = timeRange.match(/(\d+)\s*(AM|PM)\s*-\s*(\d+)\s*(AM|PM)/i);
            if (!timeMatch) return;

            let [, startHour, startPeriod, endHour, endPeriod] = timeMatch;
            startHour = parseInt(startHour);
            endHour = parseInt(endHour);

            // Convert to 24-hour
            if (startPeriod.toUpperCase() === 'PM' && startHour !== 12) startHour += 12;
            if (startPeriod.toUpperCase() === 'AM' && startHour === 12) startHour = 0;
            if (endPeriod.toUpperCase() === 'PM' && endHour !== 12) endHour += 12;
            if (endPeriod.toUpperCase() === 'AM' && endHour === 12) endHour = 0;

            // Mark slots as selected
            targetDays.forEach(day => {
                hours.forEach((hour, idx) => {
                    if (hour >= startHour && hour < endHour) {
                        selectedSlots[day][idx] = true;
                    }
                });
            });
        });
    });

    return selectedSlots;
};

// OpeningHoursPicker Component
const OpeningHoursPicker = ({ initialValue, onSave, showMessage }) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

    const [selectedSlots, setSelectedSlots] = useState(() => parseOpeningHours(initialValue));
    const [isDragging, setIsDragging] = useState(false);
    const [dragMode, setDragMode] = useState('select'); // 'select' or 'deselect'

    const handleMouseDown = (day, hourIdx) => {
        setIsDragging(true);
        const currentState = selectedSlots[day][hourIdx];
        setDragMode(currentState ? 'deselect' : 'select');
        toggleSlot(day, hourIdx);
    };

    const handleMouseEnter = (day, hourIdx) => {
        if (isDragging) {
            toggleSlot(day, hourIdx);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const toggleSlot = (day, hourIdx) => {
        setSelectedSlots(prev => ({
            ...prev,
            [day]: prev[day].map((selected, idx) =>
                idx === hourIdx
                    ? (dragMode === 'select' ? true : false)
                    : selected
            )
        }));
    };

    const handleSaveHours = async () => {
        const formatted = formatOpeningHours(selectedSlots);
        await onSave(formatted);
    };

    const formattedPreview = formatOpeningHours(selectedSlots);

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Clock size={16} />
                    Opening Hours
                </label>
            </div>

            {/* Grid */}
            <div className="overflow-x-auto mb-4" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                <div className="min-w-[600px]">
                    {/* Header row */}
                    <div className="grid grid-cols-14 gap-1 mb-2">
                        <div className="text-xs font-medium text-gray-600 p-2"></div>
                        {hours.map(hour => (
                            <div key={hour} className="text-xs font-medium text-gray-600 text-center p-2">
                                {hour > 12 ? hour - 12 : hour}
                            </div>
                        ))}
                    </div>

                    {/* Day rows */}
                    {days.map(day => (
                        <div key={day} className="grid grid-cols-14 gap-1 mb-1">
                            <div className="text-sm font-medium text-gray-700 p-2 flex items-center">
                                {day}
                            </div>
                            {hours.map((hour, hourIdx) => (
                                <div
                                    key={hourIdx}
                                    onMouseDown={() => handleMouseDown(day, hourIdx)}
                                    onMouseEnter={() => handleMouseEnter(day, hourIdx)}
                                    className={`
                                        h-10 rounded cursor-pointer transition-all select-none
                                        ${selectedSlots[day][hourIdx]
                                            ? 'bg-stone-800 text-white border-stone-900'
                                            : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                                        }
                                        border active:scale-95
                                    `}
                                    style={selectedSlots[day][hourIdx] ? { backgroundColor: 'var(--primary-brown)' } : {}}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Preview */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <div className="text-xs font-medium text-amber-900 mb-1">Preview:</div>
                <div className="text-sm text-amber-800">{formattedPreview}</div>
            </div>

            {/* Save button */}
            <button
                onClick={() => handleSaveHours()}
                className="w-full px-4 py-3 bg-stone-800 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                style={{ backgroundColor: 'var(--primary-brown)' }}
            >
                Set Opening Hours
            </button>
        </div>
    );
};

const BrandingEditor = ({ settings, onSave, showMessage }) => {
    const [logoUrl, setLogoUrl] = useState(settings.logo_url || '/logo.png');
    const [size, setSize] = useState(parseInt(settings.logo_size) || 85);
    const [isResizing, setIsResizing] = useState(false);
    const [showResizer, setShowResizer] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startSize, setStartSize] = useState(0);

    const handleResizeStart = (e) => {
        setIsResizing(true);
        setStartX(e.clientX);
        setStartSize(size);
        document.body.style.cursor = 'nwse-resize';
    };

    useEffect(() => {
        const handleResizeMove = (e) => {
            if (!isResizing) return;
            const delta = e.clientX - startX;
            const newSize = Math.max(40, Math.min(300, startSize + delta));
            setSize(newSize);
        };

        const handleResizeEnd = () => {
            setIsResizing(false);
            document.body.style.cursor = 'default';
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleResizeMove);
            window.addEventListener('mouseup', handleResizeEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleResizeMove);
            window.removeEventListener('mouseup', handleResizeEnd);
        };
    }, [isResizing, startX, startSize]);

    const handleLogoUpload = (url) => {
        setLogoUrl(url);
        onSave('logo_url', url);
    };

    const saveSize = () => {
        onSave('logo_size', size.toString());
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Maximize2 size={18} /> Logo Branding
                </h3>
                <button
                    onClick={() => setShowResizer(!showResizer)}
                    className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 font-medium transition-colors"
                >
                    {showResizer ? <X size={16} /> : <Edit size={16} />}
                    {showResizer ? 'Hide Resizer' : 'Visual Resizer (Toggle)'}
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0">
                    <p className="text-sm text-gray-500 mb-2">Upload Logo:</p>
                    <ImageUploader folder="branding" onUpload={handleLogoUpload} showMessage={showMessage} />
                </div>

                <div className="flex-grow w-full">
                    <div className={`relative rounded-lg flex items-center justify-center transition-all ${showResizer ? 'min-h-[300px] p-8 border border-dashed border-gray-300 bg-stone-50' : 'min-h-[120px] p-4 bg-transparent'}`}>
                        <div
                            className="relative shadow-xl rounded-full bg-white flex items-center justify-center overflow-hidden border border-gray-100"
                            style={{ width: `${size}px`, height: `${size}px` }}
                        >
                            <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />

                            {showResizer && (
                                <div
                                    onMouseDown={handleResizeStart}
                                    className="absolute bottom-0 right-0 w-4 h-4 bg-stone-800 cursor-nwse-resize flex items-center justify-center hover:scale-125 transition-transform"
                                    style={{ backgroundColor: 'var(--primary-brown)' }}
                                >
                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                </div>
                            )}
                        </div>

                        {showResizer && (
                            <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-mono border border-gray-200 text-gray-500">
                                {size}px
                            </div>
                        )}
                    </div>

                    <AnimatePresence>
                        {showResizer && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <button
                                    onClick={saveSize}
                                    className="mt-4 px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-opacity-90 transition-all font-medium flex items-center gap-2"
                                    style={{ backgroundColor: 'var(--primary-brown)' }}
                                >
                                    <Save size={16} /> Save Logo Size
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const ThemeTab = ({ showMessage }) => {
    const { theme, updateTheme, saveAsDefault, resetToDefault, resetToFactory } = useTheme();
    // Initialize local state with global theme
    const [localTheme, setLocalTheme] = useState(theme);

    // Sync local state when global theme changes (e.g. on initial load)
    useEffect(() => {
        setLocalTheme(theme);
    }, [theme]);

    const colors = [
        { label: 'Primary Brand Color', var: '--primary-brown' },
        { label: 'Primary Hover Color', var: '--primary-brown-hover' },
        { label: 'Accent Color', var: '--accent-cream' },
        { label: 'Background Color', var: '--soft-cream' },
        { label: 'Headings & Dark Text', var: '--text-dark' },
        { label: 'Light Text', var: '--text-light' },
    ];

    const handleChange = (cssVar, value) => {
        setLocalTheme(prev => ({ ...prev, [cssVar]: value }));
    };

    const handleSave = async () => {
        await updateTheme(localTheme);
        showMessage('success', 'Theme saved successfully!');
    };

    const handleSaveDefault = async () => {
        if (!window.confirm('Are you sure you want to save the current settings as the new default?')) return;
        await saveAsDefault(localTheme);
        showMessage('success', 'Current theme saved as default.');
    };

    const handleResetDefault = async () => {
        if (!window.confirm('Reset to your saved default theme? Unsaved changes will be lost.')) return;
        const defaulted = await resetToDefault();
        setLocalTheme(defaulted);
        showMessage('success', 'Reset to saved default.');
    };

    const handleResetFactory = async () => {
        if (!window.confirm('Reset to original factory colors? This cannot be undone.')) return;
        const factory = await resetToFactory();
        setLocalTheme(factory);
        showMessage('success', 'Reset to factory original colors.');
    };


    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Theme Settings</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {colors.map((color) => (
                        <div key={color.var} className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">{color.label}</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={localTheme[color.var] || '#000000'}
                                    onChange={(e) => handleChange(color.var, e.target.value)}
                                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={localTheme[color.var] || ''}
                                    onChange={(e) => handleChange(color.var, e.target.value)}
                                    className="flex-grow px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Typography</h3>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Heading Font</label>
                            <select
                                value={localTheme['--font-heading'] || "'Playfair Display', serif"}
                                onChange={(e) => handleChange('--font-heading', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                            >
                                <option value="'Playfair Display', serif">Playfair Display (Serif)</option>
                                <option value="'Merriweather', serif">Merriweather (Serif)</option>
                                <option value="'Inter', sans-serif">Inter (Sans-serif)</option>
                                <option value="'Montserrat', sans-serif">Montserrat (Sans-serif)</option>
                                <option value="'Lato', sans-serif">Lato (Sans-serif)</option>
                                <option value="'Great Vibes', cursive">Great Vibes (Script)</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Body Font</label>
                            <select
                                value={localTheme['--font-body'] || "'Inter', sans-serif"}
                                onChange={(e) => handleChange('--font-body', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                            >
                                <option value="'Inter', sans-serif">Inter (Sans-serif)</option>
                                <option value="'Open Sans', sans-serif">Open Sans (Sans-serif)</option>
                                <option value="'Roboto', sans-serif">Roboto (Sans-serif)</option>
                                <option value="'Lato', sans-serif">Lato (Sans-serif)</option>
                                <option value="'Montserrat', sans-serif">Montserrat (Sans-serif)</option>
                                <option value="'Playfair Display', serif">Playfair Display (Serif)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-100">
                    <div className="flex gap-3">
                        <button
                            onClick={handleResetFactory}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-all"
                        >
                            Reset to Original
                        </button>
                        <button
                            onClick={handleResetDefault}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-all"
                        >
                            Reset to Default
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleSaveDefault}
                            className="px-4 py-2 text-stone-600 hover:bg-stone-50 border border-stone-200 rounded-lg text-sm font-medium transition-all"
                        >
                            Save as Default
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-6 py-2 bg-stone-800 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                            style={{ backgroundColor: 'var(--primary-brown)' }}
                        >
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const GeneralTab = ({ settings, setSettings, showMessage }) => {

    const handleSave = async (key, value) => {
        try {
            const { error } = await supabase
                .from('site_settings')
                .upsert({ key, value });
            if (error) throw error;
            showMessage('success', `${key.replace('_', ' ')} updated!`);
            setSettings(prev => ({ ...prev, [key]: value }));
        } catch (err) {
            showMessage('error', err.message);
        }
    };

    const handleSaveOpeningHours = async (formattedHours) => {
        await handleSave('opening_hours', formattedHours);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">General Settings</h2>

            {/* Branding Section */}
            <BrandingEditor
                settings={settings}
                onSave={handleSave}
                showMessage={showMessage}
            />

            {/* Background Image Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Image size={18} /> Hero Background
                </h3>
                <div className="flex flex-col md:flex-row gap-8 items-center bg-stone-50 p-6 rounded-lg border border-dashed border-gray-300">
                    <div className="flex-shrink-0">
                        <ImageUploader
                            folder="backgrounds"
                            onUpload={(url) => handleSave('hero_bg_url', url)}
                            showMessage={showMessage}
                        />
                    </div>
                    {settings.hero_bg_url && (
                        <div className="relative h-24 w-full md:w-48 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                            <img src={settings.hero_bg_url} alt="Hero BG Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {GENERAL_FIELDS.map(field => (
                    <div key={field.key} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                            {field.icon}
                            {field.label}
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={settings[field.key] || ''}
                                onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                            <button
                                onClick={() => handleSave(field.key, settings[field.key])}
                                className="px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-opacity-90 transition-all" style={{ backgroundColor: "var(--primary-brown)" }}
                            >
                                <Save size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Opening Hours Picker - Full Width */}
            <div className="mb-6">
                <OpeningHoursPicker
                    initialValue={settings.opening_hours || ''}
                    onSave={handleSaveOpeningHours}
                    showMessage={showMessage}
                />
            </div>
        </motion.div>
    );
};

const ServicesTab = ({ services, refresh, showMessage }) => {
    const [localServices, setLocalServices] = useState(services);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newService, setNewService] = useState({ title: '', description: '' });

    useEffect(() => { setLocalServices(services); }, [services]);

    const handleFieldChange = (idx, field, value) => {
        const updated = [...localServices];
        updated[idx] = { ...updated[idx], [field]: value };
        setLocalServices(updated);
    };

    const handleSave = async (s) => {
        try {
            const { error } = await supabase.from('services_overview').upsert(s);
            if (error) throw error;
            showMessage('success', 'Service updated!');
            refresh();
        } catch (err) { showMessage('error', err.message); }
    };

    const handleAddService = async () => {
        if (!newService.title || !newService.description) {
            showMessage('error', 'Please fill in all fields');
            return;
        }
        try {
            const { error } = await supabase.from('services_overview').insert([newService]);
            if (error) throw error;
            setNewService({ title: '', description: '' });
            setShowAddForm(false);
            refresh();
            showMessage('success', 'Service added!');
        } catch (err) { showMessage('error', err.message); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this service?')) return;
        try {
            const { error } = await supabase.from('services_overview').delete().eq('id', id);
            if (error) throw error;
            showMessage('success', 'Service deleted!');
            refresh();
        } catch (err) { showMessage('error', err.message); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Service Highlights</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-opacity-90 transition-all" style={{ backgroundColor: "#3D2B1F" }}
                >
                    <Plus size={18} /> {showAddForm ? 'Cancel' : 'Add Service'}
                </button>
            </div>

            {showAddForm && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-4 mb-6">
                    <h3 className="font-semibold text-gray-900">New Service</h3>
                    <input
                        placeholder="Service Title"
                        value={newService.title}
                        onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent"
                    />
                    <textarea
                        placeholder="Description"
                        value={newService.description}
                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg h-32 resize-none focus:ring-2 focus:ring-stone-800 focus:border-transparent"
                    />
                    <button
                        onClick={() => handleAddService()}
                        className="w-full bg-stone-800 text-white font-medium py-3 rounded-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-2" style={{ backgroundColor: "#3D2B1F" }}
                    >
                        <Plus size={16} /> Create Service
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {localServices.map((s, idx) => (
                    <div key={s.id || idx} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="w-12 h-12 bg-stone-50 rounded-lg flex items-center justify-center text-stone-800">
                                <Scissors size={24} />
                            </div>
                            {s.id && (
                                <button
                                    onClick={() => handleDelete(s.id)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                        <input
                            placeholder="Service Title"
                            value={s.title}
                            onChange={(e) => handleFieldChange(idx, 'title', e.target.value)}
                            className="w-full text-lg font-semibold border-none p-0 focus:ring-0 outline-none"
                        />
                        <textarea
                            placeholder="Description"
                            value={s.description || s.desc || ''}
                            onChange={(e) => handleFieldChange(idx, 'description', e.target.value)}
                            className="w-full text-gray-600 text-sm h-32 resize-none border-none p-0 focus:ring-0 outline-none"
                        />
                        <button
                            onClick={() => handleSave(s)}
                            className="w-full bg-stone-800 text-white font-medium py-3 rounded-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-2" style={{ backgroundColor: "#3D2B1F" }}
                        >
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const PricingTab = ({ pricing, refresh, showMessage }) => {
    const [localPricing, setLocalPricing] = useState(pricing);
    const [newItem, setNewItem] = useState({ category: 'CUT & STYLING', item_name: '', price: '', duration_minutes: 60 });

    useEffect(() => { setLocalPricing(pricing); }, [pricing]);

    const handleFieldChange = (idx, field, value) => {
        const updated = [...localPricing];
        updated[idx] = { ...updated[idx], [field]: value };
        setLocalPricing(updated);
    };

    const handleSaveItem = async (item) => {
        try {
            const { error } = await supabase.from('price_list').upsert(item);
            if (error) throw error;
            showMessage('success', 'Item updated');
            refresh();
        } catch (err) { showMessage('error', err.message); }
    };

    const handleAdd = async () => {
        if (!newItem.item_name || !newItem.price) {
            showMessage('error', 'Please fill in all fields');
            return;
        }
        try {
            const { error } = await supabase.from('price_list').insert([newItem]);
            if (error) throw error;
            setNewItem({ ...newItem, item_name: '', price: '' });
            refresh();
            showMessage('success', 'Added to price list');
        } catch (err) { showMessage('error', err.message); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to remove this item?')) return;
        try {
            await supabase.from('price_list').delete().eq('id', id);
            refresh();
            showMessage('success', 'Item removed');
        } catch (err) { showMessage('error', err.message); }
    };

    const formatDuration = (minutes) => {
        if (!minutes) return 'Not set';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}m`;
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Price List</h2>

            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Add New Service</h3>
                <div className="flex flex-wrap gap-4">
                    <select
                        value={newItem.category}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                        <option>CUT & STYLING</option>
                        <option>COLOURING</option>
                        <option>HAIR TREATMENTS</option>
                        <option>HAIR EXTENSIONS</option>
                        <option>MAKE UP</option>
                    </select>
                    <input
                        placeholder="Service Name"
                        value={newItem.item_name}
                        onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <input
                        placeholder="£50"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                        className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <select
                        value={newItem.duration_minutes}
                        onChange={(e) => setNewItem({ ...newItem, duration_minutes: parseInt(e.target.value) })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                        <option value={30}>30 min</option>
                        <option value={60}>1 hour</option>
                        <option value={90}>1.5h</option>
                        <option value={120}>2h</option>
                        <option value={150}>2.5h</option>
                        <option value={180}>3h</option>
                        <option value={210}>3.5h</option>
                        <option value={240}>4h</option>
                    </select>
                    <button
                        onClick={handleAdd}
                        className="px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2" style={{ backgroundColor: "#3D2B1F" }}
                    >
                        <Plus size={18} /> Add
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                {localPricing.map((item, idx) => (
                    <div key={item.id || idx} className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col md:flex-row md:items-center justify-between shadow-sm hover:shadow-md transition-shadow gap-4">
                        <div className="flex-grow flex flex-col md:flex-row md:items-center gap-4">
                            <div className="min-w-[120px]">
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">{item.category}</span>
                                <input
                                    value={item.item_name}
                                    onChange={(e) => handleFieldChange(idx, 'item_name', e.target.value)}
                                    className="text-gray-900 font-medium border-none p-0 focus:ring-0 outline-none w-full"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    value={item.price}
                                    onChange={(e) => handleFieldChange(idx, 'price', e.target.value)}
                                    className="text-stone-800 font-semibold border-none p-0 focus:ring-0 outline-none w-24"
                                />
                                <select
                                    value={item.duration_minutes || 60}
                                    onChange={(e) => handleFieldChange(idx, 'duration_minutes', parseInt(e.target.value))}
                                    className="text-xs border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-stone-400 outline-none"
                                >
                                    <option value={30}>30m</option>
                                    <option value={60}>1h</option>
                                    <option value={90}>1.5h</option>
                                    <option value={120}>2h</option>
                                    <option value={150}>2.5h</option>
                                    <option value={180}>3h</option>
                                    <option value={210}>3.5h</option>
                                    <option value={240}>4h</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleSaveItem(item)}
                                className="text-stone-600 hover:text-stone-900 transition-colors p-2"
                                title="Save"
                            >
                                <Save size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors p-2"
                                title="Delete"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const TeamTab = ({ stylists, refresh, showMessage }) => {
    const [localStylists, setLocalStylists] = useState(stylists);
    const [showHelp, setShowHelp] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newStylist, setNewStylist] = useState({ stylist_name: '', role: '', description: '', calendar_id: '', image_url: '' });

    useEffect(() => { setLocalStylists(stylists); }, [stylists]);

    const handleFieldChange = (idx, field, value) => {
        const updated = [...localStylists];
        updated[idx] = { ...updated[idx], [field]: value };
        setLocalStylists(updated);
    };

    const handleSave = async (s) => {
        try {
            const { error } = await supabase.from('stylist_calendars').upsert(s);
            if (error) throw error;
            showMessage('success', `Stylist ${s.stylist_name} updated!`);
            refresh();
        } catch (err) { showMessage('error', err.message); }
    };

    const handleAdd = async () => {
        if (!newStylist.stylist_name) return showMessage('error', 'Stylist name is required');
        try {
            const { error } = await supabase.from('stylist_calendars').insert([newStylist]);
            if (error) throw error;
            setNewStylist({ stylist_name: '', role: '', description: '', calendar_id: '', image_url: '' });
            setIsAdding(false);
            refresh();
            showMessage('success', 'New stylist added!');
        } catch (err) { showMessage('error', err.message); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this stylist?')) return;
        try {
            const { error } = await supabase.from('stylist_calendars').delete().eq('id', id);
            if (error) throw error;
            refresh();
            showMessage('success', 'Stylist removed');
        } catch (err) { showMessage('error', err.message); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold text-gray-900">Team Members</h2>
                    <button
                        onClick={() => setShowHelp(!showHelp)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                        title="Calendar Setup Help"
                    >
                        <Info size={20} />
                    </button>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-opacity-90 transition-all" style={{ backgroundColor: "#3D2B1F" }}
                >
                    <Plus size={18} /> Add Stylist
                </button>
            </div>

            {showHelp && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                        <Info size={18} />
                        How to Set Up Google Calendar for a Stylist
                    </h3>
                    <div className="text-sm text-amber-900 space-y-3">
                        <div>
                            <p className="font-medium mb-1">1. Create or Access the Stylist's Google Calendar</p>
                            <p className="text-amber-800 ml-4">Go to <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="underline">calendar.google.com</a> and create a new calendar for the stylist or use an existing one.</p>
                        </div>
                        <div>
                            <p className="font-medium mb-1">2. Share the Calendar</p>
                            <ul className="text-amber-800 ml-4 list-disc list-inside space-y-1">
                                <li>Click the three dots next to the calendar name</li>
                                <li>Select "Settings and sharing"</li>
                                <li>Scroll to "Share with specific people"</li>
                                <li>Add your service account email with <strong>"Make changes to events"</strong> permission</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-medium mb-1">3. Get the Calendar ID</p>
                            <ul className="text-amber-800 ml-4 list-disc list-inside space-y-1">
                                <li>In Calendar Settings, scroll to "Integrate calendar"</li>
                                <li>Copy the <strong>Calendar ID</strong> (looks like: example@group.calendar.google.com)</li>
                                <li>Paste it into the "Calendar ID" field below</li>
                            </ul>
                        </div>
                        <div className="bg-amber-100 p-3 rounded mt-3">
                            <p className="font-medium text-amber-900">Required Permissions:</p>
                            <p className="text-amber-800 text-xs mt-1">The service account needs "Make changes to events" permission to create and manage bookings.</p>
                        </div>
                    </div>
                </div>
            )}

            {isAdding && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-medium text-gray-700">New Stylist</h3>
                    <div className="flex items-center gap-4">
                        <ImageUploader
                            folder="team"
                            onUpload={(url) => setNewStylist({ ...newStylist, image_url: url })}
                            showMessage={showMessage}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={newStylist.stylist_name} onChange={e => setNewStylist({ ...newStylist, stylist_name: e.target.value })} placeholder="Name" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none" />
                        <input value={newStylist.role} onChange={e => setNewStylist({ ...newStylist, role: e.target.value })} placeholder="Role" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none" />
                    </div>
                    <input
                        value={newStylist.calendar_id}
                        onChange={e => setNewStylist({ ...newStylist, calendar_id: e.target.value })}
                        placeholder="Google Calendar ID (e.g., example@group.calendar.google.com)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none text-sm"
                    />
                    <textarea
                        value={newStylist.description}
                        onChange={e => setNewStylist({ ...newStylist, description: e.target.value })}
                        placeholder="Bio"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg h-20 resize-none focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none"
                    />
                    <div className="flex gap-4">
                        <button onClick={handleAdd} className="flex-grow bg-stone-800 text-white py-2 rounded-lg hover:bg-opacity-90 transition-all" style={{ backgroundColor: "#3D2B1F" }}>Create Stylist</button>
                        <button onClick={() => setIsAdding(false)} className="px-8 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all">Cancel</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {localStylists.map((s, idx) => (
                    <div key={s.id || idx} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shrink-0 relative group">
                                <img src={s.image_url || '/placeholder.png'} className="w-full h-full object-cover" alt={s.stylist_name} />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <ImageUploader
                                        folder="team"
                                        onUpload={(url) => handleFieldChange(idx, 'image_url', url)}
                                        showMessage={showMessage}
                                    />
                                </div>
                            </div>
                            <div className="flex-grow space-y-2">
                                <input value={s.stylist_name} onChange={(e) => handleFieldChange(idx, 'stylist_name', e.target.value)} className="w-full text-lg font-semibold border-none p-0 focus:ring-0 outline-none" />
                                <input value={s.role || ''} placeholder="Role" onChange={(e) => handleFieldChange(idx, 'role', e.target.value)} className="w-full text-sm text-gray-600 border-none p-0 focus:ring-0 outline-none" />
                            </div>
                        </div>
                        <input
                            value={s.calendar_id || ''}
                            onChange={(e) => handleFieldChange(idx, 'calendar_id', e.target.value)}
                            placeholder="Calendar ID"
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none font-mono text-gray-700"
                        />
                        <textarea value={s.description || ''} onChange={(e) => handleFieldChange(idx, 'description', e.target.value)} placeholder="Bio" className="w-full text-sm text-gray-600 h-20 resize-none border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none" />
                        <div className="flex gap-2">
                            <button onClick={() => handleSave(s)} className="flex-grow bg-stone-800 text-white py-2 rounded-lg hover:bg-opacity-90 transition-all" style={{ backgroundColor: "#3D2B1F" }}>Save</button>
                            <button onClick={() => handleDelete(s.id)} className="px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const GalleryTab = ({ gallery, refresh, showMessage }) => {
    const handleDelete = async (id) => {
        if (!confirm('Remove this image?')) return;
        try {
            await supabase.from('gallery_images').delete().eq('id', id);
            refresh();
            showMessage('success', 'Image removed');
        } catch (err) { showMessage('error', err.message); }
    };

    const handleAdd = async (url) => {
        try {
            const { error } = await supabase.from('gallery_images').insert([{ image_url: url, sort_order: gallery.length }]);
            if (error) throw error;
            refresh();
            showMessage('success', 'Image added to gallery');
        } catch (err) { showMessage('error', err.message); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Gallery</h2>
                <ImageUploader folder="gallery" onUpload={handleAdd} showMessage={showMessage} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {gallery.map((img) => (
                    <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <img src={img.image_url} className="w-full h-full object-cover" alt="Gallery" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={() => handleDelete(img.id)}
                                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const AppointmentsTab = ({ appointments, setAppointments, showMessage, clients, setClients, services, stylists, pricing, openingHours }) => {
    const [loading, setLoading] = useState(false);
    const [editingAppt, setEditingAppt] = useState(null);
    const [filterStylist, setFilterStylist] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [clientSearch, setClientSearch] = useState(''); // Client search state
    const [newAppt, setNewAppt] = useState({ client_id: '', stylist: '', service: '', date: '', time: '', send_email: true });

    // Filter clients for search
    const filteredClientsSearch = clientSearch
        ? clients?.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.email.toLowerCase().includes(clientSearch.toLowerCase()))
        : [];

    const handleSlotClick = (date, hour) => {
        const dateStr = date.toLocaleDateString('en-CA');
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
        setNewAppt(prev => ({
            ...prev,
            date: dateStr,
            time: timeStr,
            stylist: filterStylist !== 'all' ? filterStylist : ''
        }));
        setIsAddModalOpen(true);
    };

    const [timeSlots, setTimeSlots] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    useEffect(() => {
        if (newAppt.date) {
            const fetchAvailability = async () => {
                setIsLoadingSlots(true);
                try {
                    const stylistParam = newAppt.stylist ? `&stylist=${encodeURIComponent(newAppt.stylist)}` : '';
                    const res = await fetch(`/api/availability?date=${newAppt.date}${stylistParam}`);
                    if (res.ok) {
                        const data = await res.json();
                        setTimeSlots(data.slots || []);
                    } else {
                        setTimeSlots([]);
                    }
                } catch (err) {
                    console.error('Error fetching availability:', err);
                    setTimeSlots([]);
                } finally {
                    setIsLoadingSlots(false);
                }
            };
            fetchAvailability();
        } else {
            setTimeSlots([]);
        }
    }, [newAppt.date, newAppt.stylist]);

    useEffect(() => {
        fetchAppointments();
    }, []);

    // Hybrid appointments: Use Supabase locally, API in production
    const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            if (isLocalDev) {
                // Local: Fetch from Supabase
                const { data, error } = await supabase
                    .from('appointments')
                    .select(`
                        id,
                        start_time,
                        end_time,
                        stylist,
                        service,
                        status,
                        notes,
                        clients (
                            id,
                            name,
                            email,
                            phone
                        )
                    `);

                if (error) throw error;

                const mappedAppointments = data.map(appt => ({
                    id: appt.id,
                    stylist: appt.stylist,
                    startTime: appt.start_time,
                    endTime: appt.end_time,
                    service: appt.service,
                    client_id: appt.clients?.id,
                    customer: {
                        name: appt.clients?.name || 'Unknown',
                        email: appt.clients?.email || '',
                        phone: appt.clients?.phone || '',
                        service: appt.service
                    }
                }));

                setAppointments(mappedAppointments);
            } else {
                // Production: Fetch from Google Calendar API
                const response = await fetch('/api/appointments/list');
                const data = await response.json();
                if (data.appointments) {
                    setAppointments(data.appointments);
                }
            }
        } catch (err) {
            console.error('Fetch error:', err);
            showMessage('error', 'Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const [isAddingNewClient, setIsAddingNewClient] = useState(false);
    const [newClientData, setNewClientData] = useState({ name: '', email: '', phone: '' });

    const handleQuickAddClient = async () => {
        if (!newClientData.name) return showMessage('error', 'Name is required');

        try {
            let clientToSelect;

            // Check if client with this email already exists (only if email provided)
            if (newClientData.email?.trim()) {
                const { data: existingClient, error: searchError } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('email', newClientData.email.trim())
                    .maybeSingle();

                if (searchError) throw searchError;

                if (existingClient) {
                    clientToSelect = existingClient;
                    showMessage('info', 'Existing client found and selected');
                }
            }

            if (!clientToSelect) {
                // Create new one
                const { data: newClient, error: insertError } = await supabase
                    .from('clients')
                    .insert([{
                        name: newClientData.name.trim(),
                        email: newClientData.email?.trim()?.toLowerCase() || null,
                        phone: newClientData.phone?.trim() || null
                    }])
                    .select()
                    .single();

                if (insertError) throw insertError;
                clientToSelect = newClient;
                setClients(prev => [newClient, ...prev]); // Update local state
                showMessage('success', 'Client created and selected!');
            }

            setNewAppt({ ...newAppt, client_id: clientToSelect.id }); // Auto-select client
            setClientSearch('');
            setIsAddingNewClient(false);
            setNewClientData({ name: '', email: '', phone: '' });
        } catch (err) {
            console.error('Error adding client:', err);
            showMessage('error', err.message || 'Failed to add client');
        }
    };

    const handleAddAppointment = async (e) => {
        e.preventDefault();
        const client = clients.find(c => c.id === newAppt.client_id);
        if (!client) return showMessage('error', 'Select a client first');

        // Get duration from selected service in pricing list
        const selectedPriceItem = pricing?.find(p => p.item_name === newAppt.service);
        const duration = selectedPriceItem?.duration_minutes || 60;

        const startDateTime = new Date(`${newAppt.date}T${newAppt.time}:00`).toISOString();
        const endDateTime = new Date(new Date(`${newAppt.date}T${newAppt.time}:00`).getTime() + duration * 60 * 1000).toISOString();

        try {
            if (isLocalDev) {
                // Local: Save to Supabase
                const { error } = await supabase
                    .from('appointments')
                    .insert({
                        client_id: client.id,
                        stylist: newAppt.stylist,
                        service: newAppt.service,
                        start_time: startDateTime,
                        end_time: endDateTime,
                        status: 'confirmed'
                    });

                if (error) throw error;

                showMessage('success', 'Appointment created!');
                setIsAddModalOpen(false);
                fetchAppointments();
                setNewAppt({ client_id: '', stylist: '', service: '', date: '', time: '', send_email: true });
                setClientSearch('');
            } else {
                // Production: Use Google Calendar API
                const res = await fetch('/api/book', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        stylist: newAppt.stylist,
                        service: newAppt.service,
                        date: newAppt.date,
                        time: newAppt.time,
                        name: client.name,
                        email: client.email,
                        phone: client.phone,
                        duration_minutes: duration,
                        send_email: newAppt.send_email
                    })
                });
                const data = await res.json();
                if (data.success) {
                    showMessage('success', 'Appointment created!');
                    setIsAddModalOpen(false);
                    fetchAppointments();
                    setNewAppt({ client_id: '', stylist: '', service: '', date: '', time: '', send_email: true });
                    setClientSearch('');
                } else {
                    showMessage('error', data.error || 'Failed to create');
                }
            }
        } catch (err) {
            console.error('Add appt error:', err);
            showMessage('error', err.message || 'API Error');
        }
    };

    const handleDelete = async (appt) => {
        if (!confirm(`Delete appointment for ${appt.customer.name}?`)) return;

        try {
            if (isLocalDev) {
                // Local: Delete from Supabase
                const { error } = await supabase
                    .from('appointments')
                    .delete()
                    .eq('id', appt.id);

                if (error) throw error;

                showMessage('success', 'Appointment deleted');
                fetchAppointments();
            } else {
                // Production: Delete from Google Calendar
                const response = await fetch('/api/appointments/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ eventId: appt.id, calendarId: appt.calendarId })
                });

                if (response.ok) {
                    showMessage('success', 'Appointment deleted');
                    fetchAppointments();
                } else {
                    throw new Error('Delete failed');
                }
            }
        } catch (err) {
            showMessage('error', 'Failed to delete appointment');
        }
    };

    // ... existing handleUpdate ...
    const handleUpdate = async (updatedData) => {
        try {
            const response = await fetch('/api/appointments/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId: editingAppt.id,
                    calendarId: editingAppt.calendarId,
                    updates: updatedData
                })
            });

            if (response.ok) {
                showMessage('success', 'Appointment updated');
                setEditingAppt(null);
                fetchAppointments();
            } else {
                throw new Error('Update failed');
            }
        } catch (err) {
            showMessage('error', 'Failed to update appointment');
        }
    };

    const filteredAppointments = appointments.filter(appt => {
        const matchesStylist = filterStylist === 'all' || appt.stylist === filterStylist;
        const matchesSearch = !searchQuery ||
            appt.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            appt.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStylist && matchesSearch;
    });

    const uniqueStylists = [...new Set(appointments.map(a => a.stylist))];

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isToday = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isPast = (dateString) => {
        return new Date(dateString) < new Date();
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Appointments</h2>
                <div className="flex flex-wrap items-center gap-2">
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all text-sm ${viewMode === 'list' ? 'bg-white text-stone-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            <List size={16} /> List
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all text-sm ${viewMode === 'calendar' ? 'bg-white text-stone-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            <Calendar size={16} /> Calendar
                        </button>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-[#3D2B1F] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90"
                        style={{ backgroundColor: "#3D2B1F" }}
                    >
                        <Plus size={18} /> New Appointment
                    </button>

                    <button
                        onClick={fetchAppointments}
                        className="flex items-center gap-2 px-3 py-2 bg-stone-100 text-stone-900 rounded-lg hover:bg-stone-200 transition-colors"
                        disabled={loading}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />} Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 mb-4 md:mb-6 space-y-3 md:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="flex-1">
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Filter by Stylist</label>
                        <select
                            value={filterStylist}
                            onChange={(e) => setFilterStylist(e.target.value)}
                            className="w-full px-3 md:px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none h-[42px]"
                        >
                            <option value="all">All Stylists</option>
                            {uniqueStylists.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Search Customer</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none h-[42px]"
                            />
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content View */}
            {viewMode === 'list' ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-900 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">Date & Time</th>
                                    <th className="px-6 py-3">Customer</th>
                                    <th className="px-6 py-3">Service</th>
                                    <th className="px-6 py-3">Stylist</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredAppointments.map(appt => (
                                    <tr key={appt.id} className={`hover:bg-gray-50 transition-colors ${isPast(appt.startTime) ? 'opacity-60 bg-gray-50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{formatDateTime(appt.startTime)}</span>
                                                {isToday(appt.startTime) && <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full w-fit mt-1">Today</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{appt.customer.name}</div>
                                                <div className="text-xs text-gray-500">{appt.customer.email}</div>
                                                <div className="text-xs text-gray-500">{appt.customer.phone}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 font-medium text-xs">
                                                <Scissors size={12} />
                                                {appt.service}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs ${STYLIST_COLORS[appt.stylist] || STYLIST_COLORS['default']}`}>
                                                <User size={12} />
                                                {appt.stylist}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingAppt(appt)}
                                                    className="p-1 text-gray-500 hover:text-stone-800 hover:bg-stone-100 rounded transition-colors"
                                                    title="Edit Appointment"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(appt)}
                                                    className="p-1 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete Appointment"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredAppointments.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            No appointments found matching your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <CalendarView
                    appointments={filteredAppointments}
                    onEditAppointment={setEditingAppt}
                    onDeleteAppointment={handleDelete}
                    stylists={stylists}
                    openingHours={openingHours}
                    onSlotClick={handleSlotClick}
                />
            )}

            {/* Add Appointment Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#3D2B1F] text-[#EAE0D5]">
                                <h3 className="text-lg font-semibold">{isAddingNewClient ? 'Add New Client' : 'New Appointment'}</h3>
                                <button onClick={() => { setIsAddModalOpen(false); setIsAddingNewClient(false); }}><X size={20} /></button>
                            </div>
                            {isAddingNewClient ? (
                                <div className="p-6 space-y-4 overflow-y-auto">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D2B1F]"
                                            value={newClientData.name || clientSearch}
                                            onChange={e => setNewClientData({ ...newClientData, name: e.target.value })}
                                            placeholder="Jane Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D2B1F]"
                                            value={newClientData.email}
                                            onChange={e => setNewClientData({ ...newClientData, email: e.target.value })}
                                            placeholder="jane@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D2B1F]"
                                            value={newClientData.phone}
                                            onChange={e => setNewClientData({ ...newClientData, phone: e.target.value })}
                                            placeholder="+1 234 567 8900"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => setIsAddingNewClient(false)} className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                                        <button onClick={handleQuickAddClient} style={{ backgroundColor: '#3D2B1F', color: 'white' }} className="flex-1 py-2 rounded-lg hover:opacity-90 font-medium">Save & Select</button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleAddAppointment} className="flex-1 overflow-y-auto p-6 space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Stylist</label>
                                            <select className="w-full p-2 border border-gray-300 rounded-lg" required value={newAppt.stylist} onChange={e => setNewAppt({ ...newAppt, stylist: e.target.value })}>
                                                <option value="">-- Stylist --</option>
                                                {stylists?.map(s => <option key={s.id || s} value={s.stylist_name || s.name || s}>{s.stylist_name || s.name || s}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                                            <select className="w-full p-2 border border-gray-300 rounded-lg" required value={newAppt.service} onChange={e => setNewAppt({ ...newAppt, service: e.target.value })}>
                                                <option value="">-- Service --</option>
                                                {pricing?.map(p => (
                                                    <option key={p.id} value={p.item_name}>
                                                        {p.item_name} ({p.duration_minutes || 60}m) - {p.price}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Client</label>
                                        <input
                                            type="text"
                                            placeholder="Search client..."
                                            value={clients?.find(c => c.id === newAppt.client_id)?.name || clientSearch}
                                            onChange={(e) => {
                                                setClientSearch(e.target.value);
                                                if (newAppt.client_id) setNewAppt({ ...newAppt, client_id: '' }); // Clear selection on edit
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D2B1F]"
                                        />
                                        {clientSearch && !newAppt.client_id && (
                                            <div className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                {filteredClientsSearch && filteredClientsSearch.length > 0 && (
                                                    filteredClientsSearch.map(c => (
                                                        <div
                                                            key={c.id}
                                                            className="p-2 hover:bg-gray-50 cursor-pointer text-sm"
                                                            onClick={() => {
                                                                setNewAppt({ ...newAppt, client_id: c.id });
                                                                setClientSearch('');
                                                            }}
                                                        >
                                                            <div className="font-medium">{c.name}</div>
                                                            <div className="text-xs text-gray-500">{c.email}</div>
                                                        </div>
                                                    ))
                                                )}
                                                {(!filteredClientsSearch || filteredClientsSearch.length === 0) && (
                                                    <div className="p-3">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setIsAddingNewClient(true);
                                                            }}
                                                            style={{ backgroundColor: '#3D2B1F', color: 'white' }}
                                                            className="w-full text-sm px-4 py-3 rounded-lg hover:opacity-90 font-bold flex items-center justify-center gap-2 shadow-sm"
                                                        >
                                                            <Plus size={18} />
                                                            <span>Create New Client "{clientSearch}"</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {newAppt.client_id && (
                                            <button
                                                type="button"
                                                onClick={() => { setNewAppt({ ...newAppt, client_id: '' }); setClientSearch(''); }}
                                                className="absolute right-2 top-8 text-gray-400 hover:text-gray-600"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="md:col-span-2 space-y-3 pt-2 border-t border-gray-100">
                                        <label className="block text-sm font-bold text-gray-800">Date & Time</label>
                                        <div className="space-y-4">

                                            <AntdDatePicker
                                                value={newAppt.date}
                                                onChange={(date, dateString) => setNewAppt({ ...newAppt, date: dateString })}
                                                className=""
                                            />


                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Available Slots</label>
                                            {isLoadingSlots ? (
                                                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-4">
                                                    <Loader2 size={18} className="animate-spin" /> checking...
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                                                    {timeSlots.length > 0 ? (
                                                        timeSlots.map(t => (
                                                            <button
                                                                key={t}
                                                                type="button"
                                                                onClick={() => setNewAppt({ ...newAppt, time: t })}
                                                                className={`px-1 py-2 text-sm rounded-md border transition-all shadow-sm ${newAppt.time === t
                                                                    ? 'bg-[#3D2B1F] text-white border-[#3D2B1F] font-semibold ring-2 ring-offset-1 ring-[#3D2B1F]'
                                                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-white hover:border-[#3D2B1F] hover:text-[#3D2B1F]'
                                                                    }`}
                                                            >
                                                                {t}
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="col-span-full text-sm text-center text-gray-400 py-4 italic">
                                                            {newAppt.date ? 'No slots available for this date' : 'Select a date to view slots'}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {clients.find(c => c.id === newAppt.client_id)?.email && (
                                            <div className="flex items-center gap-2 px-1 pt-2">
                                                <input
                                                    type="checkbox"
                                                    id="send_email"
                                                    checked={newAppt.send_email}
                                                    onChange={(e) => setNewAppt({ ...newAppt, send_email: e.target.checked })}
                                                    className="w-4 h-4 accent-[#3D2B1F] border-gray-300 rounded cursor-pointer"
                                                />
                                                <label htmlFor="send_email" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                                                    Send confirmation email to client
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                    <button type="submit" className="w-full py-3.5 bg-[#3D2B1F] text-white rounded-lg mt-6 font-bold text-lg shadow-md hover:shadow-lg hover:bg-opacity-95 transition-all transform active:scale-[0.99]" style={{ backgroundColor: '#3D2B1F' }}>
                                        Confirm Booking
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div >
    );
};



const CalendarView = ({ appointments, onEditAppointment, onDeleteAppointment, stylists, openingHours, onSlotClick = () => { } }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarViewMode, setCalendarViewMode] = useState('week'); // 'month', 'week', 'day'

    const parsedOpeningHours = React.useMemo(() => parseOpeningHours(openingHours), [openingHours]);

    const isDayOpen = (date) => {
        if (!openingHours || openingHours === '') return true;
        const dayName = WEEK_DAYS[date.getDay()];
        const slots = parsedOpeningHours[dayName];
        return slots ? slots.some(s => s) : true;
    };

    // Helper functions
    const getWeekDays = (date) => {
        const day = date.getDay();
        const diff = date.getDate() - day;
        const sunday = new Date(date);
        sunday.setDate(diff);

        const week = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(sunday);
            d.setDate(sunday.getDate() + i);
            week.push(d);
        }
        return week;
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }
        return days;
    };

    const getAppointmentsForDay = (date) => {
        if (!date) return [];
        return appointments.filter(appt => {
            const apptDate = new Date(appt.startTime);
            return apptDate.toDateString() === date.toDateString();
        }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    };

    const getAppointmentsForTimeSlot = (date, hour) => {
        const dayAppts = getAppointmentsForDay(date);
        return dayAppts.filter(appt => {
            const apptHour = new Date(appt.startTime).getHours();
            return apptHour === hour;
        });
    };

    const navigate = (direction) => {
        const newDate = new Date(currentDate);
        if (calendarViewMode === 'month') {
            newDate.setMonth(newDate.getMonth() + direction);
        } else if (calendarViewMode === 'week') {
            newDate.setDate(newDate.getDate() + (direction * 7));
        } else {
            newDate.setDate(newDate.getDate() + direction);
        }
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const isToday = (date) => {
        if (!date) return false;
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const formatDateHeader = () => {
        if (calendarViewMode === 'month') {
            return currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
        } else if (calendarViewMode === 'week') {
            const week = getWeekDays(currentDate);
            const start = week[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            const end = week[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            return `${start} - ${end}`;
        } else {
            return currentDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        }
    };

    const renderMonthView = () => {
        const days = getDaysInMonth(currentDate);

        return (
            <div className="grid grid-cols-7 gap-1 md:gap-2">
                {WEEK_DAYS.map(day => (
                    <div key={day} className="text-center text-xs md:text-sm font-medium text-gray-600 py-1 md:py-2">
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.substring(0, 1)}</span>
                    </div>
                ))}

                {days.map((date, index) => {
                    const isDateOpen = date && isDayOpen(date);
                    const dayAppointments = date ? getAppointmentsForDay(date) : [];
                    const isTodayDate = isToday(date);

                    return (
                        <div
                            key={index}
                            className={`min-h-[80px] sm:min-h-[100px] md:min-h-[120px] border rounded-md md:rounded-lg p-1 md:p-2 ${!date
                                ? 'bg-gray-50'
                                : !isDateOpen
                                    ? 'bg-gray-50 border-gray-100 opacity-60'
                                    : isTodayDate
                                        ? 'bg-amber-50 border-amber-300'
                                        : 'bg-white border-gray-200'
                                }`}
                        >
                            {date && (
                                <>
                                    <div className={`text-xs md:text-sm font-medium mb-1 md:mb-2 ${isTodayDate ? 'text-amber-900' : isDateOpen ? 'text-gray-700' : 'text-gray-400'
                                        }`}>
                                        {date.getDate()}
                                    </div>
                                    {isDateOpen && (
                                        <div className="space-y-0.5 md:space-y-1">
                                            {dayAppointments.slice(0, 3).map(appt => {
                                                const time = new Date(appt.startTime).toLocaleTimeString('en-GB', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                });
                                                const colorClass = STYLIST_COLORS[appt.stylist] || STYLIST_COLORS.default;

                                                return (
                                                    <div
                                                        key={appt.id}
                                                        className={`text-[10px] sm:text-xs p-1 sm:p-1.5 rounded border cursor-pointer hover:shadow-sm transition-shadow active:scale-95 ${colorClass}`}
                                                        onClick={(e) => { e.stopPropagation(); onEditAppointment(appt); }}
                                                        title={`${appt.customer.name} - ${appt.customer.service}`}
                                                    >
                                                        <div className="font-medium truncate">{time}</div>
                                                        <div className="truncate hidden sm:block">{appt.customer.name}</div>
                                                        <div className="truncate text-[9px] sm:text-xs opacity-75 hidden md:block">{appt.stylist}</div>
                                                    </div>
                                                );
                                            })}
                                            {dayAppointments.length > 3 && (
                                                <div className="text-[9px] sm:text-xs text-gray-500 text-center">
                                                    +{dayAppointments.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {!isDateOpen && date && (
                                        <div className="flex items-center justify-center h-1/2">
                                            <span className="text-[10px] text-gray-400 italic">Closed</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderWeekView = () => {
        const week = getWeekDays(currentDate);
        const filteredWeek = week.filter(d => isDayOpen(d));

        if (filteredWeek.length === 0) {
            return (
                <div className="p-12 text-center bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500">The salon is closed on all days this week.</p>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                    {/* Header */}
                    <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `80px repeat(${filteredWeek.length}, minmax(0, 1fr))` }}>
                        <div className="text-xs font-medium text-gray-600 p-2 text-center">Time</div>
                        {filteredWeek.map((date, i) => {
                            const isTodayDate = isToday(date);
                            return (
                                <div key={i} className={`text-center p-2 rounded-t-lg ${isTodayDate ? 'bg-amber-100' : 'bg-gray-50'
                                    }`}>
                                    <div className="text-xs font-medium text-gray-600">{WEEK_DAYS[date.getDay()]}</div>
                                    <div className={`text-sm font-semibold ${isTodayDate ? 'text-amber-900' : 'text-gray-900'}`}>
                                        {date.getDate()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Time slots */}
                    <div className="space-y-1">
                        {TIME_SLOTS.map(hour => (
                            <div key={hour} className="grid gap-1" style={{ gridTemplateColumns: `80px repeat(${filteredWeek.length}, minmax(0, 1fr))` }}>
                                <div className="text-xs text-gray-600 p-2 font-medium flex items-center justify-center">
                                    {hour}:00
                                </div>
                                {filteredWeek.map((date, i) => {
                                    const slotAppts = getAppointmentsForTimeSlot(date, hour);
                                    const isTodayDate = isToday(date);

                                    return (
                                        <div
                                            key={i}
                                            className={`min-h-[60px] border rounded p-1 cursor-pointer transition-colors hover:bg-stone-50 ${isTodayDate ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}
                                            onClick={() => onSlotClick(date, hour)}
                                        >
                                            {slotAppts.map(appt => {
                                                const colorClass = STYLIST_COLORS[appt.stylist] || STYLIST_COLORS.default;
                                                const time = new Date(appt.startTime).toLocaleTimeString('en-GB', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                });

                                                return (
                                                    <div
                                                        key={appt.id}
                                                        className={`text-xs p-2 rounded border cursor-pointer hover:shadow-md transition-all mb-1 ${colorClass}`}
                                                        onClick={(e) => { e.stopPropagation(); onEditAppointment(appt); }}
                                                    >
                                                        <div className="font-semibold">{time}</div>
                                                        <div className="truncate font-medium">{appt.customer.name}</div>
                                                        <div className="truncate text-xs opacity-75">{appt.customer.service}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderDayView = () => {
        if (!isDayOpen(currentDate)) {
            return (
                <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg border border-gray-200">
                    <Clock size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Salon is Closed</h3>
                    <p className="text-gray-500">The salon is not open on {currentDate.toLocaleDateString('en-GB', { weekday: 'long' })}.</p>
                </div>
            );
        }

        const isTodayDate = isToday(currentDate);

        return (
            <div className="max-w-2xl mx-auto">
                <div className={`text-center p-4 rounded-lg mb-4 ${isTodayDate ? 'bg-amber-100' : 'bg-gray-50'
                    }`}>
                    <div className="text-sm text-gray-600">{WEEK_DAYS[currentDate.getDay()]}</div>
                    <div className={`text-2xl font-bold ${isTodayDate ? 'text-amber-900' : 'text-gray-900'}`}>
                        {currentDate.getDate()}
                    </div>
                    <div className="text-sm text-gray-600">
                        {currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                    </div>
                </div>

                <div className="space-y-2">
                    {TIME_SLOTS.map(hour => {
                        const slotAppts = getAppointmentsForTimeSlot(currentDate, hour);

                        return (
                            <div key={hour} className="flex gap-3">
                                <div className="w-20 text-sm text-gray-600 font-medium pt-2 text-right">
                                    {hour}:00
                                </div>
                                <div
                                    className={`flex-1 min-h-[60px] border rounded-lg p-2 cursor-pointer transition-colors hover:bg-stone-50 ${isTodayDate ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}
                                    onClick={() => onSlotClick(currentDate, hour)}
                                >
                                    {slotAppts.map(appt => {
                                        const colorClass = STYLIST_COLORS[appt.stylist] || STYLIST_COLORS.default;
                                        const time = new Date(appt.startTime).toLocaleTimeString('en-GB', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        });

                                        return (
                                            <div
                                                key={appt.id}
                                                className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all mb-2 ${colorClass}`}
                                                onClick={(e) => { e.stopPropagation(); onEditAppointment(appt); }}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold text-sm">{time}</span>
                                                    <span className="text-xs px-2 py-1 rounded bg-white bg-opacity-50">
                                                        {appt.stylist}
                                                    </span>
                                                </div>
                                                <div className="font-medium">{appt.customer.name}</div>
                                                <div className="text-sm opacity-75">{appt.customer.service}</div>
                                                {appt.customer.phone && (
                                                    <div className="text-xs mt-1 opacity-75">{appt.customer.phone}</div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
            {/* Calendar Header */}
            <div className="flex flex-col gap-3 mb-4 md:mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">{formatDateHeader()}</h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={goToToday}
                            className="px-3 py-2 text-xs md:text-sm text-stone-800 hover:bg-stone-100 rounded-lg transition-all"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => navigate(1)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* View Mode Selector */}
                <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
                    <button
                        onClick={() => setCalendarViewMode('day')}
                        className={`flex-1 sm:flex-none px-3 py-2 rounded-md transition-all text-xs md:text-sm ${calendarViewMode === 'day'
                            ? 'bg-white text-stone-800 shadow-sm font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Day
                    </button>
                    <button
                        onClick={() => setCalendarViewMode('week')}
                        className={`flex-1 sm:flex-none px-3 py-2 rounded-md transition-all text-xs md:text-sm ${calendarViewMode === 'week'
                            ? 'bg-white text-stone-800 shadow-sm font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Week
                    </button>
                    <button
                        onClick={() => setCalendarViewMode('month')}
                        className={`flex-1 sm:flex-none px-3 py-2 rounded-md transition-all text-xs md:text-sm ${calendarViewMode === 'month'
                            ? 'bg-white text-stone-800 shadow-sm font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Month
                    </button>
                </div>
            </div>

            {/* Calendar Content */}
            {calendarViewMode === 'month' && renderMonthView()}
            {calendarViewMode === 'week' && renderWeekView()}
            {calendarViewMode === 'day' && renderDayView()}

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-200">
                <span className="text-xs md:text-sm text-gray-600">Stylists:</span>
                {stylists?.map(stylist => {
                    const name = stylist.stylist_name || stylist.name || stylist;
                    const colorClass = STYLIST_COLORS[name] || STYLIST_COLORS.default;
                    return (
                        <div key={name} className="flex items-center gap-1 md:gap-2">
                            <div className={`w-3 h-3 md:w-4 md:h-4 rounded border ${colorClass}`}></div>
                            <span className="text-xs md:text-sm text-gray-700">{name}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const EditAppointmentModal = ({ appointment, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: appointment.customer.name,
        email: appointment.customer.email,
        phone: appointment.customer.phone,
        service: appointment.customer.service,
        date: appointment.startTime.split('T')[0],
        time: appointment.startTime.split('T')[1].substring(0, 5),
    });

    const handleSubmit = () => {
        const startDateTime = new Date(`${formData.date}T${formData.time}:00`).toISOString();
        const endDateTime = new Date(new Date(`${formData.date}T${formData.time}:00`).getTime() + 60 * 60 * 1000).toISOString();

        onSave({
            customer: {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            },
            service: formData.service,
            startTime: startDateTime,
            endTime: endDateTime
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Edit Appointment</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                        <input
                            type="text"
                            value={formData.service}
                            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                            <input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleSubmit}
                        className="flex-grow text-white py-2 rounded-lg transition-all"
                        style={{ backgroundColor: "#3D2B1F" }}
                    >
                        Save Changes
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </motion.div>
        </div>
    );
};


const MessagesTab = ({ settings, setSettings, showMessage, refresh }) => {

    const [template, setTemplate] = useState(settings.email_template || DEFAULT_EMAIL_TEMPLATE.trim());
    const [subject, setSubject] = useState(settings.email_subject || 'Booking Confirmation - Studio 938');
    const [isSaving, setIsSaving] = useState(false);
    const [showHtmlSource, setShowHtmlSource] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const contentEditableRef = React.useRef(null);

    useEffect(() => {
        if (settings.email_template) {
            setTemplate(settings.email_template);
        } else {
            setTemplate(DEFAULT_EMAIL_TEMPLATE.trim());
        }
        if (settings.email_subject) {
            setSubject(settings.email_subject);
        }
    }, [settings.email_template, settings.email_subject]);

    // Update contentEditable when template changes (only if not currently editing in it to avoid cursor jumps, 
    // but here we rely on the toggle to switch modes so it's safer)
    useEffect(() => {
        if (contentEditableRef.current && !showHtmlSource) {
            if (contentEditableRef.current.innerHTML !== template) {
                contentEditableRef.current.innerHTML = template;
            }
        }
    }, [template, showHtmlSource, showPreview]);


    const handleSave = async () => {
        // If in visual mode, get content from ref
        let contentToSave = template;
        if (!showHtmlSource && contentEditableRef.current) {
            contentToSave = contentEditableRef.current.innerHTML;
            setTemplate(contentToSave); // Sync state
        }

        setIsSaving(true);
        try {
            // Save template
            const { error: templateError } = await supabase
                .from('site_settings')
                .upsert({ key: 'email_template', value: contentToSave });
            if (templateError) throw templateError;

            // Save subject
            const { error: subjectError } = await supabase
                .from('site_settings')
                .upsert({ key: 'email_subject', value: subject });
            if (subjectError) throw subjectError;

            showMessage('success', 'Email settings updated!');
            refresh();
        } catch (err) {
            showMessage('error', err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleVisualBlur = () => {
        if (contentEditableRef.current) {
            setTemplate(contentEditableRef.current.innerHTML);
        }
    };

    const resetToDefault = async () => {
        if (window.confirm('Reset to default template? This will overwrite your current changes.')) {
            const content = DEFAULT_EMAIL_TEMPLATE.trim();
            const defaultSubject = 'Booking Confirmation - Studio 938';
            setTemplate(content);
            setSubject(defaultSubject);
            if (contentEditableRef.current) {
                contentEditableRef.current.innerHTML = content;
            }

            // We need to save both
            setIsSaving(true);
            try {
                await supabase.from('site_settings').upsert({ key: 'email_template', value: content });
                await supabase.from('site_settings').upsert({ key: 'email_subject', value: defaultSubject });
                showMessage('success', 'Reset to defaults!');
                refresh();
            } catch (err) {
                showMessage('error', err.message);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const previewHtml = template
        .replace(/{{name}}/g, 'Jane Doe')
        .replace(/{{service}}/g, 'Full Balayage')
        .replace(/{{stylist}}/g, 'Jo')
        .replace(/{{date}}/g, 'Friday, 30 January 2026')
        .replace(/{{time}}/g, '14:30')
        .replace(/{{salon_phone}}/g, settings.phone || '020 8445 1122')
        .replace(/{{salon_location}}/g, settings.address || '938 High Road, London');

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Email Settings</h2>
                    <p className="text-sm text-gray-500 mt-1">Customize the booking confirmation email sent to customers.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={resetToDefault}
                        className="px-4 py-2 text-stone-600 hover:text-stone-800 text-sm font-medium transition-colors"
                    >
                        Reset to Default
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-900 flex items-center gap-2 transition-all disabled:opacity-50"
                        style={{ backgroundColor: "var(--primary-brown)" }}
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Settings
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Editor Section */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Subject Line Input */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject Line</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D2B1F] focus:border-transparent outline-none"
                            placeholder="e.g. Your Appointment at Studio 938"
                        />
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                    {showPreview ? 'Live Preview' : 'Email Content'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowPreview(!showPreview)}
                                    className={`text-xs font-semibold px-3 py-1 rounded-full transition-all flex items-center gap-1 ${showPreview ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {showPreview ? <><Edit size={12} /> Exit Preview</> : <><Maximize2 size={12} /> Live Preview</>}
                                </button>

                                {!showPreview && (
                                    <label className="flex items-center gap-2 text-xs font-semibold text-stone-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={showHtmlSource}
                                            onChange={(e) => setShowHtmlSource(e.target.checked)}
                                            className="rounded border-gray-300 text-stone-600 focus:ring-stone-500"
                                        />
                                        Show HTML Source
                                    </label>
                                )}
                            </div>
                        </div>

                        {showPreview ? (
                            <div className="h-[500px] overflow-y-auto p-8 bg-gray-50 flex items-start justify-center">
                                <div
                                    className="bg-white shadow-lg rounded-xl overflow-hidden w-full max-w-[600px] min-h-[400px] p-6 text-sm"
                                    dangerouslySetInnerHTML={{ __html: previewHtml || '<p class="text-center text-gray-400 italic">No content to preview</p>' }}
                                />
                            </div>
                        ) : showHtmlSource ? (
                            <textarea
                                value={template}
                                onChange={(e) => setTemplate(e.target.value)}
                                placeholder="Paste your HTML template here..."
                                className="w-full h-[500px] p-4 font-mono text-sm focus:ring-0 border-none outline-none resize-none bg-slate-50 text-slate-700"
                                spellCheck="false"
                            />
                        ) : (
                            <div className="h-[500px] overflow-y-auto p-8 bg-gray-50">
                                <div
                                    ref={contentEditableRef}
                                    contentEditable={true}
                                    onBlur={handleVisualBlur}
                                    className="bg-white shadow-lg rounded-xl w-full max-w-[600px] min-h-[400px] p-6 text-sm mx-auto outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-100"
                                // Initial content is set via useEffect to avoid re-render loop on typing
                                />
                                <p className="text-center text-xs text-gray-400 mt-2">
                                    Click inside the box to edit text directly.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Section */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Info size={16} className="text-stone-800" />
                            Available Variables
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">
                            These variables will be replaced with actual details when sent.
                        </p>
                        <div className="space-y-3">
                            {EMAIL_VARIABLES.map(v => (
                                <div key={v.tag} className="flex flex-col gap-1">
                                    <code className="text-[11px] bg-stone-100 text-stone-800 px-2 py-1 rounded inline-block w-fit font-bold select-all">
                                        {v.tag}
                                    </code>
                                    <span className="text-[10px] text-gray-500 ml-1">{v.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
                        <h3 className="text-sm font-bold text-amber-900 mb-2">Editing Tips</h3>
                        <p className="text-xs text-amber-800 leading-relaxed">
                            You are editing the visual template.
                            <br /><br />
                            <strong>Caution:</strong> If you delete the style structure, the email might look different. Use "Show HTML Source" to restore or edit the layout code.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};



// --- CLIENTS TAB COMPONENT ---
const ClientsTab = ({ clients, setClients, showMessage, refreshClients }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' });

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm))
    );

    const handleOpenModal = (client = null) => {
        if (client) {
            setEditingClient(client);
            setFormData({ name: client.name, email: client.email, phone: client.phone || '', notes: client.notes || '' });
        } else {
            setEditingClient(null);
            setFormData({ name: '', email: '', phone: '', notes: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('clients')
                .upsert({
                    ...(editingClient && { id: editingClient.id }),
                    ...formData
                })
                .select()
                .single();

            if (error) throw error;

            showMessage('success', editingClient ? 'Client updated' : 'Client created');
            setIsModalOpen(false);
            refreshClients();
        } catch (err) {
            showMessage('error', err.message);
        }
    };

    const handleDelete = async (client) => {
        if (window.confirm(`Are you sure you want to delete ${client.name}? This action cannot be undone.`)) {
            try {
                const { error } = await supabase
                    .from('clients')
                    .delete()
                    .eq('id', client.id);

                if (error) throw error;

                showMessage('success', 'Client deleted successfully');
                refreshClients();
            } catch (err) {
                showMessage('error', err.message);
            }
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Client Management</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-all font-medium"
                    style={{ backgroundColor: "var(--primary-brown)" }}
                >
                    <Plus size={18} /> Add Client
                </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search clients..."
                        className="bg-transparent border-none outline-none text-sm w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Contact</th>
                                <th className="px-6 py-3">Notes</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredClients.map(client => (
                                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{client.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="flex items-center gap-1"><Mail size={12} /> {client.email}</span>
                                            {client.phone && <span className="flex items-center gap-1"><Phone size={12} /> {client.phone}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 truncate max-w-xs">{client.notes || '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => handleOpenModal(client)}
                                                className="text-[var(--primary-brown)] hover:underline font-medium flex items-center gap-1"
                                            >
                                                <Edit size={14} /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(client)}
                                                className="text-red-600 hover:text-red-800 hover:underline font-medium flex items-center gap-1"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredClients.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        No clients found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#3D2B1F] text-[#EAE0D5]">
                                <h3 className="text-lg font-semibold">{editingClient ? 'Edit Client' : 'Add New Client'}</h3>
                                <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D2B1F]" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input type="email" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D2B1F]" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input type="tel" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D2B1F]" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D2B1F]" rows="3" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">Cancel</button>
                                    <button type="submit" className="flex-1 py-2 text-white rounded-lg hover:opacity-90 font-medium transition-all" style={{ backgroundColor: "#3D2B1F" }}>Save Client</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
export default AdminDashboard;
