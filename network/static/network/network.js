document.addEventListener('DOMContentLoaded', function() {

    // load authenticated user profile
    document.querySelector('#profile-nav-link').addEventListener('click', () => load_view('index', 'profile'));

    // submit a post
    document.querySelector('#post-form').addEventListener('submit', submit_post);

    // display the posts
    load_view('index', 'posts/all')

});


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

function load_view(view, view_type) {

    const post_container = document.querySelector('#post-container');
    const posts_container = document.querySelector('#posts-container');
    const profile_container = document.querySelector('#profile-container');

    if (view_type === 'posts/all') {
        post_container.style.display = 'block';
        posts_container.style.display = 'block';
        profile_container.style.display = 'none';

        // load All posts
        load_posts(view_type);
    } else {
        profile_container.style.display = 'block';
        post_container.style.display = 'none';
        posts_container.style.display = 'none';

        // load profile only (authenticated user)
        load_profile(view, JSON.parse(document.getElementById('username').textContent));
    }
}

function load_profile(view, username) {
    const container = document.querySelector('#profile-container');
    container.innerHTML = "";

    // make GET request to '/profile/{username}' route
    fetch('/user/' + username)
    .then(response => response.json())
    .then(profile => {
        container.innerHTML = `
            <ul class="list-group">
                <li class="list-group-item"><b>Followers:</b><span>0</span></li>
                <li class="list-group-item"><b>Following:</b><span>0</span></li>
            </ul>
        `
    })
}

function load_posts (view) {
    // like symbol
    var heart_symbol = '&#9825';

    // get logged in username
    const username = JSON.parse(document.getElementById('username').textContent);

    // remove all posts from the DOM
    const container = document.querySelector('#post-container');
    container.innerHTML = "";

    // make GET request to '/posts' route
    fetch('/' + view)
    .then(response => response.json())
    .then(posts => {

        posts.forEach(post => {
            let div = document.createElement('div');
            div.className = "all-posts";

            // like symbol
            if (post['liked_by'].includes(username)) {
                var heart_symbol = '&hearts';
            } else {
                var heart_symbol = '&#9825';
            }

            div.innerHTML = `
                <h3 class="post-title card-title">${post['author']}</h3>
                <p class="card-text">${post['body']}</p>
                <h6 class="card-subtitle mb-2 text-muted">${post['timestamp']}</h6>
                <p class="heart-icon">${heart_symbol}; ${post['liked_by'].length}</p>
            `;

            container.appendChild(div);
        })
    })
}
