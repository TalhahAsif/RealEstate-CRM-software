import path from "node:path";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

import { connectToDatabase } from "@/lib/db/mongodb";
import { User, Lead, Customer, Property, Project, FollowUp, SiteVisit, Deal } from "@/models";

async function seed() {
  await connectToDatabase();
  console.log("Connected to MongoDB. Clearing existing seed collections...");

  await Promise.all([
    User.deleteMany({}),
    Lead.deleteMany({}),
    Customer.deleteMany({}),
    Property.deleteMany({}),
    Project.deleteMany({}),
    FollowUp.deleteMany({}),
    SiteVisit.deleteMany({}),
    Deal.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await User.create({
    firstName: "Ayesha",
    lastName: "Raza",
    email: "admin@estatecrm.test",
    phone: "+1-555-0100",
    password: passwordHash,
    role: "admin",
    isActive: true,
  });

  const [agentOne, agentTwo] = await User.create([
    {
      firstName: "Daniel",
      lastName: "Kim",
      email: "daniel.kim@estatecrm.test",
      phone: "+1-555-0101",
      password: passwordHash,
      role: "agent",
      isActive: true,
    },
    {
      firstName: "Priya",
      lastName: "Nair",
      email: "priya.nair@estatecrm.test",
      phone: "+1-555-0102",
      password: passwordHash,
      role: "agent",
      isActive: true,
    },
  ]);

  console.log("Created users:", [admin, agentOne, agentTwo].map((u) => u.email).join(", "));

  const projects = await Project.create([
    {
      name: "Skyline Residences",
      description: "A modern high-rise residential development in the city center.",
      developer: "Horizon Developers",
      location: "Downtown",
      city: "Austin",
      status: "under_construction",
      totalUnits: 180,
      images: [],
      amenities: ["Swimming Pool", "Gym", "24/7 Security", "Covered Parking"],
    },
    {
      name: "Greenview Business Park",
      description: "A commercial park with office and retail units.",
      developer: "Cedar Point Group",
      location: "North Industrial Corridor",
      city: "Denver",
      status: "completed",
      totalUnits: 40,
      images: [],
      amenities: ["Conference Center", "Cafeteria", "Ample Parking"],
    },
  ]);

  console.log("Created projects:", projects.map((p: { name: string }) => p.name).join(", "));

  const propertyDefs = [
    { title: "2-Bed Apartment in Skyline Residences", propertyType: "apartment", listingType: "sale", price: 285000, area: 1150, bedrooms: 2, bathrooms: 2, city: "Austin", project: projects[0]._id, agent: agentOne },
    { title: "3-Bed Apartment in Skyline Residences", propertyType: "apartment", listingType: "sale", price: 365000, area: 1450, bedrooms: 3, bathrooms: 2, city: "Austin", project: projects[0]._id, agent: agentOne },
    { title: "Studio Apartment in Skyline Residences", propertyType: "apartment", listingType: "rent", price: 1450, area: 620, bedrooms: 0, bathrooms: 1, city: "Austin", project: projects[0]._id, agent: agentTwo },
    { title: "Office Suite in Greenview Business Park", propertyType: "office", listingType: "rent", price: 3200, area: 2200, bedrooms: undefined, bathrooms: 2, city: "Denver", project: projects[1]._id, agent: agentTwo },
    { title: "Retail Unit in Greenview Business Park", propertyType: "shop", listingType: "sale", price: 410000, area: 1800, bedrooms: undefined, bathrooms: 1, city: "Denver", project: projects[1]._id, agent: agentOne },
    { title: "Single Family Home in Cedar Hills", propertyType: "house", listingType: "sale", price: 520000, area: 2600, bedrooms: 4, bathrooms: 3, city: "Austin", project: undefined, agent: agentOne },
    { title: "Townhouse in Riverside", propertyType: "house", listingType: "rent", price: 2400, area: 1900, bedrooms: 3, bathrooms: 2, city: "Denver", project: undefined, agent: agentTwo },
    { title: "Residential Plot in Maple Grove", propertyType: "plot", listingType: "sale", price: 150000, area: 6000, bedrooms: undefined, bathrooms: undefined, city: "Austin", project: undefined, agent: agentOne },
    { title: "Warehouse in Industrial Loop", propertyType: "warehouse", listingType: "rent", price: 5600, area: 12000, bedrooms: undefined, bathrooms: 1, city: "Denver", project: undefined, agent: agentTwo },
    { title: "2-Bed Condo in Lakeview Terrace", propertyType: "apartment", listingType: "sale", price: 245000, area: 1050, bedrooms: 2, bathrooms: 2, city: "Austin", project: undefined, agent: agentTwo },
  ];

  const properties = await Property.create(
    propertyDefs.map((def, index) => ({
      propertyId: `PR-${1001 + index}`,
      title: def.title,
      description: `${def.title}. Well maintained and ready for viewing.`,
      propertyType: def.propertyType,
      listingType: def.listingType,
      status: index < 2 ? "reserved" : "available",
      price: def.price,
      area: def.area,
      areaUnit: "sqft",
      bedrooms: def.bedrooms,
      bathrooms: def.bathrooms,
      city: def.city,
      address: `${100 + index} Main Street`,
      amenities: [],
      images: [],
      assignedAgent: def.agent._id,
      project: def.project,
    }))
  );

  console.log(`Created ${properties.length} properties`);

  const customerDefs = [
    { firstName: "Michael", lastName: "Turner", type: "buyer", purpose: "living", agent: agentOne },
    { firstName: "Laura", lastName: "Bennett", type: "investor", purpose: "investment", agent: agentTwo },
    { firstName: "James", lastName: "Okafor", type: "tenant", purpose: "living", agent: agentOne },
    { firstName: "Sophia", lastName: "Martinez", type: "seller", purpose: "investment", agent: agentTwo },
    { firstName: "Ethan", lastName: "Walsh", type: "landlord", purpose: "investment", agent: agentOne },
  ];

  const customers = await Customer.create(
    customerDefs.map((def, index) => ({
      firstName: def.firstName,
      lastName: def.lastName,
      email: `${def.firstName.toLowerCase()}.${def.lastName.toLowerCase()}@example.test`,
      phone: `+1-555-02${String(index).padStart(2, "0")}`,
      type: def.type,
      purpose: def.purpose,
      budgetMin: 150000,
      budgetMax: 450000,
      preferredLocations: ["Austin", "Denver"],
      preferredPropertyTypes: ["apartment", "house"],
      bedrooms: 2,
      assignedAgent: def.agent._id,
    }))
  );

  console.log(`Created ${customers.length} customers`);

  const leadDefs = [
    { firstName: "Olivia", lastName: "Chen", status: "new", priority: "hot", source: "website", agent: agentOne },
    { firstName: "Noah", lastName: "Garcia", status: "contacted", priority: "warm", source: "referral", agent: agentTwo },
    { firstName: "Emma", lastName: "Davis", status: "site_visit", priority: "hot", source: "walk_in", agent: agentOne },
    { firstName: "Liam", lastName: "Robinson", status: "negotiation", priority: "warm", source: "social_media", agent: agentTwo },
    { firstName: "Ava", lastName: "Patel", status: "follow_up", priority: "cold", source: "portal", agent: agentOne },
  ];

  const leads = await Lead.create(
    leadDefs.map((def, index) => ({
      firstName: def.firstName,
      lastName: def.lastName,
      email: `${def.firstName.toLowerCase()}.${def.lastName.toLowerCase()}@example.test`,
      phone: `+1-555-03${String(index).padStart(2, "0")}`,
      source: def.source,
      status: def.status,
      priority: def.priority,
      assignedTo: def.agent._id,
      interestedPropertyTypes: ["apartment", "house"],
      preferredLocations: ["Austin", "Denver"],
      budgetMin: 180000,
      budgetMax: 400000,
      tags: ["newsletter"],
    }))
  );

  console.log(`Created ${leads.length} leads`);

  const followUps = await FollowUp.create([
    {
      lead: leads[0]._id,
      assignedTo: agentOne._id,
      type: "call",
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      status: "pending",
      notes: "Discuss budget and shortlist Skyline Residences units.",
    },
    {
      customer: customers[1]._id,
      assignedTo: agentTwo._id,
      type: "whatsapp",
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 48),
      status: "pending",
      notes: "Send updated brochure for Greenview Business Park.",
    },
    {
      lead: leads[2]._id,
      assignedTo: agentOne._id,
      type: "site_visit",
      scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      status: "completed",
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
      notes: "Visited the 3-bed apartment, client was interested.",
    },
  ]);

  console.log(`Created ${followUps.length} follow-ups`);

  const siteVisits = await SiteVisit.create([
    {
      lead: leads[2]._id,
      property: properties[1]._id,
      agent: agentOne._id,
      scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
      status: "completed",
      feedback: "Client liked the layout and view, considering an offer.",
    },
    {
      customer: customers[0]._id,
      property: properties[5]._id,
      agent: agentOne._id,
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 72),
      status: "scheduled",
      notes: "Second viewing requested with spouse.",
    },
  ]);

  console.log(`Created ${siteVisits.length} site visits`);

  const deals = await Deal.create([
    {
      dealNumber: "DEAL-1001",
      customer: customers[0]._id,
      property: properties[5]._id,
      agent: agentOne._id,
      stage: "negotiation",
      dealAmount: 520000,
      commissionPercentage: 2.5,
      commissionAmount: 13000,
      notes: "Buyer negotiating final price after inspection.",
    },
    {
      dealNumber: "DEAL-1002",
      customer: customers[1]._id,
      property: properties[4]._id,
      agent: agentTwo._id,
      stage: "closed",
      dealAmount: 410000,
      commissionPercentage: 2,
      commissionAmount: 8200,
      closedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      notes: "Investor purchase for the retail unit, deal closed.",
    },
  ]);

  console.log(`Created ${deals.length} deals`);

  console.log("\nSeed complete.");
  console.log("Login (once auth is implemented):");
  console.log("  admin@estatecrm.test / Password123!");
  console.log("  daniel.kim@estatecrm.test / Password123!");
  console.log("  priya.nair@estatecrm.test / Password123!");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
