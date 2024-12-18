frappe.ui.form.on("Project",{
    refresh: function(frm) {
		
		if (!frm.is_new()){
			frm.add_custom_button(__("Estimation"), function() {
					frappe.route_options = {
						"lead":frm.doc.custom_lead,
						"project": frm.doc.name,
						"client": frm.doc.custom_client,
						"contract_type": frm.doc.custom_contract_type,
						"cost_center": frm.doc.cost_center
					};
					frappe.set_route("estimation", "new-estimation");

				});
		}
	},

    
})