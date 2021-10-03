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
            })

            // Update profile info
            .then(response => {
                data['follows'] = !data['follows'];
                if (data['follows']) {
                    data['following'] = data['following'] + 1
                } else {
                    data['following'] = data['following'] - 1
                }
                show_profile_info(data, auth_username);
            })
        });

        // add to container
        container.appendChild(follow);
    }
}

function edit_post(post, postID) {

    // create the button
    const button = document.createElement('button');
    button.type = "button";
    button.className = "edit-button btn btn-secondary";
    button.innerHTML = "Edit";

    // add event listener to button
    button.addEventListener('click', () => {

        const body = post.querySelector(".card-text");
        const textarea = post.querySelector(".text-editor");
        // if button text is Edit
        if (button.innerHTML === "Edit") {
            button.innerHTML = "Save";
            body.style.display = "none";
            textarea.style.display = "block";
            textarea.value = body.innerHTML;
        } else {
            // Save button is clicked, create a PUT request to save new post body
            fetch(`post/${postID}`, {
                method: 'PUT',
                credentials: 'same-origin',
                body: JSON.stringify({'body': textarea.value})
            })
            // Once the new data is saved, go to default
            .then(() => {
                button.innerHTML = "Edit";
                body.innerHTML = textarea.value;
                body.style.display = "block";
                textarea.style.display = "none";
            })
        }
    })

    return button
}

function show_post(context) {

    // initialize like symbol and label for className
    var heart_symbol = '&#9825';
    var heart_label = "unlike";

    // create a div element for post content
    let div = document.createElement('div');
    div.className = "post";

    // like symbol
    if (context.auth_username && context.post['liked_by'].includes(context.auth_username)) {
        var heart_symbol = '&#9829';
        var heart_label = "like";
    } else {
        var heart_symbol = '&#9825';
        var heart_label = "unlike";
    }

    // post content
    div.innerHTML = `
        <h3 class="post-title card-title">${context.post['author']}</h3>
        <p class="card-text">${context.post['body']}</p>
        <h6 class="card-subtitle mb-2 text-muted">${context.post['timestamp']}</h6>
        <p class="heart-icon"></p>
        <textarea class="text-editor form-control" style="display:none"></textarea>
    `;

    // like button consisting of like icon and number of likes
    const heart_icon = document.createElement('span');
    heart_icon.className = `${heart_label}-heart`;
    heart_icon.innerHTML = `${heart_symbol} `
    div.querySelector(".heart-icon").appendChild(heart_icon);

    const likes = document.createElement('span');
    likes.className = `counter`
    likes.innerHTML = `${context.post['liked_by'].length}`
    div.querySelector(".heart-icon").appendChild(likes);

    // edit post button if logged in user is post author
    if (context.auth_username === context.post['author']) {
        editButton = edit_post(div, context.post.id);

        // add to div
        div.appendChild(editButton);
    }

    // add event listener to username (to load user profile)
    const title = div.querySelector(".post-title");
    title.addEventListener('click', () => load_view(context.post['author']));

    // add event listener to like icon if user is signed in
    if (context.auth_username) {
        const like_button = div.querySelector(".heart-icon");

        like_button.addEventListener('click', () => like_post(div, context));
    }

    // add into the container
    context.container.appendChild(div);
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

function like_post (post, context) {

    var like_button_state = (post.querySelector(".like-heart")) ? "like" : "unlike";

    fetch(`post/${context.post['id']}/like`, {
        method: 'PUT',
        credentials: 'same-origin',
        body: JSON.stringify({'state': like_button_state}),
    })
    .then(response => response.json())
    .then(data => {
        post.querySelector(`.${like_button_state}-heart`).className = `${data['state']}-heart`;
        post.querySelector(`.${data['state']}-heart`).innerHTML = (data['state'] === 'like') ? `${'&#9829'} ` : `${'&#9825'} `
        post.querySelector(".counter").innerHTML = data['likes'];
    })
}
