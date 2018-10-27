from django.conf.urls import include, url
from django.contrib import admin


urlpatterns = [

    url(r'^portfolio/', include('apps.portfolio.urls', namespace='porfolio')),

    url(r'^admin/', admin.site.urls),

]
