import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './lib/auth';
import { CartProvider } from './lib/cart';
import { SettingsProvider } from './lib/settings';
import { useSmoothScroll, pageVariants, pageTransition, useReducedMotion } from './lib/motion';

import Navbar from './Components/Shared/Navbar';
import Footer from './Components/Shared/Footer';
import CartDrawer from './Components/Shared/CartDrawer';
import { Loading } from './Components/UI/States';


import Home from './Pages/Home';

const Catalogue = lazy(() => import('./Pages/Catalogue'));
const ProductDetail = lazy(() => import('./Pages/ProductDetail'));
const Cart = lazy(() => import('./Pages/Cart'));
const Checkout = lazy(() => import('./Pages/Checkout'));
const Confirmation = lazy(() => import('./Pages/Confirmation'));
const Showroom = lazy(() => import('./Pages/Showroom'));
const Contact = lazy(() => import('./Pages/Contact'));
const NotFound = lazy(() => import('./Pages/NotFound'));

const Login = lazy(() => import('./Pages/Account/Auth').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./Pages/Account/Auth').then((m) => ({ default: m.Register })));
const AccountLayout = lazy(() =>
  import('./Pages/Account/Account').then((m) => ({ default: m.AccountLayout }))
);
const Profile = lazy(() => import('./Pages/Account/Account').then((m) => ({ default: m.Profile })));
const Orders = lazy(() => import('./Pages/Account/Account').then((m) => ({ default: m.Orders })));
const Favourites = lazy(() =>
  import('./Pages/Account/Account').then((m) => ({ default: m.Favourites }))
);
const Addresses = lazy(() =>
  import('./Pages/Account/Account').then((m) => ({ default: m.Addresses }))
);

const AdminApp = lazy(() => import('./Pages/Admin/AdminApp'));

// anime.js is only ever used by the intro, so it loads with it rather than
// sitting in the entry chunk for every visit that never shows it.
const Intro = lazy(() => import('./Components/Shared/Intro'));
const FAQ = lazy(() => import('./Pages/FAQ'));

/** Scroll to the top on navigation, except when the browser is restoring. */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

function RequireAuth({ children, adminOnly = false }) {
  const { loading, isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();

  // Wait for the session check rather than flashing the login page at a
  // customer who is already logged in.
  if (loading) return <Loading />;

  if (!isLoggedIn) {
    return <Navigate to="/connexion" state={{ from: location.pathname }} replace />;
  }

  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return children;
}

/** Storefront chrome. The admin renders outside this. */
function StorefrontLayout({ children, onOpenCart }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onOpenCart={onOpenCart} />

      {/*
        The child rules here are load-bearing, not decoration.

        Pages are flex items of this column and almost all of them are
        `mx-auto max-w-[1400px]`. An auto margin on the cross axis cancels
        `align-items: stretch`, so the page shrink-to-fits to its content
        instead of to the viewport. Any horizontally scrolling strip inside it
        (the category tabs, a wide admin table) then widens the whole document
        rather than scrolling inside its own container, and the site pans
        sideways at 360px.

        `w-full` gives every page a definite width; `min-w-0` stops a flex
        item's automatic minimum size from re-flooring it at content width.
      */}
      <main className="flex min-w-0 flex-1 flex-col [&>*]:w-full [&>*]:min-w-0">{children}</main>
      <Footer />
    </div>
  );
}

function AnimatedRoutes({ onOpenCart }) {
  const location = useLocation();
  const reduced = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={reduced ? false : 'initial'}
        animate="animate"
        exit={reduced ? undefined : 'exit'}
        variants={pageVariants}
        transition={pageTransition}
        className="flex min-h-screen flex-col"
      >
        <Routes location={location}>
          {/* Admin. Outside the storefront chrome and lazily loaded. */}
          <Route
            path="/admin/*"
            element={
              <RequireAuth adminOnly>
                <Suspense fallback={<Loading label="Chargement de l'administration" />}>
                  <AdminApp />
                </Suspense>
              </RequireAuth>
            }
          />

          {/* Storefront */}
          <Route
            path="*"
            element={
              <StorefrontLayout onOpenCart={onOpenCart}>
                {/* Loading reserves a viewport by default, which keeps the
                    footer just below the fold until the route chunk lands. */}
                <Suspense fallback={<Loading />}>
                  <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalogue" element={<Catalogue />} />
                  <Route path="/catalogue/:slug" element={<Catalogue />} />
                  <Route path="/produit/:slug" element={<ProductDetail />} />

                  <Route path="/panier" element={<Cart />} />
                  <Route path="/commande" element={<Checkout />} />
                  <Route path="/commande/confirmation" element={<Confirmation />} />

                  <Route path="/showroom" element={<Showroom />} />
                  <Route path="/livraison" element={<Navigate to="/showroom#livraison" replace />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />

                  <Route path="/connexion" element={<Login />} />
                  <Route path="/inscription" element={<Register />} />

                  <Route
                    path="/compte"
                    element={
                      <RequireAuth>
                        <AccountLayout />
                      </RequireAuth>
                    }
                  >
                    <Route index element={<Profile />} />
                    <Route path="commandes" element={<Orders />} />
                    <Route path="favoris" element={<Favourites />} />
                    <Route path="adresses" element={<Addresses />} />
                  </Route>

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </StorefrontLayout>
            }
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function Shell() {
  const [cartOpen, setCartOpen] = useState(false);
  useSmoothScroll();

  return (
    <>
      <Suspense fallback={null}>
        <Intro />
      </Suspense>
      <ScrollToTop />
      <AnimatedRoutes onOpenCart={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#3E4638',
            color: '#F6F2EA',
            borderRadius: '4px',
            border: '1px solid rgba(192, 160, 98, 0.4)',
            fontSize: '15px',
            padding: '12px 16px',
          },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <CartProvider>
            <Shell />
          </CartProvider>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
