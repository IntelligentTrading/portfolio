from django.conf.urls import include, url
from django.contrib import admin
from django.urls import path

admin.autodiscover()


urlpatterns = [

    path('accounts/', include('django.contrib.auth.urls')),

    url(r'^portfolio/', include('apps.portfolio.urls', namespace='porfolio')),

    url(r'^admin/', admin.site.urls),

]
