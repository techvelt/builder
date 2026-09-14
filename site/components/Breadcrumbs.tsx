import Link from 'next/link';
import type { BreadcrumbItem } from '@/lib/types';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-gray-100 bg-gray-50">
      <div className="container-site py-3">
        <ol className="flex flex-wrap items-center gap-1 text-sm">
          <li>
            <Link href="/" className="text-gray-500 hover:text-primary transition">
              Home
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center gap-1">
              <span className="text-gray-300" aria-hidden="true">/</span>
              {index === items.length - 1 ? (
                <span className="font-medium text-navy" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-primary transition"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
