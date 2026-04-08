import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ─── Categories ───────────────────────────────────────────
  const healing = await prisma.category.upsert({
    where: { slug: 'healing' },
    update: {},
    create: {
      name: 'Healing & Recovery',
      slug: 'healing',
      description: 'Peptides researched for tissue repair, wound healing, and recovery applications.',
      sortOrder: 1,
    },
  })

  const growthHormone = await prisma.category.upsert({
    where: { slug: 'growth-hormone' },
    update: {},
    create: {
      name: 'Growth Hormone Secretagogues',
      slug: 'growth-hormone',
      description: 'Peptide blends studied for growth hormone release and related signaling pathways.',
      sortOrder: 2,
    },
  })

  const nootropics = await prisma.category.upsert({
    where: { slug: 'nootropics' },
    update: {},
    create: {
      name: 'Nootropics',
      slug: 'nootropics',
      description: 'Peptides researched for cognitive function, neuroprotection, and anxiolytic activity.',
      sortOrder: 3,
    },
  })

  console.log('Categories created.')

  // ─── Products ─────────────────────────────────────────────

  // 1. BPC-157
  await prisma.product.upsert({
    where: { slug: 'bpc-157' },
    update: {},
    create: {
      name: 'BPC-157',
      slug: 'bpc-157',
      description:
        'BPC-157 (Body Protection Compound-157) is a pentadecapeptide composed of 15 amino acids. It is a partial sequence of body protection compound (BPC) that is naturally found in human gastric juice.\n\nResearch has investigated BPC-157 in the context of wound healing, tendon and ligament repair, gastrointestinal tract protection, and angiogenesis. Studies in animal models have demonstrated its potential to accelerate healing of various tissue types including muscle, tendon, bone, and skin.\n\nBPC-157 has been the subject of numerous preclinical studies examining its cytoprotective and regenerative properties. Research continues to explore its mechanisms of action in promoting tissue repair and its interaction with the nitric oxide system, growth factor pathways, and the GABAergic system.',
      shortDescription: 'Pentadecapeptide researched for tissue repair and healing properties',
      casNumber: '137525-51-0',
      molecularWeight: '1419.53 g/mol',
      molecularFormula: 'C62H98N16O22',
      sequence: 'Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val',
      purity: 99.1,
      form: 'Lyophilized Powder',
      storageInstructions: 'Store at -20°C. Protect from light. Reconstituted solution stable for 14 days at 2-8°C.',
      shelfLife: '24 months from date of manufacture',
      coaLabName: 'Janoshik Analytical',
      coaBatchNumber: 'AZ-BPC-2026-001',
      status: 'ACTIVE',
      categoryId: healing.id,
      tags: ['healing', 'bpc', 'gastric', 'tissue-repair', 'bestseller'],
      ruoDisclaimer: 'For research use only. Not for human consumption. This product is not a drug, food, or cosmetic and should not be used as such.',
      variants: {
        create: [
          {
            name: '5mg',
            sku: 'AZ-BPC157-5MG',
            price: 49.99,
            compareAtPrice: 59.99,
            stock: 100,
            weight: 5,
            bulkPricing: [
              { qty: 3, price: 44.99 },
              { qty: 5, price: 39.99 },
              { qty: 10, price: 34.99 },
            ],
          },
          {
            name: '10mg',
            sku: 'AZ-BPC157-10MG',
            price: 84.99,
            compareAtPrice: 99.99,
            stock: 50,
            weight: 5,
            bulkPricing: [
              { qty: 3, price: 74.99 },
              { qty: 5, price: 69.99 },
            ],
          },
        ],
      },
    },
  })

  // 2. TB-500
  await prisma.product.upsert({
    where: { slug: 'tb-500' },
    update: {},
    create: {
      name: 'TB-500 (Thymosin Beta-4)',
      slug: 'tb-500',
      description:
        'TB-500 is a synthetic fraction of the protein thymosin beta-4, a 43-amino acid peptide that is naturally produced in higher concentrations in damaged tissues. Thymosin beta-4 has been identified as a major actin-sequestering molecule in mammalian cells.\n\nResearch has focused on TB-500\'s role in cell migration, blood vessel formation (angiogenesis), and tissue repair. Animal studies have examined its effects on wound healing, hair regrowth, cardiac repair following myocardial infarction, and neuroprotection.\n\nTB-500 is frequently researched alongside BPC-157 due to complementary mechanisms of action. The combination is commonly referred to as the "Wolverine Stack" in research literature due to the synergistic healing properties observed in preclinical models.',
      shortDescription: 'Thymosin beta-4 fragment studied for tissue repair and angiogenesis',
      casNumber: '77591-33-4',
      molecularWeight: '4963.44 g/mol',
      molecularFormula: 'C212H350N56O78S',
      purity: 99.3,
      form: 'Lyophilized Powder',
      storageInstructions: 'Store at -20°C. Protect from light and moisture.',
      shelfLife: '24 months from date of manufacture',
      coaLabName: 'Janoshik Analytical',
      coaBatchNumber: 'AZ-TB500-2026-001',
      status: 'ACTIVE',
      categoryId: healing.id,
      tags: ['healing', 'tb500', 'thymosin', 'tissue-repair', 'angiogenesis'],
      variants: {
        create: [
          {
            name: '5mg',
            sku: 'AZ-TB500-5MG',
            price: 54.99,
            stock: 75,
            weight: 5,
            bulkPricing: [
              { qty: 3, price: 49.99 },
              { qty: 5, price: 44.99 },
            ],
          },
          {
            name: '10mg',
            sku: 'AZ-TB500-10MG',
            price: 94.99,
            stock: 40,
            weight: 5,
          },
        ],
      },
    },
  })

  // 3. CJC-1295 / Ipamorelin Blend
  await prisma.product.upsert({
    where: { slug: 'cjc-1295-ipamorelin-blend' },
    update: {},
    create: {
      name: 'CJC-1295 / Ipamorelin Blend',
      slug: 'cjc-1295-ipamorelin-blend',
      description:
        'This blend combines two peptides commonly researched together in the field of growth hormone secretagogue studies: CJC-1295 (without DAC) and Ipamorelin.\n\nCJC-1295 is a synthetic analogue of growth hormone-releasing hormone (GHRH) that has been studied for its ability to increase growth hormone (GH) and insulin-like growth factor 1 (IGF-1) levels. It acts on the GHRH receptor in the anterior pituitary.\n\nIpamorelin is a selective growth hormone secretagogue receptor (GHS-R) agonist — a ghrelin mimetic. Research has shown it to be highly selective for GH release without significantly affecting cortisol or prolactin levels, unlike earlier-generation GHS-R agonists.\n\nThe combination is researched because CJC-1295 and Ipamorelin act on different receptors (GHRH-R and GHS-R respectively), and preclinical data suggest a synergistic amplification of pulsatile GH release when both pathways are stimulated simultaneously.',
      shortDescription: 'Dual-receptor GH secretagogue blend for growth hormone research',
      casNumber: '863288-34-0 / 170851-70-4',
      molecularWeight: '3367.97 / 711.85 g/mol',
      molecularFormula: 'C152H252N44O42 / C38H49N9O5',
      purity: 99.0,
      form: 'Lyophilized Powder',
      storageInstructions: 'Store at -20°C. Protect from light. Use within 21 days of reconstitution.',
      shelfLife: '24 months from date of manufacture',
      coaLabName: 'Janoshik Analytical',
      coaBatchNumber: 'AZ-CJCIPA-2026-001',
      status: 'ACTIVE',
      categoryId: growthHormone.id,
      tags: ['growth-hormone', 'cjc-1295', 'ipamorelin', 'gh-secretagogue', 'blend'],
      variants: {
        create: [
          {
            name: '10mg Blend (5mg/5mg)',
            sku: 'AZ-CJCIPA-10MG',
            price: 79.99,
            stock: 60,
            weight: 5,
            bulkPricing: [
              { qty: 3, price: 72.99 },
              { qty: 5, price: 67.99 },
            ],
          },
        ],
      },
    },
  })

  // 4. Selank
  await prisma.product.upsert({
    where: { slug: 'selank' },
    update: {},
    create: {
      name: 'Selank',
      slug: 'selank',
      description:
        'Selank is a synthetic analogue of the immunomodulatory peptide tuftsin (Thr-Lys-Pro-Arg), with an additional Gly-Pro sequence. It was developed at the Institute of Molecular Genetics of the Russian Academy of Sciences.\n\nResearch has investigated Selank for its nootropic and anxiolytic properties. Studies suggest it may influence the expression of brain-derived neurotrophic factor (BDNF) and modulate the balance of T helper cell cytokines.\n\nPreclinical studies have examined Selank\'s effects on cognitive function, anxiety-like behavior, and immune response modulation. Research indicates it does not produce sedation, addiction, or withdrawal effects commonly associated with traditional anxiolytic compounds.',
      shortDescription: 'Tuftsin analogue peptide researched for nootropic and anxiolytic properties',
      casNumber: '129954-34-3',
      molecularWeight: '751.87 g/mol',
      molecularFormula: 'C33H57N11O9',
      sequence: 'Thr-Lys-Pro-Arg-Pro-Gly-Pro',
      purity: 99.2,
      form: 'Lyophilized Powder',
      storageInstructions: 'Store at -20°C. Protect from light and moisture.',
      shelfLife: '24 months from date of manufacture',
      coaLabName: 'Janoshik Analytical',
      coaBatchNumber: 'AZ-SEL-2026-001',
      status: 'ACTIVE',
      categoryId: nootropics.id,
      tags: ['nootropic', 'selank', 'anxiolytic', 'cognitive', 'neuroprotection'],
      variants: {
        create: [
          {
            name: '5mg',
            sku: 'AZ-SELANK-5MG',
            price: 39.99,
            stock: 80,
            weight: 5,
            bulkPricing: [
              { qty: 3, price: 34.99 },
              { qty: 5, price: 29.99 },
            ],
          },
        ],
      },
    },
  })

  console.log('Products created.')

  // ─── Admin User ───────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('admin123!', 12)

  await prisma.adminUser.upsert({
    where: { email: 'admin@azaminos.com' },
    update: {},
    create: {
      email: 'admin@azaminos.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'OWNER',
    },
  })

  console.log('Admin user created: admin@azaminos.com / admin123!')
  console.log('IMPORTANT: Change the admin password before going to production!')

  console.log('\nSeed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
