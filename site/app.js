(function () {
  window.dataLayer = window.dataLayer || [];
  window.trackEvent = function (eventName, payload) {
    window.dataLayer.push({ event: eventName, ...payload, ts: Date.now() });
    console.log('[analytics]', eventName, payload || {});
  };

  const leadForm = document.querySelector('[data-lead-form]');
  const statusEl = document.querySelector('[data-form-status]');

  if (!leadForm) return;

  leadForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const formData = new FormData(leadForm);
    const payload = Object.fromEntries(formData.entries());

    statusEl.textContent = 'Submitting...';
    statusEl.className = 'notice';

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await res.json();

      if (!res.ok || !body.ok) throw new Error(body.error || 'Failed to submit lead form');

      leadForm.reset();
      statusEl.textContent = 'Thanks. We received your request and will follow up shortly.';
      statusEl.className = 'notice ok';
      window.trackEvent('lead_form_submitted', { serviceInterest: payload.serviceInterest });
    } catch (error) {
      statusEl.textContent = `Submission failed: ${error.message}`;
      statusEl.className = 'notice err';
      window.trackEvent('lead_form_error', { message: error.message });
    }
  });
})();
