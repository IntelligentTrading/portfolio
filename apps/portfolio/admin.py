from django.contrib import admin

# Register your models here.


from django.contrib import admin
from apps.portfolio.models.portfolio import Portfolio, ExchangeAccount, AllocationSnapshot

@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    pass

@admin.register(ExchangeAccount)
class ExchangeAccountAdmin(admin.ModelAdmin):
    pass

@admin.register(AllocationSnapshot)
class AllocationSnapshotAdmin(admin.ModelAdmin):
    pass
