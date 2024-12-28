# Copyright (c) 2024, kishan and contributors
# For license information, please see license.txt
import frappe
from frappe.model.document import Document
from frappe.utils import time_diff_in_hours
from datetime import datetime

class DailyReport(Document):
	def on_submit(self):
		self.validate_attendance()
		self.mark_auto_attendance()

	def validate_attendance(self):
		"""Check if attendance already exists for any employee."""
		for emp in self.employee_shift:
			if emp.employee:
				attendance_exists = frappe.db.exists(
					"Attendance", {"employee": emp.employee, "attendance_date": self.date}
				)
				if attendance_exists:
					frappe.throw(
						f"Attendance for employee {emp.employee} on {self.date} already exists. Please check and try again.",
						title="Attendance Already Marked"
					)

	def mark_auto_attendance(self):
		for emp in self.employee_shift:
			if emp.employee:
				emp_doc = frappe.get_doc("Employee", emp.employee)

				if emp_doc.default_shift:
					shift_doc = frappe.get_doc("Shift Type", emp_doc.default_shift)
					
					shift_start_time = shift_doc.start_time

					shift_end_time = shift_doc.end_time

					report_from_time = emp.from_time
					report_to_time = emp.to_time

					overtime_hours = 0

					shift_time_diff = time_diff_in_hours(shift_end_time,shift_start_time)
					emp_time_diff = time_diff_in_hours(report_to_time,report_from_time)

					overtime_hours = emp_time_diff - shift_time_diff if emp_time_diff > shift_time_diff else 0

					self.create_or_update_attendance(
						emp_doc, 
						self.date, 
						round(overtime_hours, 2)
					)

	def create_or_update_attendance(self, employee, attendance_date, overtime_hours):
		"""Create or update the attendance record for an employee."""
		# Check for existing attendance
		attendance_name = frappe.db.exists(
			"Attendance", {"employee": employee.name, "attendance_date": attendance_date}
		)
		print("\n\n\n\n attendance_date",attendance_date)
		if not attendance_name:
			attendance = frappe.new_doc("Attendance")
			attendance.employee = employee.name
			attendance.attendance_date = attendance_date
		print("\n\n\n\n att_date",attendance_date)
		# Update Attendance Fields
		attendance.status = "Present"
		attendance.custom_overtime = overtime_hours > 0
		attendance.shift = employee.default_shift
		attendance.custom_overtime_hours = overtime_hours

		# Save Attendance
		attendance.save()
		attendance.submit()
		frappe.msgprint(f"Attendance updated for {employee}")
