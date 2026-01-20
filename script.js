// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle?.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            navLinks.classList.remove('active');
        }
    });
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLink?.classList.add('active');
        } else {
            navLink?.classList.remove('active');
        }
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.about-card, .dept-card, .section-header').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add CSS for animation
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// Google Forms URL - Submit to formResponse endpoint
const GOOGLE_FORM_ACTION_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdSJGnsjl9TzIzwqIw80nvurEIfRFLzhXyQc_s1ngTNAJy58g/formResponse";

// Department selection handler - Show/hide conditional fields
const departmentSelect = document.getElementById('department');
const roleGroup = document.getElementById('roleGroup');
const portfolioGroup = document.getElementById('portfolioGroup');
const roleSelect = document.getElementById('role');
const portfolioInput = document.getElementById('portfolio');

departmentSelect?.addEventListener('change', function () {
    const selectedDept = this.value;

    // Hide all conditional fields first
    roleGroup.style.display = 'none';
    portfolioGroup.style.display = 'none';

    // Reset the hidden fields
    roleSelect.value = '';
    roleSelect.removeAttribute('required');
    portfolioInput.value = '';
    portfolioInput.removeAttribute('required');

    // Show role selection for Creatives and TechNet Academy
    if (selectedDept === 'Creatives' || selectedDept === 'TechNet Academy') {
        roleGroup.style.display = 'block';
        roleSelect.setAttribute('required', 'required');

        // Update role options based on department
        roleSelect.innerHTML = '<option value="">اختر المنصب</option>';

        if (selectedDept === 'Creatives') {
            // Creatives: only VP and Member
            roleSelect.innerHTML += '<option value="نائب قائد">نائب قائد</option>';
            roleSelect.innerHTML += '<option value="عضو عادي">عضو عادي</option>';
        } else if (selectedDept === 'TechNet Academy') {
            // TechNet Academy: Leader, VP, and Member
            roleSelect.innerHTML += '<option value="قائد">قائد</option>';
            roleSelect.innerHTML += '<option value="نائب قائد">نائب قائد</option>';
            roleSelect.innerHTML += '<option value="عضو عادي">عضو عادي</option>';
        }
    }

    // Show portfolio upload for Designers
    if (selectedDept === 'Designers') {
        portfolioGroup.style.display = 'block';
        portfolioInput.setAttribute('required', 'required');
    }
});

// Form submission (STORE REQUESTS + GOOGLE FORMS)
const contactForm = document.getElementById('contactForm');

contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    data.createdAt = new Date().toLocaleString('ar-SA');
    data.status = "Pending";

    // Save to localStorage
    const requests = JSON.parse(localStorage.getItem("joinRequests")) || [];
    requests.push(data);
    localStorage.setItem("joinRequests", JSON.stringify(requests));

    // Submit to Google Forms (in background)
    submitToGoogleForms(data);

    // UI feedback
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '✓ تم إرسال الطلب بنجاح!';
    btn.style.background = 'linear-gradient(135deg, #43a047, #66bb6a)';

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        contactForm.reset();
    }, 3000);
});

// Function to submit data to Google Forms
function submitToGoogleForms(data) {
    // Debug: Log the data being sent
    console.log('📤 Sending to Google Forms:', data);

    // Map your form fields to Google Form entry IDs
    // Based on actual Google Form field order
    const fieldMapping = {
        'entry.128547825': data.name || '',           // 1. الاسم الرباعي
        'entry.1925269306': data.email || '',         // 2. الايميل الجامعي
        'entry.1955412134': data.studentId || '',     // 3. الرقم الجامعي
        'entry.520145743': data.phone || '',          // 4. رقم الهاتف
        'entry.168880819': data.department || '',     // 5. القسم
        'entry.1023590285': data.role || '',          // 6. المنصب
        'entry.486104639': data.portfolio || '',      // 7. رابط الاعمال السابقة
        'entry.1641401705': data.message || '',       // 8. ماللذي يجعلك تختار هذا القسم
        'entry.1155585909': data.experience || ''     // 9. خبرات سابقة
    };

    // Build URL with parameters
    const params = new URLSearchParams(fieldMapping);
    const submitUrl = GOOGLE_FORM_ACTION_URL + '?' + params.toString();

    console.log('📤 Submit URL:', submitUrl);

    // Submit using iframe (most reliable for cross-origin)
    const iframe = document.createElement('iframe');
    iframe.name = 'hidden_iframe_' + Date.now();
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = GOOGLE_FORM_ACTION_URL;
    form.target = iframe.name;

    for (const [key, value] of Object.entries(fieldMapping)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
    console.log('✅ Form submitted successfully');

    // Cleanup
    setTimeout(() => {
        if (form.parentNode) form.parentNode.removeChild(form);
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 2000);
}

// Department card hover effects
document.querySelectorAll('.dept-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// Parallax effect for orbs
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            const orbs = document.querySelectorAll('.orb');
            orbs.forEach((orb, index) => {
                const speed = (index + 1) * 0.05;
                orb.style.transform = `translateY(${scrolled * speed}px)`;
            });
            ticking = false;
        });
        ticking = true;
    }
});

console.log('🎓 TechNet Website Loaded Successfully!');
