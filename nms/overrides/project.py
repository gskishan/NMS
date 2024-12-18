import frappe

def set_project_name_on_lead(doc,method):
    if doc.custom_lead:
        lead_doc = frappe.get_doc("Lead",doc.custom_lead)
        lead_doc.custom_project = doc.name
        lead_doc.save()