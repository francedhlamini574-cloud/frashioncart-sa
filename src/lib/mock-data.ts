import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";

export type Product = {
  id: string;
  name: string;
  brand: string;
  brandSlug: string;
  price: number; // ZAR
  category: string;
  image: string;
  stock: number;
  isNew?: boolean;
  description: string;
};

export const CATEGORIES = [
  "Womenswear",
  "Menswear",
  "Accessories",
  "Footwear",
  "Jewellery",
  "Bags",
] as const;

export const BRANDS = [
  { slug: "maison-noir", name: "Maison Noir", location: "Cape Town", tagline: "Tailored essentials" },
  { slug: "isilo-atelier", name: "Isilo Atelier", location: "Johannesburg", tagline: "Contemporary womenswear" },
  { slug: "veld-and-co", name: "Veld & Co.", location: "Stellenbosch", tagline: "Slow-made leather" },
  { slug: "kopi-studio", name: "Kopi Studio", location: "Durban", tagline: "Fine jewellery" },
  { slug: "north-south", name: "North / South", location: "Pretoria", tagline: "Modern footwear" },
  { slug: "amani", name: "Amani", location: "Cape Town", tagline: "Resortwear" },
];

export const PRODUCTS: Product[] = [
  { id: "1", name: "Ivory Ribbed Cashmere Knit", brand: "Maison Noir", brandSlug: "maison-noir", price: 2890, category: "Womenswear", image: p1, stock: 12, isNew: true, description: "A weightless ribbed cashmere sweater cut for an oversized silhouette. Woven in a small mill outside Cape Town." },
  { id: "2", name: "The Black Wool Suit", brand: "Maison Noir", brandSlug: "maison-noir", price: 8450, category: "Menswear", image: p2, stock: 6, description: "Two-piece single-breasted wool suit. Half-canvas construction, unstructured shoulder." },
  { id: "3", name: "Caramel Structured Tote", brand: "Veld & Co.", brandSlug: "veld-and-co", price: 4200, category: "Bags", image: p3, stock: 8, isNew: true, description: "Full-grain vegetable-tanned leather. Handmade in Stellenbosch." },
  { id: "4", name: "Pleated Silk Midi Skirt", brand: "Isilo Atelier", brandSlug: "isilo-atelier", price: 3150, category: "Womenswear", image: p4, stock: 15, description: "Fine hand-pleated silk crepe in bone. Grosgrain waistband." },
  { id: "5", name: "Thread Bangle Set", brand: "Kopi Studio", brandSlug: "kopi-studio", price: 1980, category: "Jewellery", image: p5, stock: 24, isNew: true, description: "Trio of 9k gold-plated recycled brass bangles. Sold as a set." },
  { id: "6", name: "Court Sneakers, Cream", brand: "North / South", brandSlug: "north-south", price: 2450, category: "Footwear", image: p6, stock: 20, description: "Low-profile court sneaker in cream nappa leather. Rubber cup sole." },
];

export const featured = () => PRODUCTS.slice(0, 6);
export const trending = () => PRODUCTS.slice(0, 4);
export const newArrivals = () => PRODUCTS.filter(p => p.isNew);

export const formatZAR = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);
