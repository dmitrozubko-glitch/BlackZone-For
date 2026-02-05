-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'moderator', 'support', 'vip', 'member');

-- Create user_roles table for proper role management (security best practice)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    signature TEXT,
    posts_count INTEGER DEFAULT 0,
    topics_count INTEGER DEFAULT 0,
    reputation INTEGER DEFAULT 0,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum categories table
CREATE TABLE public.forum_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    parent_id UUID REFERENCES public.forum_categories(id) ON DELETE SET NULL,
    is_visible BOOLEAN DEFAULT true,
    can_view_roles app_role[] DEFAULT ARRAY['member']::app_role[],
    can_post_roles app_role[] DEFAULT ARRAY['member']::app_role[],
    topics_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum topics table
CREATE TABLE public.forum_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.forum_categories(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    last_reply_at TIMESTAMP WITH TIME ZONE,
    last_reply_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum posts (replies) table
CREATE TABLE public.forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT false,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post likes table
CREATE TABLE public.post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(post_id, user_id)
);

-- Create admin settings table
CREATE TABLE public.admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Create function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role
    FROM public.user_roles
    WHERE user_id = _user_id
    ORDER BY 
        CASE role
            WHEN 'owner' THEN 1
            WHEN 'admin' THEN 2
            WHEN 'moderator' THEN 3
            WHEN 'support' THEN 4
            WHEN 'vip' THEN 5
            WHEN 'member' THEN 6
        END
    LIMIT 1
$$;

-- Create function to check if user is staff (owner, admin, moderator, support)
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role IN ('owner', 'admin', 'moderator', 'support')
    )
$$;

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Anyone can view user roles" ON public.user_roles
    FOR SELECT USING (true);

CREATE POLICY "Owners can manage all roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Admins can manage non-owner roles" ON public.user_roles
    FOR INSERT WITH CHECK (
        public.has_role(auth.uid(), 'admin') 
        AND role NOT IN ('owner', 'admin')
    );

-- RLS Policies for profiles
CREATE POLICY "Anyone can view profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can update any profile" ON public.profiles
    FOR UPDATE USING (public.is_staff(auth.uid()));

-- RLS Policies for forum_categories
CREATE POLICY "Anyone can view visible categories" ON public.forum_categories
    FOR SELECT USING (is_visible = true OR public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage categories" ON public.forum_categories
    FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

-- RLS Policies for forum_topics
CREATE POLICY "Anyone can view non-hidden topics" ON public.forum_topics
    FOR SELECT USING (is_hidden = false OR public.is_staff(auth.uid()));

CREATE POLICY "Authenticated users can create topics" ON public.forum_topics
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

CREATE POLICY "Authors can update own topics" ON public.forum_topics
    FOR UPDATE USING (auth.uid() = author_id OR public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete topics" ON public.forum_topics
    FOR DELETE USING (public.is_staff(auth.uid()));

-- RLS Policies for forum_posts
CREATE POLICY "Anyone can view non-hidden posts" ON public.forum_posts
    FOR SELECT USING (is_hidden = false OR public.is_staff(auth.uid()));

CREATE POLICY "Authenticated users can create posts" ON public.forum_posts
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

CREATE POLICY "Authors can update own posts" ON public.forum_posts
    FOR UPDATE USING (auth.uid() = author_id OR public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete posts" ON public.forum_posts
    FOR DELETE USING (public.is_staff(auth.uid()));

-- RLS Policies for post_likes
CREATE POLICY "Anyone can view likes" ON public.post_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own likes" ON public.post_likes
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for admin_settings
CREATE POLICY "Staff can view settings" ON public.admin_settings
    FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Owners can manage settings" ON public.admin_settings
    FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_categories_updated_at
    BEFORE UPDATE ON public.forum_categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_topics_updated_at
    BEFORE UPDATE ON public.forum_topics
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at
    BEFORE UPDATE ON public.forum_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile and default role on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, username)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'User_' || LEFT(NEW.id::text, 8)));
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'member');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update topic reply count and last reply info
CREATE OR REPLACE FUNCTION public.update_topic_on_post()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.forum_topics
        SET replies_count = replies_count + 1,
            last_reply_at = NEW.created_at,
            last_reply_by = NEW.author_id
        WHERE id = NEW.topic_id;
        
        UPDATE public.profiles
        SET posts_count = posts_count + 1
        WHERE user_id = NEW.author_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.forum_topics
        SET replies_count = GREATEST(0, replies_count - 1)
        WHERE id = OLD.topic_id;
        
        UPDATE public.profiles
        SET posts_count = GREATEST(0, posts_count - 1)
        WHERE user_id = OLD.author_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_forum_post_change
    AFTER INSERT OR DELETE ON public.forum_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_topic_on_post();

-- Trigger to update category counts
CREATE OR REPLACE FUNCTION public.update_category_on_topic()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.forum_categories
        SET topics_count = topics_count + 1
        WHERE id = NEW.category_id;
        
        UPDATE public.profiles
        SET topics_count = topics_count + 1
        WHERE user_id = NEW.author_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.forum_categories
        SET topics_count = GREATEST(0, topics_count - 1)
        WHERE id = OLD.category_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_forum_topic_change
    AFTER INSERT OR DELETE ON public.forum_topics
    FOR EACH ROW EXECUTE FUNCTION public.update_category_on_topic();

-- Enable realtime for important tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_topics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_posts;