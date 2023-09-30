import os
basedir=os.path.abspath(os.path.dirname(__file__))
from celery.schedules import crontab
class Config():
    DEBUG = False
    SQLITE_DB_DIR=None
    SQLALCHEMY_DATABASE_URI=None
    SQLALCHEMY_TRACK_MODIFICATIONS=False
    CELERY_BROKER_URL = 'redis://localhost:6379/1'
    CELERY_RESULT_BACKEND = 'redis://localhost:6379/2'
    REDIS_URL='redis://localhost:6379'
    CACHE_TYPE = 'RedisCache'
    CACHE_REDIS_HOST='localhost'
    CACHE_REDIS_PORT=6379

class LocalDevelopConfig(Config):
    SQLITE_DB_DIR=os.path.join(basedir,"../db_directory")
    SQLALCHEMY_DATABASE_URI="sqlite:///"+os.path.join(SQLITE_DB_DIR,"TicketBooking.sqlite3")
    DEBUG=True
    JWT_SECRET_KEY="11823466805430238040"