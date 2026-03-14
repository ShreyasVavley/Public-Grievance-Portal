"use client";

import '../i18n';
import Link from 'next/link';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-navy-blue text-white sticky top-0 z-50 border-b-4 border-white">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl md:text-3xl font-black tracking-tighter uppercase shrink-0">
          Sahaya <span className="text-action-gold">2026</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 lg:gap-10">
          <Link href="/" className="font-black uppercase tracking-widest text-sm hover:text-action-gold transition-colors">
            Home
          </Link>
          <Link href="/about" className="font-black uppercase tracking-widest text-sm hover:text-action-gold transition-colors">
            About Us
          </Link>
          <Link href="/admin/login" className="font-black uppercase tracking-widest text-sm border-2 border-white px-4 py-2 hover:bg-white hover:text-navy-blue transition-all">
            Admin Login
          </Link>
          <Link href="/login" className="font-black uppercase tracking-widest text-sm bg-action-gold text-navy-blue px-6 py-2 brutalist-button transition-all">
            Citizen Login
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 border-2 border-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          {menuOpen
            ? <XMarkIcon className="w-7 h-7" />
            : <Bars3Icon className="w-7 h-7" />
          }
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-navy-blue border-t-4 border-white px-6 py-6 flex flex-col gap-6">
          <Link href="/" onClick={() => setMenuOpen(false)} className="font-black uppercase tracking-widest text-base hover:text-action-gold transition-colors">
            Home
          </Link>
          <Link href="/about" onClick={() => setMenuOpen(false)} className="font-black uppercase tracking-widest text-base hover:text-action-gold transition-colors">
            About Us
          </Link>
          <Link href="/admin/login" onClick={() => setMenuOpen(false)} className="font-black uppercase tracking-widest text-base border-2 border-white px-4 py-3 text-center hover:bg-white hover:text-navy-blue transition-all">
            Admin Login
          </Link>
          <Link href="/login" onClick={() => setMenuOpen(false)} className="font-black uppercase tracking-widest text-base bg-action-gold text-navy-blue px-6 py-3 brutalist-button text-center">
            Citizen Login
          </Link>
        </div>
      )}
    </nav>
  );
}
