// Copyright (c) 2024, kishan and contributors
// For license information, please see license.txt

frappe.ui.form.on("Daily Report", {
    refresh: function(frm) {
        if (!frm.is_new()) {
                frm.add_custom_button(__("Journal Entry"), function() {
                   
                    frappe.route_options = {
                        "custom_daily_report": frm.doc.name, 
                        "custom_task":frm.doc.task,
                        "custom_client":frm.doc.custom_client,
                        "custom_cost_center":frm.doc.custom_cost_center,
                        "custom_contract_type":frm.doc.custom_contract_type,
                        "custom_project":frm.doc.project
                    };
                    frappe.new_doc("Journal Entry");
                });
    }
}
});

frappe.ui.form.on("Equipment Daily CT",{
    rate: function (frm, cdt, cdn) {
        update_estimation_amount(frm, cdt, cdn);
    },
    qty: function (frm, cdt, cdn) {
        update_estimation_amount(frm, cdt, cdn);
    },
    amount: function (frm) {
        calculate_totals(frm);
    }
})



frappe.ui.form.on("Employee Daily Report OT",{
    rate: function (frm, cdt, cdn) {
        update_estimation_amount(frm, cdt, cdn);
    },
    qty: function (frm, cdt, cdn) {
        update_estimation_amount(frm, cdt, cdn);
    },
    amount: function (frm) {
        calculate_totals(frm);
    }
})

frappe.ui.form.on("Consumables Ct",{
    rate: function (frm, cdt, cdn) {
        update_estimation_amount(frm, cdt, cdn);
    },
    qty: function (frm, cdt, cdn) {
        update_estimation_amount(frm, cdt, cdn);
    },
    amount: function (frm) {
        calculate_totals(frm);
    }
})


function update_estimation_amount(frm,cdt,cdn){
    let row = locals[cdt][cdn];

    let amount = row.rate*row.qty;

	frappe.model.set_value(cdt, cdn, "amount", amount);
    frm.refresh_field("equipment");
    frm.refresh_field("employee")
    frm.refresh_field("consumables")


    calculate_totals(frm); // Update totals after amount is set

}
function calculate_totals(frm) {
    let employees_total = 0;
    let equipments_total = 0;
    let consumables_total = 0;

    frm.doc.equipment.forEach(row => {
        equipments_total += row.amount || 0;
    });
    frm.set_value("subtotal_equipments", equipments_total);

    frm.doc.employee_shift.forEach(row => {
        employees_total += row.amount || 0;
    });
    frm.set_value("subtotal_employee", employees_total);

    frm.doc.consumables.forEach(row => {
        consumables_total += row.amount || 0;
    });
    frm.set_value("subtotal_consumables", consumables_total);

    // Calculate the main total
    let main_total =
    employees_total +
    equipments_total +
    consumables_total;

    // Set the main total field
    frm.set_value("main_total", main_total);

    frm.refresh_fields();
}
