import React, { useState } from 'react';
import {
  BookOpen,
  Scale,
  ShieldCheck,
  Smartphone,
  Car,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function SafetyResources() {
  const [openFaq, setOpenFaq] = useState(0);

  const legalRights = [
    {
      title: 'Right to Register a "Zero FIR"',
      law: 'Supreme Court Directive / Section 154 CrPC',
      content:
        'A woman has the absolute legal right to lodge a "Zero FIR" at ANY police station in India, regardless of where the incident occurred. Police officers cannot refuse registration citing territorial jurisdiction. The FIR is subsequently transferred to the competent jurisdictional station.',
    },
    {
      title: 'Protection Against Night Arrest (CrPC Section 46(4))',
      law: 'Section 46(4) Code of Criminal Procedure',
      content:
        'Women cannot be arrested between sunset and sunrise except under exceptional circumstances with prior written permission from a Judicial Magistrate and in the presence of a woman police officer.',
    },
    {
      title: 'Right to Virtual / In-Camera Statement Recording',
      law: 'Section 164 CrPC',
      content:
        'In cases of sexual offences, a woman’s statement must be recorded by a woman judicial magistrate in private (in-camera), and she cannot be summoned to the police station for interrogation if she prefers her statement recorded at her residence.',
    },
    {
      title: 'Right to Anonymity & Privacy (Section 228A IPC / BNS)',
      law: 'Section 228A Indian Penal Code',
      content:
        'The identity of a victim of sexual offences cannot be disclosed in media, social platforms, or public records without legal consent. Violation carries criminal prosecution.',
    },
    {
      title: 'Right to Free Legal Aid',
      law: 'Legal Services Authorities Act, 1987',
      content:
        'Every woman in India is entitled to free legal counsel and aid from State and District Legal Services Authorities (DLSA), irrespective of her financial status or income.',
    },
  ];

  const cabSafetyChecklist = [
    'Always verify the cab vehicle registration number against the ride-hailing app before getting in.',
    'Check that rear door child-locks are disengaged (ensure you can open the door from the inside).',
    'Activate SHEGUARD "Live Location Sharing" or "Safety Arrival Timer" before beginning transit.',
    'Keep your phone charged and avoid falling asleep during unfamiliar transit routes.',
    'If the driver deviates into dark or deserted unmapped bypasses, immediately question the route and dial 112.',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 sm:pb-8">
      {/* Header */}
      <div className="bg-navy-900/80 backdrop-blur-md p-5 rounded-3xl border border-white/10 space-y-1">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-coral-400" />
          <h1 className="text-xl sm:text-2xl font-black text-white">Legal Rights & Safety Resources</h1>
        </div>
        <p className="text-xs text-slate-400">
          Essential legal protections for women under Indian law, cab safety checklists, and emergency guides.
        </p>
      </div>

      {/* SOS Walkthrough Guide */}
      <div className="bg-navy-900 rounded-3xl p-6 sm:p-7 border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white">How SHEGUARD Emergency SOS Works</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-navy-950/80 border border-white/5 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-coral-500/20 text-coral-400 font-black flex items-center justify-center">
              1
            </div>
            <h3 className="font-bold text-white">Tap Central SOS</h3>
            <p className="text-slate-400 leading-relaxed">
              Triggers a 5-second countdown with audible beeps. You can cancel instantly if activated by mistake.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-navy-950/80 border border-white/5 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-400 font-black flex items-center justify-center">
              2
            </div>
            <h3 className="font-bold text-white">Instant GPS Capture</h3>
            <p className="text-slate-400 leading-relaxed">
              Coordinates and battery levels are recorded. A secure, random link is generated for your contacts.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-navy-950/80 border border-white/5 space-y-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center">
              3
            </div>
            <h3 className="font-bold text-white">Dispatch & Direct Call</h3>
            <p className="text-slate-400 leading-relaxed">
              Alerts your configured safety circle and provides a 1-tap shortcut to dial National Emergency 112.
            </p>
          </div>
        </div>
      </div>

      {/* Essential Indian Legal Rights Accordion */}
      <div className="bg-navy-900 rounded-3xl p-6 sm:p-7 border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-coral-400" />
          <h2 className="text-base font-bold text-white">Essential Legal Rights for Women in India</h2>
        </div>

        <div className="space-y-3">
          {legalRights.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-navy-950/80 border border-white/5 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-white hover:text-coral-300"
              >
                <div>
                  <p>{item.title}</p>
                  <span className="text-[10px] font-semibold text-slate-400">{item.law}</span>
                </div>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 text-coral-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {openFaq === idx && (
                <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-white/5">
                  {item.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cab & Transit Safety Checklist */}
      <div className="bg-navy-900 rounded-3xl p-6 sm:p-7 border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">Cab & Public Transit Safety Checklist</h2>
        </div>

        <div className="space-y-2">
          {cabSafetyChecklist.map((tip, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-navy-950/60 border border-white/5 text-xs text-slate-300">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Official Government Portals Links */}
      <div className="bg-navy-900 rounded-3xl p-6 border border-white/10 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Official Indian Portals</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <a
            href="https://112.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-navy-950 border border-white/5 flex items-center justify-between text-white hover:border-coral-500/40"
          >
            <div>
              <p className="font-bold">National ERSS (112.gov.in)</p>
              <p className="text-[11px] text-slate-400">Emergency Response Support System</p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </a>

          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-navy-950 border border-white/5 flex items-center justify-between text-white hover:border-coral-500/40"
          >
            <div>
              <p className="font-bold">National Cyber Crime Reporting</p>
              <p className="text-[11px] text-slate-400">Report online harassment (Helpline 1930)</p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </a>

          <a
            href="http://ncw.nic.in"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-navy-950 border border-white/5 flex items-center justify-between text-white hover:border-coral-500/40"
          >
            <div>
              <p className="font-bold">National Commission for Women (NCW)</p>
              <p className="text-[11px] text-slate-400">Statutory body for women's rights</p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </a>

          <a
            href="https://nalsa.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-navy-950 border border-white/5 flex items-center justify-between text-white hover:border-coral-500/40"
          >
            <div>
              <p className="font-bold">NALSA Free Legal Aid</p>
              <p className="text-[11px] text-slate-400">National Legal Services Authority</p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </a>
        </div>
      </div>
    </div>
  );
}
