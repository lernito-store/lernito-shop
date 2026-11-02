import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowUpLeft, ChevronDown, Heart, Instagram, Menu, Minus, Plus,
  Search, ShoppingBag, Sparkles, Star, Truck, UserRound, X, ShieldCheck,
  MapPin, Headphones, SlidersHorizontal, Clock3, LogIn,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Product = {
  id: string;
  name: string;
  brand: string;
  slug: string;
  image_url: string;
  gallery_urls: string[];
  price_toman: number;
  compare_at_price_toman?: number;
  volume_ml: number;
  fragrance_family: string;
  gender: 'مردانه' | 'زنانه' | 'یونیسکس';
  country: string;
  top_notes: string[];
  middle_notes: string[];
  base_notes: string[];
  description: string;
  sku: string;
  stock_quantity: number;
  is_new: boolean;
  is_demo: boolean;
  source_note: string;
};

type CartItem = { product: Product; quantity: number };

const imageSet = [
  'https://images.pexels.com/photos/11515541/pexels-photo-11515541.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/28481966/pexels-photo-28481966.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/27572999/pexels-photo-27572999.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/16239693/pexels-photo-16239693.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/10629797/pexels-photo-10629797.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/36779953/pexels-photo-36779953.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

const demoProducts: Product[] = [
  { id: 'demo-01', name: 'ساواج ادو پرفیوم', brand: 'Dior', slug: 'sauvage-edp', image_url: imageSet[3], gallery_urls: imageSet.slice(3, 5), price_toman: 8900000, compare_at_price_toman: 9900000, volume_ml: 100, fragrance_family: 'چوبی آروماتیک', gender: 'مردانه', country: 'فرانسه', top_notes: ['برگاموت', 'فلفل'], middle_notes: ['اسطوخودوس', 'پچولی'], base_notes: ['آمبروکسان', 'سدر'], description: 'نمونه نمایشی برای معرفی ساختار صفحه محصول. اطلاعات نهایی پس از ورود کاتالوگ تأییدشده جایگزین می‌شود.', sku: 'DEMO-DIO-001', stock_quantity: 12, is_new: false, is_demo: true, source_note: 'قیمت و موجودی نمونه هستند و تا زمان اتصال کاتالوگ واقعی قابل خرید نیستند.' },
  { id: 'demo-02', name: 'کوکو مادمازل', brand: 'Chanel', slug: 'coco-mademoiselle', image_url: imageSet[0], gallery_urls: imageSet.slice(0, 2), price_toman: 12400000, volume_ml: 100, fragrance_family: 'شرقی گلی', gender: 'زنانه', country: 'فرانسه', top_notes: ['پرتقال', 'ترنج'], middle_notes: ['رز', 'یاس'], base_notes: ['نعناع هندی', 'وتیور'], description: 'نمونه نمایشی از یک رایحه‌ی کلاسیک و روشن با امضای چوبی-مرکباتی.', sku: 'DEMO-CHA-002', stock_quantity: 8, is_new: false, is_demo: true, source_note: 'محصول نمونه؛ قیمت، موجودی و مشخصات برای نمایش تجربه کاربری درج شده‌اند.' },
  { id: 'demo-03', name: 'لوم ایدآل اکستریم', brand: 'Guerlain', slug: 'l-homme-ideal-extreme', image_url: imageSet[5], gallery_urls: imageSet.slice(5, 6), price_toman: 7600000, volume_ml: 100, fragrance_family: 'چوبی شرقی', gender: 'مردانه', country: 'فرانسه', top_notes: ['بادام', 'ترنج'], middle_notes: ['دارچین', 'آلو'], base_notes: ['تنباکو', 'سدر'], description: 'نمونه نمایشی برای نمایش رایحه‌های گرم و عمیق در کاتالوگ لرنیتو.', sku: 'DEMO-GUE-003', stock_quantity: 6, is_new: true, is_demo: true, source_note: 'این مورد نمونه‌ی نمایشی است و سفارش واقعی برای آن فعال نیست.' },
  { id: 'demo-04', name: 'باکارات رژ ۵۴۰', brand: 'Maison Francis Kurkdjian', slug: 'baccarat-rouge-540', image_url: imageSet[1], gallery_urls: imageSet.slice(1, 3), price_toman: 17800000, volume_ml: 70, fragrance_family: 'شرقی گلی', gender: 'یونیسکس', country: 'فرانسه', top_notes: ['زعفران', 'یاس'], middle_notes: ['عنبر چوبی'], base_notes: ['سدر', 'رزین صنوبر'], description: 'نمونه نمایشی برای بخش نیش و لوکس. خرید پس از تأیید منبع داده فعال خواهد شد.', sku: 'DEMO-MFK-004', stock_quantity: 3, is_new: true, is_demo: true, source_note: 'محصول نیش نمونه؛ اطلاعات فروش نهایی هنوز وارد نشده است.' },
  { id: 'demo-05', name: 'اونتوس', brand: 'Creed', slug: 'aventus', image_url: imageSet[4], gallery_urls: imageSet.slice(4, 6), price_toman: 21500000, volume_ml: 100, fragrance_family: 'چایپر میوه‌ای', gender: 'مردانه', country: 'فرانسه', top_notes: ['آناناس', 'ترنج'], middle_notes: ['یاس', 'پچولی'], base_notes: ['مشک', 'خزه'], description: 'نمونه نمایشی برای نمایش محصولات محبوب و پرتقاضا.', sku: 'DEMO-CRE-005', stock_quantity: 4, is_new: false, is_demo: true, source_note: 'قیمت و موجودی نمونه هستند و هنوز برای پرداخت نهایی فعال نشده‌اند.' },
  { id: 'demo-06', name: 'لاو دانت بی شای', brand: 'By Kilian', slug: 'love-dont-be-shy', image_url: imageSet[2], gallery_urls: imageSet.slice(2, 4), price_toman: 15300000, volume_ml: 50, fragrance_family: 'شرقی گلی', gender: 'زنانه', country: 'فرانسه', top_notes: ['بهارنارنج'], middle_notes: ['رز', 'یاس'], base_notes: ['وانیل', 'کارامل'], description: 'نمونه نمایشی از یک رایحه‌ی لطیف، شیرین و مجلل.', sku: 'DEMO-KIL-006', stock_quantity: 5, is_new: true, is_demo: true, source_note: 'نمونه‌ی نمایشی؛ آماده‌ی جایگزینی با داده‌ی معتبر فروشگاه.' },
];

const brands = ['Dior', 'Chanel', 'Tom Ford', 'Creed', 'Xerjoff', 'MFK'];
const formatToman = (amount: number) => new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
const formatNumber = (amount: number) => new Intl.NumberFormat('fa-IR').format(amount);

function App() {
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [query, setQuery] = useState('');
  const [gender, setGender] = useState('همه');
  const [activeSection, setActiveSection] = useState('خانه');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('lernito-cart') || '[]') as CartItem[]; } catch { return []; }
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('lernito-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!supabase) return;
    supabase.from('products').select('*').eq('is_available', true).order('created_at', { ascending: false }).then(({ data }) => {
      if (data && data.length > 0) setProducts(data as Product[]);
    });
  }, []);

  const filteredProducts = useMemo(() => products.filter((product) => {
    const searchable = `${product.name} ${product.brand} ${product.fragrance_family}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) && (gender === 'همه' || product.gender === gender);
  }), [gender, products, query]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price_toman * item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart((current) => {
      const exists = current.find((item) => item.product.id === product.id);
      if (exists) return current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const changeQuantity = (id: string, amount: number) => {
    setCart((current) => current.flatMap((item) => item.product.id === id ? (item.quantity + amount > 0 ? [{ ...item, quantity: item.quantity + amount }] : []) : [item]));
  };

  const toggleFavorite = (id: string) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const scrollToCatalog = (target = 'catalog') => {
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(target === 'catalog' ? 'فروشگاه' : 'خانه');
    setMenuOpen(false);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#fbfcfb] text-[#12282b] selection:bg-[#b9eee9] selection:text-[#0e3a3b]">
      <div className="border-b border-[#dce9e7] bg-[#f5fbfa] px-5 py-2 text-center text-xs font-medium tracking-wide text-[#38716f]">ارسال رایگان برای سفارش‌های بالای ۵ میلیون تومان</div>
      <header className="sticky top-0 z-40 border-b border-[#e3eeec]/80 bg-[#fbfcfb]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-8">
            <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="باز کردن منو"><Menu size={22} /></button>
            <button onClick={() => scrollToCatalog('top')} className="group flex items-center gap-3 text-right">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0d6e70] text-white shadow-lg shadow-[#0d6e70]/20"><Sparkles size={18} /></span>
              <span><b className="block text-xl font-black tracking-[0.18em] text-[#103e41]">LERNITO</b><small className="block text-[10px] tracking-[0.34em] text-[#5b8887]">لرنیتو</small></span>
            </button>
            <nav className={`${menuOpen ? 'absolute right-4 top-[70px] flex' : 'hidden'} w-[calc(100%-32px)] flex-col gap-5 rounded-2xl border border-[#dce9e7] bg-white p-5 shadow-xl lg:static lg:flex lg:w-auto lg:flex-row lg:items-center lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}>
              {['خانه', 'فروشگاه', 'برندها', 'راهنمای انتخاب', 'درباره ما'].map((item) => <button key={item} onClick={() => item === 'فروشگاه' ? scrollToCatalog() : setMenuOpen(false)} className={`text-sm transition hover:text-[#0d7778] ${activeSection === item ? 'font-bold text-[#0d7778]' : 'text-[#486465]'}`}>{item}</button>)}
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="hidden h-10 w-10 place-items-center rounded-full text-[#416465] transition hover:bg-[#e7f5f3] sm:grid"><Search size={19} /></button>
            <button onClick={() => setAuthOpen(true)} className="flex h-10 items-center gap-2 rounded-full px-3 text-sm text-[#416465] transition hover:bg-[#e7f5f3]"><UserRound size={19} /><span className="hidden sm:inline">حساب من</span></button>
            <button onClick={() => setCartOpen(true)} className="relative grid h-11 w-11 place-items-center rounded-full bg-[#e9f6f4] text-[#0d6e70] transition hover:bg-[#cfecea]"><ShoppingBag size={19} />{cartCount > 0 && <span className="absolute -left-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#0d6e70] px-1 text-[10px] font-bold text-white">{formatNumber(cartCount)}</span>}</button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-20 pt-7 lg:grid-cols-[1.03fr_.97fr] lg:items-center lg:px-8 lg:pt-12">
          <div className="order-2 lg:order-1 lg:pr-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b9dfdc] bg-[#f2fbfa] px-4 py-2 text-xs font-bold text-[#247574]"><Sparkles size={14} /> فصل تازه‌ی رایحه‌ها</div>
            <h1 className="max-w-xl text-5xl font-black leading-[1.12] tracking-tight text-[#0d3033] sm:text-6xl">رایحه‌ای که<br /><span className="text-[#0d7778]">امضای شماست.</span></h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-[#5c7071]">مجموعه‌ای انتخاب‌شده از عطرهای اصیل و نیش؛ برای لحظه‌هایی که قرار است در خاطر بمانند.</p>
            <div className="mt-9 flex flex-wrap items-center gap-3"><button onClick={() => scrollToCatalog()} className="group flex items-center gap-3 rounded-full bg-[#0d6e70] px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#0d6e70]/20 transition hover:-translate-y-1 hover:bg-[#095b5d]">مشاهده مجموعه <ArrowLeft size={17} className="transition group-hover:-translate-x-1" /></button><button onClick={() => setSelectedProduct(products[3])} className="flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-bold text-[#38716f] transition hover:bg-[#e9f6f4]">کشف رایحه‌ها <ArrowUpLeft size={17} /></button></div>
            <div className="mt-12 flex items-center gap-7 border-t border-[#e0ebea] pt-6"><div><b className="block text-xl text-[#17484a]">+۲۵۰</b><span className="text-xs text-[#718586]">برند منتخب</span></div><div className="h-8 w-px bg-[#dce9e7]" /><div><b className="block text-xl text-[#17484a]">+۱۲۰۰</b><span className="text-xs text-[#718586]">رایحه متفاوت</span></div></div>
          </div>
          <div className="order-1 relative min-h-[420px] overflow-hidden rounded-[2.2rem] bg-[#d8eeec] lg:order-2 lg:min-h-[570px]"><img src={imageSet[3]} alt="عطر لوکس لرنیتو" className="absolute inset-0 h-full w-full object-cover mix-blend-multiply" /><div className="absolute inset-0 bg-gradient-to-tr from-[#0d595b]/55 via-transparent to-transparent" /><div className="absolute bottom-6 right-6 rounded-2xl border border-white/40 bg-white/15 px-4 py-3 text-white backdrop-blur-md"><span className="block text-[10px] tracking-widest text-white/75">EDITOR'S CHOICE</span><b className="mt-1 block text-sm">ترکیب سکوت و جسارت</b></div><div className="absolute left-5 top-5 grid h-16 w-16 place-items-center rounded-full border border-white/40 bg-white/15 text-center text-[10px] font-bold leading-4 text-white backdrop-blur-md">NEW<br />SEASON</div></div>
        </section>

        <section className="border-y border-[#e3eeec] bg-white py-5"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-5 text-xs font-bold text-[#72908f] sm:justify-between lg:px-8"><span className="flex items-center gap-2"><ShieldCheck size={17} className="text-[#0d7778]" /> تضمین اصالت کالا</span><span className="flex items-center gap-2"><Truck size={17} className="text-[#0d7778]" /> ارسال امن و سریع</span><span className="flex items-center gap-2"><Headphones size={17} className="text-[#0d7778]" /> مشاوره تخصصی رایحه</span><span className="flex items-center gap-2"><Clock3 size={17} className="text-[#0d7778]" /> پشتیبانی هر روز هفته</span></div></section>

        <section id="catalog" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 lg:px-8"><div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><span className="text-xs font-bold tracking-[0.18em] text-[#0d7778]">THE EDIT</span><h2 className="mt-2 text-3xl font-black text-[#123a3d]">منتخب سردبیر</h2></div><button onClick={() => setActiveSection('فروشگاه')} className="flex items-center gap-2 text-sm font-bold text-[#0d7778]">مشاهده همه <ArrowLeft size={16} /></button></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{brands.map((brand) => <button key={brand} onClick={() => { setQuery(brand); document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' }); }} className="group rounded-2xl border border-[#e2eceb] bg-[#fbfdfd] px-3 py-5 text-center transition hover:-translate-y-1 hover:border-[#9cd2ce] hover:bg-[#f2fbfa]"><span className="text-base font-black tracking-wide text-[#426768] transition group-hover:text-[#0d7778]">{brand}</span><small className="mt-2 block text-[10px] text-[#90a4a3]">مشاهده عطرها</small></button>)}</div></section>

        <section id="catalog-grid" className="bg-[#f5f9f8] px-5 py-20 lg:px-8"><div className="mx-auto max-w-7xl"><div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><span className="text-xs font-bold tracking-[0.18em] text-[#0d7778]">OUR COLLECTION</span><h2 className="mt-2 text-3xl font-black text-[#123a3d]">آرشیو رایحه‌ها</h2></div><div className="flex flex-col gap-3 sm:flex-row"><div className="flex h-11 items-center gap-2 rounded-full border border-[#d6e5e3] bg-white px-4 sm:w-72"><Search size={17} className="text-[#7b9795]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جست‌وجوی نام یا برند" className="w-full bg-transparent text-sm outline-none placeholder:text-[#a7b8b7]" /></div><div className="flex items-center gap-1 rounded-full border border-[#d6e5e3] bg-white p-1 text-xs"><SlidersHorizontal size={16} className="mx-2 text-[#72908f]" />{['همه', 'مردانه', 'زنانه', 'یونیسکس'].map((item) => <button key={item} onClick={() => setGender(item)} className={`rounded-full px-3 py-2 transition ${gender === item ? 'bg-[#0d6e70] font-bold text-white' : 'text-[#5f7b7b] hover:bg-[#edf7f5]'}`}>{item}</button>)}</div></div></div><div className="mb-5 flex items-center justify-between text-xs text-[#78908f]"><span>{formatNumber(filteredProducts.length)} رایحه برای شما</span><button className="flex items-center gap-1">مرتب‌سازی <ChevronDown size={15} /></button></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} favorite={favorites.includes(product.id)} onFavorite={() => toggleFavorite(product.id)} onOpen={() => setSelectedProduct(product)} onAdd={() => addToCart(product)} />)}</div>{filteredProducts.length === 0 && <div className="rounded-3xl border border-dashed border-[#bdd7d4] bg-white py-20 text-center text-sm text-[#72908f]">رایحه‌ای با این مشخصات پیدا نشد.</div>}</div></section>

        <section className="mx-auto grid max-w-7xl gap-5 px-5 py-20 lg:grid-cols-2 lg:px-8"><div className="relative min-h-[310px] overflow-hidden rounded-[2rem] bg-[#d9efec]"><img src={imageSet[1]} alt="رایحه های نیش" className="absolute inset-0 h-full w-full object-cover opacity-75 mix-blend-multiply" /><div className="absolute inset-0 bg-gradient-to-l from-[#164f50]/80 to-transparent" /><div className="relative flex h-full flex-col justify-center p-8 text-white"><span className="text-xs font-bold tracking-widest text-[#c6f3ee]">NICHE COLLECTION</span><h3 className="mt-3 max-w-xs text-3xl font-black leading-tight">برای کسانی که<br />متفاوت انتخاب می‌کنند.</h3><button onClick={() => setQuery('MFK')} className="mt-6 flex w-fit items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-xs font-bold transition hover:bg-white hover:text-[#164f50]">کشف نیش‌ها <ArrowLeft size={15} /></button></div></div><div className="flex min-h-[310px] flex-col justify-between rounded-[2rem] bg-[#e9f6f4] p-8"><div><span className="text-xs font-bold tracking-widest text-[#0d7778]">LERNITO NOTES</span><h3 className="mt-3 max-w-md text-3xl font-black leading-tight text-[#164f50]">انتخاب عطر،<br />یک گفت‌وگوی شخصی است.</h3><p className="mt-4 max-w-md text-sm leading-7 text-[#628180]">اگر هنوز رایحه‌ی امضای خودتان را پیدا نکرده‌اید، مشاوران لرنیتو کنار شما هستند.</p></div><button onClick={() => setAuthOpen(true)} className="flex w-fit items-center gap-2 rounded-full bg-[#0d6e70] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#095b5d]">درخواست مشاوره <ArrowLeft size={15} /></button></div></section>

        <section className="bg-[#103f41] px-5 py-16 text-white lg:px-8"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-center"><div><span className="text-xs font-bold tracking-widest text-[#8ed7d1]">STAY IN THE SCENT</span><h2 className="mt-3 text-3xl font-black">خبرهای خوب رایحه‌ای<br />به صندوق شما می‌رسند.</h2></div><div><div className="flex rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-sm"><input placeholder="ایمیل شما" className="min-w-0 flex-1 bg-transparent px-5 text-sm outline-none placeholder:text-white/45" /><button className="rounded-full bg-[#b9eee9] px-5 py-3 text-xs font-black text-[#164f50] transition hover:bg-white">عضویت</button></div><p className="mt-3 text-[11px] text-white/45">با عضویت، از داستان‌ها و پیشنهادهای اختصاصی لرنیتو باخبر می‌شوید.</p></div></div></section>
      </main>

      <footer className="bg-[#0b3032] px-5 pb-8 pt-14 text-white lg:px-8"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4"><div className="md:col-span-1"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#0d7778]"><Sparkles size={16} /></span><b className="tracking-[0.18em]">LERNITO</b></div><p className="mt-5 text-sm leading-7 text-white/55">لرنیتو، انتخابی آرام و دقیق برای کشف جهان عطرها.</p><div className="mt-5 flex gap-2"><a href="#" className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-[#8ed7d1] hover:text-[#8ed7d1]"><Instagram size={15} /></a><a href="#" className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-xs text-white/70 transition hover:border-[#8ed7d1] hover:text-[#8ed7d1]">t</a></div></div><div><h4 className="mb-5 text-sm font-bold text-[#c4eeea]">لرنیتو</h4><div className="space-y-3 text-xs text-white/55"><a href="#" className="block hover:text-white">درباره ما</a><a href="#" className="block hover:text-white">تماس با ما</a><a href="#" className="block hover:text-white">مجله رایحه</a></div></div><div><h4 className="mb-5 text-sm font-bold text-[#c4eeea]">راهنمای خرید</h4><div className="space-y-3 text-xs text-white/55"><a href="#" className="block hover:text-white">شیوه ارسال</a><a href="#" className="block hover:text-white">بازگشت کالا</a><a href="#" className="block hover:text-white">سوالات متداول</a></div></div><div><h4 className="mb-5 flex items-center gap-2 text-sm font-bold text-[#c4eeea]"><MapPin size={15} /> فروش حضوری</h4><p className="text-xs leading-7 text-white/55">قدوزک آباد، کوچه علی چپ ۲، مغازه لرنیتو</p><p className="mt-3 text-[10px] text-[#8ed7d1]">این نشانی موقت و قابل ویرایش توسط مدیر فروشگاه است.</p></div></div><div className="mx-auto mt-12 flex max-w-7xl flex-col justify-between gap-3 border-t border-white/10 pt-5 text-[10px] text-white/35 sm:flex-row"><span>© ۱۴۰۳ LERNITO — همه حقوق محفوظ است.</span><span>ساخته شده توسط گروه آقای علی حسینی‌پور</span></div></footer>

      {selectedProduct && <ProductModal product={selectedProduct} favorite={favorites.includes(selectedProduct.id)} onFavorite={() => toggleFavorite(selectedProduct.id)} onClose={() => setSelectedProduct(null)} onAdd={() => addToCart(selectedProduct)} />}
      {cartOpen && <CartDrawer cart={cart} total={cartTotal} onClose={() => setCartOpen(false)} onChange={changeQuantity} onCheckout={() => setAuthOpen(true)} />}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  );
}

function ProductCard({ product, favorite, onFavorite, onOpen, onAdd }: { product: Product; favorite: boolean; onFavorite: () => void; onOpen: () => void; onAdd: () => void }) {
  return <article className="group relative overflow-hidden rounded-[1.6rem] border border-[#e1ecea] bg-white p-3 transition duration-300 hover:-translate-y-1 hover:border-[#abd8d4] hover:shadow-xl hover:shadow-[#0d6e70]/[.08]"><div className="relative aspect-[.92] overflow-hidden rounded-[1.2rem] bg-[#edf6f4]"><img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><button onClick={onFavorite} aria-label="افزودن به علاقه‌مندی" className={`absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full backdrop-blur-md transition ${favorite ? 'bg-[#0d6e70] text-white' : 'bg-white/75 text-[#577978] hover:bg-white'}`}><Heart size={16} fill={favorite ? 'currentColor' : 'none'} /></button>{product.is_new && <span className="absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[10px] font-bold text-[#0d7778] backdrop-blur-md">تازه‌وارد</span>}<button onClick={onOpen} className="absolute bottom-3 left-3 right-3 translate-y-3 rounded-full bg-[#0d6e70]/95 py-2.5 text-xs font-bold text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">جزئیات محصول</button></div><div className="px-1 pb-1 pt-4"><div className="flex items-center justify-between gap-3"><div><span className="text-[10px] font-bold tracking-wider text-[#789493]">{product.brand}</span><h3 className="mt-1 font-bold text-[#173f41]">{product.name}</h3></div><span className="flex items-center gap-1 text-[10px] text-[#be9357]"><Star size={12} fill="currentColor" /> ۴.۸</span></div><div className="mt-3 flex items-center justify-between"><span className="text-sm font-black text-[#17484a]">{formatToman(product.price_toman)}</span><button onClick={onAdd} className="grid h-8 w-8 place-items-center rounded-full bg-[#e9f6f4] text-[#0d7778] transition hover:bg-[#0d6e70] hover:text-white"><Plus size={16} /></button></div></div></article>;
}

function ProductModal({ product, favorite, onFavorite, onClose, onAdd }: { product: Product; favorite: boolean; onFavorite: () => void; onClose: () => void; onAdd: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#082e30]/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" onClick={onClose}><div className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-t-[2rem] bg-white p-5 shadow-2xl sm:rounded-[2rem] sm:p-7" onClick={(e) => e.stopPropagation()}><div className="mb-5 flex items-center justify-between"><span className="rounded-full bg-[#edf8f6] px-3 py-1 text-[10px] font-bold text-[#0d7778]">{product.is_demo ? 'نمونه نمایشی' : 'موجود در کاتالوگ'}</span><button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[#f2f7f6] text-[#547270]"><X size={18} /></button></div><div className="grid gap-7 md:grid-cols-2"><div className="overflow-hidden rounded-[1.5rem] bg-[#edf6f4]"><img src={product.image_url} alt={product.name} className="h-full max-h-[470px] min-h-[310px] w-full object-cover" /></div><div className="flex flex-col justify-center"><span className="text-xs font-bold tracking-[.18em] text-[#0d7778]">{product.brand}</span><h2 className="mt-2 text-3xl font-black text-[#143d40]">{product.name}</h2><div className="mt-4 flex items-center gap-3"><span className="text-xl font-black text-[#0d7778]">{formatToman(product.price_toman)}</span><span className="rounded-full bg-[#f2f7f6] px-3 py-1 text-xs text-[#6e8987]">{formatNumber(product.volume_ml)} میل</span></div><p className="mt-5 text-sm leading-8 text-[#657d7c]">{product.description}</p><div className="mt-5 grid grid-cols-3 gap-2 border-y border-[#e7efee] py-4 text-center text-xs"><div><span className="mb-1 block text-[10px] text-[#8aa09f]">نت‌های آغازین</span><b className="text-[#315e5e]">{product.top_notes.join('، ')}</b></div><div><span className="mb-1 block text-[10px] text-[#8aa09f]">نت‌های میانی</span><b className="text-[#315e5e]">{product.middle_notes.join('، ')}</b></div><div><span className="mb-1 block text-[10px] text-[#8aa09f]">نت‌های پایه</span><b className="text-[#315e5e]">{product.base_notes.join('، ')}</b></div></div><div className="mt-6 flex gap-2"><button onClick={onAdd} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0d6e70] py-3.5 text-sm font-bold text-white transition hover:bg-[#095b5d]"><ShoppingBag size={17} /> افزودن به سبد</button><button onClick={onFavorite} className={`grid w-12 place-items-center rounded-full border ${favorite ? 'border-[#0d7778] bg-[#e9f6f4] text-[#0d7778]' : 'border-[#dce9e7] text-[#668180]'}`}><Heart size={18} fill={favorite ? 'currentColor' : 'none'} /></button></div>{product.is_demo && <p className="mt-4 flex gap-2 text-[11px] leading-6 text-[#9a7c50]"><Sparkles size={14} className="mt-1 shrink-0" />{product.source_note}</p>}</div></div></div></div>;
}

function CartDrawer({ cart, total, onClose, onChange, onCheckout }: { cart: CartItem[]; total: number; onClose: () => void; onChange: (id: string, amount: number) => void; onCheckout: () => void }) {
  return <div className="fixed inset-0 z-50 bg-[#082e30]/45 backdrop-blur-sm" onClick={onClose}><aside className="absolute left-0 top-0 flex h-full w-full max-w-md flex-col bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between border-b border-[#e5eeed] pb-5"><div><span className="text-xs text-[#7b9593]">سبد خرید شما</span><h2 className="mt-1 text-xl font-black text-[#143d40]">انتخاب‌های شما</h2></div><button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[#f2f7f6]"><X size={18} /></button></div><div className="flex-1 overflow-auto py-5">{cart.length === 0 ? <div className="flex h-full flex-col items-center justify-center text-center text-[#78908f]"><ShoppingBag size={36} strokeWidth={1.2} /><p className="mt-4 text-sm">سبد شما هنوز خالی است.</p></div> : <div className="space-y-4">{cart.map(({ product, quantity }) => <div key={product.id} className="flex gap-3 rounded-2xl bg-[#f6faf9] p-3"><img src={product.image_url} alt={product.name} className="h-20 w-20 rounded-xl object-cover" /><div className="min-w-0 flex-1"><span className="text-[10px] text-[#78908f]">{product.brand}</span><h3 className="truncate text-sm font-bold text-[#254e50]">{product.name}</h3><span className="mt-1 block text-xs font-bold text-[#0d7778]">{formatToman(product.price_toman)}</span><div className="mt-2 flex items-center gap-2"><button onClick={() => onChange(product.id, -1)} className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#537271]"><Minus size={12} /></button><span className="text-xs font-bold">{formatNumber(quantity)}</span><button onClick={() => onChange(product.id, 1)} className="grid h-6 w-6 place-items-center rounded-full bg-white text-[#537271]"><Plus size={12} /></button></div></div></div>)}</div>}</div><div className="border-t border-[#e5eeed] pt-5"><div className="mb-4 flex items-center justify-between"><span className="text-sm text-[#78908f]">جمع سفارش</span><b className="text-lg text-[#143d40]">{formatToman(total)}</b></div><button disabled={cart.length === 0} onClick={onCheckout} className="w-full rounded-full bg-[#0d6e70] py-3.5 text-sm font-bold text-white transition hover:bg-[#095b5d] disabled:cursor-not-allowed disabled:bg-[#bed6d3]">ادامه و ورود به checkout</button><p className="mt-3 text-center text-[10px] text-[#99aaa9]">برای نهایی کردن خرید، ورود با شماره موبایل لازم است.</p></div></aside></div>;
}

function AuthModal({ onClose }: { onClose: () => void }) {
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-[#082e30]/55 p-5 backdrop-blur-sm" onClick={onClose}><div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e5f5f2] text-[#0d7778]"><LogIn size={21} /></div><button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[#f2f7f6]"><X size={18} /></button></div><h2 className="mt-6 text-2xl font-black text-[#143d40]">ورود به لرنیتو</h2><p className="mt-2 text-sm leading-7 text-[#718887]">برای پیگیری سفارش‌ها و تکمیل خرید، شماره موبایل خود را وارد کنید.</p><label className="mt-6 block text-xs font-bold text-[#527271]">شماره موبایل</label><div className="mt-2 flex h-12 items-center rounded-xl border border-[#dce9e7] px-4"><span className="border-l border-[#dce9e7] pl-3 text-sm text-[#91a6a4]">+۹۸</span><input placeholder="۹۱۲ ۱۲۳ ۴۵۶۷" className="w-full bg-transparent pr-3 text-left text-sm outline-none" dir="ltr" /></div><button disabled className="mt-4 w-full rounded-full bg-[#bed6d3] py-3.5 text-sm font-bold text-white">ارسال کد تأیید</button><div className="mt-5 rounded-2xl bg-[#fffaf2] p-4 text-xs leading-6 text-[#90734d]"><Sparkles size={14} className="mb-1 inline" /> احراز هویت پیامکی هنوز فعال نشده است. پس از اتصال سرویس پیامک، کد یک‌بارمصرف با انقضا و محدودیت ارسال از سمت سرور مدیریت خواهد شد.</div></div></div>;
}

export default App;
