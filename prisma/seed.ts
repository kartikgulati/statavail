import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const stores = [
    { number: '101', name: 'Downtown Store' },
    { number: '102', name: 'Uptown Store' },
    { number: '103', name: 'West End Store' },
    { number: '104', name: 'East Side Store' },
    { number: '105', name: 'North Valley Store' },
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
