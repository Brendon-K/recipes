$(document).ready(function(){
  const BACKEND_URL = "http://127.0.0.1:8000";
  // get recipes
  let recipes = [];

  async function fetch_recipes() {
    try {
      recipes = await $.getJSON(`${BACKEND_URL}/get-recipes`);
      
      // populate the datalist for the search bar in index.html
      const $datalist = $("#recipe-options");
      $datalist.empty();
      recipes.forEach(recipe => $datalist.append(`<option value="${recipe.title}">`));
    } catch (err) {
      console.error("Failed to fetch recipes:", err);
    }
  }

  fetch_recipes();
  
  // create html for the given recipe, and put it in the selected-recipe-div element
  function display_recipe(recipe) {
    // get ingredient list

    /* This block of code is for later. 
    ** Eventually I want to change the ingredient display so that it's organized by category. 
    ** Right now I will keep it simple so I can move on.
    ** Also p sure I want to display it in a table so that it's all aligned... maybe probably ugly though?
    // get the ingredient categories
    ingredient_categories = []
    recipe.ingredients.forEach(ingredient => {
      if (!ingredient_categories.includes(ingredient.category)) {
        ingredient_categories.push(ingredient.category);
      }
    });
    */

    ingredients_html = recipe.ingredients.map(ingredient => `<li>${ingredient.quantity} ${ingredient.unit} ${ingredient.name}</li>`).join("");

    // get instructions
    instructions_detailed_html = recipe.instructions.detailed.map(step => `<li>${step}</li>`).join("");
    instructions_simple_html = recipe.instructions.simple.map(step => `<li>${step}</li>`).join("");

    // generate html for full recipe info
    const $recipe_html = $(`
        <div class="recipe">
          <h2>${recipe.title}</h2>
          
          <p>${recipe.description}</p>
          
          <p>Servings: ${recipe.servings}</p>
          <p>Prep Time: ${recipe.prep_time} min | Cook Time: ${recipe.cook_time} min | Rest Time: ${recipe.rest_time} min</p>
          
          <div class="ingredients">
            <h3>Ingredients</h3>
            <ul>${ingredients_html}</ul>
          </div>
          
          <div class="instructions">
            <h3>Instructions</h3>
            <button id="recipe-toggle-button" class="toggle-button">Show Simple</button>
            <ol class="instructions-list detailed">${instructions_detailed_html}</ol>
            <ol class="instructions-list simple" style="display:none;">${instructions_simple_html}</ol>
          </div>

          <div class="credit">
            <p>Recipe by ${recipe.credit_author}. <a href="${recipe.credit_url}" target="_blank">${recipe.credit_domain}</a></p>
          </div>
        </div>
    `);

    // click handler for instructions toggle button
    // switches between simple and detailed instructions on click
    $recipe_html.find(".toggle-button").click(function() {
      const $detailed = $recipe_html.find(".instructions-list.detailed");
      const $simple = $recipe_html.find(".instructions-list.simple");
      
      $detailed.toggle();
      $simple.toggle();

      // change text inside button
      if ($(this).text() === "Show Simple") {
        $(this).text("Show Detailed");
      } else {
        $(this).text("Show Simple");
      }
    });

    // clear old recipe and add new one
    $("#selected-recipe-div").empty();
    $("#selected-recipe-div").append($recipe_html);
  }

  // handle form submit on recipe search
  $("#recipe-search-form").submit(async function(e) {
    e.preventDefault();

    // read form contents
    const recipe_name = $("#recipe-search").val();

    // find recipe that matches entry
    recipes.forEach(recipe => {
      // if match is found, display the recipe
      if (recipe.title === recipe_name) {
        display_recipe(recipe);
      }
    });
  });
  
});