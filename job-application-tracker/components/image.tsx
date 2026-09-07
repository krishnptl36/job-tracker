'use client';

import Image from 'next/image';
import Button from './ui/button';
import { useState } from 'react';

export default function ImageTabs() {
  const [activeTab, setActiveTab] = useState('organize');

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
          <Button 
            onClick={() => setActiveTab('organize')}
            className={activeTab === 'organize' ? 'bg-blue-300 text-white hover:bg-red-300' : 'text-pink-300 hover:text-pink-400'}
          >
            Organize Applications
          </Button>
          <Button 
            onClick={() => setActiveTab('get-hired')}
            className={activeTab === 'get-hired' ? 'bg-blue-300 text-white hover:bg-red-300' : 'text-pink-300 hover:text-pink-400'}
          >
            Get Hired
          </Button>
          <Button 
            onClick={() => setActiveTab('manage-boards')}
            className={activeTab === 'manage-boards' ? 'bg-blue-300 text-white hover:bg-red-300' : 'text-pink-300 hover:text-yellow-400'}
          >
            Manage boards
          </Button>
        </div>

        <div className="relative mx-auto max-w-5xl overflow-hidden border border-gray-200 rounded-lg shadow-lg">
          {activeTab === 'organize' && (
            <Image 
              src="/hero1.png"
              alt="Organize Applications"
              width={1200}
              height={800}
            />
          )}

          {activeTab === 'get-hired' && (
            <Image 
              src="/hero2.png"
              alt="Get Hired"
              width={1200}
              height={800}
            />
          )}

          {activeTab === 'manage-boards' && (
            <Image 
              src="/hero3.png"
              alt="Manage Boards"
              width={1200}
              height={800}
            />
          )}
        </div>
      </div>
    </section>
  );
}