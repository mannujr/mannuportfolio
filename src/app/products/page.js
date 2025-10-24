"use client";

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';

import { useNotification } from '@/context/NotificationContext';
import { useCart } from '@/context/CartContext';

const productsInitial = [];

const PRICE_RANGES = [
  { max: 500, label: 'Under $500' },
  { max: 1000, label: 'Under $1,000' },
  { max: 2000, label: 'Under $2,000' },
  { max: 5000, label: 'Under $5,000' },
  { max: Infinity, label: 'All Prices' }
];

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
  </div>
);

// Error component
const Error = ({ message }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-red-500 text-center">
      <h2 className="text-xl font-bold">Error</h2>
      <p>{message}</p>
    </div>
  </div>
);

// ProductCard Component (Same)
const ProductCard = ({ product }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
        <div className="h-64 bg-gray-100 flex items-center justify-center">
            <Link href={`/products/${product.slug}`} className="w-full h-full block">
              <img 
                src={product.imageUrl || '/images/placeholder.png'} 
                alt={product.name} 
                className="object-cover w-full h-full"
              />
            </Link>
        </div>
        <div className="p-4 text-center">
            <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.type} - {product.metal}</p>
            <p className="mt-2 text-xl font-bold text-gray-900">${product.price}</p>
        </div>
    </div>
);


// --- Desktop/iPad Filter Content (Used by the Sidebar) ---
const FilterContent = ({ typeOptions, metalOptions, countsByType, countsByMetal, maxPrice, selectedType, setSelectedType, selectedMetal, setSelectedMetal, priceRange, setPriceRange, handleClearFilters }) => (
    <div className="p-6 pt-0">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">
            Our Collection
        </h2>
        {/* Type Filter */}
        <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Type</h3>
            {(typeOptions || ['Necklace', 'Ring', 'Bracelet']).map(type => (
            <p 
                key={type} 
                onClick={() => setSelectedType(type)}
                className={`text-base py-1 cursor-pointer transition-colors duration-200 
                            ${selectedType === type ? 'font-bold text-black' : 'text-gray-600 hover:text-gray-900'}`}
            >
                {type}{countsByType && countsByType[type] ? ` (${countsByType[type]})` : ''}
            </p>
            ))}
        </div>
        {/* Metal Filter */}
        <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Metal</h3>
            <div className="flex flex-wrap gap-2">
            {(metalOptions || ['Gold', 'Silver']).map(metal => (
                <span 
                key={metal}
                onClick={() => setSelectedMetal(metal)}
                className={`px-3 py-1 border rounded-full text-sm font-medium cursor-pointer transition-all duration-200 
                            ${selectedMetal === metal 
                                ? 'bg-amber-700 text-white border-amber-700 shadow-md' 
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'}`}
                >
                {metal}{countsByMetal && countsByMetal[metal] ? ` (${countsByMetal[metal]})` : ''}
                </span>
            ))}
            </div>
        </div>
        {/* Price Range Filter */}
        <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Price Range</h3>
            <input 
            type="range"
            min="0"
            max={maxPrice || 10000000}
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer range-lg"
            style={{
                '--tw-ring-color': '#b45309',
                '--tw-ring-opacity': '1',
                '--tw-ring-width': '2px'
            }}
            />
            <div className="text-sm text-gray-600 mt-2">
            Up to <span className="font-bold">${priceRange}</span>
            </div>
        </div>
        <button 
            onClick={handleClearFilters}
            className="text-sm text-gray-500 hover:text-gray-900 underline mt-4"
        >
            Clear Filters
        </button>
    </div>
);

// --- NEW: Mobile Filter Chips Component (The horizontal lines) ---
const MobileFilterChips = ({ typeOptions, metalOptions, maxPrice, selectedType, setSelectedType, selectedMetal, setSelectedMetal, priceRange, setPriceRange }) => {
    const _typeOptions = typeOptions || ['Necklace', 'Ring', 'Bracelet'];
    const _metalOptions = metalOptions || ['Gold', 'Silver'];
    
    return (
        <div className="flex flex-col space-y-3 pb-1">
            
            {/* 1. Type Chips */}
            <div className="overflow-x-auto whitespace-nowrap py-1">
                <span className="text-xs font-semibold text-gray-500 mr-2">Type:</span>
                {_typeOptions.map(type => (
                    <span 
                        key={type}
                        onClick={() => setSelectedType(type === selectedType ? null : type)} // Toggle
                        className={`inline-block px-3 py-1 mr-2 border rounded-full text-sm font-medium cursor-pointer transition-all duration-200 
                                    ${selectedType === type 
                                        ? 'bg-amber-700 text-white border-amber-700 shadow-md' 
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'}`}
                    >
                        {type}
                    </span>
                ))}
            </div>

            {/* 2. Metal Chips */}
            <div className="overflow-x-auto whitespace-nowrap py-1">
                <span className="text-xs font-semibold text-gray-500 mr-2">Metal:</span>
                {_metalOptions.map(metal => (
                    <span 
                        key={metal}
                        onClick={() => setSelectedMetal(metal === selectedMetal ? null : metal)} // Toggle
                        className={`inline-block px-3 py-1 mr-2 border rounded-full text-sm font-medium cursor-pointer transition-all duration-200 
                                    ${selectedMetal === metal 
                                        ? 'bg-amber-700 text-white border-amber-700 shadow-md' 
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'}`}
                    >
                        {metal}
                    </span>
                ))}
            </div>

            {/* 3. Price Range Slider (Horizontal) */}
            <div className="py-2">
                <h3 className="text-xs font-semibold text-gray-500 mb-2">Price: Up to <span className="font-bold text-gray-800">${priceRange}</span></h3>
                <input 
                  type="range"
                  min="0"
                  max={maxPrice || 10000000}
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer range-lg"
                  style={{
                      '--tw-ring-color': '#b45309',
                      '--tw-ring-opacity': '1',
                      '--tw-ring-width': '2px'
                  }}
                />
            </div>
        </div>
    );
}

// --- Main Page Component ---

export default function ProductPage() {
    const [selectedType, setSelectedType] = useState(null);
    const [selectedMetal, setSelectedMetal] = useState(null);
    const [priceRange, setPriceRange] = useState(10000000); 
    const [isFilterOpen, setIsFilterOpen] = useState(false); 
        const [products, setProducts] = useState(productsInitial);
        const [filterOptions, setFilterOptions] = useState({ types: null, metals: null, countsByType: null, countsByMetal: null });

        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
            let mounted = true;
            const fetchProducts = async () => {
                try {
                    const res = await fetch('/api/products', { cache: 'no-store' });
                    if (!res.ok) {
                        throw new Error(`Error ${res.status}: ${await res.text()}`);
                    }
                    const data = await res.json();
                    if (mounted) {
                        setProducts(data.products || []);
                        if (data.filters) {
                          setFilterOptions({ 
                            types: data.filters.types || null, 
                            metals: data.filters.metals || null,
                            countsByType: data.filters.countsByType || null,
                            countsByMetal: data.filters.countsByMetal || null
                          });
                        }
                    }
                } catch (e) {
                    console.error('Failed to fetch products:', e);
                    if (mounted) {
                        setError(e.message);
                    }
                } finally {
                    if (mounted) {
                        setLoading(false);
                    }
                }
            };
            
            fetchProducts();
            return () => {
                mounted = false;
            };
        },[]);

        // Poll for updates every 20s to auto-refresh when admin adds new products
        useEffect(() => {
          const interval = setInterval(async () => {
            try {
              const res = await fetch('/api/products', { cache: 'no-store' });
              if (!res.ok) return;
              const data = await res.json();
              setProducts(data.products || []);
              if (data.filters) {
                setFilterOptions({ 
                  types: data.filters.types || null,
                  metals: data.filters.metals || null,
                  countsByType: data.filters.countsByType || null,
                  countsByMetal: data.filters.countsByMetal || null
                });
              }
            } catch {}
          }, 20000);
          return () => clearInterval(interval);
        }, []);

    const handleClearFilters = () => { 
        setSelectedType(null); 
        setSelectedMetal(null); 
        setPriceRange(10000000); 
    };

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const typeMatch = !selectedType || product.type === selectedType;
            const metalMatch = !selectedMetal || product.metal === selectedMetal;
            const priceMatch = product.price <= priceRange;
            return typeMatch && metalMatch && priceMatch;
        });
    }, [products, selectedType, selectedMetal, priceRange]);


    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* --- Sticky Mobile Header/Filter Bar (Mobile only) --- */}
                <div className="sticky top-20 z-30 bg-gray-50 lg:hidden -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-gray-200 pb-2">
                    <div className="mb-2 flex justify-between items-center pt-2">
                        <h2 className="text-xl font-serif font-bold text-gray-900">
                            Our Collection
                        </h2>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)} // Toggle chip visibility
                            className={`flex items-center space-x-2 px-4 py-2 border rounded-full text-sm font-medium shadow-sm transition duration-150 ${
                                isFilterOpen
                                    ? 'bg-gray-800 text-white border-gray-800' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100' 
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                            </svg>
                            <span>{isFilterOpen ? 'Hide Filters' : 'Filter'}</span>
                        </button>
                    </div>

                    {/* --- Mobile Chips Container (Conditional Display) --- */}
                    {isFilterOpen && (
                        <MobileFilterChips 
                            typeOptions={filterOptions.types}
                            metalOptions={filterOptions.metals}
                            maxPrice={10000000}
                            selectedType={selectedType} setSelectedType={setSelectedType}
                            selectedMetal={selectedMetal} setSelectedMetal={setSelectedMetal}
                            priceRange={priceRange} setPriceRange={setPriceRange}
                        />
                    )}
                </div>

                {/* --- Main Content Layout --- */}
                <div className="flex pt-4 lg:pt-0">
                    
                    {/* --- Desktop/iPad Sticky Sidebar (Visible lg:block) --- */}
                    <aside className="w-1/4 pr-12 hidden lg:block">
                        <div className="sticky top-20"> 
                            <FilterContent 
                                typeOptions={filterOptions.types}
                                metalOptions={filterOptions.metals}
                                countsByType={filterOptions.countsByType}
                                countsByMetal={filterOptions.countsByMetal}
                                maxPrice={10000000}
                                selectedType={selectedType} setSelectedType={setSelectedType}
                                selectedMetal={selectedMetal} setSelectedMetal={setSelectedMetal}
                                priceRange={priceRange} setPriceRange={setPriceRange}
                                handleClearFilters={handleClearFilters}
                            />
                        </div>
                    </aside>

                    {/* --- Product Grid (Fills remaining space) --- */}
                    <main className="w-full lg:w-3/4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                            {filteredProducts.map((product) => (
                            <ProductCard key={product._id || product.slug} product={product} />
                            ))}
                            {filteredProducts.length === 0 && (
                            <p className="col-span-full text-center py-10 text-xl text-gray-500">
                                No products found matching your criteria.
                            </p>
                            )}
                        </div>
                    </main>
                </div>
            </div>
            
            {/* --- Footer (Same as before) --- */}
            <footer className="mt-20 border-t border-gray-200 pt-10 text-center text-sm text-gray-600">
                <div className="flex justify-center space-x-6 mb-4">
                    <Link href="#" className="hover:text-gray-800">Privacy Policy</Link>
                    <Link href="#" className="hover:text-gray-800">Terms of Service</Link>
                    <Link href="#" className="hover:text-gray-800">Shipping & Returns</Link>
                </div>
                <div className="flex justify-center space-x-4 mb-4 text-xl">
                    <span>𝕏</span>
                    <span>📸</span>
                    <span>📘</span>
                </div>
                <p>© 2024 Princely AI Jewels. All rights reserved.</p>
            </footer>
            
        </div>
    );
}