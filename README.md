# LifeInADayAtFacebook
A day of life in social media through visual analytics

There has been significant rise in number of users in social networks over the time. These users have different types of interactions in the social network. If we consider Facebook, likes, comments, posts are most common modes of the interactions. In twitter people tweet, retweet, follow, hashtag etc. There is no doubt that people spend quite significant amount of their time per day in these social network and their time remains unaccounted.

Since people are oblivious to their time spending in these social medias, it would be beneficial for them to see how do they spend time in general. With our visual analytic tool, we not only want to provide the user with the overall insight of their interactions, but also provide a vertical movable timeline to view different types of interactions at their own pace. This is essential because in Facebook or Twitter user need to scroll down to the bottom to see their posts and comments and this part takes significant amount of user time.

Our project titled “Life in a day at Facebook” or LIADAF will take into account of user activities in Facebook and Twitter; and provide an interactive chart with different features for them to explore. We also evaluate our design with the user survey and present the results. The main goal of the project is to highlight different interaction traffic in Facebook within a day through visual analytics. We have highlighted 6 time frames within a day namely, midnight to 4 am, 4 am to 8 am, 8 am to 12 pm, 12 pm to 16 pm, 16 pm to 20 pm and finally 20 pm to midnight. The main view of LIADAF is shown in Figure 1.
The main objectives of this projects are:

1.	To find out how user spend their time in Facebook or Twitter daily
2.	To find out the average latency in interactions done in user Facebook or Twitter page.
3.	To view the activities in Facebook or Twitter in a moving timeline at our own speed.

With the interactive charts rendered by D3, jQuery and JavaScript in the front end and Django in the back end, we have focused our visualization in Facebook and made a system that could easily be extended to Twitter as well. We have targeted our application to the Facebook and Twitter users (16-35 years) who would like to view and perhaps decide how have they usually spend their time in social medias.

Demo:

Amazon AWS instance : http://35.161.146.25:8000/LifeInADayAtFacebook/demo

This version is better viewed in Google Chrome.(Some bugs in Mozilla still exits like the instance chart is not shown in  firefox.)

FEATURES

LIADAF has 10 features as shown in Figure 2. However, we have listed the 6 prominent ones as explained below.
1.	Main Moving Chart
This is the heart of the application as well as the main area of user focus. This contains the vertical time line with user posts and comments on either side of the timeline. The interaction widget was developed with svg entirely so as to provide efficient scaling and also because html divs are not supported within svg element. In the main moving char, user post and comment appears alternatively along the selected date range on either side of vertical timeline. 

2.	Play, Pause and Forward widget
This is another addition to the main moving chart which provides dynamism with user control. User can play pause or forward the moving chart with the slider button.The horizontal slider widget is created to track the mouse movement across the horizontal axis which could provide different speed range.

3.	Navigation Chart
This sub chart allows the user to navigate across the timeline in horizontal fashion. This chart also allows the user to know the instance of posts and comments which appears sequentially according to the date of creation. Navigation chart also allows brushing selection across time as well as scaling and zooming options. Circles with 2 different colors are used to show the posts and comments as they appear with respect to the date in this chart.

4.	Calendar Widget
User can load arbitrary historic ranges of Facebook or Twitter data and view their interactions across the main chart and navigation chart. To load these data, user need to be logged in to either Facebook or Twitter. Initially when the user logs into the system, the system pulls the recent 2 months old data and updates the mongo database. If the user wants to select the different date range, then the system pulls the following data from the Facebook or Twitter when the user is in session and saves it into the mongo database and send it back to the UI in runtime through API. The fun thing with the closure and singleton pattern used in the LifeInADayAtFacebook.js is that the objects can be inserted into the chart at runtime without initializing the whole chart object again. 

5.	Interaction Widget across different timeframes (Daily Stats Chart)
This widget provides the percentage of time spend by the user in Facebook or Twitter through the dynamic bar chart. The time frame here is divided into 6 different partitions as mentioned in the introduction section. 

6.	Interaction Instance Widget
This widget is essential in giving user high level knowledge about the data. The main chart and navigation chart has to be moved until end to see all the occurring of interaction data. However, with this widget, user can view the interaction instances between the selected date range in advance to moving the vertical chart. There is also a presence of horizontal moving bar to make user better understand the interaction occurrences along the selected date range.

ARCHITECTURE

MVC based python web framework called “Django” is being used as the backend in this project. The choice of using this framework was lightness of the framework, clear separation of concerns among code and templates and ORM (Object Relational Mapper) tool. The ORM in Django is really powerful with advanced querying features that supports multiple databases. We have Mongo dB as our backend and Mongoengine as our ORM. Although we could have used PostgreSQL as our backend, of which Django has lots of support, we decided to go with MongoDb for learning purposes. To build our APIs, we relied upon Django REST framework which is equally powerful and simple to configure. The server side has used MVC (Model View Controller) pattern or rather MTV (Model Template Controller) while the client side scripting has leveraged the closure and singleton pattern as a design pattern. The codes are provided as an open source and we have tried to follow the necessary coding standards. 

APPLICATION FLOW

1.	User goes into our home page (Login.html) and chose whether he wants to login through Facebook or Twitter
2.	After login in S/he would have to give the necessary credentials and “use post” permission in Facebook or Twitter. This is the necessary step to produce data. If user does not provide the access to the user feed, then the application would not work.
3.	After step 2, the application fetches the 2-month old profile information of the user and save it in Mongo DB data store and format the data and send it to the view to render.
4.	The view comprises of the app.html file, which utilizes the native JavaScript, d3 framework and jQuery to render the visualization.
5.	The visualizer has 2 different chart components, main Chart and navigation chart. Main chart contains the vertical moving time scale along with the beautiful components showing the user post and comments information over time defined in the date time widget. The navigation chart provided the same information in a smaller chart but with panning and zoom facility. There is also play, pause and forward button to provide interactivity feature to the user. There is also a feature to select the data within the particular range. If user selects the data in different date range, then the API calls the Facebook or Twitter server for additional information and again store data in Mongo Db data store and then send the data to the view to render. 


