# Copyright (c) 2024, kishan and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import date_diff, today
from frappe.model.document import Document


class AirTicket(Document):
	pass

@frappe.whitelist()
def validate_attendance(employee, air_ticket_working_days):
    # Fetch the employee's Date of Joining from the Employee doctype
    employee_doc = frappe.get_doc("Employee", employee)
    date_of_joining = employee_doc.date_of_joining

    if not date_of_joining:
        frappe.throw("Date of Joining is not set for this employee.")

    attendance_count = frappe.db.count(
        "Attendance",
        filters={
            "employee": employee,
            "attendance_date": [">=", date_of_joining],
            "status": "Present" 
        },
    )

    if attendance_count < int(air_ticket_working_days):
        return False 

    return True 
	
