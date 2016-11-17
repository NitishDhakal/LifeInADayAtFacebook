from __future__ import unicode_literals
from django.db import models
from mongoengine import *
# Create your models here.


class Users (Document):
    user_name = StringField(max_length=120, required=True)
    app_specific_id = StringField(max_length=100, required=True)
    app_name = StringField(max_length=10, required=True)


class UserPosts (Document):
    user_id = ObjectIdField(required=True)
    message = StringField(max_length=5000, required=False)
    story = StringField(max_length=5000, required=False)
    created_time = DateTimeField(required=True)
    app_specific_post_id = StringField(max_length=5000, required=True)
    like_count = IntField(required=False)
    comment_count = IntField(required=False)


class UserComments (Document):
    app_specific_post_id = StringField(max_length=500, required=True)
    app_specific_comment_id = StringField(max_length=500, required=True)
    message = StringField(max_length=5000, required=False)
    created_time = DateTimeField(required=True)
    sender_name = StringField(max_length=5000, required=True)
    sender_id = IntField(required=False)


class Items (Document):
    user_id = ObjectIdField(required=False)
    post_message = StringField(max_length=5000, required=False)
    post_story = StringField(max_length=5000, required=False)
    post_created_time = DateTimeField(required=False)
    app_specific_post_id = StringField(max_length=5000, required=False)
    post_like_count = IntField(required=False)
    post_comment_count = IntField(required=False)
    app_specific_comment_id = StringField(max_length=500, required=False)
    comment_message = StringField(max_length=5000, required=False)
    comment_created_time = DateTimeField(required=False)
    comment_sender_name = StringField(max_length=5000, required=False)
    comment_sender_id = StringField(max_length=5000, required=False)
