https://brendon-k.github.io/recipes/frontend/

Notes to add:
- Remove time from recipe list if it's 0
- Also change formatting of times. It's kinda ugly.
- *maybe* auto suggest units for consistency
- *maybe* keep a list of ingredients that have been added to recipes, auto suggest for consistency
- *maybe* add a new category in ingredients for modifiers. For example: "Fresh," "Warmed," "Canned," etc.
- Shopping list generator? Select multiple recipes, generates shopping list.
  - Could potentially be quite challenging to combine similar ingredients without combining distinct ingredients. For example: "milk" and "milk, warmed" are the same ingredient, but "milk" and "oat milk" would be separate ingredients.
    - Might also be challenging to combine weird measurements. Like cup + tablespon
    - Even MORE challenging to combine something like cup + gram as each ingredient will have its own distinct density. 
      - Hopefully there's a database somewhere for this that I can use...

REMINDER FOR ME
python -m http.server 5500
uvicorn backend.main:app --reload --port 8000