import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast, useUser } from '../App';

const services = [
  {
    icon: 'cleaning_services',
    title: 'Expert Maid',
    description: 'Meticulous cleaning and home management with a focus on hygiene and organization.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB15imls2pu1O0oKl8dm2U2HEamSNOx-d9sAlgdra2jG-KB5N1S63daqsl2bQa-RBDmZsPvhRqylqLzzAnaGH8EH1glZJc_k5vU5X5mYxweQkEtHxCBRZst3nLXE7m8LyOd4k0I88_smdgqztKlm39FwbbjVgwOWde-zErKtrMDj8bCiKComDYC_7w71osXOkJx7cO1TWtZSxK5bblP7JJ-zAIEwHGiBqSijhEkMUwYBrwhaGHBAqirCGWk-1blh1bZZYJt7pWMhbjL',
  },
  {
    icon: 'child_care',
    title: 'Nurturing Babysitter',
    description: 'Patient and creative care for your little ones, ensuring their safety and growth.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAqC6zkTBaiq0XJdZP7UfMPT22WLx-pS4QtwqDB8ARissGf_7FmbyR9i3zNcl8LaweHLEvqcjpRx8_-erwds04BhRb8oiCfegkKueHvRJhWvUiHoj_c5n8GecAxV1EqSFW2TQiqoyRv_OlLO0PMyVCEkyYYSsjezDmCqGhX_QQ0mi1npi425eOfsCGqte9owACSXv8KzLaIKQhmLrtMVxlKBX4au29N43XnkIiVSa-YMCFZ5m9bdOptoYCqZsPJEQfe-sbGS8OuCOPf',
  },
  {
    icon: 'home_repair_service',
    title: 'Household Helper',
    description: 'Reliable assistance for daily errands, elderly support, and general household tasks.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAQTTcK3xhQ72RyhjkDsGI2XDBNQUpbNLr9PTDp44Wkj9Z7mdCvoVX40LHkur_qFVeArxmLWAJd03SH6ITD0pCpgWVQh2P_PJkRULRn3Z8Qxkw-mh80ZxuxL6KEmAsToizvNeFJG_nfMuYFk69vupRZgMQ00eH1ypixKoA8r6YcE4OfmVIDr-gUW_XHjkA3Yfk1CGgTllhm7O36hcnUkxjbRNFOXJ4tEEzviRC4zw9E5PtKoVR9q9X-F8NKIP7HJbz9ek6EoBxEkXJY',
  },
];

const steps = [
  {
    icon: 'search',
    title: '1. Select Service',
    description: 'Choose from our range of verified home service categories.',
  },
  {
    icon: 'edit_note',
    title: '2. Fill Requirements',
    description: 'Tell us your specific needs, timing, and preferences.',
  },
  {
    icon: 'handshake',
    title: '3. Get Matched',
    description: 'Connect with the best-fit provider from your local community.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const showToast = useToast();
  const { user } = useUser();

  const handleContactSubmit = (event) => {
    event.preventDefault();
    showToast('Thanks. Our community support team will reach out shortly.', 'success');
    event.currentTarget.reset();
  };

  const goToServiceRequest = () => {
    navigate(user ? '/request-service' : '/login');
  };

  return (
    <div className="stitch-landing-page">
      <main className="stitch-main">
        <section className="stitch-hero">
          <div className="stitch-shell stitch-hero-grid">
            <div className="stitch-hero-copy">
              <span className="stitch-chip">Dignity in Care</span>
              <h1>
                Seva Setu - <span>Trusted Seva</span> for Every Home
              </h1>
              <p>
                Experience the warmth of reliable help. We bridge the gap between compassionate service providers and
                households seeking dignified support.
              </p>
              <div className="stitch-hero-actions">
                <button type="button" className="stitch-button stitch-button-primary stitch-button-large" onClick={goToServiceRequest}>
                  Book a Service
                </button>
                <Link to="/signup" className="stitch-button stitch-button-secondary stitch-button-large">
                  Become a Seva Provider
                </Link>
              </div>
            </div>

            <div className="stitch-hero-visual">
              <div className="stitch-hero-glow" />
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuADlv1KOJZ9as1b8G2YmuKPaHoyN9_fIAkZxAsQ0d4EfK47fuoWVmHrZkGnBUNvdiQPqUaxF9mohUCrrHTlEO8vS0CpP1r5yo-7QfPcf7tQLY6A5FH9J6UMu9yQ_PCY6KyQjQnRsU5OR98cpVkAp6tm2x4L6u550aunlqgJNQKVzCE3N6pt9zlx_OrrKXozP-qGZ6kax7Hl77oqQiIgF1EO64vlaj263_zbWjV91n4Ft8zXlYrVFsB36Hhkg1AbLy0pJIykv41Mwv-s"
                alt="Heartwarming interaction"
                className="stitch-hero-image"
              />
            </div>
          </div>
        </section>

        <section id="services" className="stitch-services">
          <div className="stitch-shell">
            <div className="stitch-section-header">
              <div>
                <h2>Dedicated Care Categories</h2>
                <p>Every helper in our community is vetted for safety, skills, and heart.</p>
              </div>
              <Link to="/request-service" className="stitch-text-link">
                View all services <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>

            <div className="stitch-service-grid">
              {services.map((service) => (
                <article className="stitch-service-card" key={service.title}>
                  <div className="stitch-service-icon">
                    <span className="material-symbols-outlined">{service.icon}</span>
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <div className="stitch-service-media">
                    <img src={service.image} alt={service.title} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="stitch-process">
          <div className="stitch-shell stitch-process-shell">
            <h2>Simple Path to Quality Seva</h2>
            <div className="stitch-step-grid">
              <div className="stitch-step-line" />
              {steps.map((step) => (
                <article className="stitch-step" key={step.title}>
                  <div className="stitch-step-icon">
                    <span className="material-symbols-outlined">{step.icon}</span>
                  </div>
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="story" className="stitch-story">
          <div className="stitch-shell stitch-story-grid">
            <div className="stitch-story-visual">
              <div className="stitch-story-glow" />
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPYGrOwnLyLOwLbL1GLf-FUiNs-B_lCgiDkEmTsCWcfpsHrMkW7-7f6uPw1wXbnoDT3A2mXsSmR9_lpytVMZpyjUBzvMZ_bJkckqVp_2KoeZpIX50lgDxbS_YbtZnzdXDhBSuRQASspsPOAi0ZQKjyQqUAeWWJKoHBwcj6lDDG2rF2kTeToHG1Txk63iQeRXEkUnF3FDAgUKek4VFor2ojYs99NSWYF4qOeXdygFy1unWE4fALG-jCr3toKHSFwJMiQDZzjM2_sMUw"
                alt="Seva Bhav illustration"
              />
            </div>
            <div className="stitch-story-copy">
              <h2>
                Driven by <span>Seva Bhav</span>
              </h2>
              <p>
                Seva Setu is not just a platform; it is a movement to restore trust and dignity in household services.
                We believe that every helper deserves respect and every home deserves peace of mind.
              </p>
              <div className="stitch-stats">
                <div>
                  <strong>10k+</strong>
                  <span>Happy Homes</span>
                </div>
                <div>
                  <strong>15k+</strong>
                  <span>Verified Helpers</span>
                </div>
              </div>
              <Link to="/support" className="stitch-text-link stitch-story-link">
                Learn about our values <span className="material-symbols-outlined">east</span>
              </Link>
            </div>
          </div>
        </section>

        <section id="support" className="stitch-contact">
          <div className="stitch-shell">
            <div className="stitch-contact-panel">
              <div className="stitch-contact-copy">
                <h2>Need assistance?</h2>
                <p>Our community support team is here to help you find the right match for your home.</p>
                <div className="stitch-contact-list">
                  <div>
                    <span className="material-symbols-outlined">call</span>
                    <strong>+91 (800) SEVA-SETU</strong>
                  </div>
                  <div>
                    <span className="material-symbols-outlined">mail</span>
                    <strong>support@sevasetu.com</strong>
                  </div>
                </div>
              </div>
              <form className="stitch-contact-form" onSubmit={handleContactSubmit}>
                <div className="stitch-form-grid">
                  <label>
                    <span>Your Name</span>
                    <input type="text" placeholder="John Doe" required />
                  </label>
                  <label>
                    <span>Email Address</span>
                    <input type="email" placeholder="john@example.com" required />
                  </label>
                </div>
                <label>
                  <span>How can we help?</span>
                  <textarea rows="4" placeholder="Describe your requirements..." required />
                </label>
                <button type="submit" className="stitch-button stitch-button-primary stitch-button-submit">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="stitch-footer">
        <div className="stitch-shell stitch-footer-grid">
          <div className="stitch-footer-brand">
            <Link to="/landing">Seva Setu</Link>
            <p>© 2024 Seva Setu. Crafting human connection through reliable care. Built with compassion in every pixel.</p>
            <div className="stitch-social-links">
              <a href="#services" aria-label="Services">
                <span className="material-symbols-outlined">language</span>
              </a>
              <a href="#story" aria-label="Community">
                <span className="material-symbols-outlined">public</span>
              </a>
            </div>
          </div>
          <div className="stitch-footer-links">
            <div>
              <strong>Platform</strong>
              <Link to="/support">Privacy Policy</Link>
              <Link to="/support">Terms of Service</Link>
            </div>
            <div>
              <strong>Community</strong>
              <Link to="/support">Safety Guidelines</Link>
              <Link to="/support">Community Rules</Link>
            </div>
            <div>
              <strong>Support</strong>
              <Link to="/support">Contact Us</Link>
            </div>
          </div>
        </div>
        <div className="stitch-footer-note">Handcrafted with love for modern homes and dignified providers.</div>
      </footer>
    </div>
  );
}
