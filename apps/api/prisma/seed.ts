import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { ADMIN_ROLE, ROLE_NAMES } from '@medellin-activities/shared-types';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

async function main() {
  await prisma.role.createMany({
    data: ROLE_NAMES.map((name) => ({ name })),
    skipDuplicates: true,
  });

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: ADMIN_ROLE },
  });

  await prisma.user.upsert({
    where: { email: 'admin@itm.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@itm.com',
      password: await bcrypt.hash('12345678', 10),
      roleId: adminRole.id,
    },
  });

  await prisma.category.createMany({
    data: [
      { name: 'Cultura', description: 'Cine, teatro, música y artes en general.' },
      { name: 'Salud', description: 'Actividades de bienestar físico y mental.' },
      { name: 'Deporte', description: 'Actividades deportivas y recreativas.' },
      { name: 'Educación', description: 'Talleres, charlas y formación.' },
    ],
    skipDuplicates: true,
  });

  const sampleActivities = [
    {
      title: 'Cine al parque',
      description: 'Proyección gratuita de cine colombiano en el Parque de los Deseos.',
      category: 'Cultura',
      startDate: daysFromNow(3),
      latitude: 6.2679,
      longitude: -75.5658,
    },
    {
      title: 'Caminata ecológica Cerro El Volador',
      description: 'Recorrido guiado por senderos naturales, apto para todas las edades.',
      category: 'Deporte',
      startDate: daysFromNow(7),
      latitude: 6.2766,
      longitude: -75.582,
    },
    {
      title: 'Taller de robótica para jóvenes',
      description: 'Introducción a la programación y electrónica básica en Ruta N.',
      category: 'Educación',
      startDate: daysFromNow(14),
      latitude: 6.2743,
      longitude: -75.5667,
    },
    {
      title: 'Yoga al aire libre en el Parque del Río',
      description: 'Sesión gratuita de yoga y respiración, apta para principiantes.',
      category: 'Salud',
      startDate: daysFromNow(5),
      latitude: 6.2518,
      longitude: -75.5731,
    },
  ];

  for (const { latitude, longitude, ...data } of sampleActivities) {
    const exists = await prisma.activity.findFirst({ where: { title: data.title } });
    if (exists) continue;

    const activity = await prisma.activity.create({ data });

    // location es una columna PostGIS (geography) — Prisma Client no la
    // puede escribir directo, por eso va con SQL crudo (ver ActivityService).
    await prisma.$executeRawUnsafe(
      `UPDATE activities
       SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
       WHERE id = $3`,
      longitude,
      latitude,
      activity.id,
    );
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
