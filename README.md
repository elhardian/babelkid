# BabelKids

Website for **BabelKids** preschool & kindergarten — landing site, staff dashboard, and parent mobile app UI.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Mock data (no backend yet)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Path | Description |
|------|-------------|
| `/` | Interactive marketing landing page |
| `/dashboard` | Staff overview (monochrome) |
| `/dashboard/students` | Students + parent contacts |
| `/dashboard/classes` | Class management |
| `/dashboard/tuition` | Tuition per student (month filter) |
| `/dashboard/events` | Events, fees, documentation |
| `/dashboard/finance` | Finance report |
| `/dashboard/presence` | Mobile-friendly attendance |
| `/dashboard/reports` | Teacher-submitted student reports |
| `/parents` | Parent home (mobile app shell) |
| `/parents/tuition` | Payment history + month filter |
| `/parents/pay` | Submit payment proof |
| `/parents/events` | Upcoming / past events |
| `/parents/events/[id]` | Interactive event documentation |
| `/parents/presence` | Child attendance |
| `/parents/reports` | Teacher reports for the child |

Demo parent session is linked to student **Alya** (Sari Rahman).
