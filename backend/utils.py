from jinja2 import Template

def format_report(html_template, customer_data):
    with open(html_template) as file:
        template = Template(file.read())
        return template.render(customer_data = customer_data)

def format_report2(html_template, professional_data):
    with open(html_template) as file:
        template = Template(file.read())
        return template.render(professional_data = professional_data)