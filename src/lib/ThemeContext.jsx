import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {

    const FACOTRY_THEME = {
        '--primary': '#000000',
        '--primary-rgb': '0, 0, 0',
        '--primary-hover': '#1A1A1A',
        '--accent': '#C5A777',
        '--secondary': '#FDFCFB',
        '--text-main': '#1A1A1A',
        '--text-contrast': '#FFFFFF',
        '--font-heading': "'Playfair Display', serif",
        '--font-body': "'Inter', sans-serif",
    };

    const [theme, setTheme] = useState(FACOTRY_THEME);
    const [loading, setLoading] = useState(true);
    const [maintenance, setMaintenance] = useState(false);

    // Map database keys to CSS variable names
    const dbKeyToCssVar = {
        'theme_primary': '--primary',
        'theme_primary_hover': '--primary-hover',
        'theme_accent': '--accent',
        'theme_soft_cream': '--secondary',
        'theme_text_dark': '--text-main',
        'theme_text_light': '--text-contrast',
        'theme_font_heading': '--font-heading',
        'theme_font_body': '--font-body',
        'theme_navbar_bg': '--navbar-bg',
        'theme_navbar_text': '--navbar-text',
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

            if (data && data.length > 0) {
                const newTheme = { ...FACOTRY_THEME };
                data.forEach(setting => {
                    const cssVar = dbKeyToCssVar[setting.key];
                    if (cssVar) {
                        newTheme[cssVar] = setting.value;
                    }
                });
                setTheme(newTheme);
                setMaintenance(false);
            } else {
                // No theme settings found - trigger maintenance mode
                setMaintenance(true);
            }
        } catch (err) {
            console.error('Error fetching theme:', err);
            // On error, also default to maintenance or factory?
            // User asked: "if there are no colours then we should say under maintenance"
            // We'll assume error fetching = maintenance for safety.
            setMaintenance(true);
        } finally {
            setLoading(false);
        }
    };

    const hexToRgb = (hex) => {
        if (!hex) return null;
        hex = hex.trim();

        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : null;
    };

    const applyTheme = (themeSettings) => {
        const root = document.documentElement;
        // console.log('Applying theme:', themeSettings); // Debug logging
        Object.entries(themeSettings).forEach(([property, value]) => {
            root.style.setProperty(property, value);

            // Handle RGB counterparts for transparent usage
            if (property === '--primary' || property === '--navbar-bg') {
                const rgb = hexToRgb(value);
                if (rgb) {
                    const rgbVar = property === '--primary' ? '--primary-rgb' : '--navbar-bg-rgb';
                    root.style.setProperty(rgbVar, rgb);
                }
            }
            if (property === '--accent') {
                const rgb = hexToRgb(value);
                if (rgb) {
                    root.style.setProperty('--accent-rgb', rgb);
                }
            }
        });
    };

    const updateTheme = async (newThemeSettings) => {
        // 1. Update local state
        const updatedTheme = { ...theme, ...newThemeSettings };
        setTheme(updatedTheme);
        applyTheme(updatedTheme);
        setMaintenance(false); // Manually updating implies we have colors now

        // 2. Persist to Supabase
        const updates = Object.entries(newThemeSettings).map(([cssVar, value]) => {
            const dbKey = cssVarToDbKey[cssVar];
            if (!dbKey) return null;
            return { key: dbKey, value };
        }).filter(Boolean);

        if (updates.length === 0) return { success: true };

        try {
            const { error } = await supabase
                .from('site_settings')
                .upsert(updates, { onConflict: 'key' });

            if (error) {
                console.error('Supabase update error:', error);
                throw error;
            }
            return { success: true };
        } catch (err) {
            console.error('Error saving theme:', err);
            return { success: false, error: err };
        }
    };

    const saveAsDefault = async (currentTheme) => {
        const updates = Object.entries(currentTheme).map(([cssVar, value]) => {
            const dbKey = cssVarToDbKey[cssVar];
            if (!dbKey) return null;
            return { key: `default_${dbKey}`, value };
        }).filter(Boolean);

        try {
            const { error } = await supabase.from('site_settings').upsert(updates, { onConflict: 'key' });
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
        <ThemeContext.Provider value={{ theme, updateTheme, saveAsDefault, resetToDefault, resetToFactory, loading, maintenance }}>
            {children}
        </ThemeContext.Provider>
    );
};
