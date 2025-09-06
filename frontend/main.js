$(document).ready(function(){
  // Local testing
  //const BACKEND_URL = "http://127.0.0.1:8000";
  // Live
  const BACKEND_URL = "https://recipes-dil8.onrender.com";
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
    console.log(recipe.ingredients);
    // get ingredient list
    let ingredients = {};

    // populate ingredients list with keys that are each ingredient category
    // and values that are the ingredient that belongs to the category
    recipe.ingredients.forEach(ingredient => {
      if (Object.keys(ingredients).includes(ingredient.category)) {
          ingredients[ingredient.category].push(ingredient);
      } else {
          ingredients[ingredient.category] = [ingredient];
      }
    });

    // generate html for ingredient list ordered by category
    let ingredient_categories_html = Object.entries(ingredients).map(([category, ingredient_list]) => `
      <h4>${category}</h4>
      <ul>
        ${ingredient_list.map(ingredient => `<li>${ingredient.quantity} ${ingredient.unit} ${ingredient.name}</li>`).join("")}
      </ul>  
    `).join("");
    
    // get instructions
    let instructions_detailed_html = recipe.instructions.detailed.map(step => `<li>${step}</li>`).join("");
    let instructions_simple_html = recipe.instructions.simple.map(step => `<li>${step}</li>`).join("");

    // generate html for full recipe info
    const $recipe_html = $(`
        <div class="recipe">
          <h2>${recipe.title}</h2>
          
          <p>${recipe.description}</p>
          
          <p>Servings: ${recipe.servings}</p>
          <p>Prep Time: ${recipe.prep_time} min | Cook Time: ${recipe.cook_time} min | Rest Time: ${recipe.rest_time} min</p>
          
          <div class="ingredients">
            <h3>Ingredients</h3>
            ${ingredient_categories_html}
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