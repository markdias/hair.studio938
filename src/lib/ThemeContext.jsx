import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {

    const FACOTRY_THEME = {
        '--primary-brown': '#3D2B1F',
        '--primary-brown-hover': '#4D3B2F',
        '--accent-cream': '#EAE0D5',
        '--soft-cream': '#F5F1ED',
        '--text-dark': '#2A1D15',
        '--text-light': '#FFFFFF',
        '--white': '#FFFFFF',
        '--black': '#000000',
        '--success-green': '#22c55e',
        '--error-red': '#ef4444',
        '--booking-card-bg': '#FFFFFF',
        '--pricing-card-bg': '#EDE4DB',
        '--input-bg': '#F9F9F9',
        '--font-heading': "'Playfair Display', serif",
        '--font-body': "'Inter', sans-serif",
    };

    const [theme, setTheme] = useState(FACOTRY_THEME);
    const [loading, setLoading] = useState(true);

    // Map database keys to CSS variable names
    const dbKeyToCssVar = {
        'theme_primary': '--primary-brown',
        'theme_primary_hover': '--primary-brown-hover',
        'theme_accent': '--accent-cream',
        'theme_soft_cream': '--soft-cream',
        'theme_text_dark': '--text-dark',
        'theme_text_light': '--text-light',
        'theme_white': '--white',
        'theme_black': '--black',
        'theme_success': '--success-green',
        'theme_error': '--error-red',
        'theme_booking_card_bg': '--booking-card-bg',
        'theme_pricing_card_bg': '--pricing-card-bg',
        'theme_input_bg': '--input-bg',
        'theme_font_heading': '--font-heading',
        'theme_font_body': '--font-body',
    };

    const cssVarToDbKey = Object.fromEntries(
        Object.entries(dbKeyToCssVar).map(([k, v]) => [v, k])
    );

    useEffect(() => {
        fetchTheme();
    }, []);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const fetchTheme = async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .in('key', Object.keys(dbKeyToCssVar));

            if (error) throw error;

            if (data) {
                const newTheme = { ...FACOTRY_THEME };
                data.forEach(setting => {
                    const cssVar = dbKeyToCssVar[setting.key];
                    if (cssVar) {
                        newTheme[cssVar] = setting.value;
                    }
                });
                setTheme(newTheme);
            }
        } catch (err) {
            console.error('Error fetching theme:', err);
        } finally {
            setLoading(false);
        }
    };

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : null;
    };

    const applyTheme = (themeSettings) => {
        const root = document.documentElement;
        Object.entries(themeSettings).forEach(([property, value]) => {
            root.style.setProperty(property, value);

            // If the value is a hex color, also set its RGB counter-part for rgba usage
            if (value && typeof value === 'string' && value.startsWith('#')) {
                const rgb = hexToRgb(value);
                if (rgb) {
                    root.style.setProperty(`${property}-rgb`, rgb);
                }
            }
        });
    };

    const updateTheme = async (newThemeSettings) => {
        // 1. Update local state
        const updatedTheme = { ...theme, ...newThemeSettings };
        setTheme(updatedTheme);
        applyTheme(updatedTheme);

        // 2. Persist to Supabase
        const updates = Object.entries(newThemeSettings).map(([cssVar, value]) => {
            const dbKey = cssVarToDbKey[cssVar];
            if (!dbKey) return null;
            return { key: dbKey, value };
        }).filter(Boolean);

        if (updates.length === 0) return;

        try {
            const { error } = await supabase
                .from('site_settings')
                .upsert(updates);

            if (error) throw error;
        } catch (err) {
            console.error('Error saving theme:', err);
        }
    };

    const saveAsDefault = async (currentTheme) => {
        const updates = Object.entries(currentTheme).map(([cssVar, value]) => {
            const dbKey = cssVarToDbKey[cssVar];
            if (!dbKey) return null;
            return { key: `default_${dbKey}`, value };
        }).filter(Boolean);

        try {
            const { error } = await supabase.from('site_settings').upsert(updates);
            if (error) throw error;
        } catch (err) {
            console.error('Error saving default theme:', err);
            throw err;
        }
    };

    const resetToDefault = async () => {
        try {
            const defaultKeys = Object.keys(dbKeyToCssVar).map(k => `default_${k}`);
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .in('key', defaultKeys);

            if (error) throw error;

            const defaultTheme = { ...FACOTRY_THEME };
            if (data && data.length > 0) {
                data.forEach(setting => {
                    const originalKey = setting.key.replace('default_', '');
                    const cssVar = dbKeyToCssVar[originalKey];
                    if (cssVar) {
                        defaultTheme[cssVar] = setting.value;
                    }
                });
            }
            // Update theme with these defaults
            await updateTheme(defaultTheme);
            return defaultTheme;
        } catch (err) {
            console.error('Error resetting to default:', err);
            throw err;
        }
    };

    const resetToFactory = async () => {
        await updateTheme(FACOTRY_THEME);
        return FACOTRY_THEME;
    };


    return (
        <ThemeContext.Provider value={{ theme, updateTheme, saveAsDefault, resetToDefault, resetToFactory, loading }}>
            {children}
        </ThemeContext.Provider>
    );
};
