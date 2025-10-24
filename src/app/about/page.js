export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
                Crafted Elegance, Modern Design
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                We create jewelry that blends timeless craftsmanship with contemporary style. Each piece is designed to celebrate everyday moments and life’s milestones.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="px-4 py-2 rounded-full bg-black text-white text-sm">Ethically Sourced</span>
                <span className="px-4 py-2 rounded-full bg-white border text-sm">Handcrafted</span>
                <span className="px-4 py-2 rounded-full bg-white border text-sm">Limited Editions</span>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border bg-white shadow-sm">
              <img src="/images/jwellery 1.png" alt="Our atelier" className="w-full h-[360px] object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border">
              <div className="text-2xl font-bold">10k+</div>
              <div className="text-sm text-gray-600">Happy Customers</div>
              <p className="mt-3 text-gray-600">Trusted by jewelry lovers around the world for quality and care.</p>
            </div>
            <div className="bg-white rounded-xl p-6 border">
              <div className="text-2xl font-bold">Premium</div>
              <div className="text-sm text-gray-600">Materials</div>
              <p className="mt-3 text-gray-600">Gold, platinum, silver, and contemporary alloys sustainably sourced.</p>
            </div>
            <div className="bg-white rounded-xl p-6 border">
              <div className="text-2xl font-bold">Design</div>
              <div className="text-sm text-gray-600">First Approach</div>
              <p className="mt-3 text-gray-600">Minimal, elegant forms tailored for comfort and daily wear.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900">Our Story</h2>
          <p className="mt-3 text-gray-700 leading-relaxed">
            What began as a small studio has evolved into a modern atelier committed to responsible craftsmanship. We partner with skilled artisans and select materials with care to ensure every piece meets our standards for beauty and integrity.
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm text-gray-500">2019</div>
              <div className="font-semibold">Founded</div>
              <p className="text-sm text-gray-600 mt-1">Launched our first capsule collection.</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm text-gray-500">2022</div>
              <div className="font-semibold">Global Shipping</div>
              <p className="text-sm text-gray-600 mt-1">Expanded logistics to serve more regions.</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm text-gray-500">Today</div>
              <div className="font-semibold">Sustainable Focus</div>
              <p className="text-sm text-gray-600 mt-1">Investing in ethical sourcing and recyclable packaging.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-semibold text-gray-900">Join Our Community</h3>
          <p className="mt-3 text-gray-600">Be the first to know about new drops, limited editions, and special stories from our studio.</p>
          <a href="/products" className="inline-block mt-6 px-6 py-3 rounded-lg bg-black text-white">Explore Collection</a>
        </div>
      </section>
    </main>
  );
 }
