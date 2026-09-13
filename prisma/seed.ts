import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const stores = [
    { number: '40268', name: 'Fischer Hallman' },
    { number: '40269', name: 'Uptown Store' },
    { number: '40270', name: 'West End Store' },
    { number: '40271', name: 'East Side Store' },
    { number: '40272', name: 'North Valley Store' },
  ];

  console.log('Seeding stores...');
  for (const store of stores) {
    await prisma.store.upsert({
      where: { number: store.number },
      update: {},
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
