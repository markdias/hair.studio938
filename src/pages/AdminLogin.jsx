import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [businessName, setBusinessName] = useState('938 Management Dashboard');

    useEffect(() => {
        const fetchBusinessName = async () => {
            try {
                const { data, error } = await supabase
                    .from('site_settings')
                    .select('value')
                    .eq('key', 'business_name')
                    .single();

                if (data && !error) {
                    setBusinessName(data.value);
                }
            } catch (err) {
                console.error('Error fetching business name:', err);
            }
        };
        fetchBusinessName();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--secondary)] flex items-center justify-center p-4 transition-colors duration-500">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white border border-[var(--primary)]/10 rounded-2xl p-8 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-light text-[var(--text-main)] mb-2 tracking-widest uppercase" style={{ fontFamily: 'var(--font-heading)' }}>ADMIN PORTAL</h1>
                    <p className="text-[var(--text-main)]/40 font-light italic">{businessName}</p>
                    <div className="w-12 h-0.5 bg-[var(--primary)]/20 mx-auto mt-4"></div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-600 text-sm"
                    >
                        <AlertCircle size={18} />
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-[var(--text-main)]/60 ml-1 font-semibold">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]/30" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-10 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]/30 transition-all"
                                placeholder="admin@studio938.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-[var(--text-main)]/60 ml-1 font-semibold">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary)]/30" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-10 text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]/30 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl font-bold tracking-widest text-sm uppercase transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
                        style={{
                            backgroundColor: 'var(--primary)',
                            color: 'var(--accent)'
                        }}
                    >
                        {loading ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            >
                                <Loader2 size={20} />
                            </motion.div>
                        ) : (
                            'SIGN IN'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-[var(--text-main)]/40 text-xs font-medium hover:text-[var(--primary)] transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        <span>&larr;</span> Back to Website
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
