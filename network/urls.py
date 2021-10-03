from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("submit_post", views.submit_post, name="submit-post"),
    path("posts", views.get_posts, name="get-posts"),
    path("post/<str:id>/like", views.like_post, name="like-post"),
    path("post/<str:id>", views.edit_post, name="edit-post"),
    path("user/<str:username>", views.load_profile, name="load-profile"),
    path("user/<str:username>/follow", views.follow, name="follow"),
]
