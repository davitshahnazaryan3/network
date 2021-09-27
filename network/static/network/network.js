document.addEventListener('DOMContentLoaded', function() {

    // load authenticated user profile
    const profile_nav_link = document.querySelector('#profile-nav-link');
    if (profile_nav_link) {
        profile_nav_link.addEventListener('click', () => load_view('profile'));
        // submit a post
        document.querySelector('#post-form').addEventListener('submit', submit_post);
    }

    // display the posts
    load_view('index')

});

function load_view(view) {
    const post_container = document.querySelector('#post-container');
    const post_form_container = document.querySelector('#post-form-container');
    const profile_container = document.querySelector('#profile-container');

    profile_container.style.display = (view === 'profile') ? 'block' : 'none';
    post_form_container.style.display = (view === 'index') ? 'block' : 'none';

    // load posts
    load_posts(view);
}

function show_profile_info(data) {

    const container = document.querySelector('#profile-container');
    container.innerHTML = "";

    // remove all posts from the DOM
    const post_container = document.querySelector('#post-container');
    post_container.innerHTML = "";

    // make GET request to '/profile/{username}' route
    // todo, followers and following
    container.innerHTML = `
        <ul class="list-group">
            <li class="list-group-item"><b>Date joined: </b><span>${data['join_date']}</span></li>
            <li class="list-group-item"><b>Followers: </b><span>0</span></li>
            <li class="list-group-item"><b>Following: </b><span>0</span></li>
        </ul>
    `
}

function show_post(context) {
    console.log(context.post);
    // like symbol
    var heart_symbol = '&#9825';

    let div = document.createElement('div');
    div.className = "post";

    // like symbol
    if (context.username_ele && context.post['liked_by'].includes(context.username)) {
        var heart_symbol = '&hearts';
    } else {
        var heart_symbol = '&#9825';
    }

    div.innerHTML = `
        <h3 class="post-title card-title">${context.post['author']}</h3>
        <p class="card-text">${context.post['body']}</p>
        <h6 class="card-subtitle mb-2 text-muted">${context.post['timestamp']}</h6>
        <p class="heart-icon">${heart_symbol}; ${context.post['liked_by'].length}</p>
    `;

    context.container.appendChild(div);
}

function load_posts (view) {
    // like symbol
    var heart_symbol = '&#9825';

    // get logged in username
    const username_ele = document.getElementById('username');
    if (username_ele) {
        const username = JSON.parse(document.getElementById('username').textContent);
    } else {
        // hide post form
        document.querySelector('#post-form-container').style.display = 'none';
    }

    // request url
    let url = '/posts';
    if (view === "profile") {
        url = `/user/${document.querySelector('#profile-nav-link').textContent}`;
    } else {
        url = '/posts';
    }

    // remove all posts from the DOM
    const container = document.querySelector('#post-container');
    container.innerHTML = "";

    if (view === "profile") {

        fetch(url)
        .then(response => response.json())
        .then(data => {
            // change title name
            document.querySelector('#title').innerHTML = data.username;

            show_profile_info(data);

            data.posts.forEach(post => show_post({
                'container': container,
                'post': post,
                'username_ele': username_ele,
                'username': username,
            }))
        })

    } else {

        // make GET request to url route
        fetch(url)
        .then(response => response.json())

        .then(posts => {

            posts.forEach(post => show_post({
                'container': container,
                'post': post,
                'username_ele': 'none',
                'username': 'none',
            }))
        })
    }
}

function submit_post(event) {
    // to prevent loading the original URL (goes to default 'inbox')
    event.preventDefault();

    // Create POST request using form data
    fetch('/submit_post', {
        method: "POST",
        credentials: 'same-origin',
        body: JSON.stringify({
            "body": document.querySelector('#post-body').value,
        })
    })
    .then(response => response.json())
    .then(post => {
        // clear the post content
        document.querySelector('#post-body').value = "";

        // reload posts
        load_posts('index')
    })
}

function like_post () {

}

function follow_user () {

}

function edit_post () {

}