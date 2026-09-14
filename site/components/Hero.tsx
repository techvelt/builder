import Link from 'next/link';
import type { HeroData } from '@/lib/types';

interface HeroProps {
  data: HeroData;
}

export default function Hero({ data }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-800 to-navy-900 text-white">
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #0d9488 0%, transparent 50%), radial-gradient(circle at 80% 20%, #14b8a6 0%, transparent 40%)',
          }}
        />
      </div>

      <div className="container-site relative grid items-center gap-8 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          {data.badge && (
            <span className="mb-4 inline-block rounded-full bg-primary/20 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary-300">
              {data.badge}
            </span>
          )}
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {data.title}
          </h1>
          {data.subtitle && (
            <p className="mt-4 max-w-lg text-lg text-navy-100 leading-relaxed">
              {data.subtitle}
            </p>
          )}
          {data.ctaLabel && data.ctaHref && (
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={data.ctaHref} className="btn-primary text-base px-8 py-3">
                {data.ctaLabel}
              </Link>
              <Link
                href="/categories/medical-supplies"
                className="inline-flex items-center justify-center rounded-lg border border-white/30 px-8 py-3 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Browse Catalog
              </Link>
            </div>
          )}
        </div>

        <div className="relative hidden lg:block">
          <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 shadow-2xl">
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-4xl">
                🏥
              </div>
              <p className="text-xl font-semibold">Professional Grade</p>
              <p className="mt-2 text-sm text-primary-100">
                Trusted by 10,000+ healthcare facilities
              </p>
            </div>
          </div>
          <div className="absolute -bottom-4 -left-4 rounded-xl bg-white p-4 shadow-lg">
            <p className="text-2xl font-bold text-primary">99.2%</p>
            <p className="text-xs text-gray-500">On-time delivery</p>
          </div>
        </div>
      </div>
    </section>
  );
}
