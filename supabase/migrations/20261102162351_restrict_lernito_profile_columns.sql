/*
# Restrict customer profile columns

1. Security changes
- Customers can create a profile with only their own id, name, and phone.
- Customers can update only name and phone.
- Customers cannot set or change the administrative role.
- Customers cannot delete their profile through the Data API.
*/

REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM authenticated;
GRANT INSERT (id, full_name, phone) ON public.profiles TO authenticated;
GRANT UPDATE (full_name, phone) ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;