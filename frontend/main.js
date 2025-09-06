$(document).ready(function(){
  const BACKEND = "http://127.0.0.1:8000";
  // get recipes
  let recipes = [];

  async function fetch_recipes() {
    try {
      recipes = await $.getJSON("http://127.0.0.1:8000/get-recipes");

      // populate the datalist for the search bar in index.html
      const $datalist = $("#recipe-options");
      $datalist.empty();
      recipes.forEach(recipe => $datalist.append(`<option value="${recipe.title}">`));
    } catch (err) {
      console.error("Failed to fetch recipes:", err);
    }
  }

  fetch_recipes();
});