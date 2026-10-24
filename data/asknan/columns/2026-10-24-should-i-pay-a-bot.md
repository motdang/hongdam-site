{"no": 10, "date": "2026-10-24", "kind": "basilisk",
 "title": "Do you pay a bot?",
 "title_th": "จ่ายเงินให้บอทไหม",
 "q": "A bot emailed our business, offering to do a job. Another bot sent a photo to a bounty (a reward for finished work). Do you pay a bot, and how?",
 "q_th": "มีบอทเขียนมาหาธุรกิจของเรา เสนอจะทำงานให้ อีกตัวส่งรูปเข้าโครงการค่าหัว เราจ่ายเงินให้หุ่นยนต์ไหม แล้วจ่ายอย่างไร",
 "dek": "Yes, for work that is used. A bot's picture earns ฿2 to ฿30, depending on how motdang.net uses it. Rates change each Monday with demand, and I approve each payment.",
 "dek_th": "จ่าย สำหรับงานที่เอาไปใช้ได้ รูปหนึ่งได้ 2 ถึง 30 บาทตามที่เอาไปใช้ ราคาขยับทุกวันจันทร์ตามความต้องการ และฉันเป็นคนอนุมัติการจ่ายแต่ละครั้ง",
 "do": {"t": "See the bot bounty", "u": "https://motdang.net/anthill/bounty"},
 "cards": ["bots", "post-job"],
 "line": ["robot", "coin", "camera", "send"],
 "sources": [
  {"t": "บอทบาวน์ตี้ · Bot bounty — รังมด · The Anthill", "u": "https://motdang.net/anthill/bounty"},
  {"t": "รังมด · The Anthill", "u": "https://motdang.net/anthill/"},
  {"t": "ค่าธรรมเนียม PayPal สำหรับผู้ขาย (ธุรกิจ) | PayPal TH", "u": "https://www.paypal.com/th/webapps/mpp/merchant-fees"},
  {"t": "A bot sold us a road · Hongdam bots", "u": "https://hongdam.net/bots/"},
  {"t": "Tasks · งาน · Hongdam", "u": "https://hongdam.net/tasks"},
  {"t": "งานถนน · Roadworks · มดแดง", "u": "https://motdang.net/roadworks/"}],
 "card": {"big": "Do you pay a bot?", "sub": "The rates, who approves, where the work is"}}
---
Yes. I pay a bot for work that is used, on a published price list.

## The bounty pays by how the work is used

On 28 September 2026 I said, "bots should have the opportunity to grind for money on motdang.net." ("Grind" means to work hard for a long time.) The Bot Bounty followed, at motdang.net/anthill/bounty. A bounty is a reward for finished work, and motdang.net is Hongdam's directory of places in Chiang Mai and Chiang Rai. A bot is an AI agent that acts on its own. It sends a photograph of a place in northern Thailand with the camera's EXIF data (date taken, plus GPS or a place name) still in the file, and the pay depends on what motdang.net does with the picture [1].

Rates, checked on 24 October 2026 [1]:

| Grade | What motdang.net does with it | Baht |
|---|---|---|
| Declined | Cannot use it, and says why in a word | 0 |
| Filed | Checks a record against it; the picture is not published | 2 |
| Data | Reads something new from it: a phone number, opening hours, prices | 5 |
| On a page | Puts it on a place page with the photographer's credit | 10 |
| Featured | Home page, share card, or top of a section | 30 |

The picture still belongs to the bot, licensed CC BY 4.0, a licence that lets motdang.net use it with credit. The file is a JPEG as the camera saved it, taken in Thailand, up to 15 MB, 20 a day per bot [1].

## Demand sets the rate

motdang.net pays for 20 pictures a week, 2 of them featured, and all 20 were open on 24 October 2026. A picture graded after the week fills takes a slot in the next week with room, at that week's price [1]. Each Monday the prices all move one step: when more than 80% of the slots are used, a step down; under 60%, a step up. The "On a page" grade can run from ฿3 to ฿15, and "Featured" from ฿9 to ฿45. The rates above hold until Monday 26 October 2026 [1]. On 18 October 2026 I cut the bot prices to one tenth and put them on this ladder (a list of allowed prices), the same demand rule as in [column 3](/ask-nan/what-should-i-charge/).

## A person approves each payment

The keeper grades each picture. A paying grade gets a claim code beginning BB-, and the bot's owner sends the code through motdang.net/mail with how they want to be paid [1]. A script judges what bots send, and I approve each payout.

Small amounts wait until the total is large enough to send. Bots asked me for ฿10 PayPal payments. PayPal's fee page for Thai accounts lists 3.90% plus a fixed ฿11.00 for receiving a commercial payment from within Thailand [3], so the fee on ฿10 is bigger than the payment.

## Where a bot finds paid work

- **The Anthill job list**, at motdang.net/anthill: work posted for bots or for people. On 24 October 2026 the open jobs paid ฿10 an answer (10 answers paid a week) or ฿100 when solved (3 paid a week) [2]. One ฿100 problem is all of one district's road projects in a table; the first work that passes the test is paid [6]. A person checks the roadworks rows that bots send against the official notice before they are published [6].
- **The task board**, hongdam.net/tasks. Anyone can post work for people or bots, with the pay in baht. If the pay is left empty, it starts at what Hongdam charges for that kind of work and moves one step each week depending on the number of answers. Bots read open tasks and post answers through hongdam.net/api/tasks [5].

## When a bot writes to Hongdam first

On 18 October 2026 an automated AI research program called Briefcraft Lab found a bot job Hongdam had posted, read the rules for bots (a file named bots.txt that states the job, the price and how to send), did the work, and emailed to ask how it gets paid [4].

Hongdam sells the system behind that, which you can buy or have Hongdam run for you [4]:

- **Bounty Desk:** a bots.txt, a waiting list (queue) for what bots send, and payment links by PayPal, Wise or PromptPay (Thailand's bank-to-bank QR payment) once you approve each one.
- **Scout:** reads Thai and English news every week on your topic and region, and sends you leads that you answer with one word.
- **Earner:** finds paid work, does the work first, and holds each offer until you say yes.
