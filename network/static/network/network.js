document.addEventListener('DOMContentLoaded', function() {

    // load authenticated user profile
    const profile_nav_link = document.querySelector('#profile-nav-link');
    if (profile_nav_link) {
        // add event listener to authenticated username
        profile_nav_link.addEventListener('click', () => load_view(profile_nav_link.textContent));
        // submit a post
        document.querySelector('#post-form').addEventListener('submit', submit_post);
        // add event listener to following
        document.querySelector('#following-nav-link').addEventListener('click',  () => load_view('following'));
    }

    // display the posts
    load_view('index')

});

function load_view(view) {
    const post_container = document.querySelector('#post-container');
    const post_form_container = document.querySelector('#post-form-container');
    const profile_container = document.querySelector('#profile-container');

    profile_container.style.display = (view === 'index' || view === 'following') ? 'none' : 'block';

    if (post_form_container) {
        post_form_container.style.display = (view === 'index') ? 'block' : 'none';
    }

    // load posts
    load_posts(view);
}

function load_posts (view) {
    // url to fetch
    let url = '/posts';

    // remove all posts from the DOM
    const container = document.querySelector('#post-container');
    container.innerHTML = "";

    // authenticated user
    const profile_nav_link = document.querySelector('#profile-nav-link');
    let auth_username = ''
    auth_username = (profile_nav_link) ? profile_nav_link.textContent : '';

    if (view === "index" || view === "following") {

        // display posts of users that the request.user is following only?
        if (view === "following") {
            url = url.concat(`?following=true`)
            document.querySelector('#title').innerHTML = "Following";
        }

        // make GET request to url route
        fetch(url)
        .then(response => response.json())
        .then(posts => {
            posts.forEach(post => show_post({
                'container': container,
                'post': post,
                'auth_username': auth_username,
                'username': 'none',
            }))
        })
    } else {
        // update request url
        url = `/user/${view}`;

        // make GET request to profile
        fetch(url)
        .then(response => response.json())
        .then(data => {
            // change title name
            document.querySelector('#title').innerHTML = data.username;

            // show profile data
            show_profile_info(data, auth_username);

            // request posts by username
            data.posts.forEach(post => show_post({
                'container': container,
                'post': post,
                'auth_username': auth_username,
                'username': view,
            }))
        })
    }
}

function show_profile_info(data, auth_username) {

    const container = document.querySelector('#profile-container');
    container.innerHTML = "";


    container.innerHTML = `
        <ul class="list-group">
            <li class="list-group-item"><b>Date joined: </b><span>${data['join_date']}</span></li>
            <li class="list-group-item" id="followers_count"><b>Followers: </b><span>${data['following']}</span></li>
            <li class="list-group-item" id="following_count"><b>Following: </b><span>${data['followers']}</span></li>
        </ul>
    `

    if (auth_username && auth_username != data['username']) {
        // follow or unfollow button, and add event listener to button for PUT request
        const follow = document.createElement('button');
        follow.innerHTML = (data['follows']) ? "Unfollow" : "Follow";
        follow.id = "follow-button";
        follow.className = "button btn btn-primary";

        // add event listener to follow button
        follow.addEventListener('click', function () {
            fetch('/user/' + data['username'] + '/follow', {
                method: 'PUT',
                body: JSON.stringify({ follows : !data['follows']})
            })

            // reload profile
            .then(response => load_view(data['username']))
        });

        // add to container
        container.appendChild(follow);
    }
}

function show_post(context) {

    // like symbol
    var heart_symbol = '&#9825';

    let div = document.createElement('div');
    div.className = "post";

    // like symbol
    if (context.auth_username && context.post['liked_by'].includes(context.auth_username)) {
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

    // add event listener to username
    const title = div.querySelector(".post-title");
    title.addEventListener('click', () => load_view(context.post['author']));
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