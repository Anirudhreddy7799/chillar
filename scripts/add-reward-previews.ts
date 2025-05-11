import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../shared/schema';
import { eq } from 'drizzle-orm';
import ws from 'ws';
import { rewards } from '../shared/schema';

// Database connection setup
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// Reward preview data - varied types, values, sponsors
const rewardPreviews = [
  // Digital vouchers and recharges
  {
    week: "2025-22",
    prizeName: "₹300 Flipkart Voucher",
    prizeValue: 300,
    prizeType: "voucher",
    sponsor: "Flipkart",
    imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3"
  },
  {
    week: "2025-23",
    prizeName: "₹199 Jio Recharge",
    prizeValue: 199,
    prizeType: "recharge",
    sponsor: "Jio",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97"
  },
  {
    week: "2025-24",
    prizeName: "₹400 Uber Voucher",
    prizeValue: 400,
    prizeType: "voucher",
    sponsor: "Uber",
    imageUrl: "https://images.unsplash.com/photo-1511452885600-a3d2c9a5d9b1"
  },
  {
    week: "2025-25",
    prizeName: "₹250 Vi Recharge",
    prizeValue: 250,
    prizeType: "recharge",
    sponsor: "Vi",
    imageUrl: "https://images.unsplash.com/photo-1598301257982-0cf014dabbcd"
  },
  {
    week: "2025-26",
    prizeName: "₹750 Ajio Voucher",
    prizeValue: 750,
    prizeType: "voucher",
    sponsor: "Ajio",
    imageUrl: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5"
  },
  
  // Food & dining vouchers
  {
    week: "2025-27",
    prizeName: "₹500 Zomato Voucher",
    prizeValue: 500,
    prizeType: "voucher",
    sponsor: "Zomato",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"
  },
  {
    week: "2025-28",
    prizeName: "₹350 Dominos Voucher",
    prizeValue: 350,
    prizeType: "voucher",
    sponsor: "Dominos",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591"
  },
  {
    week: "2025-29",
    prizeName: "₹450 McDonald's Voucher",
    prizeValue: 450,
    prizeType: "voucher",
    sponsor: "McDonald's",
    imageUrl: "https://images.unsplash.com/photo-1597393353415-b3730f3600bc"
  },
  {
    week: "2025-30",
    prizeName: "₹300 Starbucks Voucher",
    prizeValue: 300,
    prizeType: "voucher",
    sponsor: "Starbucks",
    imageUrl: "https://images.unsplash.com/photo-1566897819059-db42e135fa69"
  },
  
  // Digital & Entertainment Subscriptions
  {
    week: "2025-31",
    prizeName: "3 Months Netflix Premium",
    prizeValue: 649,
    prizeType: "subscription",
    sponsor: "Netflix",
    imageUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85"
  },
  {
    week: "2025-32",
    prizeName: "6 Months YouTube Premium",
    prizeValue: 599,
    prizeType: "subscription",
    sponsor: "YouTube",
    imageUrl: "https://images.unsplash.com/photo-1611162616475-46b635cb6868"
  },
  {
    week: "2025-33",
    prizeName: "1 Year Hotstar Premium",
    prizeValue: 899,
    prizeType: "subscription",
    sponsor: "Hotstar",
    imageUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37"
  },
  {
    week: "2025-34",
    prizeName: "3 Months Amazon Prime",
    prizeValue: 459,
    prizeType: "subscription",
    sponsor: "Amazon Prime",
    imageUrl: "https://images.unsplash.com/photo-1585247226801-bc613c441316"
  },
  
  // Electronics & Gadgets vouchers
  {
    week: "2025-35",
    prizeName: "₹1000 Croma Voucher",
    prizeValue: 1000,
    prizeType: "voucher",
    sponsor: "Croma",
    imageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03"
  },
  {
    week: "2025-36",
    prizeName: "₹1500 Vijay Sales Voucher",
    prizeValue: 1500,
    prizeType: "voucher",
    sponsor: "Vijay Sales",
    imageUrl: "https://images.unsplash.com/photo-1588508065123-287b28e013da"
  },
  {
    week: "2025-37",
    prizeName: "₹800 Reliance Digital Voucher",
    prizeValue: 800,
    prizeType: "voucher",
    sponsor: "Reliance Digital",
    imageUrl: "https://images.unsplash.com/photo-1546027658-7aa750153465"
  },
  
  // Lifestyle & Fashion Vouchers
  {
    week: "2025-38",
    prizeName: "₹600 Lifestyle Voucher",
    prizeValue: 600,
    prizeType: "voucher",
    sponsor: "Lifestyle",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b"
  },
  {
    week: "2025-39",
    prizeName: "₹500 H&M Voucher",
    prizeValue: 500,
    prizeType: "voucher",
    sponsor: "H&M",
    imageUrl: "https://images.unsplash.com/photo-1551232864-3f0890e580d9"
  },
  {
    week: "2025-40",
    prizeName: "₹700 Westside Voucher",
    prizeValue: 700,
    prizeType: "voucher",
    sponsor: "Westside",
    imageUrl: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5"
  },
  
  // Grocery & Essentials Vouchers
  {
    week: "2025-41",
    prizeName: "₹800 BigBasket Voucher",
    prizeValue: 800,
    prizeType: "voucher",
    sponsor: "BigBasket",
    imageUrl: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8"
  },
  {
    week: "2025-42",
    prizeName: "₹500 Grofers Voucher",
    prizeValue: 500,
    prizeType: "voucher",
    sponsor: "Grofers",
    imageUrl: "https://images.unsplash.com/photo-1579113800032-c38bd7635818"
  },
  {
    week: "2025-43",
    prizeName: "₹600 DMart Voucher",
    prizeValue: 600,
    prizeType: "voucher",
    sponsor: "DMart",
    imageUrl: "https://images.unsplash.com/photo-1601600576337-c1d8a0d1373f"
  },
  
  // Health & Wellness Vouchers
  {
    week: "2025-44",
    prizeName: "₹500 Nykaa Voucher",
    prizeValue: 500,
    prizeType: "voucher",
    sponsor: "Nykaa",
    imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348"
  },
  {
    week: "2025-45",
    prizeName: "₹400 Cult.fit Voucher",
    prizeValue: 400,
    prizeType: "voucher",
    sponsor: "Cult.fit",
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a"
  },
  {
    week: "2025-46",
    prizeName: "₹350 PharmEasy Voucher",
    prizeValue: 350,
    prizeType: "voucher",
    sponsor: "PharmEasy",
    imageUrl: "https://images.unsplash.com/photo-1563213126-a4273aed2016"
  },
  
  // Books & Education Vouchers
  {
    week: "2025-47",
    prizeName: "₹400 Audible Subscription",
    prizeValue: 400,
    prizeType: "subscription",
    sponsor: "Audible",
    imageUrl: "https://images.unsplash.com/photo-1535992165812-68d1861aa71e"
  },
  {
    week: "2025-48",
    prizeName: "₹500 Kindle Unlimited",
    prizeValue: 500,
    prizeType: "subscription",
    sponsor: "Kindle",
    imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f"
  },
  {
    week: "2025-49",
    prizeName: "₹600 Crossword Voucher",
    prizeValue: 600,
    prizeType: "voucher",
    sponsor: "Crossword",
    imageUrl: "https://images.unsplash.com/photo-1521056787327-166d7f35ef08"
  },
  
  // More Recharge Offerings
  {
    week: "2025-50",
    prizeName: "₹299 BSNL Recharge",
    prizeValue: 299,
    prizeType: "recharge",
    sponsor: "BSNL",
    imageUrl: "https://images.unsplash.com/photo-1516726817505-f5ed825624d8"
  },
  {
    week: "2025-51",
    prizeName: "₹349 Airtel Recharge",
    prizeValue: 349,
    prizeType: "recharge",
    sponsor: "Airtel",
    imageUrl: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1"
  },
  {
    week: "2026-01",
    prizeName: "₹399 Jio Recharge",
    prizeValue: 399,
    prizeType: "recharge",
    sponsor: "Jio",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97"
  },
  
  // Premium Vouchers
  {
    week: "2026-02",
    prizeName: "₹2000 Tanishq Voucher",
    prizeValue: 2000,
    prizeType: "voucher",
    sponsor: "Tanishq",
    imageUrl: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0"
  },
  {
    week: "2026-03",
    prizeName: "₹1500 Shoppers Stop Voucher",
    prizeValue: 1500,
    prizeType: "voucher",
    sponsor: "Shoppers Stop",
    imageUrl: "https://images.unsplash.com/photo-1591085686350-798c0f9faa7f"
  },
  {
    week: "2026-04",
    prizeName: "₹1200 Decathlon Voucher",
    prizeValue: 1200,
    prizeType: "voucher",
    sponsor: "Decathlon",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b"
  },
  
  // Travel and Experience Vouchers
  {
    week: "2026-05",
    prizeName: "₹2000 MakeMyTrip Voucher",
    prizeValue: 2000,
    prizeType: "voucher",
    sponsor: "MakeMyTrip",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
  },
  {
    week: "2026-06",
    prizeName: "₹1500 Cleartrip Voucher",
    prizeValue: 1500,
    prizeType: "voucher",
    sponsor: "Cleartrip",
    imageUrl: "https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad"
  },
  {
    week: "2026-07",
    prizeName: "₹1000 OYO Voucher",
    prizeValue: 1000,
    prizeType: "voucher",
    sponsor: "OYO Rooms",
    imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39"
  },
  
  // Gaming Subscriptions
  {
    week: "2026-08",
    prizeName: "3 Months Xbox Game Pass",
    prizeValue: 899,
    prizeType: "subscription",
    sponsor: "Microsoft",
    imageUrl: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d"
  },
  {
    week: "2026-09",
    prizeName: "1 Month PlayStation Plus",
    prizeValue: 499,
    prizeType: "subscription",
    sponsor: "Sony",
    imageUrl: "https://images.unsplash.com/photo-1605901309584-818e25960a8f"
  },
];

// Function to insert the rewards
async function addRewardPreviews() {
  try {
    console.log(`Starting to add ${rewardPreviews.length} reward previews...`);
    
    for (const reward of rewardPreviews) {
      // Check if the reward for this week already exists
      const existingRewards = await db
        .select()
        .from(rewards)
        .where(eq(rewards.week, reward.week));
        
      if (existingRewards.length > 0) {
        console.log(`Skipping reward for week ${reward.week} as it already exists.`);
        continue;
      }
      
      // Insert the reward
      const result = await db.insert(rewards).values(reward);
      console.log(`Added reward for week ${reward.week}: ${reward.prizeName}`);
    }
    
    console.log('All rewards have been successfully processed!');
  } catch (error) {
    console.error('Error adding reward previews:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the function
addRewardPreviews();