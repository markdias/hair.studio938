import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, LogOut, Check, Calendar, User, Info, Loader2,
    Settings, Scissors, Tag, Image, Plus, Trash2, ChevronRight,
    MapPin, Phone, Mail, Clock
} from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    // Data States
    const [siteSettings, setSiteSettings] = useState({});
    const [services, setServices] = useState([]);
    const [pricing, setPricing] = useState([]);
    const [stylists, setStylists] = useState([]);
    const [gallery, setGallery] = useState([]);

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

            // Transform settings array to object
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
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="text-white/20">
                    <Loader2 size={40} />
                </motion.div>
            </div>
        );
    }

    const tabs = [
        { id: 'general', label: 'General', icon: <Settings size={18} /> },
        { id: 'services', label: 'Services', icon: <Scissors size={18} /> },
        { id: 'pricing', label: 'Pricing', icon: <Tag size={18} /> },
        { id: 'team', label: 'Team', icon: <User size={18} /> },
        { id: 'gallery', label: 'Gallery', icon: <Image size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white/5 border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col">
                <div className="mb-12">
                    <h1 className="text-2xl font-light tracking-widest text-white">ADMIN</h1>
                    <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] mt-1">Salon Management</p>
                </div>

                <nav className="flex-grow space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm tracking-wide ${activeTab === tab.id
                                ? 'bg-white text-black font-semibold'
                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    className="mt-12 flex items-center gap-2 text-white/30 hover:text-white transition-colors text-xs uppercase tracking-widest"
                >
                    <LogOut size={14} />
                    Sign Out
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-6 md:p-12 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">
                        {message.text && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`mb-8 p-4 rounded-xl border flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                                    }`}
                            >
                                {message.type === 'success' ? <Check size={18} /> : <Info size={18} />}
                                {message.text}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <TabContent
                        activeTab={activeTab}
                        data={{ siteSettings, services, pricing, stylists, gallery }}
                        setData={{ setSiteSettings, setServices, setPricing, setStylists, setGallery }}
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
        default: return null;
    }
};

// --- Sub-components for Tabs ---

const GeneralTab = ({ settings, setSettings, showMessage }) => {
    const fields = [
        { key: 'hero_title', label: 'Hero Title', icon: <Info size={16} /> },
        { id: 'hero_p', key: 'hero_subtitle', label: 'Hero Subtitle', icon: <Info size={16} /> },
        { key: 'phone', label: 'Phone Number', icon: <Phone size={16} /> },
        { key: 'whatsapp', label: 'WhatsApp Number', icon: <Mail size={16} /> },
        { key: 'email', label: 'Email Address', icon: <Mail size={16} /> },
        { key: 'address', label: 'Salon Address', icon: <MapPin size={16} /> },
        { key: 'opening_hours', label: 'Opening Hours', icon: <Clock size={16} /> },
    ];

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

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-light mb-8 italic">General Settings</h2>
            <div className="grid gap-6">
                {fields.map(field => (
                    <div key={field.key} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 mb-3 block flex items-center gap-2">
                            {field.icon}
                            {field.label}
                        </label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={settings[field.key] || ''}
                                onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                                className="flex-grow bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white/80 focus:outline-none focus:border-white/30"
                            />
                            <button
                                onClick={() => handleSave(field.key, settings[field.key])}
                                className="bg-white/10 hover:bg-white/20 px-4 rounded-lg transition-colors"
                            >
                                <Save size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const ServicesTab = ({ services, refresh, showMessage }) => {
    const [localServices, setLocalServices] = useState(services);

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

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-light mb-8 italic">Service Cards</h2>
            <div className="grid gap-6">
                {localServices.map((s, idx) => (
                    <div key={s.id || idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <input
                            placeholder="Service Title"
                            value={s.title}
                            onChange={(e) => handleFieldChange(idx, 'title', e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-lg font-medium"
                        />
                        <textarea
                            placeholder="Description"
                            value={s.description || s.desc || ''}
                            onChange={(e) => handleFieldChange(idx, 'description', e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white/60 h-24"
                        />
                        <button onClick={() => handleSave(s)} className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                            <Save size={18} /> SAVE CHANGES
                        </button>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const PricingTab = ({ pricing, refresh, showMessage }) => {
    const [newItem, setNewItem] = useState({ category: 'CUT & STYLING', item_name: '', price: '' });

    const handleAdd = async () => {
        try {
            const { error } = await supabase.from('price_list').insert([newItem]);
            if (error) throw error;
            setNewItem({ ...newItem, item_name: '', price: '' });
            refresh();
            showMessage('success', 'Added to price list');
        } catch (err) { showMessage('error', err.message); }
    };

    const handleDelete = async (id) => {
        try {
            await supabase.from('price_list').delete().eq('id', id);
            refresh();
            showMessage('success', 'Item removed');
        } catch (err) { showMessage('error', err.message); }
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-light mb-8 italic">Price List Management</h2>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-12">
                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-6 font-bold">Add New Entry</h3>
                <div className="flex flex-wrap gap-4">
                    <select
                        value={newItem.category}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        className="bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white/80 outline-none"
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
                        className="flex-grow min-w-[200px] bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white/80"
                    />
                    <input
                        placeholder="Price (e.g. £50)"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                        className="w-24 bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white/80"
                    />
                    <button onClick={handleAdd} className="bg-white text-black p-3 rounded-lg"><Plus size={24} /></button>
                </div>
            </div>

            <div className="space-y-4">
                {pricing.map((item) => (
                    <div key={item.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between group">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/30 uppercase tracking-widest mb-1">{item.category}</span>
                            <span className="font-light">{item.item_name} — <span className="text-white/80 font-semibold">{item.price}</span></span>
                        </div>
                        <button onClick={() => handleDelete(item.id)} className="text-white/20 hover:text-red-500 transition-colors p-2">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const TeamTab = ({ stylists, refresh, showMessage }) => {
    const [localStylists, setLocalStylists] = useState(stylists);

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

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-light mb-8 italic">Team & Calendars</h2>
            <div className="grid gap-6">
                {localStylists.map((s, idx) => (
                    <div key={s.id || idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
                                <img src={s.image_url || '/placeholder.png'} alt={s.stylist_name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-grow">
                                <input
                                    value={s.stylist_name}
                                    onChange={(e) => handleFieldChange(idx, 'stylist_name', e.target.value)}
                                    className="text-xl font-medium bg-transparent border-none focus:ring-0 w-full p-0"
                                />
                                <input
                                    value={s.role || ''}
                                    placeholder="Role (e.g. Master Stylist)"
                                    onChange={(e) => handleFieldChange(idx, 'role', e.target.value)}
                                    className="text-white/40 text-sm italic bg-transparent border-none focus:ring-0 w-full p-0 mt-1"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Photo URL</label>
                                <input
                                    value={s.image_url || ''}
                                    onChange={(e) => handleFieldChange(idx, 'image_url', e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-4"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Calendar ID</label>
                                <input
                                    value={s.calendar_id || ''}
                                    onChange={(e) => handleFieldChange(idx, 'calendar_id', e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-4"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">Bio</label>
                                <textarea
                                    value={s.description || ''}
                                    onChange={(e) => handleFieldChange(idx, 'description', e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-4 h-24"
                                />
                            </div>
                        </div>

                        <button onClick={() => handleSave(s)} className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                            <Save size={18} /> UPDATE PROFILE
                        </button>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const GalleryTab = ({ gallery, refresh, showMessage }) => {
    const [newUrl, setNewUrl] = useState('');

    const handleAdd = async () => {
        try {
            await supabase.from('gallery_images').insert([{ image_url: newUrl, sort_order: gallery.length }]);
            setNewUrl('');
            refresh();
            showMessage('success', 'Image added to gallery');
        } catch (err) { showMessage('error', err.message); }
    };

    const handleDelete = async (id) => {
        try {
            await supabase.from('gallery_images').delete().eq('id', id);
            refresh();
            showMessage('success', 'Image removed');
        } catch (err) { showMessage('error', err.message); }
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-light mb-8 italic">Gallery Carousel</h2>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-12">
                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-6 font-bold">Add Image URL</h3>
                <div className="flex gap-4">
                    <input
                        placeholder="https://images.unsplash.com/..."
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        className="flex-grow bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white/80"
                    />
                    <button onClick={handleAdd} className="bg-white text-black p-3 rounded-lg"><Plus size={24} /></button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {gallery.map((img) => (
                    <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10">
                        <img src={img.image_url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={() => handleDelete(img.id)} className="bg-red-500 text-white p-3 rounded-full hover:scale-110 transition-transform">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
