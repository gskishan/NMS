// Copyright (c) 2024, kishan and contributors
// For license information, please see license.txt

frappe.ui.form.on('Air Ticket', {
    expense_amount: function(frm){
        calculate_totals(frm)
    }
});

frappe.ui.form.on("Air Ticket CT",{
    amount: function (frm) {
        calculate_totals(frm);
    }
})

function calculate_totals(frm) {
    let air_ticket_total = 0;
    
    frm.doc.member_name.forEach(row => {
        air_ticket_total += row.amount || 0;
    });
    frm.set_value("sub_total", air_ticket_total);

    let main_total =
    air_ticket_total +
    frm.doc.expense_amount;

    frm.set_value("main_total", main_total);

    frm.refresh_fields();
}
