import frappe
from frappe import _
from frappe.contacts.address_and_contact import (
	delete_contact_and_address,
	load_address_and_contact,
)
from frappe.email.inbox import link_communication_to_document
from frappe.model.mapper import get_mapped_doc
from frappe.utils import comma_and, get_link_to_form, has_gravatar, validate_email_address

from erpnext.accounts.party import set_taxes
from erpnext.controllers.selling_controller import SellingController
from erpnext.crm.utils import CRMNote, copy_comments, link_communications, link_open_events
from erpnext.selling.doctype.customer.customer import parse_full_name

class Lead(CRMNote):

    def set_lead(self):
        pass
       