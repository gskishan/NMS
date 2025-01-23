// Copyright (c) 2025, kishan and contributors
// For license information, please see license.txt

frappe.ui.form.on('Fuel Log', {
	refresh: function(frm) {
		if (frm.doc.docstatus==1){
			frm.add_custom_button(__('Journal Entry'), function () {
				frappe.new_doc('Journal Entry',{},doc =>{
					doc.custom_fuel_log_no = frm.doc.name
					doc.custom_lead = frm.doc.lead
					doc.custom_estimation = frm.doc.estimation
					doc.custom_quotation = frm.doc.quotation
					doc.custom_project = frm.doc.project
					doc.custom_sales_order = frm.doc.sales_order
					doc.custom_sales_invoice = frm.doc.sales_invoice
					doc.custom_planning = frm.doc.planning
					doc.custom_task = frm.doc.task


				});
			});
		}

	}
});
