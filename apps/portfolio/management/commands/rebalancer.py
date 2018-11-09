import logging
from copy import deepcopy
from datetime import datetime

import schedule
import time
import threading

from django.core.management.base import BaseCommand

from apps.portfolio.models import Portfolio
from apps.portfolio.services.signals import get_allocations_from_signals, SHORT_HORIZON, MEDIUM_HORIZON, LONG_HORIZON
from apps.portfolio.services.trading import set_binance_portfolio
from apps.portfolio.views.allocations import merge_allocations

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Run aut-balancing'

    def handle(self, *args, **options):
        logger.info("Starting telegram info_bot.")

        schedule.every(20).minutes.do(balance_portfolios)


def balance_portfolios():
    # today = datetime.today()
    # query_time = datetime(today.year, today.month, today.day, today.hour, 20)

    ITF_PACK_HORIZONS = {"ITF1HR": SHORT_HORIZON, "ITF6HR": MEDIUM_HORIZON, "ITF24HR": LONG_HORIZON}

    ITF_binance_allocations = {
        itf_group: get_allocations_from_signals(horizon=horizon, at_datetime=datetime.now())
        for itf_group, horizon in ITF_PACK_HORIZONS.items()
    }
    for portfolio in Portfolio.objects.all():
        if not portfolio.exchange_accounts.first().is_active:
            continue
        portfolio_allocations = portfolio.target_allocation
        for itf_pack, horizon in ITF_PACK_HORIZONS.items():
            if itf_pack in portfolio_allocations and portfolio_allocations[itf_pack] > 0.005:
                portfolio_allocations = merge_allocations(
                    base_allocation=portfolio_allocations,
                    insert_allocation=ITF_binance_allocations[itf_pack],
                    key=itf_pack
                )
        if itf_pack in portfolio_allocations:
            del portfolio_allocations[itf_pack]

        for coin, portion in deepcopy(portfolio_allocations):
            portfolio_allocations[coin] = (portion // 0.0001) * 10000

        processing_data = set_binance_portfolio(portfolio_allocations)
        portfolio.update_processing(processing_data)  # multithreaded
