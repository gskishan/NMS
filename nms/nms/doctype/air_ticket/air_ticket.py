from frappe.model.document import Document
import frappe

class AirTicket(Document):
    def on_submit(self):
        # Validate attendance
        if not self.validate_attendance(self.employee, self.number_of_working_days):
            frappe.throw("The employee does not meet the required number of working days for submission.")

        # Validate expense amount
        if not self.validate_expense_amount(self.amount,self.main_total):
            frappe.throw("The expense amount exceeds the allowable limit.")

    def validate_attendance(self, employee, air_ticket_working_days):
        # Fetch the employee's Date of Joining from the Employee doctype
        employee_doc = frappe.get_doc("Employee", employee)
        date_of_joining = employee_doc.date_of_joining

        if not date_of_joining:
            frappe.throw("Date of Joining is not set for this employee.")

        # Count the number of present days from attendance
        attendance_count = frappe.db.count(
            "Attendance",
            filters={
                "employee": employee,
                "attendance_date": [">=", date_of_joining],
                "status": "Present"
            }
        )

        # Compare attendance count with the required working days
        return attendance_count >= int(air_ticket_working_days)

    def validate_expense_amount(self,amount,main_total):
        # Ensure the expense amount does not exceed the main total
        return float(main_total) <= float(amount)
