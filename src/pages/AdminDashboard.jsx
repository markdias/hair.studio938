import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, LogOut, Check, Info, Loader2,
    Settings, Scissors, Tag, Image, Plus, Trash2,
    MapPin, Phone, Mail, Clock, User, Calendar, Edit, X,
    List, ChevronLeft, ChevronRight, Instagram, Facebook, Music2
} from 'lucide-react';

const TABS = [
    { id: 'general', label: 'General Settings', icon: <Settings size={18} /> },
    { id: 'services', label: 'Services', icon: <Scissors size={18} /> },
    { id: 'pricing', label: 'Pricing', icon: <Tag size={18} /> },
    { id: 'team', label: 'Team', icon: <User size={18} /> },
    { id: 'gallery', label: 'Gallery', icon: <Image size={18} /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar size={18} /> },
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
    const navigate = useNavigate();

    // Data States
    const [siteSettings, setSiteSettings] = useState({});
    const [services, setServices] = useState([]);
    const [pricing, setPricing] = useState([]);
    const [stylists, setStylists] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [appointments, setAppointments] = useState([]);

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
                { data: gly }
            ] = await Promise.all([
                supabase.from('site_settings').select('*'),
                supabase.from('services_overview').select('*'),
                supabase.from('price_list').select('*').order('sort_order'),
                supabase.from('stylist_calendars').select('*'),
                supabase.from('gallery_images').select('*').order('sort_order')
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

        } catch (err) {
            console.error('Error fetching data:', err.message);
            setMessage({ type: 'error', text: 'Error loading data. Make sure tables exist.' });
        } finally {
            setLoading(false);
        }
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
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10  rounded-lg flex items-center justify-center" style={{ backgroundColor: "#3D2B1F" }}>
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
                            onClick={() => setActiveTab(tab.id)}
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
                        data={{ siteSettings, services, pricing, stylists, gallery, appointments }}
                        setData={{ setSiteSettings, setServices, setPricing, setStylists, setGallery, setAppointments }}
                        refresh={fetchAllData}
                        showMessage={showMessage}
                    />
                </div>
            </main>
        </div>
    );
};

const TabContent = ({ activeTab, data, setData, refresh, showMessage }) => {
    switch (activeTab) {
        case 'general': return <GeneralTab settings={data.siteSettings} setSettings={setData.setSiteSettings} showMessage={showMessage} />;
        case 'services': return <ServicesTab services={data.services} refresh={refresh} showMessage={showMessage} />;
        case 'pricing': return <PricingTab pricing={data.pricing} refresh={refresh} showMessage={showMessage} />;
        case 'team': return <TeamTab stylists={data.stylists} refresh={refresh} showMessage={showMessage} />;
        case 'gallery': return <GalleryTab gallery={data.gallery} refresh={refresh} showMessage={showMessage} />;
        case 'appointments': return <AppointmentsTab appointments={data.appointments} setAppointments={setData.setAppointments} showMessage={showMessage} />;
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
                                    style={selectedSlots[day][hourIdx] ? { backgroundColor: '#3D2B1F' } : {}}
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
                style={{ backgroundColor: '#3D2B1F' }}
            >
                Set Opening Hours
            </button>
        </div>
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
        } catch (err) {
            showMessage('error', err.message);
        }
    };

    const handleSaveOpeningHours = async (formattedHours) => {
        await handleSave('opening_hours', formattedHours);
        setSettings({ ...settings, opening_hours: formattedHours });
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">General Settings</h2>
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
                                className="px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-opacity-90 transition-all" style={{ backgroundColor: "#3D2B1F" }}
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

const AppointmentsTab = ({ appointments, setAppointments, showMessage }) => {
    const [loading, setLoading] = useState(false);
    const [editingAppt, setEditingAppt] = useState(null);
    const [filterStylist, setFilterStylist] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/appointments/list');
            const data = await response.json();
            if (data.appointments) {
                setAppointments(data.appointments);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            showMessage('error', 'Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (appt) => {
        if (!confirm(`Delete appointment for ${appt.customer.name}?`)) return;

        try {
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
        } catch (err) {
            showMessage('error', 'Failed to delete appointment');
        }
    };

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

    const stylists = [...new Set(appointments.map(a => a.stylist))];

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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Appointments</h2>
                <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1 flex-1 sm:flex-none">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center justify-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-md transition-all text-xs md:text-sm flex-1 sm:flex-none ${viewMode === 'list'
                                ? 'bg-white text-stone-800 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <List size={16} />
                            <span className="hidden sm:inline">List</span>
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`flex items-center justify-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-md transition-all text-xs md:text-sm flex-1 sm:flex-none ${viewMode === 'calendar'
                                ? 'bg-white text-stone-800 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Calendar size={16} />
                            <span className="hidden sm:inline">Calendar</span>
                        </button>
                    </div>
                    <button
                        onClick={fetchAppointments}
                        className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 text-white rounded-lg transition-all text-xs md:text-sm"
                        style={{ backgroundColor: "#3D2B1F" }}
                        disabled={loading}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 mb-4 md:mb-6 space-y-3 md:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Filter by Stylist</label>
                        <select
                            value={filterStylist}
                            onChange={(e) => setFilterStylist(e.target.value)}
                            className="w-full px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none"
                        >
                            <option value="all">All Stylists</option>
                            {stylists.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Search Customer</label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Name or email..."
                            className="w-full px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Appointments List or Calendar */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={40} className="animate-spin text-stone-800" />
                </div>
            ) : filteredAppointments.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No appointments found</p>
                </div>
            ) : viewMode === 'calendar' ? (
                <CalendarView
                    appointments={filteredAppointments}
                    onEditAppointment={setEditingAppt}
                    onDeleteAppointment={handleDelete}
                />
            ) : (
                <div className="space-y-4">
                    {filteredAppointments.map(appt => (
                        <div key={appt.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-gray-500" />
                                            <span className="font-semibold text-gray-900">{formatDateTime(appt.startTime)}</span>
                                        </div>
                                        {isToday(appt.startTime) && (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Today</span>
                                        )}
                                        {isPast(appt.startTime) && !isToday(appt.startTime) && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">Past</span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Customer</p>
                                            <p className="font-medium text-gray-900">{appt.customer.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Mail size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-600">{appt.customer.email}</span>
                                            </div>
                                            {appt.customer.phone && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Phone size={14} className="text-gray-400" />
                                                    <span className="text-sm text-gray-600">{appt.customer.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Service & Stylist</p>
                                            <p className="font-medium text-gray-900">{appt.customer.service}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <User size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-600">{appt.stylist}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => setEditingAppt(appt)}
                                        className="p-2 text-stone-800 hover:bg-stone-100 rounded-lg transition-all"
                                        title="Edit"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(appt)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingAppt && (
                <EditAppointmentModal
                    appointment={editingAppt}
                    onClose={() => setEditingAppt(null)}
                    onSave={handleUpdate}
                />
            )}
        </motion.div>
    );
};


const CalendarView = ({ appointments, onEditAppointment, onDeleteAppointment }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarViewMode, setCalendarViewMode] = useState('week'); // 'month', 'week', 'day'

    // Helper functions
    const getWeekDays = (date) => {
        const day = date.getDay();
        const diff = date.getDate() - day; // Get Monday
        const monday = new Date(date);
        monday.setDate(diff);

        const week = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
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
                    const dayAppointments = getAppointmentsForDay(date);
                    const isTodayDate = isToday(date);

                    return (
                        <div
                            key={index}
                            className={`min-h-[80px] sm:min-h-[100px] md:min-h-[120px] border rounded-md md:rounded-lg p-1 md:p-2 ${!date ? 'bg-gray-50' : isTodayDate ? 'bg-amber-50 border-amber-300' : 'bg-white border-gray-200'
                                }`}
                        >
                            {date && (
                                <>
                                    <div className={`text-xs md:text-sm font-medium mb-1 md:mb-2 ${isTodayDate ? 'text-amber-900' : 'text-gray-700'
                                        }`}>
                                        {date.getDate()}
                                    </div>
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
                                                    onClick={() => onEditAppointment(appt)}
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

        return (
            <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                    {/* Header */}
                    <div className="grid grid-cols-8 gap-1 mb-2">
                        <div className="text-xs font-medium text-gray-600 p-2">Time</div>
                        {week.map((date, i) => {
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
                            <div key={hour} className="grid grid-cols-8 gap-1">
                                <div className="text-xs text-gray-600 p-2 font-medium">
                                    {hour}:00
                                </div>
                                {week.map((date, i) => {
                                    const slotAppts = getAppointmentsForTimeSlot(date, hour);
                                    const isTodayDate = isToday(date);

                                    return (
                                        <div key={i} className={`min-h-[60px] border rounded p-1 ${isTodayDate ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'
                                            }`}>
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
                                                        onClick={() => onEditAppointment(appt)}
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
        const dayAppts = getAppointmentsForDay(currentDate);
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
                                <div className="w-20 text-sm text-gray-600 font-medium pt-2">
                                    {hour}:00
                                </div>
                                <div className={`flex-1 min-h-[60px] border rounded-lg p-2 ${isTodayDate ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'
                                    }`}>
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
                                                onClick={() => onEditAppointment(appt)}
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
                {Object.entries(STYLIST_COLORS).filter(([key]) => key !== 'default').map(([stylist, colorClass]) => (
                    <div key={stylist} className="flex items-center gap-1 md:gap-2">
                        <div className={`w-3 h-3 md:w-4 md:h-4 rounded border ${colorClass}`}></div>
                        <span className="text-xs md:text-sm text-gray-700">{stylist}</span>
                    </div>
                ))}
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
    const [isSaving, setIsSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (settings.email_template) {
            setTemplate(settings.email_template);
        } else {
            setTemplate(DEFAULT_EMAIL_TEMPLATE.trim());
        }
    }, [settings.email_template]);

    const handleSave = async (content = template) => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('site_settings')
                .upsert({ key: 'email_template', value: content });
            if (error) throw error;
            showMessage('success', 'Email template updated!');
            refresh();
        } catch (err) {
            showMessage('error', err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const resetToDefault = async () => {
        if (confirm('Reset to default template? This will overwrite your current changes and save to the database.')) {
            const content = DEFAULT_EMAIL_TEMPLATE.trim();
            setTemplate(content);
            await handleSave(content);
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
                <h2 className="text-2xl font-semibold text-gray-900">Email Settings</h2>
                <div className="flex gap-3">
                    <button
                        onClick={resetToDefault}
                        className="px-4 py-2 text-stone-600 hover:text-stone-800 text-sm font-medium transition-colors"
                    >
                        Reset to Default
                    </button>
                    <button
                        onClick={() => handleSave()}
                        disabled={isSaving}
                        className="px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-900 flex items-center gap-2 transition-all disabled:opacity-50"
                        style={{ backgroundColor: "#3D2B1F" }}
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Template
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Editor Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                    {showPreview ? 'Live Preview' : 'HTML Editor'}
                                </span>
                            </div>
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className="text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 px-3 py-1 rounded-full transition-all"
                            >
                                {showPreview ? 'Edit HTML' : 'Show Preview'}
                            </button>
                        </div>

                        {showPreview ? (
                            <div className="h-[500px] overflow-y-auto p-8 bg-gray-50 flex items-start justify-center">
                                <div
                                    className="bg-white shadow-lg rounded-xl overflow-hidden w-full max-w-[600px]"
                                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                                />
                            </div>
                        ) : (
                            <textarea
                                value={template}
                                onChange={(e) => setTemplate(e.target.value)}
                                placeholder="Paste your HTML template here..."
                                className="w-full h-[500px] p-4 font-mono text-sm focus:ring-0 border-none outline-none resize-none"
                                spellCheck="false"
                            />
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
                            Copy and paste these tags into your template. They will be automatically replaced with booking details.
                        </p>
                        <div className="space-y-3">
                            {EMAIL_VARIABLES.map(v => (
                                <div key={v.tag} className="flex flex-col gap-1">
                                    <code className="text-[11px] bg-stone-100 text-stone-800 px-2 py-1 rounded inline-block w-fit font-bold">
                                        {v.tag}
                                    </code>
                                    <span className="text-[10px] text-gray-500 ml-1">{v.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
                        <h3 className="text-sm font-bold text-amber-900 mb-2">Pro Tip</h3>
                        <p className="text-xs text-amber-800 leading-relaxed">
                            You can use standard HTML tags like <code>&lt;b&gt;</code>, <code>&lt;hr&gt;</code>, or <code>&lt;img&gt;</code> to style your confirmation emails. Make sure all styles are inline for maximum compatibility across email clients!
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
