$(document).ready(function() {
  // clear form info on refresh
  $("#login-form")[0].reset();

  $("#login-form").submit(async (e) => {
    e.preventDefault();

    const email = $("#email").val();
    const password = $("#password").val();

    const {data, error} = await supabase_client.auth.signInWithPassword({email, password});

    if (error) {
      alert(`Login Failed!\n${error.message}`);
    } else {
      alert("Logged in!");
      sessionStorage.setItem("supabaseSesstion", JSON.stringify(data.session));
      window.location = "index.html";
    }
  });
});