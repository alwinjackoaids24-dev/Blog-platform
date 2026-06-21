function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "admin" && password === "1234") {
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("blogSection").style.display = "block";
        alert("Login Successful!");
    } else {
        alert("Invalid Username or Password");
    }
}
function createPost() {
  const title = prompt("Enter post title");

  if (title) {
    const div = document.createElement("div");
    div.className = "post";

    div.innerHTML = `
      <h3>${title}</h3>
      <button onclick="this.parentElement.remove()">
        Delete
      </button>
    `;

    document.getElementById("posts").appendChild(div);
  }
}
