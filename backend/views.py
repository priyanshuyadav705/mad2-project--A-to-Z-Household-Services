from flask import render_template_string,render_template, session
from flask_security import auth_required,verify_password,hash_password
from backend.models import db,Service,Professional,User,Customer,ServiceRequest,Review
from flask import current_app as app,jsonify,request,send_from_directory
from functools import wraps
from sqlalchemy import or_, cast,String, Date,Function as func
from werkzeug.security import generate_password_hash,check_password_hash
import os
from celery.result import AsyncResult
from werkzeug.utils import secure_filename
from datetime import datetime
from .tasks import csv_report
from .extentions import cache
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import threading
from collections import Counter



def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            return jsonify({"message": 'You are not authorized to view this page.'}), 403
        return f(*args, **kwargs)
    return decorated_function

def customer_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"message": 'You are not authorized to view this page.'}), 403
        return f(*args, **kwargs)
    return decorated_function

def professional_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'professional_id' not in session:
            return jsonify({"message": 'You are not authorized to view this page.'}), 403
        return f(*args, **kwargs)
    return decorated_function
    
 

def create_view(app,user_datastore):
    @app.route('/')
    @app.route('/<path:path>')

    def home(path=""):
        return render_template('index.html')


#SERVICES,PROFESSIONAL,SERVICEREQUESTS API

    @app.route('/api/services',methods={'GET'})
    def get_services():
        services = Service.query.all()
        service_list = [{
         "id":service.service_id,
         "service_name": service.service_name,
         "base_price": service.base_price,
         "created_at": service.created_at.strftime("%Y-%m-%d"),
         "professionals":[
            {
                "id": p.professional_id,
                "name": p.name,
                "service_description": p.service_description,
                "avg_rating": sum([r.review.rating for r in p.service_requests if r.review]) 
                if len([r.review for r in p.service_requests if r.review]) > 0
                else None
            }
            for p in service.professionals
         ]
        }
        for service in services
        ]
        return jsonify({"services":service_list}),200
        

    @app.route('/api/professionals',methods=['GET'])
    def get_professionals():
        professionals = [professional.to_dict() for professional in Professional.query.all()]
        return jsonify({"professionals":professionals})
        

    @app.route('/api/servicerequests',methods=['GET'])
    def get_service_requests():
        service_requests = [service_request.to_dict() for service_request in ServiceRequest.query.all()]
        return jsonify({"service_requests":service_requests})
        
    @app.route('/api/customers',methods=['GET'])
    def get_customers():
        customers = [customer.to_dict() for customer in Customer.query.all()]
        return jsonify({"customers":customers})



#Admin API
    
    @app.route('/api/adminlogin', methods=['POST'])
    def admin_login():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = user_datastore.find_user(email=email)
        if user and verify_password(password, user.password):
            if user.is_admin:
               session['admin_id'] = user.user_id
               return jsonify({"message": "Login successful"})
            else:
                return jsonify({"message": "You are not authorized to view this page."}), 403
        else:
            return jsonify({"message": "Invalid email or password"}), 401
    
   
    @app.route('/api/admin/search', methods=['GET'])
    @admin_required
    def search():
        parameter = request.args.get('type')
        search = request.args.get('search','').strip()

        if not parameter or not search:
            return jsonify({"message": 'Search parameter or query is missing'}),400
            
        valid = ['service','professional','service_request','customer']
        if parameter not in valid:
            return jsonify({"error": 'Invalid search parameter'}),400
        
        results = {}

        if parameter == 'service':
            results['services'] = [
                service.to_dict() for service in Service.query.filter(
                    or_(
                        Service.service_id.contains(search),
                        Service.service_name.contains(search),
                        cast(Service.base_price,String).contains(search)
                    )
                ).all()
            ]
        elif parameter == 'professional':
            results['professionals']= [
                professional.to_dict() for professional in Professional.query.join(Professional.services).filter(
                    or_(
                        Professional.professional_id.contains(search),
                        Professional.name.contains(search),
                        cast(Professional.experience, String).contains(search),
                        Service.service_name.contains(search),
                        Professional.action.contains(search)
                    )
                ).all()
            ]
        elif parameter == 'service_request':
            results['service_requests'] = [
                service_request.to_dict() for service_request in ServiceRequest.query.join(Professional).filter(
                    or_(
                        ServiceRequest.id.contains(search),
                        Professional.name.contains(search),
                        ServiceRequest.date_of_request.contains(search),
                        ServiceRequest.service_status.contains(search)
                    )
                ).all()
            ]
        elif parameter == 'customer':
            results['customers'] = [
                customer.to_dict() for customer in Customer.query.outerjoin(ServiceRequest).filter(
                    or_(
                        Customer.customer_id.contains(search),
                        Customer.name.contains(search),
                        Customer.contact_number.contains(search),
                        Customer.address.contains(search),
                        ServiceRequest.service_status.contains(search)
                    )
                ).all()
            ]
        else:
            return jsonify({"error": 'Invalid search parameter'}), 400
    
        return jsonify(results)

    @app.route('/api/admin/services', methods=['POST'])
    @admin_required
    def admin_add_service():
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')
        base_price = data.get('base_price')
        if not name or not description or not base_price:
            return jsonify({"error":'All fields are required'}), 400

        if Service.query.filter_by(service_name=name).first():
            return jsonify({"error":'Service already exists'}),409
    
        new_service = Service(service_name = name, description = description, base_price = base_price)
        db.session.add(new_service)
        db.session.commit()
        return jsonify({"message":'Service added succesfully.','service': new_service.to_dict()}),201

    
    @app.route('/api/admin/servicedetails/<int:service_id>',methods=['GET'])
    @admin_required
    def admin_service(service_id):
        service = Service.query.get(service_id)
        if service:
            service_details = {
            "id":service.service_id,
            "service_name": service.service_name,
            "base_price": service.base_price,
            "service_description": service.description,
            "created_at": service.created_at.strftime("%Y-%m-%d"),
            "professionals":[
               {
                "id": p.professional_id,
                "name": p.name,
                "service_description": p.service_description
               }
               for p in service.professionals
            ],
        }
            return jsonify({"services":service_details}),200
        else:
             return jsonify({"error":"service not found"}),404
    
    @app.route('/uploads/<filename>')
    def download_files(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'],filename)


   
    @app.route('/api/admin/professionaldetails/<int:professional_id>',methods=['GET'])
    @admin_required
    def admin_professional(professional_id):
        professional = Professional.query.get(professional_id)
        if professional:
            pdf_url = f"http://127.0.0.1:5000/uploads/{professional.file.split('/')[-1]}" if professional.file else None
            service_names = [service.service_name for service in professional.services]
            service_requests = ServiceRequest.query.filter_by(professional_id = professional.professional_id)
            ratings = [review.rating for service_request in service_requests if service_request.review for review in [service_request.review]]
            if ratings:
                avg_rating = sum(ratings)/len(ratings)
            else:
                avg_rating = None
            professional_details = {
            "id": professional.professional_id,
            "name": professional.name,
            "experience": professional.experience,
            "service_description": professional.service_description,
            "pdf": pdf_url,
            "service_name": service_names,
            "action" : professional.action,
            "rating" : avg_rating
            }
            return jsonify({"professional":professional_details}),200
        else:
             return jsonify({"error":"Professional not found"}),404

    @app.route('/api/admin/customerdetails/<int:customer_id>',methods=['GET'])
    @admin_required
    def admin_customer(customer_id):
        customer = Customer.query.get(customer_id)
        total_requests = ServiceRequest.query.filter_by(customer_id = customer.customer_id).count()

        if customer:
            customer_details = {
            "id": customer.customer_id,
            "name": customer.name,
            "location": customer.location,
            "pincode": customer.pincode,
            "created_at": customer.created_at.strftime("%Y-%m-%d"),
            "contact": customer.contact_number,
            "total_requests" : total_requests
            }
            return jsonify({"customer":customer_details}),200
        else:
             return jsonify({"error":"Customer not found"}),404


    @app.route('/api/admin/services/<int:service_id>',methods=['PUT'])
    @admin_required
    def admin_edit_service(service_id):
        service = Service.query.get(service_id)
        if not service:
            return jsonify({"error":'Service not found'}), 404
        data = request.get_json()
        service_name = data.get('name')
        description = data.get('description')
        base_price = data.get('base_price')
        if not service_name or not base_price:
            return jsonify({"error":'Service name  and Base price are required'}), 400

        service.service_name = service_name
        service.base_price = base_price
        service.description = description
        db.session.commit()
        return  jsonify({"message":'Service updated succefully','service':service.to_dict()}), 200

    @app.route('/api/admin/service/<int:service_id>', methods = ['DELETE'])
    @admin_required
    def admin_delete_service(service_id):
        service = Service.query.get(service_id)
        if not service:
            return jsonify({"error":"Service not found"}),404

        service.professionals.clear()
      
        for request in service.service_requests:
            if request.review:
                db.session.delete(request.review)
            db.session.delete(request)
        db.session.delete(service)
        db.session.commit()
        return jsonify({"message":"Service deleted succesfully"}),200

    @app.route('/api/admin/professionals/<int:professional_id>/approve',methods = ['POST'])
    @admin_required
    def admin_professional_approve(professional_id):
        professional = Professional.query.get(professional_id)
        if not professional:
            return jsonify({"error":'Professional not found'}),404
        professional.is_approved = True
        professional.action = 'Approved'
        db.session.commit()
        return jsonify({"message":'Professional approved succesfully','professional':professional.to_dict()}),200

    @app.route('/api/admin/professionals/<int:professional_id>/reject', methods=['POST'])
    @admin_required
    def admin_professional_reject(professional_id):
        professional = Professional.query.get(professional_id)
        if not professional:
           return jsonify({"error":'Professional not found'})
        return jsonify({"message":'Professional rejected successfully','professional': professional.to_dict()}),200

    @app.route('/api/admin/professionals/<int:professional_id>/delete',methods=['DELETE'])
    @admin_required
    def admin_professional_delete(professional_id):
        professional = Professional.query.get(professional_id)
        if not professional:
            return jsonify({"error":"Professional not found"}),400
        for service in professional.services:
            service.professional.remove(professional)
        for request in professional.service_requests:
            if request.review:
                db.session.delete(request.review)
            db.session.delete(request)
        db.session.delete(professional)
        db.session.commit()

        return jsonify({"message":"Professional deleted successfully"}),200
        
    @app.route('/api/admin/dashboard/professional/<int:professional_id>/unblock',methods=['POST'])
    @admin_required
    def admin_professional_unblock(professional_id):
        professional = Professional.query.get(professional_id)
        if not professional:
            return jsonify({"error",'Professional not found'})
        professional.action = 'None'
        db.session.commit()

        return jsonify({"message":'Professional unblocked successfully','professional_id':professional_id}),200
        
    @app.route('/api/admin/dashboard/professional/<int:professional_id>/block',methods=['POST'])
    @admin_required
    def admin_professional_block(professional_id):
        professional = Professional.query.get(professional_id)
        if not professional:
            return jsonify({"error",'Professional not found'})
        professional.action = 'Rejected'
        db.session.commit()

        return jsonify({"message":'Professional Blocked successfully','professional_id':professional_id}),200


    @app.route('/api/admin/customers/<int:customer_id>/block',methods=['POST'])
    @admin_required
    def admin_customer_block(customer_id):
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({"error",'Customer not found'})
        customer.action = 'Blocked'
        db.session.commit()


        return jsonify({"message":'Customer blocked successfully'}),200


    @app.route('/api/admin/customers/<int:customer_id>/unblock',methods=['POST'])
    @admin_required
    def admin_customer_unblock(customer_id):
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({"error",'Customer not found'})
        customer.action = 'None'
        db.session.commit()
    
        return jsonify({"message":'Customer Unblocked successfully'}),200


    @app.route('/api/export')
    @admin_required
    def export_csv():
        result = csv_report.delay()
        return jsonify({
            "id": result.id,
            "result" : result.result })
   
    @app.route('/api/download/<id>')
    @admin_required
    def download_file(id):
        res = AsyncResult(id)
        filepath = os.path.join('frontend','static',res.result)
        response = send_from_directory('frontend/static', res.result)
        return response
    

    @app.route('/api/adminlogout', methods=['POST'])
    def admin_logout():
        session.pop('admin_id', None)
        cache.delete_memoized(admin_service)
        cache.delete_memoized(admin_professional)
        cache.delete_memoized(admin_customer)
        return jsonify({"message": 'Admin Logout successful'})
    
#Customers API

    @app.route('/api/customer/signup',methods=['POST'])
    def customer_signup():
        data = request.get_json()

        required_fields = ['email','password','name','address','location','contact','pincode']
        if not all(field in data for field in required_fields):
            return jsonify({"error":"Missing required fields"}),400
        
        if User.query.filter_by(email=data.get('email')).first():
            return jsonify({"error":"Email already exists"}),409

        hashed_password = generate_password_hash(data['password'])
        new_user = User(email=data['email'],password=hashed_password,name=data['name'],address=data['address'],location=data['location'],contact_number=data['contact'],pincode=data['pincode'])
        db.session.add(new_user)
        db.session.commit()

        new_customer = Customer(user_id = new_user.user_id,name=data['name'],address=data['address'],location=data['location'],contact_number=data['contact'],pincode=data['pincode'])
        db.session.add(new_customer)
        db.session.commit()
        return jsonify({"message":"User successfully Signed Up"}),201

    @app.route('/api/customer/login',methods=['POST'])
    def login():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return jsonify({"error":"Email and password are required"}),400
        
        user = User.query.filter_by(email=email).first()
        
        if not user or not check_password_hash(user.password,password):
            return jsonify({"error":"Invalid email or password"}),401
        

        if user.is_admin:
            return jsonify({"error":"You are not authorized to view this page"}),402
        
        if user.customer_details.action == "Blocked":
            return jsonify({"error": "You are blocked by the admin please contact admin."}),403
        
        session['user_id'] = user.user_id
        return jsonify({"message":"Login successfull"}),200
    
    
    @app.route('/api/customer/dashboard',methods = ['GET'])
    @customer_required
    def customer_dashboard():
        user = User.query.get(session['user_id'])
        customer = user.customer_details
        service_requests = ServiceRequest.query.filter_by(customer_id=customer.customer_id).all()
        service_request_list = [
        {
            "id":s.id,
            "status":s.service_status,
            "service":{
                "service_name": s.services.service_name
            },
            "professional":{
                "name": s.professional.name,
                "phonenumber": s.professional.phonenumber,
                "professional_id": s.professional.professional_id,
                "service_description": s.professional.service_description
            }
        }
        for s in service_requests

     ]
        return jsonify({
            "user": {
                "id":user.user_id,
                "email":user.email,
                "name":user.name,
                "contact_number":user.contact_number
            },
            "service_requests":service_request_list
        }),200
    
    
    @app.route('/api/customer/dashboard/<service_name>',methods=['GET'])
    @customer_required
    def service_details(service_name):
        service = Service.query.filter_by(service_name=service_name).first()
        if not service:
            return jsonify({"error":"Service not found"}),404
        
        professionals = [
            {
                "id":p.professional_id,
                "name":p.name,
                "rating": sum([r.review.rating for r in p.service_requests if r.review]) / len([r.review for r in p.service_requests if r.review]) if p.service_requests else None
            }
            for p in service.professionals
        ]
        return jsonify({
            "service":service_name,
            "professionals":professionals
        }),200

    @app.route('/api/customer/dashboard/book/<int:professional_id>/<int:service_id>',methods=['POST'])
    @customer_required
    def service_book(professional_id,service_id):
        user = User.query.get(session['user_id'])
        customer = user.customer_details
        professional = Professional.query.get(professional_id)
        service = Service.query.get(service_id)
        if not professional or not service:
            return jsonify({"error":"Professional or Service not found"}),404
        
        service_request = ServiceRequest(customer_id=customer.customer_id,professional_id=professional_id,service_id=service_id,service_status='Requested')
        db.session.add(service_request)
        db.session.commit()
        return jsonify({"message":"Booking succesfull"}),201

    @app.route('/api/customer/dashboard/cancel/<int:service_request_id>',methods=['POST'])
    @customer_required 
    def service_cancel(service_request_id):
        user = User.query.get(session['user_id'])
        customer = user.customer_details
        service_request = ServiceRequest.query.get(service_request_id)
        if not service_request or service_request.customer_id != customer.customer_id:
            return jsonify({"error":"Service request not found"}),404
        
        service_request.service_status = 'Cancelled'
        db.session.commit()
        return jsonify({"message":"Service request cancelled"}),200
    
    @app.route('/api/customer/dashboard/service_close/<int:professional_id>/<int:service_request_id>',methods=['POST'])
    def service_close(professional_id,service_request_id):
        user = User.query.get(session['user_id'])
        customer = user.customer_details
        data = request.get_json()
        rating = data.get('rating')
        remarks = data.get('remarks')
        current_time = datetime.utcnow()

        if not rating :
            return jsonify({"error":"Rating cannot be empty."}),400

        service_request = ServiceRequest.query.get(service_request_id)
        if not service_request:
            return jsonify({"error":"Service request not found"}),404
        
        new_review = Review(service_request_id = service_request_id, customer_id = customer.customer_id, rating=rating,remarks=remarks)
        service_request.service_status = 'Closed'
        service_request.date_of_completion = current_time
        db.session.add(new_review)
        db.session.commit()
        return jsonify({"message":"Service closed succesfully"}),200

    @app.route('/api/customer/profile', methods = ['PUT']) 
    @customer_required
    def customer_profile_update():
        user = User.query.get(session['user_id'])
        customer = user.customer_details
        
        if not user or not customer:
            return jsonify({"error":"User not found"}),404
        
        data =  request.get_json()
        
        if 'email' in data:
            if User.query.filter_by(email=data['email']).first() and data['email'] != user.email:
                return jsonify({"error":"Email already exists"}),409
            user.email = data['email']
        
        if 'currentpassword' in data:
            if User.query.filter_by(email=user.email).first() and not check_password_hash(user.password,data['currentpassword']):
                return jsonify({"error":"Invalid password"}),401
            user.password = generate_password_hash(data['newpassword'])
            
        
        if 'name' in data:
            user.name = data['name']
            customer.name = data['name']
        
        cache.delete_memoized(customer_dashboard)
        cache.delete_memoized(service_details)
        cache.delete_memoized(customer_search)
        
        db.session.commit() 
        return jsonify({"message":"Profile updated successfully"}),200
    
    
    @app.route('/api/customer/search',methods=['GET'])
    @customer_required
    def customer_search():
        parameter = request.args.get('type')
        search = request.args.get('search','').strip()

        if not parameter or not search:
            return jsonify({"message": 'Search parameter or query is missing'}),400
            
        valid = ['service','professional','service_request']
        if parameter not in valid:
            return jsonify({"error": 'Invalid search parameter'}),400
        
        results = {}

        if parameter == 'service':
            results['services'] = [
            {
                **service.to_dict(),"professionals":[
                    {
                        "id":p.professional_id,
                        "name":p.name,
                    } for p in service.professionals
                  ]
            }
             for service in Service.query.filter(
                    or_(
                        Service.service_id.contains(search),
                        Service.service_name.contains(search),
                        cast(Service.base_price,String).contains(search),
                    )
                ).all()
            ]
        elif parameter == 'professional':
            results['professionals']= [
                professional.to_dict() for professional in Professional.query.join(Professional.services).filter(
                    or_(
                        Professional.professional_id.contains(search),
                        Professional.name.contains(search),
                        cast(Professional.experience, String).contains(search),
                        Service.service_name.contains(search),
                        Professional.action.contains(search)
                    )
                ).all()
            ]
        elif parameter == 'service_request':
            results['service_requests'] = [
                service_request.to_dict() for service_request in ServiceRequest.query.join(Professional).filter(
                    or_(
                        ServiceRequest.id.contains(search),
                        Professional.name.contains(search),
                        ServiceRequest.date_of_request.contains(search),
                        ServiceRequest.service_status.contains(search)
                    )
                ).all()
            ]
        else:
            return jsonify({"error": 'Invalid search parameter'}), 400
    
        return jsonify(results)
        
        return jsonify({"results": [ r.serialize() for r in results]}),200

    @app.route('/api/customer/logout',methods=['POST'])
    @customer_required
    def logout():
        user_id = session.get('user_id')
        if user_id:
             cache.delete_memoized(customer_dashboard)
             cache.delete_memoized(service_details)
             cache.delete_memoized(customer_search)
        session.pop('user_id',None)
        return jsonify({"message":"Logout successful"}),200

#Professionals API
    @app.route('/api/professional/register', methods=['POST'])
    def professional_register(): 
        file = request.files['file']
        email = request.form.get('email')
        password = request.form.get('password') 
        service = request.form.get('service')
        name = request.form.get('name')
        new_service = request.form.get('newService')
        service_description = request.form.get('service_description')
        experience = request.form.get('experience')
        address = request.form.get('address')
        pincode = request.form.get('pincode')
        phonenumber = request.form.get('phonenumber')

        if service == "Others" and new_services:
            service_names = new_service
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])
        
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        service_names = []
        service_names = [service] if service != "Others" else [new_service]

        existing_services = {s.service_name: s for s in Service.query.filter(Service.service_name.in_(service_names)).all()}
        new_services = []
        for service_name in service_names:
            if service_name not in existing_services:
                new_service_obj = Service(service_name=service_name)
                db.session.add(new_service_obj)
                new_services.append(new_service_obj)
            else:
                  new_services.append(existing_services[service_name])
            
            hashed_password = generate_password_hash(password)

            new_professional = Professional(
                email=email,
                password=hashed_password,
                name=name,
                service_description=service_description,
                experience=int(experience),
                address=address,
                pincode=pincode,
                phonenumber=phonenumber,
                file=file_path,
            )
            
            new_professional.services = new_services
            db.session.add(new_professional)
            db.session.commit()
            return jsonify({"message":"Professional successfully Signed up"}),201

    @app.route('/api/professional/login',methods=['POST'])
    def professional_login():
        data = request.get_json()
        email = data.get('email') 
        password = data.get('password')
        if not email or not password:
            return jsonify({"error":"Email and password are required"}),400
        
        professional = Professional.query.filter_by(email=email).first()
        
        if not professional or not check_password_hash(professional.password,password):
            return jsonify({"error":"Invalid email or password"}),401
        
        if professional.action == 'Rejected':
            return jsonify({"error":"You are blocked by the admin please contact admin."}),403
        
        session['professional_id'] = professional.professional_id
        return jsonify({"message":"Login successfull"}),200


    @app.route('/api/professional/dashboard/today',methods=['GET'])
    @professional_required
    def professional_today_services():
        professional_id = session.get('professional_id')
        today = datetime.utcnow().date()
 
        today_services = ServiceRequest.query.filter(
            ServiceRequest.professional_id == professional_id,
            ServiceRequest.date_of_request == today
            ).all()
       
        for service in today_services:
            print(service.date_of_request) 

        result=[]
        for service in today_services:
            result.append({
                "id":service.id,
                "customer":{
                    "name":service.customers.name,
                    "contact_number":service.customers.contact_number,
                    "location":service.customers.location,
                    "pincode":service.customers.pincode
                },
                'service_status': service.service_status
            })
        return jsonify({"today_services":result}),200

    @app.route('/api/professional/dashboard/closed',methods=['GET'])
    @professional_required
    def professional_closed_services():
        professional_id = session.get('professional_id')


        closed_services = ServiceRequest.query.filter(ServiceRequest.professional_id==professional_id,
        ServiceRequest.service_status=='Closed'
        ).all()

        result=[]
        for service in closed_services:
            result.append({
                "id":service.id,
                "customer":{
                    "name":service.customers.name,
                    "contact_number":service.customers.contact_number,
                    "location":service.customers.location,
                    "pincode":service.customers.pincode
                },
                'date_of_completion': service.date_of_completion,
                'service_status': service.service_status,
                'review':{
                    "rating":service.review.rating if service.review else None,
                    "remarks":service.review.remarks if service.review else None
                }
            })
        return jsonify({"closed_services":result}),200
    
    @app.route('/api/professional/dashboard/requested',methods=['GET'])
    @professional_required
    def professional_pending_services():
        professional_id = session.get('professional_id')

        requested_services = ServiceRequest.query.filter(ServiceRequest.professional_id==professional_id,ServiceRequest.service_status=='Requested').all()

        result=[]
        for service in requested_services:
            result.append({
                "id":service.id,
                "customer":{
                    "name":service.customers.name,
                    "contact_number":service.customers.contact_number,
                    "location":service.customers.location,
                    "pincode":service.customers.pincode
                },
                'service_status': service.service_status
            })
        return jsonify({"requested_services":result}),200
    
    @app.route('/api/professional/dashboard/accepted',methods=['GET'])
    @professional_required
    def professional_ongoing_services():
        professional_id = session.get('professional_id')

        ongoing_services = ServiceRequest.query.filter(ServiceRequest.professional_id==professional_id,ServiceRequest.service_status=='Accepted').all()

        result=[]
        for service in ongoing_services:
            result.append({
                "id":service.id,
                "customer":{
                    "name":service.customers.name,
                    "contact_number":service.customers.contact_number,
                    "location":service.customers.location,
                    "pincode":service.customers.pincode
                },
                'service_status': service.service_status
            })
        return jsonify({"accepted_services":result}),200

    @app.route('/api/professional/dashboard/accept/<int:id>',methods=['PUT'])
    @professional_required
    def professional_accept_service(id):
        professional_id = session.get('professional_id')
        service_request = ServiceRequest.query.get(id)
        if not service_request or service_request.professional_id != professional_id:
            return jsonify({"error":"Service request not found"}),404
        
        service_request.service_status = 'Accepted'
        db.session.commit()
        return jsonify({"message":"Service request accepted"}),200

    @app.route('/api/professional/dashboard/reject/<int:id>',methods=['PUT'])
    @professional_required
    def professional_reject_service(id):
        professional_id = session.get('professional_id')
        service_request = ServiceRequest.query.get(id)
        if not service_request or service_request.professional_id != professional_id:
            return jsonify({"error":"Service request not found"}),404
        
        service_request.service_status = 'Rejected'
        db.session.commit()
        return jsonify({"message":"Service request rejected"}),200


    @app.route('/api/professional/search', methods=['GET'])
    @professional_required
    def professional_search():
        parameter = request.args.get('type')
        search = request.args.get('search','').strip()

        if not parameter or not search:
            return jsonify({"message": 'Search parameter or query is missing'}),400
            
        valid = ['service_request','customer']
        if parameter not in valid:
            return jsonify({"error": 'Invalid search parameter'}),400
        
        results = {}

        if parameter == 'service_request':
            results['service_requests'] = [
                service_request.to_dict() for service_request in ServiceRequest.query.join(Professional).filter(
                    or_(
                        ServiceRequest.id.contains(search),
                        Professional.name.contains(search),
                        ServiceRequest.date_of_request.contains(search),
                        ServiceRequest.service_status.contains(search)
                    ),
                    ServiceRequest.professional_id == session['professional_id']
                ).all()
            ]
        elif parameter == 'customer':
            results['customers'] = [
                {
                    **customer.to_dict(),
                    'service_status':[
                         service_request.service_status for service_request in customer.service_requests
                         if service_request.professional_id == session['professional_id']
                ]

                }
                for customer in Customer.query.outerjoin(ServiceRequest).filter(
                    or_(
                        Customer.customer_id.contains(search),
                        Customer.name.contains(search),
                        Customer.contact_number.contains(search),
                        Customer.address.contains(search),
                    ),
                    ServiceRequest.professional_id == session['professional_id'],
                    ServiceRequest.service_status.contains(search)
                ).all()
            ]
        else:
            return jsonify({"error": 'Invalid search parameter'}), 400
    
        return jsonify(results)
    
    @app.route('/api/professional/profile',methods=['PUT'])
    @professional_required
    def professional_profile():
        professional_id = session.get('professional_id')
        data=request.get_json()

        email = data.get('email')
        name = data.get('name')
        currentpassword = data.get('currentpassword')
        newpassword = data.get('password')
        service = data.get('service')
        new_service = data.get('newService')

        professional = Professional.query.filter_by(professional_id=professional_id).first()

        if currentpassword and not check_password_hash(professional.password,currentpassword):
            return jsnoify({'error': 'current password is not correct' }), 400
        
        if email:
            professional.email = email
        
        if name:
            professional.name = name
        
        if newpassword:
            hashed_password = generate_password_hash(newpassword)
            professional.password = hashed_password
        
        service_names = []
        if service == "Others" and new_service:
            service_names = [new_service]
        else:
              service_names = [s.strip() for s in service.split(',')]  
    
        # 🔹 Fetch existing services from the database
        existing_services = {s.service_name: s for s in Service.query.filter(Service.service_name.in_(service_names)).all()}
    
        # 🔹 Create new services if they don't exist
        new_services = []
        for service_name in service_names:
            if service_name not in existing_services:
                new_service_obj = Service(service_name=service_name)
                db.session.add(new_service_obj)
                new_services.append(new_service_obj)
            else:
                 new_services.append(existing_services[service_name])
                
        professional.services = new_services
        
        # 🔹 Commit new services to the database
        db.session.commit()
        return jsonify({'message': 'Professional Updated Succesfully','professional': professional.to_dict()})


    @app.route('/api/professional/logout',methods=['POST'])
    @professional_required
    def professional_logout():
        session.pop('professional_id',None)
        cache.delete_memoized(professional_search)
        return jsonify({"message":"Logout successful"}),200
    

    @app.route('/api/admin_summary')
    @admin_required
    def generate_admin_summary():
        base_url = "http://127.0.0.1:5000"
        service_requests = ServiceRequest.query.all()
        labels = ["Requests","Assigned","Cancelled","Closed"]

        requested_count = 0
        assigned_count = 0
        closed_count = 0
        cancelled_count = 0
        rating = []

        for service_request in service_requests:
            if service_request.service_status == 'Requested':
                requested_count += 1
            
            elif service_request.service_status == 'Accepted':
                assigned_count += 1

            elif service_request.service_status == 'Cancelled':
                cancelled_count += 1
            
            elif service_request.service_status == 'Closed':
                closed_count += 1
            
            if service_request.review:
                if isinstance(service_request.review, list):
                    rating.extend([review.rating for review in service_request.review])
                else:
                     rating.append(service_request.review.rating)
         
        service_request_data = [requested_count,assigned_count,cancelled_count,closed_count]

        path = os.path.join(os.getcwd(),'frontend','admin','summary') + '/'
        if not os.path.exists(path):
            os.makedirs(path, exist_ok = True)
        
        plt.bar(labels, service_request_data, width=0.3, color="green")
        plt.savefig(os.path.join(path + "service_request.jpg"))
        plt.clf()

        if rating:
            rating_counts = Counter(rating)
            rating_labels = [f"Rating {r}" for r in rating_counts.keys()]
            rating_data = list(rating_counts.values())
           
            fig, ax = plt.subplots()
            ax.pie(rating_data, labels=rating_labels, autopct='%1.2f%%', startangle=90, colors=['red','yellow','lightgreen','lightskyblue','purple'])
            plt.savefig(os.path.join(path+ "rating_summary.jpg"))
            plt.clf()
        
        else:
            fig, ax = plt.subplots()
            ax.pie([1], labels=["No Rating Available"], colors=["green"], startangle=90)
            plt.savefig(os.path.join(path+ "rating_summary.jpg"))
            plt.clf()

        response = {
            "service_request_image": base_url + "/static/admin/summary/service_request.jpg",
            "rating_image":  base_url + "/static/admin/summary/rating_summary.jpg"
        }

        return jsonify(response)

    @app.route('/api/customer_summary')
    @customer_required
    def generate_customer_summary():
        user = User.query.get(session['user_id'])
        customer = user.customer_details
        base_url = "http://127.0.0.1:5000"
        service_requests = ServiceRequest.query.filter_by(customer_id = customer.customer_id)
        labels = ["Requests","Assigned","Cancelled","Closed"]

        requested_count = 0
        assigned_count = 0
        closed_count = 0
        cancelled_count = 0
      

        for service_request in service_requests:
            if service_request.service_status == 'Requested':
                requested_count += 1
            
            elif service_request.service_status == 'Accepted':
                assigned_count += 1

            elif service_request.service_status == 'Cancelled':
                cancelled_count += 1
            
            elif service_request.service_status == 'Closed':
                closed_count += 1
            
        service_request_data = [requested_count,assigned_count,cancelled_count,closed_count]

        path = os.path.join(os.getcwd(),'frontend','customer','summary') + '/'
        if not os.path.exists(path):
            os.makedirs(path, exist_ok = True)
        
        plt.bar(labels, service_request_data, width=0.3, color="green")
        plt.savefig(os.path.join(path + "service_request.jpg"))
        plt.clf()


        response = {
            "service_request_image": base_url + "/static/customer/summary/service_request.jpg",
            "rating_image":  base_url + "/static/customer/summary/rating_summary.jpg"
        }

        return jsonify(response)


    @app.route('/api/professional_summary')
    @professional_required
    def generate_professional_summary():
        professional = Professional.query.get(session['professional_id'])
        base_url = "http://127.0.0.1:5000"
        service_requests = ServiceRequest.query.filter_by(professional_id = professional.professional_id)
        labels = ["Requests","Assigned","Cancelled","Closed","Rejected"]

        requested_count = 0
        assigned_count = 0
        closed_count = 0
        cancelled_count = 0
        rejected_count = 0
        rating = []

        for service_request in service_requests:
            if service_request.service_status == 'Requested':
                requested_count += 1
            
            elif service_request.service_status == 'Accepted':
                assigned_count += 1

            elif service_request.service_status == 'Cancelled':
                cancelled_count += 1
            
            elif service_request.service_status == 'Closed':
                closed_count += 1

            elif service_request.service_status == 'Rejected':
                rejected_count += 1
            
            if service_request.review:
                if isinstance(service_request.review, list):
                    rating.extend([review.rating for review in service_request.review])
                else:
                     rating.append(service_request.review.rating)
         
        service_request_data = [requested_count,assigned_count,cancelled_count,closed_count,rejected_count]

        path = os.path.join(os.getcwd(),'frontend','professional','summary') + '/'
        if not os.path.exists(path):
            os.makedirs(path, exist_ok = True)
        
        plt.bar(labels, service_request_data, width=0.3, color="green")
        plt.savefig(os.path.join(path + "service_request.jpg"))
        plt.clf()

        if rating:
            rating_counts = Counter(rating)
            rating_labels = [f"Rating {r}" for r in rating_counts.keys()]
            rating_data = list(rating_counts.values())
           
            fig, ax = plt.subplots()
            ax.pie(rating_data, labels=rating_labels, autopct='%1.2f%%', startangle=90, colors=['red','yellow','lightgreen','lightskyblue','purple'])
            plt.savefig(os.path.join(path+ "rating_summary.jpg"))
            plt.clf()
        
        else:
            fig, ax = plt.subplots()
            ax.pie([1], labels=["No Rating Available"], colors=["green"], startangle=90)
            plt.savefig(os.path.join(path+ "rating_summary.jpg"))
            plt.clf()

        response = {
            "service_request_image": base_url + "/static/professional/summary/service_request.jpg",
            "rating_image":  base_url + "/static/professional/summary/rating_summary.jpg"
        }

        return jsonify(response)