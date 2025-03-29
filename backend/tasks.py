from celery import shared_task
import datetime 
import csv
from backend.models import ServiceRequest, Professional, Customer
from backend.utils import format_report,format_report2
from backend.mail import send_email

@shared_task(ignore_results = False, name = "download_csv_report" )
def csv_report():
    requests = ServiceRequest.query.all()
    csv_file_name = f"service_req_{datetime.datetime.now().strftime("%f")}.csv"
    with open(f'frontend/static/{csv_file_name}','w', newline= "")as csvfile:
         req_csv = csv.writer(csvfile, delimiter =',')
         req_csv.writerow(['ID','Customer ID','Professional ID','Date of Request','Date of Completion','Status','Rating','Remarks'])
         for req in requests:
             review = req.review
             if review is None:
                rating = None
                remarks = None
             else:
                 rating = review.rating
                 remarks = review.remarks
             this_req = [req.id, req.customer_id,req.professional_id, req.date_of_request, req.date_of_completion, req.service_status,rating, remarks]
             req_csv.writerow(this_req)

    return csv_file_name


@shared_task(ignore_results = False, name = "monthly_report_customer" )
def monthly_report_customer():
    Customers = Customer.query.all()
    for customer in Customers:
        customer_data = {}
        customer_data['name'] = customer.name
        customer_data['email'] = customer.user.email
        customer_req = []
        for s in customer.service_requests:
            this_req = {}
            this_req['id'] = s.id
            this_req['service_name'] = s.services.service_name
            this_req['professional_name'] = s.professional.name if s.professional else 'N/A'
            this_req['date_of_request'] = s.date_of_request
            this_req['status'] = s.service_status
            this_req['date_of_completion'] = s.date_of_completion
            this_req['customer'] = s.customers.customer_id
            customer_req.append(this_req)
        customer_data['customer_req'] = customer_req
        message = format_report('frontend/static/mail_details.html', customer_data)
        send_email(
            customer.user.email, 
            subject = "Monthly Service Requests Report - A to Z Household Services ", 
            message = message
            )
    return "Monthly reports sent"


@shared_task(ignore_results = False, name = "monthly_report_professional" )
def monthly_report_professional():
    Professionals = Professional.query.all()

    for professional in Professionals:
        professional_data = {}
        professional_data['name'] = professional.name
        professional_data['email'] = professional.email
        professional_req = []
        for s in professional.service_requests:
            this_req = {}
            this_req['id'] = s.id
            this_req['service_name'] = s.services.service_name
            this_req['customer_name'] = s.customers.name
            this_req['date_of_request'] = s.date_of_request
            this_req['status'] = s.service_status
            this_req['date_of_completion'] = s.date_of_completion
            if s.review:
                this_req['rating'] = s.review.rating
                this_req['remarks'] = s.review.remarks
            else: 
                  this_req['rating'] = None
                  this_req['remarks'] = None
            this_req['professional'] = s.professional.professional_id
            professional_req.append(this_req)
        professional_data['professional_req'] = professional_req
        message = format_report2('frontend/static/mail_details2.html', professional_data)
        send_email(
            professional.email, 
            subject = "Monthly Service Requests Report - A to Z Household Services ", 
            message = message
            )
    return "Monthly reports sent"

@shared_task(ignore_results = False, name = "daily_pending_reminder" )
def daily_pending_reminder():
        pending_requests = ServiceRequest.query.filter_by(service_status='Requested').all()
        for r in pending_requests:
            professional = Professional.query.get(r.professional_id)
            if professional and professional.email:
                subject = 'Service Reminder'
                message = f"Reminder: you have a pending service request with ID {r.id}, please take action on it."
                print(f"Sending email to: {professional.email}")  # Debugging log
                send_email(
                     to_address = professional.email, 
                     subject = subject,
                     message = message,
                     content='plain'
                )
        return "pending reminder task done"

@shared_task(ignore_results = False, name = "daily_closing_reminder" )
def daily_closing_reminder():
        pending_requests = ServiceRequest.query.filter_by(service_status='Closed').all()
        for r in pending_requests:
            professional = Professional.query.get(r.professional_id)
            if professional and professional.email:
                subject = 'Service Reminder'
                message = f"Completed: you have completed your accepted service request with ID {r.id}, with {r.review.rating} star rating. THANKYOU"
                print(f"Sending email to: {professional.email}")  # Debugging log
                send_email(
                     to_address = professional.email, 
                     subject = subject,
                     message = message,
                     content='plain'
                )
        return "closing reminder task done"

@shared_task(ignore_results = False, name = "daily_accepted_reminder" )
def daily_accepted_reminder():
        pending_requests = ServiceRequest.query.filter_by(service_status='Accepted').all()
        for r in pending_requests:
            professional = Professional.query.get(r.professional_id)
            if professional and professional.email:
                subject = 'Service Reminder'
                message = f"Reminder: you have a Accepted a service request with ID {r.id}, please reach to the customer as soon as possible THANKYOU."
                print(f"Sending email to: {professional.email}")  # Debugging log
                send_email(
                     to_address = professional.email, 
                     subject = subject,
                     message = message,
                     content='plain'
                )
        return "accepted reminder task done"





