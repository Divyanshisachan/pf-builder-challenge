// Real Property Finder listings from the 12 Nov 2026 audit (photos hot-linked from PF's CDN).
// Only #11 and #16 have full detail pages in the prototype.
const img = (id: string) => `https://static.shared.propertyfinder.ae/media/images/listing/${id}/668x452.jpg`;

export type Card = {
  k: number; title: string; price: number; sqft: number; loc: string; imgs: string[]; imgCount: number;
  agent: string; broker: string; brokerLogo: string; listed: string; avail: string; amen: string[];
  dtcm: string; desc?: string; detail?: boolean; tag?: string;
};

export const CARDS: Card[] = [
  { k: 11, detail: true, title: "Studio | Special Offer | Bills Included", price: 7500, sqft: 407, loc: "Bayz by Danube, Business Bay, Dubai",
    imgs: ["52NKYF0RSM50GRT64PVJZ3TJMC/f7c62e4b-79c7-4475-9117-5638da474e87","52NKYF0RSM50GRT64PVJZ3TJMC/3ce536f0-fde2-4ef5-9cb7-1f5e08849a50","52NKYF0RSM50GRT64PVJZ3TJMC/79fb23af-5b15-4806-acff-7978c0eb5efe","52NKYF0RSM50GRT64PVJZ3TJMC/c871826d-18dc-4c98-98a3-4488827c61d8","52NKYF0RSM50GRT64PVJZ3TJMC/4502336e-1db2-47c1-bf9b-7b01e5fe8280","52NKYF0RSM50GRT64PVJZ3TJMC/d7194084-b451-42fe-b60e-c029a6431675","52NKYF0RSM50GRT64PVJZ3TJMC/32c09fa8-6864-4fca-a396-d67b15a6b6c9","52NKYF0RSM50GRT64PVJZ3TJMC/72717eaa-5ea9-4e1e-883c-6eb18003c59f"].map(img),
    imgCount: 17, agent: "Hanif Admin", broker: "Superhost Vacation Homes Rental", brokerLogo: "https://static.shared.propertyfinder.ae/media/images/client_logos/10297/ac3c5551-90ac-4114-b6e9-c825fc04afe2/260x200.jpg",
    listed: "6 days ago", avail: "5 Nov 2026", dtcm: "BUS-BAY-FLVXT", tag: "Upgraded",
    amen: ["Balcony","Built in Wardrobes","Central A/C","Covered Parking","Kitchen Appliances","Shared Pool","Security","Concierge","Shared Gym","Lobby in Building"],
    desc: `THIS PRICE IS ONLY VALID FOR CURRENT MONTH

3 Month - 9000 per month
6 Months - 8000 per month

Additional Fees:
****Dubai Tourism Fee
****Security Deposit
****5% VAT
****Please note that prices may vary based on the season and availability.

Experience comfort, style, and convenience in this modern studio apartment at Bayz by Danube, Business Bay. Thoughtfully designed for both business and leisure travellers, this stylish space offers a comfortable stay, beautiful city views, and access to premium building amenities.

Enjoy views of the Business Bay Canal and Al Khail Road from your private balcony, or head up to the rooftop pool for breathtaking views of the iconic Burj Khalifa.

Fully Equipped Kitchen: Modern appliances and essential kitchen amenities for convenient home cooking.
Entertainment & Connectivity: Flat-screen TV and high-speed Wi-Fi.

Building Amenities: rooftop swimming pool, fully equipped gym, open-air cinema, shared steam room, sauna and jacuzzi, covered parking, 24/7 concierge.` },
  { k: 16, detail: true, title: "Modern interiors | Prime Dubai Marina location", price: 7649, sqft: 460, loc: "Yacht Bay, Dubai Marina, Dubai",
    imgs: ["QV4TN23RFZV3SK26AXCSZ6412R/0a38b955-516a-4171-8ee8-9fa68cbc2c41","QV4TN23RFZV3SK26AXCSZ6412R/f399f32d-c72b-4ffa-926c-c1cd40fb93ca","QV4TN23RFZV3SK26AXCSZ6412R/0a0ad486-f5d1-4579-a86d-e2250e5e87d3","QV4TN23RFZV3SK26AXCSZ6412R/0e76dfc6-2045-4598-9947-223574bab913","QV4TN23RFZV3SK26AXCSZ6412R/afbd012e-2d2d-451b-a260-ad8ebcd6e2b2","QV4TN23RFZV3SK26AXCSZ6412R/042745d6-1003-46d9-8bd6-82dafc0aa37a","QV4TN23RFZV3SK26AXCSZ6412R/c0d1a3e4-e1de-4b4b-8fc9-9b91dbed49ba","QV4TN23RFZV3SK26AXCSZ6412R/308130cf-953b-4859-91b7-e2ce54b9eb01"].map(img),
    imgCount: 21, agent: "Artem Babinov", broker: "Colife Vacation Homes LLC", brokerLogo: "https://static.shared.propertyfinder.ae/media/images/client_logos/5899/d436b408-6975-45d0-b5dd-8f0058002de2/260x200.jpg",
    listed: "6 days ago", avail: "7 Nov 2026", dtcm: "DUB-YAC-QZL25",
    amen: ["Central A/C","Balcony","Shared Pool","Built in Wardrobes","Kitchen Appliances","Shared Gym","Lobby in Building","Children's Play Area"],
    desc: `The price is discounted for long-term rentals. Check the current price for the period of interest with the manager

460 sq ft, 5 floor
Modern interiors | Prime Dubai Marina location

All included!
• DEWA, chiller, Wi-Fi
• Maintenance
• Tenant support
*bills included if rented for less then a year

Apartment is fully-furnished!
• Studio • Living & dining area • Kitchen • Bathroom

Building Amenities:
• Swimming pool & sun deck • Fully equipped gym • Community lounge • 24/7 security & concierge • Covered parking

Community & Nearby (Dubai Marina):
• Dubai Marina Mall – 5 min walk
• JBR Beach – 10 min walk
• Marina Metro Station – 5 min walk
• Mall of the Emirates – 20 min drive
• Dubai International Airport (DXB) – 30 min` },
  { k: 9, title: "Discounted Missoni Lux Studio in Business Bay", price: 7500, sqft: 420, loc: "Urban Oasis, Business Bay, Dubai",
    imgs: ["H8TTQPRDHPWNJ8HZJNQGRWJVY8/02b51283-77e3-402f-82e1-37007c5baf00"].map(img), imgCount: 30, agent: "Sharon Pingol", broker: "HomesGetaway", brokerLogo: "", listed: "16 days ago", avail: "10 Nov 2026", dtcm: "BUS-URB-JK0AV", amen: [] },
  { k: 14, title: "Flexible Terms | Partial Dubai Water Canal View", price: 7000, sqft: 482, loc: "Executive Bay A, Executive Bay, Business Bay, Dubai",
    imgs: ["01K1ZJ5QTAY2YQS17QP5731BTP/b46c145c-7672-4cd9-b184-b65ef92dc2bd"].map(img), imgCount: 12, agent: "Jannel Calma", broker: "Stonetree Vacation Homes", brokerLogo: "", listed: "16 months ago", avail: "19 Oct 2026", dtcm: "BUS-EXE-D4AZ9", amen: [] },
  { k: 2, title: "Luxury Furnished Studio Canal View Bills Inclusive", price: 6000, sqft: 415, loc: "Damac Maison Prive A, Business Bay, Dubai",
    imgs: ["78T5STSS2TR0K1JNS396Y63YC0/39b45140-0253-4e59-b59c-4888e9191bf6"].map(img), imgCount: 13, agent: "Nandhini Surendar", broker: "Quick Stay Holiday Homes", brokerLogo: "", listed: "8 months ago", avail: "10 Jul 2025", dtcm: "BUS-DAM-WFLLK", amen: [] },
  { k: 20, title: "Modern interiors | Prime Business Bay location", price: 7829, sqft: 686, loc: "J ONE Tower A, Business Bay, Dubai",
    imgs: ["TCMWTBSAGMQ9XD74PMSTMWHR2R/77e87494-105b-44d6-92fe-45f86910969f"].map(img), imgCount: 16, agent: "Artem Babinov", broker: "Colife Vacation Homes LLC", brokerLogo: "", listed: "6 days ago", avail: "9 Nov 2026", dtcm: "BUS-JO-YLGPB", amen: [] },
  { k: 17, title: "High floor | Marina lifestyle | Bright layout", price: 7699, sqft: 460, loc: "Yacht Bay, Dubai Marina, Dubai",
    imgs: ["CTDXJCB44TQJ3FH2M69SQ39SJM/c8ba575b-3d29-4902-9bb9-c5c2d61bf42f"].map(img), imgCount: 14, agent: "Andrei Shchuko", broker: "Colife Vacation Homes LLC", brokerLogo: "", listed: "6 days ago", avail: "30 Nov 2026", dtcm: "DUB-YAC-OPYTU", amen: [] },
  { k: 15, title: "Fully furnished Studio Close to Tram and metro", price: 7000, sqft: 385, loc: "Marina Diamond 1, Dubai Marina, Dubai",
    imgs: ["Q3MENFART307DYNMDJR95PH8RR/2a514570-2bac-403f-a29e-59fa46f92d7d"].map(img), imgCount: 25, agent: "Senthil Raj Subramaniam", broker: "Druvya Holiday Homes", brokerLogo: "", listed: "2 months ago", avail: "20 Sep 2026", dtcm: "1114281", amen: [] },
];

// Earlier saves (pre-seeded so the wishlist shows Scout across trusted / check / removed)
export const PRESAVED = Array.from({ length: 32 }, (_, i) => i + 1).filter((k) => k !== 11 && k !== 16); // 30 earlier saves; the demo saves #11 and #16

// Mocked agent replies, grounded in what each listing's own description says (prototype only).
export const MOCK_REPLY: Record<number, string> = {
  11: "Hi! For 3 months it's AED 9,000/month + 5% VAT + tourism fee. The 7,500 is only for this month. Deposit AED 2,000.",
  16: "Hello! Yes, available from 1 Dec. For 3 months we can do AED 7,500/month all-in (DEWA, chiller, Wi-Fi included). VAT is included. Here's a live video of the unit, 5th floor.",
  9: "Hi, available. 7,500 + 5% VAT + 7% service charge + AED 10/night tourism fee for the first 30 nights, plus AED 200 cleaning.",
  14: "Sorry, the 7,000 rate was last year. Current 3-month package is AED 7,800/month + VAT. Unit is available from 1 Dec.",
  2: "Hi ma'am, this unit just got booked. I have another similar studio in the same building for 6,800, shall I send pictures?",
};
