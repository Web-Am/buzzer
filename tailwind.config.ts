import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/app/**/*.{ts,tsx}',
        './src/app/components/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', 'system-ui', 'sans-serif']
            },
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    300: '#93c5fd',
                    500: '#3b82f6',
                    600: '#2563eb'
                },
                secondary: {
                    50: '#fdf2ff',
                    100: '#f3e8ff',
                    500: '#a855f7',
                    600: '#9333ea'
                }
            },
            keyframes: {
                'gradient-shift': {
                    '0%, 100%': { 'background-position': '0% 50%' },
                    '50%': { 'background-position': '100% 50%' }
                }
            },
            animation: {
                'gradient': 'gradient-shift 3s ease infinite'
            }
        }
    },
    plugins: []
};

export default config;
