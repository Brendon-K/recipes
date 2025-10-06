# Link to site
https://brendon-k.github.io/recipes/frontend/html/

# Notes to add
- [x] Sort ingredients by category
- [x] Make autocomplete in recipe search work on mobile
- [ ] CSS...
- [x] Remove time from recipe entry if it's 0
- [x] Convert minutes to hours if lots of minutes
- [x] Able to add tags to recipes so that you can search for a type of recipe. e.g. chicken, vegetarian, breakfast, snack, dessert, etc.
  - [ ] Add tag button to existing recipe on search
  - [x] Add a tag box when creating a recipe (maybe just comma-separated instead of multiple boxes).
- [ ] Make selectable search function so you can search recipes by various terms. domain, author, tag, ingredient, etc.
  - [x] recipe title
  - [ ] domain
  - [ ] author
  - [x] tag
  - [x] ingredient
- [ ] Add a visible indicator on the page to show if the recipes are still loading
- [ ] Allow fractional entries in quantity (e.g. 1/8 teaspoon instead of .125 teaspoon)
- [ ] "Cook Mode?" would it be possible to prevent phone from sleeping while recipe page is open?
- [ ] *maybe* auto suggest units for consistency
- [ ] *maybe* keep a list of ingredients that have been added to recipes, auto suggest for consistency
- [ ] *maybe* add a new category in ingredients for modifiers. For example: "Fresh," "Warmed," "Canned," etc.
- [ ] Shopping list generator? Select multiple recipes, generates shopping list.
  - Could potentially be quite challenging to combine similar ingredients without combining distinct ingredients. For example: "milk" and "milk, warmed" are the same ingredient, but "milk" and "oat milk" would be separate ingredients.
    - Might also be challenging to combine weird measurements. Like cup + tablespon
    - Even MORE challenging to combine something like cup + gram as each ingredient will have its own distinct density. 
      - Hopefully there's a database somewhere for this that I can use...
- [ ] better login form

# Issues
- For some reason login/out buttons are being really stupid. Sometimes they both appear at the same time, which shouldn't happen.
 - Choosing to ignore this until I implement CSS. idk if that'll even change anything but... whatever

## REMINDER FOR ME

python -m http.server 5500

uvicorn backend.main:app --reload --port 8000
