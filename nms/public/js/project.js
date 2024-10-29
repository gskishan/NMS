frappe.ui.form.on("Project",{
    refresh: function(frm) {
		
		if (!frm.is_new()){
			frm.add_custom_button(__("Estimation"), function() {
					frappe.route_options = {
						"project": frm.doc.name,
					};
					frappe.set_route("estimation", "new-estimation");

				});
		}
	},

    
})