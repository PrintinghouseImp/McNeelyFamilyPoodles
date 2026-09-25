# Where we left off — 2026-09-24

Pickup note for the next session. Live site: https://mcneelyfamilypoodles.com
Repo: https://github.com/PrintinghouseImp/McNeelyFamilyPoodles
Netlify deploys from `main`. Do not treat the separate Vercel project as the live host.

## Shipped today

- Public header: 40px R2 logo, wordmark “McNeely Family Poodles”, links Our Program / Puppies / Parents, Log in, Apply. No Home link.
- Fonts on public pages only: Fraunces for headings and the wordmark, DM Sans for body, nav, and buttons.
- Homepage: hero copy plus looping video `images.mcneelyfamilypoodles.com/home/hero.mp4`. Pauses when the browser asks for reduced motion. Large black “View available puppies” button under the hero. No invented puppies.
- Apply chooser is a centered modal (Find a puppy, Become a guardian, Partner as rescue). Backdrop or X closes it.
- Puppy application: Google/Facebook still required. Optional, up to two published puppies. Guardian requests use the same form and are marked guardian. Deposit disclaimer is above submit.
- `/apply/rescue` saves a 501(c)(3) form. Admin list is `/admin/rescue`.
- About / Our Program uses the supplied story. Staff: Janine Neely (Gene Jockey), then Ralph McBride (Poodle Ranger). Interns: Oleander Lawrence (Master of Puppies). `About/Oleander.jpg` was a 404, so her photo is omitted until that file exists.
- Our Program logo is `About/McNeely Logo.jpg`, above the bold headline “our program”.
- Footer, under the Elite Miniature Poodles line: Contact: 970-581-8723.
- Footer “Articles” label is “Learn More”. Route is still `/articles`.
- Admin: parents table scrolls and sorts. Puppy list sorts by birth date, then name. Dam and sire dropdowns are published, non-retired parents. Status Sold is labeled Sold, not Adopted. Photo upload stays gray until a file is chosen.
- Earlier the same day: portal medical files download through `/api/vault/[id]` instead of a raw image URL. Public price shows only when status is Available.

## Do not undo

- Do not restore Quinn, Luna, Severus, Merlin, or Sirius unless asked.
- Do not invent bios, forever-home families, social posts, or health claims.
- Stripe and payment email are in the code. They were not configured on Netlify the last time `/api/health` was checked.

## Still open

- Replace the two sample social posts in admin, or unpublish them.
- Forever Homes still has the seed families (Rivera, Chen, Brooks, Patel). Those are not real placements.
- Shop is empty.
- Oleander’s photo is missing at `About/Oleander.jpg`.
- Decide whether sold alumni dogs should stay in the public puppy application dropdown. It currently lists every published puppy.
