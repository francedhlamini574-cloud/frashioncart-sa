import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";

export type Gender = "Men" | "Women" | "Unisex" | "Kids";

export type ProductColor = { name: string; hex: string };

export type Product = {
  id: string;
  name: string;
  brand: string;
  brandSlug: string;
  price: number; // ZAR
  category: string;
  gender: Gender;
  sizes: string[];
  colors: ProductColor[];
  image: string;
  images?: string[];
  stock: number;
  isNew?: boolean;
  trending?: boolean;
  discountPct?: number;
  rating?: number;
  createdAt: string;
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

export const GENDERS: Gender[] = ["Men", "Women", "Unisex", "Kids"];

export const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
export const SHOE_SIZES_UK = ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"];
export const SHOE_SIZES_EU = ["EU 36", "EU 37", "EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"];
export const ACCESSORY_SIZES = ["One size"];

export function sizePresetFor(category: string): string[] {
  if (category === "Footwear") return SHOE_SIZES_UK;
  if (category === "Jewellery" || category === "Bags" || category === "Accessories") return ACCESSORY_SIZES;
  return CLOTHING_SIZES;
}

export const BRANDS = [
  { slug: "maison-noir", name: "Maison Noir", location: "Cape Town", tagline: "Tailored essentials", verified: true, followers: 12400, rating: 4.9 },
  { slug: "isilo-atelier", name: "Isilo Atelier", location: "Johannesburg", tagline: "Contemporary womenswear", verified: true, followers: 8900, rating: 4.8 },
  { slug: "veld-and-co", name: "Veld & Co.", location: "Stellenbosch", tagline: "Slow-made leather", verified: true, followers: 6100, rating: 4.9 },
  { slug: "kopi-studio", name: "Kopi Studio", location: "Durban", tagline: "Fine jewellery", verified: true, followers: 4300, rating: 4.7 },
  { slug: "north-south", name: "North / South", location: "Pretoria", tagline: "Modern footwear", verified: true, followers: 7200, rating: 4.6 },
  { slug: "amani", name: "Amani", location: "Cape Town", tagline: "Resortwear", verified: false, followers: 2100, rating: 4.5 },
];

const now = Date.now();
const iso = (daysAgo: number) => new Date(now - daysAgo * 86400000).toISOString();

const CREAM = { name: "Cream", hex: "#f2ead6" };
const BLACK = { name: "Black", hex: "#1a1614" };
const CARAMEL = { name: "Caramel", hex: "#b98a5a" };
const BONE = { name: "Bone", hex: "#e6dfd0" };
const GOLD = { name: "Gold", hex: "#c9a15a" };

export const PRODUCTS: Product[] = [
  { id: "1", name: "Ivory Ribbed Cashmere Knit", brand: "Maison Noir", brandSlug: "maison-noir", price: 2890, category: "Womenswear", gender: "Women", sizes: ["XS","S","M","L","XL"], colors: [CREAM, BONE], image: p1, stock: 12, isNew: true, trending: true, rating: 4.8, createdAt: iso(2), description: "A weightless ribbed cashmere sweater cut for an oversized silhouette. Woven in a small mill outside Cape Town." },
  { id: "2", name: "The Black Wool Suit", brand: "Maison Noir", brandSlug: "maison-noir", price: 8450, category: "Menswear", gender: "Men", sizes: ["S","M","L","XL","XXL"], colors: [BLACK], image: p2, stock: 6, rating: 4.9, createdAt: iso(6), description: "Two-piece single-breasted wool suit. Half-canvas construction, unstructured shoulder." },
  { id: "3", name: "Caramel Structured Tote", brand: "Veld & Co.", brandSlug: "veld-and-co", price: 4200, category: "Bags", gender: "Unisex", sizes: ["One size"], colors: [CARAMEL, BLACK], image: p3, stock: 8, isNew: true, trending: true, discountPct: 15, rating: 4.7, createdAt: iso(4), description: "Full-grain vegetable-tanned leather. Handmade in Stellenbosch." },
  { id: "4", name: "Pleated Silk Midi Skirt", brand: "Isilo Atelier", brandSlug: "isilo-atelier", price: 3150, category: "Womenswear", gender: "Women", sizes: ["XS","S","M","L"], colors: [BONE, BLACK], image: p4, stock: 15, rating: 4.6, createdAt: iso(9), description: "Fine hand-pleated silk crepe in bone. Grosgrain waistband." },
  { id: "5", name: "Thread Bangle Set", brand: "Kopi Studio", brandSlug: "kopi-studio", price: 1980, category: "Jewellery", gender: "Unisex", sizes: ["One size"], colors: [GOLD], image: p5, stock: 24, isNew: true, rating: 4.8, createdAt: iso(1), description: "Trio of 9k gold-plated recycled brass bangles. Sold as a set." },
  { id: "6", name: "Court Sneakers, Cream", brand: "North / South", brandSlug: "north-south", price: 2450, category: "Footwear", gender: "Unisex", sizes: ["UK 5","UK 6","UK 7","UK 8","UK 9","UK 10","UK 11"], colors: [CREAM, BLACK], image: p6, stock: 20, trending: true, discountPct: 10, rating: 4.7, createdAt: iso(12), description: "Low-profile court sneaker in cream nappa leather. Rubber cup sole." },
];

export const featured = () => [...PRODUCTS].sort((a,b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 6);
export const trending = () => PRODUCTS.filter(p => p.trending).slice(0, 4);
export const newArrivals = () => [...PRODUCTS].sort((a,b) => +new Date(b.createdAt) - +new Date(a.createdAt)).filter(p => p.isNew).slice(0, 8);

export function priceAfterDiscount(p: Product): number {
  if (!p.discountPct) return p.price;
  return Math.round(p.price * (1 - p.discountPct / 100));
}

export const formatZAR = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(n);
