import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import logoMef         from './assets/clientes/mef.png';
import logoBci         from './assets/clientes/bci-miami.png';
import logoBanmat      from './assets/clientes/banmat.png';
import logoFondepes    from './assets/clientes/fondepes.png';
import logoFpf         from './assets/clientes/fpf.png';
import logoMitsui      from './assets/clientes/mitsui.png';
import logoVivienda    from './assets/clientes/vivienda.png';
import logoProinversion from './assets/clientes/proinversion.png';
import logoMepsa       from './assets/clientes/mepsa.png';

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

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => { setStatus('idle'); setForm(EMPTY_FORM); setWaUrl(null); }, 300);
    }
  }, [isOpen]);

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
  const labelCls = 'block text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-navy/50 mb-1.5';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="bg-brand-ivory w-full md:max-w-[560px] md:rounded-2xl rounded-t-3xl max-h-[92vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-brand-ivory border-b border-black/[0.07] px-6 py-5 flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] font-bold text-brand-navy/45 mb-1">
                  JCB CONSULT
                </p>
                <h2 className="font-bold text-xl text-brand-navy leading-tight">
                  Solicite su cotización
                </h2>
                <p className="text-[12px] text-brand-navy/45 mt-0.5">Respuesta en menos de 24 horas</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/[0.06] transition-colors text-brand-navy/40 hover:text-brand-navy mt-0.5"
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Tipo de inmueble</label>
                        <select className={selectCls} value={form.propertyType} onChange={set('propertyType')}>
                          {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Distrito</label>
                        <select className={selectCls} value={form.district} onChange={set('district')}>
                          {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Dirección / Ubicación del inmueble *</label>
                      <input
                        required
                        type="text"
                        placeholder="Ej. Av. Caminos del Inca 890, Surco"
                        className={inputCls}
                        value={form.location}
                        onChange={set('location')}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Área aprox. (m²)</label>
                        <input
                          type="number"
                          placeholder="Ej. 85"
                          className={inputCls}
                          value={form.area}
                          onChange={set('area')}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Finalidad</label>
                        <select className={selectCls} value={form.purpose} onChange={set('purpose')}>
                          {PURPOSES.map((p) => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Nombre</label>
                        <input
                          required
                          type="text"
                          placeholder="Juan Pérez"
                          className={inputCls}
                          value={form.name}
                          onChange={set('name')}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Teléfono *</label>
                        <input
                          required
                          type="tel"
                          placeholder="999 999 999"
                          className={inputCls}
                          value={form.phone}
                          onChange={set('phone')}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Email <span className="normal-case font-normal text-brand-navy/30">(opcional)</span></label>
                      <input
                        type="email"
                        placeholder="correo@ejemplo.com"
                        className={inputCls}
                        value={form.email}
                        onChange={set('email')}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Mensaje breve <span className="normal-case font-normal text-brand-navy/30">(opcional)</span></label>
                      <textarea
                        rows={3}
                        placeholder="Cuéntenos más sobre el inmueble o sus necesidades..."
                        className={`${inputCls} resize-none`}
                        value={form.message}
                        onChange={set('message')}
                      />
                    </div>

                    {status === 'error' && (
                      <p className="text-red-500 text-[12px] font-semibold">
                        Ocurrió un error. Por favor intente de nuevo.
                      </p>
                    )}

                    <div className="pt-2 space-y-3">
                      <button
                        disabled={status === 'loading'}
                        type="submit"
                        className="w-full bg-brand-navy text-white rounded-full py-4 text-[13px] font-bold uppercase tracking-[0.2em] hover:bg-brand-navy/90 active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        {status === 'loading' ? 'Enviando...' : 'Enviar solicitud'}
                      </button>
                      <p className="text-center text-[11px] text-brand-navy/35 font-medium">
                        Al enviar, recibirá respuesta en menos de 24 horas
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

const FloatingCTA = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden
               bg-brand-navy text-white rounded-full border border-white/20
               px-8 py-4 shadow-2xl shadow-black/30
               text-[13px] font-bold uppercase tracking-[0.18em]
               flex items-center gap-2.5
               active:scale-95 transition-transform"
  >
    Solicitar Tasación
  </button>
);

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`sticky top-0 w-full z-50 bg-brand-ivory/95 backdrop-blur-md border-b border-black/[0.07] transition-shadow duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-14 lg:px-20 h-[60px] flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Inicio"
          className="flex-shrink-0 text-left"
        >
          <p className="font-bold text-[15px] text-brand-navy leading-none tracking-tight">JCB Consult</p>
          <p className="text-[9px] uppercase tracking-[0.28em] text-brand-navy/45 font-semibold mt-0.5">Perito Tasador SBS</p>
        </button>

        <div className="flex items-center gap-5 md:gap-8">
          <a href="#servicios" className="hidden md:inline text-[12px] font-medium text-brand-navy/50 hover:text-brand-navy transition-colors">
            Servicios
          </a>
          <a href="#proceso" className="hidden md:inline text-[12px] font-medium text-brand-navy/50 hover:text-brand-navy transition-colors">
            Proceso
          </a>
          <a href="#contacto" className="hidden md:inline text-[12px] font-medium text-brand-navy/50 hover:text-brand-navy transition-colors">
            Contacto
          </a>
          <button
            onClick={onContact}
            className="bg-brand-navy text-white rounded-full px-5 py-2.5 text-[12px] font-semibold hover:bg-brand-navy/90 transition-colors"
          >
            Solicitar tasación
          </button>
        </div>
      </div>
    </nav>
  );
};

// ─── HERO ─────────────────────────────────────────────────────────────────────

const Hero = ({ onContact }: { onContact: () => void }) => {
  return (
  <section className="relative bg-brand-ivory overflow-hidden flex flex-col md:min-h-screen">

    {/* ── DESKTOP: photo bleeds right half ─────────────────────────────── */}
    <div className="absolute inset-y-0 right-0 w-[43%] hidden md:block">
      <img
        src="/JCBHERO.png"
        alt="Juan Carlos Bejarano — Perito Tasador Certificado SBS"
        className="w-full h-full object-cover object-top"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-ivory/90 via-brand-ivory/15 to-transparent" />
    </div>

    {/* ── MOBILE: photo first, full width ──────────────────────────────── */}
    <div className="md:hidden relative w-full">
      <img
        src="/JCBHERO.png"
        alt="Juan Carlos Bejarano"
        className="w-full h-[72vw] object-cover object-top"
      />
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-brand-ivory via-brand-ivory/70 to-transparent" />
    </div>

    {/* ── MOBILE: name below image ──────────────────────────────────────── */}
    <div className="md:hidden px-6 pt-4 pb-1">
      <p className="text-[11px] uppercase tracking-[0.32em] text-brand-navy/50 font-bold">Juan Carlos Bejarano · Perito Tasador Cert. SBS</p>
    </div>

    {/* ── TEXT CONTENT ─────────────────────────────────────────────────── */}
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative z-10 md:flex-1 md:flex md:flex-col md:justify-center px-6 md:px-14 lg:px-20 pt-5 md:pt-8 pb-10 max-w-[680px]"
    >
      {/* Desktop badge */}
      <div className="hidden md:inline-flex items-center gap-2 bg-brand-navy/[0.07] text-brand-navy/60 rounded-full px-4 py-1.5 mb-8 w-fit">
        <span className="text-[10px] font-bold uppercase tracking-[0.35em]">Lima Metropolitana · 25 años de trayectoria</span>
      </div>

      {/* Mobile overline */}
      <div className="md:hidden flex items-center gap-2.5 mb-4">
        <div className="w-5 h-px bg-brand-navy/25" />
        <span className="text-[9px] font-bold uppercase tracking-[0.38em] text-brand-navy/45">Lima Metropolitana</span>
      </div>

      {/* Desktop name */}
      <p className="hidden md:block text-[12px] uppercase tracking-[0.32em] text-brand-navy/50 font-bold mb-3">Juan Carlos Bejarano</p>

      <h1
        className="font-bold text-brand-navy leading-[1.08] mb-5 md:mb-6"
        style={{ fontSize: 'clamp(1.95rem, 5.5vw, 5rem)' }}
      >
        Perito Tasador<br />
        Certificado SBS<br />
        en Lima
      </h1>

      {/* Mobile quick stats */}
      <div className="md:hidden flex items-center gap-4 mb-5 pb-5 border-b border-black/[0.07]">
        <div className="text-center">
          <p className="font-bold text-brand-navy text-[1.3rem] leading-none">500+</p>
          <p className="text-[9px] text-brand-navy/40 font-medium mt-0.5 uppercase tracking-wide">Tasaciones</p>
        </div>
        <div className="w-px h-8 bg-black/[0.08]" />
        <div className="text-center">
          <p className="font-bold text-brand-navy text-[1.3rem] leading-none">25</p>
          <p className="text-[9px] text-brand-navy/40 font-medium mt-0.5 uppercase tracking-wide">Años de exp.</p>
        </div>
        <div className="w-px h-8 bg-black/[0.08]" />
        <div className="text-center">
          <p className="font-bold text-brand-navy text-[1.3rem] leading-none">3–5</p>
          <p className="text-[9px] text-brand-navy/40 font-medium mt-0.5 uppercase tracking-wide">Días entrega</p>
        </div>
      </div>

      {/* Desktop description */}
      <p className="hidden md:block text-[16px] leading-[1.75] text-brand-navy/55 max-w-[420px] mb-10">
        Informes técnicos de valorización de inmuebles con respaldo oficial. Válidos para bancos, municipalidades y juzgados.
      </p>

      {/* Mobile description */}
      <p className="md:hidden text-[14px] leading-[1.65] text-brand-navy/55 mb-7">
        Informes de valorización válidos para bancos, municipalidades y juzgados de Lima.
      </p>

      <button
        onClick={onContact}
        className="w-full sm:w-fit bg-brand-navy text-white rounded-full px-8 py-4 text-[13px] font-bold uppercase tracking-[0.18em] hover:bg-brand-navy/90 active:scale-[0.98] transition-all shadow-lg shadow-brand-navy/20"
      >
        Solicitar Tasación
      </button>
      <p className="text-[11px] text-brand-navy/40 font-medium mt-3">Respuesta en menos de 24 horas</p>
    </motion.div>

    {/* Credentials strip — desktop only */}
    <div className="hidden md:block relative z-10 mt-auto border-t border-black/[0.08] px-6 md:px-14 lg:px-20 py-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {['Certificado SBS', 'Ministerio de Vivienda', 'Colegio de Ingenieros del Perú', 'Registro REPEV'].map((c, i) => (
          <React.Fragment key={c}>
            {i > 0 && <span className="text-brand-navy/20">·</span>}
            <span className="text-[9px] uppercase tracking-[0.3em] text-brand-navy/40 font-bold">{c}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  </section>
  );
};

// ─── CREDIBILITY STRIP ────────────────────────────────────────────────────────

const CredibilityStrip = () => {
  const stats = [
    { value: '25', suffix: 'años', label: 'de trayectoria' },
    { value: '500+', suffix: '', label: 'tasaciones realizadas' },
    { value: 'SBS', suffix: '', label: 'registro oficial' },
    { value: 'CIP', suffix: '', label: 'Ingeniero Civil' },
  ];

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
    <section className="bg-white border-y border-black/[0.07]">
      {/* Mobile: horizontal scroll row */}
      <div className="md:hidden flex overflow-x-auto scrollbar-none px-6 divide-x divide-black/[0.07]">
        {stats.map((s) => (
          <div key={s.label} className="flex-none py-6 px-7 text-center min-w-[100px]">
            <p className="font-bold text-brand-navy text-[1.7rem] leading-none mb-1">
              {s.value}
              {s.suffix && <span className="text-brand-navy/50 text-[0.45em] font-semibold ml-0.5">{s.suffix}</span>}
            </p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-brand-navy/40 font-semibold whitespace-nowrap">{s.label}</p>
          </div>
        ))}
      </div>
      {/* Desktop */}
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
            <p className="text-[11px] uppercase tracking-[0.22em] text-brand-navy/40 font-semibold whitespace-nowrap">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── WHAT YOU RECEIVE ─────────────────────────────────────────────────────────

const WhatYouReceive = () => {
  const items = [
    {
      n: '01',
      title: 'Informe técnico oficial firmado',
      desc: 'Documento suscrito por Ingeniero Civil CIP con número de registro, metodología y sustento del valor determinado.',
    },
    {
      n: '02',
      title: 'Análisis de comparables de mercado',
      desc: 'Estudio de transacciones recientes en la zona para respaldar el valor con data real y actualizada.',
    },
    {
      n: '03',
      title: 'Entrega en 3 a 5 días hábiles',
      desc: 'Formato digital (PDF) y físico. Aceptado por entidades bancarias, municipalidades y juzgados de Lima.',
    },
  ];

  return (
    <section id="proceso" className="bg-brand-navy text-white px-6 md:px-14 lg:px-20 py-12 md:py-24">
      <div className="max-w-[1400px] mx-auto grid md:grid-cols-[1fr_1.7fr] gap-14 md:gap-24 items-start">
        <div>
          <p className="text-[10px] uppercase tracking-[0.38em] text-white/45 font-bold mb-5">Lo que recibe</p>
          <h2
            className="font-bold leading-[1.1] mb-6"
            style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3.2rem)' }}
          >
            Un informe que<br />resiste cualquier<br />cuestionamiento.
          </h2>
          <p className="text-[14px] leading-[1.8] text-white/50 max-w-[320px]">
            Cada tasación incluye visita al inmueble, análisis de la zona y metodología oficial SBS.
          </p>
        </div>

        <div>
          {items.map((item) => (
            <div key={item.n} className="border-t border-white/10 py-8 grid grid-cols-[44px_1fr] gap-4">
              <span className="text-[12px] font-bold text-white/20 pt-0.5">{item.n}</span>
              <div>
                <h3 className="font-bold text-[1.1rem] mb-2 leading-tight">{item.title}</h3>
                <p className="text-[13px] text-white/50 leading-[1.7]">{item.desc}</p>
              </div>
            </div>
          ))}
          <div className="border-t border-white/15 pt-5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/40 font-bold">
              Válido para bancos · municipios · notarías · juzgados
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
      sub: 'Departamentos · Casas · Viviendas',
      desc: 'Valorización en zonas consolidadas y en expansión de Lima Metropolitana y Callao.',
    },
    {
      n: '02', title: 'Terrenos',
      sub: 'Predios Urbanos · Expansión',
      desc: 'Análisis de uso, zonificación y comparables de mercado para predios urbanos.',
    },
    {
      n: '03', title: 'Corporativo',
      sub: 'Locales · Oficinas · Industrial',
      desc: 'Metodología de ingresos y comparación para inmuebles comerciales e industriales.',
    },
    {
      n: '04', title: 'Judicial',
      sub: 'Herencias · Divorcios · Litigios',
      desc: 'Peritajes con valor probatorio. Firma de Ingeniero Civil CIP aceptada en juzgados.',
    },
  ];

  return (
    <section id="servicios" className="bg-brand-ivory px-6 md:px-14 lg:px-20 py-12 md:py-24 border-t border-black/[0.07]">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between border-b border-black/[0.08] pb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.38em] text-brand-navy/40 font-bold mb-3">Especialidades</p>
            <h2 className="font-bold leading-tight" style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3rem)' }}>
              Áreas de práctica
            </h2>
          </div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-brand-navy/30 font-bold hidden md:block pb-1">
            4 tipos de tasación
          </span>
        </div>

        {services.map((s) => (
          <div
            key={s.n}
            onClick={onContact}
            className="group border-b border-black/[0.08] py-6 grid grid-cols-[40px_1fr_auto] md:grid-cols-[56px_1fr_1.4fr_auto] gap-x-6 items-center hover:bg-black/[0.015] transition-colors duration-200 -mx-6 md:-mx-14 lg:-mx-20 px-6 md:px-14 lg:px-20 cursor-pointer"
          >
            <span className="text-[11px] font-bold text-brand-navy/25">{s.n}</span>
            <div>
              <h3 className="font-bold leading-tight mb-1" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)' }}>
                {s.title}
              </h3>
              <p className="text-[9px] uppercase tracking-[0.28em] text-brand-navy/40 font-bold">{s.sub}</p>
            </div>
            <p className="text-[13px] text-brand-navy/50 leading-[1.65] hidden md:block max-w-[320px]">{s.desc}</p>
            <span className="text-brand-navy/20 group-hover:text-brand-navy/60 group-hover:translate-x-1 transition-all duration-200 text-base">→</span>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── WHY INDEPENDENT ──────────────────────────────────────────────────────────

const WhyIndependent = () => (
  <section className="bg-brand-navy text-white px-6 md:px-14 lg:px-20 py-12 md:py-24">
    <div className="max-w-[1400px] mx-auto grid md:grid-cols-[1fr_1.1fr] gap-14 md:gap-24 items-start">
      <div>
        <p className="text-[10px] uppercase tracking-[0.38em] text-white/45 font-bold mb-5">Por qué JCB</p>
        <h2
          className="font-bold leading-[1.1] mb-6"
          style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3.2rem)' }}
        >
          La tasación<br />independiente<br /><span style={{ color: '#C5A059' }}>protege su<br />patrimonio.</span>
        </h2>
        <p className="text-[14px] leading-[1.8] text-white/50 max-w-[320px]">
          Los bancos contratan tasadores que minimizan su exposición al riesgo. Un informe independiente le otorga el argumento técnico para negociar.
        </p>
      </div>

      <div className="pt-0 md:pt-10">
        <div className="border-t border-white/10 pt-8 pb-9">
          <p className="text-[9px] uppercase tracking-[0.35em] text-white/25 font-bold mb-5">Tasador Bancario</p>
          <ul className="space-y-3">
            {[
              'Objetivo: proteger el riesgo del banco.',
              'Aplica factores de descuento conservadores.',
              'Puede subvaluar la propiedad hasta un 20%.',
            ].map((t) => <li key={t} className="text-[14px] text-white/40 leading-relaxed">{t}</li>)}
          </ul>
        </div>

        <div className="border-t border-white/20 pt-8 pb-9">
          <p className="text-[9px] uppercase tracking-[0.35em] text-white/60 font-bold mb-5">Tasador Independiente · JCB</p>
          <ul className="space-y-3">
            {[
              'Objetivo: determinar el valor real de mercado.',
              'Metodología técnica basada en comparables vigentes.',
              'Informe válido para bancos, municipios y juzgados.',
            ].map((t) => <li key={t} className="text-[14px] text-white/80 leading-relaxed">{t}</li>)}
          </ul>
        </div>

        <div className="border-t border-white/[0.07] pt-7 flex items-end gap-3">
          <span className="font-bold leading-none text-white/[0.07]" style={{ fontSize: '5.5rem' }}>
            500+
          </span>
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/25 font-bold mb-3">tasaciones realizadas</p>
        </div>
      </div>
    </div>
  </section>
);

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

const Clients = () => (
  <section className="bg-white border-t border-black/[0.07] py-8 md:py-14">
    <div className="max-w-[1400px] mx-auto px-6 md:px-14 lg:px-20">
      <div className="mb-8 md:mb-10">
        <p className="text-[10px] uppercase tracking-[0.38em] text-brand-navy/40 font-bold mb-2">Instituciones</p>
        <h2 className="font-bold leading-tight" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.4rem)' }}>
          Entidades que han confiado<br className="hidden md:block" /> en nuestros informes
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {LOGOS.map((logo) => (
          <div key={logo.alt} className="flex items-center justify-center p-4 md:p-6">
            <img
              src={logo.src}
              alt={logo.alt}
              className="h-[108px] md:h-[135px] w-auto object-contain grayscale opacity-55 hover:grayscale-0 hover:opacity-100 transition duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── CONTACT SECTION ──────────────────────────────────────────────────────────

const ContactSection = ({ onContact }: { onContact: () => void }) => (
  <section id="contacto" className="bg-brand-navy text-white px-6 md:px-14 lg:px-20 py-12 md:py-24">
    <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-14 md:gap-24 items-center">
      <div>
        <p className="text-[10px] uppercase tracking-[0.38em] text-white/45 font-bold mb-5">Contacto</p>
        <h2
          className="font-bold leading-[1.1] mb-6"
          style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3.2rem)' }}
        >
          ¿Necesita tasar<br />un inmueble?
        </h2>
        <p className="text-[14px] leading-[1.8] text-white/50 max-w-[380px] mb-10">
          Complete la solicitud y Juan Carlos Bejarano le responderá en menos de 24 horas con una propuesta para su caso.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onContact}
            className="bg-white text-brand-navy rounded-full px-8 py-4 text-[13px] font-bold uppercase tracking-[0.18em] hover:bg-white/90 active:scale-[0.98] transition-all"
          >
            Solicitar Tasación
          </button>
          <button
            onClick={onContact}
            className="border border-white/20 text-white rounded-full px-8 py-4 text-[13px] font-semibold flex items-center gap-2.5 hover:bg-white/10 transition-colors"
          >
            <WaIcon />
            Contactar por WhatsApp
          </button>
        </div>
      </div>

      <div className="border-t md:border-t-0 md:border-l border-white/10 pt-10 md:pt-0 md:pl-14 space-y-8">
        {[
          { label: 'Cobertura', value: 'Lima Metropolitana y Callao' },
          { label: 'Tiempo de respuesta', value: 'Menos de 24 horas' },
          { label: 'Entrega del informe', value: '3 a 5 días hábiles' },
          { label: 'Formatos', value: 'Digital (PDF) y físico' },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-[10px] uppercase tracking-[0.32em] text-white/30 font-bold mb-1">{item.label}</p>
            <p className="text-[15px] font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── FOOTER ───────────────────────────────────────────────────────────────────

const Footer = () => (
  <footer className="bg-brand-navy text-white border-t border-white/[0.06] px-6 md:px-14 py-10">
    <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
      <div>
        <p className="font-bold text-sm">JCB CONSULT</p>
        <p className="text-[9px] uppercase tracking-[0.35em] text-white/40 font-bold mt-1">Perito Tasador SBS</p>
      </div>
      <p className="text-[11px] text-white/25">
        © 2026 JCB Consult. Ingeniero Civil CIP Registrado. Lima, Perú.
      </p>
      <div className="flex gap-7">
        {[['#servicios', 'Servicios'], ['#contacto', 'Contacto']].map(([href, label]) => (
          <a key={href} href={href} className="text-[11px] text-white/30 hover:text-white transition-colors uppercase tracking-[0.18em]">
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
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar onContact={openModal} />
      <Hero onContact={openModal} />
      <CredibilityStrip />
      <WhatYouReceive />
      <Services onContact={openModal} />
      <WhyIndependent />
      <Clients />
      <ContactSection onContact={openModal} />
      <Footer />

      <ConsultationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <FloatingCTA onClick={openModal} />
    </div>
  );
}
