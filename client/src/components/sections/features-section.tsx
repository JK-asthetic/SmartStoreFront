import { Truck, RefreshCw, Headphones } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section className="container mx-auto px-6 mb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="text-secondary mr-4">
            <Truck size={32} />
          </div>
          <div>
            <h3 className="font-poppins font-semibold text-primary">Free Shipping</h3>
            <p className="text-sm text-gray-600">On all orders over $50</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="text-secondary mr-4">
            <RefreshCw size={32} />
          </div>
          <div>
            <h3 className="font-poppins font-semibold text-primary">Easy Returns</h3>
            <p className="text-sm text-gray-600">30 days return policy</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="text-secondary mr-4">
            <Headphones size={32} />
          </div>
          <div>
            <h3 className="font-poppins font-semibold text-primary">Customer Support</h3>
            <p className="text-sm text-gray-600">24/7 dedicated support</p>
          </div>
        </div>
      </div>
    </section>
  );
}
