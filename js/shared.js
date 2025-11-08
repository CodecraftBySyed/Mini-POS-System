// PWA Install
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.getElementById('installBtn');
  if (installBtn) {
    installBtn.classList.remove('hidden');
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.classList.add('hidden');
    });
  }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .catch(console.error);
  });
}

// Utility
export function money(n) {
  return (Math.round(Number(n) * 100) / 100).toFixed(2);
}

export function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white font-medium shadow-lg z-50 ${
    type === 'success' ? 'bg-green-600' : 'bg-red-600'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
