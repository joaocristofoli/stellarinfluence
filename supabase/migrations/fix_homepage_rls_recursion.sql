-- FIX CRÍTICO: Recursão infinita no RLS de homepage_config
-- O problema é que as policies de homepage_config checam user_roles,
-- mas user_roles também tem RLS que pode criar recursão

-- Remover policies problemáticas
DROP POLICY IF EXISTS "Only admins can insert homepage config" ON homepage_config;
DROP POLICY IF EXISTS "Only admins can update homepage config" ON homepage_config;
DROP POLICY IF EXISTS "Only admins can delete homepage config" ON homepage_config;

-- Recriar policies SEM checar user_roles diretamente
-- Usar uma função RPC simples para verificar admin

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_roles
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas simplificadas usando a função
CREATE POLICY "Only admins can insert homepage config"
    ON homepage_config FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY "Only admins can update homepage config"
    ON homepage_config FOR UPDATE
    TO authenticated
    USING (is_admin());

CREATE POLICY "Only admins can delete homepage config"
    ON homepage_config FOR DELETE
    TO authenticated
    USING (is_admin());
