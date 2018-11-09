from django.conf.urls import include, url
from django.contrib import admin
from django.urls import path
from django.views.generic import RedirectView

admin.autodiscover()


urlpatterns = [

    url(r'^$', RedirectView.as_view(url='/accounts/login'), name="home"),
    url(r'^portfolio/', include('apps.portfolio.urls', namespace='porfolio')),

    path('accounts/', include('django.contrib.auth.urls')),
    url(r'^admin/', admin.site.urls),

]
