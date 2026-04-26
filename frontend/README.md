# Mutual NDA Creator

A Next.js web app that uses Claude AI to generate a completed Mutual Non-Disclosure Agreement from minimal user inputs. Users fill in party details and key terms, the AI populates the full NDA template, and the result can be downloaded as a `.md` file.

## Setup

1. Copy `.env.local.example` to `.env.local` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How it works

1. Fill in Party 1 and Party 2 details (name, title, company, address)
2. Set the agreement terms (purpose, dates, governing law, jurisdiction)
3. Click **Generate NDA** — Claude fills in the full cover page
4. Review the preview and click **Download .md** to save locally

## Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-python) (claude-sonnet-4-6)
- Template: [Common Paper Mutual NDA](https://github.com/commonpaper/Mutual-NDA) (CC BY 4.0)
