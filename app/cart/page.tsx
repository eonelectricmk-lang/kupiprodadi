'use client';

import React, { useState } from 'react';
import Header from '../components/Header';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([
    { id: 1, name: 'iPhone 13', price: 45000, quantity: 1 }
  ]);

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Вашата Кошничка</h1>
        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-12">Кошничката е празна.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-white p-4 border rounded-lg shadow-sm">
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-gray-600">{item.price.toLocaleString()} ден.</p>
                </div>
                <div className="flex items-center gap-4">
                  <span>Количина: {item.quantity}</span>
                  <button 
                    onClick={() => setItems([])}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Отстрани
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-8 border-t pt-4 flex justify-between items-center text-xl font-bold">
              <span>Вкупно:</span>
              <span>{total.toLocaleString()} ден.</span>
            </div>
            <button className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition">
              Продолжи кон наплата
            </button>
          </div>
        )}
      </main>
    </>
  );
}
