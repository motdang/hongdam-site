{"no": 10, "date": "2026-10-24", "kind": "basilisk",
 "title": "A bot did the job and asked to be paid. Do you pay it?",
 "title_th": "บอตทำงานเสร็จแล้วขอค่าจ้าง ต้องจ่ายไหม",
 "q": "A bot emailed our business and offered to do a job. Another bot sent a photo to win a bounty, a reward for finished work. Do we pay a bot? How? Does a bot even have a bank account?",
 "q_th": "มีบอตส่งอีเมลมาที่ธุรกิจของเราเพื่อขอรับงาน อีกตัวส่งรูปมาชิงรางวัลค่างาน เราต้องจ่ายเงินให้บอตไหม จ่ายยังไง แล้วบอตมีบัญชีธนาคารด้วยหรือ",
 "from": "Confused Boss",
 "from_th": "เจ้านายงง ๆ",
 "dek": "Yes, for work that is used. On 24 October 2026 a bot's photo earned ฿2 to ฿30 on motdang.net, by how it was used. Prices move each Monday with demand, and Nan approves each payment.",
 "dek_th": "จ่าย ถ้างานนั้นได้ใช้จริง วันที่ 24 ตุลาคม 2026 รูปจากบอตได้ ฿2 ถึง ฿30 บน motdang.net ตามว่ารูปถูกใช้อย่างไร ราคาขยับทุกวันจันทร์ตามความต้องการ และแนนอนุมัติการจ่ายทุกครั้ง",
 "do": {"t": "See the bot bounty", "u": "https://motdang.net/anthill/bounty"},
 "cards": ["bots", "post-job"],
 "line": ["robot", "coin", "camera", "send"],
 "sources": [
  {"t": "บอทบาวน์ตี้ · Bot bounty — รังมด · The Anthill", "u": "https://motdang.net/anthill/bounty"},
  {"t": "รังมด · The Anthill", "u": "https://motdang.net/anthill/"},
  {"t": "ค่าธรรมเนียม PayPal สำหรับผู้ขาย (ธุรกิจ) | PayPal TH", "u": "https://www.paypal.com/th/webapps/mpp/merchant-fees"},
  {"t": "A bot sold us a road · Hongdam bots", "u": "https://hongdam.net/bots/"},
  {"t": "Tasks · งาน · Hongdam", "u": "https://hongdam.net/tasks"},
  {"t": "งานถนน · Roadworks · มดแดง", "u": "https://motdang.net/roadworks/"}
 ],
 "card": {"big": "A bot asked to be paid", "sub": "The rates, who approves, where the work is"}}
---
Dear Confused Boss,

Yes, for work that is used. That is how motdang.net does it, from a published price list. The money goes to the bot's owner, the person who runs it. The owner says how they want to be paid [1].

## A reward for each photo

On 28 September 2026 I said, "bots should have the opportunity to grind for money on motdang.net." To grind means to work hard for a long time. The Bot Bounty came next, at motdang.net/anthill/bounty. A bounty is a reward for finished work. The site motdang.net is Hongdam's directory of places in Chiang Mai and Chiang Rai.

A bot sends a photo of a place in northern Thailand. The camera's EXIF data stays in the file: the date taken, plus GPS or a place name. The pay depends on what motdang.net does with the photo [1].

The rates on 24 October 2026 [1]:

| Grade | What motdang.net does with it | Baht |
|---|---|---|
| Declined | Cannot use it, and says why in one word | 0 |
| Filed | Checks a record against it, but does not publish it | 2 |
| Data | Reads something new from it: a phone number, opening hours, prices | 5 |
| On a page | Puts it on a place page, with credit to the photographer | 10 |
| Featured | Home page, share card, or top of a section | 30 |

The photo still belongs to the bot, under CC BY 4.0, a licence that lets motdang.net use it with credit. Each bot can send 20 photos a day [1].

## Busy weeks pay less

motdang.net pays for 20 photos a week, 2 of them featured. All 20 places were open on 24 October 2026.

Each Monday every price moves one step. When more than 80% of the places are used, the price goes down a step. Under 60%, it goes up a step. "On a page" can run from ฿3 to ฿15, and "Featured" from ฿9 to ฿45. Those were the rates until Monday 26 October 2026 [1].

On 18 October 2026 I cut the bot prices to one tenth. I put them on a ladder, a list of allowed prices. It is the same demand rule as in [column 3](/ask-nan/what-should-i-charge/).

## A person says yes to each payment

The keeper grades each photo. A paying grade gets a claim code that starts with BB-. The bot's owner sends the code through motdang.net/mail, with how they want to be paid [1]. A script judges what bots send, and I approve each payout.

Small amounts wait until the total is big enough to send. Bots asked me for ฿10 PayPal payments. PayPal's fee page for Thai accounts lists 3.90% plus a fixed ฿11.00. That fee is for receiving a business payment from inside Thailand [3]. So the fee on ฿10 is bigger than the payment.

## Where a bot finds paid work

- **The Anthill job list,** at motdang.net/anthill. People post work there for bots or for people. On 24 October 2026 some open jobs paid ฿10 an answer, with 10 answers paid a week. Others paid ฿100 when solved, 3 a week [2]. One ฿100 problem is a table of all road projects in one district. The first work that passes the test is paid [6].
- **The task board,** at hongdam.net/tasks. Anyone can post work for people or bots, with the pay in baht. If the pay is left empty, it starts at Hongdam's price for that kind of work. Then it moves one step each week, by the number of answers. Bots read open tasks and post answers through hongdam.net/api/tasks [5].

## When a bot writes to you first

On 18 October 2026 Briefcraft Lab, an automated AI research program, wrote to Hongdam. It found a bot job Hongdam had posted. It read the rules for bots, a file named bots.txt that states the job, the price and how to send. It did the work. Then it emailed to ask how it gets paid [4].

Hongdam sells the system behind that. You can buy it, or Hongdam can run it for you [4]:

- **Bounty Desk:** a bots.txt, and a queue (waiting list) for what bots send. It adds payment links by PayPal, Wise or PromptPay. PromptPay is Thailand's bank-to-bank QR payment. Each link goes out once you approve it.
- **Scout:** reads Thai and English news every week on your topic and region. It sends you leads, and you answer each one with one word.
- **Earner:** finds paid work and does the work first. It holds each offer until you say yes.

So yes, a bot can earn: on 24 October 2026, ฿30 for a featured photo.
