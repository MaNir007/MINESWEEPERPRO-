/**
 * --- MINESWEEPER PRO+ NOTIFICATION SYSTEM ---
 * Zamjenjuje klasične browser alert() poruke sa stiliziranim "pushup" obavijestima.
 */

const Notifier = {
    container: null,

    init() {
        this.container = document.getElementById('notification-container');
        
        // OPCIONALNO: Preusmjeri standardni alert na naš sustav
        window.alert = (msg) => this.show(msg, 'info');
        console.log("Custom Notifikacije aktivne.");
    },

    show(message, type = 'info', duration = 4000) {
        if (!this.container) this.init();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Odaberi ikonu ovisno o tipu
        let icon = Icons.bell.replace('<svg', '<svg width="20" height="20"');
        if (type === 'success') icon = Icons.check.replace('<svg', '<svg width="20" height="20"');
        if (type === 'error') icon = Icons.wrong.replace('<svg', '<svg width="20" height="20"');
        if (type === 'warning') icon = Icons.bell.replace('<svg', '<svg width="20" height="20" style="color:#ffeb3b"');

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-message">${message}</div>
        `;

        // Klik za zatvaranje
        toast.onclick = () => this.remove(toast);

        this.container.appendChild(toast);

        // Automatsko uklanjanje
        setTimeout(() => {
            this.remove(toast);
        }, duration);
    },

    remove(toast) {
        if (toast.parentNode) {
            toast.classList.add('fade-out');
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 500);
        }
    },

    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error'); },
    warning(msg) { this.show(msg, 'warning'); },
    info(msg) { this.show(msg, 'info'); }
};

// Inicijalizacija pri učitavanju
document.addEventListener('DOMContentLoaded', () => Notifier.init());
