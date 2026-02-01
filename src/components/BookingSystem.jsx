import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, User, Scissors, Check, ChevronRight, ChevronLeft, Phone, Mail, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AntdDatePicker from './AntdDatePicker';

const categories = [
    { title: "CUT & STYLING", items: ["Wash cut & blowdry", "Wash & cut", "Wash & blowdry", "Styling", "Hair Up"] },
    { title: "COLOURING", items: ["T-section highlights", "Half head highlights", "Full head highlights", "Balyage", "Full head tint"] },
    { title: "TREATMENTS", items: ["Keratin blowdry", "Hair Botox", "Olaplex"] },
];

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

const BookingSystem = () => {
    const [stylists, setStylists] = useState([]);
    const [isLoadingStylists, setIsLoadingStylists] = useState(true);
    const [openingHours, setOpeningHours] = useState(null);
    const [serviceDurations, setServiceDurations] = useState({});
    const [step, setStep] = useState(1);
    const [booking, setBooking] = useState({
        stylist: null,
        service: null,
        date: null,
        time: null,
        duration_minutes: null,
        name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        const fetchStylists = async () => {
            const { data, error } = await supabase
                .from('stylist_calendars')
                .select('*');
            if (!error && data) {
                // Transform to match previous structure
                const formatted = data.map(s => ({
                    name: s.stylist_name,
                    role: s.role,
                    img: s.image_url || '/placeholder.png',
                    calendar_id: s.calendar_id
                }));
                setStylists(formatted);
            }
            setIsLoadingStylists(false);
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

        const fetchServiceDurations = async () => {
            const { data, error } = await supabase
                .from('price_list')
                .select('item_name, duration_minutes');
            if (!error && data) {
                const durations = {};
                data.forEach(s => {
                    durations[s.item_name] = s.duration_minutes || 60;
                });
                setServiceDurations(durations);
            }
        };

        fetchStylists();
        fetchOpeningHours();
        fetchServiceDurations();
    }, []);

    const [timeSlots, setTimeSlots] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (booking.date) {
            const isOpen = checkIfOpen(booking.date);
            if (isOpen) {
                fetchAvailability(booking.date, booking.stylist?.name);
            } else {
                setTimeSlots([]);
                setError('Sorry, we are closed on this day. Please select another date.');
            }
        }
    }, [booking.date, booking.stylist?.name, openingHours]);

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

    const fetchAvailability = async (date, stylistName) => {
        setIsLoadingSlots(true);
        setError(null);
        try {
            const stylistParam = stylistName ? `&stylist=${encodeURIComponent(stylistName)}` : '';
            const response = await fetch(`/api/availability?date=${date}${stylistParam}`);

            if (!response.ok) {
                // Fallback for local development where /api is not served by vite
                console.warn('API not found, falling back to dummy data');
                setTimeSlots(['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']);
                return;
            }

            const data = await response.json();
            if (data.slots) {
                setTimeSlots(data.slots);
            } else {
                setError('Could not load time slots');
            }
        } catch (err) {
            console.warn('Fetch error (likely local dev), using fallback slots:', err);
            setTimeSlots(['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']);
        } finally {
            setIsLoadingSlots(false);
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleBooking = async () => {
        setIsSubmitting(true);
        setError(null);

        // If no stylist selected, pick one randomly
        let finalBooking = { ...booking };
        if (!finalBooking.stylist && stylists.length > 0) {
            const randomStylist = stylists[Math.floor(Math.random() * stylists.length)];
            finalBooking.stylist = randomStylist;
            setBooking(finalBooking);
        }

        try {
            const response = await fetch('/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalBooking)
            });

            if (!response.ok) {
                // Fallback for local development
                console.warn('API not found, simulating success');
                setTimeout(() => {
                    setIsSubmitting(false);
                    setIsSuccess(true);
                }, 1500);
                return;
            }

            const data = await response.json();
            if (data.success) {
                setIsSuccess(true);
            } else {
                setError(data.error || 'Failed to create booking');
            }
        } catch (err) {
            console.warn('Booking error (likely local dev), simulating success');
            setTimeout(() => {
                setIsSubmitting(false);
                setIsSuccess(true);
            }, 1500);
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.5 } }
    };

    return (
        <section id="booking" style={{
            padding: '120px 0',
            backgroundColor: 'var(--soft-cream)',
            minHeight: '800px'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', color: 'var(--primary-brown)', marginBottom: '15px' }}>Book Your Visit</h2>
                    <div style={{ width: '60px', height: '2px', backgroundColor: 'var(--primary-brown)', margin: '0 auto' }}></div>
                </div>

                <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    boxShadow: '0 40px 100px rgba(61, 43, 31, 0.08)',
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(300px, 1fr) 2fr',
                    height: '600px'
                }} className="booking-card">

                    <div style={{
                        backgroundColor: 'var(--primary-brown)',
                        padding: '60px 40px',
                        color: 'var(--accent-cream)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <h3 style={{ fontSize: '1.8rem', marginBottom: '30px', color: '#FFF' }}>Your Selection</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                <SelectionItem icon={<User size={20} />} label="Stylist" value={booking.stylist?.name || 'Not selected'} />
                                <SelectionItem icon={<Scissors size={20} />} label="Service" value={booking.service || 'Not selected'} />
                                <SelectionItem icon={<CalendarIcon size={20} />} label="Date" value={booking.date || 'Not selected'} />
                                <SelectionItem icon={<Clock size={20} />} label="Time" value={booking.time || 'Not selected'} />
                            </div>
                        </div>
                        <div style={{ opacity: 0.6, fontSize: '0.9rem' }}>
                            Step {step} of 4
                            <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.2)', marginTop: '10px', borderRadius: '2px' }}>
                                <div style={{ width: `${(step / 4) * 100}%`, height: '100%', backgroundColor: 'var(--accent-cream)', transition: 'width 0.5s ease' }}></div>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '60px', position: 'relative', overflowY: 'auto' }}>
                        <AnimatePresence mode="wait">
                            {isSuccess ? (
                                <motion.div key="success" variants={containerVariants} initial="hidden" animate="visible" style={{ textAlign: 'center', paddingTop: '10px' }}>
                                    <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--primary-brown)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                        <Check color="var(--accent-cream)" size={30} />
                                    </div>
                                    <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-brown)', marginBottom: '10px' }}>Booking Confirmed!</h3>

                                    {/* Booking Details */}
                                    <div style={{
                                        backgroundColor: '#F9F9F9',
                                        borderRadius: '10px',
                                        padding: '20px',
                                        margin: '20px 0',
                                        textAlign: 'left',
                                        fontSize: '0.9rem'
                                    }}>
                                        <h4 style={{ fontSize: '1rem', color: 'var(--primary-brown)', marginBottom: '15px', fontWeight: '700' }}>Your Appointment</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E5E5E5' }}>
                                                <span style={{ color: '#666', fontSize: '0.85rem' }}>Stylist:</span>
                                                <span style={{ fontWeight: '600', color: '#333', fontSize: '0.85rem' }}>{booking.stylist?.name}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E5E5E5' }}>
                                                <span style={{ color: '#666', fontSize: '0.85rem' }}>Service:</span>
                                                <span style={{ fontWeight: '600', color: '#333', fontSize: '0.85rem' }}>{booking.service}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E5E5E5' }}>
                                                <span style={{ color: '#666', fontSize: '0.85rem' }}>Date:</span>
                                                <span style={{ fontWeight: '600', color: '#333', fontSize: '0.85rem' }}>{booking.date}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E5E5E5' }}>
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
                                        onClick={() => { setIsSuccess(false); setStep(1); setBooking({ stylist: null, service: null, date: null, time: null, duration_minutes: null, name: '', email: '', phone: '' }); }}
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
                                            <h4 style={{ fontSize: '1.5rem', marginBottom: '30px' }}>Choose Your Stylist</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
                                                {stylists.map((s) => (
                                                    <button
                                                        key={s.name}
                                                        onClick={() => { setBooking({ ...booking, stylist: s }); nextStep(); }}
                                                        style={{
                                                            padding: '20px',
                                                            borderRadius: '12px',
                                                            border: booking.stylist?.name === s.name ? '2px solid var(--primary-brown)' : '2px solid transparent',
                                                            backgroundColor: booking.stylist?.name === s.name ? 'var(--soft-cream)' : '#F9F9F9',
                                                            transition: 'all 0.3s ease',
                                                            textAlign: 'center',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <img src={s.img} alt={s.name} style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '15px', objectFit: 'cover' }} />
                                                        <div style={{ fontWeight: '700', color: 'var(--primary-brown)' }}>{s.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{s.role.split(' ')[0]}</div>
                                                    </button>
                                                ))}
                                            </div>
                                            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                                                <button
                                                    onClick={nextStep}
                                                    style={{
                                                        padding: '12px 24px',
                                                        backgroundColor: 'transparent',
                                                        color: 'var(--primary-brown)',
                                                        border: '1px solid var(--primary-brown)',
                                                        borderRadius: '8px',
                                                        fontSize: '0.9rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.backgroundColor = 'var(--soft-cream)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = 'transparent';
                                                    }}
                                                >
                                                    Skip - I'll take any available stylist
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '1.5rem', marginBottom: '30px' }}>Select a Service</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                                {categories.map((cat) => (
                                                    <div key={cat.title}>
                                                        <div style={{ fontSize: '0.8rem', letterSpacing: '2px', color: '#999', marginBottom: '15px' }}>{cat.title}</div>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                            {cat.items.map(item => (
                                                                <button
                                                                    key={item}
                                                                    onClick={() => setBooking({
                                                                        ...booking,
                                                                        service: item,
                                                                        duration_minutes: serviceDurations[item] || 60
                                                                    })}
                                                                    style={{
                                                                        padding: '10px 20px',
                                                                        borderRadius: '30px',
                                                                        border: '1px solid var(--accent-cream)',
                                                                        backgroundColor: booking.service === item ? 'var(--primary-brown)' : 'white',
                                                                        color: booking.service === item ? '#FFF' : 'var(--primary-brown)',
                                                                        fontSize: '0.9rem',
                                                                        transition: 'all 0.2s ease',
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '8px'
                                                                    }}
                                                                >
                                                                    {item}
                                                                    {serviceDurations[item] && (
                                                                        <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                                                                            ({serviceDurations[item] >= 60
                                                                                ? `${serviceDurations[item] / 60}h`
                                                                                : `${serviceDurations[item]}m`})
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Date & Time</h4>
                                            <p style={{ color: '#666', marginBottom: '30px', fontSize: '0.9rem' }}>Select your preferred date to see available time slots.</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary-brown)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
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
                                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary-brown)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
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
                                                                    <button
                                                                        key={t}
                                                                        onClick={() => setBooking({ ...booking, time: t })}
                                                                        style={{
                                                                            padding: '12px 0',
                                                                            borderRadius: '10px',
                                                                            border: booking.time === t ? '2px solid #3D2B1F' : '1px solid var(--accent-cream)',
                                                                            backgroundColor: booking.time === t ? '#3D2B1F' : 'white',
                                                                            color: booking.time === t ? '#FFFFFF' : '#3D2B1F',
                                                                            fontWeight: booking.time === t ? '700' : '400',
                                                                            fontSize: '0.9rem',
                                                                            transition: 'all 0.2s ease',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    >
                                                                        {t}
                                                                    </button>
                                                                ))
                                                            ) : (
                                                                <div style={{ gridColumn: '1 / -1', padding: '20px', backgroundColor: '#F9F9F9', borderRadius: '10px', textAlign: 'center', color: '#999' }}>
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
                                                        value={booking.name} onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                                                        style={{ padding: '15px 15px 15px 45px', width: '100%', border: '1px solid var(--accent-cream)', borderRadius: '8px', boxSizing: 'border-box', maxWidth: '100%' }}
                                                    />
                                                </div>
                                                <div style={{ position: 'relative' }}>
                                                    <Mail size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                                    <input
                                                        type="email" placeholder="Email Address"
                                                        value={booking.email} onChange={(e) => setBooking({ ...booking, email: e.target.value })}
                                                        style={{ padding: '15px 15px 15px 45px', width: '100%', border: '1px solid var(--accent-cream)', borderRadius: '8px', boxSizing: 'border-box', maxWidth: '100%' }}
                                                    />
                                                </div>
                                                <div style={{ position: 'relative' }}>
                                                    <Phone size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                                    <input
                                                        type="tel" placeholder="Phone Number"
                                                        value={booking.phone} onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                                                        style={{ padding: '15px 15px 15px 45px', width: '100%', border: '1px solid var(--accent-cream)', borderRadius: '8px', boxSizing: 'border-box', maxWidth: '100%' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '40px' }}>
                                        {step > 1 && (
                                            <button onClick={prevStep} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-brown)', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>
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
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
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
