-- Function to merge two creators
-- Moves all marketing strategy references from source to target
-- Soft deletes the source creator
CREATE OR REPLACE FUNCTION merge_creators(target_uuid UUID, source_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- 1. Update Marketing Strategies
  -- We assume linked_creator_ids is text[] based on common Supabase patterns. 
  -- If it's uuid[], we cast appropriately.
  
  UPDATE marketing_strategies
  SET linked_creator_ids = (
    SELECT array_agg(DISTINCT elem)
    FROM unnest(
      array_replace(
        linked_creator_ids, 
        source_uuid::text, 
        target_uuid::text
      )
    ) AS elem
  )
  WHERE source_uuid::text = ANY(linked_creator_ids);

  -- 2. Soft Delete Source
  -- We append -merged suffix to slug to free it up for the target if needed
  UPDATE creators
  SET 
    deleted_at = NOW(),
    approval_status = 'rejected', -- Mark as rejected/merged
    slug = slug || '-merged-' || substring(source_uuid::text, 1, 8)
  WHERE id = source_uuid;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for duplicates (fuzzy search)
-- Useful for backend validation if needed
CREATE OR REPLACE FUNCTION find_potential_duplicates(check_instagram TEXT, ignore_id UUID DEFAULT NULL)
RETURNS TABLE (id UUID, name TEXT, instagram_url TEXT, similarity FLOAT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id, 
    c.name, 
    c.instagram_url,
    similarity(c.instagram_url, check_instagram) as sim
  FROM creators c
  WHERE 
    c.deleted_at IS NULL
    AND c.instagram_url IS NOT NULL 
    AND (ignore_id IS NULL OR c.id != ignore_id)
    AND similarity(c.instagram_url, check_instagram) > 0.4
  ORDER BY sim DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
