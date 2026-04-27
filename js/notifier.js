/**
 * --- MINESWEEPER PRO+ NOTIFICATION SYSTEM ---
 * Zamjenjuje klasične browser alert() i confirm() poruke sa stiliziranim "pushup" obavijestima i modalima.
 */

const Notifier = {
    container: null,

    init() {
        this.container = document.getElementById('notification-container');
        
        // Preusmjeri standardni alert na naš sustav
        window.alert = (msg) => this.show(msg, 'info');
        
        console.log("Custom Notifikacije i Confirm sustav aktivni.");
    },

    /**
     * Prikazuje push-up obavijest (toast).
     */
    show(message, type = 'info', duration = 4000) {
        if (!this.container) this.init();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = Icons.bell.replace('<svg', '<svg width="20" height="20"');
        if (type === 'success') icon = Icons.check.replace('<svg', '<svg width="20" height="20"');
        if (type === 'error') icon = Icons.wrong.replace('<svg', '<svg width="20" height="20"');
        if (type === 'warning') icon = Icons.bell.replace('<svg', '<svg width="20" height="20" style="color:#ffeb3b"');

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-message">${message}</div>
        `;

        toast.onclick = () => this.remove(toast);
        this.container.appendChild(toast);

        setTimeout(() => this.remove(toast), duration);
    },

    /**
     * Prikazuje custom prozor za potvrdu akcije.
     * Budući da je browserov confirm() sinkron, a ovo asinkron, koristi se callback/Promise.
     */
    confirm(message, onConfirm, title = "POTVRDI AKCIJU") {
        const modal = document.getElementById('confirm-modal');
        const msgEl = document.getElementById('confirm-msg');
        const titleEl = document.getElementById('confirm-title');
        const okBtn = document.getElementById('confirm-ok-btn');
        const cancelBtn = document.getElementById('confirm-cancel-btn');
        const iconEl = document.getElementById('confirm-icon');

        if (!modal) return;

        msgEl.innerText = message;
        titleEl.innerText = title;
        if (iconEl && window.Icons) iconEl.innerHTML = Icons.target.replace('<svg', '<svg width="48" height="48"');

        modal.classList.remove('hidden');

        const close = () => modal.classList.add('hidden');

        okBtn.onclick = () => {
            close();
            if (onConfirm) onConfirm();
        };

        cancelBtn.onclick = () => {
            close();
        };
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

document.addEventListener('DOMContentLoaded', () => Notifier.init());
