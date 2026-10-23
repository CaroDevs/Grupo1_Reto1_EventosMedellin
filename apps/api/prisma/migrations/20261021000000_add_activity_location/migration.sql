-- Habilita PostGIS (necesario para la columna de ubicación de abajo)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Ubicación de la actividad, como punto geográfico (lng, lat), SRID 4326 (WGS84)
ALTER TABLE "activities" ADD COLUMN "location" geography(Point, 4326);

-- Índice espacial, para cuando se necesiten consultas por cercanía más adelante
CREATE INDEX "activities_location_idx" ON "activities" USING GIST ("location");
