// Written by tools/build_services.py from data/services.json; changes go there.
export const LADDER = [10, 20, 30, 50, 100, 150, 200, 250, 300, 400, 500, 600, 800, 1000, 1200, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000, 12000, 15000, 20000, 25000, 30000, 40000, 50000, 60000, 80000, 100000, 150000, 200000]
export const PCT_LADDER = [5, 8, 10, 12, 15, 20]
export const USD_LADDER = [1, 2, 3, 5, 9, 19, 29, 39, 49, 59, 79, 99, 149, 199, 299, 499, 999]
export const OPENED = "2026-11-01"
export const SERVICES = {
 "assistant-10": {
  "open": 15000,
  "floor": 8000,
  "ceiling": 30000,
  "slots": 3
 },
 "assistant-20": {
  "open": 30000,
  "floor": 15000,
  "ceiling": 60000,
  "slots": 2
 },
 "typing": {
  "open": 1000,
  "floor": 500,
  "ceiling": 2000,
  "slots": 10
 },
 "subtitles": {
  "open": 500,
  "floor": 200,
  "ceiling": 1500,
  "slots": 100
 },
 "cs-desk": {
  "open": 12000,
  "floor": 6000,
  "ceiling": 20000,
  "slots": 4
 },
 "calls-out": {
  "open": 5000,
  "floor": 3000,
  "ceiling": 8000,
  "slots": 20
 },
 "voice": {
  "open": 1000,
  "floor": 600,
  "ceiling": 2500,
  "slots": 40
 },
 "call": {
  "open": 300,
  "floor": 150,
  "ceiling": 500,
  "slots": 40
 },
 "trades": {
  "open": 500,
  "floor": 300,
  "ceiling": 1000,
  "slots": 20
 },
 "there": {
  "open": 600,
  "floor": 400,
  "ceiling": 1000,
  "slots": 20
 },
 "errand": {
  "open": 300,
  "floor": 200,
  "ceiling": 500,
  "slots": 30
 },
 "form": {
  "open": 400,
  "floor": 200,
  "ceiling": 800,
  "slots": 30
 },
 "dispute": {
  "open": 1500,
  "floor": 1000,
  "ceiling": 3000,
  "slots": 10
 },
 "thai-plan": {
  "open": 2000,
  "floor": 1000,
  "ceiling": 5000,
  "slots": 10
 },
 "legalise": {
  "open": 1500,
  "floor": 1000,
  "ceiling": 3000,
  "slots": 10
 },
 "idme": {
  "open": 1500,
  "floor": 800,
  "ceiling": 3000,
  "slots": 10
 },
 "compare": {
  "open": 1500,
  "floor": 800,
  "ceiling": 4000,
  "slots": 10
 },
 "retire-setup": {
  "open": 25000,
  "floor": 15000,
  "ceiling": 50000,
  "slots": 4
 },
 "retire-month": {
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 20
 },
 "retire-hour": {
  "open": 600,
  "floor": 500,
  "ceiling": 1000,
  "slots": 40
 },
 "care-placement": {
  "open": 20000,
  "floor": 12000,
  "ceiling": 40000,
  "slots": 3
 },
 "care-visit": {
  "open": 1200,
  "floor": 800,
  "ceiling": 2000,
  "slots": 48
 },
 "care-visits-month": {
  "open": 4000,
  "floor": 3000,
  "ceiling": 6000,
  "slots": 12
 },
 "specialist": {
  "open": 3000,
  "floor": 1500,
  "ceiling": 6000,
  "slots": 16
 },
 "specialist-book": {
  "open": 800,
  "floor": 500,
  "ceiling": 1500,
  "slots": 30
 },
 "death-help": {
  "open": 15000,
  "floor": 10000,
  "ceiling": 30000,
  "slots": 2
 },
 "lab-test": {
  "open": 2500,
  "floor": 1500,
  "ceiling": 5000,
  "slots": 12
 },
 "clean-air": {
  "open": 2500,
  "floor": 1500,
  "ceiling": 5000,
  "slots": 10
 },
 "accident": {
  "open": 8000,
  "floor": 5000,
  "ceiling": 15000,
  "slots": 4
 },
 "caregiver-hire": {
  "open": 12000,
  "floor": 8000,
  "ceiling": 25000,
  "slots": 4
 },
 "lab-compound": {
  "open": 3000,
  "floor": 1500,
  "ceiling": 8000,
  "slots": 8
 },
 "blood-basic": {
  "open": 1500,
  "floor": 800,
  "ceiling": 3000,
  "slots": 30
 },
 "blood-full": {
  "open": 3000,
  "floor": 1500,
  "ceiling": 6000,
  "slots": 8
 },
 "specialist-hour": {
  "open": 800,
  "floor": 600,
  "ceiling": 1200,
  "slots": 20
 },
 "move-house": {
  "open": 30000,
  "floor": 20000,
  "ceiling": 50000,
  "slots": 2
 },
 "move-room": {
  "open": 15000,
  "floor": 10000,
  "ceiling": 25000,
  "slots": 3
 },
 "move-boxes": {
  "open": 8000,
  "floor": 5000,
  "ceiling": 12000,
  "slots": 4
 },
 "luggage": {
  "open": 800,
  "floor": 500,
  "ceiling": 1500,
  "slots": 10
 },
 "stay-rent": {
  "open": 6000,
  "floor": 3000,
  "ceiling": 12000,
  "slots": 8
 },
 "stay-check": {
  "open": 8000,
  "floor": 5000,
  "ceiling": 15000,
  "slots": 4
 },
 "stay-booking": {
  "open": 30000,
  "floor": 20000,
  "ceiling": 60000,
  "slots": 2
 },
 "stay-booking-run": {
  "open": 3000,
  "floor": 2000,
  "ceiling": 6000,
  "slots": 6
 },
 "agency-sheet": {
  "open": 2500,
  "floor": 1200,
  "ceiling": 6000,
  "slots": 3
 },
 "rent-vehicle": {
  "open": 800,
  "floor": 500,
  "ceiling": 1500,
  "slots": 20
 },
 "rent-event": {
  "open": 3000,
  "floor": 2000,
  "ceiling": 8000,
  "slots": 4
 },
 "let-find": {
  "open": 10,
  "floor": 8,
  "ceiling": 12,
  "slots": 3,
  "pct": true
 },
 "let-manage": {
  "open": 10,
  "floor": 8,
  "ceiling": 12,
  "slots": 15,
  "pct": true
 },
 "tour-cr": {
  "open": 8000,
  "floor": 6000,
  "ceiling": 12000,
  "slots": 16
 },
 "tour-cm": {
  "open": 8000,
  "floor": 6000,
  "ceiling": 12000,
  "slots": 12
 },
 "tour-3d": {
  "open": 20000,
  "floor": 15000,
  "ceiling": 30000,
  "slots": 4
 },
 "driver-day": {
  "open": 4000,
  "floor": 3000,
  "ceiling": 5000,
  "slots": 8
 },
 "guide-day": {
  "open": 3000,
  "floor": 2500,
  "ceiling": 4000,
  "slots": 10
 },
 "guide-day-other": {
  "open": 4000,
  "floor": 3000,
  "ceiling": 5000,
  "slots": 6
 },
 "experience": {
  "open": 1500,
  "floor": 1000,
  "ceiling": 2500,
  "slots": 20
 },
 "lantern-seat": {
  "open": 4000,
  "floor": 3000,
  "ceiling": 6000,
  "slots": 24
 },
 "balloon-cr": {
  "open": 12000,
  "floor": 10000,
  "ceiling": 15000,
  "slots": 8
 },
 "balloon-cm": {
  "open": 10000,
  "floor": 8000,
  "ceiling": 12000,
  "slots": 8
 },
 "paramotor": {
  "open": 4000,
  "floor": 3000,
  "ceiling": 5000,
  "slots": 12
 },
 "lang-new": {
  "open": 1500,
  "floor": 1000,
  "ceiling": 5000,
  "slots": 20,
  "tail": 500
 },
 "lang-check": {
  "open": 500,
  "floor": 300,
  "ceiling": 2000,
  "slots": 10,
  "tail": 150
 },
 "lang-stamp": {
  "open": 100,
  "floor": 50,
  "ceiling": 500,
  "slots": 40
 },
 "interp-phone": {
  "open": 400,
  "floor": 250,
  "ceiling": 800,
  "slots": 40
 },
 "interp-person": {
  "open": 3000,
  "floor": 2000,
  "ceiling": 5000,
  "slots": 8
 },
 "interp-day": {
  "open": 5000,
  "floor": 4000,
  "ceiling": 8000,
  "slots": 4
 },
 "zh-translate": {
  "open": 1200,
  "floor": 800,
  "ceiling": 2500,
  "slots": 20
 },
 "zh-interp-phone": {
  "open": 600,
  "floor": 400,
  "ceiling": 1200,
  "slots": 30
 },
 "zh-interp-person": {
  "open": 4000,
  "floor": 3000,
  "ceiling": 6000,
  "slots": 6
 },
 "lang-pages": {
  "open": 400,
  "floor": 250,
  "ceiling": 800,
  "slots": 20
 },
 "lang-shan": {
  "open": 800,
  "floor": 500,
  "ceiling": 1500,
  "slots": 20
 },
 "lang-leaves": {
  "open": 500,
  "floor": 300,
  "ceiling": 1000,
  "slots": 10
 },
 "thai-lessons": {
  "open": 600,
  "floor": 400,
  "ceiling": 1000,
  "slots": 20
 },
 "german": {
  "open": 1200,
  "floor": 800,
  "ceiling": 3000,
  "slots": 20
 },
 "grab-start": {
  "open": 3000,
  "floor": 2000,
  "ceiling": 5000,
  "slots": 10,
  "walk": "desk"
 },
 "grab-menu": {
  "open": 1500,
  "floor": 1000,
  "ceiling": 3000,
  "slots": 10,
  "walk": "desk"
 },
 "grab-care": {
  "open": 1000,
  "floor": 500,
  "ceiling": 2000,
  "slots": 20,
  "walk": "desk"
 },
 "signs": {
  "open": 250,
  "floor": 150,
  "ceiling": 500,
  "slots": 20
 },
 "print": {
  "open": 800,
  "floor": 400,
  "ceiling": 1500,
  "slots": 10
 },
 "trade-photos": {
  "open": 400,
  "floor": 200,
  "ceiling": 800,
  "slots": 60
 },
 "paybox": {
  "open": 4000,
  "floor": 2000,
  "ceiling": 8000,
  "slots": 4
 },
 "restaurant-desk": {
  "open": 6000,
  "floor": 3000,
  "ceiling": 12000,
  "slots": 6
 },
 "ordering": {
  "open": 10000,
  "floor": 5000,
  "ceiling": 20000,
  "slots": 3
 },
 "etsy-open": {
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 4
 },
 "etsy-run": {
  "open": 4000,
  "floor": 2000,
  "ceiling": 8000,
  "slots": 4
 },
 "online-shop": {
  "open": 25000,
  "floor": 15000,
  "ceiling": 60000,
  "slots": 3
 },
 "lineman-start": {
  "open": 2500,
  "floor": 1500,
  "ceiling": 4000,
  "slots": 12
 },
 "fb-care": {
  "open": 8000,
  "floor": 5000,
  "ceiling": 15000,
  "slots": 15
 },
 "ads-run": {
  "open": 8000,
  "floor": 5000,
  "ceiling": 15000,
  "slots": 8
 },
 "stall-page": {
  "open": 3000,
  "floor": 2000,
  "ceiling": 6000,
  "slots": 6
 },
 "trade-setup": {
  "open": 10000,
  "floor": 5000,
  "ceiling": 15000,
  "slots": 4
 },
 "trade-dropship": {
  "open": 100,
  "floor": 50,
  "ceiling": 200,
  "slots": 300
 },
 "trade-shelf": {
  "open": 300,
  "floor": 200,
  "ceiling": 500,
  "slots": 30
 },
 "trade-sourcing": {
  "open": 12,
  "floor": 8,
  "ceiling": 15,
  "slots": 40,
  "pct": true
 },
 "trade-qc": {
  "open": 1500,
  "floor": 800,
  "ceiling": 3000,
  "slots": 20
 },
 "trade-export": {
  "open": 1500,
  "floor": 800,
  "ceiling": 3000,
  "slots": 30
 },
 "trade-import": {
  "open": 1200,
  "floor": 600,
  "ceiling": 2500,
  "slots": 20
 },
 "trip-plan": {
  "open": 3000,
  "floor": 2000,
  "ceiling": 6000,
  "slots": 8
 },
 "event-page": {
  "open": 8000,
  "floor": 5000,
  "ceiling": 15000,
  "slots": 4
 },
 "event-kit": {
  "open": 10000,
  "floor": 6000,
  "ceiling": 20000,
  "slots": 2
 },
 "tribute": {
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 6
 },
 "keepsake": {
  "open": 8000,
  "floor": 5000,
  "ceiling": 15000,
  "slots": 4
 },
 "spirit-house": {
  "open": 3000,
  "floor": 2000,
  "ceiling": 6000,
  "slots": 4
 },
 "sak-yant": {
  "open": 4000,
  "floor": 2500,
  "ceiling": 8000,
  "slots": 8
 },
 "wed-full": {
  "open": 60000,
  "floor": 40000,
  "ceiling": 150000,
  "slots": 1
 },
 "wed-partial": {
  "open": 30000,
  "floor": 20000,
  "ceiling": 80000,
  "slots": 1
 },
 "wed-day": {
  "open": 20000,
  "floor": 12000,
  "ceiling": 40000,
  "slots": 2
 },
 "bride-concierge": {
  "open": 12000,
  "floor": 8000,
  "ceiling": 25000,
  "slots": 2
 },
 "event-plan": {
  "open": 20000,
  "floor": 10000,
  "ceiling": 60000,
  "slots": 2
 },
 "reading-en": {
  "open": 99,
  "floor": 49,
  "ceiling": 199,
  "slots": 20,
  "usd": true
 },
 "reading-th": {
  "open": 2500,
  "floor": 1500,
  "ceiling": 4000,
  "slots": 20
 },
 "bazi": {
  "open": 3000,
  "floor": 1500,
  "ceiling": 8000,
  "slots": 12
 },
 "iching": {
  "open": 2000,
  "floor": 1000,
  "ceiling": 5000,
  "slots": 12
 },
 "date-en": {
  "open": 59,
  "floor": 29,
  "ceiling": 99,
  "slots": 30,
  "usd": true
 },
 "date-th": {
  "open": 2000,
  "floor": 1000,
  "ceiling": 5000,
  "slots": 30
 },
 "name-pick": {
  "open": 1500,
  "floor": 800,
  "ceiling": 5000,
  "slots": 25
 },
 "name-biz": {
  "open": 3000,
  "floor": 1500,
  "ceiling": 8000,
  "slots": 10
 },
 "lucky-number": {
  "open": 600,
  "floor": 300,
  "ceiling": 1500,
  "slots": 60
 },
 "name-charm": {
  "open": 59,
  "floor": 29,
  "ceiling": 99,
  "slots": 25,
  "usd": true
 },
 "pha-yant": {
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 8
 },
 "amulet-check": {
  "open": 500,
  "floor": 300,
  "ceiling": 1500,
  "slots": 40
 },
 "amulet-buy": {
  "open": 1000,
  "floor": 600,
  "ceiling": 2500,
  "slots": 20
 },
 "almanac-widget": {
  "open": 10000,
  "floor": 6000,
  "ceiling": 25000,
  "slots": 1
 },
 "eink-clock": {
  "open": 12000,
  "floor": 8000,
  "ceiling": 30000,
  "slots": 2
 },
 "merit-alms": {
  "open": 300,
  "floor": 150,
  "ceiling": 600,
  "slots": 100
 },
 "merit-set": {
  "open": 800,
  "floor": 500,
  "ceiling": 3000,
  "slots": 60
 },
 "merit-gift": {
  "open": 500,
  "floor": 300,
  "ceiling": 1000,
  "slots": 40
 },
 "merit-fish": {
  "open": 500,
  "floor": 300,
  "ceiling": 1200,
  "slots": 30
 },
 "merit-dead": {
  "open": 3000,
  "floor": 2000,
  "ceiling": 6000,
  "slots": 6
 },
 "house-blessing": {
  "open": 8000,
  "floor": 5000,
  "ceiling": 15000,
  "slots": 8
 },
 "su-khwan-arr": {
  "open": 3000,
  "floor": 2000,
  "ceiling": 6000,
  "slots": 12
 },
 "lanna-wedding": {
  "open": 25000,
  "floor": 15000,
  "ceiling": 60000,
  "slots": 2
 },
 "web-minisite": {
  "open": 10000,
  "floor": 6000,
  "ceiling": 15000,
  "slots": 6
 },
 "web-site": {
  "open": 30000,
  "floor": 20000,
  "ceiling": 50000,
  "slots": 3
 },
 "vibe-check": {
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 10
 },
 "vibe-finish": {
  "open": 30000,
  "floor": 15000,
  "ceiling": 60000,
  "slots": 6
 },
 "vibe-hours": {
  "open": 2000,
  "floor": 1200,
  "ceiling": 3000,
  "slots": 40
 },
 "web-line": {
  "open": 25000,
  "floor": 12000,
  "ceiling": 50000,
  "slots": 3
 },
 "web-pwa": {
  "open": 15000,
  "floor": 6000,
  "ceiling": 30000,
  "slots": 3
 },
 "web-search": {
  "open": 5000,
  "floor": 2500,
  "ceiling": 10000,
  "slots": 6
 },
 "web-sharecard": {
  "open": 800,
  "floor": 400,
  "ceiling": 1500,
  "slots": 10
 },
 "web-found": {
  "open": 5000,
  "floor": 2500,
  "ceiling": 10000,
  "slots": 8
 },
 "web-mail": {
  "open": 1500,
  "floor": 800,
  "ceiling": 3000,
  "slots": 8
 },
 "web-move": {
  "open": 5000,
  "floor": 3000,
  "ceiling": 12000,
  "slots": 6
 },
 "web-license": {
  "open": 50000,
  "floor": 30000,
  "ceiling": 100000,
  "slots": 1
 },
 "android": {
  "open": 20000,
  "floor": 10000,
  "ceiling": 40000,
  "slots": 3
 },
 "sheet-app": {
  "open": 8000,
  "floor": 5000,
  "ceiling": 15000,
  "slots": 4
 },
 "game": {
  "open": 20000,
  "floor": 10000,
  "ceiling": 50000,
  "slots": 2
 },
 "directory": {
  "open": 20000,
  "floor": 12000,
  "ceiling": 40000,
  "slots": 2
 },
 "directory-run": {
  "open": 20000,
  "floor": 10000,
  "ceiling": 40000,
  "slots": 3
 },
 "accessible": {
  "open": 15000,
  "floor": 8000,
  "ceiling": 40000,
  "slots": 4
 },
 "wp-api": {
  "open": 10000,
  "floor": 6000,
  "ceiling": 20000,
  "slots": 3
 },
 "guide-site": {
  "open": 20000,
  "floor": 12000,
  "ceiling": 40000,
  "slots": 3
 },
 "web-care": {
  "open": 3000,
  "floor": 2000,
  "ceiling": 8000,
  "slots": 8
 },
 "web-workspace": {
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 8
 },
 "help-page": {
  "open": 10000,
  "floor": 6000,
  "ceiling": 20000,
  "slots": 3
 },
 "help-page-run": {
  "open": 3000,
  "floor": 1500,
  "ceiling": 8000,
  "slots": 3
 },
 "widget": {
  "open": 4000,
  "floor": 2500,
  "ceiling": 10000,
  "slots": 5
 },
 "tap-card": {
  "open": 500,
  "floor": 300,
  "ceiling": 1500,
  "slots": 20
 },
 "sec-hacked": {
  "open": 5000,
  "floor": 2500,
  "ceiling": 12000,
  "slots": 10
 },
 "sec-mail": {
  "open": 1500,
  "floor": 800,
  "ceiling": 4000,
  "slots": 10
 },
 "sec-redteam": {
  "open": 12000,
  "floor": 8000,
  "ceiling": 40000,
  "slots": 5
 },
 "mirror": {
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 6
 },
 "app-test": {
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 4
 },
 "dmarc-watch": {
  "open": 800,
  "floor": 500,
  "ceiling": 1500,
  "slots": 25
 },
 "ai-own": {
  "open": 25000,
  "floor": 15000,
  "ceiling": 50000,
  "slots": 2,
  "tail": 25000,
  "tail_usd": true
 },
 "ai-whitelabel": {
  "open": 20000,
  "floor": 8000,
  "ceiling": 50000,
  "slots": 4
 },
 "ai-line": {
  "open": 20000,
  "floor": 10000,
  "ceiling": 40000,
  "slots": 3
 },
 "ai-batch": {
  "open": 1000,
  "floor": 400,
  "ceiling": 3000,
  "slots": 15
 },
 "ai-monthly": {
  "open": 2000,
  "floor": 1000,
  "ceiling": 4000,
  "slots": 10
 },
 "crawl-pay": {
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 4
 },
 "demand-prices": {
  "open": 20000,
  "floor": 10000,
  "ceiling": 40000,
  "slots": 3
 },
 "ai-automation": {
  "open": 8000,
  "floor": 4000,
  "ceiling": 30000,
  "slots": 6
 },
 "data-leads": {
  "open": 2500,
  "floor": 1000,
  "ceiling": 5000,
  "slots": 10
 },
 "sec-msp": {
  "open": 2,
  "floor": 1,
  "ceiling": 5,
  "slots": 4,
  "usd": true
 },
 "data-crawl": {
  "open": 6000,
  "floor": 3000,
  "ceiling": 15000,
  "slots": 3
 },
 "data-research": {
  "open": 1200,
  "floor": 600,
  "ceiling": 5000,
  "slots": 8
 },
 "data-prices": {
  "open": 1500,
  "floor": 800,
  "ceiling": 4000,
  "slots": 8
 },
 "data-traffic": {
  "open": 1200,
  "floor": 600,
  "ceiling": 3000,
  "slots": 10
 },
 "street-survey": {
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 4
 },
 "romanise": {
  "open": 500,
  "floor": 300,
  "ceiling": 1000,
  "slots": 10
 },
 "event-lists": {
  "open": 3000,
  "floor": 1500,
  "ceiling": 6000,
  "slots": 6
 },
 "compare-biz": {
  "open": 8000,
  "floor": 4000,
  "ceiling": 25000,
  "slots": 3
 },
 "media-graphics": {
  "open": 6000,
  "floor": 3000,
  "ceiling": 12000,
  "slots": 4
 },
 "media-reels": {
  "open": 2000,
  "floor": 1000,
  "ceiling": 4000,
  "slots": 10
 },
 "media-doodles": {
  "open": 1000,
  "floor": 500,
  "ceiling": 3000,
  "slots": 8
 },
 "media-animation": {
  "open": 10000,
  "floor": 5000,
  "ceiling": 30000,
  "slots": 3
 },
 "media-decks": {
  "open": 6000,
  "floor": 3000,
  "ceiling": 25000,
  "slots": 4
 },
 "patterns": {
  "open": 2000,
  "floor": 1000,
  "ceiling": 5000,
  "slots": 8
 },
 "explainer": {
  "open": 30000,
  "floor": 15000,
  "ceiling": 80000,
  "slots": 2
 },
 "venue-map": {
  "open": 10000,
  "floor": 5000,
  "ceiling": 20000,
  "slots": 3
 },
 "cartoons": {
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 2
 },
 "interview": {
  "open": 15000,
  "floor": 10000,
  "ceiling": 30000,
  "slots": 3
 },
 "words-articles": {
  "open": 3000,
  "floor": 1500,
  "ceiling": 6000,
  "slots": 10
 },
 "words-copy": {
  "open": 4000,
  "floor": 2500,
  "ceiling": 8000,
  "slots": 6
 },
 "words-newsletter": {
  "open": 2000,
  "floor": 1000,
  "ceiling": 5000,
  "slots": 8
 },
 "words-social": {
  "open": 500,
  "floor": 300,
  "ceiling": 800,
  "slots": 20
 },
 "words-proposals": {
  "open": 6000,
  "floor": 3000,
  "ceiling": 12000,
  "slots": 3
 },
 "words-plan": {
  "open": 12000,
  "floor": 6000,
  "ceiling": 30000,
  "slots": 2
 },
 "sec-awards": {
  "open": 30000,
  "floor": 15000,
  "ceiling": 80000,
  "slots": 2
 },
 "merchant-check": {
  "open": 5000,
  "floor": 3000,
  "ceiling": 8000,
  "slots": 12
 },
 "merchant-fix": {
  "open": 15000,
  "floor": 8000,
  "ceiling": 40000,
  "slots": 6
 },
 "money-invoice": {
  "open": 1000,
  "floor": 500,
  "ceiling": 2500,
  "slots": 10
 },
 "co-books": {
  "open": 4000,
  "floor": 2500,
  "ceiling": 8000,
  "slots": 6
 },
 "money-payouts": {
  "open": 2000,
  "floor": 1000,
  "ceiling": 4000,
  "slots": 4
 },
 "money-exchange": {
  "open": 5000,
  "floor": 3000,
  "ceiling": 10000,
  "slots": 2
 },
 "staff-contract": {
  "open": 2500,
  "floor": 1500,
  "ceiling": 5000,
  "slots": 6
 },
 "payslips": {
  "open": 150,
  "floor": 100,
  "ceiling": 300,
  "slots": 30
 },
 "giving-desk": {
  "open": 30000,
  "floor": 20000,
  "ceiling": 60000,
  "slots": 2
 },
 "giving-run": {
  "open": 10000,
  "floor": 5000,
  "ceiling": 20000,
  "slots": 3
 },
 "gifts-ready": {
  "open": 100000,
  "floor": 50000,
  "ceiling": 200000,
  "slots": 1
 },
 "grant": {
  "open": 25000,
  "floor": 15000,
  "ceiling": 50000,
  "slots": 3
 },
 "findable": {
  "open": 50000,
  "floor": 30000,
  "ceiling": 80000,
  "slots": 2
 },
 "map-archive": {
  "open": 30000,
  "floor": 15000,
  "ceiling": 60000,
  "slots": 2
 },
 "line-memory": {
  "open": 15000,
  "floor": 8000,
  "ceiling": 30000,
  "slots": 3
 },
 "checkin": {
  "open": 10000,
  "floor": 6000,
  "ceiling": 20000,
  "slots": 3
 },
 "photo-proof": {
  "open": 30000,
  "floor": 15000,
  "ceiling": 60000,
  "slots": 2
 },
 "club-desk": {
  "open": 8000,
  "floor": 5000,
  "ceiling": 15000,
  "slots": 3
 },
 "funder-report": {
  "open": 8000,
  "floor": 5000,
  "ceiling": 20000,
  "slots": 3
 }
}
