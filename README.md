# Bathroom Planner V1.6.0

Complete replacement package.

New:
- Product Library tab
- Bath Lab Lille 800mm antique-oak wall-hung vanity seeded as the first test product
- exact real product dimensions: 805 W x 460 D x 539 H mm
- custom 2D representation and enhanced 3D vanity representation
- add a product photo directly in the app
- create/edit reusable products without rebuilding GitHub
- locally compressed product photos
- place products into the plan with one tap
- import/export individual product JSON files
- product URLs, supplier, SKU, finish, mounting type and notes stored in the library

Important:
The static app can store a photo and manually-entered product details directly.
It cannot reliably scrape arbitrary retailer webpages or use AI vision by itself without a backend/API.
For AI extraction, a product can be analysed in ChatGPT and imported as a small product JSON file — no app rebuild required.

Update:
Extract and upload ALL files to the root of the existing GitHub repo, then commit.
