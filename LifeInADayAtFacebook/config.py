from authomatic.providers import oauth2, oauth1, openid
CONFIG = {

    'tw': {  # Your internal provider name

        # Provider class
        'class_': oauth1.Twitter,

        # Twitter is an AuthorizationProvider so we need to set several other properties too:
        'consumer_key': '########################',
        'consumer_secret': '########################',
    },

    'fb': {
        'class_': oauth2.Facebook,

        # Facebook is an AuthorizationProvider too.
        'consumer_key': '688256267991758',
        'consumer_secret': '8426d90b7d7a430cbfb0f62f838c9f48',

        # But it is also an OAuth 2.0 provider and it needs scope.
        'scope': ['user_about_me', 'email'],
    },

    'oi': {

        # OpenID provider dependent on the python-openid package.
        'class_': openid.OpenID,
    }
}