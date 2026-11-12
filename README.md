# Askıda: interactive prototype

Askıda is a neighborhood donation app that connects donors with verified recipients in Istanbul. This repo holds a clickable prototype that looks and behaves like the mobile app. We use it in our presentation.

**Live site:** https://macblack1205.github.io/group-project/ (works after the GitHub Pages setup below)

## What's inside

- **17 screens** in the order of the user flow: Welcome, Log In, Sign Up, Verification, Home, Explore (map and list), Item Detail, Request Item, Request Sent, Donation (3 steps), Donation Published, Tracking, Messages, Chat, Profile, Fair Distribution and Notifications.
- **Fair distribution rules** from our teacher's feedback:
  - Monthly limits per category: Food 5, Clothing 3, Books 3, Household 2 (13 in total).
  - At most 3 active requests at a time.
  - Each item can be requested once per person.
  - Food and clothing get priority.
  - Users see their remaining requests on Home and Profile.
- **Notes panel:** every screen has a short explanation (what it shows, why it matters, what to try) plus team notes.
- **Suggestions panel:** write what should change. Claude reads the suggestions and updates the prototype.
- On a phone, the site opens full screen like a real app. The notes panel is behind the round button in the top-right corner.

## Put it online with GitHub Pages (one time, about 2 minutes)

1. **Upload the files.** Open the repo on GitHub, click **Add file → Upload files**, and drag in everything from the `askida-prototype` folder: `index.html`, `README.md`, and the `css` and `js` folders. `index.html` must sit at the top level of the repo, not inside another folder. Click **Commit changes**.
2. **Turn on Pages.** Go to **Settings → Pages**. Under *Build and deployment*, set **Source** to **Deploy from a branch**, then set **Branch** to **main** and the folder to **/ (root)**. Click **Save**.
3. **Wait 1–2 minutes** and refresh the Pages settings page. GitHub shows your address at the top: `https://macblack1205.github.io/group-project/`
4. **Updating:** whenever you upload a changed file, the site rebuilds by itself within about a minute.

Two settings must stay on:
- The repo must be **public**, because free GitHub accounts only publish Pages from public repos.
- **Issues** must be on (Settings → General → Features → Issues), because notes and suggestions are stored there.

## How notes and suggestions work

They are saved as **GitHub Issues** in this repo, so everyone on the team sees the same list. There is no database to set up.

1. Write a note or suggestion in the panel and press **Post note** or **Send suggestion**.
2. GitHub opens in a new tab with your text already filled in. Press **Create**. You need to be signed in to GitHub.
3. Back on the prototype, the item appears in the panel within about a minute (press **Refresh** if needed).

To apply suggestions, ask Claude: *"apply the open suggestions from the Askıda repo"*. Claude then:
1. reads the open suggestion issues
2. changes the prototype
3. closes each issue it applied

Closed suggestions show as **Applied** in the panel.

## Presenting

| Key or button | What it does |
|---|---|
| ← → | Previous / next screen |
| **P** or **Present** | Presentation mode: a big phone with the screen explanation beside it |
| **H** or **Tap hints** | Highlights everything you can tap, like a Figma prototype |
| **Reset demo** | Puts the demo data back to the start |

Clicking an empty part of the phone also flashes the tappable areas.

The demo keeps its state (requests you made, donations you posted) in your browser, so it survives a page reload. Press **Reset demo** before you present.

## Changing content

- Texts, items, limits, and the screen explanations live in **`js/data.js`**. It is the easiest file to edit.
- Screens and app behavior: `js/app.js`
- Illustrations and icons (all drawn in code, no image files): `js/art.js`
- Notes and suggestions panel: `js/team.js`
- Colors and layout: `css/styles.css`. The palette comes from our project document: Cream `#E9E4D8`, Sage `#A8B69A`, Nude `#D8B9A5`, Green `#6F8067`, Dark Green `#343B32`.

## Open question for the team

The teacher's text says *"up to 5 items per month"* in one place, but the category table adds up to *13 items per month*. This version follows the table. To use 5 instead, change `TOTAL` in `js/data.js`, or send it as a suggestion.
