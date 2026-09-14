import Link from 'next/link';

const trustBadges = [
  {
    icon: '🛡️',
    title: 'FDA Registered',
    description: 'Compliant medical supplier',
  },
  {
    icon: '🚚',
    title: 'Fast Shipping',
    description: 'Same-day on most orders',
  },
  {
    icon: '🔒',
    title: 'Secure Checkout',
    description: '256-bit SSL encryption',
  },
  {
    icon: '💬',
    title: 'Expert Support',
    description: 'Licensed pharmacists on call',
  },
];

const footerLinks = {
  shop: [
    { label: 'Medical Supplies', href: '/categories/medical-supplies' },
    { label: 'Equipment', href: '/categories/equipment' },
    { label: 'Pharmacy', href: '/categories/pharmacy' },
    { label: 'Sale', href: '/categories/sale' },
  ],
  support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Shipping Info', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
    { label: 'FAQ', href: '/faq' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Bulk Orders', href: '/bulk-orders' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      {/* Trust badges */}
      <div className="border-b border-navy-700">
        <div className="container-site grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          {trustBadges.map((badge) => (
            <div key={badge.title} className="flex items-start gap-3">
              <span className="text-2xl" role="img" aria-hidden="true">
                {badge.icon}
              </span>
              <div>
                <p className="font-semibold text-sm">{badge.title}</p>
                <p className="text-xs text-navy-200 mt-0.5">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="container-site grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2 mb-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold">
              M
            </span>
            <span className="font-bold text-lg">MedSupply Pro</span>
          </Link>
          <p className="text-sm text-navy-200 leading-relaxed">
            Your trusted partner for medical supplies, diagnostic equipment, and
            healthcare essentials since 1998.
          </p>
        </div>

        {Object.entries(footerLinks).map(([section, links]) => (
          <div key={section}>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-primary-300">
              {section}
            </h3>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-navy-200 hover:text-white transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-navy-700">
        <div className="container-site flex flex-col items-center justify-between gap-4 py-6 text-xs text-navy-300 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} MedSupply Pro. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/accessibility" className="hover:text-white transition">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
