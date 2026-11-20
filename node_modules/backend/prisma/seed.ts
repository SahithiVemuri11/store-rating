import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper to validate constraints before inserting
function assertConstraints(name: string, email: string, address: string, password?: string) {
  if (name.length < 20 || name.length > 60) {
    throw new Error(`Validation Error: Name "${name}" (${name.length} chars) must be 20-60 chars.`);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(`Validation Error: Email "${email}" is invalid.`);
  }
  if (address.length < 1 || address.length > 400) {
    throw new Error(`Validation Error: Address length (${address.length} chars) must be 1-400 chars.`);
  }
  if (password) {
    if (password.length < 8 || password.length > 16) {
      throw new Error(`Validation Error: Password length (${password.length}) must be 8-16 chars.`);
    }
    if (!/[A-Z]/.test(password)) {
      throw new Error('Validation Error: Password must contain at least one uppercase letter.');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      throw new Error('Validation Error: Password must contain at least one special character.');
    }
  }
}

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // 1. Clean existing records in correct foreign key order
  console.log('🧹 Cleaning existing tables...');
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  // 2. Pre-hash common passwords for fast seeding
  console.log('🔑 Generating secure password hashes...');
  const adminPassword = await bcrypt.hash('AdminPass123!', 10);
  const ownerPassword = await bcrypt.hash('OwnerPass123!', 10);
  const userPassword = await bcrypt.hash('UserPass123!', 10);

  // 3. System Administrator Account
  const adminData = {
    name: 'System Administrator One',
    email: 'admin@storerating.com',
    passwordHash: adminPassword,
    address: 'Suite 100, Central Administrative Tower, Tech City Plaza',
    role: Role.ADMIN,
  };
  assertConstraints(adminData.name, adminData.email, adminData.address, 'AdminPass123!');
  const admin = await prisma.user.create({ data: adminData });
  console.log(`✅ Created System Administrator: ${admin.email}`);

  // 4. Exactly 15 Store Owners and 15 Stores
  const storeOwnerSpecs = [
    {
      ownerName: 'Store Owner Sarah Jenkins',
      ownerEmail: 'owner.sarah@storerating.com',
      ownerAddress: '456 Market Promenade, Downtown Commercial District',
      storeName: 'Downtown Tech Emporium Store',
      storeEmail: 'contact@techemporium.com',
      storeAddress: '101 Silicon Valley Boulevard, Downtown District, Suite 200',
    },
    {
      ownerName: 'Store Owner David Miller',
      ownerEmail: 'owner.david@storerating.com',
      ownerAddress: '789 Artisan Square, Harbor District',
      storeName: 'Green Harvest Organic Market',
      storeEmail: 'support@greenharvest.com',
      storeAddress: '220 Eco Garden Lane, Meadow District, Building 4',
    },
    {
      ownerName: 'Store Owner Alexander Wright',
      ownerEmail: 'owner.alexander@storerating.com',
      ownerAddress: '12 Olympic Boulevard, Westside Sports Complex',
      storeName: 'Apex Fitness & Athletic Gear',
      storeEmail: 'sales@apexfitnessgear.com',
      storeAddress: '55 Olympic Avenue, Westside Sports Complex, Unit 10',
    },
    {
      ownerName: 'Store Owner Elizabeth Clark',
      ownerEmail: 'owner.elizabeth@storerating.com',
      ownerAddress: '88 Marina Walkway, Coastal Bay Harbor',
      storeName: 'Blue Horizon Maritime Supplies',
      storeEmail: 'info@bluehorizonmaritime.com',
      storeAddress: '304 Ocean Pier Road, Coastal Bay Harbor, Dock 3',
    },
    {
      ownerName: 'Store Owner Christopher Vance',
      ownerEmail: 'owner.christopher@storerating.com',
      ownerAddress: '14 Baker Street, Heritage Culinary Quarter',
      storeName: 'Golden Grain Artisan Bakery',
      storeEmail: 'orders@goldengrainbakery.com',
      storeAddress: '77 Heritage Mill Way, Culinary Quarter, Suite A',
    },
    {
      ownerName: 'Store Owner Katherine Brooks',
      ownerEmail: 'owner.katherine@storerating.com',
      ownerAddress: '92 Alpine Ridge Way, Highland Mountain Valley',
      storeName: 'Summit Outdoor Camping Depot',
      storeEmail: 'explore@summitoutdoordepot.com',
      storeAddress: '150 Mountain View Parkway, Highland Valley Complex',
    },
    {
      ownerName: 'Store Owner Benjamin Hayes',
      ownerEmail: 'owner.benjamin@storerating.com',
      ownerAddress: '63 Botanical Garden Terrace, Floral District',
      storeName: 'Velvet Petals Floral Studio',
      storeEmail: 'blooms@velvetpetalsstudio.com',
      storeAddress: '18 Gardenia Court, Floral Arts District, Shop 2',
    },
    {
      ownerName: 'Store Owner Victoria Sullivan',
      ownerEmail: 'owner.victoria@storerating.com',
      ownerAddress: '210 Innovation Circle, Technology Park',
      storeName: 'Pinnacle Electronics Superhub',
      storeEmail: 'support@pinnacleelectronics.com',
      storeAddress: '500 Innovation Expressway, Tech Park Tower B',
    },
    {
      ownerName: 'Store Owner Jonathan Rivera',
      ownerEmail: 'owner.jonathan@storerating.com',
      ownerAddress: '35 Epicurean Avenue, Gourmet Waterfront',
      storeName: 'Silver Spoon Gourmet Bistro',
      storeEmail: 'reservations@silverspoonbistro.com',
      storeAddress: '88 Waterfront Esplanade, Gourmet District, Floor 1',
    },
    {
      ownerName: 'Store Owner Samantha Foster',
      ownerEmail: 'owner.samantha@storerating.com',
      ownerAddress: '17 Symphony Lane, Arts & Music Quarter',
      storeName: 'Harmony Music & Audio Lounge',
      storeEmail: 'contact@harmonymusiclounge.com',
      storeAddress: '42 Melody Boulevard, Cultural Arts Quarter, Studio 5',
    },
    {
      ownerName: 'Store Owner Nicholas Harrison',
      ownerEmail: 'owner.nicholas@storerating.com',
      ownerAddress: '105 Haute Couture Boulevard, Fashion District',
      storeName: 'Urban Threads Fashion House',
      storeEmail: 'style@urbanthreadshouse.com',
      storeAddress: '330 Trendsetter Boulevard, Fashion District, Level 2',
    },
    {
      ownerName: 'Store Owner Jacqueline Murphy',
      ownerEmail: 'owner.jacqueline@storerating.com',
      ownerAddress: '54 Visionary Parkway, Health & Wellness Plaza',
      storeName: 'Crystal Clear Optical Center',
      storeEmail: 'care@crystalclearoptical.com',
      storeAddress: '120 Wellness Boulevard, Suite 104, Medical Quarter',
    },
    {
      ownerName: 'Store Owner Nathaniel Cooper',
      ownerEmail: 'owner.nathaniel@storerating.com',
      ownerAddress: '71 Greenhouse Road, Emerald Valley Outskirts',
      storeName: 'Evergreen Botanicals Nursery',
      storeEmail: 'grow@evergreenbotanicals.com',
      storeAddress: '890 Valley Flora Highway, Emerald Valley Sector 7',
    },
    {
      ownerName: 'Store Owner Gabrielle Bennett',
      ownerEmail: 'owner.gabrielle@storerating.com',
      ownerAddress: '29 Bookish Promenade, University Cultural Quarter',
      storeName: 'Nova Bookshop & Literary Cafe',
      storeEmail: 'readers@novabookshopcafe.com',
      storeAddress: '404 Scholastic Avenue, University District, Wing C',
    },
    {
      ownerName: 'Store Owner Montgomery Walsh',
      ownerEmail: 'owner.montgomery@storerating.com',
      ownerAddress: '16 Speedwell Way, Motor City Industrial Park',
      storeName: 'Prestige Automotive Care Hub',
      storeEmail: 'service@prestigeautocare.com',
      storeAddress: '707 Industrial Parkway, Sector 9, Motor City Hub',
    },
  ];

  console.log(`🏪 Creating ${storeOwnerSpecs.length} Store Owners and unique Stores...`);
  const createdStores: { id: string; name: string }[] = [];

  for (const spec of storeOwnerSpecs) {
    assertConstraints(spec.ownerName, spec.ownerEmail, spec.ownerAddress, 'OwnerPass123!');
    assertConstraints(spec.storeName, spec.storeEmail, spec.storeAddress);

    const owner = await prisma.user.create({
      data: {
        name: spec.ownerName,
        email: spec.ownerEmail,
        passwordHash: ownerPassword,
        address: spec.ownerAddress,
        role: Role.STORE_OWNER,
      },
    });

    const store = await prisma.store.create({
      data: {
        name: spec.storeName,
        email: spec.storeEmail,
        address: spec.storeAddress,
        ownerId: owner.id,
      },
    });

    createdStores.push({ id: store.id, name: store.name });
  }
  console.log(`✅ Created ${createdStores.length} Stores with 1-to-1 Store Owners`);

  // 5. Exactly 30 Normal User Accounts
  const normalUserSpecs = [
    { name: 'John Christopher Miller', email: 'user.john@storerating.com', address: '12 Elm Street, Residential Quarter, Metro City' },
    { name: 'Emily Rebecca Thompson', email: 'user.emily@storerating.com', address: '88 Oak Avenue, Maple Ridge Heights, District 3' },
    { name: 'Michael Brandon Clarke', email: 'user.michael@storerating.com', address: '34 Pine Boulevard, Sunnyvale District, Block B' },
    { name: 'Jessica Lauren Reynolds', email: 'user.jessica@storerating.com', address: '501 Cedar Crest Way, Riverdale Commons' },
    { name: 'Daniel Edward Robinson', email: 'user.daniel@storerating.com', address: '77 Birchwood Lane, Highland Valley' },
    { name: 'Ashley Nicole Patterson', email: 'user.ashley@storerating.com', address: '19 Willow Brook Road, Lakeview Sector' },
    { name: 'Matthew Ryan Henderson', email: 'user.matthew@storerating.com', address: '143 Sycamore Street, Westside Borough' },
    { name: 'Amanda Christine Bailey', email: 'user.amanda@storerating.com', address: '62 Aspen Grove Boulevard, North Hills' },
    { name: 'Joshua Andrew Campbell', email: 'user.joshua@storerating.com', address: '228 Magnolia Drive, South Shore Park' },
    { name: 'Megan Danielle Sullivan', email: 'user.megan@storerating.com', address: '95 Cypress Point Court, Harbor Heights' },
    { name: 'David William Harrison', email: 'user.davidh@storerating.com', address: '310 Redwood Highway, Sunset Valley' },
    { name: 'Rachel Elizabeth Watson', email: 'user.rachel@storerating.com', address: '48 Chestnut Ridge Way, Oakwood Hills' },
    { name: 'James Anthony Martinez', email: 'user.james@storerating.com', address: '815 Poplar Springs Drive, Meadowbrook' },
    { name: 'Stephanie Marie Sanders', email: 'user.stephanie@storerating.com', address: '27 Alderwood Crescent, East End District' },
    { name: 'Robert Joseph Phillips', email: 'user.robert@storerating.com', address: '164 Hickory Hill Road, Brookside Village' },
    { name: 'Hannah Grace Richardson', email: 'user.hannah@storerating.com', address: '533 Beechwood Park, Fairview Heights' },
    { name: 'William Thomas Jackson', email: 'user.william@storerating.com', address: '72 Walnut Creek Court, Glendale Sector' },
    { name: 'Olivia Marie Davenport', email: 'user.olivia@storerating.com', address: '419 Hawthorn Lane, Silver Lake Quarter' },
    { name: 'Joseph Charles Anderson', email: 'user.joseph@storerating.com', address: '86 Laurel Canyon Way, Mountainview Park' },
    { name: 'Samantha Nicole Griffin', email: 'user.samanthag@storerating.com', address: '602 Juniper Terrace, Rosewood Estates' },
    { name: 'Charles Edward Mitchell', email: 'user.charles@storerating.com', address: '37 Hazelwood Avenue, Central Township' },
    { name: 'Lauren Katherine Russell', email: 'user.lauren@storerating.com', address: '185 Linden Street, Greenfield Enclave' },
    { name: 'Andrew Timothy Morales', email: 'user.andrew@storerating.com', address: '942 Mulberry Way, Lakeside Gardens' },
    { name: 'Brittany Ann Washington', email: 'user.brittany@storerating.com', address: '76 Cottonwood Boulevard, Stonegate Plaza' },
    { name: 'Kevin Alexander Bennett', email: 'user.kevin@storerating.com', address: '308 Ironwood Court, Timberline Ridge' },
    { name: 'Victoria Lynn Armstrong', email: 'user.victorial@storerating.com', address: '521 Dogwood Parkway, Whispering Pines' },
    { name: 'Brian Douglas Fletcher', email: 'user.brian@storerating.com', address: '114 Spruce Mountain Road, Highwood' },
    { name: 'Danielle Marie Peterson', email: 'user.danielle@storerating.com', address: '639 Ashwood Drive, Crystal Springs' },
    { name: 'Justin Bradley Crawford', email: 'user.justin@storerating.com', address: '275 Boxwood Trail, Pleasant Valley' },
    { name: 'Courtney Brooke Stevens', email: 'user.courtney@storerating.com', address: '840 Sumac Ridge Avenue, Pinecrest Village' },
  ];

  console.log(`👥 Creating ${normalUserSpecs.length} Normal Users...`);
  const createdUsers: { id: string; email: string }[] = [];

  for (const userSpec of normalUserSpecs) {
    assertConstraints(userSpec.name, userSpec.email, userSpec.address, 'UserPass123!');
    const user = await prisma.user.create({
      data: {
        name: userSpec.name,
        email: userSpec.email,
        passwordHash: userPassword,
        address: userSpec.address,
        role: Role.NORMAL_USER,
      },
    });
    createdUsers.push({ id: user.id, email: user.email });
  }
  console.log(`✅ Created ${createdUsers.length} Normal Users`);

  // 6. Realistic Rating Distribution
  // Target: Each store gets between 8 and 14 ratings from the 30 users
  // Rating values follow a realistic consumer curve (mostly 4 and 5 stars, some 3s, fewer 1s and 2s)
  console.log('⭐ Generating realistic ratings distribution across all stores...');

  const ratedPairs = new Set<string>();
  const ratingData: { userId: string; storeId: string; ratingValue: number }[] = [];

  // Realistic rating weight pools:
  // Store quality profiles to give varied, realistic store average scores (e.g. 4.7, 4.3, 3.8, etc.)
  const storeQualityProfiles = [
    [5, 5, 4, 5, 4, 5, 4, 5, 4, 3], // High tier ~4.6
    [4, 5, 4, 4, 5, 4, 3, 4, 5, 4], // Great tier ~4.2
    [3, 4, 3, 4, 5, 3, 4, 3, 2, 4], // Average tier ~3.5
    [5, 4, 5, 5, 4, 5, 4, 5, 3, 5], // Flagship ~4.5
    [4, 4, 3, 4, 4, 5, 3, 4, 3, 4], // Solid ~3.9
  ];

  createdStores.forEach((store, storeIndex) => {
    const profile = storeQualityProfiles[storeIndex % storeQualityProfiles.length];
    
    // Determine how many users will rate this store (between 8 and 14 users)
    const numberOfRatings = 8 + ((storeIndex * 7) % 7); // 8 to 14

    // Pick distinct users deterministically using a stride
    let usersAssigned = 0;
    for (let i = 0; i < createdUsers.length && usersAssigned < numberOfRatings; i++) {
      const userIndex = (storeIndex * 2 + i * 3) % createdUsers.length;
      const user = createdUsers[userIndex];
      const pairKey = `${user.id}_${store.id}`;

      if (!ratedPairs.has(pairKey)) {
        ratedPairs.add(pairKey);
        const ratingScore = profile[usersAssigned % profile.length];
        
        ratingData.push({
          userId: user.id,
          storeId: store.id,
          ratingValue: ratingScore,
        });
        usersAssigned++;
      }
    }
  });

  // Batch insert all ratings
  await prisma.rating.createMany({
    data: ratingData,
  });

  console.log(`✅ Seeded ${ratingData.length} unique ratings across all ${createdStores.length} stores.`);

  // 7. Summary Stats
  const totalUsers = await prisma.user.count();
  const totalStores = await prisma.store.count();
  const totalRatings = await prisma.rating.count();

  console.log('\n================ SEEDING COMPLETED ================');
  console.log(`📊 Total Users:   ${totalUsers} (1 Admin + ${storeOwnerSpecs.length} Owners + ${normalUserSpecs.length} Customers)`);
  console.log(`🏪 Total Stores:  ${totalStores}`);
  console.log(`⭐ Total Ratings: ${totalRatings}`);
  console.log('===================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
