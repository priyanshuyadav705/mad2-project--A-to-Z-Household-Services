from backend.extentions import db, security
from flask_security import UserMixin,RoleMixin
from datetime import datetime , timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()


class User(db.Model, UserMixin):
     __tablename__ = 'user'
     user_id = db.Column(db.Integer, primary_key = True)
     email = db.Column(db.String(150), unique= True)
     password = db.Column(db.String(150))
     name = db.Column(db.String(150))
     address = db.Column(db.String(500))
     location = db.Column(db.String(50))
     pincode = db.Column(db.String(20))
     contact_number = db.Column(db.String(10))
     created_at = db.Column(db.DateTime, default=datetime.utcnow)
     fs_uniquifier = db.Column(db.String(64))
     active = db.Column(db.Boolean, default=True)
     is_admin = db.Column(db.Boolean, default=False)
     is_customer = db.Column(db.Boolean, default=True)
     customer_details = db.relationship('Customer', backref='user_details', uselist = False, overlaps = 'customer_info')


class Customer(db.Model):
     __tablename__ = 'customer'
     customer_id = db.Column(db.Integer,primary_key=True)
     user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable = False)
     name = db.Column(db.String(150))
     contact_number = db.Column(db.String(10))
     address = db.Column(db.String(500))
     created_at = db.Column(db.DateTime, default=datetime.utcnow)
     location = db.Column(db.String(50))
     pincode = db.Column(db.String(20))
     action = db.Column(db.String(50), nullable = True ,default='None')
     user = db.relationship('User', backref='customer_info',lazy = True)
     service_requests = db.relationship('ServiceRequest', backref= 'customers', lazy = True)

     def to_dict(self):
          return{
          "id" : self.customer_id,
          "name" : self.name,
          "contact_number" : self.contact_number,
          "address" : self.address,
          "location" : self.location,
          "action" : self.action,
          "created_at" : self.created_at.strftime("%Y-%m-%d")
          }

professional_service = db.Table('professional_service',
           db.Column('professional_id', db.Integer, db.ForeignKey('professional.professional_id'), primary_key = True),
           db.Column('service_id', db.Integer, db.ForeignKey('service.service_id'),primary_key = True)
           )

class Professional(db.Model):
     __tablename__ = 'professional'
     professional_id = db.Column(db.Integer, primary_key = True)
     email = db.Column(db.String(150), unique= True)
     password = db.Column(db.String(150))
     name = db.Column(db.String(100), nullable = False)
     address = db.Column(db.String(150))
     file = db.Column(db.String(300))
     pincode = db.Column(db.String(50))
     is_approved = db.Column(db.Boolean, default=False)
     action = db.Column(db.String(50), nullable = True ,default='None')
     experience = db.Column(db.Integer)
     phonenumber = db.Column(db.String(50))
     service_description = db.Column(db.String(150))


     services = db.relationship('Service', secondary=professional_service, backref = 'professional', lazy='joined',cascade = 'all,delete,delete')
     def __init__(self, email, password, name, service_description, experience, address, pincode, phonenumber, file):
        self.email = email
        self.password = password 
        self.name = name
        self.service_description = service_description
        self.experience = experience
        self.address = address
        self.pincode = pincode
        self.phonenumber = phonenumber
        self.file = file
     

     def to_dict(self):
         return{
          "id" : self.professional_id,
          "email":self.email,
          "name":self.name,
          "service_description": self.service_description,
          "experience": self.experience,
          "address":self.address,
          "pincode": self.pincode,
          "phonenumber":self.phonenumber,
          "file": self.file,
          "action":self.action,
          "services": [service.to_dict() for service in self.services]
         }

class Service(db.Model):
     __tablename__ = 'service'
     service_id = db.Column(db.Integer, primary_key = True)
     description = db.Column(db.String(150))
     service_name = db.Column(db.String(54), nullable=False)
     base_price = db.Column(db.Float)
     created_at = db.Column(db.DateTime, default = datetime.utcnow)
     updated_at = db.Column(db.DateTime, onupdate = datetime.utcnow)
     
     professionals = db.relationship('Professional', secondary = professional_service , backref='service',  lazy = 'joined', cascade = 'all,delete',overlaps = 'services')
     service_requests = db.relationship('ServiceRequest', backref = 'services', lazy = True, cascade = 'all, delete-orphan')

     def to_dict(self):
         return{
          "id" : self.service_id,
          "name": self.service_name,
          "description": self.description,
          "base_price": self.base_price,
         }

class ServiceRequest(db.Model):
      __tablename__ = 'service_request'
      id = db.Column(db.Integer, primary_key = True)
      service_id = db.Column(db.Integer,db.ForeignKey('service.service_id'), nullable = False)
      customer_id = db.Column(db.Integer,db.ForeignKey('customer.customer_id'), nullable = False)
      professional_id = db.Column(db.Integer,db.ForeignKey('professional.professional_id'), nullable = False)
      date_of_request = db.Column(db.Date,default= datetime.utcnow().date)
      date_of_completion = db.Column(db.DateTime,nullable = True)
      service_status = db.Column(db.String(50))

      professional = db.relationship('Professional', backref = 'service_requests', lazy = True)
      review = db.relationship('Review',uselist=False,backref = 'service_request',lazy='joined',cascade = 'all, delete-orphan')
      
      def to_dict(self):
          return{
               "id":self.id,
               "date_of_request":self.date_of_request.strftime("%Y-%m-%d"),
               "service_status": self.service_status,
               "professional": self.professional.to_dict() if self.professional else None
          }

class Review(db.Model):
      __tablename__ = 'review'
      id = db.Column(db.Integer, primary_key =True )  
      service_request_id = db.Column(db.Integer,db.ForeignKey('service_request.id'))
      customer_id = db.Column(db.Integer,db.ForeignKey('customer.customer_id'), nullable = False)
      rating = db.Column(db.Integer, nullable = False)
      remarks = db.Column(db.String(255),nullable = True)
      comments = db.Column(db.String(250))
