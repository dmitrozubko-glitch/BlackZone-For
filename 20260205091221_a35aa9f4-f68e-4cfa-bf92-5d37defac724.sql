-- Create function to increment topic views
CREATE OR REPLACE FUNCTION public.increment_topic_views(topic_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.forum_topics
    SET views_count = views_count + 1
    WHERE id = topic_id;
END;
$$;