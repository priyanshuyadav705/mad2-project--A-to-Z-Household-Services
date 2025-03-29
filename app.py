from flask import Flask
from flask_cors import CORS
import os
import backend.views
import backend.models
from backend.extentions import db,security,cache
from flask_security import hash_password
from backend.celery_init import celery_init_app
from celery.schedules import crontab
from backend.tasks import monthly_report_customer,monthly_report_professional,daily_accepted_reminder,daily_closing_reminder,daily_pending_reminder

MYDB_NAME = "new_db"


def create_database(app):
   with app.app_context():
         db.create_all()
         admin = backend.models.User.query.filter_by(is_admin=True).first()
         if not admin:
           admin = backend.models.User(email='admin@gmail.com', password = hash_password('992660'), name = 'admin',is_admin = True, is_customer = False)    
           db.session.add(admin)
           db.session.commit()


def create_app():
   app = Flask(__name__, template_folder='frontend', static_folder='frontend', static_url_path='/static')
   CORS(app, supports_credentials=True)

   app.config['SECRET_KEY']= 'pyadav'
   app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{MYDB_NAME}'
   app.config['SECURITY_PASSWORD_SALT'] = 'salt-password'
   app.config['SECURITY_PASSWORD_HASH'] = 'bcrypt'
   app.secret_key = 'your-secret-key'
   app.config['SESSION_COOKIE_HTTPONLY'] = True
   app.config['SESSION_COOKIE_SECURE'] = False
   app.config['SESSION_PERMANENT'] = False 


   app.config['CELERY_BROKER_URL'] ='redis://localhost:6379/0'
   app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'

   app.config['CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP'] = True


   app.config['MAIL_SERVER'] = 'smtp.gmail.com'
   app.config['MAIL_PORT'] = 587
   app.config['MAIL_USE_TLS'] = True
   app.config['MAIL_USERNAME'] = 'your-email@gmail.com'
   app.config['MAIL_PASSWORD'] = 'your-email-password'

   app.config['CACHE_TYPE'] ='redis'
   app.config['CACHE_REDIS_URL'] = 'redis://localhost:6379/0'
   
   
   UPLOAD_FOLDER = 'uploads'
   app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
   if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
   


   SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authorization-Token'
   WTF_CSRF_ENABLED = False


   from backend.models import User,Professional,Service,ServiceRequest,Review,Customer
   from flask_security import SQLAlchemyUserDatastore

   user_datastore = SQLAlchemyUserDatastore(db, User, None)
   security.init_app(app, user_datastore, register_blueprint=False)

   db.init_app(app)
   cache.init_app(app)
   
   create_database(app)

   backend.views.create_view(app,user_datastore)
   app.app_context().push()

   return app

app = create_app()
celery = celery_init_app(app)
celery.autodiscover_tasks()

@celery.on_after_finalize.connect
def setup_periodic_task(sender, **kwargs):
    sender.add_periodic_task(
           crontab(minute = '*/2'),
           monthly_report_customer.s()
    )
    
    sender.add_periodic_task(
           crontab(minute = '*/2'),
           monthly_report_professional.s()

    )
    sender.add_periodic_task(
           crontab(minute = '*/2'),
           daily_pending_reminder.s()

    )
    sender.add_periodic_task(
           crontab(minute = '*/2'),
           daily_closing_reminder.s()

    )
    sender.add_periodic_task(
           crontab(minute = '*/2'),
           daily_accepted_reminder.s()

    )

if __name__ == "__main__":
    app = create_app()
    app.run(debug = True)