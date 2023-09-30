from application.models import *
# from main import cache


#cache for atleast 50micro sec
def get_all_shows():
    return SHOWS.query.all()

# @cache.cached(timeout=50, key_prefix='get_all_venues')
def get_all_venues():
    return VENUES.query.all()

def get_show_by_ID(ID):
    return SHOWS.query.filter_by(ID=ID).first()
