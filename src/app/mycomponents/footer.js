export default function Footer() {
  return (
    <footer className="bg-black text-white">
      {/* Newsletter Section */}
      <div className="max-w-md mx-auto text-center px-6 py-12 border-b border-gray-800">
        <h2 className="text-2xl font-serif font-semibold mb-3">
          Join our AI jewelry revolution
        </h2>
        <p className="text-gray-400 mb-6 text-sm">
          Be the first to explore exclusive AI-generated jewelry drops and limited collections.
        </p>

        {/* 📧 Newsletter Input & Button (Primary) */}
        <form className="flex flex-col gap-3 justify-center items-center">
          <input
            type="email"
            placeholder="Enter your email"
            // ✨ ADDED: text-white placeholder-white border border-white focus:ring-1 focus:ring-white
            className="w-full sm:w-72 px-4 py-2 bg-transparent text-white placeholder-white rounded-md border border-white focus:outline-none focus:ring-1 focus:ring-white"
          />
          <button
            type="submit"
            className="bg-white text-black font-medium px-4 py-2 rounded-md hover:bg-gray-200 transition-all"
          >
            Sign up
          </button>
        </form>

        <p className="text-gray-500 text-xs mt-4">
          By signing up, you agree to our terms and receive exclusive updates.
        </p>

        <img
          src="/images/footer-image.jpg"
          alt="Newsletter preview"
          className="mt-8 rounded-lg object-cover w-full h-40"
        />
      </div>

      {/* Footer Links */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
        {/* Logo & Description */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Logo</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="font-medium text-white">Pricely AI Jewels</li>
            <li>About us</li>
            <li>Our process</li>
            <li>Craftsmanship</li>
            <li>Sustainability</li>
            <li>Collections</li>
          </ul>
        </div>

        {/* Explore */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Explore</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>Royal Gold</li>
            <li>Minimal Silver</li>
            <li>Bridal Magic</li>
            <li>Custom designs</li>
            <li>Support</li>
          </ul>
        </div>

        {/* Contact (Includes Secondary Subscribe Form) */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>FAQ</li>
            <li>Shipping</li>
            <li>Returns</li>
            <li>Subscribe</li>
          </ul>

          {/* Secondary Subscribe form inside Contact */}
          <form className="mt-4">
            <label className="text-sm text-gray-300 mb-1 block">Enter email</label>
            <input
              type="email"
              placeholder="Subscribe"
              // ✨ ADDED: bg-transparent text-white placeholder-white border border-white focus:ring-1 focus:ring-white
              className="w-full px-3 py-2 rounded-md bg-transparent text-white placeholder-white border border-white mb-2 focus:outline-none focus:ring-1 focus:ring-white"
            />
            <button
              type="submit"
              className="w-full bg-white text-black py-2 rounded-md text-sm hover:bg-gray-200 transition-all"
            >
              Thank you for subscribing.
            </button>
          </form>
        </div>
      </div>

      {/* Social & Policy */}
      <div className="border-t border-gray-800 py-6 px-6 text-center text-gray-400 text-sm">
        {/* Social Icons - Changed parent div to text-white for icon color */}
        <div className="flex justify-center gap-5 mb-5 text-white">
          <a href="#" className="hover:text-gray-400 transition-all text-lg" aria-label="Facebook">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="#" className="hover:text-gray-400 transition-all text-lg" aria-label="Instagram">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="#" className="hover:text-gray-400 transition-all text-lg" aria-label="X (Twitter)">
            <i className="fab fa-x-twitter"></i>
          </a>
          <a href="#" className="hover:text-gray-400 transition-all text-lg" aria-label="YouTube">
            <i className="fab fa-youtube"></i>
          </a>
        </div>

        {/* Policies */}
        <div className="space-x-4">
          <a href="#" className="hover:text-white transition-all">Terms of Service</a>
          <a href="#" className="hover:text-white transition-all">Cookies Settings</a>
          <a href="#" className="hover:text-white transition-all">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}