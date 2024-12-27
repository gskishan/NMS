# Copyright (c) 2024, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import flt
import calendar 

def execute(filters=None):

	# Define columns
	columns = [
		{"label": "Employee", "fieldname": "employee", "fieldtype": "Link", "options": "Employee", "width": 150},
		{"label": "Employee Name", "fieldname": "employee_name", "fieldtype": "Data", "width": 200},
		{"label": "Date", "fieldname": "attendance_date", "fieldtype": "Date", "width": 120},
		{"label": "Shift Type", "fieldname": "shift_type", "fieldtype": "Link", "options": "Shift Type", "width": 150},
		{"label": "OT Hours", "fieldname": "custom_overtime_hours", "fieldtype": "Float", "width": 100},
		{"label": "Per Day Rate", "fieldname": "per_day_rate", "fieldtype": "Currency", "width": 120},
		{"label": "Month", "fieldname": "month", "fieldtype": "Data", "width": 100},
		{"label": "OT Price", "fieldname": "ot_price", "fieldtype": "Currency", "width": 120},
		
	]

	# Fetch data
	data = fetch_ot_pricing_data(filters)

	data_with_totals = []
	grouped_data = {}

	for row in data:
		# Convert month number to month name
		if row.get("month"):
			row["month"] = calendar.month_name[int(row["month"])]  # Abbreviated month name
		# Group rows by month
		grouped_data.setdefault(row["month"], []).append(row)

	for month, rows in grouped_data.items():
		data_with_totals.extend(rows)  # Add all rows for the month
		# Calculate monthly total OT Price
		monthly_total = sum(flt(row.get("ot_price")) for row in rows)
		# Append total row for the month
		data_with_totals.append(
			{
				"employee": "",
				"employee_name": "",
				"attendance_date": "",
				"shift_type": "",
				"custom_overtime_hours": "",
				"per_day_rate": "",
				"ot_price": monthly_total,
				"month": f"Total ({month})",
			}
		)

	return columns, data_with_totals

def fetch_ot_pricing_data(filters):
	conditions = []
	if filters.get("employee"):
		conditions.append("a.employee = %(employee)s")
	if filters.get("month"):
		conditions.append("MONTH(a.attendance_date) = %(month)s")
	if filters.get("year"):
		conditions.append("YEAR(a.attendance_date) = %(year)s")

	conditions = " AND ".join(conditions)
	if conditions:
		conditions = "WHERE " + conditions


	query = f"""
		SELECT 
			a.employee,
			a.employee_name,
			a.attendance_date,
			a.shift AS shift_type,
			a.custom_overtime_hours,
			e.custom_employee_per_day_rate AS per_day_rate,
			MONTH(a.attendance_date) AS month,
			(e.custom_employee_per_day_rate * 1.5 * a.custom_overtime_hours) AS ot_price
			
		FROM 
			`tabAttendance` a
		JOIN 
			`tabEmployee` e ON a.employee = e.name
		{conditions}
		ORDER BY 
			MONTH(a.attendance_date) ASC, a.attendance_date ASC
	"""

	return frappe.db.sql(query, filters, as_dict=True)
