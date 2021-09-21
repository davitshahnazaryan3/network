document.addEventListener('DOMContentLoaded', function() {

    // submit a post
    document.querySelector('#post-form').addEventListener('submit', submit_post);

    load_view('index')
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

function load_view(view) {
    load_posts(view);
}

function load_posts (view) {
    // remove all posts from the DOM
    const container = document.querySelector('#post-container');
    container.innerHTML = "";

    // make GET request to '/posts' route
    fetch('/posts')
    .then(response => response.json())
    .then(posts => {
        posts.forEach(post => {
            let div = document.createElement('div');
            div.className = "all-posts";
            div.innerHTML = `
                <h3 class="post-title card-title">${post['author']}</h3>
                <p class="card-text">${post['body']}</p>
                <h6 class="card-subtitle mb-2 text-muted">${post['timestamp']}</h6>
                <p class="heart-icon">&hearts; ${post['liked_by'].length}</p>
            `;

            container.appendChild(div);
        })
    })
}

