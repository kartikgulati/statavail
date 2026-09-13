import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const stores = [
    { number: '40268', name: 'Fischer Hallman' },
  ];

  console.log('Seeding stores...');
  for (const store of stores) {
    await prisma.store.upsert({
      where: { number: store.number },
      update: store,
      create: store,
    });
  }
  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
