import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.role.createMany({
    data: [{ name: 'Admin' }, { name: 'Organizer' }, { name: 'User' }],
    skipDuplicates: true,
  });

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: 'Admin' },
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
