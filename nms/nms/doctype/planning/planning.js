// Copyright (c) 2024, kishan and contributors
// For license information, please see license.txt

frappe.ui.form.on("Planning Item", {
    qty: function (frm, cdt, cdn) {
        update_amount(frm, cdt, cdn);
    },
    rate: function (frm, cdt, cdn) {
        update_amount(frm, cdt, cdn);
    },
	create_task: function (frm, cdt, cdn) {
		let row = locals[cdt][cdn];
	
		let dialog = new frappe.ui.Dialog({
			title: "Enter Details",
			fields: [
				{
					label: "Is Group",
					fieldname: "is_group",
					fieldtype: "Check"
				},
				{
					label: "Subject",
					fieldname: "subject",
					fieldtype: "Data"
				},
				{
					label: "Expected Completed Date",
					fieldname: "expected_completed_date",
					fieldtype: "Date"
				}
			],
			primary_action_label: "Create Task",
			primary_action: function (data) {
				
				if (!data.subject) {
					frappe.msgprint("Subject is required to create a task.");
					return;
				}
	
				let task_data = {
					doctype: "Task",
					subject: data.subject,
					is_group: data.is_group ? 1 : 0,
					custom_sales_order: frm.doc.sales_order,
					custom_customer: frm.doc.customer,
					custom_planning: frm.doc.name,
					custom_lead: frm.doc.lead,
					custom_estimation:frm.doc.estimation,
					custom_quotation: frm.doc.quotation,
					custom_client: frm.doc.client,
					custom_contract_type: frm.doc.contract_type,
					custom_cost_center: frm.doc.cost_center,
					project: frm.doc.project,
					custom_expected_completed_date: data.expected_completed_date,
					custom_task_items: [
						{
							item_code: row.item_code,
							item_name: row.item_name,
							description: row.description,
							uom: row.uom,
							stock_uom: row.stock_uom,
							qty: row.qty,
							rate: row.rate,
							amount: row.amount,
							vessels: row.vessels,
							work_type: row.work_type,
							location: row.location
						}
					]
				};

				frappe.call({
					method: "frappe.client.insert",
					args: { doc: task_data },
					callback: function (r) {
						if (!r.exc) {
							frappe.msgprint(`Task created successfully: ${r.message.name}`);
							dialog.hide();
						} else {
							frappe.msgprint(`Error creating Task`);
						}
					}
				});
			}
		});
	
		// Show the dialog
		dialog.show();
	}
});

function update_amount(frm, cdt, cdn) {
    let row = locals[cdt][cdn];
	
	let amount = row.qty*row.rate;

	frappe.model.set_value(cdt, cdn, "amount", amount);
    frm.refresh_field("planning_item");
}

frappe.ui.form.on("Employee Planning",{
    price: function (frm, cdt, cdn) {
        update_employee_estimation_amount(frm, cdt, cdn);
    },
    day: function (frm, cdt, cdn) {
        update_employee_estimation_amount(frm, cdt, cdn);
    },
    amount: function (frm) {
        calculate_totals(frm);
    }
})

frappe.ui.form.on("Estimation Ct",{
    price: function (frm, cdt, cdn) {
        update_estimation_amount(frm, cdt, cdn);
    },
    day: function (frm, cdt, cdn) {
        update_estimation_amount(frm, cdt, cdn);
    },
    amount: function (frm) {
        calculate_totals(frm);
    }
})

frappe.ui.form.on("Site Consumable Ct",{
    price: function (frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        frappe.model.set_value(cdt, cdn, "amount", row.price);
        
    },
})
function update_estimation_amount(frm,cdt,cdn){
    let row = locals[cdt][cdn];

    let amount = row.price*row.day;

	frappe.model.set_value(cdt, cdn, "amount", amount);
    frm.refresh_field("employees");
    frm.refresh_field("boats_and_vehicles")
    frm.refresh_field("sub_contractors")
    frm.refresh_field("additional_costs")
    frm.refresh_field("site_consumables")
    frm.refresh_field("fuel_consumption")

    calculate_totals(frm); // Update totals after amount is set

}
frappe.ui.form.on("Sub-Contractor CT",{
    price: function (frm, cdt, cdn) {
        update_estimation_amount(frm, cdt, cdn);
    },
    day: function (frm, cdt, cdn) {
        update_estimation_amount(frm, cdt, cdn);
    },
    amount: function (frm) {
        calculate_totals(frm);
    }
})

frappe.ui.form.on("Asset Planning CT",{
    price: function (frm, cdt, cdn) {
        update_estimation_amount(frm, cdt, cdn);
    },
    day: function (frm, cdt, cdn) {
        update_estimation_amount(frm, cdt, cdn);
    },
    amount: function (frm) {
        calculate_totals(frm);
    }
})

frappe.ui.form.on("Fuel Consumption CT",{
    price: function (frm, cdt, cdn) {
        update_estimation_amount(frm, cdt, cdn);
    },
    day: function (frm, cdt, cdn) {
        update_estimation_amount(frm, cdt, cdn);
    },
    amount: function (frm) {
        calculate_totals(frm);
    }
})

function update_employee_estimation_amount(frm, cdt, cdn) {
    let row = locals[cdt][cdn];
	
	let amount = row.price*row.day;

	frappe.model.set_value(cdt, cdn, "amount", amount);
    frm.refresh_field("equipments");
    calculate_totals(frm); 
}

function calculate_totals(frm) {
        let employees_total = 0;
        let equipments_total = 0;
        let boats_and_vehicles_total = 0;
        let sub_contractors_total = 0;
        let additional_costs_total = 0;
        let site_consumable_total = 0;
        let fuel_consumption_total = 0;

        frm.doc.employees.forEach(row => {
            employees_total += row.amount || 0;
        });
        frm.set_value("employees_total", employees_total);

        frm.doc.equipments.forEach(row => {
            equipments_total += row.amount || 0;
        });
        frm.set_value("equipments_total", equipments_total);

        frm.doc.boats_and_vehicles.forEach(row => {
            boats_and_vehicles_total += row.amount || 0;
        });
        frm.set_value("boats_and_vehicles_total", boats_and_vehicles_total);

        frm.doc.sub_contractors.forEach(row => {
            sub_contractors_total += row.amount || 0;
        });
        frm.set_value("sub_contractors_total", sub_contractors_total);

        frm.doc.additional_costs.forEach(row => {
            additional_costs_total += row.amount || 0;
        });
        frm.set_value("additional_costs_total", additional_costs_total);

        frm.doc.site_consumables.forEach(row => {
            site_consumable_total += row.amount || 0;
        });
        frm.set_value("site_consumable_total", site_consumable_total);

        frm.doc.fuel_consumption.forEach(row => {
            fuel_consumption_total += row.amount || 0;
        });
        frm.set_value("fuel_consumption_total", fuel_consumption_total);

        // Calculate the main total
        let main_total =
        employees_total +
        equipments_total +
        boats_and_vehicles_total +
        sub_contractors_total +
        additional_costs_total +
        site_consumable_total +
        fuel_consumption_total;

        // Set the main total field
        frm.set_value("main_total", main_total);

        frm.refresh_fields();
}