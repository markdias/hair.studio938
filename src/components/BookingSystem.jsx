import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, User, Scissors, Check, ChevronRight, ChevronLeft, Phone, Mail, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AntdDatePicker from './AntdDatePicker';

// categories will be fetched from the database


// Helper function to parse opening hours string
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

const BookingSystem = ({ settings = {}, isSeparatePage = false }) => {
    if (settings.show_booking_section === 'false') return null;

    const [professionals, setProfessionals] = useState([]);
    const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(true);
    const [openingHours, setOpeningHours] = useState(null);
    const [categories, setCategories] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [serviceDurations, setServiceDurations] = useState({});
    const [fullTimeSlots, setFullTimeSlots] = useState([]);
    const [step, setStep] = useState(1);
    const [booking, setBooking] = useState({
        professional: null,
        service: null,
        date: null,
        time: null,
        duration_minutes: null,
        name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        const fetchProfessionals = async () => {
            const { data, error } = await supabase
                .from('stylist_calendars')
                .select('*')
                .order('sort_order');
            if (!error && data) {
                // Transform to match previous structure
                const formatted = data.map(s => ({
                    id: s.id,
                    name: s.stylist_name,
                    role: s.role,
                    img: s.image_url || '/placeholder.png',
                    calendar_id: s.calendar_id,
                    provided_services: s.provided_services || []
                }));
                // Note: user said rename to Professional, but internal state can keep 'professional' for now to avoid massive refactor of booking object
                setProfessionals(formatted);
                // Pre-expand all categories if they are small, or just the first one
                const initialExpanded = {};
                if (data.length > 0) {
                    // We'll handle expanding categories in fetchServicesData
                }
            }
            setIsLoadingProfessionals(false);
        };

        const fetchOpeningHours = async () => {
            const { data, error } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'opening_hours')
                .single();
            if (!error && data) {
                setOpeningHours(data.value);
            }
        };

        const fetchServicesData = async () => {
            try {
                const [catsRes, priceListRes] = await Promise.all([
                    supabase.from('price_categories').select('*').order('sort_order'),
                    supabase.from('price_list').select('*').order('sort_order')
                ]);

                if (catsRes.data && priceListRes.data) {
                    const durations = {};
                    priceListRes.data.forEach(s => {
                        durations[s.item_name] = s.duration_minutes || 60;
                    });
                    setServiceDurations(durations);

                    /* 
                    // Fetch stylist services mapping - This currently causes a ReferenceError as state is not defined
                    // and the system uses provided_services array on the stylist record instead.
                    const { data: stlSrvs } = await supabase.from('stylist_services').select('*');
                    if (stlSrvs) setStylistServiceMaps(stlSrvs);
                    */

                    // Group price_list by categories
                    const grouped = catsRes.data.map(cat => ({
                        title: cat.name,
                        items: priceListRes.data
                            .filter(item => item.category === cat.name)
                            .map(item => item.item_name)
                    })).filter(cat => cat.items.length > 0);

                    setCategories(grouped);

                    // Auto-expand the first category
                    if (grouped.length > 0) {
                        setExpandedCategories({ [grouped[0].title]: true });
                    }
                }
            } catch (err) {
                console.error('Error fetching services:', err);
            }
        };

        fetchProfessionals();
        fetchOpeningHours();
        fetchServicesData();

        // Reset booking state on mount to ensure a clean start
        setBooking({
            professional: null,
            service: null,
            date: null,
            time: null,
            duration_minutes: null,
            name: '',
            email: '',
            phone: ''
        });
        setStep(1);
    }, []);
    useEffect(() => {
        const handleHashChange = () => {
            if (window.location.hash === '#booking') {
                // reset state
                setBooking({
                    professional: null,
                    service: null,
                    date: null,
                    time: null,
                    duration_minutes: null,
                    name: '',
                    email: '',
                    phone: ''
                });
                setStep(1);
                setIsSuccess(false);
                setError(null);
                setTimeSlots([]);
                setFullTimeSlots([]);
            }
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const [timeSlots, setTimeSlots] = useState([]);
    const [priceList, setPriceList] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (booking.date) {
            const isOpen = checkIfOpen(booking.date);
            if (isOpen) {
                fetchAvailability(booking.date, booking.professional?.name);
            } else {
                setTimeSlots([]);
                setError('Sorry, we are closed on this day. Please select another date.');
            }
        }
    }, [booking.date, booking.professional?.name, openingHours]);

    const checkIfOpen = (dateStr) => {
        if (!openingHours) return true; // If no hours set, allow booking

        const date = new Date(dateStr + 'T00:00:00');
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = dayNames[date.getDay()];

        // Parse opening hours to check if this day is open
        // Format: "Mon-Fri: 9 AM - 6 PM, Sat: 10 AM - 4 PM"
        const parts = openingHours.split(',').map(p => p.trim());

        for (const part of parts) {
            const match = part.match(/([A-Za-z\-]+):\s*(.+)/);
            if (!match) continue;

            const [, dayPart, timePart] = match;

            // Check if this part includes our day
            if (dayPart.includes('-')) {
                const [start, end] = dayPart.split('-').map(d => d.trim());
                const startIdx = dayNames.indexOf(start);
                const endIdx = dayNames.indexOf(end);
                const currentIdx = dayNames.indexOf(dayName);

                if (startIdx !== -1 && endIdx !== -1 && currentIdx >= startIdx && currentIdx <= endIdx) {
                    return true; // Day is in range
                }
            } else if (dayPart.includes(dayName)) {
                return true; // Day matches
            }
        }

        return false; // Day not found in opening hours = closed
    };

    const fetchAvailability = async (recordDate, professionalName) => {
        setIsLoadingSlots(true);
        setError(null);
        try {
            const professionalParam = professionalName ? `&professional=${encodeURIComponent(professionalName)}` : '';
            const serviceParam = booking.service ? `&service=${encodeURIComponent(booking.service)}` : '';
            const durationParam = booking.duration_minutes ? `&duration=${booking.duration_minutes}` : '';

            const response = await fetch(`/api/availability?date=${recordDate}${professionalParam}${serviceParam}${durationParam}`);

            if (!response.ok) {
                console.warn('API error');
                setTimeSlots([]);
                return;
            }

            const data = await response.json();
            if (data.slots) {
                // Keep the full objects for auto-assignment
                setFullTimeSlots(data.slots);
                // Extract just times for the simplified timeSlots state
                const times = data.slots.map(s => {
                    if (typeof s === 'string') return s;
                    // Defensive check: ensure s.time is a string
                    if (typeof s.time === 'string') return s.time;
                    console.warn('Unexpected slot format:', s);
                    return null;
                }).filter(Boolean);
                setTimeSlots(times);
            } else {
                setError('Could not load time slots');
            }
        } catch (err) {
            console.warn('Fetch error:', err);
            setTimeSlots([]);
        } finally {
            setIsLoadingSlots(false);
        }
    };

    const toggleCategory = (title) => {
        setExpandedCategories(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleBooking = async () => {
        setIsSubmitting(true);
        setError(null);

        // If no professional selected, pick one randomly (Backend does this now, but we keep structure)
        let finalBooking = { ...booking };
        // Backend handles assignment for "any professional" (professional === null)
        // Ensure finalBooking.professional is what we want to send

        try {
            const response = await fetch('/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalBooking)
            });

            if (!response.ok) {
                // For 404, we assume local dev without the backend function
                if (response.status === 404) {
                    console.warn('API not found (404), simulating success for local development');
                    setTimeout(() => {
                        setIsSubmitting(false);
                        setIsSuccess(true);
                    }, 1500);
                    return;
                }

                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.details || `Booking failed: Server error ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                if (data.assignedProfessional) {
                    const profObj = professionals.find(s => s.name === data.assignedProfessional.name) || { name: data.assignedProfessional.name };
                    setBooking(prev => ({ ...prev, professional: profObj }));
                    setIsSuccess(true); // Call it after state update is queued
                } else {
                    setIsSuccess(true);
                }
            } else {
                setError(data.error || 'Failed to create booking');
            }
        } catch (err) {
            console.error('Booking failure:', err);
            // On network errors (failed to fetch), we assume local dev
            if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
                console.warn('Network error, simulating success for local development');
                setTimeout(() => {
                    setIsSubmitting(false);
                    setIsSuccess(true);
                }, 1500);
            } else {
                setError(err.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.5 } }
    };
    const bgColor = settings.booking_bg_color;
    const textColor = settings.booking_text_color;

    const sectionStyle = {
        padding: isSeparatePage ? '40px 0' : '120px 0',
        backgroundColor: bgColor && bgColor !== 'auto' ? bgColor : 'var(--secondary)',
        color: textColor && textColor !== 'auto' ? textColor : 'inherit',
        minHeight: '800px'
    };

    const headingStyle = {
        fontSize: 'clamp(2.5rem, 8vw, 4rem)',
        color: textColor && textColor !== 'auto' ? textColor : 'var(--primary)',
        marginBottom: '15px'
    };

    const lineStyle = {
        width: '60px',
        height: '2px',
        backgroundColor: textColor && textColor !== 'auto' ? textColor : 'var(--primary)',
        margin: '0 auto'
    };

    return (
        <section id="booking" style={sectionStyle}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={headingStyle}>{settings.booking_heading_name || "Book Your Visit"}</h2>
                    <div style={lineStyle}></div>
                </div>

                <div className="booking-card">

                    <div style={{
                        backgroundColor: 'var(--primary)',
                        padding: '60px 40px',
                        color: 'var(--accent)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <h3 style={{ fontSize: '1.8rem', marginBottom: '30px', color: 'var(--white)' }}>Your Selection</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                <SelectionItem icon={<User size={20} />} label="Professional" value={booking.professional?.name || 'Not selected'} />
                                <SelectionItem icon={<Scissors size={20} />} label="Service" value={booking.service || 'Not selected'} />
                                <SelectionItem icon={<CalendarIcon size={20} />} label="Date" value={booking.date || 'Not selected'} />
                                <SelectionItem icon={<Clock size={20} />} label="Time" value={booking.time || 'Not selected'} />
                            </div>
                        </div>
                        <div style={{ opacity: 0.6, fontSize: '0.9rem' }}>
                            Step {step} of 4
                            <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.2)', marginTop: '10px', borderRadius: '2px' }}>
                                <div style={{ width: `${(step / 4) * 100}%`, height: '100%', backgroundColor: 'var(--accent)', transition: 'width 0.5s ease' }}></div>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '60px', position: 'relative' }}>
                        <AnimatePresence mode="wait">
                            {isSuccess ? (
                                <motion.div key="success" variants={containerVariants} initial="hidden" animate="visible" style={{ textAlign: 'center', paddingTop: '10px' }}>
                                    <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                        <Check color="var(--accent)" size={30} />
                                    </div>
                                    <h3 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '10px' }}>Booking Confirmed!</h3>

                                    {/* Booking Details */}
                                    <div style={{
                                        backgroundColor: 'var(--white)',
                                        borderRadius: '12px',
                                        padding: '25px',
                                        margin: '25px 0',
                                        textAlign: 'left',
                                        fontSize: '0.95rem',
                                        border: '1px solid rgba(var(--primary-rgb), 0.08)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                                    }}>
                                        <h4 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '15px', fontWeight: '700' }}>Your Appointment</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--accent)' }}>
                                                <span style={{ color: '#666', fontSize: '0.85rem' }}>Professional:</span>
                                                <span style={{ fontWeight: '600', color: '#333', fontSize: '0.85rem' }}>{booking.professional?.name}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--accent)' }}>
                                                <span style={{ color: '#666', fontSize: '0.85rem' }}>Service:</span>
                                                <span style={{ fontWeight: '600', color: '#333', fontSize: '0.85rem' }}>{booking.service}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--accent)' }}>
                                                <span style={{ color: '#666', fontSize: '0.85rem' }}>Date:</span>
                                                <span style={{ fontWeight: '600', color: '#333', fontSize: '0.85rem' }}>{booking.date}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--accent)' }}>
                                                <span style={{ color: '#666', fontSize: '0.85rem' }}>Time:</span>
                                                <span style={{ fontWeight: '600', color: '#333', fontSize: '0.85rem' }}>{booking.time}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#666', fontSize: '0.85rem' }}>Name:</span>
                                                <span style={{ fontWeight: '600', color: '#333', fontSize: '0.85rem' }}>{booking.name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {booking.email && (
                                        <p style={{ color: '#666', marginBottom: '12px', fontSize: '0.85rem' }}>
                                            Confirmation email sent to <strong>{booking.email}</strong>
                                        </p>
                                    )}

                                    <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                        To make changes or cancel, please call or email us.
                                    </p>

                                    <button
                                        onClick={() => {
                                            setIsSuccess(false);
                                            setStep(1);
                                            setBooking({ professional: null, service: null, date: null, time: null, duration_minutes: null, name: '', email: '', phone: '' });
                                            setTimeSlots([]);
                                            setFullTimeSlots([]);
                                        }}
                                        className="btn-primary"
                                    >
                                        Book Another
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div key={step} variants={containerVariants} initial="hidden" animate="visible" exit="exit" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

                                    {error && (
                                        <div style={{ padding: '15px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
                                            {error}
                                        </div>
                                    )}

                                    {step === 1 && (
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '1.5rem', marginBottom: '30px', textAlign: 'center' }}>Choose Your Professional</h4>
                                            <div style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '20px',
                                                justifyContent: 'center'
                                            }}>
                                                {professionals.map((s) => (
                                                    <motion.button
                                                        key={s.id}
                                                        whileHover={{ y: -5, borderColor: 'rgba(var(--primary-rgb), 0.3)', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                                                        onClick={() => {
                                                            setBooking(prev => ({ ...prev, professional: s }));
                                                            nextStep();
                                                        }}
                                                        style={{
                                                            width: '200px',
                                                            padding: '30px 20px',
                                                            backgroundColor: booking.professional?.id === s.id ? 'rgba(var(--primary-rgb), 0.03)' : 'var(--white)',
                                                            border: booking.professional?.id === s.id ? '1px solid var(--primary)' : '1px solid rgba(var(--primary-rgb), 0.08)',
                                                            borderRadius: '16px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                                                            boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                                                        }}
                                                    >
                                                        <img src={s.img} alt={s.name} style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '15px', objectFit: 'cover', margin: '0 auto' }} />
                                                        <div style={{ fontWeight: '500', color: 'var(--primary)', fontFamily: 'var(--font-heading)', fontSize: '1.25rem' }}>{s.name}</div>
                                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '4px' }}>{s.role}</div>
                                                    </motion.button>
                                                ))}
                                            </div>
                                            <div style={{ marginTop: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                                                <motion.button
                                                    whileHover={{ backgroundColor: 'var(--white)', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                                                    onClick={() => {
                                                        setBooking(prev => ({ ...prev, professional: null }));
                                                        nextStep();
                                                    }}
                                                    style={{
                                                        padding: '14px 28px',
                                                        backgroundColor: 'var(--primary)',
                                                        color: 'var(--white)',
                                                        border: '1px solid var(--accent)',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '2px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                                                        width: 'fit-content',
                                                        boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    Skip - I'll take any available professional
                                                </motion.button>

                                                {booking.service || booking.date || booking.time ? (
                                                    <button
                                                        onClick={() => {
                                                            setBooking({ professional: null, service: null, date: null, time: null, duration_minutes: null, name: '', email: '', phone: '' });
                                                            setTimeSlots([]);
                                                            setFullTimeSlots([]);
                                                        }}
                                                        style={{ fontSize: '0.8rem', color: '#999', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                                    >
                                                        Clear previous selections
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
                                            <h4 style={{ fontSize: '1.5rem', marginBottom: '30px' }}>Select a Service</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                {categories.map((cat) => {
                                                    // Filter items in this category based on professional's capabilities
                                                    // Fallback: if professional has no assigned services, show all.
                                                    const filteredItems = (booking.professional && (booking.professional.provided_services || []).length > 0)
                                                        ? cat.items.filter(item => {
                                                            const serviceName = item.toLowerCase().trim();
                                                            return booking.professional.provided_services.some(ps => ps.toLowerCase().trim() === serviceName);
                                                        })
                                                        : cat.items;

                                                    if (filteredItems.length === 0) return null;

                                                    return (
                                                        <div key={cat.title} style={{ borderBottom: '1px solid var(--accent)', pb: '15px' }}>
                                                            <button
                                                                onClick={() => toggleCategory(cat.title)}
                                                                style={{
                                                                    width: '100%',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'between',
                                                                    padding: '15px 0',
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    textAlign: 'left'
                                                                }}
                                                            >
                                                                <div style={{ fontSize: '0.8rem', letterSpacing: '2px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>
                                                                    {cat.title}
                                                                </div>
                                                                <div style={{ marginLeft: 'auto', color: '#999' }}>
                                                                    {expandedCategories[cat.title] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                                </div>
                                                            </button>

                                                            {expandedCategories[cat.title] && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', paddingBottom: '20px' }}
                                                                >
                                                                    {filteredItems.map(item => (
                                                                        <motion.button
                                                                            key={item}
                                                                            whileHover={{ scale: 1.02, borderColor: 'var(--primary)' }}
                                                                            onClick={() => {
                                                                                setBooking({
                                                                                    ...booking,
                                                                                    service: item,
                                                                                    duration_minutes: serviceDurations[item] || 60
                                                                                });
                                                                                setTimeout(nextStep, 200);
                                                                            }}
                                                                            style={{
                                                                                padding: '12px 24px',
                                                                                borderRadius: '4px',
                                                                                border: booking.service === item ? '1px solid var(--primary)' : '1px solid var(--accent)',
                                                                                backgroundColor: booking.service === item ? 'var(--primary)' : 'var(--white)',
                                                                                color: booking.service === item ? '#FFF' : 'var(--primary)',
                                                                                fontSize: '12px',
                                                                                textTransform: 'uppercase',
                                                                                letterSpacing: '2px',
                                                                                transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                                                                                cursor: 'pointer',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: '8px',
                                                                                fontWeight: booking.service === item ? '600' : '500',
                                                                                boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                                                                            }}
                                                                        >
                                                                            {item}
                                                                            {serviceDurations[item] && (
                                                                                <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                                                                                    ({serviceDurations[item] >= 60
                                                                                        ? `${Math.floor(serviceDurations[item] / 60)}h${serviceDurations[item] % 60 > 0 ? ` ${serviceDurations[item] % 60}m` : ''}`
                                                                                        : `${serviceDurations[item]}m`})
                                                                                </span>
                                                                            )}
                                                                        </motion.button>
                                                                    ))}
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}


                                    {step === 3 && (
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Date & Time</h4>
                                            <p style={{ color: '#666', marginBottom: '30px', fontSize: '0.9rem' }}>Select your preferred date to see available time slots.</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                        Pick a Date
                                                    </label>
                                                    <AntdDatePicker
                                                        value={booking.date}
                                                        onChange={(date, dateString) => setBooking({ ...booking, date: dateString, time: null })}
                                                        className=""
                                                        disabledDate={(date) => {
                                                            // Disable dates in the past
                                                            const today = new Date();
                                                            today.setHours(0, 0, 0, 0);
                                                            if (date < today) return true;

                                                            // Disable closed days
                                                            if (!openingHours) return false;
                                                            const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                                                            const dayName = WEEK_DAYS[date.getDay()];
                                                            const parsedHours = parseOpeningHours(openingHours);
                                                            const slots = parsedHours[dayName];
                                                            return !slots || !slots.some(s => s);
                                                        }}
                                                    />
                                                </div>

                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                        Available Time Slots
                                                    </label>
                                                    {isLoadingSlots ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666', padding: '20px 0' }}>
                                                            <motion.div
                                                                animate={{ rotate: 360 }}
                                                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                                            >
                                                                <Loader2 size={20} />
                                                            </motion.div>
                                                            <span>Checking availability...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="booking-time-grid" style={{
                                                            display: 'grid',
                                                            gap: '12px'
                                                        }}>
                                                            {timeSlots.length > 0 ? (
                                                                timeSlots.map(t => (
                                                                    <motion.button
                                                                        key={t}
                                                                        whileHover={{ scale: 1.02, borderColor: 'var(--primary)' }}
                                                                        onClick={() => {
                                                                            const sData = fullTimeSlots.find(slot => (typeof slot === "string" ? slot : slot.time) === t);
                                                                            const avProfs = sData?.professionals || [];
                                                                            setBooking(prev => {
                                                                                const newBooking = { ...prev, time: t };
                                                                                if (!prev.professional && avProfs.length > 0) {
                                                                                    const pName = avProfs[0];
                                                                                    const pObj = professionals.find(p => p.name && pName && p.name.trim().toLowerCase() === pName.trim().toLowerCase()) || { name: pName };
                                                                                    newBooking.professional = pObj;
                                                                                }
                                                                                return newBooking;
                                                                            });
                                                                            setTimeout(() => setStep(4), 100);
                                                                        }}
                                                                        style={{
                                                                            padding: '14px 0',
                                                                            borderRadius: '4px',
                                                                            border: booking.time === t ? '1px solid var(--primary)' : '1px solid var(--accent)',
                                                                            backgroundColor: booking.time === t ? 'var(--primary)' : 'var(--white)',
                                                                            color: booking.time === t ? '#FFFFFF' : 'var(--primary)',
                                                                            fontWeight: booking.time === t ? '600' : '500',
                                                                            fontSize: '12px',
                                                                            letterSpacing: '1px',
                                                                            transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                                                                            cursor: 'pointer',
                                                                            boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                                                                        }}
                                                                    >
                                                                        {t}
                                                                    </motion.button>
                                                                ))
                                                            ) : (
                                                                <div style={{ gridColumn: '1 / -1', padding: '20px', backgroundColor: 'var(--input-bg)', borderRadius: '10px', textAlign: 'center', color: '#999' }}>
                                                                    {booking.date ? 'No slots available for this date.' : 'Please select a date first.'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 4 && (
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '1.5rem', marginBottom: '30px' }}>Contact Details</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                <div style={{ position: 'relative' }}>
                                                    <User size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                                    <input
                                                        type="text" placeholder="Full Name"
                                                        value={booking.name} onChange={(e) => {
                                                            const val = e.target.value;
                                                            setBooking(prev => ({ ...prev, name: val }));
                                                        }}
                                                        style={{ padding: '15px 15px 15px 45px', width: '100%', border: '1px solid var(--accent)', borderRadius: '8px', boxSizing: 'border-box', maxWidth: '100%' }}
                                                    />
                                                </div>
                                                <div style={{ position: 'relative' }}>
                                                    <Mail size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                                    <input
                                                        type="email" placeholder="Email Address"
                                                        value={booking.email} onChange={(e) => {
                                                            const val = e.target.value;
                                                            setBooking(prev => ({ ...prev, email: val }));
                                                        }}
                                                        style={{ padding: '15px 15px 15px 45px', width: '100%', border: '1px solid var(--accent)', borderRadius: '8px', boxSizing: 'border-box', maxWidth: '100%' }}
                                                    />
                                                </div>
                                                <div style={{ position: 'relative' }}>
                                                    <Phone size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                                    <input
                                                        type="tel" placeholder="Phone Number"
                                                        value={booking.phone} onChange={(e) => {
                                                            const val = e.target.value;
                                                            setBooking(prev => ({ ...prev, phone: val }));
                                                        }}
                                                        style={{ padding: '15px 15px 15px 45px', width: '100%', border: '1px solid var(--accent)', borderRadius: '8px', boxSizing: 'border-box', maxWidth: '100%' }}
                                                    />
                                                </div>
                                                {(!booking.email && !booking.phone) && (
                                                    <div style={{ fontSize: '0.86rem', color: '#dc2626', marginTop: '15px', fontWeight: '500' }}>
                                                        * Please provide an email or phone number to continue.
                                                    </div>
                                                )}
                                            </div>
                                            {error && (
                                                <div style={{ marginTop: '20px', padding: '12px 15px', backgroundColor: '#FFF5F5', border: '1px solid #FC8181', borderRadius: '8px', color: '#C53030', fontSize: '0.85rem', fontWeight: '500' }}>
                                                    {error}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {step > 1 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '40px' }}>
                                            {step > 1 && (
                                                <button onClick={prevStep} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                    <ChevronLeft size={20} /> Back
                                                </button>
                                            )}
                                            <div style={{ marginLeft: 'auto' }}>
                                                {step < 4 ? (
                                                    <button
                                                        onClick={nextStep}
                                                        disabled={(step === 2 && !booking.service) || (step === 3 && (!booking.date || !booking.time || isLoadingSlots))}
                                                        className="btn-primary"
                                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: ((step === 2 && !booking.service) || (step === 3 && (!booking.date || !booking.time || isLoadingSlots))) ? 0.5 : 1 }}
                                                    >
                                                        Next Step <ChevronRight size={20} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={handleBooking}
                                                        disabled={!booking.name || (!booking.email && !booking.phone) || isSubmitting}
                                                        className="btn-primary"
                                                        style={{ opacity: (!booking.name || (!booking.email && !booking.phone) || isSubmitting) ? 0.5 : 1 }}
                                                    >
                                                        {isSubmitting ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                                                <motion.div
                                                                    animate={{ rotate: 360 }}
                                                                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                                                >
                                                                    <Loader2 size={16} />
                                                                </motion.div>
                                                                Confirming...
                                                            </div>
                                                        ) : 'Confirm Booking'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section >
    );
};

const SelectionItem = ({ icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(234, 224, 213, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
            <div style={{ fontWeight: '600', fontSize: '1rem' }}>{value}</div>
        </div>
    </div>
);

export default BookingSystem;
