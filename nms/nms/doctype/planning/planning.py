# Copyright (c) 2024, kishan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Planning(Document):
	pass

@frappe.whitelist()
def get_remaining_items_for_planning(sales_order):
	remaining_items = []
	sales_order_doc = frappe.get_doc("Sales Order", sales_order)

	planning_docs = frappe.get_all("Planning", filters={"sales_order": sales_order}, fields=["name"])
	
	planned_quantities = {}
	for planning in planning_docs:
		planning_doc = frappe.get_doc("Planning", planning.name)
		for planned_item in planning_doc.planning_item:
			item_code = planned_item.item_code
			qty = planned_item.qty
			if item_code in planned_quantities:
				planned_quantities[item_code] += qty
			else:
				planned_quantities[item_code] = qty

	# Check each item in the Sales Order against planned quantities
	for so_item in sales_order_doc.items:
		item_code = so_item.item_code
		ordered_qty = so_item.qty
		
		# Calculate the remaining quantity
		planned_qty = planned_quantities.get(item_code, 0)
		remaining_qty = ordered_qty - planned_qty
		
		if remaining_qty > 0:
			# Append item document with updated remaining_qty
			remaining_item = so_item.as_dict() 
			remaining_item['remaining_qty'] = remaining_qty
			remaining_items.append(remaining_item)
	
	if not remaining_items:
		frappe.throw("All items for this Sales Order have already been planned")
	
	return remaining_items
	


