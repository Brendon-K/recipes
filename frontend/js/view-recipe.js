$(document).ready(function(){
  // clear search on refresh
  $("#recipe-search-form")[0].reset();

  // get recipes
  let recipes = [];

  // get all recipes from the database and store them in recipes array
  async function fetch_recipes() {
    try {
      recipes = await $.getJSON(`${BACKEND_URL}/get-recipes`);
      
      // populate the datalist for the search bar in index.html
      const $datalist = $("#recipe-options");
      $datalist.empty();
      recipes.forEach(recipe => $datalist.append(`<option value="${recipe.title}">`));
      console.log(recipes);
      search_autocomplete();
    } catch (err) {
      console.error("Failed to fetch recipes:", err);
    }
  }
  
  // autocomplete function for the search bar
  function search_autocomplete() {
    const $SEARCH_TERM = $("#search-drop");
    const $SEARCH_INPUT = $("#recipe-search");

    $SEARCH_INPUT.autocomplete({
      source: function(request, response) {
        const TERM = $SEARCH_TERM.val();
        const SEARCH = request.term.toLowerCase();

        let matches = [];

        switch (TERM) {
          // auto complete for name searching
          case "name":
            matches = recipes
              .map(recipe => recipe.title)
              .filter(title => title.toLowerCase().includes(SEARCH));
            break;
          // auto complete for tag searching
          case "tag":
            matches = recipes
              .flatMap(recipe => recipe.tags.map(tag => ({tag_name: tag.tag_name, recipe})))
              .filter(obj => obj.tag_name.toLowerCase().includes(SEARCH))
              .map(obj => obj.tag_name);
            // remove duplicates
            matches = [...new Set(matches)];
            break;
          // auto complete for ingredient searching
          case "ingredient":
            matches = recipes
              .flatMap(recipe => recipe.ingredients.map(ingredient => ({ingredient_name: ingredient.name, recipe})))
              .filter(obj => obj.ingredient_name.toLowerCase().includes(SEARCH))
              .map(obj => obj.ingredient_name);
            // remove duplicates
            matches = [...new Set(matches)];
            break;
          default:
            console.log("How did you even get here? What are you doing?");
            break;
        }
        response(matches);
      },
      minLength: 1,
      delay: 100,
      select: function(event, ui) {
        const SELECTED_VALUE = ui.item.value;
        const TERM = $SEARCH_TERM.val();

        let matches = [];

        // filter the recipes based on the search terms
        switch (TERM) {
          case "name":
            matches = recipes.filter(recipe => recipe.title === SELECTED_VALUE);
            break;
          case "tag":
            matches = recipes.filter(recipe => recipe.tags.some(tag => tag.tag_name === SELECTED_VALUE));
            break;
          case "ingredient":
            matches = recipes.filter(recipe => recipe.ingredients.some(ingredient => ingredient.name === SELECTED_VALUE));
            break;
          default:
            console.log("How did you even get here? What are you doing?");
            break;
        }

        // if only 1 result, just show it. 
        if (matches.length === 1) {
          display_recipe(matches[0]);
        // if more than 1, display a list of links to click
        } else if (matches.length > 1) {
          display_recipe_list(matches);
        } else {
          alert("No recipes found!");
        }
      }
    });
  }
  
  fetch_recipes();

  // display a list of clickable recipes
  function display_recipe_list(recipes) {
    // clear displayed recipe before showing links
    $("#selected-recipe-div").empty();

    // clear existing buttons
    $("#recipe-links-div").empty();

    let $recipe_list_html = $('<div>');

    // make button for each recipe
    recipes.forEach(recipe => {
      $recipe_list_html.append(`<button type="button" class="recipe-link">${recipe.title}</button>`);
    });

    // show recipes
    $("#recipe-links-div").append($recipe_list_html);
  }

  // display recipe when clicking a recipe link
  $("#recipe-links-div").on("click", ".recipe-link", function () {
    // get recipe name from button text
    const RECIPE_NAME = this.textContent;

    // get recipe object from list of all recipes
    const recipe = recipes.find(r => r.title === RECIPE_NAME);

    // display the clicked recipe
    display_recipe(recipe);
  });

  // create html for the given recipe, and put it in the selected-recipe-div element
  function display_recipe(recipe) {
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
        <p>${format_time("Prep Time", recipe.prep_time)}</p>
        <p>${format_time("Cook Time", recipe.cook_time)}</p>
        <p>${format_time("Rest Time", recipe.rest_time)}</p>

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

        <div class="tags">
          <div>
            <h4>Tags</h4>
            ${recipe.tags.map(tag => `<span class="tag">${tag.tag_name}</span>`).join(", ")}
          </div>
        </div>
      </div>
    `);

    // given a label and minutes, output time in hr, min format.
    // if minutes is 0, will return empty string
    // formatting: "label: xx hr, xx min"
    function format_time(label, minutes) {
      const HOURS = parseInt(minutes / 60);
      const MINS = parseInt(minutes % 60);
      let text = ''

      // if there is a time, fill out string
      if (HOURS || MINS) {
        text += `${label}: `;
        // if there are hours, then display hours
        if (HOURS) {
          text += `${HOURS} hr`;
          // show comma if there are hours and minutes
          if (MINS) {
            text += ', ';
          }
        }
        // if there are mins, then display mins
        if (MINS) {
          text += `${MINS} min`;
        }
      }

      return text;
    }

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

  // change the placeholder in the search bar based on the selection
  $("#search-drop").on('change', function() {
    const TERM = this.value;
    switch (TERM) {
      case "name":
        $("#recipe-search")[0].placeholder = "Search by recipe name";
        break;
      case "tag":
        $("#recipe-search")[0].placeholder = "Search by tag";
        break;
      case "ingredient":
        $("#recipe-search")[0].placeholder = "Search by ingredient";
        break;
      default:
        $("#recipe-search")[0].placeholder = "What are you doing?";
        console.log("How did you even get here? What are you doing?");
        break;
    }
  });
});