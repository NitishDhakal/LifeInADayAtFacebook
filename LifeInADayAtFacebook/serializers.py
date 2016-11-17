from rest_framework import serializers
from .models import Users, UserPosts, Items

class UserSerializer(serializers.Serializer):
    user_name = serializers.CharField(max_length=500)
    app_specific_id = serializers.CharField(max_length=500)
    app_name = serializers.CharField(max_length=500)

    def restore_object(self, attrs, instance=None):
        if instance is not None:
            for k, v in attrs.iteritems():
                setattr(instance, k, v)
            return instance
        return Users(**attrs)


class PostSerializer(serializers.Serializer):
    user_id = serializers.CharField(max_length=500)
    message = serializers.CharField(max_length=5000)
    story = serializers.CharField(max_length=5000)
    created_time = serializers.DateTimeField()
    app_specific_post_id = serializers.CharField(max_length=5000)
    like_count = serializers.IntegerField()
    comment_count = serializers.IntegerField()

    def restore_object(self, attrs, instance=None):
        if instance is not None:
            for k, v in attrs.iteritems():
                setattr(instance, k, v)
            return instance
        return UserPosts(**attrs)

class ItemSerializer (serializers.Serializer):
    user_id = serializers.CharField(max_length=500)
    post_message = serializers.CharField(max_length=5000)
    post_story = serializers.CharField(max_length=5000)
    post_created_time = serializers.DateTimeField()
    app_specific_post_id = serializers.CharField(max_length=5000)
    post_like_count = serializers.IntegerField()
    post_comment_count = serializers.IntegerField()
    is_post = serializers.BooleanField()
    comment_message = serializers.CharField(max_length=5000)
    comment_created_time = serializers.DateTimeField()
    app_specific_comment_id = serializers.CharField(max_length=5000)
    comment_sender_name = serializers.CharField(max_length=5000)
    comment_sender_id = serializers.CharField(max_length=5000)

    def restore_object(self, attrs, instance=None):
        if instance is not None:
            for k, v in attrs.iteritems():
                setattr(instance, k, v)
            return instance
        return Items(**attrs)

