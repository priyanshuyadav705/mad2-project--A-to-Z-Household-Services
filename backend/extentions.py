from flask_sqlalchemy import SQLAlchemy
from flask_security import Security
from flask_caching import Cache

cache = Cache()
db = SQLAlchemy()
security = Security()