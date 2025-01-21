# Copyright (c) 2024, kishan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Estimation(Document):
	def on_update(self):
		if self.lead:
			lead_doc = frappe.get_doc("Lead",self.lead)
			lead_doc.custom_estimation = self.name
			lead_doc.save()

	def validate(self):
		if self.is_new():
			self.update_grid(self.employees)
			self.update_grid(self.equipments,)
			self.update_grid(self.boats_and_vehicles)
			self.update_grid(self.sub_contractors)
			self.update_grid(self.site_consumables)
			self.update_grid(self.fuel_consumption)
			self.update_grid(self.additional_costs)
	
	def update_grid(self, source):
		for d in source:
			d.p_price=0
			d.p_day=0
			d.p_amount=0