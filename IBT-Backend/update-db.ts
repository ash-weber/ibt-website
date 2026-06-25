import { prisma } from './src/lib/prisma';

async function main() {
  // Update Contact (Footer Address)
  const formattedContactAddress = "I-BACUS-TECH\n3rd Floor, 6C Chitra Nagar\nSaravanampatti,Coimbatore,\nTamil Nadu-641035.";
  
  await prisma.contact.updateMany({
    where: { type: 'ADDRESS' },
    data: { value: formattedContactAddress }
  });

  // Update contact_branches in Settings
  const contactBranches = [
    {
      id: "contact-branch-0",
      title: "I-BACUS-TECH",
      address: "3rd Floor, 6C Chitra Nagar\nSaravanampatti,Coimbatore,\nTamil Nadu-641035.",
      mapLink: null
    },
    {
      id: "contact-branch-1",
      title: "Bharathidasan College of Arts and Science",
      address: "Erode To Gobi Road,\nEllispettai,\nPallapalayam (PO),Erode\nTamil Nadu- 638116.",
      mapLink: null
    }
  ];

  await prisma.setting.upsert({
    where: { key: 'contact_branches' },
    update: { value: contactBranches },
    create: { key: 'contact_branches', value: contactBranches }
  });

  console.log("Database updated successfully with exact requested formatting.");
}

main().finally(() => prisma.$disconnect());
