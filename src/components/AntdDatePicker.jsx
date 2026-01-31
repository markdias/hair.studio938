import React, { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const AntdDatePicker = ({ value, onChange, className, disabledDate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
    const [dropdownStyle, setDropdownStyle] = useState({});
    const inputRef = useRef(null);

    // Parse value if string
    const selectedDate = value ? new Date(value) : null;

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    const handleDateClick = (date) => {
        const dateString = format(date, 'yyyy-MM-dd');
        onChange(date, dateString);
        setIsOpen(false);
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Calculate dropdown position when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            const dropdownHeight = 380; // Approximate calendar height
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            // Position above if not enough space below
            if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
                setDropdownStyle({
                    position: 'fixed',
                    bottom: `${window.innerHeight - rect.top + 8}px`,
                    left: `${rect.left}px`,
                    width: `${rect.width}px`,
                });
            } else {
                setDropdownStyle({
                    position: 'fixed',
                    top: `${rect.bottom + 8}px`,
                    left: `${rect.left}px`,
                    width: `${rect.width}px`,
                });
            }
        }
    }, [isOpen]);

    return (
        <div className="relative w-full">
            <div
                ref={inputRef}
                className={`flex items-center justify-between p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-[#3D2B1F] transition-colors bg-white ${className}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={`text-base ${selectedDate ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'Select date'}
                </div>
                <CalendarIcon size={18} className="text-gray-400" />
            </div>

            {isOpen && (
                <div
                    style={dropdownStyle}
                    className="p-4 bg-white rounded-xl shadow-xl border border-gray-100 z-[9999] animate-in fade-in zoom-in-95 duration-200"
                >
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={prevMonth}
                            className="p-1 hover:bg-gray-100 rounded-full text-gray-600"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="font-semibold text-gray-800">
                            {format(currentMonth, 'MMMM yyyy')}
                        </span>
                        <button
                            type="button"
                            onClick={nextMonth}
                            className="p-1 hover:bg-gray-100 rounded-full text-gray-600"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="text-center text-xs font-semibold text-gray-400 py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {daysInMonth.map((date) => {
                            const isSelected = selectedDate && isSameDay(date, selectedDate);
                            const isCurrentMonth = isSameMonth(date, currentMonth);
                            const isDisabled = disabledDate ? disabledDate(date) : false;

                            return (
                                <button
                                    key={date.toString()}
                                    type="button"
                                    onClick={() => handleDateClick(date)}
                                    disabled={isDisabled}
                                    className={`
                                            h-10 w-full rounded-lg text-sm flex items-center justify-center transition-all
                                            ${isDisabled
                                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50'
                                            : isSelected
                                                ? 'bg-[#3D2B1F] text-white font-bold shadow-md'
                                                : 'hover:bg-[#3D2B1F]/10 text-gray-700'}
                                            ${isToday(date) && !isSelected && !isDisabled ? 'border border-[#3D2B1F] text-[#3D2B1F]' : ''}
                                        `}
                                >
                                    {format(date, 'd')}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
            )}
        </div>
    );
};

export default AntdDatePicker;
