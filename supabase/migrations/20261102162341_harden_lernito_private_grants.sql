/*
# Harden LERNITO private table grants

1. Security changes
- Remove all Data API privileges from `anon` on profiles, favorites, orders, order_items, wallet_accounts, and wallet_transactions.
- Keep only the owner-scoped authenticated policies already defined.
- Prevent authenticated customers from changing profile roles or any wallet value.

2. Important notes
- Public product browsing remains available to anonymous visitors.
- Checkout creation, payment verification, SMS verification, wallet mutation, and admin actions must be performed later through authorized Edge Functions.
*/

REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.favorites FROM anon;
REVOKE ALL ON public.orders FROM anon;
REVOKE ALL ON public.order_items FROM anon;
REVOKE ALL ON public.wallet_accounts FROM anon;
REVOKE ALL ON public.wallet_transactions FROM anon;

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, phone) ON public.profiles TO authenticated;
REVOKE ALL ON public.wallet_accounts FROM authenticated;
GRANT SELECT ON public.wallet_accounts TO authenticated;
REVOKE ALL ON public.wallet_transactions FROM authenticated;
GRANT SELECT ON public.wallet_transactions TO authenticated;
REVOKE ALL ON public.orders FROM authenticated;
GRANT SELECT ON public.orders TO authenticated;
REVOKE ALL ON public.order_items FROM authenticated;
GRANT SELECT ON public.order_items TO authenticated;