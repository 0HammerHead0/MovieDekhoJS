import os
from weasyprint import HTML
from flask import Flask ,render_template
from flask_cors import CORS , cross_origin
from application.config import LocalDevelopConfig
from application.database import db
from application.models import *
from application.data_access import *
from application import mails
# from application import webhooks
from celery import Celery
from celery import Task
# from application import workers
from flask_restful import Resource,Api
from logging.handlers import RotatingFileHandler
from flask_jwt_extended import JWTManager
from flask_sse import sse
from flask_caching import Cache
from celery.schedules import crontab
import logging
import time


app=None
api=None
jwt=None
cache=None
celery=None

def create_app():
    app=Flask(__name__,template_folder='templates')
    if os.getenv('ENV',"development")=="production":
        raise Exception("Currently no production config is setup.")
    else:
        print("Starting Local Development")
        app.config.from_object(LocalDevelopConfig)

    #LOGGING   
    logging.basicConfig(level=logging.DEBUG, format='%(levelname)s: %(message)s')
    log_filename = 'app.log'
    log_handler = RotatingFileHandler("app.log", maxBytes=1024 * 1024*100, backupCount=5)
    log_handler.setLevel(logging.DEBUG)
    log_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
    app.logger.addHandler(log_handler)
    app.logger.setLevel(logging.DEBUG)
    db.init_app(app)
    api=Api(app)
    CORS(app)
    jwt=JWTManager(app)
    cache = Cache(config={'CACHE_TYPE': 'filesystem', 'CACHE_DIR': '/tmp'})
    cache.init_app(app)
    app.app_context().push()
    return app, api,jwt,cache


app,api,jwt,cache=create_app()

#--------------------------------------------------- CELERY INITIALIZATION -----------------------------------------

def celery_init_app(app: Flask) -> Celery:
    class FlaskTask(Task):
        def __call__(self, *args: object, **kwargs: object) -> object:
            with app.app_context():
                return self.run(*args, **kwargs)
    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object(app.config["CELERY"])
    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app

app.config.from_mapping(
    CELERY=dict(
        broker_url="redis://localhost:6379/1",
        result_backend="redis://localhost:6379/2",
        enable_utc=False,
        timezone="Asia/Kolkata",
        broker_connection_retry_on_startup=True
    ),
)
celery_app = celery_init_app(app)

CELERY_BEAT_SCHEDULE = {
    'daily-task': {
        'task': 'main.daily_task',  
        'schedule': crontab(minute=0, hour=17),
        # 'schedule': 10.0,
    },
    'monthly-task': {
        'task': 'main.monthly_task',
        'schedule': crontab(day_of_month='30', minute=0, hour=23),
    },
}
celery_app.conf.beat_schedule = CELERY_BEAT_SCHEDULE
# --------------------------------------------------------------------------------------------------


# @sse.before_request
# def check_access():
#     if request.args.get("channel")==user_name:
#         abort(403)



app.register_blueprint(sse,url_prefix='/stream')

#-------------------------------------------------------------------------------------------------------------------

from application.blocklist import BLOCKLIST
@jwt.token_in_blocklist_loader
def check_if_token_in_blocklist(jwt_header, jwt_payload):
    return (jwt_payload["jti"] in BLOCKLIST)

@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):
    return (
        {
        "message":"Token has been revoked"
        },
        401
    )

# --------------------------------------------------------------------------------------------------------------

from application.api import *
api.add_resource(UserAPI,"/api/user/<string:username>" , "/api/user" )
api.add_resource(VenueApi,"/api/venue/<int:ID>","/api/venue")
api.add_resource(VenueListApi,"/api/venue/all")
api.add_resource(ShowApi,'/api/show','/api/show/<int:ID>')
api.add_resource(ShowListApi,"/api/show/all")
api.add_resource(ShowByVID , '/api/venue/show/<int:VID>')
# api.add_resource(ShowsRatingsSeatsApi ,'/api/shows_ratings')
api.add_resource(ShowsRatingsSeatsApi_byUID , '/api/shows_ratings/uid/<int:UID>')
api.add_resource(ShowsRatingsSeatsApi_bySID , '/api/shows_ratings/sid/<int:SID>')
api.add_resource(VenueBySID , '/api/show/venue/<int:SID>')
api.add_resource(SearchApi , '/api/search')
api.add_resource(LoginApi , '/api/login')
api.add_resource(LogoutApi , '/api/logout')
api.add_resource(exportcsv,'/api/export-csv/<int:ID>')
api.add_resource(book,'/api/<string:username>/book/<int:SID>')
api.add_resource(rate,'/api/<string:username>/rate/<int:SID>')
@app.route("/")
def home():
    return render_template('base.html')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'),404


#--------------------------------------------------- TASKS ----------------------------------------------------
# use crontab here for bigger time frames

# @celery_app.task()
# def print_current_time_job():
    # print("Start")
    # now = datetime.datetime.now()
    # print("now in task=", now)
    # dt_string = now.strftime("%d/%m/%Y %H:%M:%S")
    # sse.publish({"message":"Current Time ="+dt_string},type='summary')
    # print("date and time =", dt_string)
    # print("COMPLETE")
#     sse.publish({"message":"Hello !"},type="summary")
#     return "world"

# @celery_app.task()
# def long_running_job():
#     print("STARTED LONG JOB")
#     now = datetime.datetime.now()
#     dt_string = now.strftime("%d/%m/%Y %H:%M:%S")
#     sse.publish({"message":"STARTED EMAIL JOB AT ="+dt_string} , type='summary')
    # mails / media / kuchh bhi
    # say mail bhejni hai 100 logo ko
    # for i in range(10):
    #     now = datetime.datetime.now()
    #     dt_string = now.strftime("%d/%m/%Y %H:%M:%S")
    #     sse.publish({"message":"SENDING MAIL TO ="+str(i)} , type='summary')
    #     sse.publish({"message":"SENDING MAIL AT ="+dt_string} , type='summary')
    #     time.sleep(2)
    # now = datetime.datetime.now()
    # dt_string = now.strftime("%d/%m/%Y %H:%M:%S")
    # sse.publish({"message":"COMPLETED AT ="+dt_string} , type='summary')
    # print("COMPLETED LONG JOB")

# @celery_app.on_after_finalize.connect
# def setup_periodic_tasks(sender, **kwargs):
#     sender.add_periodic_task(10.0, long_running_job.s(), name='at every 10 seconds')
@celery_app.task()
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
@celery_app.task()
def monthly_task():
    users = USERS.query.all()
    for user in users:
        user_show_rate_entries = UserShowRate.query.filter_by(users_id=user.ID).all()
        visited_shows = []
        rated_shows = []
        booked_shows = []
        for entry in user_show_rate_entries:
            show = SHOWS.query.get(entry.shows_id)
            entry=UserShowRate.query.filter_by(users_id=user.ID,shows_id=show.ID).first()
            booked_show_entry = {
                "show": show,
                "seats": entry.seats
            }
            booked_shows.append(booked_show_entry)
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
                    date=datetime.datetime.now(),
                    shows=user_show_rate_entries
                )
            pdf_path = f"static/pdfs/report_for_{user.username}.pdf"
            HTML(string=message).write_pdf(pdf_path)
            mails.send_email( user.email, subject='Welcome !',message=message,content="html",attachment_file=f"static/pdfs/report_for_{user.username}.pdf")
    
    print("Monthly task executed!")

#-------------------------------------------------TASK ROUTES----------------------------------------------------
 

@app.route("/task")
def hello():
    job = monthly_task.apply_async()
    res=job.wait()
    return str(res) , 200

@app.route("/task2")
def hello2():
    job = daily_task.apply_async()
    res=job.wait()
    return str(res) , 200

# @app.route("/updates",methods=["GET"])
# def updates():
#     return render_template("summary.html",error=None)

# @app.route("/test_msg",methods=["GET"])
# def test_msg():
#     sse.publish({"message":"Hello !"},type="summary")
#     return "Message sent to browser ! "

# @app.route("/alerts",methods=['GET'])
# def alerts():
#     return render_template("alerts.html",error=None)
#----------------------------------------------------WEBHOOKS--------------------------------------------------

# @app.route("/webhook_receiver/github" , methods=["POST"])
# def webhook_github():
    #get haaders
    # content=request.json
    #validate
    #call async job
    # if the job is going to take a  long time , task banao , phir call that task
    # print(content)
    # return "OK",200

#------------------------------------------------------MAIN------------------------------------------------------


if __name__ == "__main__":
    app.run(host='0.0.0.0',port=8080,debug = True)