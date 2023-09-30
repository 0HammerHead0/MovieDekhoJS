from flask import Flask,request
from flask import render_template
from main import app as app
from application.models import *
from flask_jwt_extended import *
# from application import tasks
from flask_sse import sse

print("in controller app", app)

@app.route("/webhook_receiver/github" , methods=["POST"])
def webhook_github():
    #get haaders
    content=request.json
    #validate
    #call async job
    # if the job is going to take a  long time , task banao , phir call that task
    print(content)
    return "OK",200