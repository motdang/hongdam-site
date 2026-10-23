// Written by tools/build_services.py from data/services.json; changes go there.
export const LADDER = [10, 20, 30, 50, 100, 150, 200, 250, 300, 400, 500, 600, 800, 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000, 12000, 15000, 20000, 25000, 30000, 40000, 50000, 60000, 80000, 100000, 150000, 200000]
export const PCT_LADDER = [5, 8, 10, 12, 15, 20]
export const USD_LADDER = [1, 2, 3, 5, 9, 19, 29, 39, 49, 59, 79, 99, 149, 199, 299, 499, 999]
export const OPENED = "2026-11-01"
export const SERVICES = {
 "assistant-10": {
  "en": "Your assistant in Thailand: 10 hours a week",
  "th": "\u0e1c\u0e39\u0e49\u0e0a\u0e48\u0e27\u0e22\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13\u0e43\u0e19\u0e44\u0e17\u0e22 \u0e2a\u0e31\u0e1b\u0e14\u0e32\u0e2b\u0e4c\u0e25\u0e30 10 \u0e0a\u0e31\u0e48\u0e27\u0e42\u0e21\u0e07",
  "open": 15000,
  "floor": 8000,
  "ceiling": 30000,
  "slots": 3
 },
 "assistant-20": {
  "en": "Your assistant in Thailand: 20 hours a week",
  "th": "\u0e1c\u0e39\u0e49\u0e0a\u0e48\u0e27\u0e22\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13\u0e43\u0e19\u0e44\u0e17\u0e22 \u0e2a\u0e31\u0e1b\u0e14\u0e32\u0e2b\u0e4c\u0e25\u0e30 20 \u0e0a\u0e31\u0e48\u0e27\u0e42\u0e21\u0e07",
  "open": 30000,
  "floor": 15000,
  "ceiling": 60000,
  "slots": 2
 },
 "typing": {
  "en": "Paper forms typed into a sheet",
  "th": "\u0e1e\u0e34\u0e21\u0e1e\u0e4c\u0e1f\u0e2d\u0e23\u0e4c\u0e21\u0e01\u0e23\u0e30\u0e14\u0e32\u0e29\u0e25\u0e07\u0e15\u0e32\u0e23\u0e32\u0e07",
  "open": 1000,
  "floor": 500,
  "ceiling": 2000,
  "slots": 10
 },
 "subtitles": {
  "en": "Subtitles and transcripts",
  "th": "\u0e0b\u0e31\u0e1a\u0e44\u0e15\u0e40\u0e15\u0e34\u0e25\u0e41\u0e25\u0e30\u0e16\u0e2d\u0e14\u0e04\u0e27\u0e32\u0e21",
  "open": 500,
  "floor": 200,
  "ceiling": 1500,
  "slots": 100
 },
 "cs-desk": {
  "en": "Thai customer service desk",
  "th": "\u0e1d\u0e48\u0e32\u0e22\u0e1a\u0e23\u0e34\u0e01\u0e32\u0e23\u0e25\u0e39\u0e01\u0e04\u0e49\u0e32\u0e20\u0e32\u0e29\u0e32\u0e44\u0e17\u0e22",
  "open": 12000,
  "floor": 6000,
  "ceiling": 20000,
  "slots": 4
 },
 "calls-out": {
  "en": "Outbound calling",
  "th": "\u0e42\u0e17\u0e23\u0e2d\u0e2d\u0e01\u0e41\u0e17\u0e19\u0e04\u0e38\u0e13",
  "open": 5000,
  "floor": 3000,
  "ceiling": 8000,
  "slots": 20
 },
 "voice": {
  "en": "Thai voice recording",
  "th": "\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e40\u0e2a\u0e35\u0e22\u0e07\u0e20\u0e32\u0e29\u0e32\u0e44\u0e17\u0e22",
  "open": 1000,
  "floor": 600,
  "ceiling": 2500,
  "slots": 40
 },
 "call": {
  "en": "Phone call in Thai",
  "th": "\u0e42\u0e17\u0e23\u0e41\u0e17\u0e19\u0e04\u0e38\u0e13",
  "open": 300,
  "floor": 150,
  "ceiling": 500,
  "slots": 40
 },
 "trades": {
  "en": "Tradesperson booked",
  "th": "\u0e2b\u0e32\u0e0a\u0e48\u0e32\u0e07\u0e41\u0e25\u0e30\u0e19\u0e31\u0e14\u0e43\u0e2b\u0e49",
  "open": 500,
  "floor": 300,
  "ceiling": 1000,
  "slots": 20
 },
 "there": {
  "en": "Someone there in person",
  "th": "\u0e04\u0e19\u0e44\u0e1b\u0e2d\u0e22\u0e39\u0e48\u0e14\u0e49\u0e27\u0e22\u0e17\u0e35\u0e48\u0e2b\u0e19\u0e49\u0e32\u0e07\u0e32\u0e19",
  "open": 600,
  "floor": 400,
  "ceiling": 1000,
  "slots": 20
 },
 "errand": {
  "en": "Errand",
  "th": "\u0e27\u0e34\u0e48\u0e07\u0e18\u0e38\u0e23\u0e30",
  "open": 300,
  "floor": 200,
  "ceiling": 500,
  "slots": 30
 },
 "form": {
  "en": "Thai form filled",
  "th": "\u0e01\u0e23\u0e2d\u0e01\u0e41\u0e1a\u0e1a\u0e1f\u0e2d\u0e23\u0e4c\u0e21\u0e43\u0e2b\u0e49",
  "open": 400,
  "floor": 200,
  "ceiling": 800,
  "slots": 30
 },
 "dispute": {
  "en": "Haggling buddy",
  "th": "\u0e40\u0e1e\u0e37\u0e48\u0e2d\u0e19\u0e0a\u0e48\u0e27\u0e22\u0e15\u0e48\u0e2d\u0e23\u0e2d\u0e07",
  "open": 1500,
  "floor": 1000,
  "ceiling": 3000,
  "slots": 10
 },
 "thai-plan": {
  "en": "A written plan for a hard Thai question",
  "th": "\u0e41\u0e1c\u0e19\u0e40\u0e1b\u0e47\u0e19\u0e25\u0e32\u0e22\u0e25\u0e31\u0e01\u0e29\u0e13\u0e4c\u0e2d\u0e31\u0e01\u0e29\u0e23\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e40\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e22\u0e32\u0e01",
  "open": 2000,
  "floor": 1000,
  "ceiling": 5000,
  "slots": 10
 },
 "legalise": {
  "en": "Document legalised (MFA seal)",
  "th": "\u0e23\u0e31\u0e1a\u0e23\u0e2d\u0e07\u0e40\u0e2d\u0e01\u0e2a\u0e32\u0e23\u0e17\u0e35\u0e48\u0e01\u0e23\u0e30\u0e17\u0e23\u0e27\u0e07\u0e01\u0e32\u0e23\u0e15\u0e48\u0e32\u0e07\u0e1b\u0e23\u0e30\u0e40\u0e17\u0e28",
  "open": 1500,
  "floor": 1000,
  "ceiling": 3000,
  "slots": 10
 },
 "idme": {
  "en": "ID.me, VA or SSA sign-in from abroad",
  "th": "\u0e0a\u0e48\u0e27\u0e22\u0e40\u0e02\u0e49\u0e32\u0e23\u0e30\u0e1a\u0e1a ID.me VA \u0e2b\u0e23\u0e37\u0e2d SSA \u0e08\u0e32\u0e01\u0e15\u0e48\u0e32\u0e07\u0e1b\u0e23\u0e30\u0e40\u0e17\u0e28",
  "open": 1500,
  "floor": 800,
  "ceiling": 3000,
  "slots": 10
 },
 "compare": {
  "en": "Comparison shopping",
  "th": "\u0e40\u0e17\u0e35\u0e22\u0e1a\u0e23\u0e32\u0e04\u0e32\u0e43\u0e2b\u0e49",
  "open": 1500,
  "floor": 800,
  "ceiling": 4000,
  "slots": 10
 },
 "retire-setup": {
  "en": "Retiring here: set-up",
  "th": "\u0e40\u0e01\u0e29\u0e35\u0e22\u0e13\u0e17\u0e35\u0e48\u0e19\u0e35\u0e48: \u0e40\u0e23\u0e34\u0e48\u0e21\u0e15\u0e49\u0e19",
  "open": 25000,
  "floor": 15000,
  "ceiling": 50000,
  "slots": 4
 },
 "retire-month": {
  "en": "Retiring here: monthly",
  "th": "\u0e40\u0e01\u0e29\u0e35\u0e22\u0e13\u0e17\u0e35\u0e48\u0e19\u0e35\u0e48: \u0e23\u0e32\u0e22\u0e40\u0e14\u0e37\u0e2d\u0e19",
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 20
 },
 "retire-hour": {
  "en": "Retiring here: extra hours",
  "th": "\u0e40\u0e01\u0e29\u0e35\u0e22\u0e13\u0e17\u0e35\u0e48\u0e19\u0e35\u0e48: \u0e0a\u0e31\u0e48\u0e27\u0e42\u0e21\u0e07\u0e40\u0e1e\u0e34\u0e48\u0e21",
  "open": 600,
  "floor": 500,
  "ceiling": 1000,
  "slots": 40
 },
 "care-placement": {
  "en": "Care home placement",
  "th": "\u0e2b\u0e32\u0e1a\u0e49\u0e32\u0e19\u0e1e\u0e31\u0e01\u0e1c\u0e39\u0e49\u0e2a\u0e39\u0e07\u0e2d\u0e32\u0e22\u0e38",
  "open": 20000,
  "floor": 12000,
  "ceiling": 40000,
  "slots": 3
 },
 "care-visit": {
  "en": "Visit to an older person",
  "th": "\u0e44\u0e1b\u0e40\u0e22\u0e35\u0e48\u0e22\u0e21\u0e1c\u0e39\u0e49\u0e2a\u0e39\u0e07\u0e2d\u0e32\u0e22\u0e38",
  "open": 1200,
  "floor": 800,
  "ceiling": 2000,
  "slots": 48
 },
 "care-visits-month": {
  "en": "Visits, weekly",
  "th": "\u0e44\u0e1b\u0e40\u0e22\u0e35\u0e48\u0e22\u0e21\u0e17\u0e38\u0e01\u0e2a\u0e31\u0e1b\u0e14\u0e32\u0e2b\u0e4c",
  "open": 4000,
  "floor": 3000,
  "ceiling": 6000,
  "slots": 12
 },
 "specialist": {
  "en": "Specialist visit with an interpreter",
  "th": "\u0e1e\u0e1a\u0e41\u0e1e\u0e17\u0e22\u0e4c\u0e40\u0e09\u0e1e\u0e32\u0e30\u0e17\u0e32\u0e07\u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e25\u0e48\u0e32\u0e21",
  "open": 3000,
  "floor": 1500,
  "ceiling": 6000,
  "slots": 16
 },
 "specialist-book": {
  "en": "Specialist booked",
  "th": "\u0e08\u0e2d\u0e07\u0e41\u0e1e\u0e17\u0e22\u0e4c\u0e40\u0e09\u0e1e\u0e32\u0e30\u0e17\u0e32\u0e07\u0e43\u0e2b\u0e49",
  "open": 800,
  "floor": 500,
  "ceiling": 1500,
  "slots": 30
 },
 "death-help": {
  "en": "When someone dies here",
  "th": "\u0e40\u0e21\u0e37\u0e48\u0e2d\u0e21\u0e35\u0e04\u0e19\u0e40\u0e2a\u0e35\u0e22\u0e0a\u0e35\u0e27\u0e34\u0e15\u0e17\u0e35\u0e48\u0e19\u0e35\u0e48",
  "open": 15000,
  "floor": 10000,
  "ceiling": 30000,
  "slots": 2
 },
 "lab-test": {
  "en": "Lab test arranged",
  "th": "\u0e2a\u0e48\u0e07\u0e15\u0e23\u0e27\u0e08\u0e2b\u0e49\u0e2d\u0e07\u0e41\u0e25\u0e47\u0e1a\u0e43\u0e2b\u0e49",
  "open": 2500,
  "floor": 1500,
  "ceiling": 5000,
  "slots": 12
 },
 "clean-air": {
  "en": "Clean air at home",
  "th": "\u0e2d\u0e32\u0e01\u0e32\u0e28\u0e2a\u0e30\u0e2d\u0e32\u0e14\u0e43\u0e19\u0e1a\u0e49\u0e32\u0e19",
  "open": 2500,
  "floor": 1500,
  "ceiling": 5000,
  "slots": 10
 },
 "accident": {
  "en": "After an accident",
  "th": "\u0e2b\u0e25\u0e31\u0e07\u0e40\u0e01\u0e34\u0e14\u0e2d\u0e38\u0e1a\u0e31\u0e15\u0e34\u0e40\u0e2b\u0e15\u0e38",
  "open": 8000,
  "floor": 5000,
  "ceiling": 15000,
  "slots": 4
 },
 "caregiver-hire": {
  "en": "Caregiver found and hired",
  "th": "\u0e2b\u0e32\u0e41\u0e25\u0e30\u0e08\u0e49\u0e32\u0e07\u0e1c\u0e39\u0e49\u0e14\u0e39\u0e41\u0e25",
  "open": 12000,
  "floor": 8000,
  "ceiling": 25000,
  "slots": 4
 },
 "lab-compound": {
  "en": "Compound tested at a lab",
  "th": "\u0e2a\u0e48\u0e07\u0e15\u0e23\u0e27\u0e08\u0e2a\u0e32\u0e23\u0e17\u0e35\u0e48\u0e2b\u0e49\u0e2d\u0e07\u0e41\u0e25\u0e47\u0e1a",
  "open": 3000,
  "floor": 1500,
  "ceiling": 8000,
  "slots": 8
 },
 "blood-basic": {
  "en": "Blood test booked: basic panel",
  "th": "\u0e08\u0e2d\u0e07\u0e15\u0e23\u0e27\u0e08\u0e40\u0e25\u0e37\u0e2d\u0e14: \u0e1e\u0e37\u0e49\u0e19\u0e10\u0e32\u0e19",
  "open": 1500,
  "floor": 800,
  "ceiling": 3000,
  "slots": 30
 },
 "blood-full": {
  "en": "Health checkup booked",
  "th": "\u0e08\u0e2d\u0e07\u0e15\u0e23\u0e27\u0e08\u0e2a\u0e38\u0e02\u0e20\u0e32\u0e1e",
  "open": 3000,
  "floor": 1500,
  "ceiling": 6000,
  "slots": 8
 },
 "specialist-hour": {
  "en": "Clinic visit: extra hours",
  "th": "\u0e1e\u0e32\u0e44\u0e1b\u0e04\u0e25\u0e34\u0e19\u0e34\u0e01: \u0e0a\u0e31\u0e48\u0e27\u0e42\u0e21\u0e07\u0e40\u0e1e\u0e34\u0e48\u0e21",
  "open": 800,
  "floor": 600,
  "ceiling": 1200,
  "slots": 20
 },
 "move-house": {
  "en": "Ship my whole house",
  "th": "\u0e2a\u0e48\u0e07\u0e02\u0e2d\u0e07\u0e17\u0e31\u0e49\u0e07\u0e1a\u0e49\u0e32\u0e19",
  "open": 30000,
  "floor": 20000,
  "ceiling": 50000,
  "slots": 2
 },
 "move-room": {
  "en": "Ship my whole house: one room",
  "th": "\u0e2a\u0e48\u0e07\u0e02\u0e2d\u0e07\u0e17\u0e31\u0e49\u0e07\u0e1a\u0e49\u0e32\u0e19: \u0e2b\u0e19\u0e36\u0e48\u0e07\u0e2b\u0e49\u0e2d\u0e07",
  "open": 15000,
  "floor": 10000,
  "ceiling": 25000,
  "slots": 3
 },
 "move-boxes": {
  "en": "Ship my whole house: a few boxes",
  "th": "\u0e2a\u0e48\u0e07\u0e02\u0e2d\u0e07\u0e17\u0e31\u0e49\u0e07\u0e1a\u0e49\u0e32\u0e19: \u0e44\u0e21\u0e48\u0e01\u0e35\u0e48\u0e01\u0e25\u0e48\u0e2d\u0e07",
  "open": 8000,
  "floor": 5000,
  "ceiling": 12000,
  "slots": 4
 },
 "luggage": {
  "en": "Luggage or a scooter sent across Thailand",
  "th": "\u0e2a\u0e48\u0e07\u0e01\u0e23\u0e30\u0e40\u0e1b\u0e4b\u0e32\u0e2b\u0e23\u0e37\u0e2d\u0e21\u0e2d\u0e40\u0e15\u0e2d\u0e23\u0e4c\u0e44\u0e0b\u0e04\u0e4c\u0e02\u0e49\u0e32\u0e21\u0e08\u0e31\u0e07\u0e2b\u0e27\u0e31\u0e14",
  "open": 800,
  "floor": 500,
  "ceiling": 1500,
  "slots": 10
 },
 "stay-rent": {
  "en": "Find me a place to rent",
  "th": "\u0e2b\u0e32\u0e17\u0e35\u0e48\u0e1e\u0e31\u0e01\u0e40\u0e0a\u0e48\u0e32\u0e43\u0e2b\u0e49",
  "open": 6000,
  "floor": 3000,
  "ceiling": 12000,
  "slots": 8
 },
 "stay-check": {
  "en": "House or land checked before you buy",
  "th": "\u0e15\u0e23\u0e27\u0e08\u0e1a\u0e49\u0e32\u0e19\u0e2b\u0e23\u0e37\u0e2d\u0e17\u0e35\u0e48\u0e14\u0e34\u0e19\u0e01\u0e48\u0e2d\u0e19\u0e0b\u0e37\u0e49\u0e2d",
  "open": 8000,
  "floor": 5000,
  "ceiling": 15000,
  "slots": 4
 },
 "stay-booking": {
  "en": "Booking website for your hotel or rental",
  "th": "\u0e40\u0e27\u0e47\u0e1a\u0e23\u0e31\u0e1a\u0e08\u0e2d\u0e07\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e42\u0e23\u0e07\u0e41\u0e23\u0e21\u0e2b\u0e23\u0e37\u0e2d\u0e17\u0e35\u0e48\u0e1e\u0e31\u0e01\u0e43\u0e2b\u0e49\u0e40\u0e0a\u0e48\u0e32",
  "open": 30000,
  "floor": 20000,
  "ceiling": 60000,
  "slots": 2
 },
 "stay-booking-run": {
  "en": "Booking website: kept up",
  "th": "\u0e14\u0e39\u0e41\u0e25\u0e40\u0e27\u0e47\u0e1a\u0e23\u0e31\u0e1a\u0e08\u0e2d\u0e07",
  "open": 3000,
  "floor": 2000,
  "ceiling": 6000,
  "slots": 6
 },
 "agency-sheet": {
  "en": "Listing sheet for an agency",
  "th": "\u0e15\u0e32\u0e23\u0e32\u0e07\u0e1b\u0e23\u0e30\u0e01\u0e32\u0e28\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e19\u0e32\u0e22\u0e2b\u0e19\u0e49\u0e32",
  "open": 2500,
  "floor": 1200,
  "ceiling": 6000,
  "slots": 3
 },
 "rent-vehicle": {
  "en": "Car or scooter rental arranged",
  "th": "\u0e08\u0e31\u0e14\u0e2b\u0e32\u0e23\u0e16\u0e2b\u0e23\u0e37\u0e2d\u0e21\u0e2d\u0e40\u0e15\u0e2d\u0e23\u0e4c\u0e44\u0e0b\u0e04\u0e4c\u0e40\u0e0a\u0e48\u0e32",
  "open": 800,
  "floor": 500,
  "ceiling": 1500,
  "slots": 20
 },
 "rent-event": {
  "en": "Equipment or venue rental arranged",
  "th": "\u0e08\u0e31\u0e14\u0e2b\u0e32\u0e2d\u0e38\u0e1b\u0e01\u0e23\u0e13\u0e4c\u0e2b\u0e23\u0e37\u0e2d\u0e2a\u0e16\u0e32\u0e19\u0e17\u0e35\u0e48\u0e40\u0e0a\u0e48\u0e32",
  "open": 3000,
  "floor": 2000,
  "ceiling": 8000,
  "slots": 4
 },
 "let-find": {
  "en": "Your place rented out: tenant found",
  "th": "\u0e1b\u0e25\u0e48\u0e2d\u0e22\u0e40\u0e0a\u0e48\u0e32: \u0e2b\u0e32\u0e1c\u0e39\u0e49\u0e40\u0e0a\u0e48\u0e32",
  "open": 10,
  "floor": 8,
  "ceiling": 12,
  "slots": 3,
  "pct": true
 },
 "let-manage": {
  "en": "Your place rented out: looked after",
  "th": "\u0e1b\u0e25\u0e48\u0e2d\u0e22\u0e40\u0e0a\u0e48\u0e32: \u0e14\u0e39\u0e41\u0e25\u0e43\u0e2b\u0e49",
  "open": 10,
  "floor": 8,
  "ceiling": 12,
  "slots": 15,
  "pct": true
 },
 "npa-homes": {
  "en": "Bank-sale homes found for you",
  "th": "\u0e2b\u0e32\u0e1a\u0e49\u0e32\u0e19\u0e41\u0e25\u0e30\u0e17\u0e35\u0e48\u0e14\u0e34\u0e19\u0e17\u0e35\u0e48\u0e18\u0e19\u0e32\u0e04\u0e32\u0e23\u0e02\u0e32\u0e22",
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 10
 },
 "tour-cr": {
  "en": "Chiang Rai day, private",
  "th": "\u0e40\u0e17\u0e35\u0e48\u0e22\u0e27\u0e40\u0e0a\u0e35\u0e22\u0e07\u0e23\u0e32\u0e22\u0e2b\u0e19\u0e36\u0e48\u0e07\u0e27\u0e31\u0e19 \u0e2a\u0e48\u0e27\u0e19\u0e15\u0e31\u0e27",
  "open": 8000,
  "floor": 6000,
  "ceiling": 12000,
  "slots": 16
 },
 "tour-cm": {
  "en": "Chiang Mai day, private",
  "th": "\u0e40\u0e17\u0e35\u0e48\u0e22\u0e27\u0e40\u0e0a\u0e35\u0e22\u0e07\u0e43\u0e2b\u0e21\u0e48\u0e2b\u0e19\u0e36\u0e48\u0e07\u0e27\u0e31\u0e19 \u0e2a\u0e48\u0e27\u0e19\u0e15\u0e31\u0e27",
  "open": 8000,
  "floor": 6000,
  "ceiling": 12000,
  "slots": 12
 },
 "tour-3d": {
  "en": "Three days in the north",
  "th": "\u0e2a\u0e32\u0e21\u0e27\u0e31\u0e19\u0e43\u0e19\u0e20\u0e32\u0e04\u0e40\u0e2b\u0e19\u0e37\u0e2d",
  "open": 20000,
  "floor": 15000,
  "ceiling": 30000,
  "slots": 4
 },
 "driver-day": {
  "en": "Car and driver for a day",
  "th": "\u0e23\u0e16\u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e04\u0e19\u0e02\u0e31\u0e1a\u0e2b\u0e19\u0e36\u0e48\u0e07\u0e27\u0e31\u0e19",
  "open": 4000,
  "floor": 3000,
  "ceiling": 5000,
  "slots": 8
 },
 "guide-day": {
  "en": "Licensed guide for a day, English",
  "th": "\u0e44\u0e01\u0e14\u0e4c\u0e17\u0e35\u0e48\u0e21\u0e35\u0e43\u0e1a\u0e2d\u0e19\u0e38\u0e0d\u0e32\u0e15\u0e2b\u0e19\u0e36\u0e48\u0e07\u0e27\u0e31\u0e19 \u0e20\u0e32\u0e29\u0e32\u0e2d\u0e31\u0e07\u0e01\u0e24\u0e29",
  "open": 3000,
  "floor": 2500,
  "ceiling": 4000,
  "slots": 10
 },
 "guide-day-other": {
  "en": "Licensed guide for a day, other languages",
  "th": "\u0e44\u0e01\u0e14\u0e4c\u0e17\u0e35\u0e48\u0e21\u0e35\u0e43\u0e1a\u0e2d\u0e19\u0e38\u0e0d\u0e32\u0e15\u0e2b\u0e19\u0e36\u0e48\u0e07\u0e27\u0e31\u0e19 \u0e20\u0e32\u0e29\u0e32\u0e2d\u0e37\u0e48\u0e19",
  "open": 4000,
  "floor": 3000,
  "ceiling": 5000,
  "slots": 6
 },
 "experience": {
  "en": "Class or workshop booked, with a translator",
  "th": "\u0e08\u0e2d\u0e07\u0e04\u0e25\u0e32\u0e2a\u0e2b\u0e23\u0e37\u0e2d\u0e40\u0e27\u0e34\u0e23\u0e4c\u0e01\u0e0a\u0e47\u0e2d\u0e1b\u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e25\u0e48\u0e32\u0e21",
  "open": 1500,
  "floor": 1000,
  "ceiling": 2500,
  "slots": 20
 },
 "lantern-seat": {
  "en": "Lantern night in Lamphun",
  "th": "\u0e04\u0e37\u0e19\u0e42\u0e04\u0e21\u0e41\u0e2a\u0e19\u0e14\u0e27\u0e07\u0e17\u0e35\u0e48\u0e25\u0e33\u0e1e\u0e39\u0e19",
  "open": 4000,
  "floor": 3000,
  "ceiling": 6000,
  "slots": 24
 },
 "balloon-cr": {
  "en": "Balloon flight, Chiang Rai",
  "th": "\u0e1a\u0e34\u0e19\u0e1a\u0e2d\u0e25\u0e25\u0e39\u0e19 \u0e40\u0e0a\u0e35\u0e22\u0e07\u0e23\u0e32\u0e22",
  "open": 12000,
  "floor": 10000,
  "ceiling": 15000,
  "slots": 8
 },
 "balloon-cm": {
  "en": "Balloon flight, Chiang Mai",
  "th": "\u0e1a\u0e34\u0e19\u0e1a\u0e2d\u0e25\u0e25\u0e39\u0e19 \u0e40\u0e0a\u0e35\u0e22\u0e07\u0e43\u0e2b\u0e21\u0e48",
  "open": 10000,
  "floor": 8000,
  "ceiling": 12000,
  "slots": 8
 },
 "paramotor": {
  "en": "Paramotor flight",
  "th": "\u0e1a\u0e34\u0e19\u0e1e\u0e32\u0e23\u0e32\u0e21\u0e2d\u0e40\u0e15\u0e2d\u0e23\u0e4c",
  "open": 4000,
  "floor": 3000,
  "ceiling": 5000,
  "slots": 12
 },
 "lang-new": {
  "en": "New translation",
  "th": "\u0e41\u0e1b\u0e25\u0e40\u0e2d\u0e01\u0e2a\u0e32\u0e23\u0e43\u0e2b\u0e21\u0e48",
  "open": 1500,
  "floor": 1000,
  "ceiling": 5000,
  "slots": 20,
  "tail": 500
 },
 "lang-check": {
  "en": "Checking a translation",
  "th": "\u0e15\u0e23\u0e27\u0e08\u0e07\u0e32\u0e19\u0e41\u0e1b\u0e25",
  "open": 500,
  "floor": 300,
  "ceiling": 2000,
  "slots": 10,
  "tail": 150
 },
 "lang-stamp": {
  "en": "Translator's stamp",
  "th": "\u0e15\u0e23\u0e32\u0e1b\u0e23\u0e30\u0e17\u0e31\u0e1a\u0e1c\u0e39\u0e49\u0e41\u0e1b\u0e25",
  "open": 100,
  "floor": 50,
  "ceiling": 500,
  "slots": 40
 },
 "interp-phone": {
  "en": "Interpreter by phone or video",
  "th": "\u0e25\u0e48\u0e32\u0e21\u0e17\u0e32\u0e07\u0e42\u0e17\u0e23\u0e28\u0e31\u0e1e\u0e17\u0e4c\u0e2b\u0e23\u0e37\u0e2d\u0e27\u0e34\u0e14\u0e35\u0e42\u0e2d",
  "open": 400,
  "floor": 250,
  "ceiling": 800,
  "slots": 40
 },
 "interp-person": {
  "en": "Interpreter in person",
  "th": "\u0e25\u0e48\u0e32\u0e21\u0e44\u0e1b\u0e14\u0e49\u0e27\u0e22",
  "open": 3000,
  "floor": 2000,
  "ceiling": 5000,
  "slots": 8
 },
 "interp-day": {
  "en": "Interpreter in person, full day",
  "th": "\u0e25\u0e48\u0e32\u0e21\u0e44\u0e1b\u0e14\u0e49\u0e27\u0e22\u0e17\u0e31\u0e49\u0e07\u0e27\u0e31\u0e19",
  "open": 5000,
  "floor": 4000,
  "ceiling": 8000,
  "slots": 4
 },
 "zh-translate": {
  "en": "Chinese translation",
  "th": "\u0e41\u0e1b\u0e25\u0e20\u0e32\u0e29\u0e32\u0e08\u0e35\u0e19",
  "open": 1200,
  "floor": 800,
  "ceiling": 2500,
  "slots": 20
 },
 "zh-interp-phone": {
  "en": "Chinese interpreter by phone or video",
  "th": "\u0e25\u0e48\u0e32\u0e21\u0e20\u0e32\u0e29\u0e32\u0e08\u0e35\u0e19\u0e17\u0e32\u0e07\u0e42\u0e17\u0e23\u0e28\u0e31\u0e1e\u0e17\u0e4c\u0e2b\u0e23\u0e37\u0e2d\u0e27\u0e34\u0e14\u0e35\u0e42\u0e2d",
  "open": 600,
  "floor": 400,
  "ceiling": 1200,
  "slots": 30
 },
 "zh-interp-person": {
  "en": "Chinese interpreter in person",
  "th": "\u0e25\u0e48\u0e32\u0e21\u0e20\u0e32\u0e29\u0e32\u0e08\u0e35\u0e19\u0e44\u0e1b\u0e14\u0e49\u0e27\u0e22",
  "open": 4000,
  "floor": 3000,
  "ceiling": 6000,
  "slots": 6
 },
 "lang-pages": {
  "en": "Web page translation check",
  "th": "\u0e15\u0e23\u0e27\u0e08\u0e04\u0e33\u0e41\u0e1b\u0e25\u0e2b\u0e19\u0e49\u0e32\u0e40\u0e27\u0e47\u0e1a",
  "open": 400,
  "floor": 250,
  "ceiling": 800,
  "slots": 20
 },
 "lang-shan": {
  "en": "Shan pages",
  "th": "\u0e2b\u0e19\u0e49\u0e32\u0e20\u0e32\u0e29\u0e32\u0e44\u0e17\u0e43\u0e2b\u0e0d\u0e48",
  "open": 800,
  "floor": 500,
  "ceiling": 1500,
  "slots": 20
 },
 "lang-leaves": {
  "en": "Lanna manuscript transcription",
  "th": "\u0e1b\u0e23\u0e34\u0e27\u0e23\u0e23\u0e15\u0e43\u0e1a\u0e25\u0e32\u0e19\u0e25\u0e49\u0e32\u0e19\u0e19\u0e32",
  "open": 500,
  "floor": 300,
  "ceiling": 1000,
  "slots": 10
 },
 "thai-lessons": {
  "en": "Thai lessons",
  "th": "\u0e40\u0e23\u0e35\u0e22\u0e19\u0e20\u0e32\u0e29\u0e32\u0e44\u0e17\u0e22",
  "open": 600,
  "floor": 400,
  "ceiling": 1000,
  "slots": 20
 },
 "german": {
  "en": "German pages, Swiss spelling",
  "th": "\u0e2b\u0e19\u0e49\u0e32\u0e40\u0e27\u0e47\u0e1a\u0e20\u0e32\u0e29\u0e32\u0e40\u0e22\u0e2d\u0e23\u0e21\u0e31\u0e19 \u0e2a\u0e30\u0e01\u0e14\u0e41\u0e1a\u0e1a\u0e2a\u0e27\u0e34\u0e2a",
  "open": 1200,
  "floor": 800,
  "ceiling": 3000,
  "slots": 20
 },
 "grab-start": {
  "en": "Grab start",
  "th": "\u0e40\u0e1b\u0e34\u0e14\u0e23\u0e49\u0e32\u0e19\u0e1a\u0e19 Grab",
  "open": 3000,
  "floor": 2000,
  "ceiling": 5000,
  "slots": 10,
  "walk": "desk"
 },
 "grab-menu": {
  "en": "Grab menu refresh",
  "th": "\u0e1b\u0e23\u0e31\u0e1a\u0e40\u0e21\u0e19\u0e39\u0e1a\u0e19 Grab",
  "open": 1500,
  "floor": 1000,
  "ceiling": 3000,
  "slots": 10,
  "walk": "desk"
 },
 "grab-care": {
  "en": "Grab care",
  "th": "\u0e14\u0e39\u0e41\u0e25\u0e23\u0e49\u0e32\u0e19\u0e1a\u0e19 Grab",
  "open": 1000,
  "floor": 500,
  "ceiling": 2000,
  "slots": 20,
  "walk": "desk"
 },
 "signs": {
  "en": "Signs and menus translated",
  "th": "\u0e41\u0e1b\u0e25\u0e1b\u0e49\u0e32\u0e22\u0e41\u0e25\u0e30\u0e40\u0e21\u0e19\u0e39",
  "open": 250,
  "floor": 150,
  "ceiling": 500,
  "slots": 20
 },
 "print": {
  "en": "Print files",
  "th": "\u0e44\u0e1f\u0e25\u0e4c\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e1e\u0e34\u0e21\u0e1e\u0e4c",
  "open": 800,
  "floor": 400,
  "ceiling": 1500,
  "slots": 10
 },
 "trade-photos": {
  "en": "Product photos",
  "th": "\u0e16\u0e48\u0e32\u0e22\u0e23\u0e39\u0e1b\u0e2a\u0e34\u0e19\u0e04\u0e49\u0e32",
  "open": 400,
  "floor": 200,
  "ceiling": 800,
  "slots": 60
 },
 "paybox": {
  "en": "Pay box",
  "th": "\u0e01\u0e25\u0e48\u0e2d\u0e07\u0e23\u0e31\u0e1a\u0e40\u0e07\u0e34\u0e19",
  "open": 4000,
  "floor": 2000,
  "ceiling": 8000,
  "slots": 4
 },
 "restaurant-desk": {
  "en": "Restaurant desk",
  "th": "\u0e1c\u0e39\u0e49\u0e0a\u0e48\u0e27\u0e22\u0e23\u0e49\u0e32\u0e19\u0e2d\u0e32\u0e2b\u0e32\u0e23\u0e23\u0e32\u0e22\u0e2a\u0e31\u0e1b\u0e14\u0e32\u0e2b\u0e4c",
  "open": 6000,
  "floor": 3000,
  "ceiling": 12000,
  "slots": 6
 },
 "ordering": {
  "en": "Online ordering for your caf\u00e9",
  "th": "\u0e23\u0e30\u0e1a\u0e1a\u0e2a\u0e31\u0e48\u0e07\u0e2d\u0e2d\u0e19\u0e44\u0e25\u0e19\u0e4c\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e04\u0e32\u0e40\u0e1f\u0e48",
  "open": 10000,
  "floor": 5000,
  "ceiling": 20000,
  "slots": 3
 },
 "etsy-open": {
  "en": "Etsy or eBay shop opened",
  "th": "\u0e40\u0e1b\u0e34\u0e14\u0e23\u0e49\u0e32\u0e19\u0e1a\u0e19 Etsy \u0e2b\u0e23\u0e37\u0e2d eBay",
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 4
 },
 "etsy-run": {
  "en": "Etsy or eBay shop run",
  "th": "\u0e14\u0e39\u0e41\u0e25\u0e23\u0e49\u0e32\u0e19 Etsy \u0e2b\u0e23\u0e37\u0e2d eBay",
  "open": 4000,
  "floor": 2000,
  "ceiling": 8000,
  "slots": 4
 },
 "online-shop": {
  "en": "Online shop",
  "th": "\u0e23\u0e49\u0e32\u0e19\u0e04\u0e49\u0e32\u0e2d\u0e2d\u0e19\u0e44\u0e25\u0e19\u0e4c",
  "open": 25000,
  "floor": 15000,
  "ceiling": 60000,
  "slots": 3
 },
 "lineman-start": {
  "en": "LINE MAN or ShopeeFood start",
  "th": "\u0e40\u0e1b\u0e34\u0e14\u0e23\u0e49\u0e32\u0e19\u0e1a\u0e19 LINE MAN \u0e2b\u0e23\u0e37\u0e2d ShopeeFood",
  "open": 2500,
  "floor": 1500,
  "ceiling": 4000,
  "slots": 12
 },
 "fb-care": {
  "en": "Facebook page care",
  "th": "\u0e14\u0e39\u0e41\u0e25\u0e40\u0e1e\u0e08 Facebook",
  "open": 8000,
  "floor": 5000,
  "ceiling": 15000,
  "slots": 15
 },
 "ads-run": {
  "en": "Ads run for you",
  "th": "\u0e14\u0e39\u0e41\u0e25\u0e42\u0e06\u0e29\u0e13\u0e32\u0e43\u0e2b\u0e49",
  "open": 8000,
  "floor": 5000,
  "ceiling": 15000,
  "slots": 8
 },
 "stall-page": {
  "en": "Market stall page with a QR sign",
  "th": "\u0e2b\u0e19\u0e49\u0e32\u0e41\u0e1c\u0e07\u0e15\u0e25\u0e32\u0e14\u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e1b\u0e49\u0e32\u0e22\u0e04\u0e34\u0e27\u0e2d\u0e32\u0e23\u0e4c",
  "open": 3000,
  "floor": 2000,
  "ceiling": 6000,
  "slots": 6
 },
 "trade-setup": {
  "en": "Partner set-up",
  "th": "\u0e40\u0e23\u0e34\u0e48\u0e21\u0e07\u0e32\u0e19\u0e1e\u0e32\u0e23\u0e4c\u0e17\u0e40\u0e19\u0e2d\u0e23\u0e4c",
  "open": 10000,
  "floor": 5000,
  "ceiling": 15000,
  "slots": 4
 },
 "trade-dropship": {
  "en": "Drop-ship fulfilment",
  "th": "\u0e08\u0e31\u0e14\u0e2a\u0e48\u0e07\u0e41\u0e17\u0e19 (\u0e14\u0e23\u0e2d\u0e1b\u0e0a\u0e34\u0e1b)",
  "open": 100,
  "floor": 50,
  "ceiling": 200,
  "slots": 300
 },
 "trade-shelf": {
  "en": "Storage in Chiang Rai",
  "th": "\u0e1d\u0e32\u0e01\u0e2a\u0e15\u0e47\u0e2d\u0e01\u0e17\u0e35\u0e48\u0e40\u0e0a\u0e35\u0e22\u0e07\u0e23\u0e32\u0e22",
  "open": 300,
  "floor": 200,
  "ceiling": 500,
  "slots": 30
 },
 "trade-sourcing": {
  "en": "Sourcing from makers",
  "th": "\u0e08\u0e31\u0e14\u0e2b\u0e32\u0e2a\u0e34\u0e19\u0e04\u0e49\u0e32\u0e08\u0e32\u0e01\u0e0a\u0e48\u0e32\u0e07\u0e1d\u0e35\u0e21\u0e37\u0e2d",
  "open": 12,
  "floor": 8,
  "ceiling": 15,
  "slots": 40,
  "pct": true
 },
 "trade-qc": {
  "en": "Quality check",
  "th": "\u0e15\u0e23\u0e27\u0e08\u0e04\u0e38\u0e13\u0e20\u0e32\u0e1e",
  "open": 1500,
  "floor": 800,
  "ceiling": 3000,
  "slots": 20
 },
 "trade-export": {
  "en": "Export paperwork",
  "th": "\u0e40\u0e2d\u0e01\u0e2a\u0e32\u0e23\u0e2a\u0e48\u0e07\u0e2d\u0e2d\u0e01",
  "open": 1500,
  "floor": 800,
  "ceiling": 3000,
  "slots": 30
 },
 "trade-import": {
  "en": "Import clearance",
  "th": "\u0e19\u0e33\u0e40\u0e02\u0e49\u0e32\u0e1e\u0e31\u0e2a\u0e14\u0e38",
  "open": 1200,
  "floor": 600,
  "ceiling": 2500,
  "slots": 20
 },
 "trip-plan": {
  "en": "Trip plan, booked in your name",
  "th": "\u0e27\u0e32\u0e07\u0e41\u0e1c\u0e19\u0e40\u0e17\u0e35\u0e48\u0e22\u0e27\u0e41\u0e25\u0e30\u0e08\u0e2d\u0e07\u0e43\u0e2b\u0e49",
  "open": 3000,
  "floor": 2000,
  "ceiling": 6000,
  "slots": 8
 },
 "event-page": {
  "en": "Event page with tickets",
  "th": "\u0e2b\u0e19\u0e49\u0e32\u0e07\u0e32\u0e19\u0e2d\u0e35\u0e40\u0e27\u0e19\u0e15\u0e4c\u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e02\u0e32\u0e22\u0e1a\u0e31\u0e15\u0e23",
  "open": 8000,
  "floor": 5000,
  "ceiling": 15000,
  "slots": 4
 },
 "event-kit": {
  "en": "Charity event kit",
  "th": "\u0e0a\u0e38\u0e14\u0e08\u0e31\u0e14\u0e07\u0e32\u0e19\u0e01\u0e32\u0e23\u0e01\u0e38\u0e28\u0e25",
  "open": 10000,
  "floor": 6000,
  "ceiling": 20000,
  "slots": 2
 },
 "tribute": {
  "en": "Page for a wedding, ordination or memorial",
  "th": "\u0e2b\u0e19\u0e49\u0e32\u0e40\u0e27\u0e47\u0e1a\u0e07\u0e32\u0e19\u0e41\u0e15\u0e48\u0e07 \u0e07\u0e32\u0e19\u0e1a\u0e27\u0e0a \u0e2b\u0e23\u0e37\u0e2d\u0e07\u0e32\u0e19\u0e23\u0e33\u0e25\u0e36\u0e01",
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 6
 },
 "keepsake": {
  "en": "A place you love, as a page and a framed print",
  "th": "\u0e2a\u0e16\u0e32\u0e19\u0e17\u0e35\u0e48\u0e17\u0e35\u0e48\u0e04\u0e38\u0e13\u0e23\u0e31\u0e01 \u0e40\u0e1b\u0e47\u0e19\u0e2b\u0e19\u0e49\u0e32\u0e40\u0e27\u0e47\u0e1a\u0e41\u0e25\u0e30\u0e20\u0e32\u0e1e\u0e43\u0e2a\u0e48\u0e01\u0e23\u0e2d\u0e1a",
  "open": 8000,
  "floor": 5000,
  "ceiling": 15000,
  "slots": 4
 },
 "spirit-house": {
  "en": "Spirit house bought, placed and blessed",
  "th": "\u0e28\u0e32\u0e25\u0e1e\u0e23\u0e30\u0e20\u0e39\u0e21\u0e34 \u0e08\u0e31\u0e14\u0e0b\u0e37\u0e49\u0e2d \u0e15\u0e31\u0e49\u0e07 \u0e41\u0e25\u0e30\u0e17\u0e33\u0e1e\u0e34\u0e18\u0e35",
  "open": 3000,
  "floor": 2000,
  "ceiling": 6000,
  "slots": 4
 },
 "sak-yant": {
  "en": "Sak yant, off the beaten path",
  "th": "\u0e1e\u0e32\u0e44\u0e1b\u0e2a\u0e31\u0e01\u0e22\u0e31\u0e19\u0e15\u0e4c\u0e01\u0e31\u0e1a\u0e2d\u0e32\u0e08\u0e32\u0e23\u0e22\u0e4c\u0e43\u0e19\u0e1e\u0e37\u0e49\u0e19\u0e17\u0e35\u0e48",
  "open": 4000,
  "floor": 2500,
  "ceiling": 8000,
  "slots": 8
 },
 "wed-full": {
  "en": "Wedding planning, full",
  "th": "\u0e27\u0e32\u0e07\u0e41\u0e1c\u0e19\u0e07\u0e32\u0e19\u0e41\u0e15\u0e48\u0e07\u0e07\u0e32\u0e19\u0e04\u0e23\u0e1a\u0e27\u0e07\u0e08\u0e23",
  "open": 60000,
  "floor": 40000,
  "ceiling": 150000,
  "slots": 1
 },
 "wed-partial": {
  "en": "Wedding planning, partial",
  "th": "\u0e27\u0e32\u0e07\u0e41\u0e1c\u0e19\u0e07\u0e32\u0e19\u0e41\u0e15\u0e48\u0e07\u0e07\u0e32\u0e19\u0e1a\u0e32\u0e07\u0e2a\u0e48\u0e27\u0e19",
  "open": 30000,
  "floor": 20000,
  "ceiling": 80000,
  "slots": 1
 },
 "wed-day": {
  "en": "Wedding day coordination",
  "th": "\u0e1b\u0e23\u0e30\u0e2a\u0e32\u0e19\u0e07\u0e32\u0e19\u0e27\u0e31\u0e19\u0e41\u0e15\u0e48\u0e07\u0e07\u0e32\u0e19",
  "open": 20000,
  "floor": 12000,
  "ceiling": 40000,
  "slots": 2
 },
 "bride-concierge": {
  "en": "Bride concierge",
  "th": "\u0e1c\u0e39\u0e49\u0e0a\u0e48\u0e27\u0e22\u0e40\u0e08\u0e49\u0e32\u0e2a\u0e32\u0e27",
  "open": 12000,
  "floor": 8000,
  "ceiling": 25000,
  "slots": 2
 },
 "event-plan": {
  "en": "Event planning",
  "th": "\u0e27\u0e32\u0e07\u0e41\u0e1c\u0e19\u0e08\u0e31\u0e14\u0e07\u0e32\u0e19",
  "open": 20000,
  "floor": 10000,
  "ceiling": 60000,
  "slots": 2
 },
 "reading-en": {
  "en": "Reading, written in English",
  "th": "\u0e14\u0e39\u0e14\u0e27\u0e07 \u0e40\u0e02\u0e35\u0e22\u0e19\u0e40\u0e1b\u0e47\u0e19\u0e20\u0e32\u0e29\u0e32\u0e2d\u0e31\u0e07\u0e01\u0e24\u0e29",
  "open": 99,
  "floor": 49,
  "ceiling": 199,
  "slots": 20,
  "usd": true
 },
 "reading-th": {
  "en": "Thai or Lanna reading, in Thai",
  "th": "\u0e14\u0e39\u0e14\u0e27\u0e07\u0e44\u0e17\u0e22\u0e2b\u0e23\u0e37\u0e2d\u0e25\u0e49\u0e32\u0e19\u0e19\u0e32 \u0e40\u0e1b\u0e47\u0e19\u0e20\u0e32\u0e29\u0e32\u0e44\u0e17\u0e22",
  "open": 2500,
  "floor": 1500,
  "ceiling": 4000,
  "slots": 20
 },
 "bazi": {
  "en": "Bazi reading",
  "th": "\u0e14\u0e39\u0e14\u0e27\u0e07\u0e1b\u0e32\u0e08\u0e37\u0e49\u0e2d",
  "open": 3000,
  "floor": 1500,
  "ceiling": 8000,
  "slots": 12
 },
 "iching": {
  "en": "I Ching reading",
  "th": "\u0e14\u0e39\u0e2d\u0e35\u0e49\u0e08\u0e34\u0e07",
  "open": 2000,
  "floor": 1000,
  "ceiling": 5000,
  "slots": 12
 },
 "date-en": {
  "en": "Auspicious date, in English",
  "th": "\u0e2b\u0e32\u0e24\u0e01\u0e29\u0e4c \u0e40\u0e1b\u0e47\u0e19\u0e20\u0e32\u0e29\u0e32\u0e2d\u0e31\u0e07\u0e01\u0e24\u0e29",
  "open": 59,
  "floor": 29,
  "ceiling": 99,
  "slots": 30,
  "usd": true
 },
 "date-th": {
  "en": "Auspicious date, in Thai",
  "th": "\u0e2b\u0e32\u0e24\u0e01\u0e29\u0e4c \u0e40\u0e1b\u0e47\u0e19\u0e20\u0e32\u0e29\u0e32\u0e44\u0e17\u0e22",
  "open": 2000,
  "floor": 1000,
  "ceiling": 5000,
  "slots": 30
 },
 "name-pick": {
  "en": "Auspicious name for a person",
  "th": "\u0e15\u0e31\u0e49\u0e07\u0e0a\u0e37\u0e48\u0e2d\u0e21\u0e07\u0e04\u0e25",
  "open": 1500,
  "floor": 800,
  "ceiling": 5000,
  "slots": 25
 },
 "name-biz": {
  "en": "Auspicious name for a business",
  "th": "\u0e15\u0e31\u0e49\u0e07\u0e0a\u0e37\u0e48\u0e2d\u0e23\u0e49\u0e32\u0e19\u0e2b\u0e23\u0e37\u0e2d\u0e1a\u0e23\u0e34\u0e29\u0e31\u0e17\u0e21\u0e07\u0e04\u0e25",
  "open": 3000,
  "floor": 1500,
  "ceiling": 8000,
  "slots": 10
 },
 "lucky-number": {
  "en": "Lucky phone number or plate",
  "th": "\u0e40\u0e1a\u0e2d\u0e23\u0e4c\u0e21\u0e07\u0e04\u0e25\u0e2b\u0e23\u0e37\u0e2d\u0e17\u0e30\u0e40\u0e1a\u0e35\u0e22\u0e19\u0e21\u0e07\u0e04\u0e25",
  "open": 600,
  "floor": 300,
  "ceiling": 1500,
  "slots": 60
 },
 "name-charm": {
  "en": "Name charm",
  "th": "\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e23\u0e32\u0e07\u0e40\u0e02\u0e35\u0e22\u0e19\u0e0a\u0e37\u0e48\u0e2d",
  "open": 59,
  "floor": 29,
  "ceiling": 99,
  "slots": 25,
  "usd": true
 },
 "pha-yant": {
  "en": "Pha yant drawn for you",
  "th": "\u0e1c\u0e49\u0e32\u0e22\u0e31\u0e19\u0e15\u0e4c\u0e40\u0e02\u0e35\u0e22\u0e19\u0e43\u0e2b\u0e49",
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 8
 },
 "amulet-check": {
  "en": "Amulet opinion from photos",
  "th": "\u0e14\u0e39\u0e1e\u0e23\u0e30\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e08\u0e32\u0e01\u0e23\u0e39\u0e1b",
  "open": 500,
  "floor": 300,
  "ceiling": 1500,
  "slots": 40
 },
 "amulet-buy": {
  "en": "Amulet bought for you",
  "th": "\u0e0b\u0e37\u0e49\u0e2d\u0e1e\u0e23\u0e30\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e43\u0e2b\u0e49",
  "open": 1000,
  "floor": 600,
  "ceiling": 2500,
  "slots": 20
 },
 "almanac-widget": {
  "en": "Almanac or fortune calculator for your site",
  "th": "\u0e1b\u0e0f\u0e34\u0e17\u0e34\u0e19\u0e2b\u0e23\u0e37\u0e2d\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e04\u0e33\u0e19\u0e27\u0e13\u0e14\u0e27\u0e07\u0e1a\u0e19\u0e40\u0e27\u0e47\u0e1a",
  "open": 10000,
  "floor": 6000,
  "ceiling": 25000,
  "slots": 1
 },
 "eink-clock": {
  "en": "Lanna almanac clock",
  "th": "\u0e19\u0e32\u0e2c\u0e34\u0e01\u0e32\u0e1b\u0e0f\u0e34\u0e17\u0e34\u0e19\u0e25\u0e49\u0e32\u0e19\u0e19\u0e32",
  "open": 12000,
  "floor": 8000,
  "ceiling": 30000,
  "slots": 2
 },
 "merit-alms": {
  "en": "Food for monks at dawn, for you",
  "th": "\u0e43\u0e2a\u0e48\u0e1a\u0e32\u0e15\u0e23\u0e41\u0e17\u0e19\u0e04\u0e38\u0e13",
  "open": 300,
  "floor": 150,
  "ceiling": 600,
  "slots": 100
 },
 "merit-set": {
  "en": "Sangkhathan set offered for you",
  "th": "\u0e16\u0e27\u0e32\u0e22\u0e2a\u0e31\u0e07\u0e06\u0e17\u0e32\u0e19\u0e41\u0e17\u0e19\u0e04\u0e38\u0e13",
  "open": 800,
  "floor": 500,
  "ceiling": 3000,
  "slots": 60
 },
 "merit-gift": {
  "en": "Robes, an image or a donation offered for you",
  "th": "\u0e16\u0e27\u0e32\u0e22\u0e1c\u0e49\u0e32\u0e44\u0e15\u0e23 \u0e1e\u0e23\u0e30\u0e1e\u0e38\u0e17\u0e18\u0e23\u0e39\u0e1b \u0e2b\u0e23\u0e37\u0e2d\u0e1b\u0e31\u0e08\u0e08\u0e31\u0e22\u0e41\u0e17\u0e19\u0e04\u0e38\u0e13",
  "open": 500,
  "floor": 300,
  "ceiling": 1000,
  "slots": 40
 },
 "merit-fish": {
  "en": "Fish released for you",
  "th": "\u0e1b\u0e25\u0e48\u0e2d\u0e22\u0e1b\u0e25\u0e32\u0e41\u0e17\u0e19\u0e04\u0e38\u0e13",
  "open": 500,
  "floor": 300,
  "ceiling": 1200,
  "slots": 30
 },
 "merit-dead": {
  "en": "Merit for someone who died",
  "th": "\u0e17\u0e33\u0e1a\u0e38\u0e0d\u0e2d\u0e38\u0e17\u0e34\u0e28\u0e43\u0e2b\u0e49\u0e1c\u0e39\u0e49\u0e25\u0e48\u0e27\u0e07\u0e25\u0e31\u0e1a",
  "open": 3000,
  "floor": 2000,
  "ceiling": 6000,
  "slots": 6
 },
 "house-blessing": {
  "en": "House or shop blessing",
  "th": "\u0e17\u0e33\u0e1a\u0e38\u0e0d\u0e1a\u0e49\u0e32\u0e19\u0e2b\u0e23\u0e37\u0e2d\u0e40\u0e1b\u0e34\u0e14\u0e23\u0e49\u0e32\u0e19",
  "open": 8000,
  "floor": 5000,
  "ceiling": 15000,
  "slots": 8
 },
 "su-khwan-arr": {
  "en": "Su khwan ceremony arranged",
  "th": "\u0e08\u0e31\u0e14\u0e1e\u0e34\u0e18\u0e35\u0e2a\u0e39\u0e48\u0e02\u0e27\u0e31\u0e0d",
  "open": 3000,
  "floor": 2000,
  "ceiling": 6000,
  "slots": 12
 },
 "lanna-wedding": {
  "en": "Lanna wedding ceremony arranged",
  "th": "\u0e08\u0e31\u0e14\u0e1e\u0e34\u0e18\u0e35\u0e41\u0e15\u0e48\u0e07\u0e07\u0e32\u0e19\u0e41\u0e1a\u0e1a\u0e25\u0e49\u0e32\u0e19\u0e19\u0e32",
  "open": 25000,
  "floor": 15000,
  "ceiling": 60000,
  "slots": 2
 },
 "web-minisite": {
  "en": "Minisite",
  "th": "\u0e21\u0e34\u0e19\u0e34\u0e44\u0e0b\u0e15\u0e4c",
  "open": 10000,
  "floor": 6000,
  "ceiling": 15000,
  "slots": 6
 },
 "web-site": {
  "en": "Bilingual website",
  "th": "\u0e40\u0e27\u0e47\u0e1a\u0e44\u0e0b\u0e15\u0e4c\u0e2a\u0e2d\u0e07\u0e20\u0e32\u0e29\u0e32",
  "open": 30000,
  "floor": 20000,
  "ceiling": 50000,
  "slots": 3
 },
 "vibe-check": {
  "en": "Finish my vibe code: check",
  "th": "\u0e17\u0e33\u0e42\u0e04\u0e49\u0e14 vibe \u0e43\u0e2b\u0e49\u0e40\u0e2a\u0e23\u0e47\u0e08: \u0e15\u0e23\u0e27\u0e08",
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 10
 },
 "vibe-finish": {
  "en": "Finish my vibe code",
  "th": "\u0e17\u0e33\u0e42\u0e04\u0e49\u0e14 vibe \u0e43\u0e2b\u0e49\u0e40\u0e2a\u0e23\u0e47\u0e08",
  "open": 30000,
  "floor": 15000,
  "ceiling": 60000,
  "slots": 6
 },
 "vibe-hours": {
  "en": "Finish my vibe code: more hours",
  "th": "\u0e17\u0e33\u0e42\u0e04\u0e49\u0e14 vibe \u0e43\u0e2b\u0e49\u0e40\u0e2a\u0e23\u0e47\u0e08: \u0e0a\u0e31\u0e48\u0e27\u0e42\u0e21\u0e07\u0e40\u0e1e\u0e34\u0e48\u0e21",
  "open": 2000,
  "floor": 1200,
  "ceiling": 3000,
  "slots": 40
 },
 "web-line": {
  "en": "LINE Official Account and LINE app",
  "th": "\u0e44\u0e25\u0e19\u0e4c OA \u0e41\u0e25\u0e30\u0e41\u0e2d\u0e1b\u0e43\u0e19\u0e44\u0e25\u0e19\u0e4c",
  "open": 25000,
  "floor": 12000,
  "ceiling": 50000,
  "slots": 3
 },
 "web-pwa": {
  "en": "App that works with no signal",
  "th": "\u0e41\u0e2d\u0e1b\u0e17\u0e35\u0e48\u0e43\u0e0a\u0e49\u0e44\u0e14\u0e49\u0e41\u0e21\u0e49\u0e44\u0e21\u0e48\u0e21\u0e35\u0e2a\u0e31\u0e0d\u0e0d\u0e32\u0e13",
  "open": 15000,
  "floor": 6000,
  "ceiling": 30000,
  "slots": 3
 },
 "web-search": {
  "en": "Search for your site",
  "th": "\u0e0a\u0e48\u0e2d\u0e07\u0e04\u0e49\u0e19\u0e2b\u0e32\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e40\u0e27\u0e47\u0e1a\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13",
  "open": 5000,
  "floor": 2500,
  "ceiling": 10000,
  "slots": 6
 },
 "web-sharecard": {
  "en": "Share card",
  "th": "\u0e01\u0e32\u0e23\u0e4c\u0e14\u0e41\u0e0a\u0e23\u0e4c",
  "open": 800,
  "floor": 400,
  "ceiling": 1500,
  "slots": 10
 },
 "web-found": {
  "en": "Google and AI set-up",
  "th": "\u0e15\u0e31\u0e49\u0e07\u0e04\u0e48\u0e32 Google \u0e41\u0e25\u0e30 AI",
  "open": 5000,
  "floor": 2500,
  "ceiling": 10000,
  "slots": 8
 },
 "web-mail": {
  "en": "Mail on your own domain",
  "th": "\u0e2d\u0e35\u0e40\u0e21\u0e25\u0e1a\u0e19\u0e42\u0e14\u0e40\u0e21\u0e19\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13",
  "open": 1500,
  "floor": 800,
  "ceiling": 3000,
  "slots": 8
 },
 "web-move": {
  "en": "Move to new hosting",
  "th": "\u0e22\u0e49\u0e32\u0e22\u0e42\u0e2e\u0e2a\u0e15\u0e34\u0e49\u0e07",
  "open": 5000,
  "floor": 3000,
  "ceiling": 12000,
  "slots": 6
 },
 "web-license": {
  "en": "A copy of a site for another city",
  "th": "\u0e40\u0e27\u0e47\u0e1a\u0e02\u0e2d\u0e07\u0e40\u0e23\u0e32\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e40\u0e21\u0e37\u0e2d\u0e07\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13",
  "open": 50000,
  "floor": 30000,
  "ceiling": 100000,
  "slots": 1
 },
 "android": {
  "en": "Android app",
  "th": "\u0e41\u0e2d\u0e1b Android",
  "open": 20000,
  "floor": 10000,
  "ceiling": 40000,
  "slots": 3
 },
 "sheet-app": {
  "en": "Spreadsheet into a phone app",
  "th": "\u0e40\u0e1b\u0e25\u0e35\u0e48\u0e22\u0e19\u0e2a\u0e40\u0e1b\u0e23\u0e14\u0e0a\u0e35\u0e15\u0e40\u0e1b\u0e47\u0e19\u0e41\u0e2d\u0e1b\u0e21\u0e37\u0e2d\u0e16\u0e37\u0e2d",
  "open": 8000,
  "floor": 5000,
  "ceiling": 15000,
  "slots": 4
 },
 "game": {
  "en": "Game for your brand or event",
  "th": "\u0e40\u0e01\u0e21\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e41\u0e1a\u0e23\u0e19\u0e14\u0e4c\u0e2b\u0e23\u0e37\u0e2d\u0e07\u0e32\u0e19",
  "open": 20000,
  "floor": 10000,
  "ceiling": 50000,
  "slots": 2
 },
 "directory": {
  "en": "Directory of your field",
  "th": "\u0e2a\u0e32\u0e23\u0e1a\u0e1a\u0e02\u0e2d\u0e07\u0e27\u0e07\u0e01\u0e32\u0e23\u0e04\u0e38\u0e13",
  "open": 20000,
  "floor": 12000,
  "ceiling": 40000,
  "slots": 2
 },
 "directory-run": {
  "en": "Directory: kept up",
  "th": "\u0e14\u0e39\u0e41\u0e25\u0e2a\u0e32\u0e23\u0e1a\u0e1a",
  "open": 20000,
  "floor": 10000,
  "ceiling": 40000,
  "slots": 3
 },
 "accessible": {
  "en": "Easier to read: low vision and screen readers",
  "th": "\u0e2d\u0e48\u0e32\u0e19\u0e07\u0e48\u0e32\u0e22\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e1c\u0e39\u0e49\u0e21\u0e2d\u0e07\u0e40\u0e2b\u0e47\u0e19\u0e40\u0e25\u0e37\u0e2d\u0e19\u0e23\u0e32\u0e07\u0e41\u0e25\u0e30\u0e42\u0e1b\u0e23\u0e41\u0e01\u0e23\u0e21\u0e2d\u0e48\u0e32\u0e19\u0e2b\u0e19\u0e49\u0e32\u0e08\u0e2d",
  "open": 15000,
  "floor": 8000,
  "ceiling": 40000,
  "slots": 4
 },
 "wp-api": {
  "en": "Let partners and AI read your WordPress",
  "th": "\u0e43\u0e2b\u0e49\u0e1e\u0e32\u0e23\u0e4c\u0e17\u0e40\u0e19\u0e2d\u0e23\u0e4c\u0e41\u0e25\u0e30 AI \u0e2d\u0e48\u0e32\u0e19\u0e40\u0e27\u0e47\u0e1a WordPress \u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13",
  "open": 10000,
  "floor": 6000,
  "ceiling": 20000,
  "slots": 3
 },
 "guide-site": {
  "en": "Guide site for your town or hotel",
  "th": "\u0e40\u0e27\u0e47\u0e1a\u0e44\u0e01\u0e14\u0e4c\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e40\u0e21\u0e37\u0e2d\u0e07\u0e2b\u0e23\u0e37\u0e2d\u0e42\u0e23\u0e07\u0e41\u0e23\u0e21",
  "open": 20000,
  "floor": 12000,
  "ceiling": 40000,
  "slots": 3
 },
 "web-care": {
  "en": "Website care",
  "th": "\u0e14\u0e39\u0e41\u0e25\u0e40\u0e27\u0e47\u0e1a\u0e44\u0e0b\u0e15\u0e4c",
  "open": 3000,
  "floor": 2000,
  "ceiling": 8000,
  "slots": 8
 },
 "web-workspace": {
  "en": "Google Workspace or Microsoft 365 email",
  "th": "\u0e2d\u0e35\u0e40\u0e21\u0e25\u0e1a\u0e19 Google Workspace \u0e2b\u0e23\u0e37\u0e2d Microsoft 365",
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 8
 },
 "help-page": {
  "en": "Help page with a live map",
  "th": "\u0e2b\u0e19\u0e49\u0e32\u0e0a\u0e48\u0e27\u0e22\u0e40\u0e2b\u0e25\u0e37\u0e2d\u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e41\u0e1c\u0e19\u0e17\u0e35\u0e48\u0e2a\u0e14",
  "open": 10000,
  "floor": 6000,
  "ceiling": 20000,
  "slots": 3
 },
 "help-page-run": {
  "en": "Help page: kept up",
  "th": "\u0e14\u0e39\u0e41\u0e25\u0e2b\u0e19\u0e49\u0e32\u0e0a\u0e48\u0e27\u0e22\u0e40\u0e2b\u0e25\u0e37\u0e2d",
  "open": 3000,
  "floor": 1500,
  "ceiling": 8000,
  "slots": 3
 },
 "widget": {
  "en": "Weather, smoke or events box for your site",
  "th": "\u0e01\u0e25\u0e48\u0e2d\u0e07\u0e2d\u0e32\u0e01\u0e32\u0e28 \u0e1d\u0e38\u0e48\u0e19 \u0e2b\u0e23\u0e37\u0e2d\u0e07\u0e32\u0e19\u0e1a\u0e19\u0e40\u0e27\u0e47\u0e1a",
  "open": 4000,
  "floor": 2500,
  "ceiling": 10000,
  "slots": 5
 },
 "tap-card": {
  "en": "Contact card on a QR code",
  "th": "\u0e19\u0e32\u0e21\u0e1a\u0e31\u0e15\u0e23\u0e1a\u0e19\u0e04\u0e34\u0e27\u0e2d\u0e32\u0e23\u0e4c",
  "open": 500,
  "floor": 300,
  "ceiling": 1500,
  "slots": 20
 },
 "sec-hacked": {
  "en": "Hacked site cleanup",
  "th": "\u0e01\u0e39\u0e49\u0e40\u0e27\u0e47\u0e1a\u0e17\u0e35\u0e48\u0e16\u0e39\u0e01\u0e41\u0e2e\u0e01",
  "open": 5000,
  "floor": 2500,
  "ceiling": 12000,
  "slots": 10
 },
 "sec-mail": {
  "en": "Mail spoofing check",
  "th": "\u0e15\u0e23\u0e27\u0e08\u0e01\u0e32\u0e23\u0e1b\u0e25\u0e2d\u0e21\u0e2d\u0e35\u0e40\u0e21\u0e25",
  "open": 1500,
  "floor": 800,
  "ceiling": 4000,
  "slots": 10
 },
 "sec-redteam": {
  "en": "Chatbot red-team test",
  "th": "\u0e17\u0e14\u0e2a\u0e2d\u0e1a\u0e40\u0e08\u0e32\u0e30\u0e41\u0e0a\u0e15\u0e1a\u0e2d\u0e17",
  "open": 12000,
  "floor": 8000,
  "ceiling": 40000,
  "slots": 5
 },
 "mirror": {
  "en": "Standby copy of your site",
  "th": "\u0e2a\u0e33\u0e40\u0e19\u0e32\u0e2a\u0e33\u0e23\u0e2d\u0e07\u0e02\u0e2d\u0e07\u0e40\u0e27\u0e47\u0e1a",
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 6
 },
 "app-test": {
  "en": "App tested in Thai on real phones",
  "th": "\u0e17\u0e14\u0e2a\u0e2d\u0e1a\u0e41\u0e2d\u0e1b\u0e20\u0e32\u0e29\u0e32\u0e44\u0e17\u0e22\u0e1a\u0e19\u0e21\u0e37\u0e2d\u0e16\u0e37\u0e2d\u0e08\u0e23\u0e34\u0e07",
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 4
 },
 "dmarc-watch": {
  "en": "Fake-email reports read, monthly",
  "th": "\u0e2d\u0e48\u0e32\u0e19\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e2d\u0e35\u0e40\u0e21\u0e25\u0e1b\u0e25\u0e2d\u0e21\u0e23\u0e32\u0e22\u0e40\u0e14\u0e37\u0e2d\u0e19",
  "open": 800,
  "floor": 500,
  "ceiling": 1500,
  "slots": 25
 },
 "ai-own": {
  "en": "Your own builder",
  "th": "\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e2a\u0e23\u0e49\u0e32\u0e07\u0e40\u0e27\u0e47\u0e1a\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13\u0e40\u0e2d\u0e07",
  "open": 25000,
  "floor": 15000,
  "ceiling": 50000,
  "slots": 2,
  "tail": 25000,
  "tail_usd": true
 },
 "ai-whitelabel": {
  "en": "AI assistant under your name",
  "th": "\u0e1c\u0e39\u0e49\u0e0a\u0e48\u0e27\u0e22 AI \u0e43\u0e19\u0e0a\u0e37\u0e48\u0e2d\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13",
  "open": 20000,
  "floor": 8000,
  "ceiling": 50000,
  "slots": 4
 },
 "ai-line": {
  "en": "One LINE for many businesses",
  "th": "\u0e44\u0e25\u0e19\u0e4c\u0e40\u0e14\u0e35\u0e22\u0e27\u0e2b\u0e25\u0e32\u0e22\u0e18\u0e38\u0e23\u0e01\u0e34\u0e08",
  "open": 20000,
  "floor": 10000,
  "ceiling": 40000,
  "slots": 3
 },
 "ai-batch": {
  "en": "Bulk text job",
  "th": "\u0e07\u0e32\u0e19\u0e02\u0e49\u0e2d\u0e04\u0e27\u0e32\u0e21\u0e08\u0e33\u0e19\u0e27\u0e19\u0e21\u0e32\u0e01",
  "open": 1000,
  "floor": 400,
  "ceiling": 3000,
  "slots": 15
 },
 "ai-monthly": {
  "en": "AI assistant under your name, monthly",
  "th": "\u0e1c\u0e39\u0e49\u0e0a\u0e48\u0e27\u0e22 AI \u0e43\u0e19\u0e0a\u0e37\u0e48\u0e2d\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13 \u0e23\u0e32\u0e22\u0e40\u0e14\u0e37\u0e2d\u0e19",
  "open": 2000,
  "floor": 1000,
  "ceiling": 4000,
  "slots": 10
 },
 "crawl-pay": {
  "en": "Charge AI crawlers for reading your site",
  "th": "\u0e40\u0e01\u0e47\u0e1a\u0e40\u0e07\u0e34\u0e19\u0e08\u0e32\u0e01\u0e1a\u0e2d\u0e17 AI \u0e17\u0e35\u0e48\u0e2d\u0e48\u0e32\u0e19\u0e40\u0e27\u0e47\u0e1a\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13",
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 4
 },
 "demand-prices": {
  "en": "Prices that follow demand",
  "th": "\u0e23\u0e32\u0e04\u0e32\u0e17\u0e35\u0e48\u0e02\u0e22\u0e31\u0e1a\u0e15\u0e32\u0e21\u0e04\u0e27\u0e32\u0e21\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23",
  "open": 20000,
  "floor": 10000,
  "ceiling": 40000,
  "slots": 3
 },
 "ai-automation": {
  "en": "Automation",
  "th": "\u0e23\u0e30\u0e1a\u0e1a\u0e2d\u0e31\u0e15\u0e42\u0e19\u0e21\u0e31\u0e15\u0e34",
  "open": 8000,
  "floor": 4000,
  "ceiling": 30000,
  "slots": 6
 },
 "data-leads": {
  "en": "Lead sheet",
  "th": "\u0e23\u0e32\u0e22\u0e0a\u0e37\u0e48\u0e2d\u0e25\u0e39\u0e01\u0e04\u0e49\u0e32\u0e40\u0e1b\u0e49\u0e32\u0e2b\u0e21\u0e32\u0e22",
  "open": 2500,
  "floor": 1000,
  "ceiling": 5000,
  "slots": 10
 },
 "sec-msp": {
  "en": "Call list of IT companies",
  "th": "\u0e23\u0e32\u0e22\u0e0a\u0e37\u0e48\u0e2d\u0e1a\u0e23\u0e34\u0e29\u0e31\u0e17\u0e44\u0e2d\u0e17\u0e35\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e42\u0e17\u0e23",
  "open": 2,
  "floor": 1,
  "ceiling": 5,
  "slots": 4,
  "usd": true
 },
 "data-crawl": {
  "en": "Crawler and data pipeline",
  "th": "\u0e42\u0e1b\u0e23\u0e41\u0e01\u0e23\u0e21\u0e40\u0e01\u0e47\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25",
  "open": 6000,
  "floor": 3000,
  "ceiling": 15000,
  "slots": 3
 },
 "data-research": {
  "en": "Research job",
  "th": "\u0e07\u0e32\u0e19\u0e04\u0e49\u0e19\u0e04\u0e27\u0e49\u0e32",
  "open": 1200,
  "floor": 600,
  "ceiling": 5000,
  "slots": 8
 },
 "data-prices": {
  "en": "Price and stock reading",
  "th": "\u0e2d\u0e48\u0e32\u0e19\u0e23\u0e32\u0e04\u0e32\u0e41\u0e25\u0e30\u0e2a\u0e15\u0e47\u0e2d\u0e01",
  "open": 1500,
  "floor": 800,
  "ceiling": 4000,
  "slots": 8
 },
 "data-traffic": {
  "en": "Visitor counts: people and machines",
  "th": "\u0e19\u0e31\u0e1a\u0e1c\u0e39\u0e49\u0e40\u0e02\u0e49\u0e32\u0e0a\u0e21: \u0e04\u0e19\u0e41\u0e25\u0e30\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07",
  "open": 1200,
  "floor": 600,
  "ceiling": 3000,
  "slots": 10
 },
 "street-survey": {
  "en": "Street photo survey",
  "th": "\u0e2a\u0e33\u0e23\u0e27\u0e08\u0e16\u0e19\u0e19\u0e14\u0e49\u0e27\u0e22\u0e20\u0e32\u0e1e\u0e16\u0e48\u0e32\u0e22",
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 4
 },
 "romanise": {
  "en": "Thai names in English letters",
  "th": "\u0e0a\u0e37\u0e48\u0e2d\u0e20\u0e32\u0e29\u0e32\u0e44\u0e17\u0e22\u0e40\u0e1b\u0e47\u0e19\u0e2d\u0e31\u0e01\u0e29\u0e23\u0e2d\u0e31\u0e07\u0e01\u0e24\u0e29",
  "open": 500,
  "floor": 300,
  "ceiling": 1000,
  "slots": 10
 },
 "event-lists": {
  "en": "Speaker and exhibitor lists",
  "th": "\u0e23\u0e32\u0e22\u0e0a\u0e37\u0e48\u0e2d\u0e27\u0e34\u0e17\u0e22\u0e32\u0e01\u0e23\u0e41\u0e25\u0e30\u0e1c\u0e39\u0e49\u0e2d\u0e2d\u0e01\u0e1a\u0e39\u0e18",
  "open": 3000,
  "floor": 1500,
  "ceiling": 6000,
  "slots": 6
 },
 "compare-biz": {
  "en": "Suppliers found and compared",
  "th": "\u0e2b\u0e32\u0e41\u0e25\u0e30\u0e40\u0e17\u0e35\u0e22\u0e1a\u0e1c\u0e39\u0e49\u0e02\u0e32\u0e22\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e18\u0e38\u0e23\u0e01\u0e34\u0e08",
  "open": 8000,
  "floor": 4000,
  "ceiling": 25000,
  "slots": 3
 },
 "media-graphics": {
  "en": "Graphics and brand look",
  "th": "\u0e01\u0e23\u0e32\u0e1f\u0e34\u0e01\u0e41\u0e25\u0e30\u0e20\u0e32\u0e1e\u0e25\u0e31\u0e01\u0e29\u0e13\u0e4c\u0e41\u0e1a\u0e23\u0e19\u0e14\u0e4c",
  "open": 6000,
  "floor": 3000,
  "ceiling": 12000,
  "slots": 4
 },
 "media-reels": {
  "en": "Short video",
  "th": "\u0e04\u0e25\u0e34\u0e1b\u0e2a\u0e31\u0e49\u0e19",
  "open": 2000,
  "floor": 1000,
  "ceiling": 4000,
  "slots": 10
 },
 "media-doodles": {
  "en": "Code-drawn picture",
  "th": "\u0e20\u0e32\u0e1e\u0e27\u0e32\u0e14\u0e14\u0e49\u0e27\u0e22\u0e42\u0e04\u0e49\u0e14",
  "open": 1000,
  "floor": 500,
  "ceiling": 3000,
  "slots": 8
 },
 "media-animation": {
  "en": "Web animation",
  "th": "\u0e41\u0e2d\u0e19\u0e34\u0e40\u0e21\u0e0a\u0e31\u0e19\u0e1a\u0e19\u0e40\u0e27\u0e47\u0e1a",
  "open": 10000,
  "floor": 5000,
  "ceiling": 30000,
  "slots": 3
 },
 "media-decks": {
  "en": "Pitch deck",
  "th": "\u0e2a\u0e44\u0e25\u0e14\u0e4c\u0e19\u0e33\u0e40\u0e2a\u0e19\u0e2d",
  "open": 6000,
  "floor": 3000,
  "ceiling": 25000,
  "slots": 4
 },
 "patterns": {
  "en": "Lanna pattern files",
  "th": "\u0e44\u0e1f\u0e25\u0e4c\u0e25\u0e32\u0e22\u0e25\u0e49\u0e32\u0e19\u0e19\u0e32",
  "open": 2000,
  "floor": 1000,
  "ceiling": 5000,
  "slots": 8
 },
 "explainer": {
  "en": "Interactive explainer",
  "th": "\u0e2a\u0e37\u0e48\u0e2d\u0e2d\u0e18\u0e34\u0e1a\u0e32\u0e22\u0e41\u0e1a\u0e1a\u0e42\u0e15\u0e49\u0e15\u0e2d\u0e1a",
  "open": 30000,
  "floor": 15000,
  "ceiling": 80000,
  "slots": 2
 },
 "venue-map": {
  "en": "Drawn map of your venue or town",
  "th": "\u0e41\u0e1c\u0e19\u0e17\u0e35\u0e48\u0e27\u0e32\u0e14\u0e02\u0e2d\u0e07\u0e2a\u0e16\u0e32\u0e19\u0e17\u0e35\u0e48\u0e2b\u0e23\u0e37\u0e2d\u0e40\u0e21\u0e37\u0e2d\u0e07",
  "open": 10000,
  "floor": 5000,
  "ceiling": 20000,
  "slots": 3
 },
 "cartoons": {
  "en": "Campaign cartoons",
  "th": "\u0e01\u0e32\u0e23\u0e4c\u0e15\u0e39\u0e19\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e41\u0e04\u0e21\u0e40\u0e1b\u0e0d",
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 2
 },
 "interview": {
  "en": "Recorded interview",
  "th": "\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e1a\u0e17\u0e2a\u0e31\u0e21\u0e20\u0e32\u0e29\u0e13\u0e4c",
  "open": 15000,
  "floor": 10000,
  "ceiling": 30000,
  "slots": 3
 },
 "words-articles": {
  "en": "Article or explainer",
  "th": "\u0e1a\u0e17\u0e04\u0e27\u0e32\u0e21",
  "open": 3000,
  "floor": 1500,
  "ceiling": 6000,
  "slots": 10
 },
 "words-copy": {
  "en": "Words for a website",
  "th": "\u0e40\u0e19\u0e37\u0e49\u0e2d\u0e2b\u0e32\u0e40\u0e27\u0e47\u0e1a\u0e44\u0e0b\u0e15\u0e4c",
  "open": 4000,
  "floor": 2500,
  "ceiling": 8000,
  "slots": 6
 },
 "words-newsletter": {
  "en": "Newsletter",
  "th": "\u0e08\u0e14\u0e2b\u0e21\u0e32\u0e22\u0e02\u0e48\u0e32\u0e27",
  "open": 2000,
  "floor": 1000,
  "ceiling": 5000,
  "slots": 8
 },
 "words-social": {
  "en": "Social post",
  "th": "\u0e42\u0e1e\u0e2a\u0e15\u0e4c\u0e42\u0e0b\u0e40\u0e0a\u0e35\u0e22\u0e25",
  "open": 500,
  "floor": 300,
  "ceiling": 800,
  "slots": 20
 },
 "words-proposals": {
  "en": "Proposal",
  "th": "\u0e02\u0e49\u0e2d\u0e40\u0e2a\u0e19\u0e2d\u0e07\u0e32\u0e19",
  "open": 6000,
  "floor": 3000,
  "ceiling": 12000,
  "slots": 3
 },
 "words-plan": {
  "en": "Business plan",
  "th": "\u0e41\u0e1c\u0e19\u0e18\u0e38\u0e23\u0e01\u0e34\u0e08",
  "open": 12000,
  "floor": 6000,
  "ceiling": 30000,
  "slots": 2
 },
 "sec-awards": {
  "en": "Security award entry",
  "th": "\u0e40\u0e2d\u0e01\u0e2a\u0e32\u0e23\u0e2a\u0e48\u0e07\u0e1b\u0e23\u0e30\u0e01\u0e27\u0e14\u0e23\u0e32\u0e07\u0e27\u0e31\u0e25\u0e04\u0e27\u0e32\u0e21\u0e1b\u0e25\u0e2d\u0e14\u0e20\u0e31\u0e22\u0e44\u0e0b\u0e40\u0e1a\u0e2d\u0e23\u0e4c",
  "open": 30000,
  "floor": 15000,
  "ceiling": 80000,
  "slots": 2
 },
 "merchant-check": {
  "en": "Unfuck my merchant services: diagnosis",
  "th": "\u0e0b\u0e48\u0e2d\u0e21\u0e23\u0e30\u0e1a\u0e1a\u0e23\u0e31\u0e1a\u0e40\u0e07\u0e34\u0e19\u0e17\u0e35\u0e48\u0e1e\u0e31\u0e07\u0e22\u0e31\u0e1a: \u0e15\u0e23\u0e27\u0e08",
  "open": 5000,
  "floor": 3000,
  "ceiling": 8000,
  "slots": 12
 },
 "merchant-fix": {
  "en": "Unfuck my merchant services",
  "th": "\u0e0b\u0e48\u0e2d\u0e21\u0e23\u0e30\u0e1a\u0e1a\u0e23\u0e31\u0e1a\u0e40\u0e07\u0e34\u0e19\u0e17\u0e35\u0e48\u0e1e\u0e31\u0e07\u0e22\u0e31\u0e1a",
  "open": 15000,
  "floor": 8000,
  "ceiling": 40000,
  "slots": 6
 },
 "money-invoice": {
  "en": "Invoice page for PayPal or Wise",
  "th": "\u0e2b\u0e19\u0e49\u0e32\u0e43\u0e1a\u0e41\u0e08\u0e49\u0e07\u0e2b\u0e19\u0e35\u0e49 PayPal \u0e2b\u0e23\u0e37\u0e2d Wise",
  "open": 1000,
  "floor": 500,
  "ceiling": 2500,
  "slots": 10
 },
 "co-books": {
  "en": "Books in Thai and English",
  "th": "\u0e1a\u0e31\u0e0d\u0e0a\u0e35\u0e2a\u0e2d\u0e07\u0e20\u0e32\u0e29\u0e32",
  "open": 4000,
  "floor": 2500,
  "ceiling": 8000,
  "slots": 6
 },
 "money-payouts": {
  "en": "Team payouts on the 1st",
  "th": "\u0e2a\u0e23\u0e38\u0e1b\u0e04\u0e48\u0e32\u0e08\u0e49\u0e32\u0e07\u0e17\u0e35\u0e21\u0e17\u0e38\u0e01\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48 1",
  "open": 2000,
  "floor": 1000,
  "ceiling": 4000,
  "slots": 4
 },
 "money-exchange": {
  "en": "Exchange rate page",
  "th": "\u0e2b\u0e19\u0e49\u0e32\u0e2d\u0e31\u0e15\u0e23\u0e32\u0e41\u0e25\u0e01\u0e40\u0e1b\u0e25\u0e35\u0e48\u0e22\u0e19",
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 2
 },
 "staff-contract": {
  "en": "Staff contract in Thai and English",
  "th": "\u0e2a\u0e31\u0e0d\u0e0d\u0e32\u0e08\u0e49\u0e32\u0e07\u0e1e\u0e19\u0e31\u0e01\u0e07\u0e32\u0e19 \u0e44\u0e17\u0e22\u0e41\u0e25\u0e30\u0e2d\u0e31\u0e07\u0e01\u0e24\u0e29",
  "open": 2500,
  "floor": 1500,
  "ceiling": 5000,
  "slots": 6
 },
 "payslips": {
  "en": "Payslips",
  "th": "\u0e2a\u0e25\u0e34\u0e1b\u0e40\u0e07\u0e34\u0e19\u0e40\u0e14\u0e37\u0e2d\u0e19",
  "open": 150,
  "floor": 100,
  "ceiling": 300,
  "slots": 30
 },
 "bank-account": {
  "en": "Thai bank account opened, with you",
  "th": "\u0e40\u0e1b\u0e34\u0e14\u0e1a\u0e31\u0e0d\u0e0a\u0e35\u0e18\u0e19\u0e32\u0e04\u0e32\u0e23\u0e44\u0e17\u0e22 \u0e44\u0e1b\u0e14\u0e49\u0e27\u0e22\u0e01\u0e31\u0e19",
  "open": 4000,
  "floor": 2500,
  "ceiling": 8000,
  "slots": 8
 },
 "kh-books": {
  "en": "Books for a Cambodian company, in Khmer and English",
  "th": "\u0e1a\u0e31\u0e0d\u0e0a\u0e35\u0e1a\u0e23\u0e34\u0e29\u0e31\u0e17\u0e43\u0e19\u0e01\u0e31\u0e21\u0e1e\u0e39\u0e0a\u0e32 \u0e20\u0e32\u0e29\u0e32\u0e40\u0e02\u0e21\u0e23\u0e41\u0e25\u0e30\u0e2d\u0e31\u0e07\u0e01\u0e24\u0e29",
  "open": 149,
  "floor": 99,
  "ceiling": 299,
  "slots": 4,
  "usd": true
 },
 "giving-desk": {
  "en": "Giving page for your charity",
  "th": "\u0e2b\u0e19\u0e49\u0e32\u0e23\u0e31\u0e1a\u0e1a\u0e23\u0e34\u0e08\u0e32\u0e04\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e2d\u0e07\u0e04\u0e4c\u0e01\u0e23",
  "open": 30000,
  "floor": 20000,
  "ceiling": 60000,
  "slots": 2
 },
 "giving-run": {
  "en": "Giving page: kept up",
  "th": "\u0e14\u0e39\u0e41\u0e25\u0e2b\u0e19\u0e49\u0e32\u0e23\u0e31\u0e1a\u0e1a\u0e23\u0e34\u0e08\u0e32\u0e04",
  "open": 10000,
  "floor": 5000,
  "ceiling": 20000,
  "slots": 3
 },
 "gifts-ready": {
  "en": "Ready for major gifts",
  "th": "\u0e40\u0e15\u0e23\u0e35\u0e22\u0e21\u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e23\u0e31\u0e1a\u0e17\u0e38\u0e19\u0e01\u0e49\u0e2d\u0e19\u0e43\u0e2b\u0e0d\u0e48",
  "open": 100000,
  "floor": 50000,
  "ceiling": 200000,
  "slots": 1
 },
 "grant": {
  "en": "Grant application",
  "th": "\u0e43\u0e1a\u0e2a\u0e21\u0e31\u0e04\u0e23\u0e02\u0e2d\u0e17\u0e38\u0e19",
  "open": 25000,
  "floor": 15000,
  "ceiling": 50000,
  "slots": 3
 },
 "findable": {
  "en": "Collection findable online",
  "th": "\u0e17\u0e33\u0e43\u0e2b\u0e49\u0e04\u0e2d\u0e25\u0e40\u0e25\u0e01\u0e0a\u0e31\u0e19\u0e04\u0e49\u0e19\u0e40\u0e08\u0e2d\u0e2d\u0e2d\u0e19\u0e44\u0e25\u0e19\u0e4c",
  "open": 50000,
  "floor": 30000,
  "ceiling": 80000,
  "slots": 2
 },
 "map-archive": {
  "en": "Map of your projects or places",
  "th": "\u0e41\u0e1c\u0e19\u0e17\u0e35\u0e48\u0e42\u0e04\u0e23\u0e07\u0e01\u0e32\u0e23\u0e2b\u0e23\u0e37\u0e2d\u0e2a\u0e16\u0e32\u0e19\u0e17\u0e35\u0e48\u0e02\u0e2d\u0e07\u0e04\u0e38\u0e13",
  "open": 30000,
  "floor": 15000,
  "ceiling": 60000,
  "slots": 2
 },
 "line-memory": {
  "en": "Memory desk for your LINE group",
  "th": "\u0e23\u0e30\u0e1a\u0e1a\u0e04\u0e27\u0e32\u0e21\u0e08\u0e33\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e01\u0e25\u0e38\u0e48\u0e21\u0e44\u0e25\u0e19\u0e4c",
  "open": 15000,
  "floor": 8000,
  "ceiling": 30000,
  "slots": 3
 },
 "checkin": {
  "en": "Volunteer sign-up and check-in",
  "th": "\u0e23\u0e30\u0e1a\u0e1a\u0e25\u0e07\u0e0a\u0e37\u0e48\u0e2d\u0e41\u0e25\u0e30\u0e40\u0e0a\u0e47\u0e01\u0e2d\u0e34\u0e19\u0e2d\u0e32\u0e2a\u0e32\u0e2a\u0e21\u0e31\u0e04\u0e23",
  "open": 10000,
  "floor": 6000,
  "ceiling": 20000,
  "slots": 3
 },
 "photo-proof": {
  "en": "Photo proof from the field",
  "th": "\u0e2b\u0e25\u0e31\u0e01\u0e10\u0e32\u0e19\u0e23\u0e39\u0e1b\u0e16\u0e48\u0e32\u0e22\u0e08\u0e32\u0e01\u0e1e\u0e37\u0e49\u0e19\u0e17\u0e35\u0e48",
  "open": 30000,
  "floor": 15000,
  "ceiling": 60000,
  "slots": 2
 },
 "club-desk": {
  "en": "Admin desk for a club",
  "th": "\u0e1c\u0e39\u0e49\u0e0a\u0e48\u0e27\u0e22\u0e07\u0e32\u0e19\u0e18\u0e38\u0e23\u0e01\u0e32\u0e23\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e0a\u0e21\u0e23\u0e21",
  "open": 8000,
  "floor": 5000,
  "ceiling": 15000,
  "slots": 3
 },
 "funder-report": {
  "en": "Funder research report",
  "th": "\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e41\u0e2b\u0e25\u0e48\u0e07\u0e17\u0e38\u0e19",
  "open": 8000,
  "floor": 5000,
  "ceiling": 20000,
  "slots": 3
 }
}
