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