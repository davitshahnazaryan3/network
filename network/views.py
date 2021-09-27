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


def load_profile(request, username):
    user = User.objects.get(username=username)
    posts = Post.objects.filter(author=user)

    response = {
        'username': user.username,
        'posts': [post.serialize() for post in posts],
        'post_count': user.posts.count(),
        'join_date': f'{user.date_joined.strftime("%B")} {user.date_joined.strftime("%Y")}',
        'requested_by': request.user.username if request.user.is_authenticated else None,
        # todo, followers and following
    }

    return JsonResponse(response, status=200)


def get_posts(request):
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
