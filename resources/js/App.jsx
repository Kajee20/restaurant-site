import { useEffect, useMemo, useState } from 'react';

const money = (value) => `Rs. ${Number(value || 0).toLocaleString('en-LK')}`;
const csrf = () => document.querySelector('meta[name="csrf-token"]')?.content || '';
const fallbackFoodImage = 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80';
const menuCategoryOrder = ['Biryani', 'Fried Rice', 'Kothu', 'Chicken', 'Short Eats', 'Extras'];
const menuItemOrder = new Map([
    'Chicken Biryani', 'Beef Biryani', 'Mutton Biryani', 'Special Biryani',
    'Chicken Fried Rice', 'Beef Fried Rice', 'Egg Fried Rice', 'Mixed Fried Rice', 'Seafood Fried Rice',
    'Chicken Kothu', 'Beef Kothu', 'Egg Kothu', 'Cheese Kothu', 'Special Kothu',
    'Fried Chicken (2 Pcs)', 'Grill Chicken (Half)', 'Grill Chicken (Full)', 'Chicken Wings (6 Pcs)',
    'French Fries', 'Chicken Nuggets (6 Pcs)', 'Chicken Samosa (1 Pc)', 'Vegetable Samosa (1 Pc)', 'Fish Cutlet (1 Pc)', 'Egg Roll (1 Pc)',
    'Parotta (1 Pc)', 'Egg (1 Pc)', 'Raita', 'Gravy',
].map((name, index) => [name, index]));

function useFallbackFoodImage(event) {
    event.currentTarget.onerror = null;
    event.currentTarget.src = fallbackFoodImage;
}

async function api(url, options = {}) {
    const response = await fetch(url, {
        credentials: 'same-origin',
        ...options,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf(), ...options.headers },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        const detail = result.errors ? Object.values(result.errors).flat().join(' ') : result.message;
        throw new Error(detail || 'Something went wrong. Please try again.');
    }
    return result;
}

const fieldClass = 'w-full rounded-xl border border-[#e5e0d6] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c65b3d] focus:ring-2 focus:ring-[#c65b3d]/10';
const buttonClass = 'rounded-full bg-[#263c30] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#354f40] disabled:cursor-not-allowed disabled:opacity-50';

function App() {
    const [view, setView] = useState(window.location.hash === '#admin' ? 'admin' : window.location.hash === '#account' ? 'account' : 'home');
    const [customer, setCustomer] = useState(null);
    const [foods, setFoods] = useState([]);
    const [featuredFoodIndex, setFeaturedFoodIndex] = useState(0);
    const [selectedFood, setSelectedFood] = useState(null);
    const [category, setCategory] = useState('All');
    const [cart, setCart] = useState({});
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const [orderComplete, setOrderComplete] = useState(null);
    const [trackResult, setTrackResult] = useState(null);

    const loadMenu = () => api('/api/menu').then(setFoods).catch((error) => setMessage(error.message));
    useEffect(() => {
        loadMenu();
        api('/api/user/status').then((data) => setCustomer(data.customer)).catch(() => setCustomer(null));
        const onHash = () => setView(window.location.hash === '#admin' ? 'admin' : window.location.hash === '#account' ? 'account' : 'home');
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
    }, []);

    useEffect(() => {
        if (foods.length < 2) {
            return undefined;
        }

        const interval = window.setInterval(() => {
            setFeaturedFoodIndex((current) => (current + 1) % foods.length);
        }, 3500);

        return () => window.clearInterval(interval);
    }, [foods.length]);

    useEffect(() => {
        if (!selectedFood) {
            return undefined;
        }

        const closeOnEscape = (event) => {
            if (event.key === 'Escape') {
                setSelectedFood(null);
            }
        };

        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [selectedFood]);

    const categories = useMemo(() => ['All', ...menuCategoryOrder.filter((menuCategory) => foods.some((food) => food.category === menuCategory))], [foods]);
    const visibleFoods = useMemo(() => foods
        .filter((food) => category === 'All' || food.category === category)
        .sort((firstFood, secondFood) => (menuItemOrder.get(firstFood.name) ?? Number.MAX_SAFE_INTEGER) - (menuItemOrder.get(secondFood.name) ?? Number.MAX_SAFE_INTEGER)), [foods, category]);
    const featuredFood = foods[featuredFoodIndex];
    const cartRows = foods.filter((food) => cart[food.id]).map((food) => ({ ...food, quantity: cart[food.id] }));
    const cartCount = cartRows.reduce((sum, food) => sum + food.quantity, 0);
    const total = cartRows.reduce((sum, food) => sum + food.price * food.quantity, 0);
    const addToCart = (id) => setCart((current) => ({ ...current, [id]: (current[id] || 0) + 1 }));
    const changeQuantity = (id, amount) => setCart((current) => {
        const next = { ...current };
        next[id] = (next[id] || 0) + amount;
        if (next[id] <= 0) delete next[id];
        return next;
    });

    async function submitOrder(event) {
        event.preventDefault();
        if (!customer) {
            window.location.hash = 'account';
            setView('account');
            return;
        }
        const formElement = event.currentTarget;
        setBusy(true); setMessage('');
        const form = new FormData(formElement);
        try {
            const order = await api('/api/orders', { method: 'POST', body: JSON.stringify({
                customer_phone: form.get('phone'),
                delivery_address: form.get('address'), items: cartRows.map((food) => ({ food_item_id: food.id, quantity: food.quantity })),
            }) });
            setOrderComplete(order); setCart({}); formElement.reset();
        } catch (error) { setMessage(error.message); }
        finally { setBusy(false); }
    }

    async function trackOrder(event) {
        event.preventDefault(); setMessage('');
        const form = new FormData(event.currentTarget);
        try {
            const result = await api('/api/orders/track', { method: 'POST', body: JSON.stringify({ order_number: form.get('order_number'), customer_email: form.get('email') }) });
            setTrackResult(result);
        } catch (error) { setTrackResult(null); setMessage(error.message); }
    }

    return (
        <main className="min-h-screen bg-[#faf7f0] text-[#20251f]">
            <header className="sticky top-0 z-20 border-b border-[#eae5db] bg-[#faf7f0]/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
                    <a onClick={() => { window.location.hash = ''; setView('home'); }} className="cursor-pointer text-lg font-black tracking-[0.16em]">SK <span className="text-[#c65b3d]">KITCHEN</span></a>
                    <nav className="flex items-center gap-3 text-sm md:gap-7">
                        <a className="hidden hover:text-[#c65b3d] sm:inline" href="#menu">Menu</a>
                        <a className="hidden hover:text-[#c65b3d] sm:inline" href="#about">About us</a>
                        <a className="hidden hover:text-[#c65b3d] sm:inline" href="#contact">Contact</a>
                        <a className="hidden hover:text-[#c65b3d] sm:inline" href="#orders">My order</a>
                        <button onClick={() => { window.location.hash = 'admin'; setView('admin'); }} className="hidden hover:text-[#c65b3d] sm:inline">Admin</button>
                        <button onClick={() => { window.location.hash = 'account'; setView('account'); }} className="rounded-full border border-[#ded8cd] px-4 py-2.5 font-semibold text-[#263c30]">{customer?.name || 'Sign in'}</button>
                        <a href="#basket" className="rounded-full bg-[#c65b3d] px-4 py-2.5 font-semibold text-white">Basket <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5">{cartCount}</span></a>
                    </nav>
                </div>
            </header>

            {view === 'admin' ? <AdminPanel onBack={() => { window.location.hash = ''; setView('home'); }} /> : view === 'account' ? <CustomerAccount customer={customer} onCustomerChange={setCustomer} onBack={() => { window.location.hash = ''; setView('home'); }} onContinue={() => { window.location.hash = ''; setView('home'); setTimeout(() => document.getElementById('basket')?.scrollIntoView({ behavior: 'smooth' }), 50); }} /> : (
                <>
                    <section className="relative isolate flex min-h-[76vh] items-center overflow-hidden bg-[#14231d] text-white md:min-h-[680px]">
                        <img key={featuredFood?.id || 'featured-food'} className="absolute inset-0 -z-20 h-full w-full object-cover opacity-65 transition-opacity duration-1000" src={featuredFood?.image_url || fallbackFoodImage} onError={useFallbackFoodImage} alt={featuredFood?.name || 'Sri Lankan food'} />
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#14231d] via-[#14231d]/75 to-[#14231d]/25" />
                        <div className="mx-auto grid w-full max-w-7xl items-end gap-12 px-5 py-24 md:grid-cols-[1fr_auto] md:px-8 md:py-32">
                            <div>
                                <p className="mb-6 text-xs font-bold uppercase tracking-[0.28em] text-[#f0b18f]">A little taste of home · Alaveddy</p>
                                <h1 className="max-w-3xl text-6xl font-semibold leading-[0.98] tracking-tight md:text-8xl">Good food.<br /><span className="font-serif italic text-[#f0b18f]">Good people.</span></h1>
                                <p className="mt-7 max-w-xl text-base leading-7 text-white/80 md:text-lg">Sri Lankan favourites, cooked slowly and served with love. Settle in, explore the menu, and order something that feels like home.</p>
                                <div className="mt-9 flex flex-wrap items-center gap-4"><a href="#menu" className="rounded-full bg-[#c65b3d] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#ad4e34]">Explore the menu <span className="ml-2">↓</span></a><a href="#about" className="rounded-full border border-white/40 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">Our story</a></div>
                            </div>
                            <div className="mb-2 border-l border-white/40 pl-5 md:max-w-48"><p className="text-xs uppercase tracking-[0.2em] text-white/65">Today’s feature</p><p className="mt-2 font-serif text-2xl italic">{featuredFood?.name || 'From our kitchen'}</p><p className="mt-2 text-sm text-white/75">Freshly prepared · Island-inspired</p></div>
                        </div>
                    </section>

                    <section id="menu" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 md:px-8 md:py-24">
                        <div className="flex flex-wrap items-end justify-between gap-5">
                            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c65b3d]">Made fresh daily</p><h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Restaurant Menu</h2><p className="mt-3 text-[#74776d]">Biryani, fried rice, kothu and more, made fresh to order.</p></div>
                            <div className="flex flex-wrap gap-2">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-full px-4 py-2 text-sm ${category === item ? 'bg-[#263c30] text-white' : 'bg-white text-[#62685f] hover:bg-[#eee8dd]'}`}>{item}</button>)}</div>
                        </div>
                        {message && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{message}</p>}
                        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleFoods.map((food) => <article key={food.id} className="group overflow-hidden rounded-[1.5rem] border border-[#eee9df] bg-white transition duration-300 ease-out hover:-translate-y-2 hover:border-[#d8cdbd] hover:shadow-xl hover:shadow-[#263c30]/10 motion-reduce:transform-none motion-reduce:transition-none">
                            <img className="h-56 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none" src={food.image_url || fallbackFoodImage} onError={useFallbackFoodImage} loading="lazy" decoding="async" alt={food.name} />
                            <div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-widest text-[#a2a297]">{food.category}</p><h3 className="mt-1 text-xl font-semibold">{food.name}</h3></div><span className="whitespace-nowrap font-semibold text-[#c65b3d]">{money(food.price)}</span></div><p className="mt-3 min-h-10 text-sm leading-6 text-[#74776d]">{food.description}</p><div className="mt-5 grid grid-cols-2 gap-2"><button onClick={() => setSelectedFood(food)} className="rounded-full border border-[#ded8cd] py-3 text-sm font-semibold text-[#263c30] transition hover:bg-[#f5f2eb]">View details</button><button onClick={() => addToCart(food.id)} className="flex items-center justify-center gap-2 rounded-full border border-[#263c30] py-3 text-sm font-semibold text-[#263c30] transition hover:bg-[#263c30] hover:text-white">Add to basket <span>+</span></button></div></div>
                        </article>)}</div>
                        {!foods.length && <p className="mt-10 rounded-2xl bg-white p-8 text-center text-[#74776d]">Our menu is being prepared. Please check back soon.</p>}
                    </section>

                    {selectedFood && <div className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-[#101a15]/75 p-4 backdrop-blur-sm" onClick={() => setSelectedFood(null)}><section role="dialog" aria-modal="true" aria-labelledby="food-detail-title" className="my-auto grid w-full max-w-3xl overflow-hidden rounded-[1.75rem] bg-[#faf7f0] shadow-2xl md:grid-cols-2" onClick={(event) => event.stopPropagation()}><img className="h-64 w-full object-cover md:h-full md:min-h-[420px]" src={selectedFood.image_url || fallbackFoodImage} onError={useFallbackFoodImage} alt={selectedFood.name} /><div className="flex flex-col p-6 md:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c65b3d]">{selectedFood.category}</p><h2 id="food-detail-title" className="mt-2 font-serif text-3xl font-semibold">{selectedFood.name}</h2></div><button onClick={() => setSelectedFood(null)} aria-label="Close food details" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#ded8cd] text-xl text-[#263c30] hover:bg-white">×</button></div><p className="mt-5 text-sm leading-7 text-[#62685f]">{selectedFood.description}</p><p className="mt-6 text-2xl font-semibold text-[#c65b3d]">{money(selectedFood.price)}</p><div className="mt-auto grid gap-3 pt-8"><button onClick={() => { addToCart(selectedFood.id); setSelectedFood(null); }} className={buttonClass}>Add to basket</button><p className="text-xs leading-5 text-[#898b81]">Need ingredient or allergy details? Please check with the restaurant before ordering.</p></div></div></section></div>}

                    <section id="about" className="scroll-mt-20 bg-[#172820] px-5 py-20 text-white md:py-28">
                        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-center">
                            <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f0b18f]">About SK Kitchen</p><h2 className="mt-4 font-serif text-5xl leading-tight md:text-6xl">A little island warmth, served at your table.</h2></div>
                            <div className="border-l border-white/20 pl-6 md:pl-10"><p className="text-lg leading-8 text-white/80">SK Kitchen brings the flavours of Sri Lanka together in one welcoming menu—from a slow-cooked curry and fresh sambol to a hot plate of kottu. We cook for the comfort of familiar food and the joy of sharing it.</p><p className="mt-5 text-sm uppercase tracking-[0.16em] text-[#f0b18f]">Sri Lankan favourites · Made with care</p></div>
                        </div>
                    </section>

                    <section id="contact" className="scroll-mt-20 px-5 py-16 md:px-8 md:py-24">
                        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] bg-white p-7 shadow-sm md:grid-cols-[1fr_auto] md:items-center md:p-12">
                            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c65b3d]">Contact us</p><h2 className="mt-3 font-serif text-4xl font-semibold md:text-5xl">We’re here to help.</h2><p className="mt-4 max-w-2xl leading-7 text-[#74776d]">Need an update on an order? Use your order number and checkout email to check its latest status.</p><div className="mt-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8c8e84]">Restaurant location</p><address className="mt-2 not-italic leading-7 text-[#263c30]">Pandatharippu Road,<br />Alaveddy Centre, Alaveddy</address></div></div>
                            <div className="flex flex-wrap gap-3"><a href="https://www.google.com/maps/search/?api=1&query=Pandatharippu%20Road%2C%20Alaveddy%20Centre%2C%20Alaveddy" target="_blank" rel="noreferrer" className={buttonClass}>Get directions</a><a href="#orders" className="rounded-full border border-[#ded8cd] px-5 py-3 text-sm font-semibold text-[#263c30] transition hover:bg-[#f5f2eb]">Track an order</a></div>
                        </div>
                    </section>

                    <section id="basket" className="scroll-mt-24 bg-[#f0ece3] px-5 py-16 md:px-8 md:py-20"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.9fr_1.1fr]">
                        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c65b3d]">Your basket</p><h2 className="mt-3 text-4xl font-semibold">Ready to order?</h2><p className="mt-3 text-[#74776d]">We’ll prepare everything fresh and bring it to your door.</p>
                            <div className="mt-7 space-y-3">{cartRows.length ? cartRows.map((food) => <div key={food.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4"><div><p className="font-semibold">{food.name}</p><p className="mt-1 text-sm text-[#74776d]">{money(food.price)} each</p></div><div className="flex items-center gap-3"><button onClick={() => changeQuantity(food.id, -1)} aria-label={`Remove one ${food.name}`} className="h-8 w-8 rounded-full bg-[#f0ece3]">−</button><span className="w-4 text-center text-sm font-semibold">{food.quantity}</span><button onClick={() => changeQuantity(food.id, 1)} aria-label={`Add one ${food.name}`} className="h-8 w-8 rounded-full bg-[#f0ece3]">+</button></div></div>) : <p className="rounded-2xl bg-white p-5 text-sm text-[#74776d]">Your basket is empty. Pick something delicious from the menu.</p>}</div>
                            {cartRows.length > 0 && <div className="mt-5 flex justify-between border-t border-[#d8d2c7] pt-5 text-lg font-semibold"><span>Order total</span><span>{money(total)}</span></div>}
                        </div>
                        {customer ? <form onSubmit={submitOrder} className="rounded-[1.5rem] bg-white p-6 md:p-8"><h3 className="text-2xl font-semibold">Delivery details</h3><p className="mt-2 text-sm text-[#74776d]">Ordering as {customer.name} · {customer.email}</p>
                            <div className="mt-6 grid gap-4"><label className="text-sm font-medium">Phone<input name="phone" required maxLength="40" className={`${fieldClass} mt-2`} placeholder="077 123 4567" /></label><label className="text-sm font-medium">Delivery address<textarea name="address" required maxLength="1000" rows="3" className={`${fieldClass} mt-2`} placeholder="House number, street, city" /></label></div>
                            <button disabled={!cartRows.length || busy} className={`${buttonClass} mt-5 w-full py-4`}>{busy ? 'Placing your order…' : `Place order · ${money(total)}`}</button><p className="mt-3 text-center text-xs text-[#898b81]">Payment on delivery · We’ll confirm your order shortly</p>
                        </form> : <div className="rounded-[1.5rem] bg-white p-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c65b3d]">Your account</p><h3 className="mt-3 text-2xl font-semibold">Sign in before checkout</h3><p className="mt-2 text-sm leading-6 text-[#74776d]">Create an account or sign in to place an order and keep your orders together.</p><button onClick={() => { window.location.hash = 'account'; setView('account'); }} className={`${buttonClass} mt-5 w-full`}>Sign in or create account</button></div>}
                    </div></section>

                    <section id="orders" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 md:px-8"><div className="grid gap-8 md:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c65b3d]">Your order</p><h2 className="mt-3 text-3xl font-semibold">Track an order</h2><p className="mt-2 text-sm text-[#74776d]">Enter your order number and email to see its latest status.</p></div><form onSubmit={trackOrder} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><input name="order_number" required className={fieldClass} placeholder="Order number" /><input name="email" required type="email" className={fieldClass} placeholder="Email used at checkout" /><button className={buttonClass}>Look up</button></form></div>
                        {trackResult && <div className="mt-6 rounded-2xl border border-[#e9e4da] bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><p className="font-semibold">{trackResult.order_number}</p><span className="rounded-full bg-[#edf2eb] px-3 py-1 text-xs font-semibold capitalize text-[#35513d]">{trackResult.status}</span></div><p className="mt-2 text-sm text-[#74776d]">{trackResult.items?.map((item) => `${item.quantity} × ${item.food_name}`).join(' · ')} <span className="ml-2 font-semibold text-[#20251f]">{money(trackResult.total)}</span></p></div>}
                    </section>

                    {orderComplete && <div className="fixed inset-0 z-40 grid place-items-center bg-[#172219]/55 p-5"><div className="w-full max-w-md rounded-[1.5rem] bg-white p-8 text-center shadow-2xl"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#edf2eb] text-2xl text-[#35513d]">✓</div><p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#c65b3d]">Order received</p><h2 className="mt-2 text-3xl font-semibold">Thank you, {orderComplete.customer_name.split(' ')[0]}.</h2><p className="mt-3 text-sm leading-6 text-[#74776d]">We’re getting your meal ready. Save this number to track your order.</p><p className="mt-5 rounded-xl bg-[#f5f2eb] py-3 font-bold tracking-wider">{orderComplete.order_number}</p><p className="mt-3 text-lg font-semibold">{money(orderComplete.total)}</p><button onClick={() => { setOrderComplete(null); document.getElementById('orders')?.scrollIntoView({ behavior: 'smooth' }); }} className={`${buttonClass} mt-6 w-full`}>Done</button></div></div>}
                    <footer className="bg-[#263c30] px-6 py-10 text-center text-white"><p className="font-bold tracking-[0.18em]">SK KITCHEN</p><p className="mt-2 text-sm text-white/70">Fresh Sri Lankan food, made with care.</p><nav aria-label="Footer navigation" className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-white/75"><a href="#menu" className="hover:text-white">Menu</a><a href="#about" className="hover:text-white">About us</a><a href="#contact" className="hover:text-white">Contact</a><a href="#orders" className="hover:text-white">Track order</a></nav><button onClick={() => { window.location.hash = 'admin'; setView('admin'); }} className="mt-6 text-xs text-white/50 hover:text-white">Admin sign in</button></footer>
                </>
            )}
        </main>
    );
}

function CustomerAccount({ customer, onCustomerChange, onBack, onContinue }) {
    const [mode, setMode] = useState('login');
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (customer) {
            api('/api/user/orders').then(setOrders).catch((requestError) => setError(requestError.message));
        } else {
            setOrders([]);
        }
    }, [customer?.id]);

    async function authenticate(event) {
        event.preventDefault();
        const formElement = event.currentTarget;
        const form = new FormData(formElement);
        const payload = {
            email: form.get('email'),
            password: form.get('password'),
        };
        if (mode === 'register') {
            payload.name = form.get('name');
            payload.password_confirmation = form.get('password_confirmation');
        }

        setBusy(true);
        setError('');
        try {
            const result = await api(`/api/user/${mode === 'register' ? 'register' : 'login'}`, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            onCustomerChange(result.customer);
            formElement.reset();
            if (mode === 'register') {
                onContinue();
            }
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setBusy(false);
        }
    }

    async function signOut() {
        await api('/api/user/logout', { method: 'POST', body: '{}' });
        onCustomerChange(null);
        setOrders([]);
    }

    return (
        <section className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-16">
            <button onClick={onBack} className="mb-7 text-sm font-medium text-[#74776d] hover:text-[#c65b3d]">← Back to menu</button>
            {customer ? <div className="grid gap-7 md:grid-cols-[0.8fr_1.2fr]">
                <div className="h-fit rounded-[1.5rem] bg-white p-7 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c65b3d]">SK Kitchen account</p>
                    <h1 className="mt-3 text-3xl font-semibold">Hello, {customer.name}</h1>
                    <p className="mt-2 text-sm text-[#74776d]">{customer.email}</p>
                    <button onClick={onContinue} className={`${buttonClass} mt-6 w-full`}>Continue to checkout</button>
                    <button onClick={signOut} className="mt-3 w-full rounded-full border border-[#ded8cd] px-5 py-3 text-sm font-semibold text-[#263c30]">Sign out</button>
                </div>
                <div className="rounded-[1.5rem] bg-white p-7 shadow-sm">
                    <h2 className="text-2xl font-semibold">Your recent orders</h2>
                    {orders.length ? <div className="mt-5 space-y-3">{orders.map((order) => <article key={order.id} className="rounded-2xl border border-[#eee9df] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{order.order_number}</p><span className="rounded-full bg-[#edf2eb] px-3 py-1 text-xs font-semibold capitalize text-[#35513d]">{order.status}</span></div>
                        <p className="mt-2 text-sm text-[#74776d]">{order.items?.map((item) => `${item.quantity} × ${item.food_name}`).join(' · ')}</p>
                        <p className="mt-2 text-sm font-semibold">{money(order.total)}</p>
                    </article>)}</div> : <p className="mt-4 rounded-xl bg-[#faf7f0] p-4 text-sm text-[#74776d]">Your orders will appear here after checkout.</p>}
                </div>
            </div> : <div className="mx-auto max-w-md rounded-[1.5rem] bg-white p-7 shadow-sm md:p-9">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c65b3d]">SK Kitchen account</p>
                <h1 className="mt-3 text-3xl font-semibold">{mode === 'register' ? 'Create your account' : 'Welcome back'}</h1>
                <p className="mt-2 text-sm leading-6 text-[#74776d]">Sign in or create an account to place an order and see your order history.</p>
                <div className="mt-6 grid grid-cols-2 rounded-full bg-[#f5f2eb] p-1 text-sm font-semibold"><button onClick={() => { setMode('login'); setError(''); }} className={`rounded-full py-2.5 ${mode === 'login' ? 'bg-white text-[#263c30] shadow-sm' : 'text-[#74776d]'}`}>Sign in</button><button onClick={() => { setMode('register'); setError(''); }} className={`rounded-full py-2.5 ${mode === 'register' ? 'bg-white text-[#263c30] shadow-sm' : 'text-[#74776d]'}`}>Create account</button></div>
                {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
                <form onSubmit={authenticate} className="mt-5 space-y-4">
                    {mode === 'register' && <label className="block text-sm font-medium">Name<input name="name" required maxLength="120" autoComplete="name" className={`${fieldClass} mt-2`} placeholder="Your name" /></label>}
                    <label className="block text-sm font-medium">Email<input name="email" type="email" required autoComplete="email" className={`${fieldClass} mt-2`} placeholder="you@example.com" /></label>
                    <label className="block text-sm font-medium">Password<input name="password" type="password" required minLength="8" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} className={`${fieldClass} mt-2`} placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'} /></label>
                    {mode === 'register' && <label className="block text-sm font-medium">Confirm password<input name="password_confirmation" type="password" required minLength="8" autoComplete="new-password" className={`${fieldClass} mt-2`} placeholder="Enter your password again" /></label>}
                    <button disabled={busy} className={`${buttonClass} w-full`}>{busy ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}</button>
                </form>
            </div>}
        </section>
    );
}

function AdminPanel({ onBack }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [checking, setChecking] = useState(true);
    const [foods, setFoods] = useState([]);
    const [orders, setOrders] = useState([]);
    const [editing, setEditing] = useState(null);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const loadAdmin = async () => {
        const [menu, recentOrders] = await Promise.all([api('/api/admin/foods'), api('/api/admin/orders')]);
        setFoods(menu); setOrders(recentOrders);
    };
    useEffect(() => { api('/api/admin/status').then((data) => { setAuthenticated(data.authenticated); if (data.authenticated) loadAdmin(); }).catch(() => {}).finally(() => setChecking(false)); }, []);

    async function signIn(event) {
        event.preventDefault(); setError('');
        const form = new FormData(event.currentTarget);
        try { await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) }); setAuthenticated(true); await loadAdmin(); }
        catch (e) { setError(e.message); }
    }
    async function saveFood(event) {
        event.preventDefault(); setError(''); setNotice('');
        const formElement = event.currentTarget;
        const form = new FormData(formElement);
        const data = Object.fromEntries(form.entries()); data.price = Number(data.price); data.is_available = form.get('is_available') === 'on';
        try { await api(editing?.id ? `/api/admin/foods/${editing.id}` : '/api/admin/foods', { method: editing?.id ? 'PUT' : 'POST', body: JSON.stringify(data) }); setEditing(null); setNotice(editing ? 'Menu item updated.' : 'New dish added to the menu.'); formElement.reset(); await loadAdmin(); }
        catch (e) { setError(e.message); }
    }
    async function removeFood(food) {
        if (!window.confirm(`Remove ${food.name} from the menu?`)) return;
        try { await api(`/api/admin/foods/${food.id}`, { method: 'DELETE' }); await loadAdmin(); }
        catch (e) { setError(e.message); }
    }
    async function updateStatus(order, status) {
        try { await api(`/api/admin/orders/${order.id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); await loadAdmin(); }
        catch (e) { setError(e.message); }
    }

    if (checking) return <section className="mx-auto max-w-6xl px-6 py-20 text-center text-[#74776d]">Loading admin…</section>;
    if (!authenticated) return <section className="mx-auto max-w-lg px-5 py-16 md:py-24"><button onClick={onBack} className="mb-8 text-sm text-[#74776d] hover:text-[#c65b3d]">← Back to customer menu</button><div className="rounded-[1.5rem] bg-white p-7 shadow-sm md:p-9"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c65b3d]">SK Kitchen</p><h1 className="mt-3 text-3xl font-semibold">Admin sign in</h1><p className="mt-2 text-sm leading-6 text-[#74776d]">Sign in with your admin email or admin name.</p>{error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}<form onSubmit={signIn} className="mt-6 space-y-4"><label className="block text-sm font-medium">Email or admin name<input name="email" type="text" autoComplete="username" required className={`${fieldClass} mt-2`} /></label><label className="block text-sm font-medium">Password<input name="password" type="password" required className={`${fieldClass} mt-2`} /></label><button className={`${buttonClass} w-full`}>Sign in</button></form><p className="mt-5 text-xs leading-5 text-[#898b81]">Configure ADMIN_EMAIL and ADMIN_PASSWORD in your .env file, then run <code>php artisan db:seed --class=AdminUserSeeder</code>.</p></div></section>;

    return <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c65b3d]">Restaurant management</p><h1 className="mt-2 text-4xl font-semibold">Admin dashboard</h1><p className="mt-2 text-sm text-[#74776d]">Manage your menu and keep orders moving.</p></div><div className="flex gap-3"><button onClick={onBack} className="rounded-full border border-[#d9d4ca] px-4 py-2.5 text-sm font-semibold">Customer view</button><button onClick={async () => { await api('/api/admin/logout', { method: 'POST', body: '{}' }); setAuthenticated(false); }} className="rounded-full bg-[#263c30] px-4 py-2.5 text-sm font-semibold text-white">Sign out</button></div></div>
        {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}{notice && <p className="mt-6 rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]"><div className="rounded-[1.5rem] bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c65b3d]">Menu editor</p><h2 className="mt-2 text-2xl font-semibold">{editing ? 'Edit dish' : 'Add a dish'}</h2><form key={editing?.id || 'new'} onSubmit={saveFood} className="mt-5 space-y-3"><input name="name" required maxLength="120" defaultValue={editing?.name || ''} className={fieldClass} placeholder="Dish name" /><div className="grid grid-cols-2 gap-3"><input name="category" required defaultValue={editing?.category || 'Mains'} className={fieldClass} placeholder="Category" /><input name="price" type="number" min="1" required defaultValue={editing?.price || ''} className={fieldClass} placeholder="Price (Rs.)" /></div><textarea name="description" rows="3" defaultValue={editing?.description || ''} className={fieldClass} placeholder="Short description" /><input name="image_url" type="url" defaultValue={editing?.image_url || ''} className={fieldClass} placeholder="Image URL (optional)" /><label className="flex items-center gap-2 text-sm text-[#62685f]"><input name="is_available" type="checkbox" defaultChecked={editing ? editing.is_available : true} className="accent-[#263c30]" /> Available to order</label><div className="flex gap-2"><button className={`${buttonClass} flex-1`}>{editing ? 'Save changes' : 'Add menu item'}</button>{editing && <button type="button" onClick={() => setEditing(null)} className="rounded-full border px-4 text-sm">Cancel</button>}</div></form></div>
            <div className="rounded-[1.5rem] bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c65b3d]">Current menu</p><h2 className="mt-2 text-2xl font-semibold">{foods.length} dishes</h2></div><button onClick={() => loadAdmin().catch((e) => setError(e.message))} className="text-sm font-semibold text-[#c65b3d]">Refresh</button></div><div className="mt-5 divide-y divide-[#f0ece3]">{foods.map((food) => <div key={food.id} className="flex items-center gap-3 py-3"><img className="h-14 w-14 rounded-xl object-cover" src={food.image_url || fallbackFoodImage} onError={useFallbackFoodImage} loading="lazy" decoding="async" alt="" /><div className="min-w-0 flex-1"><p className="truncate font-semibold">{food.name}</p><p className="text-xs text-[#898b81]">{food.category} · {money(food.price)} · {food.is_available ? 'Available' : 'Hidden'}</p></div><button onClick={() => { setEditing(food); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-xs font-semibold text-[#35513d]">Edit</button><button onClick={() => removeFood(food)} className="text-xs font-semibold text-[#b44430]">Remove</button></div>)}</div></div></div>
        <div className="mt-8 rounded-[1.5rem] bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c65b3d]">Live order queue</p><h2 className="mt-2 text-2xl font-semibold">Recent orders</h2></div><span className="rounded-full bg-[#f0ece3] px-3 py-1 text-sm">{orders.length}</span></div>{orders.length ? <div className="mt-5 space-y-3">{orders.map((order) => <article key={order.id} className="grid gap-4 rounded-2xl border border-[#eee9df] p-4 md:grid-cols-[1fr_auto]"><div><div className="flex flex-wrap items-center gap-2"><p className="font-bold">{order.order_number}</p><span className="rounded-full bg-[#edf2eb] px-3 py-1 text-xs font-semibold capitalize text-[#35513d]">{order.status}</span></div><p className="mt-1 text-sm text-[#62685f]">{order.customer_name} · {order.customer_phone}</p><p className="mt-1 text-xs text-[#898b81]">{order.items?.map((item) => `${item.quantity} × ${item.food_name}`).join(' · ')}</p><p className="mt-2 text-sm font-semibold">{money(order.total)} <span className="ml-2 font-normal text-[#898b81]">{order.delivery_address}</span></p></div><label className="text-xs font-semibold text-[#74776d]">Update status<select value={order.status} onChange={(event) => updateStatus(order, event.target.value)} className={`${fieldClass} mt-1 min-w-40 capitalize`}><option value="received">Received</option><option value="preparing">Preparing</option><option value="ready">Ready</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></label></article>)}</div> : <p className="mt-5 rounded-xl bg-[#faf7f0] p-5 text-sm text-[#74776d]">New customer orders will appear here.</p>}</div>
    </section>;
}

export default App;
