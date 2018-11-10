
binance_coins = [
    'USDT', 'BTC', 'ETH', 'BCH',
    'LTC', 'XRP', 'XMR', 'ETC', 'ZEC', 'IOTA', 'TUSD',
    'KNC', 'SALT', 'ICN', 'ADX', 'GXS', 'CHAT', 'VIA', 'YOYOW',
    'ARK', 'HSR', 'GRS', 'NULS', 'AE', 'RDN', 'BRD', 'STORJ', 'TNB', 'VIBE', 'GAS', 'EVX', 'DNT', 'RLC',
    'TNT', 'MDA', 'ELF', 'ICX', 'IOTA', 'GRS', 'QSP', 'AMB', 'REQ', 'BCPT', 'BCH', 'SALT', 'XZC', 'VEN',
    'EDO', 'ZRX', 'RCN', 'MTH', 'SNGLS', 'TNB', 'ICX', 'LEND', 'SNM', 'OST', 'BCD', 'WINGS', 'WAVES', 'LTC',
    'ENJ', 'BCPT', 'GVT', 'VEN', 'XRB', 'SYS', 'MTL', 'QLC', 'CMT', 'OAX', 'BTG', 'NAV', 'BTG', 'BNT', 'INS',
    'AMB', 'STORM', 'STRAT', 'GVT', 'XZC', 'AE', 'DLT', 'AST', 'WABI', 'NEO', 'VIBE', 'GXS', 'RLC', 'TRX',
    'NCASH', 'LRC', 'BQX', 'LINK', 'NAV', 'BNT', 'INS', 'STRAT', 'PIVX', 'VIB', 'ELF', 'BRD', 'CND', 'WINGS', 'OAX',
    'ICN', 'CND', 'DASH', 'FUN', 'XEM', 'CHAT', 'DGD', 'MANA', 'PIVX', 'ARN', 'SNT', 'CDT', 'SNM', 'MCO', 'BAT', 'BCD',
    'ONT', 'WPR', 'FUN', 'XRB', 'BQX', 'BTS', 'SYS', 'ARK', 'POE', 'VIA', 'SUB', 'LSK',
    'ZIL', 'XEM', 'WAVES', 'EVX', 'MDA', 'BLZ', 'REQ', 'TRX', 'CMT', 'DGD', 'MTH', 'ZIL', 'RPX', 'EOS', 'LEND',
    'TNT', 'ZRX', 'RDN', 'STORJ', 'BNB', 'KNC', 'IOST', 'NEBL', 'OMG', 'POA', 'MOD', 'KMD', 'BCH',
    'LUN', 'BTS', 'OST', 'DASH', 'NEBL', 'OMG', 'ENG', 'QSP', 'PPT', 'LUN', 'XLM', 'FUEL', 'STORM',
    'ADA', 'QTUM', 'APPC', 'WABI', 'BAT', 'TRIG', 'BNB', 'ENJ', 'LRC', 'ADA', 'MANA', 'ADA', 'HSR', 'STEEM',
    'DLT', 'GTO', 'MTL', 'APPC', 'POWR', 'AION', 'AION', 'SUB', 'AST', 'STEEM', 'NCASH',
    'WTC', 'WAN', 'YOYOW', 'LSK', 'WPR', 'ARN', 'LTC', 'XLM', 'BNB', 'NEO', 'EDO',
    'PPT', 'ZEC', 'KMD', 'SNGLS', 'DNT', 'QTUM', 'FUEL',
    'WTC', 'IOST', 'MOD', 'POA', 'RCN', 'POWR', 'RPX', 'MCO', 'XVG', 'SNT',
    'POE', 'BLZ', 'QTUM', 'XRP', 'ADX', 'WAN', 'VIB',
    'EOS', 'TRIG', 'NEO', 'ETH', 'ENG', 'CDT', 'ONT', 'LINK', 'QLC', 'BCH', 'XVG', 'NULS', 'GTO', 'CLOAK', 'CLOAK'
]
binance_coins = list(set(binance_coins))


def translate_allocs_binance_coins(allocation):
    new_allocation = []
    for alloc in allocation:
        if alloc['coin'] == "BCH": alloc['coin'] = "BCC"
        if alloc['coin'] == "XRB": alloc['coin'] = "NANO"
        if alloc['coin'] == "YOYOW": alloc['coin'] = "YOYO"

        new_allocation.append({
            'coin': alloc['coin'], 'portion': alloc['portion']
        })
    return new_allocation

def reverse_translate_allocs_binance_coins(allocation):
    new_allocation = []
    for alloc in allocation:
        if alloc['coin'] == "BCC": alloc['coin'] = "BCH"
        if alloc['coin'] == "NANO": alloc['coin'] = "XRB"
        if alloc['coin'] == "YOYO": alloc['coin'] = "YOYOW"

        new_allocation.append({
            'coin': alloc['coin'], 'portion': alloc['portion']
        })
    return new_allocation
