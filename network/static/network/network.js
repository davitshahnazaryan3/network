document.addEventListener('DOMContentLoaded', function() {

    // submit a post
    document.querySelector('#post-form').addEventListener('submit', submit_post);

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
    })
}

function like_post () {

}

function follow_user () {

}

function edit_post () {

}

function load_posts () {

}

