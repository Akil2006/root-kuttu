
-- Fix foreign keys to allow Supabase to join profiles table
-- Community posts: link to profiles instead of auth.users
ALTER TABLE public.community_posts
DROP CONSTRAINT IF EXISTS community_posts_user_id_fkey;

ALTER TABLE public.community_posts
ADD CONSTRAINT community_posts_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Post replies: link to profiles instead of auth.users
ALTER TABLE public.post_replies
DROP CONSTRAINT IF EXISTS post_replies_user_id_fkey;

ALTER TABLE public.post_replies
ADD CONSTRAINT post_replies_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Post likes: link to profiles instead of auth.users
ALTER TABLE public.post_likes
DROP CONSTRAINT IF EXISTS post_likes_user_id_fkey;

ALTER TABLE public.post_likes
ADD CONSTRAINT post_likes_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
