$(document).ready(function() {
  window.supabase_client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // update the header properly when it loads in
  $("#header").load("header.html", function() {
    supabase_client.auth.getSession().then(({data}) => {
      update_header(data.session);
    });

    // update on state change
    supabase_client.auth.onAuthStateChange((event, session) => {
      update_header(session)
    });
  });
  
  // update visible stuff on header based on user log in status
  function update_header(session) {
    if (session) {
      $("#user-email").text(session.user.email);
      $("#logged-in-section").removeClass("hidden");
      $("#logged-out-section").addClass("hidden");
    } else {
      $("#user-email").text("");
      $("#logged-in-section").addClass("hidden");
      $("#logged-out-section").removeClass("hidden");
    }
  }

  // send user to log in page when log in button is pressed
  $("#header").on("click", "#log-in-button", function() {
    window.location = "login.html";
  });

  // allow the user to log out
  $("#header").on("click", "#log-out-button", async function () {
    console.log("log out button clicked");
    const {error} = await supabase_client.auth.signOut();
    if (error) {
      alert(`Log out failed\nError: ${error.message}`);
    } else {
      alert("Logged out!");
      $("#login-section").show();
      $("#logged-in-section").hide();
      $("#add-recipe-section").hide();
      window.location.reload();
    }
  });
});