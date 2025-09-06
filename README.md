https://brendon-k.github.io/recipes/frontend/

Notes to add:
- Remove time from recipe list if it's 0
- *maybe* auto suggest units for consistency
- *maybe* keep a list of ingredients that have been added to recipes, auto suggest for consistency
- *maybe* add a new category in ingredients for modifiers. For example: "Fresh," "Warmed," "Canned," etc.

pip install -r requirements.txt

REMINDER FOR ME
python -m http.server 5500
uvicorn backend.main:app --reload --port 8000