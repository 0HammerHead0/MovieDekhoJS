from flask import request
from functools import wraps
from flask_restful import Resource , fields, marshal_with , reqparse, Api
from application.database import db
from application.models import SHOWS,VENUES,USERS,USERS_SHOWS,UserShowRate, ROLES , ROLES_USERS
from application.validation import NotFoundError,BusinnessValidationError
from werkzeug.security import generate_password_hash , check_password_hash
from flask_jwt_extended import create_access_token , jwt_required , get_jwt , get_jwt_identity
from flask_cors import CORS , cross_origin
from jinja2 import Template
from application import data_access
from application import mails
from flask import g
import statistics
import datetime
import logging
import hashlib
import json
import time
import csv
from time import perf_counter_ns


user_field={
    "ID": fields.Integer,
    "username" : fields.String,
    "name":fields.String
}
venue_fields={
    "ID":fields.Integer,
    "name":fields.Raw(attribute=lambda venue: venue.name or None),
    "capacity": fields.Raw(attribute=lambda venue: venue.capacity or None),
    "place":fields.Raw(attribute=lambda venue: venue.place or None)
}
shows_ratings_seats_fields={
    "users_id":fields.Raw(attribute=lambda shows_ratings: shows_ratings.users_id or None),
    "shows_id":fields.Raw(attribute=lambda shows_ratings: shows_ratings.shows_id or None),
    "rating": fields.Raw(attribute=lambda shows_ratings: shows_ratings.rating or None),
    "seats":fields.Raw(attribute=lambda shows_ratings: shows_ratings.seats or None),
    "amount":fields.Raw(attribute=lambda shows_ratings: shows_ratings.amount or None)
}
show_fields = {
    'ID': fields.Integer,
    'name': fields.String,
    'rating': fields.Float,
    'tags': fields.String,
    'price': fields.Float,
    'start_time': fields.String,
    'end_time': fields.String,
    'date': fields.String,
    'VID': fields.Integer,
    'rem_cap': fields.Integer,
    'rated': fields.Integer,
    'tot_cap': fields.Integer,
    'img': fields.String,
    'user_rating': fields.Float
}
create_user_parser = reqparse.RequestParser()
create_user_parser.add_argument('username',type=str)
create_user_parser.add_argument('name',type=str)
create_user_parser.add_argument('password',type=str)
create_user_parser.add_argument('email',type=str)

venue_parse = reqparse.RequestParser()
venue_parse.add_argument("name",type=str)
venue_parse.add_argument("place",type=str)
venue_parse.add_argument("capacity",type=str)

show_parse = reqparse.RequestParser()
show_parse.add_argument('name', type=str)
show_parse.add_argument('rating', type=float)
show_parse.add_argument('tags', type=str)
show_parse.add_argument('price', type=float)
show_parse.add_argument('start_time' , type= str)
show_parse.add_argument('end_time', type=str)
show_parse.add_argument('date', type=str)
show_parse.add_argument('VID', type=int)
show_parse.add_argument('rem_cap', type=int)
show_parse.add_argument('rated', type=int)
show_parse.add_argument('tot_cap', type=int)
show_parse.add_argument('img', type=str)
show_parse.add_argument('user_rating', type=float)

shows_ratings_seats_parse=reqparse.RequestParser()
shows_ratings_seats_parse.add_argument("users_id",type=int)
shows_ratings_seats_parse.add_argument("shows_id",type=int)
shows_ratings_seats_parse.add_argument("rating",type=int) 
shows_ratings_seats_parse.add_argument("seats",type=int)
shows_ratings_seats_parse.add_argument("amount",type=float)

search_parse = reqparse.RequestParser()
search_parse.add_argument('venueID', type=int, required=True)
search_parse.add_argument('start_time', type=str)
search_parse.add_argument('end_time', type=str)
search_parse.add_argument('rating', type=float)
search_parse.add_argument('tag_name', type=str)

login= reqparse.RequestParser()
login.add_argument('username',type=str)
login.add_argument('password',type=str)

from application.blocklist import BLOCKLIST
from flask_jwt_extended import jwt_required, get_jwt_identity

def user_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user_name = get_jwt_identity()
        requested_username = kwargs.get("username")  # Change this to the parameter name in your routes
        logging.info("username got -> ",requested_username)
        if requested_username == current_user_name:
            return fn(*args, **kwargs)
        else:
            return "Unauthorized", 403
    return wrapper
def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_role = get_jwt()["role"]  # Get the 'role' claim from the JWT token

        if user_role == "admin":
            return fn(*args, **kwargs)
        else:
            return "Unauthorized", 403 
    return wrapper
class LoginApi(Resource):
    def post(self):
        start = perf_counter_ns()
        args = login.parse_args()
        username = args.get('username', None)
        password = hashlib.sha256(args.get('password', None).encode('utf-8')).hexdigest()
        if username is None:
            raise BusinnessValidationError(status_code=400, error_code="BE1001", error_message="username is required")
        if password is None:
            raise BusinnessValidationError(status_code=400, error_code="BE1002", error_message="password is required")
        user = db.session.query(USERS).filter(USERS.username == username).first()
        if user is None:
            raise BusinnessValidationError(status_code=400, error_code="BE1003", error_message="Invalid username")
        if not password==user.password:
            raise BusinnessValidationError(status_code=400, error_code="BE1004", error_message="Invalid password")
        roles = [role.name for role in user.roles][0]
        access_token = create_access_token(identity=user.username , additional_claims={"role": roles})
        stop = perf_counter_ns()
        print("---------------------------------------------------------------------------------")
        print("TIME TAKEN ", stop-start )
        print("---------------------------------------------------------------------------------")
        with open("templates/login.html") as file_:
            template=Template(file_.read())
            message=template.render(data=user)
        mails.send_email( user.email , subject='Welcome !',message=message,content="html",attachment_file="static/images/thankyou.png")
        return {"access_token": access_token, "role": roles}
    
class LogoutApi(Resource):
    @jwt_required()
    def post(self):
        jti = get_jwt()['jti']
        BLOCKLIST.add(jti)
        return {"message": "Successfully logged out"}, 200
class UserAPI(Resource):
    @jwt_required()
    @user_required
    @marshal_with(user_field)
    def get(self,username):
        user = db.session.query(USERS).filter(USERS.username==username).first()
        if user:
            return user
        else:
            raise NotFoundError(status_code=404)
    def post(self):
        args=create_user_parser.parse_args()
        username=args.get("username",None)
        name=args.get("name",None)
        password = hashlib.sha256(args.get('password', None).encode('utf-8')).hexdigest()
        email=args.get("email")
        user_username=db.session.query(USERS).filter((USERS.username==username)).first()
        if user_username:
            raise BusinnessValidationError(status_code=400,error_code="BE1003",error_message="Duplicate Username")
        user_email=db.session.query(USERS).filter((USERS.email==email)).first()
        if user_email:
            raise BusinnessValidationError(status_code=400,error_code="BE1003",error_message="Duplicate EmailAddress")
        new_user=USERS(username=username,name=name,password=password,email=email)
        db.session.add(new_user)
        user = USERS.query.filter_by(username=username).first()
        new_user_role = ROLES_USERS.insert().values(user_id=user.ID, role_id=1)
        db.session.execute(new_user_role)
        db.session.commit()
        return "",201
    
class VenueListApi(Resource):
    @jwt_required()
    @marshal_with(venue_fields)
    def get(self):
        venues = data_access.get_all_venues()
        return venues
class ShowListApi(Resource):
    @jwt_required()
    @marshal_with(show_fields)
    def get(self):
        shows = data_access.get_all_shows()
        return shows
class VenueApi(Resource):
    @jwt_required()
    @marshal_with(venue_fields)
    def get(self,ID):
        venue=VENUES.query.filter(VENUES.ID==ID).first()
        print(venue)
        if venue:
            return venue
        else:
            raise NotFoundError(status_code=404)
    @jwt_required()
    @admin_required
    @marshal_with(venue_fields)
    def put(self, ID):
        venue = VENUES.query.filter(VENUES.ID == ID).first()
        if venue is None:
            raise NotFoundError(status_code=404)
        args = venue_parse.parse_args()
        name = args.get("name", None)
        place=args.get("place",None)
        capacity=args.get("capacity",None)
        if name is not None:
            venue.name = name
        if place is not None:
            venue.place=place
        if capacity is not None:
            venue.capacity=capacity
        db.session.add(venue)
        db.session.commit()
        return venue
    @jwt_required()
    @admin_required
    def post(self):
        args=venue_parse.parse_args()
        name=args.get("name",None)
        place=args.get("place")
        capacity=args.get("capacity")
        if name is None:
            raise BusinnessValidationError(status_code=400,error_code="BE1002",error_message="name is required")
        new_venue=VENUES(name=name,place=place,capacity=capacity)
        db.session.add(new_venue)
        db.session.commit()
        print(name,place,capacity)
        return "",201
    @jwt_required()
    @admin_required
    def delete(self,ID):
        venue = VENUES.query.filter(VENUES.ID==ID).first()
        if not venue:
            raise NotFoundError(status_code=404)
        shows=venue.shows
        for show in shows:
            UserShowRate.query.filter_by(shows_id=show.ID).delete()
            db.session.delete(show)
        db.session.delete(venue)
        db.session.commit()
        return "", 200

class ShowApi(Resource):
    @jwt_required()
    @marshal_with(show_fields)
    def get(self,ID):
        show=data_access.get_show_by_ID(ID)
        if show:
            return show
        else:
            raise NotFoundError(status_code=404)
    @jwt_required()
    @admin_required
    @marshal_with(show_fields)
    def put(self, ID):
        show = SHOWS.query.filter(SHOWS.ID==ID).first()
        if show is None:
            raise NotFoundError(status_code=404)
        args = show_parse.parse_args()
        name = args.get("name", None)
        rating=args.get("rating",None)
        tags=args.get("tags",None)
        price=args.get('price',None)
        start_time = args.get('start_time',None)
        end_time=args.get('end_time',None)
        date=args.get('date',None)
        rem_cap=args.get('rem_cap',None)
        rated=args.get('rated',None)
        tot_cap=args.get('tot_cap',None)
        img=args.get('img',None)
        user_rating=args.get('user_rating',None)
        updated=False
        if name!=None:
            show.name = name
            updated = True
        if rating!=None:
            if(rating>5 or rating<0):
                raise BusinnessValidationError(status_code=400,error_code="BE1003",error_message="Rating should be between 0 and 5")
            show.rating=rating
            updated = True
        if tags!=None:
            show.tags=tags
            updated = True
        if price!=None:
            show.price=price
            updated = True
        if start_time is not None:
            start_time_obj = datetime.datetime.strptime(start_time, '%H:%M')
            show.start_time = start_time_obj.time()
            updated = True
        if end_time is not None:
            end_time_obj = datetime.datetime.strptime(end_time, '%H:%M')
            show.end_time = end_time_obj.time()
            updated = True
        if date!=None:
            show.date=date
            updated = True
        if rem_cap!=None:
            if(rem_cap<0):
                raise BusinnessValidationError(status_code=400,error_code="BE1003",error_message="Remaining Capacity should be greater than 0")
            show.rem_cap=rem_cap
            updated = True
        if rated!=None:
            show.rated=rated
            updated = True
        if tot_cap!=None:
            show.tot_cap=tot_cap
            updated = True
        if img!=None:
            show.img=img
            updated = True
        if user_rating!=None:
            show.user_rating=user_rating
            updated = True
        if(not updated):
            raise NotFoundError(status_code=400)
        else:
            db.session.add(show)
            db.session.commit()
            return show
    @jwt_required()
    @admin_required
    def post(self):
        args=show_parse.parse_args()
        name=args.get("name",None)
        rating=args.get("rating",None)
        tags=args.get('tags',None)
        price=args.get('price',None)
        start_time= args.get('start_time',None)
        end_time=args.get('end_time',None)
        date=args.get('date',None)
        VID=args.get('VID',None)
        rem_cap=args.get('rem_cap',None)
        rated=args.get('rated',0)
        tot_cap=args.get('tot_cap',None)
        img=args.get('img',None)
        user_rating=args.get('user_rating',0)
        if name is None:
            name="No Name"
        if rating==None:
            rating=0
        else:
            rating=float(rating)
        if start_time==None:
            start_time="00:00:00"
        else:
            start_time+=":00"
        if end_time==None:
            end_time="00:00:00"
        else:
            end_time+=":00"
        start_time=datetime.datetime.strptime(str(start_time),'%H:%M:%S').time()
        end_time=datetime.datetime.strptime(str(end_time),'%H:%M:%S').time()
        if date==None :
            date=str(datetime.datetime.now().date())
        if price==None:
            price=0
        else:
            price=float(price)
        if rem_cap==None:
            rem_cap=0
        else:
            rem_cap=int(rem_cap)
        if img==None:
            img="https://media.istockphoto.com/id/915697084/photo/concept-of-reserved-seats.jpg?b=1&s=170667a&w=0&k=20&c=TxTJtGan1OAnc_7LfKoUM_OyDiKzZQqyMCfSGM2M8UE="
        db.session.add(SHOWS(name=name,rating=rating,tags=tags,price=price,start_time=start_time,end_time=end_time,VID=VID,rem_cap=rem_cap,rated=1,img=img,tot_cap=rem_cap,date=date))
        db.session.commit()
        return "",201
    @jwt_required()
    @admin_required
    def delete(self,ID):
        show=SHOWS.query.filter_by(ID=ID).first()
        UserShowRate.query.filter_by(shows_id=ID).delete()
        db.session.delete(show)
        db.session.commit()
        return "", 200
class ShowByVID(Resource):
    @jwt_required()
    @marshal_with(show_fields)
    def get(self,VID):
        shows = SHOWS.query.filter_by(VID=VID).all()
        if shows:
            return shows
        else:
            raise NotFoundError(status_code=404)

class ShowsRatingsSeatsApi_bySID(Resource):
    @jwt_required()
    @marshal_with(shows_ratings_seats_fields)
    def get(self, SID):
        user_show_rate_entry = UserShowRate.query.filter_by(shows_id=SID).all()
        logging.debug(f"Value of my_variable: {len(user_show_rate_entry)}")
        if user_show_rate_entry:
            return user_show_rate_entry
        else:
            raise NotFoundError(status_code=404)
    # @jwt_required()
    # @marshal_with(shows_ratings_seats_fields)
    # def put(self,SID):
    #     args = shows_ratings_seats_parse.parse_args()
    #     users_id=args.get("users_id",None)
    #     shows_id=args.get("shows_id",None)
    #     rating=args.get("rating",None)
    #     seats=args.get("seats",None)
    #     amount=args.get("amount",None)
    #     user_show_rate_entry = UserShowRate.query.filter_by(users_id=users_id, shows_id=shows_id).first()
    #     if(user_show_rate_entry is None):
    #         raise NotFoundError(status_code=404)
    #     if(user_show_rate_entry.rating)!=None:
    #         user_show_rate_entry.rating=rating
    #     if(user_show_rate_entry.seats)!=None:
    #         user_show_rate_entry.seats=seats
    #     if(user_show_rate_entry.amount)!=None:
    #         user_show_rate_entry.amount=amount
    #     db.session.add(user_show_rate_entry)
    #     db.session.commit()
    #     return user_show_rate_entry
        
class ShowsRatingsSeatsApi_byUID(Resource):
    @jwt_required()
    @marshal_with(shows_ratings_seats_fields)
    def get(self, UID):
        user_show_rate_entry = UserShowRate.query.filter_by(users_id=UID).all()
        logging.debug(f"Value of my_variable: {len(user_show_rate_entry)}")
        if user_show_rate_entry:
            return user_show_rate_entry
        else:
            raise NotFoundError(status_code=404)
    # @jwt_required()
    # @marshal_with(shows_ratings_seats_fields)
    # def put(self,UID):
    #     args = shows_ratings_seats_parse.parse_args()
    #     users_id=args.get("users_id",None)
    #     shows_id=args.get("shows_id",None)
    #     rating=args.get("rating",None)
    #     seats=args.get("seats",None)
    #     amount=args.get("amount",None)
    #     user_show_rate_entry = UserShowRate.query.filter_by(users_id=users_id, shows_id=shows_id).first()
    #     if(user_show_rate_entry is None):
    #         raise NotFoundError(status_code=404)
    #     if(user_show_rate_entry.rating)!=None:
    #         user_show_rate_entry.rating=rating
    #     if(user_show_rate_entry.seats)!=None:
    #         user_show_rate_entry.seats=seats
    #     if(user_show_rate_entry.amount)!=None:
    #         user_show_rate_entry.amount=amount
    #     db.session.add(user_show_rate_entry)
    #     db.session.commit()
    #     return user_show_rate_entry

class VenueBySID(Resource):
    @jwt_required()
    @marshal_with(venue_fields)
    def get(self,SID):
        show = SHOWS.query.filter_by(ID=SID).first()
        if show:
            return show.venue
        else:
            raise NotFoundError(status_code=404)
        
class SearchApi(Resource):
    @jwt_required()
    @marshal_with(show_fields)
    def get(self):
        venueID = request.args.get('venueID')
        start_time = request.args.get('start_time')
        end_time = request.args.get('end_time')
        tag_name = request.args.get('tag_name')
        rating = int(request.args.get('rating').strip())
        print("venueID",venueID,"start_time",start_time,"end_time",end_time,"rating",rating,"tag_name",tag_name)
        print(type(rating))
        if venueID==None or venueID=="0":
            shows=SHOWS.query.all()
        else:
            shows = SHOWS.query.filter(SHOWS.VID == venueID).all()
        print(shows)
        if tag_name:
            shows = [show for show in shows if str(tag_name).lower() in str(show.name).lower() or str(tag_name).lower() in str(show.tags).lower()]
            print("tagname", shows)

        if rating != 0:
            shows = [show for show in shows if float(rating) <= show.rating or float(rating) <= show.user_rating]
            print("rating", shows)

        if start_time:
            target_start_time = datetime.datetime.strptime(start_time, '%H:%M').time()
            shows = [show for show in shows if datetime.datetime.strptime(str(show.start_time), '%H:%M:%S').time() >= target_start_time]
            print("starttime:", shows)

        if end_time:
            target_end_time = datetime.datetime.strptime(end_time, '%H:%M').time()
            shows = [show for show in shows if datetime.datetime.strptime(str(show.end_time), '%H:%M:%S').time() <= target_end_time]
            print("endtime", shows)

        return shows
    
# class ShowsRatingsSeatsApi(Resource):
#     @jwt_required()
#     @marshal_with(shows_ratings_seats_fields)
#     def post(self):
#         args = shows_ratings_seats_parse.parse_args()
#         users_id=args.get("users_id",None)
#         shows_id=args.get("shows_id",None)
#         rating=args.get("rating",None)
#         seats=args.get("seats",None)
#         amount=args.get("amount",None)
#         user_show_rate_entry = UserShowRate.query.filter_by(users_id=users_id, shows_id=shows_id).first()
#         if(user_show_rate_entry is None):
#             user_show_rate_entry = UserShowRate(users_id=users_id, shows_id=shows_id, rating=rating, seats=seats, amount=amount)
#             db.session.add(user_show_rate_entry)
#             db.session.commit()
#             return user_show_rate_entry
#         else:
#             raise NotFoundError(status_code=409, message="User has already rated this show")
class exportcsv(Resource):
    @jwt_required()
    @admin_required
    def post(self,ID):
        user=USERS.query.filter(USERS.username=='admin').first()
        venue = VENUES.query.filter(VENUES.ID == ID).first()
        shows=venue.shows
        csv_data=[]
        csv_data.append(['','','Venue Summary'])
        csv_data.append(['Name:',venue.name])
        csv_data.append(['Place:',venue.place])
        csv_data.append(['Capacity:',venue.capacity])
        tot_amount=0
        for show in shows:
            tot_amount+=show.price*(show.tot_cap-show.rem_cap)
        for show in shows:
            csv_data.append(['Show Data','ID',show.ID])
            csv_data.append(['','Name',show.name])
            csv_data.append(['','admin rating',show.rating])
            csv_data.append(['','Tags',show.tags])
            csv_data.append(['','Price',show.price])
            csv_data.append(['','Date',show.date])
            csv_data.append(['','Date',str(show.start_time)[0:5]+" to " + str(show.end_time)[0:5]])
            csv_data.append(['','Booked',(show.tot_cap-show.rem_cap)])
            csv_data.append(['','User rating',show.user_rating])
        csv_data.append(['Total Revenue','->',tot_amount])
        csv_file_path = f"static/csv/venue_{ID}_shows.csv"
        with open(csv_file_path, mode='w') as csv_file:
            csv_writer = csv.writer(csv_file)
            csv_writer.writerows(csv_data)
        with open("templates/CSV.html") as file_:
            template = Template(file_.read())
            message = template.render(
                date=datetime.datetime.now(),
                venue=venue,
                user=user
            )
        mails.send_email(user.email, subject='Venue Report', message=message,content="html",attachment_file=f"static/csv/venue_{ID}_shows.csv")

class book(Resource):
    @jwt_required()
    @marshal_with(shows_ratings_seats_fields)
    def post(self,username,SID):
        args = shows_ratings_seats_parse.parse_args()
        UID = args.get("users_id", None)
        SID=args.get("shows_id",None)
        rating=args.get("rating",None)
        seats=args.get("seats",None)
        amount=args.get("amount",None)
        show_user=UserShowRate.query.filter_by(shows_id=SID, users_id=UID).first()
        show=SHOWS.query.filter_by(ID=SID).first()
        if(show.rem_cap<seats):
            raise BusinnessValidationError(status_code=400,error_code="BE1003",error_message="Not enough seats available")
        if(show_user):
            show_user.seats+=seats
            show_user.amount+=amount
        else:
            show_user = UserShowRate(
                users_id=UID,
                shows_id=SID,
                rating=0,
                seats=seats,
                amount=amount
            )
            db.session.add(show_user)
        show.rem_cap-=seats
        db.session.add(show)
        db.session.commit()
        return show_user
    
class rate(Resource):
    @jwt_required()
    @marshal_with(shows_ratings_seats_fields)
    def post(self,username,SID):
        args = shows_ratings_seats_parse.parse_args()
        UID = args.get("users_id", None)
        SID=args.get("shows_id",None)
        rating=args.get("rating",None)
        show_user=UserShowRate.query.filter_by(shows_id=SID, users_id=UID).first()
        show_user.rating=rating
        show=SHOWS.query.filter_by(ID=SID).first()
        shows = UserShowRate.query.filter_by(shows_id=SID).all()
        show.user_rating=statistics.mean([int(i.rating) for i in shows])
        db.session.add(show_user)
        db.session.add(show)
        db.session.commit()
        return show_user