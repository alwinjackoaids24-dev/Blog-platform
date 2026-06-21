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
