import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.role.createMany({
    data: [{ name: 'admin' }, { name: 'organizer' }, { name: 'user' }],
    skipDuplicates: true,
  });

  await prisma.activity.createMany({
    data: [
      {
        title: 'Cine al parque',
        description: 'Proyección gratuita de cine colombiano en el Parque de los Deseos.',
        category: 'cultural',
      },
      {
        title: 'Caminata ecológica Cerro El Volador',
        description: 'Recorrido guiado por senderos naturales, apto para todas las edades.',
        category: 'deportivo',
      },
      {
        title: 'Taller de robótica para jóvenes',
        description: 'Introducción a la programación y electrónica básica en Ruta N.',
        category: 'educativo',
      },
    ],
  });
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
