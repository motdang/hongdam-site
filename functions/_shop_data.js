// Written by tools/build_shop.py from data/shop.json; changes go there.
export const CARDS = {
 "retire": {
  "act": "buy",
  "en": "Retire in Thailand with our help",
  "opts": [
   {
    "id": "retire-setup",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "retire-month",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 12
   },
   {
    "id": "retire-hour",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 20
   }
  ]
 },
 "elder-care": {
  "act": "buy",
  "en": "Care home or caregiver",
  "opts": [
   {
    "id": "care-placement",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "caregiver-hire",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "lab-test": {
  "act": "buy",
  "en": "Lab test arranged",
  "opts": [
   {
    "id": "lab-test",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "lab-compound",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "death-help": {
  "act": "buy",
  "en": "When someone dies in Thailand",
  "opts": [
   {
    "id": "death-help",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "blood": {
  "act": "buy",
  "en": "Blood test or checkup booked",
  "opts": [
   {
    "id": "blood-basic",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "blood-full",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "accident": {
  "act": "buy",
  "en": "After an accident",
  "opts": [
   {
    "id": "accident",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "specialist": {
  "act": "buy",
  "en": "We go with you to a dentist, clinic or specialist",
  "opts": [
   {
    "id": "specialist",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "specialist-book",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "specialist-hour",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 8
   }
  ]
 },
 "care-visits": {
  "act": "buy",
  "en": "Visits to an older person",
  "opts": [
   {
    "id": "care-visit",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 8
   },
   {
    "id": "care-visits-month",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 12
   }
  ]
 },
 "clean-air": {
  "act": "buy",
  "en": "Clean air at home",
  "opts": [
   {
    "id": "clean-air",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "med-papers": {
  "act": "ask",
  "en": "Medicine papers for travel"
 },
 "doctor": {
  "act": "link",
  "en": "Doctor or dentist visit"
 },
 "visas": {
  "act": "link",
  "en": "Visas, permits and company registration"
 },
 "php": {
  "act": "book",
  "en": "Fix PHP or WordPress"
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
   },
   {
    "id": "dmarc-watch",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 12
   }
  ]
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
 "crypto-safe": {
  "act": "buy",
  "en": "Crypto safety",
  "opts": [
   {
    "id": "crypto-check",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "crypto-wallet",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "crypto-family",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "crypto-loss",
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
  "en": "Spare copy of your website",
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
 "forensics": {
  "act": "ask",
  "en": "Computer or phone examined for evidence"
 },
 "redteam-free": {
  "act": "open",
  "en": "Test your chatbot yourself"
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
 "bank-account": {
  "act": "buy",
  "en": "Thai bank account opened",
  "opts": [
   {
    "id": "bank-account",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "staff-papers": {
  "act": "buy",
  "en": "Staff contract and payslips",
  "opts": [
   {
    "id": "staff-contract",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "payslips",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 50
   }
  ]
 },
 "payouts": {
  "act": "buy",
  "en": "Monthly pay list for your team",
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
 "kh-books": {
  "act": "buy",
  "en": "Bookkeeping in Khmer and English",
  "opts": [
   {
    "id": "kh-books",
    "price": {
     "usd": 149,
     "w": "kh-books"
    },
    "unit": true,
    "max": 12
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
  "en": "System for a money-exchange shop"
 },
 "sell-motdang": {
  "act": "open",
  "en": "Earn by selling Mot Dang pages"
 },
 "paid-in-kind": {
  "act": "open",
  "en": "Pay with goods or work"
 },
 "crypto-baht": {
  "act": "link",
  "en": "Cryptocurrency to baht"
 },
 "web-mail": {
  "act": "buy",
  "en": "Email with your own web address",
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
 "accessible": {
  "act": "buy",
  "en": "Website easier to read",
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
 "web-found": {
  "act": "buy",
  "en": "Be found on Google and AI search",
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
 "web-move": {
  "act": "buy",
  "en": "Move your website to a new host",
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
 "web-license": {
  "act": "buy",
  "en": "Licence to use our website in your city",
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
 "web-care": {
  "act": "buy",
  "en": "Website maintenance",
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
 "widget": {
  "act": "buy",
  "en": "Weather, air quality or events box for your site",
  "opts": [
   {
    "id": "widget",
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
 "directory": {
  "act": "buy",
  "en": "Directory website for your trade or region",
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
 "github": {
  "act": "book",
  "en": "GitHub profile"
 },
 "help-page": {
  "act": "buy",
  "en": "Help page with a live map",
  "opts": [
   {
    "id": "help-page",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "help-page-run",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 12
   }
  ]
 },
 "tap-card": {
  "act": "buy",
  "en": "Contact card on a QR code",
  "opts": [
   {
    "id": "tap-card",
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
 "stay-rent": {
  "act": "buy",
  "en": "A place to rent, found for you",
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
 "npa-homes": {
  "act": "buy",
  "en": "Homes that banks are selling, found for you",
  "opts": [
   {
    "id": "npa-homes",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "rentals": {
  "act": "buy",
  "en": "Rentals arranged",
  "opts": [
   {
    "id": "rent-vehicle",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "rent-event",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "agency-sheet": {
  "act": "buy",
  "en": "Listing sheet for a property agency",
  "opts": [
   {
    "id": "agency-sheet",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 12
   }
  ]
 },
 "letting": {
  "act": "ask",
  "en": "Your home or condo rented out"
 },
 "hotelpage": {
  "act": "open",
  "en": "Hotel page on Mot Dang"
 },
 "listing": {
  "act": "open",
  "en": "List your home or business"
 },
 "ai-assistant": {
  "act": "buy",
  "en": "AI assistant with your name on it",
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
  "en": "One LINE account for many shops",
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
  "en": "Charge AI bots for reading your site",
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
 "ai-own": {
  "act": "buy",
  "en": "Your own AI website builder",
  "opts": [
   {
    "id": "ai-own",
    "price": {
     "fixed": 25000,
     "w": "ai-own"
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "ai-own-usd",
    "price": {
     "usd": 25000,
     "w": "ai-own",
     "part": "tail"
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
  "en": "Our team for one day, on a hard problem"
 },
 "demo-bot": {
  "act": "ask",
  "en": "A bot that presents your software on Zoom"
 },
 "move": {
  "act": "buy",
  "en": "Moving house into or out of Thailand",
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
 "awards": {
  "act": "buy",
  "en": "Cyber-security award application",
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
 "decks": {
  "act": "buy",
  "en": "Presentation slides",
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
 "interview": {
  "act": "buy",
  "en": "Recorded interview",
  "opts": [
   {
    "id": "interview",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "cartoons": {
  "act": "buy",
  "en": "Campaign cartoons",
  "opts": [
   {
    "id": "cartoons",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
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
  "en": "Grants and large donations",
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
    "id": "grant-manage",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 12
   },
   {
    "id": "gifts-ready",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "funder-report",
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
  "en": "Chat memory for your LINE group",
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
 "photo-proof": {
  "act": "buy",
  "en": "Photo proof from the project site",
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
 "club-desk": {
  "act": "buy",
  "en": "Admin help for a club",
  "opts": [
   {
    "id": "club-desk",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 12
   }
  ]
 },
 "findable": {
  "act": "buy",
  "en": "Your collection easy to find online",
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
 "teamboard": {
  "act": "ask",
  "en": "Team task board"
 },
 "thai-plan": {
  "act": "buy",
  "en": "A written plan for a hard problem in Thailand",
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
 "form": {
  "act": "buy",
  "en": "Thai form filled in for you",
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
 "trades": {
  "act": "buy",
  "en": "Plumber, electrician or air-conditioning worker, booked",
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
 "vehicle": {
  "act": "buy",
  "en": "Car or motorcycle bought with you",
  "opts": [
   {
    "id": "car-buy",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "moto-buy",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ],
  "add": {
   "id": "dispute",
   "fixed": 800,
   "w": "dispute",
   "unit": "hour",
   "max": 8
  }
 },
 "compare": {
  "act": "buy",
  "en": "Price comparison",
  "opts": [
   {
    "id": "compare",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "compare-biz",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "dispute": {
  "act": "buy",
  "en": "Help with bargaining and disputes",
  "opts": [
   {
    "id": "dispute",
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
 "homehelp-plan": {
  "act": "open",
  "en": "Plan for hiring a cleaner, cook or nanny"
 },
 "post-job": {
  "act": "open",
  "en": "Post any job"
 },
 "homehelp": {
  "act": "link",
  "en": "Maid or nanny contract"
 },
 "date-pick": {
  "act": "buy",
  "en": "Auspicious (lucky) date",
  "opts": [
   {
    "id": "date-en",
    "price": {
     "usd": 59,
     "w": "date-en"
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "date-th",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "name-pick": {
  "act": "buy",
  "en": "Auspicious (lucky) name",
  "opts": [
   {
    "id": "name-pick",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "name-biz",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "pha-yant": {
  "act": "buy",
  "en": "Pha yant (sacred cloth) drawn for you",
  "opts": [
   {
    "id": "pha-yant",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "reading": {
  "act": "buy",
  "en": "Horoscope reading",
  "opts": [
   {
    "id": "reading-en",
    "price": {
     "usd": 99,
     "w": "reading-en"
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "reading-th",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "bazi": {
  "act": "buy",
  "en": "Bazi or I Ching reading",
  "opts": [
   {
    "id": "bazi",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "iching",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "almanac-widget": {
  "act": "buy",
  "en": "Calendar or fortune calculator for your website",
  "opts": [
   {
    "id": "almanac-widget",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "eink-clock": {
  "act": "buy",
  "en": "Lanna calendar clock",
  "opts": [
   {
    "id": "eink-clock",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "lucky-number": {
  "act": "buy",
  "en": "Lucky phone number or car license plate",
  "opts": [
   {
    "id": "lucky-number",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "amulet": {
  "act": "buy",
  "en": "Thai Buddhist amulets",
  "opts": [
   {
    "id": "amulet-check",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 10
   },
   {
    "id": "amulet-buy",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ],
  "add": {
   "id": "dispute",
   "fixed": 800,
   "w": "dispute",
   "unit": "hour",
   "max": 8,
   "for": [
    "amulet-buy"
   ]
  }
 },
 "name-charm": {
  "act": "buy",
  "en": "Name charm",
  "opts": [
   {
    "id": "name-charm",
    "price": {
     "usd": 59,
     "w": "name-charm"
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "sak-yant": {
  "act": "buy",
  "en": "Sak yant (sacred tattoo) in a less-visited place",
  "opts": [
   {
    "id": "sak-yant",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "amulet-seller": {
  "act": "open",
  "en": "Amulet seller page on Mot Dang"
 },
 "german": {
  "act": "buy",
  "en": "Web pages in German, Swiss spelling",
  "opts": [
   {
    "id": "german",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 50
   }
  ]
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
     ],
     "w": "lang-new"
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
     ],
     "w": "lang-check"
    },
    "unit": true,
    "max": 200
   },
   {
    "id": "zh-translate",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 200
   }
  ],
  "add": {
   "id": "lang-stamp",
   "fixed": 100,
   "w": "lang-stamp"
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
   },
   {
    "id": "zh-interp-phone",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 16
   },
   {
    "id": "zh-interp-person",
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
 "thai-lessons": {
  "act": "buy",
  "en": "Thai lessons",
  "opts": [
   {
    "id": "thai-lessons",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 40
   }
  ]
 },
 "lang-leaves": {
  "act": "buy",
  "en": "Lanna (northern Thai) palm-leaf manuscript read",
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
 "paybox": {
  "act": "buy",
  "en": "Accept PromptPay payments",
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
 "restaurant-desk": {
  "act": "buy",
  "en": "Weekly help for your restaurant",
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
 "fb-care": {
  "act": "buy",
  "en": "Facebook page management",
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
 "stall-page": {
  "act": "buy",
  "en": "Market stall page with a QR sign",
  "opts": [
   {
    "id": "stall-page",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
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
 "coffee": {
  "act": "ask",
  "en": "Coffee from a Lahu farm"
 },
 "ownpage": {
  "act": "open",
  "en": "Free shop page on Mot Dang"
 },
 "founders": {
  "act": "open",
  "en": "Founding member of Mot Dang"
 },
 "partner": {
  "act": "buy",
  "en": "Become a Hongdam shipping partner",
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
 "peptides": {
  "act": "ask",
  "en": "Peptide imports"
 },
 "pharma": {
  "act": "ask",
  "en": "Medicine imports"
 },
 "partner-prices": {
  "act": "list",
  "en": "Partner prices"
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
 "leads": {
  "act": "buy",
  "en": "List of possible customers",
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
     "usd": 2,
     "w": "sec-msp"
    },
    "unit": true,
    "max": 2000
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
 "traffic": {
  "act": "buy",
  "en": "Website visitors: people and bots",
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
 "merit-dead": {
  "act": "buy",
  "en": "Merit (Buddhist good deeds) for someone who died",
  "opts": [
   {
    "id": "merit-dead",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "house-blessing": {
  "act": "buy",
  "en": "House or shop blessing",
  "opts": [
   {
    "id": "house-blessing",
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
  "en": "Spirit house (small shrine) installed",
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
 "merit-you": {
  "act": "buy",
  "en": "Merit (Buddhist good deeds) made for you",
  "opts": [
   {
    "id": "merit-alms",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "merit-set",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "merit-gift",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "merit-fish",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "lanna-wedding": {
  "act": "buy",
  "en": "Lanna (northern Thai) wedding ceremony",
  "opts": [
   {
    "id": "lanna-wedding",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "su-khwan": {
  "act": "buy",
  "en": "Su khwan ceremony (spirit blessing)",
  "opts": [
   {
    "id": "su-khwan-arr",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "lantern": {
  "act": "buy",
  "en": "Lantern festival night in Lamphun",
  "opts": [
   {
    "id": "lantern-seat",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 16
   }
  ]
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
 "balloon": {
  "act": "buy",
  "en": "Hot-air balloon or paramotor (motor paraglider) flight",
  "opts": [
   {
    "id": "balloon-cr",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 4
   },
   {
    "id": "balloon-cm",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 4
   },
   {
    "id": "paramotor",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 4
   }
  ]
 },
 "experience": {
  "act": "buy",
  "en": "Class or workshop, with a translator",
  "opts": [
   {
    "id": "experience",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "tour-day": {
  "act": "buy",
  "en": "Private day tour",
  "opts": [
   {
    "id": "tour-cr",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "tour-cm",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "tour-3d": {
  "act": "buy",
  "en": "Three days in northern Thailand",
  "opts": [
   {
    "id": "tour-3d",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 10
   }
  ]
 },
 "car-guide": {
  "act": "buy",
  "en": "Car, driver or guide for a day",
  "opts": [
   {
    "id": "driver-day",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "guide-day",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "guide-day-other",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "honeymoon": {
  "act": "link",
  "en": "Lanna (northern Thai) honeymoon"
 },
 "voice": {
  "act": "buy",
  "en": "Thai voice recording",
  "opts": [
   {
    "id": "voice",
    "price": {
     "walk": true
    },
    "unit": true,
    "max": 60
   }
  ]
 },
 "calls-out": {
  "act": "buy",
  "en": "Phone calls made for you",
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
  "en": "Paper forms typed into a spreadsheet",
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
 "cs-desk": {
  "act": "buy",
  "en": "Customer service in Thai",
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
 "wedding": {
  "act": "buy",
  "en": "Wedding planning",
  "opts": [
   {
    "id": "wed-full",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "wed-partial",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   },
   {
    "id": "wed-day",
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
  "en": "Web page for a wedding, a monk ordination or a memorial",
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
 "event-plan": {
  "act": "buy",
  "en": "Event planning",
  "opts": [
   {
    "id": "event-plan",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "bride": {
  "act": "buy",
  "en": "Bride concierge",
  "opts": [
   {
    "id": "bride-concierge",
    "price": {
     "walk": true
    },
    "unit": false,
    "max": 99
   }
  ]
 },
 "magic": {
  "act": "ask",
  "en": "Close-up magic for your event"
 }
}
