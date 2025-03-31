import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { calculateTimeRemaining, padZero } from "@/lib/utils";

export default function SaleBannerSection() {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  useEffect(() => {
    // Set end date to 5 days from now
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 5);
    
    const intervalId = setInterval(() => {
      const remaining = calculateTimeRemaining(endDate);
      setTimeRemaining(remaining);
      
      // Clear interval when countdown ends
      if (
        remaining.days <= 0 &&
        remaining.hours <= 0 &&
        remaining.minutes <= 0 &&
        remaining.seconds <= 0
      ) {
        clearInterval(intervalId);
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <section className="container mx-auto px-6 mb-12">
      <div className="relative bg-primary/5 rounded-xl overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <span className="text-secondary font-medium mb-2">Limited Time Offer</span>
            <h2 className="text-primary font-poppins text-3xl md:text-4xl font-bold mb-4">Summer Sale</h2>
            <p className="text-gray-600 mb-6 text-lg">
              Get up to 50% off on selected items. Offer valid until August 31st.
            </p>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <span className="block text-2xl font-bold text-primary">
                  {padZero(timeRemaining.days)}
                </span>
                <span className="text-xs text-gray-500">Days</span>
              </div>
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <span className="block text-2xl font-bold text-primary">
                  {padZero(timeRemaining.hours)}
                </span>
                <span className="text-xs text-gray-500">Hours</span>
              </div>
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <span className="block text-2xl font-bold text-primary">
                  {padZero(timeRemaining.minutes)}
                </span>
                <span className="text-xs text-gray-500">Minutes</span>
              </div>
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <span className="block text-2xl font-bold text-primary">
                  {padZero(timeRemaining.seconds)}
                </span>
                <span className="text-xs text-gray-500">Seconds</span>
              </div>
            </div>
            <Button 
              className="bg-secondary hover:bg-secondary/90 text-white font-poppins font-medium py-3 px-6 rounded-full transition-all inline-block self-start"
              asChild
            >
              <Link href="/products?filter=sale">
                Shop the Sale
              </Link>
            </Button>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80" 
              alt="Summer Sale Collection" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
