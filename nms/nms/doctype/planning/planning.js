// Copyright (c) 2024, kishan and contributors
// For license information, please see license.txt

frappe.ui.form.on("Planning Item", {
    qty: function (frm, cdt, cdn) {
        update_amount(frm, cdt, cdn);
    },
    rate: function (frm, cdt, cdn) {
        update_amount(frm, cdt, cdn);
    },
	create_task: function (frm,cdt,cdn) {
		let row = locals[cdt][cdn];

		if(frm.doc.name){
			frappe.call({
				method: "frappe.client.insert",
				args: {
				  doc:{
					doctype: "Task",
					subject:"Please Put the Subject",
					custom_sales_order: frm.doc.sales_order,
					custom_customer: frm.doc.customer,
					custom_planning:frm.doc.name,
					custom_client : frm.doc.client,
					custom_contract_type: frm.doc.contract_type,
					custom_cost_center: frm.doc.cost_center,
					project: frm.doc.project,
					custom_task_items: [
						{
							item_code: row.item_code,
							item_name: row.item_name,
							description: row.description,
							uom:row.uom,
							stock_uom: row.stock_uom,
							qty: row.qty,
							rate: row.rate,
							amount: row.amount,
							vessels: row.vessels,
							work_type: row.work_type,
							location: row.location

							
						}
					]
				  }
				  
				},
				callback: function(r) {
					if (!r.exc) {
                        frappe.msgprint(`Task created successfully: ${r.message.name}`);
                    } else {
                        frappe.msgprint(`Error creating Task`);
                    }
				}
			  });
			
		
		}
        
	
    },
});

function update_amount(frm, cdt, cdn) {
    let row = locals[cdt][cdn];
	
	let amount = row.qty*row.rate;

	frappe.model.set_value(cdt, cdn, "amount", amount);
    frm.refresh_field("planning_item");
}