/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary': 'var(--primary)',
                'primary-hover': 'var(--primary-hover)',
                'accent': 'var(--accent)',
                'secondary': 'var(--secondary)',
                'text-main': 'var(--text-main)',
                'text-contrast': 'var(--text-contrast)',
            },
            fontFamily: {
                sans: ['var(--font-body)', 'sans-serif'],
                serif: ['var(--font-heading)', 'serif'],
                heading: ['var(--font-heading)', 'serif'],
                body: ['var(--font-body)', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
