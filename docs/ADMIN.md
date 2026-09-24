# Admin click-paths

Breeder tasks on the local app. Sign in at `/admin/login` with the admin username and password. A Google or Facebook customer account cannot open `/admin` or run these actions; those sessions are sent to `/portal`.

Public puppy status words: Available, Under deposit, Sold, Guardian, Not available. The public site shows a price only when status is Available.

Weight and height are on parents. Status and price are on puppies. Litters use Notes, not a separate description field.

Unpublish any of these by opening it, unchecking **Published on public site**, and saving. Delete is the **Danger zone** button on the edit page. A parent who is still on a litter is not deleted; unpublish them, or delete the litter first.

## New parent

1. Admin → **Sires & Dams** (`/admin/parents`).
2. **Add parent**.
3. Fill name, sex (dam or sire), color, weight, height, and description. Leave slug blank to generate it from the name.
4. Leave **Published on public site** checked to show them on `/parents`. Check **Retired** only when they should move to Alumni.
5. **Create parent**. You land on that parent's edit page. Change fields later with **Save changes**.

## New litter

1. Admin → **Litters** (`/admin/litters`).
2. **Add litter**.
3. You need at least one female parent and one male parent.
4. Enter display name, birth date, dam, sire, and notes.
5. Leave **Published on public site** checked.
6. Submit **Create litter**.

## Add puppies

1. Admin → **Puppies** (`/admin/puppies`).
2. **Add puppy**.
3. Fill name, sex, status, color, price (USD), birth date, litter, and description.
4. Leave **Published on public site** checked to show them on `/puppies`. **Adopted** moves them to Alumni and sets status to Sold.
5. Submit **Create puppy**. You land on that puppy's edit page, where the same fields can be changed.

## Photos

On a parent, puppy, or litter edit page, use the **Photos** section.

1. **Add photo**. The file button accepts a phone camera shot or an existing image file.
2. Optional alt text. Check **Set as hero photo** for the card image. The first photo becomes the hero even if you leave that unchecked.
3. **Upload photo**. The file is stored on the existing R2 bucket when R2 env vars are set, and the public page uses that URL.
4. On another photo, **Set hero** swaps the hero. **Delete** removes the file. If you delete the hero, the next photo becomes the hero.

## Medical file

1. On the parent or puppy edit page, **Add record** (or Admin → **Medical records** → **Add record**).
2. Enter a title, pick that parent or puppy, and choose a PDF or image (camera or file).
3. **Save medical record**.

Parent files stay admin-only. Puppy files show in the customer portal only after an ownership grant. The portal download button uses `/api/vault/[id]` and does not link the raw file URL. The customer must be signed in and granted that puppy.

## Article

1. Admin → **Articles** (`/admin/articles`). On a phone, scroll the top admin links until **Articles** appears.
2. **New article**.
3. Fill title and content. Excerpt and cover are optional.
4. Check **Published on public site** to show it. Leave it unchecked to keep a draft.
5. **Create article**.
6. Published articles are listed at `/articles` and opened at `/articles/[slug]`.
7. To unpublish, open the article, uncheck **Published on public site**, and save. **Delete article** removes it.

## Ownership grant

The customer must sign in to `/portal` with Google or Facebook once, so their email exists.

1. Admin → **Puppies** → open the puppy.
2. Section **Owner access (portal)**.
3. Enter their portal email. Optional notes.
4. **Grant portal access**.
5. They then see that puppy under `/portal/dogs` and can download its medical files.
6. **Revoke** on the same page, or Admin → **Ownerships** → **Revoke**.

Do not grant access to a dog you have not decided to place. This does not publish a dog that is unpublished.
