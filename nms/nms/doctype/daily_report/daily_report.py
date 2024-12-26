# Copyright (c) 2024, kishan and contributors
# For license information, please see license.txt
import frappe
from frappe.model.document import Document
from datetime import datetime

class DailyReport(Document):
	def on_submit(self):
		self.mark_auto_attendance()

	def mark_auto_attendance(self):
		for emp in self.employee_shift:
			if emp.employee:
				# Get Employee Document
				emp_doc = frappe.get_doc("Employee", emp.employee)

				# Check for Default Shift
				if emp_doc.default_shift:
					shift_doc = frappe.get_doc("Shift Type", emp_doc.default_shift)
					# Parse shift timings
					shift_start_time = datetime.strptime(shift_doc.start_time, "%H:%M:%S").time()

					shift_end_time = datetime.strptime(shift_doc.end_time, "%H:%M:%S").time()

					# Parse Daily Report timings
					report_from_time = datetime.strptime(emp.from_time, "%H:%M:%S").time()
					report_to_time = datetime.strptime(emp.to_time, "%H:%M:%S").time()

					# Initialize OT Hours
					overtime_hours = 0

					# Case: Exact match with shift timings
					if report_from_time == shift_start_time and report_to_time == shift_end_time:
						self.create_or_update_attendance(emp.employee, self.date, overtime_hours, False, False)
						continue  # Skip further checks for this employee

					# Case: Started earlier or finished later
					if report_from_time < shift_start_time:
						print("\n\n\n report_from_time",report_from_time)
						print("\n\n\n shift start time",shift_start_time)
						overtime_hours += (
							datetime.combine(datetime.today(), shift_start_time) - 
							datetime.combine(datetime.today(), report_from_time)
						).seconds / 3600

					if report_to_time > shift_end_time:
						print("\n\n\n report_to_time",report_to_time)
						print("\n\n\n shift_end_time",shift_end_time)
						overtime_hours += (
							datetime.combine(datetime.today(), report_to_time) - 
							datetime.combine(datetime.today(), shift_end_time)
						).seconds / 3600

					# Case: Both earlier start and later finish
					if report_from_time < shift_start_time and report_to_time > shift_end_time:
						print("\n\n\n report_to_time",report_to_time)
						print("\n\n\n shift_end_time",shift_end_time)
						print("\n\n\n report_from_time",report_from_time)
						print("\n\n\n shift_start_time",shift_start_time)
						overtime_hours += (
							datetime.combine(datetime.today(), shift_start_time) - 
							datetime.combine(datetime.today(), report_from_time)
						).seconds / 3600
						overtime_hours += (
							datetime.combine(datetime.today(), report_to_time) - 
							datetime.combine(datetime.today(), shift_end_time)
						).seconds / 3600
					print("\n\n\n overtime",overtime_hours)
					# Create or update attendance
					self.create_or_update_attendance(
						emp.employee, 
						self.date, 
						round(overtime_hours, 2), 
						report_from_time > shift_start_time, 
						report_to_time < shift_end_time
					)

	def create_or_update_attendance(self, employee, attendance_date, overtime_hours, late_entry, leave_early):
		"""Create or update the attendance record for an employee."""
		# Check for existing attendance
		attendance_name = frappe.db.exists(
			"Attendance", {"employee": employee, "attendance_date": attendance_date}
		)
		if attendance_name:
			attendance = frappe.get_doc("Attendance", attendance_name)
		else:
			attendance = frappe.new_doc("Attendance")
			attendance.employee = employee
			attendance.attendance_date = attendance_date

		# Update Attendance Fields
		attendance.status = "Present"
		attendance.late_entry = late_entry
		attendance.leave_early = leave_early
		attendance.custom_overtime = overtime_hours > 0
		attendance.custom_overtime_hours = overtime_hours

		# Save Attendance
		attendance.save()
		frappe.msgprint(f"Attendance updated for {employee}")
