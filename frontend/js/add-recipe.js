$(document).ready(function() {

  // clear form info on refresh
  $("#add-recipe-form")[0].reset();

  // if user is not logged in, don't show recipe form
  supabase_client.auth.onAuthStateChange((event, session) => {
    if (session) {
      $("#add-recipe-section").removeClass("hidden");
      $("#warning").addClass("hidden");
    } else {
      $("#add-recipe-section").addClass("hidden");
      $("#warning").removeClass("hidden");
    }
  });

  // add more rows to ingredients section
  $("#add-row-ingredient").click(function(){
    const $row = $(`
      <div class="add-ingredient-row">
        <label>Name</label>
        <input type="text" class="ingredient-name" placeholder="Ingredient Name" required />

        <label>Quantity</label>
        <input type="number" class="ingredient-quantity" placeholder="Quantity" step="any" min="0" required />

        <label>Unit</label>
        <input type="text" class="ingredient-unit" placeholder="Unit of ingredient" required />

        <label>Category</label>
        <input type="text" class="ingredient-category" placeholder="Part of the dish this ingredient is for" required />
      </div>
    `);
    $("#add-ingredients-container").append($row);
  });

  // remove last row from ingredients
  $("#remove-row-ingredient").click(function() {
    // only remove if more than 1 row
    const $rows = $("#add-ingredients-container .add-ingredient-row");
    if ($rows.length > 1) {
      $rows.last().remove();
    }
  });

  // add more rows to each of the instructions sections
  $("#add-row-detailed-instruction").click(function() {
    const $row = $(`
      <div class="add-instruction-row">
        <input type="text" class="add-instruction-step" placeholder="Detailed step description" required />
      </div>
    `);
    $("#add-detailed-instructions-container").append($row);
  });
  
  $("#add-row-simple-instruction").click(function() {
    const $row = $(`
      <div class="add-instruction-row">
        <input type="text" class="add-instruction-step" placeholder="Simple step description" required />
      </div>
    `);
    $("#add-simple-instructions-container").append($row);
  });

  // remove last row from each of the instructions steps
  $("#remove-row-detailed-instruction").click(function() {
    // only remove if more than 1 row
    const $rows = $("#add-detailed-instructions-container .add-instruction-row");
    if ($rows.length > 1) {
      $rows.last().remove();
    }
  });
  
  $("#remove-row-simple-instruction").click(function() {
    // only remove if more than 1 row
    const $rows = $("#add-simple-instructions-container .add-instruction-row");
    if ($rows.length > 1) {
      $rows.last().remove();
    }
  });

  // submit recipe and add to database
  $("#add-recipe-form").submit(async function(e) {
    e.preventDefault();

    const {
      data: {session},
    } = await supabase_client.auth.getSession();

    if (!session) {
      alert("You must be logged in to add a recipe.");
      return;
    }

    const recipe = {
      title: $("#title").val().trim(),
      description: $("#description").val().trim(),
      servings: $("#servings").val().trim(),
      prep_time: $("#prep_time").val().trim(),
      cook_time: $("#cook_time").val().trim(),
      rest_time: $("#rest_time").val().trim(),
      ingredients: [],
      instructions: {},
      tags: [],
      credit_author: $("#credit_author").val().trim(),
      credit_domain: $("#credit_domain").val().trim(),
      credit_url: $("#credit_url").val().trim()
    };

    // add each line of the ingredients form to ingredients
    $(".add-ingredient-row").each(function() {
      const $row = $(this);
      const name = $row.find(".ingredient-name").val().trim();
      const quantity = $row.find(".ingredient-quantity").val().trim();
      const unit = $row.find(".ingredient-unit").val().trim();
      const category = $row.find(".ingredient-category").val().trim();

      if (name && unit && quantity) {
        recipe.ingredients.push({name, quantity, unit, category});
      }
    });

    // add each line of the instructions form to each insruction entry
    recipe.instructions['detailed'] = $("#add-detailed-instructions-container .add-instruction-step").map(function() {
      return $(this).val().trim();
    }).get();

    recipe.instructions['simple'] = $("#add-simple-instructions-container .add-instruction-step").map(function() {
      return $(this).val().trim();
    }).get();

    // format tags
    const TAG_INPUT = $("#tags").val().split(", ");
    // this is literally python wtf am I doing... TODO
    TAG_INPUT.forEach(tag => {
      recipe.tags.push({
        "tag_name": tag,
        "description": ""
      });
    });

    // POST
    try {
      const response = await $.ajax({
        url: `${BACKEND_URL}/add-recipe`,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(recipe)
      });

      alert(`Recipe Added!\nID: ${response.recipe_id}`);
      $("#add-recipe-form")[0].reset();
    } catch (err) {
      alert("Failed to add recipe. See console for details.");
      console.error(err);
    }
  });
});