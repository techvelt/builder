import Hero from '@/components/Hero';
import CategoryGrid from '@/components/CategoryGrid';
import ProductCard from '@/components/ProductCard';
import { getHomePage } from '@/lib/content';
import Link from 'next/link';

const defaultHome = {
  slug: 'home',
  title: 'MedSupply Pro',
  type: 'home' as const,
  hero: {
    title: 'Professional Medical Supplies Delivered Fast',
    subtitle:
      'From exam gloves to diagnostic equipment — everything your practice needs, backed by licensed pharmacists and same-day shipping.',
    ctaLabel: 'Shop Best Sellers',
    ctaHref: '/categories/medical-supplies',
    badge: 'Trusted by 10,000+ facilities',
  },
  categories: [
    {
      slug: 'medical-supplies',
      title: 'Medical Supplies',
      description: 'Gloves, syringes, wound care & more',
      productCount: 2400,
    },
    {
      slug: 'diagnostics',
      title: 'Diagnostics',
      description: 'Monitors, thermometers, test kits',
      productCount: 580,
    },
    {
      slug: 'surgical',
      title: 'Surgical',
      description: 'Instruments, sutures, sterilization',
      productCount: 920,
    },
    {
      slug: 'pharmacy',
      title: 'Pharmacy',
      description: 'OTC medications & supplements',
      productCount: 1100,
    },
    {
      slug: 'equipment',
      title: 'Equipment',
      description: 'Beds, wheelchairs, IV stands',
      productCount: 340,
    },
    {
      slug: 'ppe',
      title: 'PPE & Safety',
      description: 'Masks, gowns, face shields',
      productCount: 760,
    },
    {
      slug: 'dental',
      title: 'Dental',
      description: 'Burs, syringes, impression materials',
      productCount: 480,
    },
    {
      slug: 'first-aid',
      title: 'First Aid',
      description: 'Kits, bandages, emergency supplies',
      productCount: 290,
    },
  ],
  products: [
    {
      slug: 'nitrile-exam-gloves-box-100',
      title: 'Nitrile Exam Gloves — Box of 100',
      price: 12.99,
      category: 'Medical Supplies',
      sku: 'GLV-NIT-100',
      inStock: true,
      badge: 'Best Seller',
    },
    {
      slug: 'digital-blood-pressure-monitor',
      title: 'Digital Blood Pressure Monitor',
      price: 49.95,
      category: 'Diagnostics',
      sku: 'BP-DIG-001',
      inStock: true,
    },
    {
      slug: 'pulse-oximeter-fingertip',
      title: 'Fingertip Pulse Oximeter',
      price: 29.99,
      category: 'Diagnostics',
      sku: 'OX-FN-002',
      inStock: true,
      badge: 'New',
    },
    {
      slug: 'surgical-face-mask-50pk',
      title: 'Surgical Face Masks — 50 Pack',
      price: 8.49,
      category: 'PPE & Safety',
      sku: 'MSK-SRG-50',
      inStock: true,
    },
  ],
};

export default function HomePage() {
  const page = getHomePage() ?? defaultHome;

  return (
    <>
      {page.hero && <Hero data={page.hero} />}

      {page.categories && page.categories.length > 0 && (
        <CategoryGrid
          categories={page.categories}
          subtitle="Browse our full catalog of healthcare essentials"
        />
      )}

      {page.products && page.products.length > 0 && (
        <section className="bg-gray-50 py-12 lg:py-16">
          <div className="container-site">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-navy sm:text-3xl">
                  Featured Products
                </h2>
                <p className="mt-2 text-gray-500">
                  Top-rated supplies trusted by healthcare professionals
                </p>
              </div>
              <Link
                href="/categories/medical-supplies"
                className="hidden text-sm font-semibold text-primary hover:text-primary-700 sm:block"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {page.products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 lg:py-16">
        <div className="container-site">
          <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-700 p-8 text-center text-white lg:p-12">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Need bulk pricing for your facility?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-100">
              Get volume discounts, dedicated account management, and net-30
              terms for hospitals, clinics, and long-term care facilities.
            </p>
            <Link
              href="/bulk-orders"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-sm font-semibold text-primary transition hover:bg-primary-50"
            >
              Request a Quote
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
