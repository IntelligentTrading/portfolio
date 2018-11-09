import os

import dj_database_url

from settings import LOCAL, PRODUCTION, STAGE


if PRODUCTION:
    BUCKET_NAME = "intelligenttrading-s3-production"
    QUEUE_NAME = "intelligenttrading-sqs-production" # for production bot
    # DELAYED_QUEUE_NAME = "intelligenttrading-delayed-sqs-production"
    BETA_QUEUE_NAME = "intelligenttrading-sqs-beta" # for beta bot
    TEST_QUEUE_NAME = ""
    SNS_NAME = "intelligenttrading-sns-production"

elif STAGE:
    BUCKET_NAME = "intelligenttrading-s3-stage"
    QUEUE_NAME = "intelligenttrading-sqs-stage" # for stage bot
    BETA_QUEUE_NAME = "" # intelligenttrading-sqs-stage-beta
    # DELAYED_QUEUE_NAME = "intelligenttrading-delayed-sqs-stage"
    TEST_QUEUE_NAME = ""
    SNS_NAME = "intelligenttrading-sns-stage"

else: # LOCAL
    pass # see local_settings.py


if not LOCAL:

    # AWS
    AWS_OPTIONS = {
        'AWS_ACCESS_KEY_ID': os.environ.get('AWS_ACCESS_KEY_ID'),
        'AWS_SECRET_ACCESS_KEY': os.environ.get('AWS_SECRET_ACCESS_KEY'),
        'AWS_STORAGE_BUCKET_NAME': BUCKET_NAME,
    }

    HOST_URL = 'http://' + BUCKET_NAME + '.s3.amazonaws.com'
    MEDIA_URL = 'http://' + BUCKET_NAME + '.s3.amazonaws.com/'
    AWS_STATIC_URL = 'http://' + BUCKET_NAME + '.s3.amazonaws.com/'
    #STATIC_ROOT = STATIC_URL = AWS_STATIC_URL
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto.S3BotoStorage'
    #STATICFILES_STORAGE = 'storages.backends.s3boto.S3BotoStorage'

    DATABASES = {
        'default': {
        }
    }

    db_from_env = dj_database_url.config(conn_max_age=600, ssl_require=True)
    DATABASES['default'].update(db_from_env)


# Memcached Cloud settings
# https://devcenter.heroku.com/articles/memcachedcloud
def get_cache():
    try:
        servers = os.environ['MEMCACHEDCLOUD_SERVERS']
        username = os.environ['MEMCACHEDCLOUD_USERNAME']
        password = os.environ['MEMCACHEDCLOUD_PASSWORD']
        return {
            'default': {
                'BACKEND': 'django_bmemcached.memcached.BMemcached',
                'LOCATION': servers.split(','),
                'OPTIONS': {
                    'username': username,
                    'password': password,
                }
            }
        }
    except:
        return {
            'default': {
                'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'
            }
        }

CACHES = get_cache()
# UpdateCacheMiddleware settings. For auto caching RESTful API.
CACHE_MIDDLEWARE_SECONDS = 60 * 60 # cache pages for 60 min same as SHORT period in price model
CACHE_MIDDLEWARE_ALIAS = 'default'
CACHE_MIDDLEWARE_KEY_PREFIX = ''

# Temporary disable cache for debug
# CACHES = {
#     'default': {
#         'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
#     }
# }

# Celery settings
CELERY_BROKER_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379') # if env not set use local redis server

ITF_TRADING_API_URL = os.environ.get('ITF_TRADING_API_URL', 'abc123')
ITF_TRADING_API_KEY = os.environ.get('ITF_TRADING_API_KEY', 'abc123')

ITF_CORE_API_URL = os.environ.get('ITF_CORE_API_URL', 'abc123')
ITF_CORE_API_KEY = os.environ.get('ITF_CORE_API_KEY', 'abc123')
