import { useState, useEffect, useMemo } from "react";
import { Search as SearchIcon, Smartphone, Shirt, Home, Watch, Sparkles, Loader2, Package, ShoppingCart, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import Layout from "@/components/Layout";
import { useShopifyCartStore } from "@/stores/shopifyCartStore";
import { useCart } from "@/contexts/CartContext";
import { storefrontApiRequest, STOREFRONT_PRODUCTS_QUERY, ShopifyProduct } from "@/lib/shopify";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

import earbudsImg from "@/assets/products/earbuds.jpg";
import smartwatchImg from "@/assets/products/smartwatch.jpg";
import speakerImg from "@/assets/products/speaker.jpg";
import poloImg from "@/assets/products/polo.jpg";
import handbagImg from "@/assets/products/handbag.jpg";
import sneakersImg from "@/assets/products/sneakers.jpg";
import desklampImg from "@/assets/products/desklamp.jpg";
import pillowsImg from "@/assets/products/pillows.jpg";
import walletImg from "@/assets/products/wallet.jpg";
import sunglassesImg from "@/assets/products/sunglasses.jpg";
import phonecaseImg from "@/assets/products/phonecase.jpg";
import powerbankImg from "@/assets/products/powerbank.jpg";
import backpackImg from "@/assets/products/backpack.jpg";
import mouseImg from "@/assets/products/mouse.jpg";
import mugsImg from "@/assets/products/mugs.jpg";
import wristwatchImg from "@/assets/products/wristwatch.jpg";
import chargerImg from "@/assets/products/charger.jpg";
import runningshoesImg from "@/assets/products/runningshoes.jpg";
import candleImg from "@/assets/products/candle.jpg";
import headphonesImg from "@/assets/products/headphones.jpg";

const MAX_PRICE = 50000;

const categories = [
  { key: "all", label: "All", icon: Sparkles },
  { key: "electronics", label: "Electronics", icon: Smartphone },
  { key: "fashion", label: "Fashion", icon: Shirt },
  { key: "home", label: "Home Items", icon: Home },
  { key: "accessories", label: "Accessories", icon: Watch },
];

const localProducts = [
  { id: 1,  name: "Wireless Earbuds",      price: "₦15,000", priceNum: 15000, category: "electronics",  img: earbudsImg },
  { id: 2,  name: "Smart Watch",           price: "₦25,000", priceNum: 25000, category: "electronics",  img: smartwatchImg },
  { id: 3,  name: "Bluetooth Speaker",     price: "₦12,000", priceNum: 12000, category: "electronics",  img: speakerImg },
  { id: 4,  name: "Men's Polo Shirt",      price: "₦8,000",  priceNum: 8000,  category: "fashion",      img: poloImg },
  { id: 5,  name: "Women's Handbag",       price: "₦18,000", priceNum: 18000, category: "fashion",      img: handbagImg },
  { id: 6,  name: "Sneakers",              price: "₦22,000", priceNum: 22000, category: "fashion",      img: sneakersImg },
  { id: 7,  name: "LED Desk Lamp",         price: "₦6,500",  priceNum: 6500,  category: "home",         img: desklampImg },
  { id: 8,  name: "Throw Pillows (set)",   price: "₦9,000",  priceNum: 9000,  category: "home",         img: pillowsImg },
  { id: 9,  name: "Leather Wallet",        price: "₦5,000",  priceNum: 5000,  category: "accessories",  img: walletImg },
  { id: 10, name: "Sunglasses",            price: "₦7,500",  priceNum: 7500,  category: "accessories",  img: sunglassesImg },
  { id: 11, name: "Phone Case",            price: "₦3,000",  priceNum: 3000,  category: "accessories",  img: phonecaseImg },
  { id: 12, name: "Power Bank 20000mAh",   price: "₦14,000", priceNum: 14000, category: "electronics",  img: powerbankImg },
  { id: 13, name: "Laptop Backpack",       price: "₦16,000", priceNum: 16000, category: "accessories",  img: backpackImg },
  { id: 14, name: "Gaming Mouse RGB",      price: "₦11,000", priceNum: 11000, category: "electronics",  img: mouseImg },
  { id: 15, name: "Ceramic Mug Set",       price: "₦7,000",  priceNum: 7000,  category: "home",         img: mugsImg },
  { id: 16, name: "Gold Wristwatch",       price: "₦45,000", priceNum: 45000, category: "accessories",  img: wristwatchImg },
  { id: 17, name: "Wireless Charger",      price: "₦8,500",  priceNum: 8500,  category: "electronics",  img: chargerImg },
  { id: 18, name: "Running Shoes",         price: "₦19,000", priceNum: 19000, category: "fashion",      img: runningshoesImg },
  { id: 19, name: "Scented Candle",        price: "₦4,500",  priceNum: 4500,  category: "home",         img: candleImg },
  { id: 20, name: "Premium Headphones",    price: "₦35,000", priceNum: 35000, category: "electronics",  img: headphonesImg },
];

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

// Simple debounce hook for search input
function useSearchDebounce(value: string, delay = 350): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [cat, setCat] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
  const [showFilters, setShowFilters] = useState(false);
  const [shopifyProducts, setShopifyProducts] = useState<ShopifyProduct[]>([]);
  const [shopifyLoading, setShopifyLoading] = useState(true);

  const addShopifyItem = useShopifyCartStore((s) => s.addItem);
  const isShopifyCartLoading = useShopifyCartStore((s) => s.isLoading);
  const { addItem: addLocalItem } = useCart();

  const debouncedQuery = useSearchDebounce(query);

  // Sync query param to URL
  useEffect(() => {
    if (debouncedQuery) {
      setSearchParams({ q: debouncedQuery }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [debouncedQuery, setSearchParams]);

  // Fetch Shopify products
  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, { first: 100 });
        const edges = data?.data?.products?.edges || [];
        setShopifyProducts(edges);
      } catch {
        // ignore — Shopify unavailable
      } finally {
        setShopifyLoading(false);
      }
    };
    fetch();
  }, []);

  // Filtered local products
  const filteredLocal = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    return localProducts.filter((p) => {
      const matchesQuery = !q || p.name.toLowerCase().includes(q);
      const matchesCat = cat === "all" || p.category === cat;
      const matchesPrice = p.priceNum >= priceRange[0] && p.priceNum <= priceRange[1];
      return matchesQuery && matchesCat && matchesPrice;
    });
  }, [debouncedQuery, cat, priceRange]);

  // Filtered Shopify products
  const filteredShopify = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    return shopifyProducts.filter((p) => {
      const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
      const matchesQuery = !q || p.node.title.toLowerCase().includes(q) || p.node.description.toLowerCase().includes(q);
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      return matchesQuery && matchesPrice;
    });
  }, [debouncedQuery, shopifyProducts, priceRange]);

  const handleAddShopifyItem = async (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;
    await addShopifyItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
  };

  const totalResults = filteredLocal.length + filteredShopify.length;

  return (
    <Layout>
      {/* Hero / Search Bar */}
      <section className="relative pt-28 md:pt-36 pb-10 px-4 md:px-8 lg:px-16 bg-background overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/8 blur-3xl" aria-hidden />
        <div className="container mx-auto relative">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow mb-4"
          >
            ◍ Product Search
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-heading text-[clamp(2.5rem,9vw,6rem)] leading-[0.95] mb-8"
          >
            Find what you
            <br />
            <span className="italic text-primary">need</span>.
          </motion.h1>

          {/* Search input */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex gap-3 max-w-2xl"
          >
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="pl-11 h-12 text-base rounded-full border-border bg-card"
                autoFocus
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters((v) => !v)}
              className={`h-12 px-5 rounded-full gap-2 ${showFilters ? "border-primary text-primary bg-primary/5" : ""}`}
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </motion.div>

          {/* Filter panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 max-w-2xl bg-card border border-border rounded-2xl p-6 space-y-5"
            >
              {/* Category */}
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Category</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <Button
                      key={c.key}
                      size="sm"
                      variant={cat === c.key ? "default" : "outline"}
                      onClick={() => setCat(c.key)}
                      className={cat === c.key ? "gold-gradient text-primary-foreground" : ""}
                    >
                      <c.icon size={13} className="mr-1.5" /> {c.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Price range: <span className="text-foreground">₦{priceRange[0].toLocaleString()} – ₦{priceRange[1].toLocaleString()}</span>
                </p>
                <Slider
                  min={0}
                  max={MAX_PRICE}
                  step={500}
                  value={priceRange}
                  onValueChange={(v) => setPriceRange(v as [number, number])}
                  className="w-full"
                />
              </div>

              {/* Reset */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setCat("all"); setPriceRange([0, MAX_PRICE]); }}
                className="text-muted-foreground"
              >
                Reset filters
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="section-padding bg-background">
        <div className="container mx-auto">
          {/* Result count */}
          <p className="text-sm text-muted-foreground mb-8">
            {debouncedQuery
              ? <>Showing <strong className="text-foreground">{totalResults}</strong> result{totalResults !== 1 ? "s" : ""} for "<strong className="text-foreground">{debouncedQuery}</strong>"</>
              : <><strong className="text-foreground">{totalResults}</strong> products available</>
            }
          </p>

          {/* Shopify results */}
          {!shopifyLoading && filteredShopify.length > 0 && (
            <div className="mb-12">
              <h2 className="font-heading text-2xl mb-6 flex items-center gap-2">
                <span className="text-primary text-sm font-semibold uppercase tracking-widest">Online Store</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredShopify.map((product, i) => {
                  const imgUrl = product.node.images?.edges?.[0]?.node?.url;
                  const price = product.node.priceRange.minVariantPrice;
                  return (
                    <motion.div key={product.node.id} custom={i} variants={scaleIn} initial="hidden" animate="visible">
                      <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-2 hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
                        <Link to={`/product/${product.node.handle}`}>
                          <div className="h-48 overflow-hidden bg-muted group">
                            {imgUrl
                              ? <img src={imgUrl} alt={product.node.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              : <div className="flex items-center justify-center h-full"><Package size={32} className="text-muted-foreground/30" /></div>
                            }
                          </div>
                        </Link>
                        <div className="p-4 flex flex-col flex-1">
                          <Link to={`/product/${product.node.handle}`}>
                            <h3 className="font-semibold text-sm mb-1 hover:text-primary transition-colors">{product.node.title}</h3>
                          </Link>
                          <p className="font-heading text-xl text-primary mb-4">{price.currencyCode} {parseFloat(price.amount).toLocaleString()}</p>
                          <div className="mt-auto">
                            <Button
                              className="w-full gold-gradient text-primary-foreground hover:opacity-90"
                              size="sm"
                              onClick={() => handleAddShopifyItem(product)}
                              disabled={isShopifyCartLoading}
                            >
                              {isShopifyCartLoading ? <Loader2 size={14} className="mr-2 animate-spin" /> : <ShoppingCart size={14} className="mr-2" />}
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Local catalog results */}
          {filteredLocal.length > 0 && (
            <div>
              <h2 className="font-heading text-2xl mb-6">
                <span className="text-primary text-sm font-semibold uppercase tracking-widest">Catalog</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredLocal.map((p, i) => (
                  <motion.div key={p.id} custom={i} variants={scaleIn} initial="hidden" animate="visible">
                    <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-2 hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
                      <div className="h-48 overflow-hidden group">
                        <img src={p.img} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-semibold text-sm mb-1">{p.name}</h3>
                        <p className="font-heading text-xl text-primary mb-4">{p.price}</p>
                        <div className="mt-auto">
                          <Button
                            className="w-full gold-gradient text-primary-foreground hover:opacity-90"
                            size="sm"
                            onClick={() => addLocalItem({ id: p.id, name: p.name, price: p.price, priceNum: p.priceNum, img: p.img })}
                          >
                            <ShoppingCart size={14} className="mr-2" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {totalResults === 0 && !shopifyLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 bg-card rounded-2xl border border-border"
            >
              <SearchIcon size={48} className="mx-auto text-muted-foreground/20 mb-4" />
              <h3 className="font-heading text-2xl mb-2">No products found</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                Try adjusting your search term, category, or price range.
              </p>
              <Button variant="outline" onClick={() => { setQuery(""); setCat("all"); setPriceRange([0, MAX_PRICE]); }}>
                Clear search
              </Button>
            </motion.div>
          )}

          {/* Loading Shopify */}
          {shopifyLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
              <span className="text-muted-foreground text-sm">Loading online products…</span>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Search;
