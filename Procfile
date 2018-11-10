release: python manage.py migrate
web: waitress-serve --port=$PORT settings.wsgi:application
rebalancer: python manage.py rebalancer
