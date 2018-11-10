import logging
from copy import deepcopy
from datetime import datetime

import schedule
import time
import threading

from django.core.management.base import BaseCommand

from apps.portfolio.models import Portfolio
from apps.portfolio.models.allocation import ITF1HR, ITF6HR, ITF24HR, ITF_PACKS
from apps.portfolio.services.signals import get_allocations_from_signals, SHORT_HORIZON, MEDIUM_HORIZON, LONG_HORIZON
from apps.portfolio.services.trading import set_portfolio

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Run aut-balancing'

    def handle(self, *args, **options):
        logger.info("Starting telegram info_bot.")

        schedule.every(20).minutes.do(balance_portfolios)


def balance_portfolios():
    # today = datetime.today()
    # query_time = datetime(today.year, today.month, today.day, today.hour, 20)

    ITF_PACK_HORIZONS = {ITF1HR: SHORT_HORIZON, ITF6HR: MEDIUM_HORIZON, ITF24HR: LONG_HORIZON}

    ITF_binance_allocations = {
        itf_group: get_allocations_from_signals(horizon=horizon, at_datetime=datetime.now())
        for itf_group, horizon in ITF_PACK_HORIZONS.items()
    }
    for portfolio in Portfolio.objects.all():
        if portfolio.recently_rebalanced:
            continue

        binance_account = portfolio.exchange_accounts.first()

        if not binance_account:
            continue
        if not binance_account.is_active:
            continue

        target_allocation = deepcopy(portfolio.target_allocation)
        for alloc in portfolio.target_allocation:
            if alloc['coin'] in ITF_PACKS:
                itf_pack = alloc['coin']
                target_allocation = merge_allocations(
                    base_allocation=target_allocation,
                    insert_allocation=ITF_binance_allocations[itf_pack],
                    key=itf_pack
                )

        final_target_allocation = clean_allocation(target_allocation)

        processing_data = set_portfolio(portfolio, final_target_allocation)
        portfolio.update_processing(processing_data)  # multithreaded


def clean_allocation(allocation):

    clean_allocation = []
    portion_sum = 0.0
    for alloc in allocation:
        if alloc['coin'] in ITF_PACKS:
            continue
        if float(alloc['portion']) < 0.0005:
            continue
        if alloc['coin'] == "BTC":
            continue

        portion_sum += float(alloc['portion'])
        clean_allocation.append({
            'coin': alloc['coin'], 'portion': float(alloc['portion']) // 0.0001 / 10000
        })

    clean_allocation.append({
            'coin': "BTC", 'portion': (0.999 - portion_sum)
        })

    return clean_allocation

def merge_allocations(base_allocation, insert_allocation, key):
    portion_multiplier = float(base_allocation[key])

    for coin, portion in insert_allocation.items():
        if coin not in base_allocation:
            base_allocation[coin] = 0.0
        base_allocation[coin] += portion * portion_multiplier

    return base_allocation
