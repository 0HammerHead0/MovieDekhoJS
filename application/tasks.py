from celery import Celery
from jinja2 import Template
from application.database import *
from application.models import *
from application import mails
import datetime
celery = Celery('tasks', broker='redis://localhost:6379/1')

@celery.task()
def daily_task():
    users=USERS.query.all()
    for user in users:
        user_show_rate_entry = UserShowRate.query.filter_by(users_id=user.ID).all()
        flag=False
        for term in user_show_rate_entry:
            if term.seats !=0:
                flag=True
        if(not flag):
            with open("templates/daily_report.html") as file_:
                template=Template(file_.read())
                message=template.render(data=user)
            mails.send_email( user.email, subject='Welcome !',message=message,content="html",attachment_file="static/images/thankyou.png")

    print("daily task executed!")
@celery.task()
def monthly_task():
    users = USERS.query.all()
    for user in users:
        user_show_rate_entries = UserShowRate.query.filter_by(users_id=user.ID).all()
        visited_shows = []
        rated_shows = []
        booked_shows = []
        for entry in user_show_rate_entries:
            show = SHOWS.query.get(entry.shows_id)
            if entry.seats > 0:
                booked_shows.append(show)
            if entry.rating > 0:
                rated_shows.append(show)
            visited_shows.append(show)
        
        if visited_shows or rated_shows or booked_shows:
            with open("templates/monthly_report.html") as file_:
                template = Template(file_.read())
                message = template.render(
                    user=user,
                    visited_shows=visited_shows,
                    rated_shows=rated_shows,
                    booked_shows=booked_shows,
                    date=datetime.datetime.now()
                )
            mails.send_email(user.email, subject='Monthly Report', message=message,content="html",attachment_file="static/images/thankyou.png")
    
    print("Monthly task executed!")