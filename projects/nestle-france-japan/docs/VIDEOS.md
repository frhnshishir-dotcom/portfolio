# The two advertising videos (slide 11)

The assignment requires two advertising videos. Slide 11, **"Same brand. Two cultural codes."**, shows two official KitKat ads side by side:
one made for France and one made for Japan.
It follows slide 10 ("Translate the meaning, not just the slogan"), so the principle comes first and the two real ads then show it.

Using the **same brand and product** in both markets keeps the comparison fair: the difference you see is the market, not the category.

| | France | Japan |
|---|---|---|
| Ad | **“Better Breaks”** (YouTube title: “PUB KITKAT® BETTER BREAKS”) | **キット、サクラサクよ** (“Kitto, sakura saku yo”, *Surely, the blossoms will bloom*), 30-second version |
| Brand | KitKat (Nestlé) | KitKat (Nestlé Japan) |
| Channel | KITKAT France, `youtube.com/@kitkatfrance7778` | ネスレ日本公式チャンネル (Nestlé Japan official channel), `youtube.com/@nestlewmc` |
| URL | https://www.youtube.com/watch?v=HCBP72vABBk | https://www.youtube.com/watch?v=hvyWq_mOpIo |
| Length | 0:21 (the player reports 0:20) | 0:30 |
| Date | Published about a year before November 2026 (YouTube shows only a relative date from here) | January 2024 campaign; published about two years before November 2026 |
| Views (17 Nov 2026) | 5.3 million | 457,000 |

## How authenticity was checked

- **YouTube oEmbed** (`youtube.com/oembed`) for each URL returned HTTP 200, which means public and embeddable.
  It also gave the owner: “KITKAT France” and “ネスレ日本公式チャンネル”.
- **The Japanese campaign is documented by Nestlé Japan.**
  - The video's own description says encouragement messages to exam candidates from across Japan were projected as “message cherry blossoms” at Harajuku JING for 10 days, starting the day before the national university entrance test.
  - Nestlé Japan's January 2024 press release and AdverTimes describe the same installation (12–21 January).
- **The French ad shows French legal mentions.**
  - It carries the mandatory “Pour votre santé…” health banner with mangerbouger.fr.
  - It translates the English word: “\*break = pause”.
  - Both point to an ad cleared for French broadcast.
- **What was rejected:**
  - A 15-second KitKat exam ad that had been listed in search results turned out to be private.
  - Several French Maggi and KitKat ads are only on re-upload channels (PubTélé, PubTVgratuites and others), so they were not used.
- **Not checked from here:** YouTube shows no verified badge on either channel. Ownership rests on the channel names, the volume of paid views and the legal mentions.
  This is listed under manual checks below.

## How the videos play

Nothing autoplays.
- **Before a click**, each ad is a poster: the video's own YouTube thumbnail, stored locally in `assets/video/`. It has a play button and a fallback link.
- **One click** loads YouTube's privacy-enhanced player (`youtube-nocookie.com`) in place, with YouTube's own controls: play/pause, seek, volume, captions and full screen.

| Where the deck runs | What happens | Status |
|---|---|---|
| **Browser, served over http** (`Start Presentation.bat` with Python, `start-presentation.sh`, any web host) | Click the poster: the ad plays inside the slide | Tested: the player loaded “PUB KITKAT® BETTER BREAKS · KITKAT France · 0:20” with controls. The build sandbox blocks YouTube's video stream servers, so actual frames were not played back here. **Do one test play on the presentation laptop.** |
| **`index.html` opened straight from disk** (`file://`) | The poster opens the ad on YouTube in a new tab | YouTube refuses embeds from pages without a web origin. This was tested: “Error 153 · Video player configuration error”. So the deck switches to link mode by itself, and the cue reads “Play on YouTube ↗”. |
| **The claude.ai link** (iPad copy) | The poster opens the ad on YouTube in a new tab | Embedded frames are not allowed on that host, so that build is set to link mode. Tested. |
| **Static PowerPoint** | In Slide Show, clicking a poster opens the ad on YouTube | Two invisible link areas over the posters. Each URL is also in the speaker notes. For an embedded player in PowerPoint: Insert → Video → Online Video, then paste the URL. |
| **Canva** | Paste the URL onto the slide (or use **Embed**) | Canva embeds YouTube natively and plays it in Present mode. It needs internet. |

**Internet is required** for the videos in every case. Everything else in the deck works offline.

**Navigation stays safe:**
- Clicking a poster never changes slide.
- After a click inside the player, keyboard focus returns to the deck, so ← → and Space keep working. Pause the video with the mouse.
- Leaving the slide, replaying it (R) or starting the other ad unloads the player, so sound always stops.
- Only one ad plays at a time.

## The analysis on the slide

Green labels mark what is observed in the ad. Amber labels mark the team's interpretation.

**France: “Better Breaks”**
1. **Target market:** French adults, and the everyday break at work or study.
2. **Behaviour and context:**
   - The ad shows the work break amid information overload.
   - On screen: “\*break = pause”, the French rendering of the English word that French language law (Loi Toubon, 1994) expects in advertising.
   - It also carries the mandatory health banner (law of 9 August 2004; decree of 27 February 2007).
3. **Versus Japan:** humour and individual relief. The product and the “break” idea stay at the centre.
4. **What it shows:** the global “Have a break” platform travels. Nestlé localises the language and the legal mentions, not the idea.

**Japan: キット、サクラサクよ**
1. **Target market:** students facing university entrance exams, and the family, friends and teachers who support them.
2. **Behaviour and context:**
   - Exam-season encouragement, shown as cherry blossoms made of messages.
   - “Sakura saku” (the cherry blossoms bloom) was the traditional telegram for “passed”.
   - “Kitto” echoes the brand name; “kitto katsu” means “you will surely win”.
3. **Versus France:** emotional and collective. The brand carries other people's encouragement instead of selling a personal pause.
4. **What it shows:** Nestlé localises the meaning. The name, a season and a ritual make KitKat a good-luck gift.

Together, the two ads support slide 12's finding: **global platform, local execution**.

## Quality-control checklist (videos)

| Check | Result |
|---|---|
| Official channels; not AI-generated; not re-uploads | Yes (oEmbed owner names above) |
| URLs live, public and embeddable (oEmbed HTTP 200) | Yes, 17 Nov 2026 |
| Country and brand label, campaign name, duration on the slide | Yes |
| Four-point analysis per ad (market, context, contrast, lesson) | Yes |
| No autoplay; visible play button and YouTube controls | Yes |
| Fallback link visible under each video | Yes |
| file:// and claude.ai fall back to opening YouTube (no fake embed) | Yes, tested |
| Clicking or keyboard after playing never breaks navigation; leaving stops sound | Yes, tested (Playwright) |
| Transitions into and out of slide 11 | `advertising>ads` (page turn), `ads>findings` (the two ads close in). Tested at fixed times. |
| Static PowerPoint posters link to the videos | Yes |
| Actual playback with sound on the presentation machine | **Manual: play each ad once before presenting** |
