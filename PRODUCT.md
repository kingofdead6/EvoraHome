# Evora Home — product

## What this is

The storefront for **Evora Home**, a furniture and home-decor shop in El Khroub,
Constantine (25100), Algeria. Instagram `@evorahomealgeria`, phone `0540870382`.
Tagline: *"L'élégance prend forme chez vous."*

This is a real, shipping client project. The site includes hosting and a domain.

## Who uses it

**The customer.** Mostly on a mid-range Android phone, on mobile data, reading
French. They are shopping for a sofa or a bedroom set and want to know three things:
what it looks like, what it costs, and whether it fits their room. They will order by
phone or WhatsApp if the site makes them work too hard.

**The shop owner.** Uses the admin daily to enter products and work through orders.
Needs speed of data entry above all else, and a printable delivery slip.

## How an order actually works

Cash on delivery, always. There is no online payment on this site and no payment
gateway is integrated.

```
cart -> form (name, phone, wilaya, commune, address, delivery method) -> confirmation
```

- **Phone number is the required identifier.** Email is optional.
- **Guest checkout is the default path** and must always remain available. An account
  is an optional convenience that pre-fills the form and stores favourites and order
  history. Account creation is never required to complete an order.
- **Customers log in with a phone number, not an email.** This is the Algerian norm.
  Email-first login loses orders.
- Delivery cost is calculated from the selected wilaya and shown in the cart before
  the customer confirms.
- Two delivery modes: `DOMICILE` (to the door) and `STOP_DESK` (pickup point), priced
  separately per wilaya.
- Orders get a human-readable number, `EVH-2026-0001`, shown on the confirmation page
  alongside the shop's phone number for follow-up.

## The thing that makes this a furniture catalogue

The client already publishes reference codes (`Ref : LA CONNER`) and a full dimensions
spec card on their Instagram posts. `ref` and `dimensions` are **not optional extras**.
Surfacing both prominently on the product detail page is the single thing that makes
the site read as a real furniture catalogue rather than a generic shop.

## Catalogue shape

Seven categories, in this order: Salons, Chambres, Tables & Chaises, Meubles TV,
Consoles & Miroirs, Salon de Jardin, Décoration.

A product carries: reference code, name, description, category, price, optional old
price for promos, dimensions (largeur / profondeur / hauteur / unité), materials,
colour options with hex values, ordered images, availability
(`EN_STOCK` / `SUR_COMMANDE` / `RUPTURE`), delivery lead time, and featured / new flags.

Delivery covers all 58 Algerian wilayas, each with its own home and stop-desk fee,
editable from the admin.

## Pages

**Storefront** — home, category listing (filter by category, price, availability,
colour; sortable), product detail, cart, checkout, order confirmation, account
(login / register / orders / favourites / addresses), about and showroom, contact.

**Admin** — dashboard (today's orders, new orders, revenue this month, low stock),
orders (status filters, detail, status transitions, printable delivery slip), products
(full CRUD, multi-image upload with reordering), categories (CRUD with ordering),
wilayas (editable fees), settings.

The admin uses the same brand as the storefront but denser, quieter, and optimised for
speed of data entry.

## Constraints that drive decisions

- **360px is the design width.** Not an edge case.
- **The photography is inconsistent.** Showroom tile floors, mixed white balance,
  phone shots, some AI-generated lifestyle renders. The design must not lean on large
  edge-to-edge photography, because that exposes it immediately. See DESIGN.md.
- **French only in this pass.** Strings are centralised so an Arabic/RTL layer can be
  added later, but no i18n machinery is added now.
- **The client supplies real photos, prices and stock.** Seed data is a scaffold, not
  the deliverable. Image paths point at `/public/products/` with a naming convention
  so real photos drop in without touching code.

## What success looks like

A customer on a 360px Android screen can find a sofa, see its price and dimensions,
and place an order in under 90 seconds without creating an account.
