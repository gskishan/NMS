// Copyright (c) 2024, kishan and contributors
// For license information, please see license.txt

frappe.ui.form.on('Air Ticket', {
    validate: function (frm) {
        if (frm.doc.employee) {
            frappe.call({
                method: "nms.nms.doctype.air_ticket.air_ticket.validate_attendance",
                args: {
                    employee: frm.doc.employee,
                    air_ticket_working_days: frm.doc.number_of_working_days
                },
                callback: function (response) {
                    if (!response.message) {
                        frappe.throw(
                            "Attendance requests are less than the required working days. You cannot fill the Air Ticket form."
                        );
                    }
                }
            });
        }
    }
});
