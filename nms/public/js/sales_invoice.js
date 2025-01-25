// Copyright (c) 2025, kishan and contributors
// For license information, please see license.txt

frappe.ui.form.on('Sales Invoice', {
	refresh: function(frm) {
		if (frm.doc.docstatus==1){
			frm.add_custom_button(__('Daily Report'), function () {
				frappe.new_doc('Daily Report',{},doc =>{
					doc.sales_invoice = frm.doc.name
					doc.custom_client= frm.doc.custom_client
					doc.custom_contract_type = frm.doc.custom_contract_type
					doc.custom_cost_center= frm.doc.cost_center
					doc.project = frm.doc.project
				


				});
			});
		}

	}
});
