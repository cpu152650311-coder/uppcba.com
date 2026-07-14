async function handleInquiry(event) {
      event.preventDefault();
      const form = event.target;
      const data = {
        name: form.querySelector('[name="name"]')?.value || '',
        email: form.querySelector('[name="email"]')?.value || '',
        phone: form.querySelector('[name="phone"]')?.value || '',
        company: form.querySelector('[name="company"]')?.value || '',
        message: form.querySelector('[name="message"]')?.value || '',
        product: form.querySelector('[name="service"]')?.value || '',
        source: 'uppcba.com',
      };
      try {
        const res = await fetch('http://43.161.222.16:8080/inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
          alert('Thank you! Your inquiry has been received. We will respond within 24 hours.');
          form.reset();
          const modal = document.getElementById('inquiry-modal');
          if (modal) modal.classList.remove('open');
        } else {
          alert(result.message || 'Submission failed. Please try again.');
        }
      } catch {
        alert('Network error. Please try again later.');
      }
      return false;
    }
