# Copyright (c) 2024, kishan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import escape_html
from frappe import _
from frappe.desk.doctype.notification_log.notification_log import (
	enqueue_create_notification,
	get_title,
	get_title_html,
)


class Planning(Document):

	def validate(self):
		for row in self.employees:
			if row.reservation_start_date and row.reservation_end_date:
				self.check_reservation_overlap(
					row.sub_components, 
					row.reservation_start_date, 
					row.reservation_end_date, 
					"tabEmployee Planning", 
					"sub_components"
				)

		for row in self.equipments:
			if row.asset_required:
				self.check_asset_availability(row.asset_required)
			if row.reservation_start_date and row.reservation_end_date:
				self.check_reservation_overlap(
					row.asset_required, 
					row.reservation_start_date, 
					row.reservation_end_date, 
					"tabAsset Planning CT",  
					"asset_required"
				)

	def check_reservation_overlap(self, entity, start_date, end_date, child_table, entity_field):
		"""
		Generic method to check for overlapping reservations for a given entity (employee or asset).
		"""

		overlaps = frappe.db.sql(f"""
			SELECT
				parent, {entity_field}, reservation_start_date, reservation_end_date
			FROM
				`{child_table}`
			WHERE
				{entity_field} = %s
				AND parent != %s  
				AND (
					(reservation_start_date BETWEEN %s AND %s)
					OR (reservation_end_date BETWEEN %s AND %s)
					OR (%s BETWEEN reservation_start_date AND reservation_end_date)
				)
		""", (
			entity,
			self.name,
			start_date, end_date,
			start_date, end_date,
			start_date
		))

		if overlaps:
			frappe.throw(
				frappe._(
					"{0} {1} already has a reservation between {2} and {3} in document {4}."
				).format(
					entity_field.capitalize(),
					entity,                     
					overlaps[0][2],            
					overlaps[0][3],             
					overlaps[0][0]              
				)
			)
	def check_asset_availability(self, asset):
		"""
		Check if the given asset is in 'planned' or 'overdue' state in the Asset Maintenance Log.
		"""
		asset_status = frappe.db.get_value('Asset Maintenance Log', {
			'asset_name': asset,
			'docstatus': 0
		}, 'maintenance_status')

		if asset_status in ['Planned', 'Overdue']:
			frappe.throw(f"Asset {asset} is in {asset_status} state and cannot be reserved.")

	def on_submit(self):
		self.update_estimation()

	def on_cancel(self):
		self.update_estimation(is_cancel=1)

	def update_estimation(self, is_cancel=None):
		est = frappe.get_doc("Estimation", self.estimation)
		

		self.update_grid(self.employees, est.employees, is_cancel)
		self.update_grid(self.equipments, est.equipments, is_cancel)
		self.update_grid(self.boats_and_vehicles, est.boats_and_vehicles, is_cancel)
		self.update_grid(self.sub_contractors, est.sub_contractors, is_cancel)
		self.update_grid(self.site_consumables, est.site_consumables, is_cancel)
		self.update_grid(self.fuel_consumption, est.fuel_consumption, is_cancel)
		self.update_grid(self.additional_costs, est.additional_costs, is_cancel)

	def update_grid(self, source, target, is_cancel=None):
		for d in source:
			for k in target:
				if d.sub_components == k.sub_components:
					if is_cancel:
						k.db_set("p_price", k.p_price - d.price)
						k.db_set("p_day", k.p_day - d.day)
						k.db_set("p_amount", k.p_amount - d.amount)
					else:
						k.db_set("p_price", k.p_price + d.price)
						k.db_set("p_day", k.p_day + d.day)
						k.db_set("p_amount", k.p_amount + d.amount)



def get(args=None):
	"""get assigned to"""
	if not args:
		args = frappe.local.form_dict

	return frappe.get_all(
		"ToDo",
		fields=["allocated_to as owner", "name"],
		filters={
			"reference_type": args.get("doctype"),
			"reference_name": args.get("name"),
			"status": ("not in", ("Cancelled", "Closed")),
		},
		limit=5,
	)

@frappe.whitelist()
def get_remaining_items_for_planning(sales_order):
    remaining_items = []
    sales_order_doc = frappe.get_doc("Sales Order", sales_order)

    # Get all planning documents for the Sales Order
    planning_docs = frappe.get_all("Planning", filters={"sales_order": sales_order}, fields=["name"])

    # Calculate completed quantities from planning documents
    completed_quantities = {}
    for planning in planning_docs:
        planning_doc = frappe.get_doc("Planning", planning.name)
        for planned_item in planning_doc.planning_item:
            item_code = planned_item.item_code
            qty = planned_item.qty
            
            if item_code in completed_quantities:
                completed_quantities[item_code] += qty
            else:
                completed_quantities[item_code] = qty

    # Check each item in the Sales Order against completed quantities
    for so_item in sales_order_doc.items:
        item_code = so_item.item_code
        original_qty = so_item.qty
        completed_qty = completed_quantities.get(item_code, 0)
        balance_qty = original_qty - completed_qty  # Remaining quantity to be planned

        if balance_qty > 0:
            # Append item document with updated quantities
            remaining_item = so_item.as_dict()
            remaining_item['original_so_qty'] = original_qty  # Original Sales Order quantity
            remaining_item['completed_qty'] = completed_qty  # Total planned quantity
            remaining_item['balance_qty'] = balance_qty      # Remaining (balance) quantity
            remaining_item['opened_qty'] = balance_qty       # Same as balance_qty
            remaining_items.append(remaining_item)

    if not remaining_items:
        frappe.throw("All items for this Sales Order have already been planned")
    
    return remaining_items


	

@frappe.whitelist()
def add_assignee(args=None, *,ignore_permissions=False):
	"""add in someone's to do list
	args = {
	        "assign_to": [],
	        "doctype": ,
	        "name": ,
	        "description": ,
	        "assignment_rule":
	}

	"""

	if not args:
		args = frappe.local.form_dict
		print(args)
	args = frappe.parse_json(args)
	
	users_with_duplicate_todo = []
	shared_with_users = []

	description = escape_html(
		args.get("description", _("Assignment for {0} {1}").format(args["doctype"], args["name"]))
	)

	for assign_to in frappe.parse_json(args.get("assign_to")):
		filters = {
			"reference_type": args["doctype"],
			"reference_name": args["name"],
			"status": "Open",
			"allocated_to": assign_to,
		}
		if not ignore_permissions:
			frappe.get_doc(args["doctype"], args["name"]).check_permission()

		if frappe.get_all("ToDo", filters=filters):
			users_with_duplicate_todo.append(assign_to)
		else:
			from frappe.utils import nowdate
			print("\n\n\n\n\n args",args)
			d = frappe.get_doc(
				{
					"doctype": "ToDo",
					"allocated_to": assign_to,
					"reference_type": args["doctype"],
					"reference_name": args["name"],
					"description": description,
					"priority": args.get("priority", "Medium"),
					"status": "Open",
					"date": args.get("date", nowdate()),
					"assigned_by": args.get("assigned_by", frappe.session.user),
					"assignment_rule": args.get("assignment_rule"),
				}
			).insert(ignore_permissions=True)

			d.custom_items = []
			
			d.append("custom_items", {
					"item_code": args.get("item_code"),
					"item_name": args.get("item_name"),
					"qty": args.get("qty"),
					"rate": args.get("rate"),
					"amount": args.get("amount"),
			})
		
			d.save()

			# set assigned_to if field exists
			if frappe.get_meta(args["doctype"]).get_field("assigned_to"):
				frappe.db.set_value(args["doctype"], args["name"], "assigned_to", assign_to)

			doc = frappe.get_doc(args["doctype"], args["name"])

			# if assignee does not have permissions, share or inform
			if not frappe.has_permission(doc=doc, user=assign_to):
				if frappe.get_system_settings("disable_document_sharing"):
					msg = _("User {0} is not permitted to access this document.").format(
						frappe.bold(assign_to)
					)
					msg += "<br>" + _(
						"As document sharing is disabled, please give them the required permissions before assigning."
					)
					frappe.throw(msg, title=_("Missing Permission"))
				else:
					frappe.share.add(doc.doctype, doc.name, assign_to)
					shared_with_users.append(assign_to)

			# make this document followed by assigned user
			if frappe.get_cached_value("User", assign_to, "follow_assigned_documents"):
				follow_document(args["doctype"], args["name"], assign_to)

			# notify
			notify_assignment(
				d.assigned_by,
				d.allocated_to,
				d.reference_type,
				d.reference_name,
				action="ASSIGN",
				description=description,
			)

	if shared_with_users:
		user_list = format_message_for_assign_to(shared_with_users)
		frappe.msgprint(
			_("Shared with the following Users with Read access:{0}").format(user_list, alert=True)
		)

	if users_with_duplicate_todo:
		user_list = format_message_for_assign_to(users_with_duplicate_todo)
		frappe.msgprint(_("Already in the following Users ToDo list:{0}").format(user_list, alert=True))

	return get(args)


def notify_assignment(assigned_by, allocated_to, doc_type, doc_name, action="CLOSE", description=None):
	"""
	Notify assignee that there is a change in assignment
	"""
	if not (assigned_by and allocated_to and doc_type and doc_name):
		return

	assigned_user = frappe.db.get_value("User", allocated_to, ["language", "enabled"], as_dict=True)

	# return if self assigned or user disabled
	if assigned_by == allocated_to or not assigned_user.enabled:
		return

	# Search for email address in description -- i.e. assignee
	user_name = frappe.get_cached_value("User", frappe.session.user, "full_name")
	title = get_title(doc_type, doc_name)
	description_html = f"<div>{description}</div>" if description else None

	if action == "CLOSE":
		subject = _("Your assignment on {0} {1} has been removed by {2}", lang=assigned_user.language).format(
			frappe.bold(_(doc_type)), get_title_html(title), frappe.bold(user_name)
		)
	else:
		user_name = frappe.bold(user_name)
		document_type = frappe.bold(_(doc_type, lang=assigned_user.language))
		title = get_title_html(title)
		subject = _("{0} assigned a new task {1} {2} to you", lang=assigned_user.language).format(
			user_name, document_type, title
		)

	notification_doc = {
		"type": "Assignment",
		"document_type": doc_type,
		"subject": subject,
		"document_name": doc_name,
		"from_user": frappe.session.user,
		"email_content": description_html,
	}

	enqueue_create_notification(allocated_to, notification_doc)

def format_message_for_assign_to(users):
	return "<br><br>" + "<br>".join(users)


def update_planning_status(doc, method):
	if not doc.custom_items:
		return
	
	for item in doc.custom_items:
	
		if doc.reference_name:
			# Fetch the Planning document
			planning_doc = frappe.get_doc("Planning", doc.reference_name)
			
			# Find the relevant row in Planning's child table
			for row in planning_doc.planning_item:
				if row.item_code == item.get("item_code"):
					row.status = doc.status  # Update the status field
					break

			# Save the Planning document after updating the row
			planning_doc.save(ignore_permissions=True)
