// src/pages/onboarding/clean-pro-flag.js
/**
 * Utility to clean the Pro registration flag from localStorage.
 * Should be called whenever the user starts a new session (login page)
 * or after a successful onboarding to avoid stale state.
 */
export const limpiarFlagPro = () => {
    if (localStorage.getItem('registroPro')) {
        localStorage.removeItem('registroPro');
    }
};
