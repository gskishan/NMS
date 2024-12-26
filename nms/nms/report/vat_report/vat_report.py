# Copyright (c) 2024, kishan and contributors
# For license information, please see license.txt

import frappe


def execute(filters=None):
	columns = get_columns()
	data = get_data(filters)
	return columns, data

def get_columns():
	return[
		{
			"label":"VAT Type",
			"fieldname":"vat_type",
			"fieldtype":"Link",
			"options": "VAT Type"

		},
		{
			"label":"VAT Sub Type",
			"fieldname":"vat_subtype",
			"fieldtype":"Link",
			"options":"VAT SubType"
			
		},
		{
			"label":"Amount",
			"fieldname":"amount",
			"fieldtype":"Data",
			
		},
		{
			"label":"VAT Amount (OMR)",
			"fieldname":"vat_amount",
			"fieldtype":"Data",	
		}
	]

def get_data(filters):
	result = frappe.db.sql("""
		Select
			custom_vat_type as vat_type,
			custom_vat_subtype as vat_subtype,
			amount,
			base_net_amount as vat_amount
		FROM
			`tabSales Invoice Item`
		Where
			docstatus = 0


	""", as_dict= True)

	formatted_data = []
	current_vat_type = None

	for row in result:

		formatted_data.append({
			"vat_type": row["vat_type"],
			"sub_type":"",
			"amount":"",
			"vat_amount":""
		})
		current_vat_type = row["vat_type"]

		formatted_data.append({
		"vat_type": "",
		"vat_subtype": row['vat_subtype'],
		"amount": row['amount'],
		"vat_amount": row['vat_amount']
	})

	return formatted_data