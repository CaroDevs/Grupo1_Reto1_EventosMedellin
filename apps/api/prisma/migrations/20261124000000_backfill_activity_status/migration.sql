-- Backfill de estados y restauración del índice espacial.

-- La migración 20261123180616_add_activity_status agregó la columna "status"
-- con DEFAULT 'DRAFT', por lo que todas las actividades que ya existían
-- quedaron en borrador y dejaron de verse para el público.
-- Criterio: las filas creadas ANTES de esa migración (createdAt anterior a
-- 2026-11-23 18:06:16 UTC, el timestamp de la migración) existían antes del
-- patrón State, así que se publican. Las creadas después como borrador
-- (flujo normal de creación) se respetan.
UPDATE "activities"
SET "status" = 'PUBLISHED'
WHERE "status" = 'DRAFT'
  AND "createdAt" < TIMESTAMP '2026-11-23 18:06:16';

-- La migración anterior borró por error el índice GIST de "location"
-- (creado en 20261021000000_add_activity_location). Se recrea; IF NOT EXISTS
-- evita fallar en bases donde ya se haya restaurado a mano.
CREATE INDEX IF NOT EXISTS "activities_location_idx" ON "activities" USING GIST ("location");
