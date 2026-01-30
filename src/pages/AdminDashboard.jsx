import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, LogOut, Check, Calendar, User, Info, Loader2 } from 'lucide-react';

const AdminDashboard = () => {
    const [stylists, setStylists] = useState([
        { name: 'Jo', calendar_id: '' },
        { name: 'Viktor', calendar_id: '' },
        { name: 'Nisha', calendar_id: '' }
    ]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchMappings();
    }, []);

    const fetchMappings = async () => {
        try {
            const { data, error } = await supabase
                .from('stylist_calendars')
                .select('*');

            if (error) throw error;

            if (data && data.length > 0) {
                const updatedStylists = stylists.map(s => {
                    const match = data.find(d => d.stylist_name === s.name);
                    return match ? { ...s, calendar_id: match.calendar_id } : s;
                });
                setStylists(updatedStylists);
            }
        } catch (err) {
            console.error('Error fetching mappings:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleIdChange = (name, newId) => {
        setStylists(prev => prev.map(s =>
            s.name === name ? { ...s, calendar_id: newId } : s
        ));
    };

    const handleSave = async (stylist) => {
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const { error } = await supabase
                .from('stylist_calendars')
                .upsert(
                    { stylist_name: stylist.name, calendar_id: stylist.calendar_id },
                    { onConflict: 'stylist_name' }
                );

            if (error) throw error;

            setMessage({ type: 'success', text: `Calendar for ${stylist.name} updated successfully!` });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: `Error: ${err.message}` });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="text-white/20"
                >
                    <Loader2 size={40} />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-light tracking-widest text-white">DASHBOARD</h1>
                        <p className="text-white/40 font-light mt-2 italic">Calendar & Stylist Management</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm uppercase tracking-widest border border-white/10 px-4 py-2 rounded-full"
                    >
                        <LogOut size={16} />
                        Log Out
                    </button>
                </header>

                <AnimatePresence>
                    {message.text && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`mb-8 p-4 rounded-xl border flex items-center gap-3 ${message.type === 'success'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                                }`}
                        >
                            {message.type === 'success' ? <Check size={18} /> : <Info size={18} />}
                            {message.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                <section className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                        <h2 className="text-lg font-light tracking-widest mb-8 flex items-center gap-3">
                            <Calendar className="text-white/40" size={20} />
                            STYLIST CALENDAR MAPPINGS
                        </h2>

                        <div className="grid gap-6">
                            {stylists.map((stylist) => (
                                <div
                                    key={stylist.name}
                                    className="bg-white/5 border border-white/5 rounded-xl p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 transition-all hover:border-white/20"
                                >
                                    <div className="flex items-center gap-4 min-w-[120px]">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60">
                                            <User size={20} />
                                        </div>
                                        <span className="font-medium tracking-wide">{stylist.name}</span>
                                    </div>

                                    <div className="flex-grow">
                                        <input
                                            type="text"
                                            value={stylist.calendar_id}
                                            onChange={(e) => handleIdChange(stylist.name, e.target.value)}
                                            placeholder="Google Calendar ID (e.g. gmail address or long ID)"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-sm font-light text-white/80 focus:outline-none focus:border-white/30 transition-colors"
                                        />
                                    </div>

                                    <button
                                        onClick={() => handleSave(stylist)}
                                        disabled={saving}
                                        className="bg-white text-black text-xs font-bold tracking-widest py-3 px-6 rounded-lg hover:bg-white/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                    >
                                        <Save size={16} />
                                        SAVE
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                        <div className="flex items-start gap-4">
                            <Info className="text-white/40 shrink-0 mt-1" size={20} />
                            <div className="text-sm font-light leading-relaxed text-white/50">
                                <p className="mb-2 uppercase tracking-widest text-white/70">Instruction Notice</p>
                                <p>
                                    Ensure each stylist's Google Calendar is shared with the 938 Salon service account email
                                    found in your Google Cloud project settings. The service account must have "Make changes to events"
                                    permissions for everything to function correctly.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
