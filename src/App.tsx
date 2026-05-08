import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';

import logoMef         from './assets/clientes/mef.png';
import logoBci         from './assets/clientes/bci-miami.png';
import logoBanmat      from './assets/clientes/banmat.png';
import logoFondepes    from './assets/clientes/fondepes.png';
import logoFpf         from './assets/clientes/fpf.png';
import logoMitsui      from './assets/clientes/mitsui.png';
import logoVivienda    from './assets/clientes/vivienda.png';
import logoProinversion from './assets/clientes/proinversion.png';
import logoMepsa       from './assets/clientes/mepsa.png';

// ─── USE IN VIEW HOOK ─────────────────────────────────────────────────────────

function useInView(threshold = 0.1) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface LeadForm {
  propertyType: string;
  district: string;
  location: string;
  area: string;
  purpose: string;
  name: string;
  phone: string;
  email: string;
  message: string;
}

const EMPTY_FORM: LeadForm = {
  propertyType: 'Departamento',
  district: 'Surco',
  location: '',
  area: '',
  purpose: 'Garantía hipotecaria (banco)',
  name: '',
  phone: '',
  email: '',
  message: '',
};

const PROPERTY_TYPES = ['Departamento', 'Casa', 'Terreno', 'Local Comercial', 'Oficina', 'Industrial'];
const DISTRICTS = [
  'Surco', 'Miraflores', 'San Borja', 'San Isidro', 'La Molina',
  'Jesús María', 'Magdalena del Mar', 'Pueblo Libre', 'San Miguel',
  'Lince', 'Barranco', 'Chorrillos', 'San Juan de Miraflores', 'Callao', 'Otro',
];
const PURPOSES = [
  'Garantía hipotecaria (banco)',
  'Venta / Compra',
  'Proceso judicial',
  'Herencia / Divorcio',
  'Referencia personal',
];

// ─── CONSULTATION MODAL ───────────────────────────────────────────────────────

const ConsultationModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [form, setForm] = useState<LeadForm>(EMPTY_FORM);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [waUrl, setWaUrl] = useState<string | null>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => { setStatus('idle'); setForm(EMPTY_FORM); setWaUrl(null); }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = (Array.from(
      modal.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ) as HTMLElement[]).filter((el) => !el.hasAttribute('disabled'));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    setTimeout(() => first?.focus(), 50);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const set = (field: keyof LeadForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, phone: form.phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setWaUrl(data.waUrl ?? null);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const inputCls =
    'w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-navy transition-colors';
  const selectCls = `${inputCls} appearance-none cursor-pointer`;
  const labelCls = 'block text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-navy/70 mb-1.5';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="bg-brand-ivory w-full md:max-w-[560px] md:rounded-2xl rounded-t-3xl max-h-[92dvh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-brand-ivory border-b border-black/[0.07] px-6 py-5 flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] font-bold text-brand-navy/60 mb-1">
                  JCB CONSULT
                </p>
                <h2 id="modal-title" className="font-bold text-xl text-brand-navy leading-tight">
                  Agendemos su consulta
                </h2>
                <p className="text-[12px] text-brand-navy/60 mt-0.5">Le responderemos a la brevedad</p>
              </div>
              <button
                onClick={onClose}
                className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-black/[0.06] transition-colors text-brand-navy/40 hover:text-brand-navy -mr-1.5"
                aria-label="Cerrar"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3l10 10M13 3L3 13" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-8 flex flex-col items-center text-center"
                  >
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-5">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-2xl text-brand-navy mb-2">
                      Solicitud recibida
                    </h3>
                    <p className="text-[14px] text-brand-navy/55 mb-8 max-w-sm leading-relaxed">
                      Juan Carlos Bejarano se pondrá en contacto con usted a la brevedad. También puede escribirle directamente ahora.
                    </p>
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-[#25D366] text-white rounded-full py-4 text-[13px] font-bold tracking-wide flex items-center justify-center gap-2.5 hover:bg-[#1ebe59] transition-colors mb-4"
                      >
                        <WaIcon />
                        Continuar por WhatsApp
                      </a>
                    )}
                    <button
                      onClick={onClose}
                      className="text-[12px] text-brand-navy/40 hover:text-brand-navy transition-colors uppercase tracking-[0.2em] font-semibold"
                    >
                      Cerrar
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="f-propertyType" className={labelCls}>Tipo de inmueble</label>
                        <select id="f-propertyType" className={selectCls} value={form.propertyType} onChange={set('propertyType')}>
                          {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="f-district" className={labelCls}>Distrito</label>
                        <select id="f-district" className={selectCls} value={form.district} onChange={set('district')}>
                          {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="f-location" className={labelCls}>Dirección / Ubicación del inmueble *</label>
                      <input
                        id="f-location"
                        required
                        type="text"
                        autoComplete="street-address"
                        placeholder="Ej. Av. Caminos del Inca 890, Surco"
                        className={inputCls}
                        value={form.location}
                        onChange={set('location')}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="f-area" className={labelCls}>Área aprox. (m²)</label>
                        <input
                          id="f-area"
                          type="number"
                          placeholder="Ej. 85"
                          className={inputCls}
                          value={form.area}
                          onChange={set('area')}
                        />
                      </div>
                      <div>
                        <label htmlFor="f-purpose" className={labelCls}>Finalidad</label>
                        <select id="f-purpose" className={selectCls} value={form.purpose} onChange={set('purpose')}>
                          {PURPOSES.map((p) => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="f-name" className={labelCls}>Nombre</label>
                        <input
                          id="f-name"
                          required
                          type="text"
                          autoComplete="name"
                          placeholder="Juan Pérez"
                          className={inputCls}
                          value={form.name}
                          onChange={set('name')}
                        />
                      </div>
                      <div>
                        <label htmlFor="f-phone" className={labelCls}>Teléfono *</label>
                        <input
                          id="f-phone"
                          required
                          type="tel"
                          autoComplete="tel"
                          placeholder="999 999 999"
                          className={inputCls}
                          value={form.phone}
                          onChange={set('phone')}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="f-email" className={labelCls}>Email <span className="normal-case font-normal text-brand-navy/30">(opcional)</span></label>
                      <input
                        id="f-email"
                        type="email"
                        autoComplete="email"
                        placeholder="correo@ejemplo.com"
                        className={inputCls}
                        value={form.email}
                        onChange={set('email')}
                      />
                    </div>

                    <div>
                      <label htmlFor="f-message" className={labelCls}>Mensaje breve <span className="normal-case font-normal text-brand-navy/30">(opcional)</span></label>
                      <textarea
                        id="f-message"
                        rows={3}
                        placeholder="Cuéntenos más sobre el inmueble o sus necesidades..."
                        className={`${inputCls} resize-none`}
                        value={form.message}
                        onChange={set('message')}
                      />
                    </div>

                    {status === 'error' && (
                      <p role="alert" className="text-red-500 text-[12px] font-semibold">
                        Ocurrió un error. Por favor intente de nuevo.
                      </p>
                    )}

                    <div className="pt-2 space-y-3">
                      <button
                        disabled={status === 'loading'}
                        type="submit"
                        className="w-full bg-brand-navy text-white rounded-full py-4 text-[13px] font-bold uppercase tracking-[0.2em] hover:bg-brand-navy/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {status === 'loading' ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Enviando...
                        </span>
                      ) : 'Enviar solicitud'}
                      </button>
                      <p className="text-center text-[11px] text-brand-navy/35 font-medium">
                        Al enviar, recibirá respuesta a la brevedad
                      </p>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── FLOATING CTA (MOBILE) ────────────────────────────────────────────────────

const FloatingCTA = ({ onClick }: { onClick: () => void }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 120);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          onClick={onClick}
          aria-label="Agendemos una cita"
          style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          className="fixed left-1/2 -translate-x-1/2 z-40 md:hidden
                     bg-brand-navy text-white rounded-full border border-white/20
                     px-8 py-4 shadow-2xl shadow-black/30
                     text-[13px] font-bold uppercase tracking-[0.18em]
                     flex items-center gap-2.5
                     active:scale-95 transition-transform"
        >
          Agendemos una cita
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// ─── SHARED ICON ──────────────────────────────────────────────────────────────

const WaIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.123 1.532 5.855L.054 23.454a.75.75 0 00.91.91l5.6-1.479A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.714 9.714 0 01-4.95-1.354l-.355-.21-3.674.969.984-3.594-.23-.369A9.71 9.71 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
  </svg>
);

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

const Navbar = ({ onContact }: { onContact: () => void }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = [
    { href: '#tasaciones', label: 'Tasaciones' },
    { href: '#peritajes', label: 'Peritajes' },
    { href: '#blog', label: 'Blog' },
    { href: '#contacto', label: 'Contacto' },
  ];

  return (
    <>
      {/* Full-width nav — fades out on scroll */}
      <motion.nav
        animate={{ opacity: scrolled ? 0 : 1, y: scrolled ? -6 : 0 }}
        transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ pointerEvents: scrolled ? 'none' : 'auto' }}
        className="sticky top-0 w-full z-50 bg-brand-ivory/95 backdrop-blur-md border-b border-black/[0.07]"
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-14 lg:px-20 h-[60px] flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Inicio — JCB Consult"
            className="flex-shrink-0 h-[60px] overflow-hidden flex items-center"
          >
            <img src="/JCBLOGO.png" alt="JCB Consult" className="h-24 w-auto" style={{ mixBlendMode: 'multiply' }} />
          </button>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ href, label }) => (
              <a key={href} href={href} className="text-[12px] font-medium text-brand-navy/65 hover:text-brand-navy transition-colors">
                {label}
              </a>
            ))}
            <button
              onClick={onContact}
              className="bg-brand-navy text-white rounded-full px-5 py-2.5 text-[12px] font-semibold hover:bg-brand-navy/90 transition-colors"
            >
              Agendar consulta
            </button>
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="md:hidden w-11 h-11 flex flex-col items-center justify-center gap-[5px] -mr-1.5"
          >
            <motion.span animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.2 }} className="block w-5 h-px bg-brand-navy origin-center" />
            <motion.span animate={menuOpen ? { opacity: 0 } : { opacity: 1 }} transition={{ duration: 0.15 }} className="block w-5 h-px bg-brand-navy" />
            <motion.span animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.2 }} className="block w-5 h-px bg-brand-navy origin-center" />
          </button>
        </div>
      </motion.nav>

      {/* Dynamic Island pill — appears on scroll */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.92 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-brand-navy/95 backdrop-blur-md text-white rounded-full px-4 py-2 flex items-center gap-5 shadow-2xl shadow-black/25 border border-white/[0.08]">
              {/* Logo */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Inicio"
                className="h-8 overflow-hidden flex items-center flex-shrink-0"
              >
                <img src="/JCBLOGO.png" alt="JCB Consult" className="h-16 w-auto" style={{ filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
              </button>

              {/* Divider */}
              <div className="w-px h-4 bg-white/15 hidden md:block" />

              {/* Nav links */}
              <div className="hidden md:flex items-center gap-4">
                {navLinks.map(({ href, label }) => (
                  <a key={href} href={href} className="text-[11px] font-medium text-white/60 hover:text-white transition-colors">
                    {label}
                  </a>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={onContact}
                className="bg-brand-gold text-white rounded-full px-4 py-1.5 text-[11px] font-bold hover:bg-brand-gold/90 transition-colors ml-1"
              >
                Agendar
              </button>

              {/* Mobile hamburger in pill */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Abrir menú"
                className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-[4px]"
              >
                <span className="block w-4 h-px bg-white/70" />
                <span className="block w-4 h-px bg-white/70" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-72 z-50 bg-brand-ivory shadow-2xl md:hidden flex flex-col"
            >
              <div className="h-[60px] overflow-hidden flex items-center justify-between px-6 border-b border-black/[0.07]">
                <img src="/JCBLOGO.png" alt="JCB Consult" className="h-24 w-auto" style={{ mixBlendMode: 'multiply' }} />
                <button onClick={() => setMenuOpen(false)} aria-label="Cerrar menú" className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-black/[0.06] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 2l10 10M12 2L2 12" /></svg>
                </button>
              </div>
              <nav className="flex flex-col px-6 py-8 gap-1 flex-1">
                {navLinks.map(({ href, label }) => (
                  <a key={href} href={href} onClick={() => setMenuOpen(false)} className="text-[15px] font-medium text-brand-navy py-3 border-b border-black/[0.06] hover:text-brand-navy/70 transition-colors">
                    {label}
                  </a>
                ))}
              </nav>
              <div className="px-6 pb-8">
                <button
                  onClick={() => { setMenuOpen(false); onContact(); }}
                  className="w-full bg-brand-navy text-white rounded-full py-4 text-[13px] font-bold uppercase tracking-[0.18em] hover:bg-brand-navy/90 transition-colors"
                >
                  Agendar consulta
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── HERO ─────────────────────────────────────────────────────────────────────

const HERO_SLIDES = [
  {
    bg: 'bg-brand-ivory',
    dark: false,
    badge: 'Perito Certificado · SBS · Ministerio de Vivienda · CIP',
    name: undefined as string | undefined,
    overline: 'Estudio Técnico · Lima Metropolitana',
    title: 'Informes técnicos\nque resisten\ncualquier\ncuestionamiento.',
    desc: 'Tasaciones de inmuebles, vehículos y equipos. Peritajes judiciales y consultoría técnica. Aceptados por bancos, ministerios y juzgados.',
    photo: null as string | null,
    chips: undefined as string[] | undefined,
  },
  {
    bg: 'bg-brand-navy',
    dark: true,
    badge: 'CEO · JCB Consult',
    name: 'JUAN CARLOS BEJARANO' as string | undefined,
    overline: 'MBA – Ingeniero Civil – Perito',
    title: 'Perito Tasador\nCertificado SBS.',
    desc: 'Fundador de JCB Consult. Certificado por SBS, Ministerio de Vivienda y Colegio de Ingenieros del Perú.',
    photo: '/JCBHERO.png' as string | null,
    chips: ['MBA', 'Ing. Civil CIP', 'Perito SBS', 'Perito MVCS', 'Perito CIP'],
  },
  {
    bg: 'bg-brand-ivory',
    dark: false,
    badge: 'Informes válidos · Bancos · Ministerios · Juzgados',
    name: undefined as string | undefined,
    overline: 'La diferencia de ser independiente',
    title: 'Su propiedad\nvale más de lo\nque el banco\ndetermina.',
    desc: 'Los tasadores bancarios protegen al banco, no a usted. JCB Consult determina el valor real de mercado con metodología técnica imparcial.',
    photo: null as string | null,
    chips: undefined as string[] | undefined,
  },
];

const Hero = ({ onContact }: { onContact: () => void }) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = React.useRef(0);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [paused]);

  const goTo = (idx: number) => {
    setCurrent(idx);
    setPaused(true);
    setTimeout(() => setPaused(false), 8000);
  };

  const prev = () => { goTo((current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length); };
  const next = () => { goTo((current + 1) % HERO_SLIDES.length); };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 48) diff > 0 ? next() : prev();
  };

  const slide = HERO_SLIDES[current];
  const ctrl = slide.dark
    ? { arrow: 'border-white/20 text-white/50 hover:text-white hover:border-white/50', dotActive: 'bg-white', dotInactive: 'bg-white/25 hover:bg-white/55', progress: 'bg-white/10', progressFill: 'bg-white/45' }
    : { arrow: 'border-brand-navy/15 text-brand-navy/35 hover:text-brand-navy hover:border-brand-navy/40', dotActive: 'bg-brand-navy', dotInactive: 'bg-brand-navy/20 hover:bg-brand-navy/45', progress: 'bg-black/[0.07]', progressFill: 'bg-brand-gold/60' };

  return (
  <section
    className="relative overflow-hidden min-h-[680px] md:min-h-[80vh]"
    onMouseEnter={() => setPaused(true)}
    onMouseLeave={() => setPaused(false)}
    onTouchStart={handleTouchStart}
    onTouchEnd={handleTouchEnd}
  >
    <AnimatePresence>
      <motion.div
        key={current}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.03 }}
        transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
        className={`absolute inset-0 flex flex-col pb-20 md:pb-16
          ${slide.photo ? 'justify-start md:justify-center pt-0' : 'justify-center pt-8'}
          ${slide.bg}`}
      >
        {/* Desktop photo — right half bleeding */}
        {slide.photo && (
          <div className="absolute inset-y-0 right-0 w-[43%] hidden md:block z-[2]">
            <img
              src={slide.photo}
              alt="Juan Carlos Bejarano — CEO JCB Consult"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/90 via-brand-navy/15 to-transparent" />
          </div>
        )}

        {/* Mobile photo — full width at top */}
        {slide.photo && (
          <div className="md:hidden relative w-full mb-5">
            <img
              src={slide.photo}
              alt="Juan Carlos Bejarano"
              className="w-full h-[60vw] object-cover object-top"
            />
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-brand-navy via-brand-navy/70 to-transparent" />
          </div>
        )}

        {/* Logo watermark */}
        <img
          src="/JCBLOGO.png"
          alt=""
          aria-hidden="true"
          className="absolute pointer-events-none select-none z-[1]"
          style={{
            opacity: current === 1 ? 0.07 : 0.05,
            width: '70vw',
            maxWidth: '860px',
            left: '50%',
            right: 'auto',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            mixBlendMode: current === 1 ? 'normal' : 'multiply',
          }}
        />

        {/* Text content */}
        <div className={`relative z-10 px-6 md:px-14 lg:px-20 ${
          slide.photo
            ? 'md:max-w-[57%]'
            : current === 0
              ? 'w-full max-w-[1400px] mx-auto text-center flex flex-col items-center'
              : 'max-w-[720px]'
        }`}>
          <div className={`inline-flex items-center rounded-full px-4 py-1.5 w-fit border mb-5 ${slide.dark ? 'bg-white/[0.07] border-white/15 text-white/55' : 'bg-brand-navy/[0.07] border-brand-gold/30 text-brand-navy/60'}`}>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">{slide.badge}</span>
          </div>

          <p className={`text-[11px] uppercase tracking-[0.32em] font-bold mb-4 ${slide.dark ? 'text-white/50' : 'text-brand-navy/50'}`}>
            {slide.overline}
          </p>

          {slide.name && (
            <p
              className={`font-bold uppercase tracking-[0.12em] mb-2 ${slide.dark ? 'text-white/90' : 'text-brand-navy'}`}
              style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.5rem)' }}
            >
              {slide.name}
            </p>
          )}
          <h1
            className={`font-bold leading-[1.08] mb-6 whitespace-pre-line ${slide.dark ? 'text-white' : 'text-brand-navy'} ${current === 0 ? 'max-w-[820px]' : ''}`}
            style={{ fontSize: 'clamp(2rem, 5.5vw, 5rem)' }}
          >
            {slide.title}
          </h1>

          {slide.chips && (
            <div className="hidden md:flex flex-wrap gap-2 mb-6">
              {slide.chips.map((c) => (
                <span key={c} className={`text-[10px] font-bold uppercase tracking-[0.2em] border rounded-full px-3 py-1 ${slide.dark ? 'border-white/15 text-white/50' : 'border-brand-navy/15 text-brand-navy/50'}`}>
                  {c}
                </span>
              ))}
            </div>
          )}

          <p className={`text-[15px] md:text-[16px] leading-[1.75] mb-8 ${slide.dark ? 'text-white/65' : 'text-brand-navy/70'} ${current === 0 ? 'max-w-[600px]' : ''}`}>
            {slide.desc}
          </p>

          <div className={`flex flex-col sm:flex-row sm:items-center gap-3 ${current === 0 ? 'justify-center' : ''}`}>
            <button
              onClick={onContact}
              className={`rounded-full px-8 py-4 text-[13px] font-bold uppercase tracking-[0.18em] active:scale-[0.98] transition-all shadow-lg ${
                slide.dark
                  ? 'bg-white text-brand-navy shadow-black/20 hover:bg-white/92'
                  : 'bg-brand-navy text-white shadow-brand-navy/20 hover:bg-brand-navy/90'
              }`}
            >
              Agendemos una cita
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>

    {/* Controls */}
    <div className="absolute bottom-6 left-6 md:left-14 lg:left-20 z-20 flex items-center gap-3">
      <button onClick={prev} aria-label="Slide anterior" className={`w-11 h-11 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${ctrl.arrow}`}>
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 1.5L3.5 5.5 7 9.5" />
        </svg>
      </button>
      {HERO_SLIDES.map((_, i) => (
        <button
          key={i}
          onClick={() => goTo(i)}
          aria-label={`Ir a slide ${i + 1}`}
          className="flex-shrink-0 flex items-center justify-center py-4 px-1.5"
        >
          <span className={`transition-all duration-300 rounded-full block ${i === current ? `w-5 h-1.5 ${ctrl.dotActive}` : `w-1.5 h-1.5 ${ctrl.dotInactive}`}`} />
        </button>
      ))}
      <button onClick={next} aria-label="Siguiente slide" className={`w-11 h-11 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${ctrl.arrow}`}>
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 1.5L7.5 5.5 4 9.5" />
        </svg>
      </button>
      <div className={`flex-1 h-px ml-1 hidden md:block overflow-hidden min-w-[80px] ${ctrl.progress}`}>
        <motion.div
          key={`progress-${current}`}
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 5.5, ease: 'linear' }}
          className={`h-full origin-left ${ctrl.progressFill}`}
        />
      </div>
    </div>
  </section>
  );
};

// ─── CREDIBILITY STRIP ────────────────────────────────────────────────────────

const CredibilityStrip = () => {
  const stats = [
    { value: '25', suffix: 'años', label: 'de trayectoria' },
    { value: '300+', suffix: '', label: 'tasaciones realizadas' },
    { value: 'SBS', suffix: '', label: 'Superintendencia de Banca y Seguros' },
    { value: 'MVCS', suffix: '', label: 'Ministerio de Vivienda y Saneamiento' },
    { value: 'CIP', suffix: '', label: 'Colegio de Ingenieros del Perú' },
  ];

  const { ref: sectionRef, inView } = useInView(0.1);
  const desktopRowRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = desktopRowRef.current;
    if (!el) return;

    const handleScroll = () => {
      const section = el.closest('section');
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const total = viewportHeight + rect.height;
      if (total <= 0) return;
      const passed = viewportHeight - rect.top;
      const rawProgress = passed / total;
      const progress = Math.min(1, Math.max(0, rawProgress));
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      el.scrollLeft = maxScroll * progress;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="bg-white border-y border-black/[0.07]" ref={sectionRef}>
      {/* Mobile: horizontal scroll row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="md:hidden flex overflow-x-auto scrollbar-none px-6 divide-x divide-black/[0.07]"
      >
        {stats.map((s) => (
          <div key={s.label} className="flex-none py-6 px-7 text-center min-w-[100px]">
            <p className="font-bold text-brand-navy text-[1.7rem] leading-none mb-1">
              {s.value}
              {s.suffix && <span className="text-brand-navy/50 text-[0.45em] font-semibold ml-0.5">{s.suffix}</span>}
            </p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-brand-navy/55 font-semibold leading-tight max-w-[90px]">{s.label}</p>
          </div>
        ))}
      </motion.div>
      {/* Desktop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
      <div
        ref={desktopRowRef}
        className="hidden md:flex max-w-[1400px] mx-auto px-14 overflow-x-auto scrollbar-none divide-x divide-black/[0.07]"
      >
        {stats.map((s) => (
          <div key={s.label} className="flex-none py-10 px-10 text-center min-w-[220px]">
            <p
              className="font-bold leading-none text-brand-navy mb-2"
              style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}
            >
              {s.value}
              {s.suffix && <span className="text-brand-navy/50 text-[0.5em] font-semibold ml-1">{s.suffix}</span>}
            </p>
            <p className="text-[11px] uppercase tracking-[0.15em] text-brand-navy/55 font-semibold leading-tight max-w-[160px]">
              {s.label}
            </p>
          </div>
        ))}
      </div>
      </motion.div>
    </section>
  );
};

// ─── WHAT YOU RECEIVE ─────────────────────────────────────────────────────────

const WhatYouReceive = () => {
  const items = [
    {
      title: 'Servicio',
      desc: 'Documento suscrito por ingenieros habilitados, con experiencia, formación y certificación; sustento de valores y dictámenes determinados.',
    },
    {
      title: 'Análisis y evaluación',
      desc: 'Investigación y diagnóstico específico, para respaldar los resultados con data real y actualizada.',
    },
    {
      title: 'Entrega de resultados',
      desc: 'En formato y firma digital, en 5 días hábiles desde la evaluación. Aceptados por el sector privado, entidades financieras, estatales y judiciales.',
    },
  ];

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="peritajes" className="bg-brand-navy text-white px-6 md:px-14 lg:px-20 py-12 md:py-24">
      <div className="max-w-[1400px] mx-auto grid md:grid-cols-[1fr_1.7fr] gap-14 md:gap-24 items-start">
        <div>
          <p className="label-accent text-[11px] uppercase tracking-[0.32em] text-white/60 font-bold mb-5">Peritajes y tasaciones</p>
          <h2
            className="font-bold leading-[1.1] mb-6"
            style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3.2rem)' }}
          >
            Estudio técnico sólido, resultados directos que resisten cuestionamientos.
          </h2>
          <p className="text-[14px] leading-[1.8] text-white/65 max-w-[320px] mb-8">
            Cada servicio incluye visita de inspección, estudio de mercado, análisis de datos y aplicación de metodologías bajo las normativas vigentes.
          </p>
          <div className="space-y-2">
            {[
              'Reglamento Nacional de Tasaciones (MVCS)',
              'Normas SBS — Superintendencia de Banca y Seguros',
              'Normas del CIP — Colegio de Ingenieros del Perú',
              'Código Procesal Civil — Peritajes judiciales',
            ].map((norm) => (
              <div key={norm} className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-brand-gold flex-shrink-0" />
                <p className="text-[12px] text-white/50 leading-relaxed">{norm}</p>
              </div>
            ))}
          </div>
        </div>

        <div ref={containerRef}>
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 22 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.1 }}
              className="border-t border-white/10 py-8"
            >
              <h3 className="font-bold text-[1.1rem] mb-2 leading-tight">{item.title}</h3>
              <p className="text-[13px] text-white/65 leading-[1.7]">{item.desc}</p>
            </motion.div>
          ))}
          <div className="border-t border-white/15 pt-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/60 font-bold">
              APLICABLE A EMPRESAS, INSTITUCIONES FINANCIERAS Y JUZGADOS
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── SERVICES ─────────────────────────────────────────────────────────────────

const Services = ({ onContact }: { onContact: () => void }) => {
  const services = [
    {
      n: '01', title: 'Residencial',
      sub: 'CASAS – DEPARTAMENTOS – CONDOMINIOS',
      desc: 'Valorización del terreno y edificaciones, supervisión de obras, gestión de proyectos, informes técnicos.',
    },
    {
      n: '02', title: 'Terrenos',
      sub: 'URBANOS – INDUSTRIALES – RÚSTICOS',
      desc: 'Valorización, análisis de zonificación, habilitación urbana, servidumbres, afectaciones viales.',
    },
    {
      n: '03', title: 'Corporativo',
      sub: 'COMERCIAL – INDUSTRIA – INSTITUCIONAL',
      desc: 'Proyectos de inversión, evaluación de patrimonio, saneamiento técnico, tasación de equipos, valorización y baja de activos.',
    },
    {
      n: '04', title: 'Judicial',
      sub: 'SUCESIONES – DIVORCIOS – LITIGIOS',
      desc: 'Tasación de patrimonios, saneamiento técnico, consultoría, peritajes con valor probatorio.',
    },
  ];

  const listRef = React.useRef<HTMLDivElement>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="tasaciones" className="bg-brand-ivory px-6 md:px-14 lg:px-20 py-12 md:py-24 border-t border-black/[0.07]">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between border-b border-black/[0.08] pb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-brand-navy/50 font-bold mb-2">PERICIAS – TASACIONES</p>
            <h2 className="font-bold leading-tight" style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)' }}>
              Servicios JCB Consult
            </h2>
          </div>
        </div>

        <div ref={listRef}>
          {services.map((s, i) => (
            <motion.button
              key={s.n}
              initial={{ opacity: 0, y: 22 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.1 }}
              onClick={onContact}
              className="group w-full text-left border-b border-black/[0.08] py-6 grid grid-cols-[40px_1fr_auto] md:grid-cols-[56px_1fr_1.4fr_auto] gap-x-6 items-center hover:bg-black/[0.015] transition-colors duration-200 -mx-6 md:-mx-14 lg:-mx-20 px-6 md:px-14 lg:px-20 cursor-pointer"
            >
              <span className="text-[11px] font-bold text-brand-navy/25">{s.n}</span>
              <div>
                <h3 className="font-bold leading-tight mb-1" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)' }}>
                  {s.title}
                </h3>
                <p className="text-[10px] uppercase tracking-[0.28em] text-brand-navy/40 font-bold">{s.sub}</p>
              </div>
              <p className="text-[13px] text-brand-navy/65 leading-[1.65] hidden md:block max-w-[320px]">{s.desc}</p>
              <span className="text-brand-navy/20 group-hover:text-brand-gold group-hover:translate-x-1 transition-all duration-200 text-base">→</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── PROCESS ──────────────────────────────────────────────────────────────────

const PROCESS_STEPS = [
  {
    n: '01',
    title: 'Solicitud',
    desc: 'Complete el formulario con los datos del inmueble. Respondemos con una propuesta a la brevedad.',
  },
  {
    n: '02',
    title: 'Inspección',
    desc: 'Visita técnica presencial al inmueble. Medición, diagnóstico y registro fotográfico completo.',
  },
  {
    n: '03',
    title: 'Investigación',
    desc: 'Estudio de mercado con comparables vigentes. Análisis de data real y actualizada de la zona.',
  },
  {
    n: '04',
    title: 'Elaboración',
    desc: 'Redacción del informe bajo normativas SBS, MVCS y CIP. Metodología técnica certificada.',
  },
  {
    n: '05',
    title: 'Entrega',
    desc: 'Documento en formato digital con firma habilitada. Listo en 5 días hábiles desde la inspección.',
  },
];

const Process = ({ onContact }: { onContact: () => void }) => {
  const { ref, inView } = useInView(0.1);

  return (
    <section className="bg-white border-t border-black/[0.07] px-6 md:px-14 lg:px-20 py-12 md:py-24">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div ref={ref} className="mb-14 md:mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="label-accent text-[11px] uppercase tracking-[0.32em] text-brand-navy/50 font-bold mb-3">Cómo trabajamos</p>
            <h2 className="font-bold leading-tight" style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)' }}>
              Proceso claro,<br />resultados verificables.
            </h2>
          </div>
          <p className="text-[14px] text-brand-navy/55 leading-relaxed max-w-sm md:text-right">
            Cada servicio sigue el mismo método riguroso — sin excepciones.
          </p>
        </div>

        {/* Steps — desktop horizontal, mobile vertical */}
        <div className="relative">
          {/* Connector line desktop */}
          <div className="hidden md:block absolute top-[28px] left-0 right-0 h-px bg-brand-navy/[0.08]" />
          {/* Animated gold fill */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 }}
            className="hidden md:block absolute top-[28px] left-0 right-0 h-px bg-brand-gold/40 origin-left"
          />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
            {PROCESS_STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 + i * 0.12 }}
                className="relative md:pr-8"
              >
                {/* Mobile connector */}
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="md:hidden absolute left-[27px] top-[56px] bottom-0 w-px bg-brand-navy/[0.08]" />
                )}

                <div className="flex md:flex-col gap-5 md:gap-0 py-6 md:py-0">
                  {/* Step dot */}
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-brand-ivory border border-brand-navy/[0.1] flex items-center justify-center z-10 relative">
                      <span className="text-[11px] font-bold text-brand-gold tracking-[0.15em]">{step.n}</span>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="pt-0 md:pt-7">
                    <h3 className="font-bold text-[1.05rem] text-brand-navy mb-2 leading-tight">{step.title}</h3>
                    <p className="text-[12px] text-brand-navy/55 leading-[1.7]">{step.desc}</p>
                  </div>
                </div>

                {/* Mobile border */}
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="md:hidden absolute bottom-0 left-0 right-0 h-px bg-black/[0.06]" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-14 pt-10 border-t border-black/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <p className="text-[13px] text-brand-navy/50">
            ¿Tiene preguntas sobre el proceso? Juan Carlos Bejarano responde a la brevedad.
          </p>
          <button
            onClick={onContact}
            className="flex-shrink-0 bg-brand-navy text-white rounded-full px-7 py-3 text-[12px] font-bold uppercase tracking-[0.18em] hover:bg-brand-navy/90 active:scale-[0.98] transition-all"
          >
            Iniciar proceso
          </button>
        </motion.div>
      </div>
    </section>
  );
};

// ─── WHY INDEPENDENT ──────────────────────────────────────────────────────────

const WhyIndependent = () => {
  const { ref, inView } = useInView(0.1);
  return (
  <section className="bg-brand-navy text-white px-6 md:px-14 lg:px-20 py-12 md:py-24">
    <div ref={ref} className="max-w-[1400px] mx-auto grid md:grid-cols-[1fr_1.1fr] gap-14 md:gap-24 items-start">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <p className="label-accent text-[11px] uppercase tracking-[0.32em] text-white/60 font-bold mb-5">Por qué JCB</p>
        <h2
          className="font-bold leading-[1.1] mb-6"
          style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3.2rem)' }}
        >
          La tasación<br />independiente<br /><span style={{ color: '#C5A059' }}>protege su<br />patrimonio.</span>
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="pt-0 md:pt-10"
      >
        <div className="border-t border-white/10 pt-8 pb-9">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/55 font-bold mb-5">Tasador Bancario</p>
          <ul className="space-y-3">
            {[
              'Objetivo: proteger el riesgo del banco.',
              'Aplica factores de descuento conservadores.',
              'Puede subvaluar la propiedad hasta un 20%.',
            ].map((t) => <li key={t} className="text-[14px] text-white/60 leading-relaxed">{t}</li>)}
          </ul>
        </div>

        <div className="border-t border-white/20 pt-8 pb-9">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/75 font-bold mb-5">Tasador Independiente · JCB</p>
          <ul className="space-y-3">
            {[
              'Objetivo: determinar el valor real de mercado.',
              'Metodología técnica basada en comparables vigentes.',
              'Informe válido para bancos, empresas, ministerios y juzgados.',
            ].map((t) => <li key={t} className="text-[14px] text-white/80 leading-relaxed">{t}</li>)}
          </ul>
        </div>

        <div className="border-t border-white/[0.07] pt-7 flex items-end gap-3">
          <span className="font-bold leading-none text-white/[0.07]" style={{ fontSize: '5.5rem' }}>
            300+
          </span>
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/25 font-bold mb-3">tasaciones realizadas</p>
        </div>
      </motion.div>
    </div>
  </section>
  );
};

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: 'El informe de JCB Consult fue determinante para que el banco aprobara mi crédito hipotecario. Entrega puntual y documentación impecable.',
    name: 'Carlos Mendoza',
    role: 'Empresario · Miraflores',
    initials: 'CM',
  },
  {
    quote: 'Necesitaba una tasación urgente para un proceso de herencia. Juan Carlos resolvió todo en tiempo récord con un informe que el juzgado aceptó sin objeciones.',
    name: 'Patricia Villanueva',
    role: 'Abogada · San Isidro',
    initials: 'PV',
  },
  {
    quote: 'Trabajamos con JCB Consult para valorizar el portafolio inmobiliario de la empresa. Metodología sólida, trato profesional y conocimiento técnico destacado.',
    name: 'Roberto Salas',
    role: 'Gerente de Finanzas · Lima',
    initials: 'RS',
  },
];

const Testimonials = () => {
  const { ref, inView } = useInView(0.1);

  return (
    <section className="bg-brand-ivory border-t border-black/[0.07] px-6 md:px-14 lg:px-20 py-12 md:py-24">
      <div ref={ref} className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 md:mb-16"
        >
          <p className="label-accent text-[11px] uppercase tracking-[0.32em] text-brand-navy/50 font-bold mb-3">Clientes</p>
          <h2 className="font-bold leading-tight" style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)' }}>
            Lo que dicen quienes<br className="hidden md:block" /> confiaron en JCB Consult.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.12 }}
              className="bg-white rounded-2xl p-7 border border-black/[0.06] flex flex-col gap-6"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <svg key={s} width="13" height="13" viewBox="0 0 12 12" fill="#C5A059">
                    <path d="M6 0l1.5 4.5H12L8.25 7.5l1.5 4.5L6 9.75 2.25 12l1.5-4.5L0 4.5h4.5z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-[14px] text-brand-navy/70 leading-[1.75] flex-1">
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-black/[0.06] pt-5">
                <div className="w-9 h-9 rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-white tracking-wide">{t.initials}</span>
                </div>
                <div>
                  <p className="font-bold text-[13px] text-brand-navy leading-none mb-0.5">{t.name}</p>
                  <p className="text-[11px] text-brand-navy/45">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── CLIENTS ──────────────────────────────────────────────────────────────────

const LOGOS = [
  { src: logoMef,          alt: 'Ministerio de Economía y Finanzas' },
  { src: logoBci,          alt: 'BCI Miami' },
  { src: logoBanmat,       alt: 'Banmat' },
  { src: logoFondepes,     alt: 'FONDEPES' },
  { src: logoFpf,          alt: 'FPF' },
  { src: logoMitsui,       alt: 'Mitsui' },
  { src: logoVivienda,     alt: 'Ministerio de Vivienda' },
  { src: logoProinversion, alt: 'ProInversión' },
  { src: logoMepsa,        alt: 'MEPSA' },
];

const Clients = () => {
  const { ref, inView } = useInView(0.1);
  return (
  <section className="bg-white border-t border-black/[0.07] py-10 md:py-16">
    <div ref={ref} className="max-w-[1400px] mx-auto px-6 md:px-14 lg:px-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="mb-10 md:mb-12"
      >
        <p className="label-accent text-[11px] uppercase tracking-[0.32em] text-brand-navy/55 font-bold mb-2">Instituciones</p>
        <h2 className="font-bold leading-tight" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.4rem)' }}>
          Entidades que han confiado<br className="hidden md:block" /> en nuestros informes
        </h2>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.15 }}
        className="grid grid-cols-2 md:grid-cols-3"
      >
        {LOGOS.map((logo) => (
          <div
            key={logo.alt}
            className="flex items-center justify-center py-8 md:py-12 px-6 md:px-10 border-b border-r border-black/[0.06] last:border-r-0 [&:nth-child(2n)]:border-r-0 md:[&:nth-child(2n)]:border-r md:[&:nth-child(3n)]:border-r-0"
          >
            <img
              src={logo.src}
              alt={logo.alt}
              className="h-auto max-h-[100px] md:max-h-[140px] w-auto max-w-full object-contain transition duration-150"
            />
          </div>
        ))}
      </motion.div>
    </div>
  </section>
  );
};

// ─── CONTACT SECTION ──────────────────────────────────────────────────────────

const ContactSection = ({ onContact }: { onContact: () => void }) => {
  const { ref, inView } = useInView(0.1);
  return (
  <section id="contacto" className="bg-brand-navy text-white px-6 md:px-14 lg:px-20 py-12 md:py-24">
    <div ref={ref} className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-14 md:gap-24 items-center">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <p className="label-accent text-[11px] uppercase tracking-[0.32em] text-white/60 font-bold mb-5">Contacto</p>
        <h2
          className="font-bold leading-[1.1] mb-6"
          style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3.2rem)' }}
        >
          ¿Quisieras conversar<br />sobre su caso?
        </h2>
        <p className="text-[14px] leading-[1.8] text-white/65 max-w-[380px] mb-10">
          Cuéntenos qué necesita y Juan Carlos Bejarano le responderá con una propuesta personalizada.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onContact}
            className="bg-white text-brand-navy rounded-full px-8 py-4 text-[13px] font-bold uppercase tracking-[0.18em] hover:bg-white/90 active:scale-[0.98] transition-all"
          >
            Agendemos una cita
          </button>
          <button
            onClick={onContact}
            className="bg-black text-white rounded-full px-8 py-4 text-[13px] font-bold flex items-center gap-2.5 hover:bg-black/80 transition-colors"
          >
            <WaIcon />
            Contactar por WhatsApp
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="border-t md:border-t-0 md:border-l border-white/10 pt-10 md:pt-0 md:pl-14 space-y-8"
      >
        {[
          { label: 'Cobertura', value: 'Lima Metropolitana y Callao · Regiones' },
          { label: 'Tiempo de respuesta', value: 'A la brevedad · Lima y Regiones' },
          { label: 'Entrega de informe', value: '5 días hábiles desde la evaluación · según tipo de servicio' },
          { label: 'Formato', value: 'Digital (PDF) o físico según corresponda' },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-[11px] uppercase tracking-[0.32em] text-white/50 font-bold mb-1">{item.label}</p>
            <p className="text-[15px] font-semibold">{item.value}</p>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
  );
};

// ─── FOOTER ───────────────────────────────────────────────────────────────────

// ─── COTIZADOR ────────────────────────────────────────────────────────────────

const PRECIOS_BASE: Record<string, [number, number]> = {
  'Departamento':    [350, 520],
  'Casa':            [450, 680],
  'Terreno':         [300, 460],
  'Local Comercial': [500, 750],
  'Oficina':         [420, 650],
  'Industrial':      [580, 900],
};

const Cotizador = ({ onContact }: { onContact: () => void }) => {
  const [tipo, setTipo] = useState('Departamento');
  const [area, setArea] = useState('');
  const [finalidad, setFinalidad] = useState('Garantía hipotecaria (banco)');
  const { ref, inView } = useInView(0.1);

  const estimate = () => {
    const [lo, hi] = PRECIOS_BASE[tipo] ?? [380, 560];
    const a = parseFloat(area) || 80;
    const af = a > 200 ? 1.5 : a > 120 ? 1.25 : a > 80 ? 1.1 : 1;
    const jf = ['Proceso judicial', 'Herencia / Divorcio'].includes(finalidad) ? 1.3 : 1;
    return [Math.round(lo * af * jf / 10) * 10, Math.round(hi * af * jf / 10) * 10];
  };

  const [lo, hi] = estimate();
  const hasArea = area !== '';

  return (
    <section id="cotizador" className="bg-white border-t border-black/[0.07] px-6 md:px-14 lg:px-20 py-12 md:py-24">
      <div ref={ref} className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="text-[11px] uppercase tracking-[0.32em] text-brand-navy/50 font-bold mb-2">Herramienta</p>
          <h2 className="font-bold leading-tight" style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)' }}>
            Cotizador rápido
          </h2>
          <p className="text-[14px] text-brand-navy/55 mt-2 max-w-lg">
            Ingrese los datos del inmueble para obtener un precio referencial. La cotización exacta y sin costo se coordina con Juan Carlos Bejarano.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid md:grid-cols-[1fr_auto] gap-8 md:gap-16 items-start"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-navy/60 mb-1.5">Tipo de inmueble</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full bg-brand-ivory border border-black/[0.1] rounded-lg px-4 py-3 text-[14px] text-brand-navy appearance-none cursor-pointer focus:outline-none focus:border-brand-navy transition-colors"
              >
                {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-navy/60 mb-1.5">Área (m²)</label>
              <input
                type="number"
                placeholder="Ej. 85"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full bg-brand-ivory border border-black/[0.1] rounded-lg px-4 py-3 text-[14px] text-brand-navy placeholder:text-brand-navy/30 focus:outline-none focus:border-brand-navy transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-navy/60 mb-1.5">Finalidad</label>
              <select
                value={finalidad}
                onChange={(e) => setFinalidad(e.target.value)}
                className="w-full bg-brand-ivory border border-black/[0.1] rounded-lg px-4 py-3 text-[14px] text-brand-navy appearance-none cursor-pointer focus:outline-none focus:border-brand-navy transition-colors"
              >
                {PURPOSES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="border border-black/[0.08] rounded-2xl p-6 min-w-[220px] bg-brand-ivory">
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-navy/45 font-bold mb-1">Precio referencial</p>
            {hasArea ? (
              <p className="font-bold text-brand-navy leading-none mt-2 mb-1" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
                S/. {lo.toLocaleString()} – {hi.toLocaleString()}
              </p>
            ) : (
              <p className="font-bold text-brand-navy/25 leading-none mt-2 mb-1" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
                S/. ···
              </p>
            )}
            <p className="text-[11px] text-brand-navy/40 mb-5">Incluye informe + firma digital · Lima</p>
            <button
              onClick={onContact}
              className="w-full bg-brand-navy text-white rounded-full py-3 text-[12px] font-bold uppercase tracking-[0.18em] hover:bg-brand-navy/90 active:scale-[0.98] transition-all"
            >
              Cotización exacta
            </button>
            <p className="text-[10px] text-brand-navy/35 text-center mt-2">Sin costo — respuesta en 24 h</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── BLOG ─────────────────────────────────────────────────────────────────────

const Blog = () => {
  const { ref, inView } = useInView(0.1);
  return (
    <section id="blog" className="bg-brand-ivory px-6 md:px-14 lg:px-20 py-12 md:py-24 border-t border-black/[0.07]">
      <div ref={ref} className="max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between border-b border-black/[0.08] pb-8 mb-12">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-brand-navy/50 font-bold mb-2">Noticias y artículos</p>
            <h2 className="font-bold leading-tight" style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)' }}>
              Blog JCB Consult
            </h2>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-brand-navy/[0.06] flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-navy/40">
              <rect x="2" y="3" width="16" height="14" rx="2" />
              <path d="M6 7h8M6 10h8M6 13h5" />
            </svg>
          </div>
          <p className="text-[13px] text-brand-navy/50 font-medium">Próximamente — artículos sobre tasaciones y peritajes</p>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-brand-navy text-white border-t border-white/[0.06] px-6 md:px-14 py-10">
    <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
      <div>
        <img
          src="/JCBLOGO.png"
          alt="JCB Consult"
          className="h-8 w-auto mb-1"
          style={{ filter: 'brightness(0) invert(1)', opacity: 0.85 }}
        />
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/40 font-bold">Tasaciones · Peritajes</p>
      </div>
      <p className="text-[11px] text-white/45">
        © 2026 JCB Consult. Ingeniero Civil CIP 49101. Lima, Perú.
      </p>
      <div className="flex gap-7">
        {[['#tasaciones', 'Tasaciones'], ['#peritajes', 'Peritajes'], ['#blog', 'Blog'], ['#contacto', 'Contacto']].map(([href, label]) => (
          <a key={href} href={href} className="text-[11px] text-white/50 hover:text-white transition-colors uppercase tracking-[0.18em]">
            {label}
          </a>
        ))}
      </div>
    </div>
  </footer>
);

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen pb-20 md:pb-0">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:bg-brand-navy focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold"
      >
        Ir al contenido principal
      </a>
      <Navbar onContact={openModal} />
      <main id="main-content">
        <Hero onContact={openModal} />
        <CredibilityStrip />
        <WhatYouReceive />
        <Services onContact={openModal} />
        <Process onContact={openModal} />
        <WhyIndependent />
        <Clients />
        <Testimonials />
        <Cotizador onContact={openModal} />
        <Blog />
        <ContactSection onContact={openModal} />
      </main>
      <Footer />
      <ConsultationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <FloatingCTA onClick={openModal} />
    </div>
    </MotionConfig>
  );
}
