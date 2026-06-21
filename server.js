const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Data load panradhu
let posts = [];
if (fs.existsSync('posts.json')) posts = JSON.parse(fs.readFileSync('posts.json'));

let users = [];
if (fs.existsSync('users.json')) users = JSON.parse(fs.readFileSync('users.json'));

let currentUser = null;

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // API ku json support

// Login check
function mustLogin(req, res, next) {
  if (!currentUser) return res.redirect('/login');
  next();
}

// ========== REGISTER ==========
app.get('/register', (req, res) => {
  res.send(`<h1>Register Pannu 📝</h1>
    <form method="POST" action="/register">
      <input name="u" placeholder="Username" required><br><br>
      <input name="p" type="password" placeholder="Password" required><br><br>
      <button>Register</button>
    </form>
    <a href="/login">Already account iruka? Login</a>`);
});

app.post('/register', (req, res) => {
  if(users.find(x => x.u === req.body.u)) {
    return res.send('Username already iruku <a href="/register">Thirumba try</a>');
  }
  users.push({u: req.body.u, p: req.body.p});
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  res.redirect('/login');
});

// ========== LOGIN ==========
app.get('/login', (req, res) => {
  res.send(`<h1>Login Pannu 🔐</h1>
    <form method="POST" action="/login">
      <input name="u" placeholder="Username" required><br><br>
      <input name="p" type="password" placeholder="Password" required><br><br>
      <button>Login</button>
    </form>
    <a href="/register">Puthu account? Register</a>`);
});

app.post('/login', (req, res) => {
  let user = users.find(x => x.u === req.body.u && x.p === req.body.p);
  if (user) {
    currentUser = user.u;
    res.redirect('/');
  } else {
    res.send('Username/Password thappu <a href="/login">Try again</a>');
  }
});

// ========== LOGOUT ==========
app.get('/logout', (req, res) => {
  currentUser = null;
  res.redirect('/login');
});

// ========== HOME + CREATE POST ==========
app.get('/', mustLogin, (req, res) => {
  let postsHTML = posts.map((p, i) => {
    let buttons = '';
    if (p.author === currentUser) {
      buttons = `<a href="/edit/${i}">Edit</a> | <a href="/delete/${i}" style="color:red;">Delete</a>`;
    }

    let commentsHTML = p.comments? p.comments.map(c => `<li>${c}</li>`).join('') : '';

    return `
    <div style="border:1px solid #ccc; padding:15px; margin:15px 0; border-radius:8px;">
      <h3>${p.title}</h3>
      <p>${p.content}</p>
      <small><b>By:</b> ${p.author || 'Unknown'}</small> ${buttons}
      <h4>Comments:</h4>
      <ul>${commentsHTML || '<li>No comments yet</li>'}</ul>
      <form method="POST" action="/comment/${i}">
        <input name="comment" placeholder="Comment..." required>
        <button>Comment</button>
      </form>
    </div>
    `;
  }).join('');

  res.send(`
    <h1>Hi ${currentUser} 👋</h1>
    <a href="/logout">Logout</a> | <a href="/api/posts">API Link</a>
    <hr>
    <h3>Puthu Post Podu</h3>
    <form method="POST" action="/post">
      <input name="title" placeholder="Title" required><br><br>
      <textarea name="content" placeholder="Content" rows="4" required></textarea><br><br>
      <button>Create Post</button>
    </form>
    <hr>
    <h2>Posts</h2>
    ${postsHTML || '<p>Innum post illa bro</p>'}
  `);
});

// CREATE
app.post('/post', mustLogin, (req, res) => {
  posts.push({
    title: req.body.title,
    content: req.body.content,
    author: currentUser,
    comments: []
  });
  fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
  res.redirect('/');
});

// ========== EDIT POST ==========
app.get('/edit/:id', mustLogin, (req, res) => {
  let id = req.params.id;
  let post = posts[id];
  if (post.author!== currentUser) return res.send('Unaku permission illa bro <a href="/">Back</a>');

  res.send(`<h1>Edit Post</h1>
    <form method="POST" action="/edit/${id}">
      <input name="title" value="${post.title}" required><br><br>
      <textarea name="content" rows="4" required>${post.content}</textarea><br><br>
      <button>Update</button>
    </form>
    <a href="/">Cancel</a>`);
});

app.post('/edit/:id', mustLogin, (req, res) => {
  let id = req.params.id;
  if (posts[id].author!== currentUser) return res.redirect('/');
  posts[id].title = req.body.title;
  posts[id].content = req.body.content;
  fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
  res.redirect('/');
});

// ========== DELETE POST ==========
app.get('/delete/:id', mustLogin, (req, res) => {
  let id = req.params.id;
  if (posts[id].author!== currentUser) return res.redirect('/');
  posts.splice(id, 1);
  fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
  res.redirect('/');
});

// ========== COMMENT ==========
app.post('/comment/:id', mustLogin, (req, res) => {
  let id = req.params.id;
  if (!posts[id].comments) posts[id].comments = [];
  posts[id].comments.push(`${currentUser}: ${req.body.comment}`);
  fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
  res.redirect('/');
});

// ========== RESTful API ROUTES ==========
// GET all posts
app.get('/api/posts', (req, res) => {
  res.json(posts);
});

// GET single post
app.get('/api/posts/:id', (req, res) => {
  let id = req.params.id;
  if (posts[id]) {
    res.json(posts[id]);
  } else {
    res.status(404).json({error: 'Post kedaikala bro'});
  }
});

// POST create via API
app.post('/api/posts', mustLogin, (req, res) => {
  let newPost = {
    title: req.body.title,
    content: req.body.content,
    author: currentUser,
    comments: []
  };
  posts.push(newPost);
  fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
  res.status(201).json(newPost);
});

// DELETE via API
app.delete('/api/posts/:id', mustLogin, (req, res) => {
  let id = req.params.id;
  if (posts[id].author!== currentUser) return res.status(403).json({error: 'Permission illa'});
  posts.splice(id, 1);
  fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
  res.json({msg: 'Delete aagiduchu'});
});

app.listen(PORT, () => console.log(`Server running at http://localhost:3000`));