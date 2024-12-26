// Copyright (c) 2024, kishan and contributors
// For license information, please see license.txt

frappe.ui.form.on("Employee Estimation",{
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
        frm.refresh_field("site_consumables")
        calculate_totals(frm)
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
            console.log("yuyuyuyuyuy")
            site_consumable_total += row.amount || 0;
            console.log(site_consumable_total)
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