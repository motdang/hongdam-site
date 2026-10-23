// Written by tools/build_shop.py from data/shop.json; changes go there.
export const CARDS = {
 "call": {
  "act": "buy",
  "en": "Phone call in Thai",
  "opts": [
   {
    "id": "call",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 20
   }
  ]
 },
 "trades": {
  "act": "buy",
  "en": "Plumber, electrician, air-con: booked",
  "opts": [
   {
    "id": "trades",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 10
   }
  ]
 },
 "there": {
  "act": "buy",
  "en": "Someone at your place",
  "opts": [
   {
    "id": "there",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 8
   }
  ]
 },
 "errand": {
  "act": "buy",
  "en": "Errand",
  "opts": [
   {
    "id": "errand",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 8
   }
  ]
 },
 "form": {
  "act": "buy",
  "en": "Thai form filled",
  "opts": [
   {
    "id": "form",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 10
   }
  ]
 },
 "dispute": {
  "act": "buy",
  "en": "Haggling buddy",
  "opts": [
   {
    "id": "dispute",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "thai-plan": {
  "act": "buy",
  "en": "A plan for a hard Thai question",
  "opts": [
   {
    "id": "thai-plan",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "legalise": {
  "act": "buy",
  "en": "Document legalised",
  "opts": [
   {
    "id": "legalise",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 20
   }
  ]
 },
 "idme": {
  "act": "buy",
  "en": "ID.me, VA or SSA sign-in help",
  "opts": [
   {
    "id": "idme",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "homehelp": {
  "act": "link",
  "en": "Maid or nanny contract"
 },
 "doctor": {
  "act": "link",
  "en": "Doctor or dentist visit"
 },
 "translate": {
  "act": "buy",
  "en": "Document translation",
  "opts": [
   {
    "id": "lang-new",
    "price": {
     "tier": [
      1500,
      5,
      500
     ]
    },
    "unit": true,
    "max": 200
   },
   {
    "id": "lang-check",
    "price": {
     "tier": [
      500,
      5,
      150
     ]
    },
    "unit": true,
    "max": 200
   }
  ],
  "add": {
   "id": "lang-stamp",
   "fixed": 100
  }
 },
 "interp": {
  "act": "buy",
  "en": "Interpreter",
  "opts": [
   {
    "id": "interp-phone",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 16
   },
   {
    "id": "interp-person",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "interp-day",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "lang-pages": {
  "act": "buy",
  "en": "Website translation checked",
  "opts": [
   {
    "id": "lang-pages",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 50
   }
  ]
 },
 "lang-shan": {
  "act": "buy",
  "en": "Shan translation",
  "opts": [
   {
    "id": "lang-shan",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 50
   }
  ]
 },
 "lang-leaves": {
  "act": "buy",
  "en": "Lanna palm-leaf manuscript read",
  "opts": [
   {
    "id": "lang-leaves",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 100
   }
  ]
 },
 "romanise": {
  "act": "buy",
  "en": "Thai names in English letters",
  "opts": [
   {
    "id": "romanise",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 100
   }
  ]
 },
 "grab": {
  "act": "buy",
  "en": "Grab, LINE MAN or ShopeeFood for your shop",
  "opts": [
   {
    "id": "grab-start",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "lineman-start",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 2
   },
   {
    "id": "grab-menu",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "grab-care",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 12
   }
  ]
 },
 "restaurant-desk": {
  "act": "buy",
  "en": "Restaurant desk",
  "opts": [
   {
    "id": "restaurant-desk",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 12
   }
  ]
 },
 "ordering": {
  "act": "buy",
  "en": "Online ordering for your café",
  "opts": [
   {
    "id": "ordering",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "signs": {
  "act": "buy",
  "en": "Signs and menus translated",
  "opts": [
   {
    "id": "signs",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 50
   }
  ]
 },
 "print": {
  "act": "buy",
  "en": "Signs and QR stands to print",
  "opts": [
   {
    "id": "print",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 20
   }
  ]
 },
 "trade-photos": {
  "act": "buy",
  "en": "Product photos",
  "opts": [
   {
    "id": "trade-photos",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 100
   }
  ]
 },
 "paybox": {
  "act": "buy",
  "en": "Take PromptPay payments",
  "opts": [
   {
    "id": "paybox",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "online-shop": {
  "act": "buy",
  "en": "Online shop",
  "opts": [
   {
    "id": "online-shop",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "etsy": {
  "act": "buy",
  "en": "Etsy or eBay shop",
  "opts": [
   {
    "id": "etsy-open",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "etsy-run",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 12
   }
  ]
 },
 "ownpage": {
  "act": "open",
  "en": "Free shop page on Mot Dang"
 },
 "fb-care": {
  "act": "buy",
  "en": "Facebook page care",
  "opts": [
   {
    "id": "fb-care",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 12
   }
  ]
 },
 "ads-run": {
  "act": "buy",
  "en": "Ads run for you",
  "opts": [
   {
    "id": "ads-run",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 12
   }
  ]
 },
 "stay-booking": {
  "act": "buy",
  "en": "Booking website for your hotel",
  "opts": [
   {
    "id": "stay-booking",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "stay-booking-run",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 12
   }
  ]
 },
 "hotelpage": {
  "act": "open",
  "en": "Hotel page on Mot Dang"
 },
 "stay-rent": {
  "act": "buy",
  "en": "A place to rent, found",
  "opts": [
   {
    "id": "stay-rent",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "stay-check": {
  "act": "buy",
  "en": "House or land checked before you buy",
  "opts": [
   {
    "id": "stay-check",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "listing": {
  "act": "open",
  "en": "List your home or business"
 },
 "trip-plan": {
  "act": "buy",
  "en": "Trip plan, booked for you",
  "opts": [
   {
    "id": "trip-plan",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "event-page": {
  "act": "buy",
  "en": "Event page with tickets",
  "opts": [
   {
    "id": "event-page",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "tribute": {
  "act": "buy",
  "en": "Page for a wedding, ordination or memorial",
  "opts": [
   {
    "id": "tribute",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "keepsake",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "spirit-house": {
  "act": "buy",
  "en": "Spirit house set up",
  "opts": [
   {
    "id": "spirit-house",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "giving": {
  "act": "buy",
  "en": "Giving page for your charity",
  "opts": [
   {
    "id": "giving-desk",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "giving-run",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 12
   }
  ]
 },
 "grants": {
  "act": "buy",
  "en": "Grants and major gifts",
  "opts": [
   {
    "id": "grant",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "gifts-ready",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "findable": {
  "act": "buy",
  "en": "Collection findable online",
  "opts": [
   {
    "id": "findable",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 20
   }
  ]
 },
 "map-archive": {
  "act": "buy",
  "en": "Map of your projects or places",
  "opts": [
   {
    "id": "map-archive",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "line-memory": {
  "act": "buy",
  "en": "Memory desk for your LINE group",
  "opts": [
   {
    "id": "line-memory",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "checkin": {
  "act": "buy",
  "en": "Volunteer sign-up and check-in",
  "opts": [
   {
    "id": "checkin",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "event-kit": {
  "act": "buy",
  "en": "Charity event kit",
  "opts": [
   {
    "id": "event-kit",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "photo-proof": {
  "act": "buy",
  "en": "Photo proof from the field",
  "opts": [
   {
    "id": "photo-proof",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "teamboard": {
  "act": "ask",
  "en": "Team task board"
 },
 "site": {
  "act": "buy",
  "en": "Website",
  "opts": [
   {
    "id": "web-minisite",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "web-site",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "vibe": {
  "act": "buy",
  "en": "Finish my vibe code",
  "opts": [
   {
    "id": "vibe-check",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "vibe-finish",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "vibe-hours",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 40
   }
  ]
 },
 "web-line": {
  "act": "buy",
  "en": "LINE shop or booking app",
  "opts": [
   {
    "id": "web-line",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "app": {
  "act": "buy",
  "en": "Phone app",
  "opts": [
   {
    "id": "web-pwa",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "android",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "sheet-app",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "web-search": {
  "act": "buy",
  "en": "Search box for your site",
  "opts": [
   {
    "id": "web-search",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "web-found": {
  "act": "buy",
  "en": "Google and AI set-up",
  "opts": [
   {
    "id": "web-found",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "web-sharecard": {
  "act": "buy",
  "en": "Link preview picture",
  "opts": [
   {
    "id": "web-sharecard",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 20
   }
  ]
 },
 "web-mail": {
  "act": "buy",
  "en": "Email at your own name",
  "opts": [
   {
    "id": "web-mail",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "web-workspace",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "web-move": {
  "act": "buy",
  "en": "Move to new hosting",
  "opts": [
   {
    "id": "web-move",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "accessible": {
  "act": "buy",
  "en": "Easier to read",
  "opts": [
   {
    "id": "accessible",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "directory": {
  "act": "buy",
  "en": "Directory of your field",
  "opts": [
   {
    "id": "directory",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "directory-run",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "guide-site": {
  "act": "buy",
  "en": "Guide site for your town or hotel",
  "opts": [
   {
    "id": "guide-site",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "wp-api": {
  "act": "buy",
  "en": "Let partners and AI read your WordPress",
  "opts": [
   {
    "id": "wp-api",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "web-license": {
  "act": "buy",
  "en": "Our site, for your city",
  "opts": [
   {
    "id": "web-license",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "github": {
  "act": "book",
  "en": "GitHub profile"
 },
 "web-care": {
  "act": "buy",
  "en": "Website care",
  "opts": [
   {
    "id": "web-care",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 12
   }
  ]
 },
 "php": {
  "act": "book",
  "en": "Fix PHP or WordPress"
 },
 "sec-mail": {
  "act": "buy",
  "en": "Stop fake emails in your name",
  "opts": [
   {
    "id": "sec-mail",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "mirror": {
  "act": "buy",
  "en": "Standby copy of your site",
  "opts": [
   {
    "id": "mirror",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "app-test": {
  "act": "buy",
  "en": "App tested on Thai phones",
  "opts": [
   {
    "id": "app-test",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "redteam": {
  "act": "buy",
  "en": "Chatbot attack test",
  "opts": [
   {
    "id": "sec-redteam",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "redteam-free": {
  "act": "open",
  "en": "Test your chatbot yourself"
 },
 "sec-hacked": {
  "act": "buy",
  "en": "Hacked site cleanup",
  "opts": [
   {
    "id": "sec-hacked",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 5
   }
  ]
 },
 "ai-own": {
  "act": "buy",
  "en": "Your own AI website builder",
  "opts": [
   {
    "id": "ai-own",
    "price": {
     "fixed": 25000
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "ai-own-usd",
    "price": {
     "usd": 25000
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "ai-assistant": {
  "act": "buy",
  "en": "AI assistant under your name",
  "opts": [
   {
    "id": "ai-whitelabel",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "ai-monthly",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 12
   }
  ]
 },
 "ai-line": {
  "act": "buy",
  "en": "One LINE for many shops",
  "opts": [
   {
    "id": "ai-line",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "bots": {
  "act": "book",
  "en": "Bots that find work or news"
 },
 "crew": {
  "act": "book",
  "en": "A crew day on a hard problem"
 },
 "ai-batch": {
  "act": "buy",
  "en": "Clean or sort a big file with AI",
  "opts": [
   {
    "id": "ai-batch",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "crawl-pay": {
  "act": "buy",
  "en": "Charge AI crawlers",
  "opts": [
   {
    "id": "crawl-pay",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "demand-prices": {
  "act": "buy",
  "en": "Prices that follow demand",
  "opts": [
   {
    "id": "demand-prices",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "ai-automation": {
  "act": "buy",
  "en": "Automation",
  "opts": [
   {
    "id": "ai-automation",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 10
   }
  ]
 },
 "leads": {
  "act": "buy",
  "en": "Customer list",
  "opts": [
   {
    "id": "data-leads",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 50
   },
   {
    "id": "event-lists",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 20
   },
   {
    "id": "sec-msp",
    "price": {
     "usd": 2
    },
    "unit": true,
    "max": 2000
   }
  ]
 },
 "data-crawl": {
  "act": "buy",
  "en": "Data collector",
  "opts": [
   {
    "id": "data-crawl",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "research": {
  "act": "buy",
  "en": "A question researched",
  "opts": [
   {
    "id": "data-research",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 20
   }
  ]
 },
 "price-watch": {
  "act": "buy",
  "en": "Price watch",
  "opts": [
   {
    "id": "data-prices",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 12
   }
  ]
 },
 "traffic": {
  "act": "buy",
  "en": "Visitor count: people and bots",
  "opts": [
   {
    "id": "data-traffic",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 12
   }
  ]
 },
 "street-survey": {
  "act": "buy",
  "en": "Street photo survey",
  "opts": [
   {
    "id": "street-survey",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "places-data": {
  "act": "ask",
  "en": "Thai places data"
 },
 "graphics": {
  "act": "buy",
  "en": "Logo and brand look",
  "opts": [
   {
    "id": "media-graphics",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "video": {
  "act": "buy",
  "en": "Short video",
  "opts": [
   {
    "id": "media-reels",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 20
   }
  ]
 },
 "drawn": {
  "act": "buy",
  "en": "Drawn map or picture",
  "opts": [
   {
    "id": "media-doodles",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "venue-map",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "interactive": {
  "act": "buy",
  "en": "Interactive page or game",
  "opts": [
   {
    "id": "media-animation",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "explainer",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "game",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "decks": {
  "act": "buy",
  "en": "Pitch slides",
  "opts": [
   {
    "id": "media-decks",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "patterns": {
  "act": "buy",
  "en": "Lanna pattern files",
  "opts": [
   {
    "id": "patterns",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "article": {
  "act": "buy",
  "en": "Article",
  "opts": [
   {
    "id": "words-articles",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "copy": {
  "act": "buy",
  "en": "Words for your website",
  "opts": [
   {
    "id": "words-copy",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "newsletter": {
  "act": "buy",
  "en": "Newsletter",
  "opts": [
   {
    "id": "words-newsletter",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 12
   }
  ]
 },
 "social": {
  "act": "buy",
  "en": "Social media posts",
  "opts": [
   {
    "id": "words-social",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 60
   }
  ]
 },
 "proposal": {
  "act": "buy",
  "en": "Proposal or business plan",
  "opts": [
   {
    "id": "words-proposals",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "words-plan",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "awards": {
  "act": "buy",
  "en": "Award entry",
  "opts": [
   {
    "id": "sec-awards",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "move": {
  "act": "buy",
  "en": "Moving house abroad",
  "opts": [
   {
    "id": "move-house",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "move-room",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "move-boxes",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "luggage": {
  "act": "buy",
  "en": "Luggage or scooter sent",
  "opts": [
   {
    "id": "luggage",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "partner": {
  "act": "buy",
  "en": "Become a shipping partner",
  "opts": [
   {
    "id": "trade-setup",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "partner-prices": {
  "act": "list",
  "en": "Partner prices"
 },
 "merchant": {
  "act": "buy",
  "en": "Unfuck my merchant services",
  "opts": [
   {
    "id": "merchant-check",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "merchant-fix",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "books": {
  "act": "buy",
  "en": "Bookkeeping in Thai and English",
  "opts": [
   {
    "id": "co-books",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 12
   }
  ]
 },
 "payouts": {
  "act": "buy",
  "en": "Team pay day",
  "opts": [
   {
    "id": "money-payouts",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 12
   }
  ]
 },
 "invoice": {
  "act": "buy",
  "en": "Invoice page for PayPal or Wise",
  "opts": [
   {
    "id": "money-invoice",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "exchange": {
  "act": "buy",
  "en": "Exchange-rate page",
  "opts": [
   {
    "id": "money-exchange",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "exchange-system": {
  "act": "ask",
  "en": "Exchange counter system"
 },
 "visas": {
  "act": "link",
  "en": "Visas, permits and companies"
 },
 "assistant": {
  "act": "buy",
  "en": "Your assistant in Thailand",
  "opts": [
   {
    "id": "assistant-10",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "assistant-20",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "cs-desk": {
  "act": "buy",
  "en": "Thai customer service desk",
  "opts": [
   {
    "id": "cs-desk",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 12
   }
  ]
 },
 "calls-out": {
  "act": "buy",
  "en": "Outbound calling",
  "opts": [
   {
    "id": "calls-out",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 20
   }
  ]
 },
 "typing": {
  "act": "buy",
  "en": "Paper forms typed up",
  "opts": [
   {
    "id": "typing",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 50
   }
  ]
 },
 "subtitles": {
  "act": "buy",
  "en": "Subtitles and transcripts",
  "opts": [
   {
    "id": "subtitles",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 30
   }
  ]
 }
}
