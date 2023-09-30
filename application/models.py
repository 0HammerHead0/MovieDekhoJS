from .database import db

USERS_SHOWS=db.Table('users_shows'
                    ,db.Column('users_id',db.Integer,db.ForeignKey('users.ID'),primary_key=True,nullable=False)
                    ,db.Column('shows_id',db.Integer,db.ForeignKey('shows.ID'),primary_key=True,nullable=False))
ROLES_USERS=db.Table('roles_users'
                    ,db.Column('user_id',db.Integer(),db.ForeignKey('users.ID'))
                    ,db.Column('role_id',db.Integer(),db.ForeignKey('role.ID')))
class SHOWS(db.Model):
    __tablename__='shows'
    ID=db.Column(db.Integer,autoincrement=True,primary_key=True,nullable=False)
    name=db.Column(db.String,nullable=False)
    rating=db.Column(db.Float,nullable=False,default=0)
    tags=db.Column(db.String)
    price=db.Column(db.Float,nullable=False)
    start_time=db.Column(db.Time,nullable=False)
    end_time=db.Column(db.Time,nullable=False)
    date=db.Column(db.String,nullable=False)
    VID=db.Column(db.Integer,db.ForeignKey('venues.ID'),nullable=False)
    rem_cap=db.Column(db.Integer,nullable=False)
    rated=db.Column(db.Integer,nullable=False)
    tot_cap=db.Column(db.Integer,nullable=False)
    img=db.Column(db.String,default='https://media.istockphoto.com/id/915697084/photo/concept-of-reserved-seats.jpg?b=1&s=170667a&w=0&k=20&c=TxTJtGan1OAnc_7LfKoUM_OyDiKzZQqyMCfSGM2M8UE=')
    user_rating=db.Column(db.Float,nullable=False,default=0)
class VENUES(db.Model):
    __tablename__='venues'
    ID=db.Column(db.Integer,primary_key=True,autoincrement=True,nullable=False)
    name=db.Column(db.String,nullable=False)
    place=db.Column(db.String)
    capacity=db.Column(db.Integer)
    shows=db.relationship('SHOWS',backref='venue')
class USERS(db.Model):
    __tablename__='users'
    ID=db.Column('ID',db.Integer,primary_key=True,autoincrement=True,nullable=False)
    name=db.Column(db.String,nullable=False)
    username=db.Column(db.String,unique=True,nullable=False)
    password=db.Column(db.String,nullable=False )
    email=db.Column(db.String)
    active=db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(64), unique=True)
    roles=db.relationship('ROLES',secondary=ROLES_USERS,backref=db.backref('users',lazy='subquery'))
    visits=db.relationship('SHOWS',backref='mob',secondary=USERS_SHOWS,lazy='subquery')
class ROLES(db.Model):
    __tablename__='role'
    ID=db.Column('ID',db.Integer(),primary_key=True)
    name=db.Column(db.String(80),unique=True)
    description=db.Column(db.String(255))

class UserShowRate(db.Model):
    __tablename__ = 'users_shows_rate'
    users_id = db.Column(db.Integer,  db.ForeignKey('users.ID'), nullable=False, primary_key=True)
    shows_id = db.Column(db.Integer, db.ForeignKey('shows.ID'), nullable=False, primary_key=True)
    rating = db.Column(db.Integer, nullable=False, default=0)
    seats=db.Column(db.Integer,nullable=False,default=0)
    amount=db.Column(db.Integer,nullable=False)