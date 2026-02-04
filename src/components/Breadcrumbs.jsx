import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Breadcrumbs = ({ label, textColor }) => {
    const finalTextColor = textColor || 'var(--accent)';

    return (
        <nav className="flex items-center gap-2 text-sm opacity-80 mb-2 max-w-[1200px] mx-auto px-5 pt-28" style={{ color: finalTextColor }}>
            <Link to="/" className="flex items-center gap-1 hover:opacity-100 transition-opacity" style={{ color: finalTextColor }}>
                <Home size={14} />
                <span>Home</span>
            </Link>
            <ChevronRight size={14} className="opacity-50" />
            <span className="font-medium" style={{ color: finalTextColor, opacity: 1 }}>{label}</span>
        </nav>
    );
};

export default Breadcrumbs;
