import frappe

def set_project_name_on_lead(doc,method):
    print("\n\n\n\n doc",doc)
    if doc.custom_lead:
        print("\n\n\n\ innnnnnnnnnnnnnn")
        lead_doc = frappe.get_doc("Lead",doc.custom_lead)
        lead_doc.custom_project = doc.name
        lead_doc.save()