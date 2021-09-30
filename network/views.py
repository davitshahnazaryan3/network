from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse
import json

from .models import *


def index(request):
    return render(request, "network/index.html")


@csrf_exempt
@login_required
def like_post(request, id):
    data = json.loads(request.body)

    # get the post by id
    post = Post.objects.get(id=id)

    # get status of liked button (like or unlike)
    status = data["state"]

    if status == "like":
        post.liked_by.remove(request.user)
    else:
        post.liked_by.add(request.user)
    post.save()

    # return JSON of new likes count and liked button status
    response = {
        'state': 'unlike' if status == "like" else "like",
        'likes': post.liked_by.count(),
    }

    return JsonResponse(response, status=200)


@csrf_exempt
@login_required
def follow(request, username):

    if request.method != "PUT":
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)

    # Get user
    user = User.objects.get(username=username)

    # make sure authenticated user cannot follow themselves
    if request.user == user:
        return HttpResponse("You cannot follow yourself", status=403)

    # check whether authenticated user is following or not following the current user
    follow_object = user.following.filter(follower=request.user)
    if follow_object:
        follow_object.delete()
    else:
        # otherwise create follow object
        follow_object = Following(follower=request.user, following=user)
        follow_object.save()

    return HttpResponse(status=204)


def load_profile(request, username):
    user = User.objects.get(username=username)
    posts = Post.objects.filter(author=user)

    if not request.user.is_authenticated:
        follows = False
    elif user.following.filter(follower=request.user):
        follows = True
    else:
        follows = False

    response = {
        'username': user.username,
        'posts': [post.serialize() for post in posts],
        'post_count': user.posts.count(),
        'join_date': f'{user.date_joined.strftime("%B")} {user.date_joined.strftime("%Y")}',
        'requested_by': request.user.username if request.user.is_authenticated else None,
        'following': user.following.count(),
        'followers': user.follower.count(),
        'follows': follows or None,
    }

    return JsonResponse(response, status=200)


def get_posts(request):
    following = request.GET.get("following") or None

    # display posts by user that request.user is following
    if following:
        follower = request.user.follower.filter()
        following = User.objects.filter(id__in=follower.values('following'))
        posts = Post.objects.filter(author__in=following)
    else:
        posts = Post.objects.all()
    return JsonResponse([post.serialize() for post in posts], safe=False)


@csrf_exempt
@login_required
def submit_post(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get content of post
    data = json.loads(request.body)
    if data["body"]:
        post = Post(author=request.user, body=data["body"])
        post.save()
        return JsonResponse({"message": "Post submitted successfully."}, status=201)
    else:
        return JsonResponse({"error": "Form body required."}, status=400)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
