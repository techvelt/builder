'use client';

import Link from 'next/link';
import { useState } from 'react';

const megaNav = [
  {
    label: 'Medical Supplies',
    href: '/categories/medical-supplies',
    columns: [
      {
        title: 'Exam Room',
        links: [
          { label: 'Exam Gloves', href: '/categories/exam-gloves' },
          { label: 'Exam Tables', href: '/categories/exam-tables' },
          { label: 'Stethoscopes', href: '/categories/stethoscopes' },
        ],
      },
      {
        title: 'Diagnostics',
        links: [
          { label: 'Blood Pressure Monitors', href: '/categories/blood-pressure' },
          { label: 'Thermometers', href: '/categories/thermometers' },
          { label: 'Pulse Oximeters', href: '/categories/pulse-oximeters' },
        ],
      },
      {
        title: 'Wound Care',
        links: [
          { label: 'Bandages & Dressings', href: '/categories/bandages' },
          { label: 'Sutures', href: '/categories/sutures' },
          { label: 'Antiseptics', href: '/categories/antiseptics' },
        ],
      },
    ],
  },
  {
    label: 'Equipment',
    href: '/categories/equipment',
    columns: [
      {
        title: 'Patient Care',
        links: [
          { label: 'Wheelchairs', href: '/categories/wheelchairs' },
          { label: 'Hospital Beds', href: '/categories/hospital-beds' },
          { label: 'IV Stands', href: '/categories/iv-stands' },
        ],
      },
      {
        title: 'Surgical',
        links: [
          { label: 'Surgical Instruments', href: '/categories/surgical-instruments' },
          { label: 'Sterilization', href: '/categories/sterilization' },
          { label: 'Surgical Gowns', href: '/categories/surgical-gowns' },
        ],
      },
    ],
  },
  {
    label: 'Pharmacy',
    href: '/categories/pharmacy',
    columns: [
      {
        title: 'OTC & Rx',
        links: [
          { label: 'Pain Relief', href: '/categories/pain-relief' },
          { label: 'Vitamins & Supplements', href: '/categories/vitamins' },
          { label: 'First Aid Kits', href: '/categories/first-aid' },
        ],
      },
    ],
  },
];

const topLinks = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Bulk Orders', href: '/bulk-orders' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top bar */}
      <div className="hidden border-b border-gray-100 bg-navy text-white lg:block">
        <div className="container-site flex items-center justify-between py-2 text-xs">
          <p>Free shipping on orders over $99 · Licensed medical supplier</p>
          <nav className="flex gap-6">
            {topLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-primary-300 transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main header */}
      <div className="border-b border-gray-100">
        <div className="container-site flex items-center gap-4 py-4 lg:gap-8">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">
              M
            </span>
            <div className="hidden sm:block">
              <span className="block text-lg font-bold text-navy leading-tight">
                MedSupply Pro
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-gray-500">
                Healthcare Essentials
              </span>
            </div>
          </Link>

          {/* Search */}
          <form
            className="hidden flex-1 md:flex"
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
              }
            }}
          >
            <div className="relative w-full max-w-xl">
              <input
                type="search"
                placeholder="Search medical supplies, equipment, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-4 pr-12 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-primary px-3 py-1.5 text-white transition hover:bg-primary-700"
                aria-label="Search"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/account"
              className="hidden items-center gap-1.5 text-sm font-medium text-navy hover:text-primary sm:flex"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account
            </Link>
            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden sm:inline">Cart</span>
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                0
              </span>
            </Link>
            <button
              type="button"
              className="rounded-lg p-2 text-navy hover:bg-gray-100 lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mega nav */}
      <nav className="hidden border-b border-gray-100 bg-white lg:block">
        <div className="container-site">
          <ul className="flex gap-1">
            {megaNav.map((item) => (
              <li
                key={item.label}
                className="relative"
                onMouseEnter={() => setActiveMega(item.label)}
                onMouseLeave={() => setActiveMega(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-4 py-3 text-sm font-semibold text-navy transition hover:text-primary"
                >
                  {item.label}
                  <svg className="h-3.5 w-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>

                {activeMega === item.label && (
                  <div className="absolute left-0 top-full z-50 w-[600px] rounded-b-xl border border-gray-100 bg-white p-6 shadow-xl">
                    <div className="grid grid-cols-3 gap-6">
                      {item.columns.map((col) => (
                        <div key={col.title}>
                          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">
                            {col.title}
                          </h3>
                          <ul className="space-y-2">
                            {col.links.map((link) => (
                              <li key={link.href}>
                                <Link
                                  href={link.href}
                                  className="text-sm text-gray-600 hover:text-primary transition"
                                >
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
            <li>
              <Link
                href="/categories/sale"
                className="flex items-center px-4 py-3 text-sm font-semibold text-red-600 transition hover:text-red-700"
              >
                Sale
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-b border-gray-100 bg-white lg:hidden">
          <div className="container-site space-y-4 py-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                }
              }}
            >
              <input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm"
              />
            </form>
            {megaNav.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className="block py-2 font-semibold text-navy"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
