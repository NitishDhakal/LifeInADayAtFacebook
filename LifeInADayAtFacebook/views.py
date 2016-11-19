from datetime import datetime as dt
from authomatic import Authomatic
from authomatic.adapters import DjangoAdapter
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from serializers import *
from django.template.context import RequestContext
from django.contrib.auth import logout as auth_logout
from config import CONFIG
from utilities import *
from datetime import datetime, timedelta
import time

authomatic = Authomatic(CONFIG, 'a super secret random string')


# Create your views here.


def index(request):
    return render(request, 'LifeInADayAtFacebook/login.html')

def demo(request):
    return render(request, 'LifeInADayAtFacebook/demo.html',{'host': "http://" + request.get_host() + "/LifeInADayAtFacebook/"})



def logout(request):
    if 'user' in request.session:
        del request.session['user']
        if 'authomatic' in request.session:
            del request.session['authomatic']
    return redirect("index");


def app(request):
    # check for user app id and user object and pass it to the app view
    if 'user' in request.session:
        # userAppID = kwargs['userappid']
        # userName=kwargs['username']
        print request.get_host()
        print request.session['user']
        return render(request, "LifeInADayAtFacebook/app.html", {'data': request.session['user'],
                                                                 'host': "http://" + request.get_host() + "/LifeInADayAtFacebook/"})

    # if session not found or expired return to index page
    response.write('<a href="..">Go to Home</a>')
    # Login procedure finished with an error.
    response.write('<h2>Error occured: Session not found or Expired .Please Goto home and login </h2>')


def login(request, provider_name=None):
    # if user session exists redirect to the app.html page
    if 'user' in request.session:
        return app(request)
    # provider_name = request.GET['provider_name']
    # We we need the response object for the adapter.
    response = HttpResponse()
    # Start the login procedure.
    result = authomatic.login(DjangoAdapter(request, response), provider_name)
    # If there is no result, the login procedure is still pending.
    # Don't write anything to the response if there is no result!
    if result:
        if result.error:
            # If there is result, the login procedure is over and we can write to response.
            response.write('<a href="..">Go to Home</a>')
            # Login procedure finished with an error.
            response.write('<h2>Error occured: {0}</h2>'.format(result.error.message))

        elif result.user:
            # we have the user! returned
            # OAuth 2.0 and OAuth 1.0a provide only limited user data on login,

            # If there are credentials (only by AuthorizationProvider),
            # we can _access user's protected resources.

            if not (result.user.name and result.user.id):
                result.user.update()

            if result.user.credentials:
                # create a url to call the graph api
                # Get date 2 months before now
                date_two_months_old = datetime.today() - timedelta(days=60)
                date_today = datetime.today()
                url = 'https://graph.facebook.com/v2.7/{0}/posts?since={1}&until={2}'.format(result.user.id,
                                                                                            date_two_months_old.date(),
                                                                                            date_today.date())
                kwargs = {"userappid": result.user.id, "email": result.user.email, "username": result.user.name,"providername":provider_name,"accesstoken": result.provider.access_token_response.data['access_token']}
                chart_vars = {"startdate": date_two_months_old, "enddate": date_today}

                if check_if_user_is_registered(result.user.id, provider_name):
                    if check_if_user_has_data(result.user.id, provider_name):
                        # get data from until todays date
                        get_updated_post_and_comments(result.user.id, provider_name, date_two_months_old.date(),
                                                      date_today.date(), result)
                        print "use is registered and has data"


                    else:
                        get_post_data_by_url_recursively(result, url, result.user.id, provider_name)
                        get_comments_from_posts(result.provider, result.user.id, provider_name)
                        print "user is registered and we received data"

                        # Todo:goto app
                    user_obj_from_db = Users.objects(app_specific_id=result.user.id, app_name=provider_name)
                    print user_obj_from_db[0]
                    user_id = user_obj_from_db[0].id
                    kwargs['userid'] = user_id
                    print kwargs
                    request.session['user'] = kwargs
                    return app(request)

                else:
                    register_user(result.user.id, result.user.name, provider_name)
                    get_post_data_by_url_recursively(result, url, result.user.id, provider_name)
                    get_comments_from_posts(result.provider, result.user.id, provider_name)
                    # Todo:goto app
                    user_obj_from_db = Users.objects(app_specific_id=result.user.id, app_name=provider_name)
                    user_id = user_obj_from_db[0].id
                    kwargs['userid'] = user_id
                    request.session['user'] = kwargs
                    return app(request)
            else:
                response.write('<a href="..">Go to Home</a>')
                response.write('Error occured while accessing your personal details! Make sure you have given enough permission to the app<br />')
                response.write(u'Status: {0}'.format(response.status))

    return response


@csrf_exempt
@api_view(['GET', 'POST'])
def userlist(request):
    posts = Users.objects
    serializedlist = UserSerializer(posts, many=True)
    return Response(serializedlist.data)


@csrf_exempt
@api_view(['GET', 'POST'])
def post_and_comments_by_created_date(request, userid, year_from, month_from, day_from, year_to, month_to, day_to, is_first):
    #offset = 0
    #limit = 1000
    date1 = month_from + "/" + day_from + "/" + year_from
    date2 = month_to + "/" + day_to + "/" + year_to
    start_date = datetime.strptime(date1, '%m/%d/%Y')
    end_date = datetime.strptime(date2, '%m/%d/%Y')
    print start_date
    print end_date
    if 'user' in request.session:
        user_session=request.session['user']
        user_id = user_session['userappid']
        provider_name = user_session['providername']
        access_token = user_session['accesstoken']
        # if it is a first call dont update the db
        if is_first == '0':
            get_updated_post_and_comments_by_graph_api(user_id, provider_name, start_date.date(),
                                      end_date.date(), access_token)

    posts = UserPosts.objects(user_id=userid, created_time__gte=start_date, created_time__lte=end_date).order_by(
        'created_time')
    resultant_list = []
    if len(posts) > 0:
        start_date_comment = posts[len(posts) - 1].created_time
        print start_date_comment
        # add comment to the result list
        for post in posts:
            comments = UserComments.objects(app_specific_post_id=post.app_specific_post_id,
                                            created_time__gte=start_date_comment, created_time__lte=end_date)
            for comment in comments:
                if len(comment) > 0:
                    document = {}
                    document['app_specific_post_id'] = comment.app_specific_post_id
                    document['comment_message'] = comment.message
                    document['created_time'] = comment.created_time
                    document['app_specific_comment_id'] = comment.app_specific_comment_id
                    document['comment_sender_name'] = comment.sender_name
                    document['comment_sender_id'] = comment.sender_id
                    document['is_post'] = 0
                    resultant_list.append(document)

        # add post to the result list
        for post in posts:
            document = {}
            document['post_message'] = post.message
            document['post_story'] = post.story
            document['created_time'] = post.created_time
            document['app_specific_post_id'] = post.app_specific_post_id
            document['post_like_count'] = post.like_count
            document['post_comment_count'] = post.comment_count
            document['is_post'] = 1
            resultant_list.append(document)

    print "postlength" + str(len(posts))
    print "resultant_list" + str(len(resultant_list))
    print len(resultant_list)
    response = Response(resultant_list, status=status.HTTP_200_OK)
    return response


@csrf_exempt
@api_view(['GET', 'POST'])
def post_and_comments_by_created_date_demo(request, year_from, month_from, day_from, year_to, month_to, day_to):
    #offset = 0
    #limit = 1000
    date1 = month_from + "/" + day_from + "/" + year_from
    date2 = month_to + "/" + day_to + "/" + year_to
    start_date = datetime.strptime(date1, '%m/%d/%Y')
    end_date = datetime.strptime(date2, '%m/%d/%Y')

    posts = UserPosts.objects(created_time__gte=start_date, created_time__lte=end_date).order_by(
        'created_time')
    resultant_list = []
    if len(posts) > 0:
        start_date_comment = posts[len(posts) - 1].created_time
        # add comment to the result list
        for post in posts:
            comments = UserComments.objects(app_specific_post_id=post.app_specific_post_id,
                                            created_time__gte=start_date_comment, created_time__lte=end_date)
            for comment in comments:
                if len(comment) > 0:
                    document = {}
                    document['app_specific_post_id'] = comment.app_specific_post_id
                    document['comment_message'] = comment.message
                    document['created_time'] = comment.created_time
                    document['app_specific_comment_id'] = comment.app_specific_comment_id
                    document['comment_sender_name'] = comment.sender_name
                    document['comment_sender_id'] = comment.sender_id
                    document['is_post'] = 0
                    resultant_list.append(document)

        # add post to the result list
        for post in posts:
            document = {}
            document['post_message'] = post.message
            document['post_story'] = post.story
            document['created_time'] = post.created_time
            document['app_specific_post_id'] = post.app_specific_post_id
            document['post_like_count'] = post.like_count
            document['post_comment_count'] = post.comment_count
            document['is_post'] = 1
            resultant_list.append(document)

    print "postlength" + str(len(posts))
    print "resultant_list" + str(len(resultant_list))
    print len(resultant_list)
    response = Response(resultant_list, status=status.HTTP_200_OK)
    return response
