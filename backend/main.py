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

print("Running locally")

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

class Tag(BaseModel):
  tag_name: str
  description: str

class Recipe(BaseModel):
  title: str
  description: str
  servings: int
  prep_time: int
  cook_time: int
  rest_time: int
  ingredients: list[Ingredient]
  instructions: dict
  tags: list[Tag]
  credit_author: str
  credit_domain: str
  credit_url: str

# Get every recipe from the database
@app.get("/get-recipes")
async def get_recipes():
  try:
    # get all recipes from database
    recipes = supabase.from_("recipes").select("*").execute().data

    # add ingredients to each recipe
    for recipe in recipes:
      ingredients = supabase.from_("ingredients").select("*").eq("recipe_id", recipe["id"]).execute().data
      recipe["ingredients"] = ingredients

    # add tags to each recipe
    for recipe in recipes:
      tag_links = supabase.from_("recipe_tags").select("tag_id").eq("recipe_id", recipe["id"]).execute().data
      tag_ids = [tag["tag_id"] for tag in tag_links]
      tags = supabase.from_("tags").select("*").in_("id", tag_ids).execute().data
      recipe["tags"] = tags
    return recipes
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
  
# Add a recipe to the database
@app.post("/add-recipe")
async def add_recipe(recipe: Recipe):
  # Insert recipe (no ingredients)
  try:
    # Remove ingredients from recipe because ingredients has a separate table
    recipe_info = recipe.model_dump(exclude={"ingredients", "tags"})
    res = supabase.from_("recipes").insert(recipe_info).execute()

    if not res.data:
      raise HTTPException(status_code=500, detail="No data returned from Supabase")
    
    # Get the recipe ID from Supabase after it's been pushed
    # that way we can refer to it to add other stuff to their own table
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

    supabase.from_("ingredients").insert(ingredient_data).execute()

  except Exception as e:
    raise HTTPException(status_code=400, detail=f"Failed to insert ingredients: {str(e)}")
  
  # Insert Tags
  try:
    tag_data = []
    # Change Tag name to title format for consistency
    for tag in recipe.tags:
      tag_data.append({
        "tag_name": tag.tag_name.title(),
        "description": tag.description,
      })
    # Check each tag to see if they already exist in table. If not, then can add, but if it is then I guess keep the id or something for linking? idk
    # tag_data at this point should be the correct format to push to Supabase
    # but I want to check if it's in the table before I insert
    for tag in tag_data:
      tag_id = None
      existing_tag = supabase.from_("tags").select("*").eq("tag_name", tag["tag_name"]).execute()
      # Tag exists, so save existing id
      if (existing_tag.data):
        tag_id = existing_tag.data[0]["id"]
      # Tag doesn't exist, so insert into tags table and save new id
      else:
        new_tag = supabase.from_("tags").insert(tag).execute()
        tag_id = new_tag.data[0]["id"]
      # Link tag to recipe
      recipe_tag_data = {
        "recipe_id": recipe_id,
        "tag_id": tag_id,
      }
      # Insert recipe tag reference in recipe_tag table
      supabase.from_("recipe_tags").insert(recipe_tag_data).execute()
      
  except Exception as e:
    raise HTTPException(status_code=400, detail=f"Failed to insert tags: {str(e)}")
  
  return {"message": "Recipe, ingredients, and tags added successfully", "recipe_id": recipe_id}