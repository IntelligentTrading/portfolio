from django.shortcuts import render
from django.views.generic import View


class PortfolioView(View):
    def dispatch(self, request, *args, **kwargs):

        # cache.set('my_key', 'hello, world!', 30) # key, value, seconds to expire
        # cache.get('my_key', 'default_value') # key, value if not found

        return super().dispatch(request, *args, **kwargs)

    def get(self, request):
        context = {
            # "portfolio": request.user.portfolio
        }

        return render(request, 'portfolio.html', context)
