import type { Listing, Photo, PhotoCategory } from './types';

const IMG = '/assets/images';

/**
 * Photo tour categories in display order. `files` are the source images; ids and
 * alt text are derived below so the tour, hero grid and lightbox all address the
 * same photo objects.
 */
const CATEGORY_SOURCE: {
  name: string;
  amenities: string[];
  files: string[];
}[] = [
  {
    name: 'Living room 1',
    amenities: ['Sofa', 'Air conditioning', 'Ceiling fan', 'TV'],
    files: [
      'a9831aeb-f441-44f5-a38f-4cf54e3f0fcf',
      'a45feaa2-b607-4092-83ac-5fd4b2894959',
      'f1da1c3d-0d10-481e-9b63-c71f9073f30b',
    ],
  },
  {
    name: 'Living room 2',
    amenities: ['Ceiling fan', 'Hot tub'],
    files: [
      '090d8b0b-b539-42c0-84f8-e1fb0cdf9a93',
      '9be71047-fc52-438a-9270-75cb470f6752',
      'f6de1663-4e9c-4414-b63b-29a154a92ee1',
      '2367476f-11c4-4a14-a7c6-267be62c1d59',
      '34529829-a971-44d3-ac2f-90ea3678a34d',
      '153aa732-4935-48b8-a6fe-b469b6af5efc',
      '3c6e6809-1bb1-47a6-8e24-aff593e1c28f',
    ],
  },
  {
    name: 'Full kitchen',
    amenities: [
      'Freezer', 'Fridge', 'Blender', 'Cooker', 'Cooking basics', 'Kettle',
      'Microwave', 'Toaster', 'Wine glasses', 'Coffee', 'Crockery and cutlery',
    ],
    files: [
      '56c44812-52c0-4481-90d8-101ec1f34c7a',
      'ddc853d7-e658-405c-bedc-8f31106c447e',
    ],
  },
  {
    name: 'Bedroom',
    amenities: [
      'Double bed', 'Air conditioning', 'Bed linen', 'Ceiling fan',
      'Clothes storage', 'Cot', 'Hangers', 'Iron', 'Room-darkening blinds',
      'Cleaning available during stay', 'Cleaning products',
      'Long-term stays allowed', 'Private entrance', 'Wifi',
    ],
    files: [
      '67c61c6f-6260-4809-9510-0360e58a345d',
      '1c827136-4a85-4fe0-8e69-3fd8ea19bb17',
      '0622ab42-b851-4d55-9d9f-df3143bc5909',
      'a74e3c0b-3188-4442-9146-1cd4d6ea45df',
      '48a8ffbc-fbf7-4f84-bc29-ee400da3f08b',
      '3cf31697-f3f3-4c60-82c4-029acb119ae4',
    ],
  },
  {
    name: 'Full bathroom',
    amenities: ['Hairdryer', 'Hot water', 'Shampoo', 'Shower gel'],
    files: ['97c78f8a-5090-4663-aebc-ba4e13b47092'],
  },
  {
    name: 'Gym',
    amenities: ['Air conditioning', 'Gym', 'Exercise equipment', 'Ceiling fan'],
    files: [
      '9aa8e65f-94ac-4ba0-9a10-9ec91e536d22',
      '246bd88d-4dd6-4117-a401-02a36ebfcf16',
      '4fede77d-7a71-446f-89e3-263af937f3fa',
      '79f59adb-5a5f-4d6c-8109-1f01f4ca0d03',
      'f19d8c0a-1d88-42a4-9218-686d4f0db7e4',
    ],
  },
  {
    name: 'Exterior',
    amenities: [],
    files: [
      '23ea6621-6f74-4baa-acea-2fd03e312b41',
      '5adfdf3e-d497-4efc-ab8c-fc559dab311e',
      '608748cd-6ee7-4a71-88a2-ba79d3ddba5a',
      '5b856fde-a393-41bf-b373-c9d02e64221f',
      'c904e1ab-a39d-4ef0-bdea-8c0bd16b9e3d',
      '42befad7-fb29-473d-91db-b03e7a544d1d',
    ],
  },
  {
    name: 'Pool',
    amenities: ['Pool'],
    files: [
      'fc02f48f-a937-42c5-895d-f9cc3113d6ca',
      '929545d3-e241-46c0-8a70-c24531ce7b54',
      '8eb65a8b-e795-4870-b141-6f63b1be24ae',
    ],
  },
  {
    name: 'Additional photos',
    amenities: [],
    files: [
      '70325367-cbae-4993-b560-18cd3f6edd53',
      'cc7a56bd-242c-498a-9aef-0cffac619e54',
      '30ad93b2-293f-494d-b645-626303c6cb93',
      '9642a60d-e9de-4e1a-89c2-9ebd230f4a74',
      'b6599f26-d65c-4df0-baf2-ef18c82a86a3',
      'dc01fd46-b119-48d3-a43b-f6c093e26eca',
      'fe37b80e-da8a-4225-b27b-dfbb5d763c01',
      '3c90338e-86b4-423f-aae1-279e0ccc3a18',
      '862d936c-0f34-4e50-af87-b519e2781d19',
      '79addceb-8c2d-419b-80ff-e29af426a94c',
    ],
  },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const categories: PhotoCategory[] = CATEGORY_SOURCE.map((c) => {
  const photos: Photo[] = c.files.map((file, i) => ({
    id: file,
    src: `${IMG}/${file}.jpeg`,
    alt: c.files.length > 1 ? `${c.name}, photo ${i + 1} of ${c.files.length}` : c.name,
    category: c.name,
  }));
  return {
    id: slug(c.name),
    name: c.name,
    thumb: photos[0].src,
    amenities: c.amenities,
    photos,
  };
});

/** Flat photo list in tour order — the lightbox indexes into this. */
export const photos: Photo[] = categories.flatMap((c) => c.photos);

const byId = (id: string): Photo => {
  const p = photos.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown photo id: ${id}`);
  return p;
};

/** Hero grid order differs from tour order, so it is listed explicitly. */
export const heroPhotos: Photo[] = [
  '2367476f-11c4-4a14-a7c6-267be62c1d59',
  '090d8b0b-b539-42c0-84f8-e1fb0cdf9a93',
  '9be71047-fc52-438a-9270-75cb470f6752',
  '67c61c6f-6260-4809-9510-0360e58a345d',
  'c904e1ab-a39d-4ef0-bdea-8c0bd16b9e3d',
].map(byId);

export const listing: Listing = {
  id: 'mirashya-ug10-candolim',
  title: 'Romantic Jacuzzi 1BHK Candolim | Mirashya UG10',
  documentTitle:
    'Romantic Jacuzzi 1BHK Candolim | Mirashya UG10 - Serviced apartments for Rent in Candolim, Goa, India - Airbnb',
  subtitle: 'Entire serviced apartment in Candolim, India',
  location: 'Candolim, Goa, India',
  capacity: '3 guests · 1 bedroom · 1 bed · 1 bathroom',
  rating: 4.95,
  reviewCount: 19,
  isGuestFavourite: true,
  guestFavouriteBlurb: 'One of the most loved homes on Airbnb, according to guests',

  photos,
  categories,

  highlights: [
    {
      icon: 'OutdoorEntertainment',
      title: 'Outdoor entertainment',
      body: 'The pool and alfresco dining are great for summer trips.',
    },
    {
      icon: 'StayingCool',
      title: 'Designed for staying cool',
      body: 'Beat the heat with the A/C and ceiling fan.',
    },
    {
      icon: 'SelfCheckIn',
      title: 'Self check-in',
      body: 'You can check in with the building staff.',
    },
  ],

  description:
    '🌴 Plan Your Relaxing Holiday at Amor De Goa by Mirashya Homes! ✨ Stay in this cozy 1BHK in the heart of Candolim, featuring a private jacuzzi 🛁 for the perfect unwind. Enjoy high-speed WiFi 💻, Smart TV 📺, pet-friendly comfort 🐾, and stylish interiors. Just minutes from Candolim Beach 🏖️, popular cafés, restaurants, and nightlife 🍹, it’s ideal for couples seeking romance, relaxation, and a touch of luxury in North Goa. ❤️🌴',
  translationNote: 'Some info has been automatically translated.',

  sleeping: [
    {
      image: `${IMG}/67c61c6f-6260-4809-9510-0360e58a345d.jpeg`,
      name: 'Bedroom',
      detail: '1 double bed',
    },
    {
      image: `${IMG}/a9831aeb-f441-44f5-a38f-4cf54e3f0fcf.jpeg`,
      name: 'Living room',
      detail: '1 sofa',
    },
  ],

  amenityPreview: [
    'Kitchen',
    'Wifi',
    'Dedicated workspace',
    'Free parking on premises',
    'Pool',
    'Hot tub',
    'Pets allowed',
    'Exterior security cameras on property',
    'Carbon monoxide alarm',
    'Smoke alarm',
  ],
  amenityTotal: 50,
  amenityGroups: [
    {
      name: 'Bathroom',
      items: ['Hairdryer', 'Cleaning products', 'Shampoo', 'Hot water', 'Shower gel'],
    },
    {
      name: 'Bedroom and laundry',
      items: [
        'Washing machine', 'Hangers', 'Bed linen', 'Room-darkening blinds',
        'Iron', 'Clothes storage', 'Cot',
      ],
    },
    { name: 'Entertainment', items: ['TV'] },
    { name: 'Family', items: ['Cot'] },
    { name: 'Heating and cooling', items: ['Air conditioning', 'Ceiling fan'] },
    {
      name: 'Home safety',
      items: [
        'Exterior security cameras on property',
        'Carbon monoxide alarm',
        'Smoke alarm',
      ],
    },
    { name: 'Internet and office', items: ['Wifi', 'Dedicated workspace'] },
    {
      name: 'Kitchen and dining',
      items: [
        'Kitchen', 'Fridge', 'Freezer', 'Microwave', 'Cooking basics',
        'Crockery and cutlery', 'Kettle', 'Coffee', 'Wine glasses', 'Toaster',
        'Blender', 'Cooker',
      ],
    },
    { name: 'Location features', items: ['Private entrance'] },
    { name: 'Outdoor', items: ['Patio or balcony', 'Outdoor dining area'] },
    {
      name: 'Parking and facilities',
      items: ['Free parking on premises', 'Pool', 'Hot tub', 'Gym'],
    },
    {
      name: 'Services',
      items: [
        'Pets allowed', 'Cleaning available during stay',
        'Long-term stays allowed', 'Self check-in',
      ],
    },
  ],

  ratingBreakdown: [
    { label: 'Cleanliness', value: 5.0, icon: 'Cleanliness' },
    { label: 'Accuracy', value: 5.0, icon: 'Accuracy' },
    { label: 'Check-in', value: 5.0, icon: 'CheckInRating' },
    { label: 'Communication', value: 5.0, icon: 'Communication' },
    { label: 'Location', value: 4.8, icon: 'LocationRating' },
    { label: 'Value', value: 4.8, icon: 'Value' },
  ],
  /** Share of reviews at 5,4,3,2,1 stars — drives the bar widths. */
  ratingHistogram: [95, 5, 0, 0, 0],

  reviewTags: [
    { label: 'Comfort', count: 6, image: `${IMG}/chips/comfort.png` },
    { label: 'Accuracy', count: 5, image: `${IMG}/chips/accuracy.png` },
    { label: 'Hot tub', count: 5, image: `${IMG}/chips/hot-tub.png` },
    { label: 'Condition', count: 4, image: `${IMG}/chips/condition.png` },
    { label: 'Hospitality', count: 8, image: `${IMG}/chips/hospitality.png` },
    { label: 'Cleanliness', count: 4, image: `${IMG}/chips/cleanliness.png` },
    { label: 'Amenities', count: 2, image: `${IMG}/chips/amenities.png` },
    { label: 'Decor', count: 2, image: `${IMG}/chips/decor.png` },
    { label: 'Indoor spaces', count: 2, image: `${IMG}/chips/indoor-spaces.png` },
    { label: 'Location', count: 2, image: `${IMG}/chips/location.png` },
  ],

  reviews: [
    {
      id: 'amit',
      author: 'Amit',
      avatar: null,
      tenure: '2 months on Airbnb',
      date: '1 week ago',
      body: 'Very helpful and responsive team. Safe and peaceful stay. loved everything about the property.',
      clamped: false,
    },
    {
      id: 'aheesh',
      author: 'Aheesh',
      avatar: `${IMG}/avatars/rev1.jpeg`,
      tenure: '3 years on Airbnb',
      date: '2 weeks ago',
      body: 'We had a wonderful stay. The apartment was clean, comfortable, and exactly as shown in the photos. The host was very responsive and helpful throughout our stay. We would definitely recommend this place and would love to stay here again.',
      clamped: true,
    },
    {
      id: 'samiksha',
      author: 'Samiksha',
      avatar: `${IMG}/avatars/rev2.jpeg`,
      tenure: '8 months on Airbnb',
      date: 'May 2026',
      body: 'the host nitish was really great help',
      clamped: false,
    },
    {
      id: 'vedant',
      author: 'Vedant',
      avatar: null,
      tenure: '4 years on Airbnb',
      date: 'May 2026',
      body: 'We had an amazing stay at this property in Goa! The entire home was spotless and exceptionally well-maintained, making us feel comfortable from the moment we arrived. The cleanliness standards were truly impressive, with every corner of the house looking fresh and pristine. The highlight of our stay was definitely the jacuzzi. It was clean, well-kept, and the perfect place to relax after a day of exploring Goa. It added a luxurious touch to our vacation and made our experience even more memorable. The property was exactly as described, well-equipped, and offered a peaceful atmosphere. We would highly recommend this place to anyone looking for a comfortable, clean, and relaxing stay in Goa. Looking forward to visiting again!',
      clamped: true,
    },
    {
      id: 'vaibhav',
      author: 'Vaibhav S',
      avatar: `${IMG}/avatars/rev3.jpeg`,
      tenure: '3 years on Airbnb',
      date: 'May 2026',
      body: "Great great experience living out there , can't expect more , will always look for it in the future and will recommend my friends too.",
      clamped: false,
    },
    {
      id: 'mohd',
      author: 'Mohd',
      avatar: `${IMG}/avatars/rev4.jpeg`,
      tenure: '5 years on Airbnb',
      date: 'May 2026',
      body: 'Great place. Exactly as described in the listing.',
      clamped: false,
    },
  ],

  host: {
    name: 'Mirashya Homes',
    avatar: `${IMG}/avatars/host.jpeg`,
    role: 'Host',
    reviews: 1463,
    rating: 4.68,
    yearsHosting: 2,
    facts: [
      { icon: 'BornIn', text: 'Born in the 80s' },
      { icon: 'School', text: 'Where I went to school: NICMAR GOA' },
    ],
    coHosts: [
      { name: 'Sharath', avatar: `${IMG}/avatars/co1.jpg` },
      { name: 'Aman Dev Pahwa', avatar: `${IMG}/avatars/co2.jpg` },
      { name: 'Maria Karen Priyanka', avatar: `${IMG}/avatars/co3.jpg` },
      { name: 'Simran', avatar: `${IMG}/avatars/rev5.jpeg` },
      { name: 'Pallavi', avatar: `${IMG}/avatars/rev1.jpeg` },
      { name: 'Sanyukta', avatar: `${IMG}/avatars/rev2.jpeg` },
      { name: 'Shruti', avatar: null },
      { name: 'Amisha', avatar: null },
    ],
    responseRate: 'Response rate: 100%',
    responseTime: 'Responds within an hour',
  },

  neighbourhood: {
    title: 'Neighbourhood highlights',
    body: 'Located in the heart of Candolim, Amor de Goa offers a peaceful stay with easy access to beaches, cafés, and popular attractions.',
  },

  thingsToKnow: [
    {
      title: 'Cancellation policy',
      lines: [
        'Free cancellation before 17 October. Cancel before check-in on 18 October for a partial refund.',
        'Review this host’s full policy for details.',
      ],
      linkLabel: 'Learn more',
    },
    {
      title: 'House rules',
      lines: ['Check-in after 2:00 pm', 'Checkout before 11:00 am', '3 guests maximum'],
      linkLabel: 'Learn more',
    },
    {
      title: 'Safety & property',
      lines: [
        'Carbon monoxide alarm not reported',
        'Smoke alarm not reported',
        'Exterior security cameras on property',
      ],
      linkLabel: 'Learn more',
    },
  ],

  nearby: [
    { id: 'n1', image: `${IMG}/similar/s1.jpeg`, title: 'Beautiful Studio with a view to die for', price: '₹23,600', rating: '4.91' },
    { id: 'n2', image: `${IMG}/similar/s2.jpeg`, title: 'NAQAB - 1bhk with private pool', price: '₹42,218', rating: '4.95' },
    { id: 'n3', image: `${IMG}/similar/s3.jpeg`, title: 'Greentique Luxury Flat with plunge pool, Calangute', price: '₹44,506', rating: '4.94' },
    { id: 'n4', image: `${IMG}/similar/s4.jpeg`, title: 'The Tropical Studio | 5 mins to Beach', price: '₹22,824', rating: '4.96' },
    { id: 'n5', image: `${IMG}/similar/s5.jpeg`, title: 'Luxury Casa Bella 1BHK with plunge pool, Calangute', price: '₹39,942', rating: '4.95' },
    { id: 'n6', image: `${IMG}/similar/s6.jpeg`, title: 'Kanso by Earthen Window | Jacuzzi | Terrace | Pool', price: '₹45,648', rating: '5.0' },
    { id: 'n7', image: `${IMG}/similar/s2.jpeg`, title: 'Luxury Apt | Private Pool | 6 Mins from Beach', price: '₹48,786', rating: '4.93' },
    { id: 'n8', image: `${IMG}/similar/s4.jpeg`, title: 'Serendipity Cottage - Calm Stay in Calangute-Baga.', price: '₹22,824', rating: '4.92' },
  ],

  stay: {
    total: '₹28,499',
    nights: 5,
    checkIn: '18 Oct 2026',
    checkOut: '23 Oct 2026',
    checkInISO: '10/18/2026',
    checkOutISO: '10/23/2026',
    guests: '2 guests',
    freeCancellationBefore: '17 October',
  },

  promo: {
    text: 'Get 10% off your next stay.',
    linkLabel: 'Terms apply',
    cta: 'Claim',
  },
};

export function getListing(): Listing {
  return listing;
}
