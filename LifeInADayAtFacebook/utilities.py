from LifeInADayAtFacebook.models import Users, UserPosts, UserComments
from django.conf import settings
from datetime import datetime, timedelta
import urllib2, json


def get_comments_from_posts(provider, app_specific_user_id, app_name):
    # get all post objects
    user = Users.objects(app_specific_id=app_specific_user_id, app_name=app_name)
    posts = UserPosts.objects(user_id=user[0].id)
    for postObj in posts:
        app_specific_post_id = postObj.app_specific_post_id
        comments_fetch_url = 'https://graph.facebook.com/v2.7/{0}/comments'.format(app_specific_post_id)
        get_comments_data_by_url_recursively(provider, comments_fetch_url, app_specific_post_id)
    return


def get_comments_from_posts_by_given_postlist(result, app_specific_user_id, app_name, post_list):
    for postObj in post_list:
        app_specific_post_id = postObj.app_specific_post_id
        comments_fetch_url = 'https://graph.facebook.com/v2.7/{0}/comments'.format(app_specific_post_id)
        get_comments_data_by_url_recursively(result.provider, comments_fetch_url, app_specific_post_id)
    return


def get_comments_from_posts_by_given_postlist_by_graph_api(access_token, app_specific_user_id, app_name, post_list):
    for postObj in post_list:
        app_specific_post_id = postObj.app_specific_post_id
        comments_fetch_url = 'https://graph.facebook.com/v2.7/{0}/comments?access_token={1}&format=json'.format(
            app_specific_post_id, access_token)
        get_comments_data_by_url_recursively_by_graph_api(access_token, comments_fetch_url, app_specific_post_id)
    return


def get_comments_data_by_url_recursively_by_graph_api(access_token, url, app_specific_post_id):
    print "getting comments by url"
    try:
        response = urllib2.urlopen(url).read()
        access_response = json.loads(response)
        print access_response['data']
        if len(access_response['data']) >= 0:
            # Parse response.
            comment_data = access_response['data']
            if comment_data:
                print comment_data
                for message in comment_data:
                    comments = UserComments.objects(app_specific_comment_id=message['id'])
                    if len(comments) == 0:
                        print message
                        comment_dict = {
                            "app_specific_post_id": app_specific_post_id,
                            "app_specific_comment_id": message['id'],
                            "message": message['message'],
                            "created_time": message['created_time'],
                            "sender_name": message['from']['name'],
                            "sender_id": message['from']['id']
                        }
                        # save the posts
                        save_comment_data(comment_dict)

                # check if the thereare nocomments
                if not len(comment_data) == 0:
                    # check if there is still more data left
                    if 'next' in access_response['paging']:
                        paging_url = access_response['paging']['next']
                        get_comments_data_by_url_recursively_by_graph_api(access_token, paging_url, app_specific_post_id)
                        #
    except urllib2.HTTPError:
        pass
    return


def get_comments_data_by_url_recursively(provider, url, app_specific_post_id):
    print "getting comments by url"
    access_response = provider.access(url)
    print access_response.data
    if access_response.status == 200:
        # Parse response.
        comment_data = access_response.data
        error = access_response.data.get('error')
        if error:
            print(u'Error Occured: {0}!'.format(error))
        elif comment_data:
            print comment_data
            for message in comment_data.get('data'):
                print message
                comments = UserComments.objects(app_specific_comment_id=message.get('id'))
                if len(comments) == 0:
                    comment_dict = {
                        "app_specific_post_id": app_specific_post_id,
                        "app_specific_comment_id": message.get('id'),
                        "message": message.get('message'),
                        "created_time": message.get('created_time'),
                        "sender_name": message['from']['name'],
                        "sender_id": message['from']['id']
                    }
                    # save the posts
                    save_comment_data(comment_dict)

            # check if the thereare nocomments
            if not len(comment_data.get('data')) == 0:
                # check if there is still more data left
                if 'next' in access_response.data['paging']:
                    paging_url = access_response.data['paging']['next']
                    get_comments_data_by_url_recursively(provider, paging_url, app_specific_post_id)
                    #
    else:
        print('Error Occured: {0}'.format(access_response.status))
    return


def save_comment_data(comment_dict):
    print "saving comment data"
    userComment = UserComments(app_specific_post_id=comment_dict['app_specific_post_id'],
                               app_specific_comment_id=comment_dict['app_specific_comment_id'],
                               message=comment_dict['message'], created_time=comment_dict['created_time'],
                               sender_name=comment_dict['sender_name'], sender_id=comment_dict['sender_id'])
    userComment.save()
    return


def get_post_summary(provider, post_id, summary_type):
    try:
        if summary_type == 'LIKE':
            url = 'https://graph.facebook.com/v2.7/{0}/likes?summary=true'.format(post_id)
            access_response = provider.access(url)
            count = access_response.data['summary']['total_count']
        else:
            url = 'https://graph.facebook.com/v2.7/{0}/comments?summary=true'.format(post_id)
            access_response = provider.access(url)
            count = access_response.data['summary']['total_count']
    except urllib2.HTTPError:
        count = 0
    return count

def get_post_summary_by_graph_api(access_token, post_id, summary_type):
    try:
        if summary_type == 'LIKE':
            url = 'https://graph.facebook.com/v2.7/{0}/likes?summary=true&access_token={1}'.format(post_id,access_token)
            print url
            response = urllib2.urlopen(url).read()
            access_response = json.loads(response)
            count = access_response['summary']['total_count']
        else:
            url = 'https://graph.facebook.com/v2.7/{0}/comments?summary=true&access_token={1}'.format(post_id,access_token)
            response = urllib2.urlopen(url).read()
            access_response = json.loads(response)
            count = access_response['summary']['total_count']
    except urllib2.HTTPError:
        count=0
    return count


def get_post_data_by_url_recursively(results, url, app_specific_user_id, app_name):
    print "getting data by url"
    access_response = results.provider.access(url)
    print access_response.data
    if access_response.status == 200:
        # Parse response.
        statuses = access_response.data
        error = access_response.data.get('error')
        if error:
            print(u'Error Occured: {0}!'.format(error))
        elif statuses:
            for message in statuses.get('data'):
                user = Users.objects(app_specific_id=app_specific_user_id, app_name=app_name)
                posts = UserPosts.objects(user_id=user[0].id, app_specific_post_id=message.get('id'))

                if len(posts) == 0:
                    post_data = {
                        "message": message.get('message'),
                        "story": message.get('story'),
                        "created_time": message.get('created_time'),
                        "app_specific_post_id": message.get('id'),
                        "like_count": get_post_summary(results.provider, message.get('id'), 'LIKE'),
                        "comment_count": get_post_summary(results.provider, message.get('id'), 'COMMENT')
                    }
                    # save the posts
                    save_post_data(app_specific_user_id, app_name, post_data)
            # check if there is still more data left
            if not len(access_response.data['data']) == 0:
                paging_url = access_response.data['paging']['next']
                get_post_data_by_url_recursively(results, paging_url, app_specific_user_id, app_name)
    else:
        print('Error Occured: {0}'.format(access_response.status))
    return


def get_post_data_by_url_recursively_by_graph_api(access_token, url, app_specific_user_id, app_name):
    print "getting data by url"
    try:
        response = urllib2.urlopen(url).read()
        access_response = json.loads(response)
        print access_response['data']
        if len(access_response['data']) >= 0:
            # Parse response.
            statuses = access_response['data']
            if statuses:
                for message in statuses:
                    user = Users.objects(app_specific_id=app_specific_user_id, app_name=app_name)
                    posts = UserPosts.objects(user_id=user[0].id, app_specific_post_id=message['id'])
                    if len(posts) == 0:
                        if 'message' in message:
                            msg=message['message']
                        else:
                            msg=''

                        if 'story' in message:
                            stry=message['story']
                        else:
                            stry=''
                        print  message['id']
                        print stry
                        post_data = {
                            "message": msg,
                            "story": stry,
                            "created_time": message['created_time'],
                            "app_specific_post_id": message['id'],
                            "like_count": get_post_summary_by_graph_api(access_token, message['id'], 'LIKE'),
                            "comment_count": get_post_summary_by_graph_api(access_token, message['id'], 'COMMENT')
                        }
                        # save the posts
                        save_post_data(app_specific_user_id, app_name, post_data)
                # check if there is still more data left
                if not len(access_response['data']) == 0:
                    paging_url = access_response['paging']['next']
                    get_post_data_by_url_recursively_by_graph_api(access_token, paging_url, app_specific_user_id, app_name)
    except urllib2.HTTPError:
        pass
    return


def save_post_data(app_specific_user_id, app_name, post_data):
    print "saving post data"
    # get user
    user = Users.objects(app_specific_id=app_specific_user_id, app_name=app_name)
    post = UserPosts(message=post_data['message'], story=post_data['story'], created_time=post_data['created_time'],
                     app_specific_post_id=post_data['app_specific_post_id'], like_count=post_data['like_count'],
                     comment_count=post_data['comment_count'])
    post.user_id = user[0].id
    post.save()
    return


def check_if_user_is_registered(id, app_name):
    user = Users.objects(app_specific_id=id, app_name=app_name)
    if len(user) > 0:
        if user[0].id:
            return True
        else:
            return False
    else:
        return False


def check_if_user_has_data(id, app_name):
    # default_post_count_setting = settings.DEFAULT_POST_COUNT_FOR_APP_RUN
    user = Users.objects(app_specific_id=id, app_name=app_name)
    """
    instead of counting the number of all the posts we get the default post count then  we count how many posts are there
    """
    # posts = UserPosts.objects(user_id=user[0].id)[:default_post_count_setting]
    posts = UserPosts.objects(user_id=user[0].id)
    if len(posts) > 0:
        return True
    else:
        return False


def get_last_post_created_Date(id, app_name):
    user = Users.objects(app_specific_id=id, app_name=app_name)
    posts = UserPosts.objects(user_id=user[0].id).order_by(
        'created_date')
    last_entry_date = posts[0].created_time
    return last_entry_date


def get_first_post_created_Date(id, app_name):
    """
    :param id:
    :param app_name:
    :return:
    """
    user = Users.objects(app_specific_id=id, app_name=app_name)
    posts = UserPosts.objects(user_id=user[0].id).order_by(
        'created_date')
    first_entry_date = posts[len(posts) - 1].created_time
    return first_entry_date


def get_updated_post_and_comments(id, app_name, date_to_fetch_from, date_to_fetch_until, result):
    """
    :param id:
    :param app_name:
    :param date_to_fetch_from:
    :param date_to_fetch_until:
    :param result:
    :return:
    """

    first_post_created_date = get_first_post_created_Date(id, app_name)
    user = Users.objects(app_specific_id=id, app_name=app_name)
    if date_to_fetch_from < first_post_created_date.date():
        url = 'https://graph.facebook.com/v2.7/{0}/posts?since={1}&until={2}'.format(id, date_to_fetch_from,
                                                                                     first_post_created_date.date() - timedelta(
                                                                                         days=1))
        get_post_data_by_url_recursively(result, url, id, app_name)

        # get comments for these posts

        posts = UserPosts.objects(user_id=user[0].id, created_time__gte=date_to_fetch_from,
                                  created_time__lte=first_post_created_date.date()- timedelta(days=1))
        get_comments_from_posts_by_given_postlist(result, id, app_name, posts)

    final_post_created_date = get_last_post_created_Date(id, app_name)

    if final_post_created_date.date() < date_to_fetch_until:
        url = 'https://graph.facebook.com/v2.7/{0}/posts?since={1}&until={2}'.format(id,
                                                                                     final_post_created_date.date() + timedelta(
                                                                                         days=1),
                                                                                     date_to_fetch_until)
        get_post_data_by_url_recursively(result, url, id, app_name)
        # get comments for these posts
        posts = UserPosts.objects(user_id=user[0].id, created_time__gt=final_post_created_date.date()+timedelta(
                                                                                         days=1),
                                  created_time__lte=date_to_fetch_until)
        if len(posts) > 0:
            get_comments_from_posts_by_given_postlist(result, id, app_name, posts)


def get_updated_post_and_comments_by_graph_api(id, app_name, date_to_fetch_from, date_to_fetch_until, access_token):
    first_post_created_date = get_first_post_created_Date(id, app_name)
    user = Users.objects(app_specific_id=id, app_name=app_name)
    if date_to_fetch_from < first_post_created_date.date():
        url = 'https://graph.facebook.com/v2.7/{0}/posts?since={1}&until={2}&access_token={3}&format=json'.format(id,
                                                                                                                  date_to_fetch_from,
                                                                                                                  first_post_created_date.date() - timedelta(
                                                                                                                      days=1),
                                                                                                                  access_token)
        get_post_data_by_url_recursively_by_graph_api(access_token, url, id, app_name)

        # get comments for these posts
        postslist = UserPosts.objects(user_id=user[0].id, created_time__gte=date_to_fetch_from,
                                  created_time__lte=first_post_created_date.date()- timedelta(days=1))
        if len(postslist)>0:
            get_comments_from_posts_by_given_postlist_by_graph_api(access_token, id, app_name, postslist)

    final_post_created_date = get_last_post_created_Date(id, app_name)

    if final_post_created_date.date() < date_to_fetch_until:
        url = 'https://graph.facebook.com/v2.7/{0}/posts?since={1}&until={2}&access_token={3}&format=json'.format(id,
                                                                                                                  final_post_created_date.date() + timedelta(
                                                                                                                      days=1),
                                                                                                                  date_to_fetch_until,
                                                                                                                  access_token)
        get_post_data_by_url_recursively_by_graph_api(access_token, url, id, app_name)
        # get comments for these posts
        postslist2 = UserPosts.objects(user_id=user[0].id, created_time__gt=final_post_created_date.date(),
                                  created_time__lte=date_to_fetch_until)
        if len(postslist2) > 0:
            get_comments_from_posts_by_given_postlist_by_graph_api(access_token, id, app_name, postslist2)


def register_user(userid, username, app_name):
    print "registering user"
    user = Users(app_specific_id=userid, app_name=app_name, user_name=username)
    user.save()


def save_posts_to_db():
    pass


def get_post_from_db():
    pass
