import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

export function getDiscountPercentage(price: number, oldPrice: number | null | undefined): number | null {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function debounce<F extends (...args: any[]) => any>(func: F, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<F>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function calculateTimeRemaining(endDate: Date): { 
  days: number; 
  hours: number; 
  minutes: number; 
  seconds: number 
} {
  const total = endDate.getTime() - new Date().getTime();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  
  return { days, hours, minutes, seconds };
}

export function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}
