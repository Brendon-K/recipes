from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / ".env")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

app = FastAPI()

# will include github pages link when i am good to start that up
origins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://brendon-k.github.io",
]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["GET", "POST"],
  allow_headers=["*"],
)

class Ingredient(BaseModel):
  name: str
  quantity: float
  unit: str
  category: str

class Recipe(BaseModel):
  title: str
  description: str
  servings: int
  prep_time: int
  cook_time: int
  rest_time: int
  ingredients: list[Ingredient]
  instructions: dict
  credit_author: str
  credit_domain: str
  credit_url: str

# Get every recipe from the database
@app.get("/get-recipes")
async def get_recipes():
  try:
    res = supabase.table("recipes").select("*, ingredients(*)").execute()
    return res.data
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
  
# Add a recipe to the database
@app.post("/add-recipe")
async def add_recipe(recipe: Recipe):
  # Insert recipe (no ingredients)
  try:
    # Remove ingredients from recipe because ingredients has a separate table
    recipe_info = recipe.model_dump(exclude={"ingredients"})
    res = supabase.table("recipes").insert(recipe_info).execute()

    if not res.data:
      raise HTTPException(status_code=500, detail="No data returned from Supabase")
    
    # Get the recipe ID from Supabase after it's been pushed
    # that way we can refer to it to add ingredients to their own table
    recipe_id = res.data[0]["id"]

  except Exception as e:
    raise HTTPException(status_code=400, detail=f"Failed to insert recipe: {str(e)}")
  
  # Insert Ingredients
  try:
    ingredient_data = []
    for ingredient in recipe.ingredients:
      ingredient_data.append({
        "recipe_id": recipe_id,
        "name": ingredient.name,
        "quantity": ingredient.quantity,
        "unit": ingredient.unit,
        "category": ingredient.category,
      })

    supabase.table("ingredients").insert(ingredient_data).execute()

  except Exception as e:
    raise HTTPException(status_code=400, detail=f"Failed to insert ingredients: {str(e)}")
  
  return {"message": "Recipe and ingredients added successfully", "recipe_id": recipe_id}