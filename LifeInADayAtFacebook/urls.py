from django.conf.urls import url, include
from LifeInADayAtFacebook import views
from django.conf import settings


urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^login/(?P<provider_name>\w{1,20})$', views.login, name='login'),
    url(r'^demo', views.demo, name='demo'),
    # url(r'^app$', views.app, name='app'),
    url(r'^logout', views.logout, name='logout'),
    url(r'^UserList', views.userlist, name='userlistapi'),
    url(r'^PostAndCommentsByCreatedDate/(?P<userid>\w{1,100})/(?P<year_from>\d{4})/(?P<month_from>\d{1,2})/(?P<day_from>\d{1,2})/(?P<year_to>\d{4})/(?P<month_to>\d{1,2})/(?P<day_to>\d{1,2})/(?P<is_first>\d{1})$', views.post_and_comments_by_created_date, name='postandcommentapi'),

url(r'^PostAndCommentsByCreatedDateDemo/(?P<year_from>\d{4})/(?P<month_from>\d{1,2})/(?P<day_from>\d{1,2})/(?P<year_to>\d{4})/(?P<month_to>\d{1,2})/(?P<day_to>\d{1,2})$', views.post_and_comments_by_created_date_demo, name='postandcommentapidemo'),


]

#if not settings.DEBUG:
    urlpatterns += patterns('',
        (r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT}),
    )






