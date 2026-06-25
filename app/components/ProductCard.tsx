'use client';

import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  id: number;
  title: string;
  price: number;
  image_url?: string;
  category: string;
  seller_name: string;
}

export default function ProductCard({ id, title, price, image_url, category, seller_name }: ProductCardProps) {
  return (
    <Link href={`/products/${id}?category=${encodeURIComponent(category)}`}>
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative h-48 bg-gray-200">
          {image_url ? (
            <Image
              src={image_url}
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Нема слика
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold truncate">{title}</h3>
          <p className="text-sm text-gray-500">{category}</p>
          <p className="text-xs text-gray-400 mt-2">Продавач: {seller_name}</p>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-2xl font-bold text-blue-600">{price} ден.</span>
            <button className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
              Детали
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
