from django.contrib import admin

# Register your models here.


from django.contrib import admin

from apps.portfolio.models import portfolio, exchange_account, allocation


@admin.register(portfolio.Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    pass

@admin.register(exchange_account.ExchangeAccount)
class ExchangeAccountAdmin(admin.ModelAdmin):
    pass

@admin.register(allocation.Allocation)
class AllocationAdmin(admin.ModelAdmin):
    pass
